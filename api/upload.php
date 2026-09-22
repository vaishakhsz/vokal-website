<?php
/**
 * VOKAL - High-Resolution Media & Document Upload Endpoint
 * Handles large photo uploads, documents, and videos directly to the server disk
 * with automated high-efficiency image compression & downscaling.
 */

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(["success" => false, "error" => "Method not allowed. Use POST."], 405);
}

$uploadErrorMessages = [
    UPLOAD_ERR_INI_SIZE   => "The uploaded file exceeds the upload_max_filesize limit on the server.",
    UPLOAD_ERR_FORM_SIZE  => "The uploaded file exceeds the MAX_FILE_SIZE limit specified in the form.",
    UPLOAD_ERR_PARTIAL    => "The uploaded file was only partially uploaded.",
    UPLOAD_ERR_NO_FILE    => "No file was uploaded.",
    UPLOAD_ERR_NO_TMP_DIR => "Server missing temporary folder.",
    UPLOAD_ERR_CANT_WRITE => "Failed to write file to server disk.",
    UPLOAD_ERR_EXTENSION  => "A server extension stopped the file upload."
];

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    $err = isset($_FILES['file']['error']) ? $_FILES['file']['error'] : UPLOAD_ERR_NO_FILE;
    $msg = isset($uploadErrorMessages[$err]) ? $uploadErrorMessages[$err] : "File upload error code: {$err}";
    sendJsonResponse(["success" => false, "error" => $msg, "error_code" => $err], 400);
}

$file = $_FILES['file'];
$uploadType = isset($_POST['type']) ? strtolower(trim($_POST['type'])) : 'photo';

// Configure directory and allowed extensions based on type
$allowedTypes = [
    'photo' => [
        'dir' => 'photos',
        'ext' => ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'jfif', 'svg', 'heic', 'heif', 'tiff'],
        'max_size' => 50 * 1024 * 1024 // 50 MB for photos
    ],
    'document' => [
        'dir' => 'documents',
        'ext' => ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'],
        'max_size' => 100 * 1024 * 1024 // 100 MB for legal petitions
    ],
    'video' => [
        'dir' => 'videos',
        'ext' => ['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v'],
        'max_size' => 500 * 1024 * 1024 // 500 MB
    ]
];

if (!array_key_exists($uploadType, $allowedTypes)) {
    $uploadType = 'photo';
}

$targetConfig = $allowedTypes[$uploadType];
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

if (!in_array($ext, $targetConfig['ext'])) {
    sendJsonResponse([
        "success" => false,
        "error" => "Invalid file extension '{$ext}'. Allowed for {$uploadType}: " . implode(', ', $targetConfig['ext'])
    ], 400);
}

if ($file['size'] > $targetConfig['max_size']) {
    sendJsonResponse([
        "success" => false,
        "error" => "File size exceeds limit of " . round($targetConfig['max_size'] / (1024 * 1024)) . " MB"
    ], 400);
}

// Ensure target directory exists on disk
$targetDirectory = UPLOAD_BASE_DIR . DIRECTORY_SEPARATOR . $targetConfig['dir'];
if (!is_dir($targetDirectory)) {
    mkdir($targetDirectory, 0755, true);
}

// Generate unique, clean filename
$safeOriginalName = preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', pathinfo($file['name'], PATHINFO_FILENAME));
$uniqueFilename = 'vokal_' . $uploadType . '_' . date('Ymd_His') . '_' . substr(md5(uniqid()), 0, 8) . '.' . $ext;
$targetPath = $targetDirectory . DIRECTORY_SEPARATOR . $uniqueFilename;

/**
 * Automatically compress and scale images using PHP GD
 */
function compressAndSaveImage($tmpPath, $targetPath, $ext, $maxDimension = 1600, $quality = 82) {
    if (!extension_loaded('gd')) {
        return move_uploaded_file($tmpPath, $targetPath);
    }

    $imageInfo = @getimagesize($tmpPath);
    if (!$imageInfo) {
        return move_uploaded_file($tmpPath, $targetPath);
    }

    $origW = $imageInfo[0];
    $origH = $imageInfo[1];
    $mime  = $imageInfo['mime'];

    switch ($mime) {
        case 'image/jpeg':
            $src = @imagecreatefromjpeg($tmpPath);
            break;
        case 'image/png':
            $src = @imagecreatefrompng($tmpPath);
            break;
        case 'image/webp':
            $src = function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($tmpPath) : null;
            break;
        case 'image/gif':
            $src = @imagecreatefromgif($tmpPath);
            break;
        default:
            $src = null;
    }

    if (!$src) {
        return move_uploaded_file($tmpPath, $targetPath);
    }

    // Fix EXIF orientation for smartphone photos
    if ($mime === 'image/jpeg' && function_exists('exif_read_data')) {
        $exif = @exif_read_data($tmpPath);
        if (!empty($exif['Orientation'])) {
            switch ($exif['Orientation']) {
                case 3:
                    $src = imagerotate($src, 180, 0);
                    break;
                case 6:
                    $src = imagerotate($src, -90, 0);
                    $tmpW = $origW; $origW = $origH; $origH = $tmpW;
                    break;
                case 8:
                    $src = imagerotate($src, 90, 0);
                    $tmpW = $origW; $origW = $origH; $origH = $tmpW;
                    break;
            }
        }
    }

    // Calculate proportional downscaling if image exceeds maxDimension
    $scale = 1.0;
    if ($origW > $maxDimension || $origH > $maxDimension) {
        $scale = min($maxDimension / $origW, $maxDimension / $origH);
    }
    $newW = (int)round($origW * $scale);
    $newH = (int)round($origH * $scale);

    $dest = imagecreatetruecolor($newW, $newH);

    // Preserve transparency for PNG and WebP
    if ($mime === 'image/png' || $mime === 'image/webp') {
        imagealphablending($dest, false);
        imagesavealpha($dest, true);
        $transparent = imagecolorallocatealpha($dest, 255, 255, 255, 127);
        imagefilledrectangle($dest, 0, 0, $newW, $newH, $transparent);
    }

    imagecopyresampled($dest, $src, 0, 0, 0, 0, $newW, $newH, $origW, $origH);

    $saved = false;
    switch ($mime) {
        case 'image/jpeg':
            $saved = imagejpeg($dest, $targetPath, $quality);
            break;
        case 'image/webp':
            $saved = function_exists('imagewebp') ? imagewebp($dest, $targetPath, $quality) : false;
            break;
        case 'image/png':
            // PNG compression level 0-9
            $saved = imagepng($dest, $targetPath, 8);
            break;
        case 'image/gif':
            $saved = imagegif($dest, $targetPath);
            break;
    }

    imagedestroy($src);
    imagedestroy($dest);

    if (!$saved) {
        return move_uploaded_file($tmpPath, $targetPath);
    }

    return true;
}

// Save file: compress if photo, otherwise move directly
if ($uploadType === 'photo' && in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif'])) {
    if (!compressAndSaveImage($file['tmp_name'], $targetPath, $ext, 1600, 82)) {
        sendJsonResponse(["success" => false, "error" => "Failed to process and save image."], 500);
    }
} else {
    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        sendJsonResponse(["success" => false, "error" => "Failed to save file to server disk."], 500);
    }
}

// Refresh file stats after compression
clearstatcache(true, $targetPath);
$finalSize = file_exists($targetPath) ? filesize($targetPath) : $file['size'];

// Generate relative and full URLs
$relativeUrl = 'uploads/' . $targetConfig['dir'] . '/' . $uniqueFilename;
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
$fullUrl = $protocol . $_SERVER['HTTP_HOST'] . '/' . $relativeUrl;

sendJsonResponse([
    "success" => true,
    "message" => "File successfully uploaded and optimized",
    "file" => [
        "original_name" => $file['name'],
        "filename" => $uniqueFilename,
        "type" => $uploadType,
        "original_size" => round($file['size'] / 1024, 1) . " KB",
        "size_bytes" => $finalSize,
        "size_formatted" => round($finalSize / 1024, 1) . " KB",
        "relative_url" => $relativeUrl,
        "full_url" => $fullUrl
    ]
], 201);
