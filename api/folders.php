<?php
require_once 'config.php';

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM folders ORDER BY created_at DESC");
        $folders = $stmt->fetchAll();
        sendJsonResponse(['success' => true, 'data' => $folders]);
    } catch (Exception $e) {
        sendJsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

requireApiAuth();

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $name = trim($input['name'] ?? '');
    $type = trim($input['type'] ?? '');
    $id = $input['id'] ?? null;

    if (empty($name) || empty($type)) {
        sendJsonResponse(['success' => false, 'error' => 'Name and type are required'], 400);
    }

    try {
        if ($id) {
            $stmt = $pdo->prepare("SELECT name, type FROM folders WHERE id = ?");
            $stmt->execute([$id]);
            $oldFolder = $stmt->fetch();
            
            $stmt = $pdo->prepare("UPDATE folders SET name = ? WHERE id = ?");
            $stmt->execute([$name, $id]);
            
            if ($oldFolder && $oldFolder['name'] !== $name) {
                if ($oldFolder['type'] === 'event') {
                    $pdo->prepare("UPDATE events_photos SET category = ? WHERE category = ?")->execute([$name, $oldFolder['name']]);
                } elseif ($oldFolder['type'] === 'video') {
                    $pdo->prepare("UPDATE videos SET category = ? WHERE category = ?")->execute([$name, $oldFolder['name']]);
                } elseif ($oldFolder['type'] === 'letter') {
                    $pdo->prepare("UPDATE letters_govt SET department = ? WHERE department = ?")->execute([$name, $oldFolder['name']]);
                }
            }
        } else {
            $stmt = $pdo->prepare("INSERT INTO folders (name, type) VALUES (?, ?)");
            $stmt->execute([$name, $type]);
            $id = $pdo->lastInsertId();
        }
        sendJsonResponse(['success' => true, 'id' => $id, 'name' => $name, 'type' => $type]);
    } catch (Exception $e) {
        sendJsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

if ($method === 'DELETE') {
    $id = $_REQUEST['id'] ?? null;
    if (!$id) {
        sendJsonResponse(['success' => false, 'error' => 'ID is required'], 400);
    }

    try {
        $stmt = $pdo->prepare("SELECT name, type FROM folders WHERE id = ?");
        $stmt->execute([$id]);
        $folder = $stmt->fetch();

        if ($folder) {
            $pdo->prepare("DELETE FROM folders WHERE id = ?")->execute([$id]);
            
            // Delete associated items
            if ($folder['type'] === 'event') {
                $pdo->prepare("DELETE FROM events_photos WHERE category = ?")->execute([$folder['name']]);
            } elseif ($folder['type'] === 'video') {
                $pdo->prepare("DELETE FROM videos WHERE category = ?")->execute([$folder['name']]);
            } elseif ($folder['type'] === 'letter') {
                $pdo->prepare("DELETE FROM letters_govt WHERE department = ?")->execute([$folder['name']]);
            }
        }
        sendJsonResponse(['success' => true]);
    } catch (Exception $e) {
        sendJsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

sendJsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
