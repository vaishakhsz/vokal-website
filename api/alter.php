<?php
require_once __DIR__ . '/config.php';

$pdo = getDbConnection();

$results = [];

try {
    $pdo->exec("ALTER TABLE `events_photos` MODIFY `image_url` LONGTEXT NOT NULL");
    $results['events_photos_image_url'] = "SUCCESS";
} catch (PDOException $e) {
    $results['events_photos_image_url'] = "FAILED: " . $e->getMessage();
}

try {
    $pdo->exec("ALTER TABLE `events_photos` MODIFY `thumbnail_url` LONGTEXT NULL");
    $results['events_photos_thumbnail_url'] = "SUCCESS";
} catch (PDOException $e) {
    $results['events_photos_thumbnail_url'] = "FAILED: " . $e->getMessage();
}

try {
    $pdo->exec("ALTER TABLE `letters_govt` MODIFY `document_url` LONGTEXT NULL");
    $results['letters_govt_document_url'] = "SUCCESS";
} catch (PDOException $e) {
    $results['letters_govt_document_url'] = "FAILED: " . $e->getMessage();
}

try {
    $pdo->exec("ALTER TABLE `videos` MODIFY `thumbnail_url` LONGTEXT NULL");
    $results['videos_thumbnail_url'] = "SUCCESS";
} catch (PDOException $e) {
    $results['videos_thumbnail_url'] = "FAILED: " . $e->getMessage();
}

sendJsonResponse($results);
