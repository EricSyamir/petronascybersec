<?php
session_start();
require_once 'includes/language.php';

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
    <title><?php echo $translations['deepfake_scanner']; ?> - PETRONAS Cybercrime Platform</title>
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
                    <a href="index.php" class="nav-link">Home</a>
                    <a href="deepfake-scanner.php" class="nav-link active"><?php echo $translations['deepfake_scanner']; ?></a>
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
        <div class="container">
            <div class="page-header">
                <h1><?php echo $translations['deepfake_scanner']; ?></h1>
                <p><?php echo $translations['deepfake_education']; ?></p>
            </div>


            <!-- Upload Section -->
            <div class="scanner-section">
                <div class="upload-area" id="uploadArea">
                    <div class="upload-content">
                        <div class="upload-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <h3><?php echo $translations['upload_media']; ?></h3>
                        <p><?php echo $translations['drag_drop_files']; ?></p>
                        <p class="upload-note">Note: MP4 videos must be under 1 minute in duration.</p>
                        <input type="file" id="fileInput" accept="image/*,video/*" multiple style="display: none;">
                        <button type="button" onclick="document.getElementById('fileInput').click()" class="btn btn-primary">
                            <?php echo $translations['upload_media']; ?>
                        </button>
                    </div>
                    <div class="upload-progress" id="uploadProgress" style="display: none;">
                        <div class="progress-bar">
                            <div class="progress-fill" id="progressFill"></div>
                        </div>
                        <p id="progressText"><?php echo $translations['analyzing']; ?></p>
                    </div>
                </div>

                <!-- URL Analysis -->
                <div class="url-analysis">
                    <h3>Analyze Media from URL</h3>
                    <div class="url-input-group">
                        <input type="url" id="mediaUrl" placeholder="Enter image or video URL" class="form-input">
                        <button type="button" onclick="analyzeUrl()" class="btn btn-secondary">Analyze URL</button>
                    </div>
                </div>
            </div>

            <!-- Results Section -->
            <div class="results-section" id="resultsSection" style="display: none;">
                <div class="results-header">
                    <h2><?php echo $translations['analysis_complete']; ?></h2>
                </div>
                
                <div class="results-grid">
                    <div class="result-card authenticity-card">
                        <div class="card-header">
                            <h3>Authenticity Assessment</h3>
                            <div class="authenticity-indicator" id="authenticityIndicator">
                                <div class="indicator-circle"></div>
                                <span id="authenticityText"></span>
                            </div>
                        </div>
                        <div class="card-content">
                            <div class="confidence-score">
                                <label><?php echo $translations['confidence_score']; ?>:</label>
                                <div class="score-bar">
                                    <div class="score-fill" id="scoreFill"></div>
                                    <span class="score-text" id="scoreText">0%</span>
                                </div>
                            </div>
                            <div class="indicators-list" id="indicatorsList">
                                <!-- Dynamic indicators will be inserted here -->
                            </div>
                        </div>
                    </div>

                    <div class="result-card preview-card">
                        <div class="card-header">
                            <h3>Media Preview</h3>
                        </div>
                        <div class="card-content">
                            <div class="media-preview" id="mediaPreview">
                                <!-- Media preview will be inserted here -->
                            </div>
                            <div class="media-info" id="mediaInfo">
                                <!-- Media information will be inserted here -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PETRONAS Education Banner Modal -->
                <div class="education-modal" id="educationModal" style="display: none;">
                    <div class="modal-overlay" onclick="closeEducationModal()"></div>
                    <div class="modal-content">
                        <button class="modal-close" onclick="closeEducationModal()">&times;</button>
                        <div class="banner-content">
                            <div class="banner-icon danger">⚠️</div>
                            <div class="banner-text">
                                <h4><?php echo $translations['deepfake_warning']; ?></h4>
                                <p>Warning: This content may be artificially generated. Exercise caution when sharing or believing this content.</p>
                                <p>Learn more about protecting yourself from deepfakes and AI-generated misinformation.</p>
                                <div class="banner-actions">
                                    <a href="cybersecurity-awareness.php" class="btn btn-outline">Learn More</a>
                                    <a href="report-incident.php" class="btn btn-primary">Report This Content</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Detailed Analysis -->
                <div class="detailed-analysis">
                    <h3>Detailed Technical Analysis</h3>
                    <div class="analysis-tabs">
                        <button class="tab-btn active" onclick="showTab('general')">General</button>
                        <button class="tab-btn" onclick="showTab('faces')">Face Analysis</button>
                        <button class="tab-btn" onclick="showTab('text')">Text Content</button>
                        <button class="tab-btn" onclick="showTab('technical')">Technical Details</button>
                    </div>
                    
                    <div class="tab-content active" id="generalTab">
                        <div id="generalAnalysis"></div>
                    </div>
                    
                    <div class="tab-content" id="facesTab">
                        <div id="faceAnalysis"></div>
                    </div>
                    
                    <div class="tab-content" id="textTab">
                        <div id="textAnalysis"></div>
                    </div>
                    
                    <div class="tab-content" id="technicalTab">
                        <div id="technicalAnalysis"></div>
                    </div>
                </div>
            </div>

            <!-- Recent Scans -->
            <div class="recent-scans" id="recentScans">
                <h3>Recent Scans</h3>
                <div class="scans-list" id="scansList">
                    <!-- Recent scans will be loaded here -->
                </div>
            </div>
        </div>
    </main>

    <footer class="main-footer">
        <div class="footer-content">
            <p>&copy; 2025 SecureTech. <?php echo $translations['footer_text']; ?></p>
        </div>
    </footer>

    <script src="assets/js/anime.min.js"></script>
    <script src="assets/js/main.js"></script>
    <script src="assets/js/language-toggle.js"></script>
    <script src="assets/js/deepfake-scanner.js"></script>
    <script src="assets/js/petronas-animations.js"></script>
    <script src="assets/js/deepfake-animations.js"></script>
</body>
</html>
