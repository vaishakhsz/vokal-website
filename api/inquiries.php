<?php
/**
 * VOKAL - Citizen Cruelty Inquiries & Reporting API Endpoint
 * Handles submissions from the 14 Kerala districts contact form into MySQL.
 */

require_once __DIR__ . '/config.php';

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM `citizen_inquiries` ORDER BY `submitted_at` DESC");
        $inquiries = $stmt->fetchAll();
        sendJsonResponse(["success" => true, "count" => count($inquiries), "data" => $inquiries]);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) $input = $_POST;

        if (empty($input['name']) || empty($input['message'])) {
            sendJsonResponse(["success" => false, "error" => "Name and incident details are required"], 400);
        }

        $name = trim($input['name']);
        $email = !empty($input['email']) ? trim($input['email']) : 'anonymous@vokal.org.in';
        $district = !empty($input['district']) ? trim($input['district']) : 'Ernakulam';
        $type = !empty($input['type']) ? trim($input['type']) : 'Cruelty Report';
        $message = trim($input['message']);

        $stmt = $pdo->prepare("
            INSERT INTO `citizen_inquiries` 
            (`name`, `email`, `district`, `type`, `message`, `status`) 
            VALUES (:name, :email, :district, :type, :message, 'new')
        ");

        $stmt->execute([
            ':name'     => $name,
            ':email'    => $email,
            ':district' => $district,
            ':type'     => $type,
            ':message'  => $message
        ]);

        sendJsonResponse([
            "success" => true,
            "message" => "Citizen inquiry registered in MySQL database",
            "id" => $pdo->lastInsertId()
        ], 201);
        break;

    default:
        sendJsonResponse(["success" => false, "error" => "Method not allowed"], 405);
}
