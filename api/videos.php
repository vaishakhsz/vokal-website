<?php
/**
 * VOKAL - Videos & Media Links API Endpoint
 * Handles querying, adding, and deleting video resources in MySQL.
 */

require_once __DIR__ . '/config.php';

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $category = isset($_GET['category']) ? trim($_GET['category']) : null;
        $query = "SELECT * FROM `videos` WHERE 1=1";
        $params = [];

        if ($category && strtolower($category) !== 'all') {
            $query .= " AND `category` LIKE :category";
            $params[':category'] = "%{$category}%";
        }
        $query .= " ORDER BY `created_at` DESC";

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $videos = $stmt->fetchAll();

        sendJsonResponse(["success" => true, "count" => count($videos), "data" => $videos]);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) $input = $_POST;

        if (empty($input['title']) || empty($input['videoUrl'])) {
            sendJsonResponse(["success" => false, "error" => "Video title and video URL are required"], 400);
        }

        $videoUid = 'vid-srv-' . time() . '-' . rand(100, 999);
        $title = trim($input['title']);
        $videoUrl = trim($input['videoUrl']);
        $category = !empty($input['category']) ? trim($input['category']) : 'Legal Insights';
        $duration = !empty($input['duration']) ? trim($input['duration']) : '10:00';
        $description = !empty($input['description']) ? trim($input['description']) : '';
        $thumbnailUrl = !empty($input['thumbnail']) ? trim($input['thumbnail']) : 'assets/vokal_logo_emblem.png';

        // Auto-generate embed URL for YouTube if applicable
        $embedUrl = $videoUrl;
        if (preg_match('/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/', $videoUrl, $matches)) {
            $embedUrl = 'https://www.youtube.com/embed/' . $matches[1];
        }

        $stmt = $pdo->prepare("
            INSERT INTO `videos` 
            (`video_uid`, `title`, `video_url`, `embed_url`, `category`, `duration`, `description`, `thumbnail_url`, `is_user_uploaded`, `show_on_tv`) 
            VALUES (:uid, :title, :vUrl, :eUrl, :cat, :dur, :descr, :thumb, 1, 1)
        ");

        $stmt->execute([
            ':uid'   => $videoUid,
            ':title' => $title,
            ':vUrl'  => $videoUrl,
            ':eUrl'  => $embedUrl,
            ':cat'   => $category,
            ':dur'   => $duration,
            ':descr' => $description,
            ':thumb' => $thumbnailUrl
        ]);

        sendJsonResponse([
            "success" => true,
            "message" => "Video link saved to MySQL",
            "id" => $pdo->lastInsertId(),
            "video_uid" => $videoUid
        ], 201);
        break;

    case 'DELETE':
        $id = isset($_GET['id']) ? trim($_GET['id']) : null;
        if (!$id) sendJsonResponse(["success" => false, "error" => "Video ID required"], 400);

        $stmt = $pdo->prepare("DELETE FROM `videos` WHERE `id` = :id OR `video_uid` = :uid");
        $stmt->execute([':id' => $id, ':uid' => $id]);

        sendJsonResponse(["success" => true, "message" => "Video deleted from MySQL"]);
        break;

    default:
        sendJsonResponse(["success" => false, "error" => "Method not allowed"], 405);
}
