<?php
/**
 * VOKAL (Voice of Kerala for Animal Legit) - 1-Click Database Auto-Installer
 * Safely imports vokal_database.sql into your cPanel database and connects api/config.php
 */

$message = '';
$status = '';
$tablesCreated = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $db_host = trim($_POST['db_host'] ?? 'localhost');
    $db_name = trim($_POST['db_name'] ?? '');
    $db_user = trim($_POST['db_user'] ?? '');
    $db_pass = trim($_POST['db_pass'] ?? '');

    if (empty($db_name) || empty($db_user)) {
        $message = "Please provide both the Database Name and Database Username.";
        $status = "danger";
    } else {
        try {
            // 1. Connect to MySQL
            $dsn = "mysql:host={$db_host};dbname={$db_name};charset=utf8mb4";
            $pdo = new PDO($dsn, $db_user, $db_pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);

            // 2. Read SQL File
            $sqlFile = __DIR__ . '/database/vokal_database.sql';
            if (!file_exists($sqlFile)) {
                throw new Exception("SQL file not found at /database/vokal_database.sql");
            }

            $sqlContent = file_get_contents($sqlFile);

            // 3. Clean SQL for cPanel compatibility (remove CREATE DATABASE and USE statements)
            $sqlContent = preg_replace('/CREATE DATABASE IF NOT EXISTS `?[a-zA-Z0-9_]+`?[^;]*;/i', '', $sqlContent);
            $sqlContent = preg_replace('/USE `?[a-zA-Z0-9_]+`?;/i', '', $sqlContent);

            // 4. Execute SQL
            $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
            $pdo->exec($sqlContent);
            $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");

            // 5. Verify created tables
            $stmt = $pdo->query("SHOW TABLES;");
            $tablesCreated = $stmt->fetchAll(PDO::FETCH_COLUMN);

            // 6. Update api/config.php
            $configFile = __DIR__ . '/api/config.php';
            if (file_exists($configFile)) {
                $configContent = file_get_contents($configFile);
                $configContent = preg_replace("/define\('DB_HOST',\s*getenv\('DB_HOST'\)\s*\?:\s*'[^']*'\);/", "define('DB_HOST', getenv('DB_HOST') ?: '{$db_host}');", $configContent);
                $configContent = preg_replace("/define\('DB_USER',\s*getenv\('DB_USER'\)\s*\?:\s*'[^']*'\);/", "define('DB_USER', getenv('DB_USER') ?: '{$db_user}');", $configContent);
                $configContent = preg_replace("/define\('DB_PASS',\s*getenv\('DB_PASS'\)\s*\?:\s*'[^']*'\);/", "define('DB_PASS', getenv('DB_PASS') ?: '{$db_pass}');", $configContent);
                $configContent = preg_replace("/define\('DB_NAME',\s*getenv\('DB_NAME'\)\s*\?:\s*'[^']*'\);/", "define('DB_NAME', getenv('DB_NAME') ?: '{$db_name}');", $configContent);
                file_put_contents($configFile, $configContent);
            }

            $status = "success";
            $message = "🎉 Database successfully connected and all 7 tables have been created and pre-seeded!";
        } catch (Exception $e) {
            $status = "danger";
            $message = "Connection error: " . $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VOKAL - 1-Click Database Auto-Installer</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <style>
        body {
            background: linear-gradient(135deg, #0d3b2e 0%, #051a14 100%);
            min-height: 100vh;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 20px 0;
        }
        .installer-card {
            background: rgba(255, 255, 255, 0.07);
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 215, 0, 0.3);
            border-radius: 16px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
            max-width: 580px;
            width: 100%;
        }
        .brand-header {
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding: 25px 30px;
            text-align: center;
        }
        .brand-title {
            color: #ffd700;
            font-weight: 700;
            font-size: 1.6rem;
            margin: 0;
            letter-spacing: 1px;
        }
        .form-control {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #fff;
            padding: 12px 16px;
            border-radius: 8px;
        }
        .form-control:focus {
            background: rgba(0, 0, 0, 0.4);
            border-color: #ffd700;
            color: #fff;
            box-shadow: 0 0 0 0.25rem rgba(255, 215, 0, 0.2);
        }
        .form-label {
            font-weight: 500;
            color: #e0e0e0;
            margin-bottom: 6px;
        }
        .btn-install {
            background: linear-gradient(135deg, #ffd700 0%, #d4af37 100%);
            color: #0d3b2e;
            font-weight: 700;
            font-size: 1.1rem;
            border: none;
            padding: 14px;
            border-radius: 8px;
            width: 100%;
            transition: all 0.3s ease;
        }
        .btn-install:hover {
            background: linear-gradient(135deg, #ffe033 0%, #e6be44 100%);
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(255, 215, 0, 0.3);
        }
        .badge-table {
            background: rgba(40, 167, 69, 0.25);
            border: 1px solid #28a745;
            color: #a3f7bf;
            padding: 6px 12px;
            margin: 4px;
            border-radius: 20px;
            display: inline-block;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>

<div class="container d-flex justify-content-center">
    <div class="installer-card p-4">
        <div class="brand-header">
            <div class="brand-title"><i class="bi bi-database-fill-gear me-2"></i>VOKAL Database Setup</div>
            <p class="text-muted small mt-2 mb-0">1-Click Automated MySQL Importer & Connection Tool</p>
        </div>

        <div class="card-body p-3 pt-4">
            <?php if (!empty($message)): ?>
                <div class="alert alert-<?php echo $status; ?> alert-dismissible fade show" role="alert">
                    <i class="bi <?php echo ($status === 'success') ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'; ?> me-2"></i>
                    <?php echo htmlspecialchars($message); ?>
                </div>
            <?php endif; ?>

            <?php if ($status === 'success'): ?>
                <div class="text-center py-3">
                    <h5 class="text-warning mb-3"><i class="bi bi-table me-2"></i>Created Tables:</h5>
                    <div>
                        <?php foreach ($tablesCreated as $tbl): ?>
                            <span class="badge-table"><i class="bi bi-check2 me-1"></i><?php echo htmlspecialchars($tbl); ?></span>
                        <?php endforeach; ?>
                    </div>
                    <div class="mt-4 pt-3 border-top border-secondary">
                        <a href="index.html" class="btn btn-outline-warning me-2"><i class="bi bi-globe me-1"></i>Visit Website</a>
                        <a href="tv.html" class="btn btn-outline-light"><i class="bi bi-tv me-1"></i>Open TV Signage</a>
                    </div>
                    <p class="text-secondary small mt-3">Tip: For security, you may now delete <code>setup_db.php</code> from File Manager.</p>
                </div>
            <?php else: ?>
                <form method="POST" action="setup_db.php">
                    <div class="mb-3">
                        <label class="form-label"><i class="bi bi-server me-1"></i>Database Host</label>
                        <input type="text" name="db_host" class="form-control" value="localhost" required>
                        <small class="text-muted">Usually <code>localhost</code> in cPanel.</small>
                    </div>

                    <div class="mb-3">
                        <label class="form-label"><i class="bi bi-database me-1"></i>Database Name</label>
                        <input type="text" name="db_name" class="form-control" placeholder="e.g. vokalorg_database" required>
                        <small class="text-muted">The name of the database created in cPanel.</small>
                    </div>

                    <div class="mb-3">
                        <label class="form-label"><i class="bi bi-person me-1"></i>Database Username</label>
                        <input type="text" name="db_user" class="form-control" placeholder="e.g. vokalorg_user" required>
                    </div>

                    <div class="mb-4">
                        <label class="form-label"><i class="bi bi-key me-1"></i>Database Password</label>
                        <input type="password" name="db_pass" class="form-control" placeholder="Your database user password">
                    </div>

                    <button type="submit" class="btn-install">
                        <i class="bi bi-lightning-charge-fill me-2"></i>Connect & Import Database
                    </button>
                </form>
            <?php endif; ?>
        </div>
    </div>
</div>

</body>
</html>
