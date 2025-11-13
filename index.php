<?php
session_start();
require_once 'includes/language.php';

// Set default language
$lang = isset($_SESSION['language']) ? $_SESSION['language'] : 'en';
$translations = loadLanguage($lang);

// Hardcoded statistics (no database)
function getTotalScammers() {
    return 1247;
}

function getVerifiedScammers() {
    return 856;
}

function getTotalReports() {
    return 3542;
}

function getDeepfakesDetected() {
    return 287;
}

// Get base path dynamically
$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'];
$scriptPath = dirname($_SERVER['SCRIPT_NAME']);
$basePath = rtrim($scriptPath, '/');
if ($basePath === '.' || $basePath === '') {
    $basePath = '';
} else {
    $basePath = '/' . ltrim($basePath, '/');
}
$baseUrl = $protocol . '://' . $host . $basePath;
?>
<!DOCTYPE html>
<html lang="<?php echo $lang; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $translations['platform_title']; ?> - PETRONAS Cybercrime Platform</title>
    <link rel="stylesheet" href="assets/css/petronas-master.css">
    <link rel="icon" type="image/svg+xml" href="<?php echo $baseUrl; ?>/assets/images/shield-icon.svg">
    <link rel="icon" type="image/x-icon" href="<?php echo $baseUrl; ?>/assets/images/shield-icon.svg">
    <link rel="shortcut icon" type="image/svg+xml" href="<?php echo $baseUrl; ?>/assets/images/shield-icon.svg">
    <link rel="apple-touch-icon" href="<?php echo $baseUrl; ?>/assets/images/shield-icon.svg">
</head>
<body>
    <header class="main-header">
        <nav class="navbar">
            <div class="nav-container">
                <div class="logo">
                    <img src="<?php echo $baseUrl; ?>/petronas.png" alt="PETRONAS" class="logo-img" onerror="this.src='<?php echo $baseUrl; ?>/assets/images/shield-icon.svg'; this.onerror=null;">
                    <span class="platform-name"><?php echo $translations['platform_title']; ?></span>
                </div>
                <div class="nav-links">
                    <a href="deepfake-scanner.php" class="nav-link"><?php echo $translations['deepfake_scanner']; ?></a>
                    <a href="osint-monitor.php" class="nav-link"><?php echo $translations['osint_monitor']; ?></a>
                    <a href="report-incident.php" class="nav-link"><?php echo $translations['report_incident']; ?></a>
                    <div class="language-toggle">
                        <button onclick="toggleLanguage()" class="lang-btn">
                            <?php echo $lang === 'en' ? 'BM' : 'EN'; ?>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    </header>

    <main class="main-content">
        <section class="hero-section">
            <div class="hero-content">
                <h1><?php echo $translations['welcome_title']; ?></h1>
                <p><?php echo $translations['welcome_subtitle']; ?></p>
                <div class="cta-buttons">
                    <a href="report-incident.php" class="btn btn-primary"><?php echo $translations['report_now']; ?></a>
                    <a href="deepfake-scanner.php" class="btn btn-secondary"><?php echo $translations['scan_media']; ?></a>
                    <a href="osint-monitor.php" class="btn btn-outline">OSINT Tools</a>
                </div>
            </div>
        </section>

        <section class="quick-stats">
            <div class="stats-container">
                <div class="stat-card">
                    <h3 id="total-scammers"><?php echo getTotalScammers(); ?></h3>
                    <p>Known Scammers</p>
                </div>
                <div class="stat-card">
                    <h3 id="verified-scammers"><?php echo getVerifiedScammers(); ?></h3>
                    <p>Verified Reports</p>
                </div>
                <div class="stat-card">
                    <h3 id="total-reports"><?php echo getTotalReports(); ?></h3>
                    <p><?php echo $translations['total_reports']; ?></p>
                </div>
                <div class="stat-card">
                    <h3 id="deepfakes-detected"><?php echo getDeepfakesDetected(); ?></h3>
                    <p><?php echo $translations['deepfakes_detected']; ?></p>
                </div>
            </div>
        </section>

        <section class="external-links">
            <div class="links-container">
                <div class="link-card">
                    <h3><?php echo $translations['escalate_to']; ?></h3>
                    <a href="https://cyber999.gov.my" target="_blank" class="external-link">
                        <img src="assets/images/cyber999-logo.png" alt="Cyber999">
                        <span>Cyber999 (CSM)</span>
                    </a>
                    <a href="https://www.rmp.gov.my/e-reporting" target="_blank" class="external-link">
                        <img src="assets/images/pdrm-logo.png" alt="PDRM">
                        <span><?php echo $translations['pdrm_reporting']; ?></span>
                    </a>
                </div>
                <div class="link-card">
                    <h3><?php echo $translations['resources']; ?></h3>
                    <a href="assets/docs/petronas-cobe.pdf" target="_blank" class="resource-link">
                        <?php echo $translations['petronas_cobe']; ?>
                    </a>
                    <a href="cybersecurity-awareness.php" class="resource-link">
                        <?php echo $translations['cyber_awareness']; ?>
                    </a>
                </div>
            </div>
        </section>
    </main>

    <footer class="main-footer">
        <div class="footer-content">
            <p>&copy; 2025 SecureTech. <?php echo $translations['footer_text']; ?></p>
            <div class="footer-links">
                <a href="privacy-policy.php"><?php echo $translations['privacy_policy']; ?></a>
                <a href="terms-of-service.php"><?php echo $translations['terms_service']; ?></a>
                <a href="contact.php"><?php echo $translations['contact']; ?></a>
            </div>
        </div>
    </footer>

    <script src="assets/js/anime.min.js"></script>
    <script src="assets/js/main.js"></script>
    <script src="assets/js/petronas-animations.js"></script>
    <script src="assets/js/language-toggle.js"></script>
</body>
</html>
