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

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['submit_report'])) {
    // CSRF token validation
    if (!validateCSRFToken($_POST['csrf_token'] ?? '')) {
        $error = 'Invalid security token. Please try again.';
    } else {
        // Process the incident report
        $result = processIncidentReport($_POST, $_FILES);
        if ($result['success']) {
            $success = $result['message'];
            $reportId = $result['report_id'];
        } else {
            $error = $result['message'];
        }
    }
}

function processIncidentReport($postData, $files) {
    try {
        // Validate required fields
        $requiredFields = ['incident_type', 'title', 'description'];
        foreach ($requiredFields as $field) {
            if (empty($postData[$field])) {
                return ['success' => false, 'message' => "Please fill in all required fields."];
            }
        }
        
        // Rate limiting
        if (!checkRateLimit('incident_report', 5, 3600)) {
            return ['success' => false, 'message' => 'Rate limit exceeded. Please wait before submitting another report.'];
        }
        
        // Process evidence files
        $evidenceFiles = [];
        $deepfakeResults = [];
        
        if (!empty($files['evidence_files']['name'][0])) {
            $uploadDir = 'uploads/evidence/' . date('Y/m/d') . '/';
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            for ($i = 0; $i < count($files['evidence_files']['name']); $i++) {
                if ($files['evidence_files']['error'][$i] === UPLOAD_ERR_OK) {
                    $file = [
                        'name' => $files['evidence_files']['name'][$i],
                        'tmp_name' => $files['evidence_files']['tmp_name'][$i],
                        'size' => $files['evidence_files']['size'][$i],
                        'type' => $files['evidence_files']['type'][$i]
                    ];
                    
                    // Validate file
                    $validation = validateEvidenceFile($file);
                    if (!$validation['valid']) {
                        return ['success' => false, 'message' => $validation['message']];
                    }
                    
                    // Save file
                    $fileName = uniqid() . '_' . basename($file['name']);
                    $filePath = $uploadDir . $fileName;
                    
                    if (move_uploaded_file($file['tmp_name'], $filePath)) {
                        $evidenceFiles[] = [
                            'original_name' => $file['name'],
                            'stored_name' => $fileName,
                            'path' => $filePath,
                            'size' => $file['size'],
                            'type' => $file['type']
                        ];
                        
                        // Run deepfake detection on images/videos
                        if (in_array($file['type'], ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/avi'])) {
                            try {
                                require_once 'api/sightengine.php';
                                $sightengine = new SightengineAPI();
                                $results = $sightengine->analyzeFile($filePath);
                                $detection = $sightengine->processDetection($filePath, $results);
                                $deepfakeResults[] = $detection;
                            } catch (Exception $e) {
                                error_log("Deepfake analysis error: " . $e->getMessage());
                            }
                        }
                    }
                }
            }
        }
        
        // Check for OSINT matches (fake data)
        $osintMatches = checkOSINTMatches($postData['description'], $postData['incident_type']);
        
        // Determine priority based on incident type and deepfake results
        $priority = determinePriority($postData['incident_type'], $deepfakeResults, $osintMatches);
        
        // Generate fake report ID
        $reportId = rand(100000, 999999);
        
        // Fake log
        logAudit('incident_report_submitted', 'reports', $reportId, null, [
            'incident_type' => $postData['incident_type'],
            'priority' => $priority,
            'evidence_count' => count($evidenceFiles),
            'deepfake_detected' => !empty(array_filter($deepfakeResults, fn($r) => $r['analysis']['is_deepfake']))
        ]);
        
        return [
            'success' => true, 
            'message' => translateText('report_submitted') . ' (No database - fake data)',
            'report_id' => $reportId
        ];
        
    } catch (Exception $e) {
        error_log("Report processing error: " . $e->getMessage());
        return ['success' => false, 'message' => 'An error occurred while processing your report. Please try again.'];
    }
}

function validateEvidenceFile($file) {
    $allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
        'application/pdf', 'text/plain', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!in_array($file['type'], $allowedTypes)) {
        return [
            'valid' => false, 
            'message' => 'Invalid file type. Please upload images, videos, or documents only.'
        ];
    }
    
    if ($file['size'] > MAX_UPLOAD_SIZE) {
        return [
            'valid' => false, 
            'message' => translateText('file_too_large')
        ];
    }
    
    return ['valid' => true];
}

function checkOSINTMatches($description, $incidentType) {
    global $fake_osint_data;
    
    // Simple keyword matching against fake OSINT data
    $keywords = extractKeywords($description . ' ' . $incidentType);
    
    if (empty($keywords)) {
        return [];
    }
    
    $matches = [];
    foreach ($fake_osint_data as $osint) {
        foreach ($keywords as $keyword) {
            if (stripos($osint['content'], $keyword) !== false) {
                $matches[] = [
                    'id' => $osint['id'],
                    'source' => $osint['source'],
                    'content' => $osint['content'],
                    'threat_level' => $osint['threat_level'],
                    'location' => $osint['location'],
                    'collected_at' => $osint['collected_at']
                ];
                break;
            }
        }
    }
    
    return array_slice($matches, 0, 5);
}

function extractKeywords($text) {
    $text = strtolower($text);
    $stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an'];
    
    $words = preg_split('/\s+/', $text);
    $keywords = array_filter($words, function($word) use ($stopWords) {
        return strlen($word) > 3 && !in_array($word, $stopWords);
    });
    
    return array_unique(array_slice($keywords, 0, 10));
}

function determinePriority($incidentType, $deepfakeResults, $osintMatches) {
    $score = 0;
    
    // Base score by incident type
    $typeScores = [
        'phishing' => 2,
        'scam' => 2,
        'deepfake' => 3,
        'identity_theft' => 3,
        'malware' => 3,
        'other' => 1
    ];
    
    $score += $typeScores[$incidentType] ?? 1;
    
    // Increase score if deepfake detected
    foreach ($deepfakeResults as $result) {
        if ($result['analysis']['is_deepfake']) {
            $score += 2;
            break;
        }
    }
    
    // Increase score if matches high-priority OSINT threats
    foreach ($osintMatches as $match) {
        if (in_array($match['threat_level'], ['high', 'critical'])) {
            $score += 1;
            break;
        }
    }
    
    // Convert score to priority
    if ($score >= 6) return 'critical';
    if ($score >= 4) return 'high';
    if ($score >= 2) return 'medium';
    return 'low';
}

function sendPriorityNotification($reportId, $priority) {
    // In production, this would send email/SMS notifications to investigators
    error_log("Priority notification: Report $reportId has $priority priority");
}
?>
<!DOCTYPE html>
<html lang="<?php echo $lang; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $translations['report_incident']; ?> - VeriDeep</title>
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
                    <span class="platform-name">VeriDeep</span>
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
                
                <!-- Contact Information (for non-logged in users) -->
                <?php if (!isLoggedIn()): ?>
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
                <?php endif; ?>
                
                <!-- Privacy and Consent -->
                <div class="form-section">
                    <h3>Privacy & Consent</h3>
                    
                    <div class="consent-checkboxes">
                        <label class="checkbox-label">
                            <input type="checkbox" name="consent_investigation" required>
                            <span class="checkmark"></span>
                            <span class="checkbox-text">I consent to PETRONAS investigating this incident and sharing necessary information with relevant authorities</span>
                        </label>
                        
                        <label class="checkbox-label">
                            <input type="checkbox" name="consent_contact" required>
                            <span class="checkmark"></span>
                            <span class="checkbox-text">I consent to being contacted regarding this incident for investigation purposes</span>
                        </label>
                        
                        <label class="checkbox-label">
                            <input type="checkbox" name="consent_data">
                            <span class="checkmark"></span>
                            <span class="checkbox-text">I consent to anonymous data from this report being used for cybersecurity research and threat intelligence</span>
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
