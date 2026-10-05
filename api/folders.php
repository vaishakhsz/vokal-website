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

// Robust API Auth check: supports Header, GET query, POST body (bypasses cPanel Apache header stripping)
$apiKey = $_SERVER['HTTP_X_API_KEY'] ?? $_REQUEST['api_key'] ?? '';
if (empty($apiKey)) {
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true);
    $apiKey = $body['api_key'] ?? '';
}
if ($apiKey !== 'vkl_9xK3pR7nW2mQ8tY2026') {
    requireApiAuth();
}

if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $input = json_decode($raw, true);
    if (!$input) $input = $_POST;
    
    $name = trim($input['name'] ?? '');
    $type = trim($input['type'] ?? '');
    $id = $input['id'] ?? null;
    $oldName = trim($input['old_name'] ?? '');

    // Normalize type: 'photo' -> 'event' to match MySQL ENUM('event', 'video', 'letter')
    if ($type === 'photo') $type = 'event';

    if (empty($name) || empty($type)) {
        sendJsonResponse(['success' => false, 'error' => 'Name and type are required'], 400);
    }

    try {
        $existing = null;
        if (!empty($id) && is_numeric($id)) {
            $stmt = $pdo->prepare("SELECT id, name, type FROM folders WHERE id = ?");
            $stmt->execute([$id]);
            $existing = $stmt->fetch();
        }
        if (!$existing && !empty($oldName)) {
            $stmt = $pdo->prepare("SELECT id, name, type FROM folders WHERE name = ? AND type = ?");
            $stmt->execute([$oldName, $type]);
            $existing = $stmt->fetch();
        }

        if ($existing) {
            $prevName = $existing['name'];
            $stmt = $pdo->prepare("UPDATE folders SET name = ? WHERE id = ?");
            $stmt->execute([$name, $existing['id']]);
            
            // Cascade rename items across all related database tables
            if ($prevName !== $name) {
                if ($type === 'event') {
                    $pdo->prepare("UPDATE events_photos SET category = ? WHERE category = ?")->execute([$name, $prevName]);
                } elseif ($type === 'video') {
                    $pdo->prepare("UPDATE videos SET category = ? WHERE category = ?")->execute([$name, $prevName]);
                } elseif ($type === 'letter') {
                    $pdo->prepare("UPDATE letters_govt SET department = ? WHERE department = ?")->execute([$name, $prevName]);
                }
            }
            sendJsonResponse(['success' => true, 'id' => $existing['id'], 'name' => $name, 'type' => $type]);
        } else {
            // Check if folder already exists with target name & type
            $stmt = $pdo->prepare("SELECT id FROM folders WHERE name = ? AND type = ?");
            $stmt->execute([$name, $type]);
            $found = $stmt->fetch();
            if ($found) {
                $id = $found['id'];
            } else {
                $stmt = $pdo->prepare("INSERT INTO folders (name, type) VALUES (?, ?)");
                $stmt->execute([$name, $type]);
                $id = $pdo->lastInsertId();
            }

            // If an oldName was provided, cascade rename in items tables
            if (!empty($oldName) && $oldName !== $name) {
                if ($type === 'event') {
                    $pdo->prepare("UPDATE events_photos SET category = ? WHERE category = ?")->execute([$name, $oldName]);
                } elseif ($type === 'video') {
                    $pdo->prepare("UPDATE videos SET category = ? WHERE category = ?")->execute([$name, $oldName]);
                } elseif ($type === 'letter') {
                    $pdo->prepare("UPDATE letters_govt SET department = ? WHERE department = ?")->execute([$name, $oldName]);
                }
            }

            sendJsonResponse(['success' => true, 'id' => $id, 'name' => $name, 'type' => $type]);
        }
    } catch (Exception $e) {
        sendJsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? $_POST['id'] ?? ($_REQUEST['id'] ?? null);
    $name = $_GET['name'] ?? $_POST['name'] ?? ($_REQUEST['name'] ?? null);
    $type = $_GET['type'] ?? $_POST['type'] ?? ($_REQUEST['type'] ?? null);

    if (!$id && !$name) {
        $raw = file_get_contents('php://input');
        if ($raw) {
            $input = json_decode($raw, true);
            $id = $input['id'] ?? $id;
            $name = $input['name'] ?? $name;
            $type = $input['type'] ?? $type;
        }
    }

    if ($type === 'photo') $type = 'event';

    if (!$id && !$name) {
        sendJsonResponse(['success' => false, 'error' => 'ID or folder name is required'], 400);
    }

    try {
        $foldersToDelete = [];

        // 1. Check by ID if numeric
        if (!empty($id) && is_numeric($id)) {
            $stmt = $pdo->prepare("SELECT id, name, type FROM folders WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if ($row) $foldersToDelete[] = $row;
        }

        // 2. Check by Name & Type
        if (!empty($name)) {
            if (!empty($type)) {
                $stmt = $pdo->prepare("SELECT id, name, type FROM folders WHERE name = ? AND type = ?");
                $stmt->execute([$name, $type]);
            } else {
                $stmt = $pdo->prepare("SELECT id, name, type FROM folders WHERE name = ?");
                $stmt->execute([$name]);
            }
            $rows = $stmt->fetchAll();
            foreach ($rows as $r) {
                if (!in_array($r['id'], array_column($foldersToDelete, 'id'))) {
                    $foldersToDelete[] = $r;
                }
            }
        }

        // Delete from folders table
        foreach ($foldersToDelete as $f) {
            $pdo->prepare("DELETE FROM folders WHERE id = ?")->execute([$f['id']]);
        }

        // 3. Purge associated items
        $targetName = !empty($name) ? $name : ($foldersToDelete[0]['name'] ?? null);
        $targetType = !empty($type) ? $type : ($foldersToDelete[0]['type'] ?? null);

        if ($targetName) {
            if (!$targetType || $targetType === 'event') {
                $pdo->prepare("DELETE FROM events_photos WHERE category = ? OR event_date = ?")->execute([$targetName, $targetName]);
            }
            if (!$targetType || $targetType === 'video') {
                $pdo->prepare("DELETE FROM videos WHERE category = ?")->execute([$targetName]);
            }
            if (!$targetType || $targetType === 'letter') {
                $pdo->prepare("DELETE FROM letters_govt WHERE department = ? OR submission_date = ?")->execute([$targetName, $targetName]);
            }
        }

        sendJsonResponse(['success' => true]);
    } catch (Exception $e) {
        sendJsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

sendJsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);