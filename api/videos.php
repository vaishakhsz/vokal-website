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
        requireApiAuth();
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

        // Auto-generate embed URL for various platforms
        $embedUrl = $videoUrl;
        if (preg_match('/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/ ]{11})/i', $videoUrl, $matches)) {
            $embedUrl = 'https://www.youtube-nocookie.com/embed/' . $matches[1] . '?autoplay=1&rel=0';
        } elseif (preg_match('/(?:facebook\.com\/(?:[^\/]+\/videos\/|video\.php\?v=|watch\/?\?v=)|fb\.watch\/)/i', $videoUrl)) {
            $embedUrl = 'https://www.facebook.com/plugins/video.php?href=' . urlencode($videoUrl) . '&show_text=false&autoplay=true';
        } elseif (preg_match('/instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/i', $videoUrl, $matches)) {
            $embedUrl = 'https://www.instagram.com/reel/' . $matches[1] . '/embed';
        } elseif (preg_match('/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/\d+\/video\/|video\/|)(\d+)/i', $videoUrl, $matches)) {
            $embedUrl = 'https://player.vimeo.com/video/' . $matches[1] . '?autoplay=1';
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
        requireApiAuth();
        $id = isset($_REQUEST['id']) ? trim($_REQUEST['id']) : null;
        if (!$id) sendJsonResponse(["success" => false, "error" => "Video ID required"], 400);

        if (is_numeric($id)) {
            $stmt = $pdo->prepare("DELETE FROM `videos` WHERE `id` = :id");
            $stmt->execute([':id' => (int)$id]);
        } else {
            $stmt = $pdo->prepare("DELETE FROM `videos` WHERE `video_uid` = :uid");
            $stmt->execute([':uid' => $id]);
        }

        sendJsonResponse([
            "success" => true,
            "message" => "Video deleted from MySQL",
            "deleted" => $stmt->rowCount()
        ]);
        break;

    default:
        sendJsonResponse(["success" => false, "error" => "Method not allowed"], 405);
}
