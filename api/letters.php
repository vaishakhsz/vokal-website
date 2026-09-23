<?php
/**
 * VOKAL - Letters to Government API Endpoint
 * Handles querying, adding, and managing legal petitions in MySQL.
 */

require_once __DIR__ . '/config.php';

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM `letters_govt` ORDER BY `created_at` DESC");
        $letters = $stmt->fetchAll();

        // Decode key_demands JSON for client convenience
        foreach ($letters as &$letter) {
            if (!empty($letter['key_demands']) && is_string($letter['key_demands'])) {
                $letter['keyDemands'] = json_decode($letter['key_demands'], true);
            } else {
                $letter['keyDemands'] = [];
            }
        }

        sendJsonResponse(["success" => true, "count" => count($letters), "data" => $letters]);
        break;

    case 'POST':
        requireApiAuth();
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) $input = $_POST;

        if (empty($input['subject']) || empty($input['recipient'])) {
            sendJsonResponse(["success" => false, "error" => "Subject and recipient are required"], 400);
        }

        $letterUid = 'let-srv-' . time() . '-' . rand(100, 999);
        $refNo = !empty($input['refNo']) ? trim($input['refNo']) : 'VOKAL/REP/' . date('Y') . '/' . rand(100, 999);
        $subject = trim($input['subject']);
        $recipient = trim($input['recipient']);
        $department = !empty($input['department']) ? trim($input['department']) : 'Government of Kerala';
        $submissionDate = !empty($input['date']) ? trim($input['date']) : date('F d, Y');
        $status = !empty($input['status']) ? trim($input['status']) : 'Submitted / Under Scrutiny';
        $statusColor = 'warning';
        $summary = !empty($input['summary']) ? trim($input['summary']) : '';
        $keyDemands = isset($input['keyDemands']) ? json_encode($input['keyDemands'], JSON_UNESCAPED_UNICODE) : json_encode([]);
        $documentUrl = !empty($input['docUrl']) ? trim($input['docUrl']) : '#';

        $stmt = $pdo->prepare("
            INSERT INTO `letters_govt` 
            (`letter_uid`, `ref_no`, `subject`, `recipient`, `department`, `submission_date`, `status`, `status_color`, `summary`, `key_demands`, `document_url`, `is_user_uploaded`) 
            VALUES (:uid, :ref, :sub, :rec, :dept, :sDate, :stat, :statCol, :summ, :demands, :docUrl, 1)
        ");

        $stmt->execute([
            ':uid'     => $letterUid,
            ':ref'     => $refNo,
            ':sub'     => $subject,
            ':rec'     => $recipient,
            ':dept'    => $department,
            ':sDate'   => $submissionDate,
            ':stat'    => $status,
            ':statCol' => $statusColor,
            ':summ'    => $summary,
            ':demands' => $keyDemands,
            ':docUrl'  => $documentUrl
        ]);

        sendJsonResponse([
            "success" => true,
            "message" => "Government letter saved to MySQL",
            "id" => $pdo->lastInsertId(),
            "ref_no" => $refNo
        ], 201);
        break;

    case 'DELETE':
        requireApiAuth();
        $id = isset($_GET['id']) ? trim($_GET['id']) : null;
        if (!$id) sendJsonResponse(["success" => false, "error" => "Letter ID or UID required"], 400);

        $stmt = $pdo->prepare("DELETE FROM `letters_govt` WHERE `id` = :id OR `letter_uid` = :uid OR `ref_no` = :ref");
        $stmt->execute([':id' => $id, ':uid' => $id, ':ref' => $id]);

        sendJsonResponse(["success" => true, "message" => "Letter representation deleted from MySQL"]);
        break;

    default:
        sendJsonResponse(["success" => false, "error" => "Method not allowed"], 405);
}
