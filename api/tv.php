<?php
/**
 * VOKAL - TV Display Signage API Endpoint
 * Supplies live rotating slideshow playlist for Smart TVs, shelter monitors, and office displays.
 */

require_once __DIR__ . '/config.php';

$pdo = getDbConnection();

// Fetch dedicated TV slides + latest approved event photos
$stmt = $pdo->query("
    SELECT 
        'slide' AS source,
        id,
        slide_type,
        title,
        subtitle,
        media_url,
        caption,
        duration_seconds,
        sort_order
    FROM `tv_display_slides`
    WHERE `is_active` = 1

    UNION ALL

    SELECT 
        'event_photo' AS source,
        id,
        'photo' AS slide_type,
        title,
        CONCAT(location, ' • ', event_date) AS subtitle,
        image_url AS media_url,
        description AS caption,
        10 AS duration_seconds,
        50 AS sort_order
    FROM `events_photos`
    WHERE `show_on_tv` = 1

    ORDER BY sort_order ASC, id DESC
");

$slides = $stmt->fetchAll();

// Fetch live statistics
$statStmt = $pdo->query("SELECT setting_key, setting_value FROM `site_settings` WHERE setting_key LIKE 'stat_%'");
$stats = [];
while ($row = $statStmt->fetch()) {
    $stats[str_replace('stat_', '', $row['setting_key'])] = $row['setting_value'];
}

sendJsonResponse([
    "success" => true,
    "system" => "VOKAL TV Signage Server",
    "reg_no" => "Reg. No: 147/2026",
    "stats" => $stats,
    "total_slides" => count($slides),
    "slides" => $slides
]);
