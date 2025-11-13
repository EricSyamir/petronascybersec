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

// Simplified CSRF token generation (no database)
function generateCSRFToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function validateCSRFToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['submit_report'])) {
    // CSRF token validation
    if (!validateCSRFToken($_POST['csrf_token'] ?? '')) {
        $error = 'Invalid security token. Please try again.';
    } else {
        // Simulate report submission (no database)
        $reportId = rand(100000, 999999);
        $success = 'Report submitted successfully';
    }
}

<!DOCTYPE html>
<html lang="<?php echo $lang; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $translations['report_incident']; ?> - PETRONAS Cybercrime Platform</title>
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
                    <a href="deepfake-scanner.php" class="nav-link"><?php echo $translations['deepfake_scanner']; ?></a>
                    <a href="osint-monitor.php" class="nav-link"><?php echo $translations['osint_monitor']; ?></a>
                    <a href="report-incident.php" class="nav-link active"><?php echo $translations['report_incident']; ?></a>
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
            <?php if (isset($success)): ?>
                <div class="alert alert-success">
                    <h4>✅ <?php echo $success; ?></h4>
                    <p>Report ID: <strong>#<?php echo str_pad($reportId, 6, '0', STR_PAD_LEFT); ?></strong></p>
                    <p>You will receive updates on the investigation progress.</p>
                    <div class="alert-actions">
                        <a href="track-report.php?id=<?php echo $reportId; ?>" class="btn btn-primary">Track Report</a>
                        <a href="report-incident.php" class="btn btn-outline">Submit Another Report</a>
                    </div>
                </div>
            <?php endif; ?>

            <?php if (isset($error)): ?>
                <div class="alert alert-danger">
                    <h4>❌ <?php echo $error; ?></h4>
                </div>
            <?php endif; ?>

            <div class="page-header">
                <h1><?php echo $translations['report_incident']; ?></h1>
                <p>Help protect Malaysia's digital ecosystem by reporting cybercrime incidents</p>
            </div>

            <!-- Security Notice -->
            <div class="security-notice">
                <div class="notice-content">
                    <h3><?php echo $translations['security_notice']; ?></h3>
                    <p><?php echo $translations['data_protection']; ?></p>
                    <p><?php echo $translations['encrypted_transmission']; ?></p>
                    <div class="cobe-notice">
                        <p><strong>PETRONAS Code of Business Ethics:</strong> All reports are handled with integrity, transparency, and in accordance with PETRONAS values.</p>
                    </div>
                </div>
            </div>

            <!-- Reporting Form -->
            <form method="POST" enctype="multipart/form-data" class="incident-form" id="incidentForm">
                <input type="hidden" name="csrf_token" value="<?php echo generateCSRFToken(); ?>">
                
                <!-- Basic Information -->
                <div class="form-section">
                    <h3>Basic Information</h3>
                    
                    <div class="form-group">
                        <label class="form-label" for="incident_type"><?php echo $translations['incident_type']; ?> *</label>
                        <select name="incident_type" id="incident_type" class="form-select" required>
                            <option value="">Select incident type</option>
                            <option value="phishing"><?php echo $translations['phishing']; ?></option>
                            <option value="scam"><?php echo $translations['scam']; ?></option>
                            <option value="deepfake"><?php echo $translations['deepfake']; ?></option>
                            <option value="identity_theft"><?php echo $translations['identity_theft']; ?></option>
                            <option value="malware"><?php echo $translations['malware']; ?></option>
                            <option value="other"><?php echo $translations['other']; ?></option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="title"><?php echo $translations['incident_title']; ?> *</label>
                        <input type="text" name="title" id="title" class="form-input" 
                               placeholder="e.g., Phishing email from fake PETRONAS account" required maxlength="255">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="description"><?php echo $translations['incident_description']; ?> *</label>
                        <textarea name="description" id="description" class="form-textarea" 
                                  placeholder="Provide detailed information about the incident, including when it occurred, how you discovered it, and any relevant details" 
                                  required rows="6"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="location"><?php echo $translations['location']; ?></label>
                        <input type="text" name="location" id="location" class="form-input" 
                               placeholder="City, State (e.g., Kuala Lumpur, Selangor)">
                    </div>
                </div>
                
                <!-- Evidence Upload -->
                <div class="form-section">
                    <h3><?php echo $translations['upload_evidence']; ?></h3>
                    <p>Upload any screenshots, documents, or other evidence related to the incident</p>
                    
                    <div class="upload-area" id="evidenceUpload">
                        <div class="upload-content">
                            <div class="upload-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <polyline points="7,10 12,5 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <line x1="12" y1="5" x2="12" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                </svg>
                            </div>
                            <h4><?php echo $translations['drag_drop_files']; ?></h4>
                            <p>Supported: Images, Videos, Documents (Max 50MB each)</p>
                            <input type="file" name="evidence_files[]" id="evidenceFiles" multiple 
                                   accept="image/*,video/*,.pdf,.doc,.docx,.txt" style="display: none;">
                            <button type="button" onclick="document.getElementById('evidenceFiles').click()" class="btn btn-secondary">
                                Choose Files
                            </button>
                        </div>
                    </div>
                    
                    <div id="filesList" class="files-list" style="display: none;">
                        <h4>Selected Files:</h4>
                        <div id="filesContainer"></div>
                    </div>
                    
                    <div class="deepfake-notice">
                        <p><strong>Automatic Analysis:</strong> Uploaded images and videos will be automatically scanned for deepfake content using AI detection technology.</p>
                    </div>
                </div>
                
                <!-- Contact Information -->
                <div class="form-section">
                    <h3>Contact Information</h3>
                    <p>Provide your contact details so we can follow up on this report</p>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="contact_name">Full Name</label>
                            <input type="text" name="contact_name" id="contact_name" class="form-input" 
                                   placeholder="e.g., Ahmad bin Abdullah" maxlength="100">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="contact_email">Email Address</label>
                            <input type="email" name="contact_email" id="contact_email" class="form-input" 
                                   placeholder="your.email@example.com" maxlength="255">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="contact_phone">Phone Number</label>
                            <input type="tel" name="contact_phone" id="contact_phone" class="form-input" 
                                   placeholder="+60 12-345 6789" maxlength="20">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="organization">Organization (Optional)</label>
                            <input type="text" name="organization" id="organization" class="form-input" 
                                   placeholder="e.g., ABC Sdn Bhd" maxlength="255">
                        </div>
                    </div>
                </div>
                
                <!-- Privacy and Consent -->
                <div class="form-section">
                    <h3>Privacy & Consent</h3>
                    
                    <div class="consent-checkboxes">
                        <label class="checkbox-label">
                            <input type="checkbox" name="consent_investigation" required>
                            <span class="checkmark"></span>
                            I consent to PETRONAS investigating this incident and sharing necessary information with relevant authorities
                        </label>
                        
                        <label class="checkbox-label">
                            <input type="checkbox" name="consent_contact" required>
                            <span class="checkmark"></span>
                            I consent to being contacted regarding this incident for investigation purposes
                        </label>
                        
                        <label class="checkbox-label">
                            <input type="checkbox" name="consent_data">
                            <span class="checkmark"></span>
                            I consent to anonymous data from this report being used for cybersecurity research and threat intelligence
                        </label>
                    </div>
                    
                    <div class="privacy-links">
                        <p>By submitting this report, you agree to our 
                           <a href="privacy-policy.php" target="_blank">Privacy Policy</a> and 
                           <a href="terms-of-service.php" target="_blank">Terms of Service</a>.
                        </p>
                    </div>
                </div>
                
                <!-- Submit Section -->
                <div class="form-section submit-section">
                    <div class="submit-actions">
                        <button type="submit" name="submit_report" class="btn btn-primary btn-large" id="submitBtn">
                            <span id="submitText"><?php echo $translations['submit']; ?> Report</span>
                            <span id="submitSpinner" class="spinner" style="display: none;"></span>
                        </button>
                        <button type="button" onclick="clearForm()" class="btn btn-outline">Clear Form</button>
                    </div>
                    
                    <div class="escalation-info">
                        <h4>Need Immediate Assistance?</h4>
                        <div class="escalation-links">
                            <a href="https://cyber999.gov.my" target="_blank" class="escalation-btn">
                                <img src="assets/images/cyber999-logo.png" alt="Cyber999">
                                <div>
                                    <strong>Cyber999</strong>
                                    <span>National cybersecurity helpline</span>
                                </div>
                            </a>
                            <a href="https://www.rmp.gov.my/e-reporting" target="_blank" class="escalation-btn">
                                <img src="assets/images/pdrm-logo.png" alt="PDRM">
                                <div>
                                    <strong>PDRM e-Reporting</strong>
                                    <span>Royal Malaysia Police</span>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </form>
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
    <script src="assets/js/report-incident.js"></script>
    <script src="assets/js/petronas-animations.js"></script>
</body>
</html>
