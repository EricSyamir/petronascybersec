<?php
session_start();
require_once 'config/database.php';
require_once 'includes/auth.php';
require_once 'includes/language.php';

// Public access - no login required for OSINT tools
// Note: Investigation features require login (investigator/admin role)

$lang = getCurrentLanguage();
$translations = loadLanguage($lang);

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
    <title><?php echo $translations['osint_monitor']; ?> - PETRONAS Cybercrime Platform</title>
    <link rel="stylesheet" href="assets/css/petronas-master.css">
    <link rel="icon" type="image/svg+xml" href="<?php echo $baseUrl; ?>/assets/images/shield-icon.svg">
    <link rel="icon" type="image/x-icon" href="<?php echo $baseUrl; ?>/assets/images/shield-icon.svg">
    <link rel="shortcut icon" type="image/svg+xml" href="<?php echo $baseUrl; ?>/assets/images/shield-icon.svg">
    <link rel="apple-touch-icon" href="<?php echo $baseUrl; ?>/assets/images/shield-icon.svg">
    <!-- Leaflet CSS for mapping -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
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
                    <a href="index.php" class="nav-link">Home</a>
                    <a href="deepfake-scanner.php" class="nav-link"><?php echo $translations['deepfake_scanner']; ?></a>
                    <a href="osint-monitor.php" class="nav-link active"><?php echo $translations['osint_monitor']; ?></a>
                    <a href="report-incident.php" class="nav-link"><?php echo $translations['report_incident']; ?></a>
                    <div class="language-toggle">
                        <button type="button" onclick="toggleLanguage()" class="lang-btn">
                            <?php echo $lang === 'en' ? 'BM' : 'EN'; ?>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    </header>

    <main class="main-content">
        <div class="container">
            <div class="page-header">
                <h1>OSINT Investigation Tools</h1>
                <p>Comprehensive Open Source Intelligence platform for cybersecurity investigations</p>
            </div>

            <!-- Investigation Dashboard Layout -->
            <div class="investigation-dashboard">
                <!-- Main Content Area -->
                <div class="dashboard-main full-width">
                    <!-- OSINT Tools Tabs -->
                    <div class="osint-tabs">
                        <div class="tabs-header">
                            <button type="button" class="tab-btn active" onclick="switchTab('semak-mule')" data-tab="semak-mule">
                                <span class="tab-icon">🔍</span>
                                <span>Semak Mule</span>
                            </button>
                            <button type="button" class="tab-btn" onclick="switchTab('email-checker')" data-tab="email-checker">
                                <span class="tab-icon">📧</span>
                                <span>Email Checker</span>
                            </button>
                            <button type="button" class="tab-btn" onclick="switchTab('breach-checker')" data-tab="breach-checker">
                                <span class="tab-icon">🔐</span>
                                <span>Breach Checker</span>
                            </button>
                        </div>

                <!-- Semak Mule Tab -->
                <div class="tab-content active" id="tab-semak-mule">
                    <div class="osint-tool-section">
                        <h2>Semak Mule - Scammer Database</h2>
                        <p class="tool-description">Check bank accounts and phone numbers against the Royal Malaysian Police CCID Portal scammer database.</p>
                        
                        <div class="tool-input-section">
                            <div class="input-group">
                                <label>Search Type</label>
                                <select id="semakMuleType" class="form-select">
                                    <option value="bank">Bank Account</option>
                                    <option value="phone">Phone Number</option>
                                </select>
                            </div>
                            <div class="input-group">
                                <label id="semakMuleLabel">Bank Account Number</label>
                                <input type="text" id="semakMuleInput" class="form-input" placeholder="Enter bank account number">
                            </div>
                            <button type="button" onclick="checkSemakMule()" class="btn btn-primary">Check Database</button>
                        </div>
                        
                        <div id="semakMuleResults" class="tool-results"></div>
                    </div>
                </div>

                <!-- Email Checker Tab -->
                <div class="tab-content" id="tab-email-checker">
                    <div class="osint-tool-section">
                        <h2>Email Checker (Holehe)</h2>
                        <p class="tool-description">Check if an email address is registered on various websites and platforms using Holehe.</p>
                        
                        <div class="tool-input-section">
                            <div class="input-group">
                                <label>Email Address</label>
                                <input type="email" id="emailCheckInput" class="form-input" placeholder="example@email.com">
                            </div>
                            <button type="button" onclick="checkEmail()" class="btn btn-primary">Check Email</button>
                        </div>
                        
                        <div id="emailCheckResults" class="tool-results"></div>
                    </div>
                </div>

                <!-- Breach Checker Tab -->
                <div class="tab-content" id="tab-breach-checker">
                    <div class="osint-tool-section">
                        <h2>Breach Checker (HaveIBeenPwned)</h2>
                        <p class="tool-description">Check if an email address has been compromised in any known data breaches using HaveIBeenPwned.</p>
                        
                        <div class="tool-input-section">
                            <div class="input-group">
                                <label>Email Address</label>
                                <input type="email" id="breachCheckInput" class="form-input" placeholder="example@email.com">
                            </div>
                            <button type="button" onclick="checkBreach()" class="btn btn-primary">Check Breaches</button>
                        </div>
                        
                        <div id="breachCheckResults" class="tool-results"></div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <div id="threatModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Threat Details</h3>
                <button type="button" onclick="closeThreatModal()" class="modal-close">&times;</button>
            </div>
            <div class="modal-body" id="threatModalBody">
                <!-- Threat details will be populated here -->
            </div>
            <div class="modal-footer">
                <button type="button" onclick="markAsReviewed()" class="btn btn-primary">Mark as Reviewed</button>
                <button type="button" onclick="escalateThreat()" class="btn btn-secondary">Escalate</button>
                <button type="button" onclick="closeThreatModal()" class="btn btn-outline">Close</button>
            </div>
        </div>
    </div>

    <footer class="main-footer">
        <div class="footer-content">
            <p>&copy; 2025 SecureTech. <?php echo $translations['footer_text']; ?></p>
        </div>
    </footer>

    <script src="assets/js/anime.min.js"></script>
    <script src="assets/js/main.js"></script>
    <script src="assets/js/language-toggle.js"></script>
    <script src="assets/js/osint-monitor.js"></script>
    <script src="assets/js/petronas-animations.js"></script>
    <!-- Chart.js for data visualization -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <!-- Leaflet for mapping -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
</body>
</html>
