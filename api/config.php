<?php
/**
 * VOKAL - Voice of Kerala for Animal Legit (vokal.org.in)
 * Database Connection & Configuration File
 * Reg. No: 147/2026
 */

// Enable CORS for frontend requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database Credentials (Update these with your server's MySQL credentials)
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_USER', getenv('DB_USER') ?: 'vokalorg_vokal_db');
define('DB_PASS', getenv('DB_PASS') ?: 'Vokal@2026');
define('DB_NAME', getenv('DB_NAME') ?: 'vokalorg_vokal');
define('DB_PORT', getenv('DB_PORT') ?: '3306');

// Base URL configuration for file uploads
define('UPLOAD_BASE_DIR', dirname(__DIR__) . DIRECTORY_SEPARATOR . 'uploads');
define('UPLOAD_BASE_URL', '/uploads');

// API Secret Key — required for all POST and DELETE operations
define('VOKAL_API_SECRET', 'vkl_9xK3pR7nW2mQ8tY2026');

/**
 * Validates the API secret key for write operations.
 * Checks X-API-Key header or api_key body param.
 */
function requireApiAuth() {
    $key = '';
    if (!empty($_SERVER['HTTP_X_API_KEY'])) {
        $key = trim($_SERVER['HTTP_X_API_KEY']);
    } elseif (!empty($_POST['api_key'])) {
        $key = trim($_POST['api_key']);
    } else {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!empty($input['api_key'])) {
            $key = trim($input['api_key']);
        }
    }
    if ($key !== VOKAL_API_SECRET) {
        sendJsonResponse(['success' => false, 'error' => 'Unauthorized: Invalid or missing API key'], 401);
    }
}

/**
 * Returns a singleton PDO database connection.
 */
function getDbConnection() {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
            // Self-healing: ensure image_url and large columns are LONGTEXT so uploads never fail
            ensureDatabaseSchemaUpdates($pdo);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "error" => "Database connection failed: " . $e->getMessage()
            ]);
            exit();
        }
    }
    return $pdo;
}

/**
 * Ensures table columns are sufficiently large for long URLs and full content.
 */
function ensureDatabaseSchemaUpdates($pdo) {
    static $migrated = false;
    if (!$migrated) {
        $migrated = true;
        try {
            $pdo->exec("ALTER TABLE `events_photos` MODIFY `image_url` LONGTEXT NOT NULL");
            $pdo->exec("ALTER TABLE `events_photos` MODIFY `thumbnail_url` LONGTEXT NULL");
            $pdo->exec("ALTER TABLE `letters_govt` MODIFY `document_url` LONGTEXT NULL");
            $pdo->exec("ALTER TABLE `videos` MODIFY `thumbnail_url` LONGTEXT NULL");
        } catch (Exception $e) {
            // Silently continue if already modified or no ALTER permissions
        }
    }
}

/**
 * If $imageString is a base64 data URI, decodes and saves it as a real file in /uploads/{$subDir}/.
 * Returns the relative path e.g. 'uploads/photos/vokal_photo_xxx.jpg' or original string if not base64.
 */
function processAndSaveBase64Image($imageString, $subDir = 'photos') {
    if (empty($imageString) || !is_string($imageString)) {
        return $imageString;
    }
    if (preg_match('/^data:image\/([a-zA-Z0-9_\-\+]+);base64,(.+)$/s', $imageString, $matches)) {
        $ext = strtolower($matches[1]);
        if ($ext === 'jpeg') $ext = 'jpg';
        if ($ext === 'svg+xml') $ext = 'svg';
        $binaryData = base64_decode($matches[2]);
        if ($binaryData !== false) {
            $targetDir = UPLOAD_BASE_DIR . DIRECTORY_SEPARATOR . $subDir;
            if (!is_dir($targetDir)) {
                mkdir($targetDir, 0755, true);
            }
            $filename = 'vokal_' . $subDir . '_' . date('Ymd_His') . '_' . substr(md5(uniqid('', true)), 0, 8) . '.' . $ext;
            $fullPath = $targetDir . DIRECTORY_SEPARATOR . $filename;
            if (file_put_contents($fullPath, $binaryData) !== false) {
                return 'uploads/' . $subDir . '/' . $filename;
            }
        }
    }
    return $imageString;
}

/**
 * Helper to return a JSON response.
 */
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit();
}
