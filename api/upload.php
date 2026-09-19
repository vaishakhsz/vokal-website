<?php
/**
 * VOKAL - High-Resolution Media & Document Upload Endpoint
 * Handles large photo uploads, documents, and videos directly to the server disk.
 */

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(["success" => false, "error" => "Method not allowed. Use POST."], 405);
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    $errorCode = isset($_FILES['file']['error']) ? $_FILES['file']['error'] : 'No file sent';
    sendJsonResponse(["success" => false, "error" => "File upload error: " . $errorCode], 400);
}

$file = $_FILES['file'];
$uploadType = isset($_POST['type']) ? strtolower(trim($_POST['type'])) : 'photo';

// Configure directory and allowed extensions based on type
$allowedTypes = [
    'photo' => [
        'dir' => 'photos',
        'ext' => ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'],
        'max_size' => 25 * 1024 * 1024 // 25 MB for photos
    ],
    'document' => [
        'dir' => 'documents',
        'ext' => ['pdf', 'doc', 'docx', 'txt', 'rtf'],
        'max_size' => 50 * 1024 * 1024 // 50 MB for legal petitions
    ],
    'video' => [
        'dir' => 'videos',
        'ext' => ['mp4', 'webm', 'mov', 'avi', 'mkv'],
        'max_size' => 200 * 1024 * 1024 // 200 MB for direct video uploads
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

if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    sendJsonResponse(["success" => false, "error" => "Failed to save file to server disk."], 500);
}

// Generate relative and full URLs
$relativeUrl = 'uploads/' . $targetConfig['dir'] . '/' . $uniqueFilename;
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
$fullUrl = $protocol . $_SERVER['HTTP_HOST'] . '/' . $relativeUrl;

sendJsonResponse([
    "success" => true,
    "message" => "File successfully uploaded and saved to server",
    "file" => [
        "original_name" => $file['name'],
        "filename" => $uniqueFilename,
        "type" => $uploadType,
        "size_bytes" => $file['size'],
        "size_formatted" => round($file['size'] / (1024 * 1024), 2) . " MB",
        "relative_url" => $relativeUrl,
        "full_url" => $fullUrl
    ]
], 201);
