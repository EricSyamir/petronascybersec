<?php
session_start();
require_once 'config/database.php';
require_once 'includes/auth.php';
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
                <!-- Source Information Form -->
                <div class="source-info-form">
                    <h3>Source Information</h3>
                    <p class="form-description">Please fill in the source information below to enable media upload and analysis</p>
                    
                    <div class="form-row">
                    <div class="form-group">
                        <label for="userEmail">Your Email Address *</label>
                        <input type="email" id="userEmail" class="form-input" placeholder="your.email@example.com" required>
                        <small class="form-hint">Your contact email for this report</small>
                    </div>
                        
                        <div class="form-group">
                            <label for="sourceType">Source Type *</label>
                            <select id="sourceType" class="form-select" required>
                                <option value="">Select source type</option>
                                <option value="email">Email</option>
                                <option value="phone">Phone Number</option>
                                <option value="social_media">Social Media</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="sourceValue" id="sourceValueLabel">Source Value *</label>
                        <input type="text" id="sourceValue" class="form-input" placeholder="Enter email, phone number, or social media handle" required>
                        <small class="form-hint" id="sourceHint">Enter the email address, phone number, or social media handle where you found this content</small>
                    </div>
                    
                    <div class="form-submit-section">
                        <button type="button" id="submitSourceInfo" class="btn btn-primary btn-large">
                            <span>Submit & Continue</span>
                        </button>
                    </div>
                    
                    <div class="form-completion-status" id="formCompletionStatus" style="display: none;">
                        <div class="completion-message">
                            <span class="completion-icon">✅</span>
                            <span>All fields completed! You can now upload media for analysis.</span>
                        </div>
                    </div>
                </div>

                <div class="upload-section-wrapper" id="uploadSectionWrapper" style="display: none;">
                <div class="upload-area" id="uploadArea" tabindex="-1">
                    <div class="upload-content">
                        <div class="upload-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <h3><?php echo $translations['upload_media']; ?></h3>
                        <p><?php echo $translations['drag_drop_files']; ?>, or paste from clipboard (Ctrl+V / Cmd+V)</p>
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
                
                <!-- Breach Results Section (for source email only) -->
                <div id="breachResultsSection" class="breach-results-section" style="display: none;"></div>
            </div>

            <!-- Results Section -->
            <section class="scanner-results" id="resultsSection" style="display: none;">
                <!-- Results Header -->
                <div class="results-top-bar">
                    <h2 class="results-title">
                        <span class="title-icon">🔍</span>
                        <?php echo $translations['analysis_complete']; ?>
                    </h2>
                </div>

                <!-- Main Results Container -->
                <div class="results-container">
                    <!-- Left Column: Analysis Results -->
                    <div class="results-left">
                        <!-- Authenticity Status Card -->
                        <div class="status-card">
                            <div class="status-header">
                                <h3>Authenticity Status</h3>
                            </div>
                            <div class="status-body">
                                <div class="status-indicator-wrapper" id="authenticityIndicator">
                                    <div class="status-circle">
                                        <div class="indicator-circle"></div>
                                    </div>
                                    <div class="status-text">
                                        <span id="authenticityText" class="status-label">Analyzing...</span>
                                    </div>
                                </div>
                                
                                <div class="confidence-section">
                                    <div class="confidence-header">
                                        <span class="confidence-label">Confidence Score</span>
                                        <span class="confidence-value" id="scoreText">0%</span>
                                    </div>
                                    <div class="confidence-bar-wrapper">
                                        <div class="confidence-bar">
                                            <div class="confidence-fill" id="scoreFill"></div>
                                        </div>
                                    </div>
                                </div>

                                <div class="indicators-section">
                                    <h4>Detection Indicators</h4>
                                    <div class="indicators-container" id="indicatorsList">
                                        <!-- Indicators will be inserted here -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column: Media Preview -->
                    <div class="results-right">
                        <div class="preview-card-new">
                            <div class="preview-header">
                                <h3>Media Preview</h3>
                            </div>
                            <div class="preview-body">
                                <div class="preview-container" id="mediaPreview">
                                    <div class="preview-placeholder">
                                        <span class="placeholder-icon">🖼️</span>
                                        <span class="placeholder-text">Media will appear here</span>
                                    </div>
                                </div>
                                <div class="preview-info" id="mediaInfo">
                                    <!-- Media info will be inserted here -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Warning Banner (if AI detected) -->
                <div class="warning-banner" id="warningBanner" style="display: none;">
                    <div class="warning-content">
                        <div class="warning-icon">⚠️</div>
                        <div class="warning-text">
                            <h4>AI-Generated Content Detected</h4>
                            <p>This content may be artificially generated. Exercise caution when sharing or believing this content.</p>
                        </div>
                        <div class="warning-actions">
                            <a href="cybersecurity-awareness.php" class="btn btn-outline">Learn More</a>
                            <a href="report-incident.php" class="btn btn-primary">Report Content</a>
                        </div>
                    </div>
                </div>

                <!-- Detailed Analysis Section -->
                <div class="analysis-section">
                    <div class="analysis-header">
                        <h3>Detailed Analysis</h3>
                    </div>
                    <div class="analysis-tabs-new">
                        <button class="analysis-tab active" data-tab="general" onclick="showTab('general')">
                            <span class="tab-icon">📊</span>
                            <span class="tab-label">General</span>
                        </button>
                        <button class="analysis-tab" data-tab="deepfake" onclick="showTab('deepfake')">
                            <span class="tab-icon">🎭</span>
                            <span class="tab-label">Deepfake Analysis</span>
                        </button>
                        <button class="analysis-tab" data-tab="ai-generated" onclick="showTab('ai-generated')">
                            <span class="tab-icon">🤖</span>
                            <span class="tab-label">Generated AI Analysis</span>
                        </button>
                        <button class="analysis-tab" data-tab="machine-learning" onclick="showTab('machine-learning')">
                            <span class="tab-icon">🧠</span>
                            <span class="tab-label">Machine Learning Analysis</span>
                        </button>
                    </div>
                    
                    <div class="analysis-content">
                        <div class="analysis-panel active" id="generalTab">
                            <div id="generalAnalysis"></div>
                        </div>
                        <div class="analysis-panel" id="deepfakeTab">
                            <div id="deepfakeAnalysis"></div>
                        </div>
                        <div class="analysis-panel" id="ai-generatedTab">
                            <div id="aiGeneratedAnalysis"></div>
                        </div>
                        <div class="analysis-panel" id="machine-learningTab">
                            <div id="machineLearningAnalysis"></div>
                        </div>
                    </div>
                </div>

                <!-- OSINT Analysis Section -->
                <div class="osint-analysis-section">
                    <div class="analysis-header">
                        <h3>🔍 OSINT Source Analysis</h3>
                        <p class="section-description">Security checks on the source of this content</p>
                    </div>
                    <div id="osintResults" class="osint-results-container">
                        <!-- OSINT results will be displayed here -->
                    </div>
                </div>
            </section>

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
