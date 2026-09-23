<?php
/**
 * VOKAL Temporary DB Admin Script
 * DELETE THIS FILE AFTER USE
 */

// Secret token - only I know this
$secret = isset($_GET['token']) ? trim($_GET['token']) : '';
if ($secret !== 'vkl_tmp_9x72z') {
    http_response_code(403);
    die(json_encode(["error" => "Unauthorized"]));
}

require_once __DIR__ . '/config.php';
$pdo = getDbConnection();

header('Content-Type: application/json');

$action = isset($_GET['action']) ? $_GET['action'] : 'list';

switch ($action) {
    case 'list_events':
        $stmt = $pdo->query("SELECT id, event_uid, title, category, is_user_uploaded, created_at FROM events_photos ORDER BY created_at DESC");
        echo json_encode(["success" => true, "data" => $stmt->fetchAll()]);
        break;

    case 'list_videos':
        $stmt = $pdo->query("SELECT id, video_uid, title, category, is_user_uploaded, created_at FROM videos ORDER BY created_at DESC");
        echo json_encode(["success" => true, "data" => $stmt->fetchAll()]);
        break;

    case 'list_letters':
        $stmt = $pdo->query("SELECT id, letter_uid, subject, department, is_user_uploaded, created_at FROM letters_govt ORDER BY created_at DESC");
        echo json_encode(["success" => true, "data" => $stmt->fetchAll()]);
        break;

    case 'delete_event':
        $id = isset($_GET['id']) ? trim($_GET['id']) : null;
        if (!$id) { echo json_encode(["error" => "id required"]); break; }
        $stmt = $pdo->prepare("DELETE FROM events_photos WHERE id = :id OR event_uid = :uid");
        $stmt->execute([':id' => $id, ':uid' => $id]);
        echo json_encode(["success" => true, "deleted" => $stmt->rowCount()]);
        break;

    case 'delete_video':
        $id = isset($_GET['id']) ? trim($_GET['id']) : null;
        if (!$id) { echo json_encode(["error" => "id required"]); break; }
        $stmt = $pdo->prepare("DELETE FROM videos WHERE id = :id OR video_uid = :uid");
        $stmt->execute([':id' => $id, ':uid' => $id]);
        echo json_encode(["success" => true, "deleted" => $stmt->rowCount()]);
        break;

    case 'delete_letter':
        $id = isset($_GET['id']) ? trim($_GET['id']) : null;
        if (!$id) { echo json_encode(["error" => "id required"]); break; }
        $stmt = $pdo->prepare("DELETE FROM letters_govt WHERE id = :id OR letter_uid = :uid OR ref_no = :ref");
        $stmt->execute([':id' => $id, ':uid' => $id, ':ref' => $id]);
        echo json_encode(["success" => true, "deleted" => $stmt->rowCount()]);
        break;

    case 'tables':
        $stmt = $pdo->query("SHOW TABLES");
        echo json_encode(["success" => true, "tables" => $stmt->fetchAll(PDO::FETCH_COLUMN)]);
        break;

    default:
        echo json_encode(["success" => true, "message" => "VOKAL DB Admin ready", "actions" => ["list_events","list_videos","list_letters","delete_event","delete_video","delete_letter","tables"]]);
}
