<?php
/**
 * VOKAL Auto-Deploy Webhook
 * Automatically syncs website with GitHub main branch using ZipArchive.
 * Does not require SSH, exec(), cPanel API, or FTP.
 */
ignore_user_abort(true);
set_time_limit(120);

$token = isset($_GET['token']) ? trim($_GET['token']) : '';
if ($token !== 'vkl_9xK3pR7nW2mQ8tY2026') {
    http_response_code(403);
    die(json_encode(["success" => false, "error" => "Unauthorized"]));
}

header('Content-Type: application/json; charset=utf-8');

$repoZipUrl = 'https://github.com/vaishakhsz/vokal-website/archive/refs/heads/main.zip';
$targetDir = dirname(__DIR__); // /home/vokalorg/public_html
$tempZip = sys_get_temp_dir() . '/vokal_deploy_' . time() . '.zip';

// Download repository archive from GitHub
$fp = fopen($tempZip, 'w+');
$ch = curl_init($repoZipUrl);
curl_setopt($ch, CURLOPT_TIMEOUT, 60);
curl_setopt($ch, CURLOPT_FILE, $fp);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_USERAGENT, 'VOKAL-AutoDeploy/1.0');
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$execSuccess = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
fclose($fp);

if (!$execSuccess || $httpCode !== 200 || !file_exists($tempZip) || filesize($tempZip) < 1000) {
    @unlink($tempZip);
    die(json_encode(["success" => false, "error" => "Failed to download repository zip from GitHub (HTTP $httpCode)"]));
}

// Unpack using PHP ZipArchive
$zip = new ZipArchive();
if ($zip->open($tempZip) !== true) {
    @unlink($tempZip);
    die(json_encode(["success" => false, "error" => "Failed to open zip archive"]));
}

$extractedCount = 0;
// GitHub zip root folder is "vokal-website-main/"
$prefix = $zip->getNameIndex(0);

for ($i = 0; $i < $zip->numFiles; $i++) {
    $entryName = $zip->getNameIndex($i);
    // Strip the "vokal-website-main/" root prefix
    $relative = substr($entryName, strlen($prefix));
    if (empty($relative) || substr($relative, -1) === '/') {
        continue;
    }

    // Protect user uploads and configuration - never overwrite!
    if (strpos($relative, 'uploads/') === 0 || $relative === 'api/config.php') {
        continue;
    }

    $destPath = $targetDir . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relative);
    $destDir = dirname($destPath);

    if (!is_dir($destDir)) {
        @mkdir($destDir, 0755, true);
    }

    $fileContent = $zip->getFromIndex($i);
    if ($fileContent !== false) {
        file_put_contents($destPath, $fileContent);
        $extractedCount++;
    }
}

$zip->close();
@unlink($tempZip);

echo json_encode([
    "success" => true,
    "message" => "Successfully auto-deployed latest GitHub code",
    "files_updated" => $extractedCount,
    "timestamp" => date('Y-m-d H:i:s')
]);
