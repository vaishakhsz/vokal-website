<?php
/**
 * VOKAL - Events & Photos API Endpoint
 * Handles querying, adding, and deleting event photos in the MySQL database.
 */

require_once __DIR__ . '/config.php';

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Optional category filter
        $category = isset($_GET['category']) ? trim($_GET['category']) : null;
        $tvOnly = isset($_GET['tv']) && $_GET['tv'] === '1';

        $query = "SELECT * FROM `events_photos` WHERE 1=1";
        $params = [];

        if ($category && strtolower($category) !== 'all') {
            $query .= " AND `category` LIKE :category";
            $params[':category'] = "%{$category}%";
        }
        if ($tvOnly) {
            $query .= " AND `show_on_tv` = 1";
        }

        $query .= " ORDER BY `created_at` DESC";
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $events = $stmt->fetchAll();

        sendJsonResponse(["success" => true, "count" => count($events), "data" => $events]);
        break;

    case 'POST':
        requireApiAuth();
        // Read JSON input or Form POST
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            $input = $_POST;
        }

        if (empty($input['title'])) {
            sendJsonResponse(["success" => false, "error" => "Title is required"], 400);
        }

        $rawImage = !empty($input['image']) ? trim($input['image']) : 'assets/vokal_brand_header.png';
        // Auto-decode base64 and save as physical file to /uploads/photos/
        $imageUrl = processAndSaveBase64Image($rawImage, 'photos');

        $eventUid = !empty($input['event_uid']) ? trim($input['event_uid']) : ('evt-srv-' . time() . '-' . rand(100, 999));
        $title = trim($input['title']);
        $category = !empty($input['category']) ? trim($input['category']) : 'Community Care';
        $eventDate = !empty($input['date']) ? trim($input['date']) : date('F d, Y');
        $location = !empty($input['location']) ? trim($input['location']) : 'Kerala';
        $description = !empty($input['description']) ? trim($input['description']) : '';
        $isUserUploaded = 1;
        $showOnTv = isset($input['show_on_tv']) ? (int)$input['show_on_tv'] : 1;

        $stmt = $pdo->prepare("
            INSERT INTO `events_photos` 
            (`event_uid`, `title`, `category`, `event_date`, `location`, `description`, `image_url`, `is_user_uploaded`, `show_on_tv`) 
            VALUES (:uid, :title, :category, :eventDate, :location, :description, :imageUrl, :userUploaded, :showOnTv)
            ON DUPLICATE KEY UPDATE 
            `title` = VALUES(`title`),
            `category` = VALUES(`category`),
            `event_date` = VALUES(`event_date`),
            `location` = VALUES(`location`),
            `description` = VALUES(`description`),
            `image_url` = VALUES(`image_url`),
            `show_on_tv` = VALUES(`show_on_tv`)
        ");

        $stmt->execute([
            ':uid'          => $eventUid,
            ':title'        => $title,
            ':category'     => $category,
            ':eventDate'    => $eventDate,
            ':location'     => $location,
            ':description'  => $description,
            ':imageUrl'     => $imageUrl,
            ':userUploaded' => $isUserUploaded,
            ':showOnTv'     => $showOnTv
        ]);

        sendJsonResponse([
            "success" => true,
            "message" => "Event photo added to MySQL successfully",
            "id" => $pdo->lastInsertId(),
            "event_uid" => $eventUid,
            "image_url" => $imageUrl
        ], 201);
        break;

    case 'DELETE':
        requireApiAuth();
        $id = isset($_REQUEST['id']) ? trim($_REQUEST['id']) : null;
        if (!$id) {
            sendJsonResponse(["success" => false, "error" => "Event ID or UID required"], 400);
        }

        // Find and delete the uploaded image from server disk to save space
        try {
            $selStmt = $pdo->prepare("SELECT `image_url` FROM `events_photos` WHERE `id` = :id OR `event_uid` = :uid");
            $selStmt->execute([':id' => $id, ':uid' => $id]);
            $row = $selStmt->fetch();
            if ($row && !empty($row['image_url']) && strpos($row['image_url'], 'uploads/') === 0) {
                $diskFile = dirname(__DIR__) . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $row['image_url']);
                if (file_exists($diskFile)) {
                    @unlink($diskFile);
                }
            }
        } catch (Exception $e) {}

        $stmt = $pdo->prepare("DELETE FROM `events_photos` WHERE `id` = :id OR `event_uid` = :uid");
        $stmt->execute([':id' => $id, ':uid' => $id]);

        sendJsonResponse(["success" => true, "message" => "Event photo deleted from MySQL and disk"]);
        break;

    default:
        sendJsonResponse(["success" => false, "error" => "Method not allowed"], 405);
}
