<?php
session_start();
require_once 'includes/language.php';

// Public access - no login required for OSINT tools
$lang = getCurrentLanguage();
$translations = loadLanguage($lang);

// Mock functions for removed authentication
function isLoggedIn() {
    return false;
}

function hasPermission($permission) {
    return false;
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
                <!-- Sidebar: Cases & Quick Actions (Only visible if logged in as investigator/admin) -->
                <?php if (isLoggedIn() && hasPermission('manage_investigations')): ?>
                <div class="dashboard-sidebar">
                    <div class="sidebar-section">
                        <h3>Investigation Cases</h3>
                        <button type="button" onclick="showCreateCaseModal()" class="btn btn-primary btn-sm btn-block">
                            <span>➕</span> New Case
                        </button>
                        <div class="cases-list" id="casesList">
                            <!-- Cases will be loaded here -->
                        </div>
                    </div>
                    
                    <div class="sidebar-section">
                        <h3>Quick Actions</h3>
                        <div class="quick-actions-list">
                            <button type="button" onclick="showSavedQueries()" class="action-item">
                                <span>📋</span> Saved Queries
                            </button>
                            <button type="button" onclick="exportInvestigation()" class="action-item">
                                <span>💾</span> Export Data
                            </button>
                            <button type="button" onclick="generateReport()" class="action-item">
                                <span>📊</span> Generate Report
                            </button>
                        </div>
                    </div>
                    
                    <div class="sidebar-section">
                        <h3>Active Case</h3>
                        <div id="activeCaseInfo" class="active-case-info">
                            <p class="no-case">No case selected</p>
                        </div>
                    </div>
                </div>
                <?php endif; ?>

                <!-- Main Content Area -->
                <div class="dashboard-main <?php echo (isLoggedIn() && hasPermission('manage_investigations')) ? '' : 'full-width'; ?>">
                    <!-- OSINT Tools Tabs -->
                    <div class="osint-tabs">
                        <div class="tabs-header">
                            <button type="button" class="tab-btn active" onclick="switchTab('threat-monitoring')" data-tab="threat-monitoring">
                                <span class="tab-icon">🚨</span>
                                <span>Threat Monitoring</span>
                            </button>
                            <button type="button" class="tab-btn" onclick="switchTab('semak-mule')" data-tab="semak-mule">
                                <span class="tab-icon">🔍</span>
                                <span>Semak Mule</span>
                            </button>
                            <button type="button" class="tab-btn" onclick="switchTab('email-checker')" data-tab="email-checker">
                                <span class="tab-icon">📧</span>
                                <span>Email Checker</span>
                            </button>
                            <button type="button" class="tab-btn" onclick="switchTab('username-checker')" data-tab="username-checker">
                                <span class="tab-icon">👤</span>
                                <span>Username Checker</span>
                            </button>
                            <button type="button" class="tab-btn" onclick="switchTab('breach-checker')" data-tab="breach-checker">
                                <span class="tab-icon">🔐</span>
                                <span>Breach Checker</span>
                            </button>
                        </div>

                <!-- Threat Monitoring Tab -->
                <div class="tab-content active" id="tab-threat-monitoring">
                    <div class="tab-header-actions">
                        <button type="button" onclick="collectThreats()" class="btn btn-primary" id="collectBtn">
                            <span class="spinner" id="collectSpinner" style="display: none;"></span>
                            Collect Latest Threats
                        </button>
                        <button type="button" onclick="exportData()" class="btn btn-secondary">Export Data</button>
                    </div>

            <!-- Real-time Stats -->
            <div class="stats-grid">
                <div class="stat-card critical">
                    <div class="stat-icon">🚨</div>
                    <div class="stat-content">
                        <h3 id="criticalCount">-</h3>
                        <p><?php echo $translations['critical']; ?> Threats</p>
                        <small id="criticalChange">Last 24h</small>
                    </div>
                </div>
                <div class="stat-card high">
                    <div class="stat-icon">⚠️</div>
                    <div class="stat-content">
                        <h3 id="highCount">-</h3>
                        <p><?php echo $translations['high']; ?> Priority</p>
                        <small id="highChange">Last 24h</small>
                    </div>
                </div>
                <div class="stat-card medium">
                    <div class="stat-icon">📊</div>
                    <div class="stat-content">
                        <h3 id="totalCount">-</h3>
                        <p>Total Threats</p>
                        <small id="totalChange">Last 24h</small>
                    </div>
                </div>
                <div class="stat-card sources">
                    <div class="stat-icon">🔍</div>
                    <div class="stat-content">
                        <h3 id="sourcesCount">12</h3>
                        <p>Active Sources</p>
                        <small>Social Media, Forums, News</small>
                    </div>
                </div>
            </div>

            <!-- Search and Filters -->
            <div class="search-section">
                <div class="search-container">
                    <div class="search-input-group">
                        <input type="text" id="keywordSearch" placeholder="Search by keywords (e.g., phishing, scam, malware)" class="form-input">
                        <button type="button" onclick="searchThreats()" class="btn btn-secondary">Search</button>
                    </div>
                    <div class="filters-group">
                        <select id="threatLevelFilter" class="form-select">
                            <option value=""><?php echo $translations['threat_level']; ?> - All</option>
                            <option value="critical"><?php echo $translations['critical']; ?></option>
                            <option value="high"><?php echo $translations['high']; ?></option>
                            <option value="medium"><?php echo $translations['medium']; ?></option>
                            <option value="low"><?php echo $translations['low']; ?></option>
                        </select>
                        <select id="timeframeFilter" class="form-select">
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                        </select>
                        <button type="button" onclick="clearFilters()" class="btn btn-outline">Clear Filters</button>
                    </div>
                </div>
            </div>

            <!-- Dashboard Grid -->
            <div class="dashboard-grid">
                <!-- Threat Map -->
                <div class="dashboard-card map-card">
                    <div class="card-header">
                        <h3>Malaysia Threat Map</h3>
                        <div class="card-controls">
                            <button type="button" onclick="refreshMap()" class="control-btn">🔄</button>
                            <button type="button" onclick="toggleMapView()" class="control-btn">🗺️</button>
                        </div>
                    </div>
                    <div class="card-content">
                        <div id="threatMap" class="threat-map"></div>
                        <div class="map-legend">
                            <div class="legend-item critical"><span class="legend-dot"></span> Critical</div>
                            <div class="legend-item high"><span class="legend-dot"></span> High</div>
                            <div class="legend-item medium"><span class="legend-dot"></span> Medium</div>
                            <div class="legend-item low"><span class="legend-dot"></span> Low</div>
                        </div>
                    </div>
                </div>

                <!-- Threat Trends Chart -->
                <div class="dashboard-card chart-card">
                    <div class="card-header">
                        <h3>Threat Trends</h3>
                        <div class="card-controls">
                            <select id="chartTimeframe" onchange="updateChart()">
                                <option value="24h">24 Hours</option>
                                <option value="7d">7 Days</option>
                                <option value="30d">30 Days</option>
                            </select>
                        </div>
                    </div>
                    <div class="card-content">
                        <canvas id="threatChart"></canvas>
                    </div>
                </div>

                <!-- Trending Keywords -->
                <div class="dashboard-card keywords-card">
                    <div class="card-header">
                        <h3>Trending Keywords</h3>
                        <small><?php echo $translations['last_updated']; ?>: <span id="keywordsUpdated">-</span></small>
                    </div>
                    <div class="card-content">
                        <div id="trendingKeywords" class="keywords-cloud">
                            <!-- Keywords will be populated here -->
                        </div>
                    </div>
                </div>

                <!-- Recent Threats -->
                <div class="dashboard-card threats-card">
                    <div class="card-header">
                        <h3>Recent Threats</h3>
                        <div class="card-controls">
                            <button type="button" onclick="refreshThreats()" class="control-btn">🔄</button>
                            <button type="button" onclick="toggleThreatView()" class="control-btn">📋</button>
                        </div>
                    </div>
                    <div class="card-content">
                        <div id="threatsList" class="threats-list">
                            <!-- Threats will be populated here -->
                        </div>
                        <div class="load-more-container">
                            <button type="button" onclick="loadMoreThreats()" class="btn btn-outline" id="loadMoreBtn">Load More</button>
                        </div>
                    </div>
                </div>

                <!-- Source Monitor -->
                <div class="dashboard-card sources-card">
                    <div class="card-header">
                        <h3>Source Monitor</h3>
                        <small>Malaysian Cybersecurity Sources</small>
                    </div>
                    <div class="card-content">
                        <div class="sources-list">
                            <div class="source-item active">
                                <span class="source-dot online"></span>
                                <span class="source-name">Facebook Malaysia Cybersecurity</span>
                                <span class="source-count">12</span>
                            </div>
                            <div class="source-item active">
                                <span class="source-dot online"></span>
                                <span class="source-name">Lowyat.NET Forums</span>
                                <span class="source-count">8</span>
                            </div>
                            <div class="source-item active">
                                <span class="source-dot online"></span>
                                <span class="source-name">Twitter @CyberSecurityMY</span>
                                <span class="source-count">15</span>
                            </div>
                            <div class="source-item active">
                                <span class="source-dot online"></span>
                                <span class="source-name">Cyber999 Official</span>
                                <span class="source-count">5</span>
                            </div>
                            <div class="source-item">
                                <span class="source-dot offline"></span>
                                <span class="source-name">Cari.com.my</span>
                                <span class="source-count">0</span>
                            </div>
                            <div class="source-item active">
                                <span class="source-dot online"></span>
                                <span class="source-name">Malaysian News Sources</span>
                                <span class="source-count">6</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="dashboard-card actions-card">
                    <div class="card-header">
                        <h3>Quick Actions</h3>
                    </div>
                    <div class="card-content">
                        <div class="actions-grid">
                            <button type="button" onclick="createAlert()" class="action-btn">
                                <span class="action-icon">🚨</span>
                                <span>Create Alert</span>
                            </button>
                            <button type="button" onclick="generateReport()" class="action-btn">
                                <span class="action-icon">📊</span>
                                <span>Generate Report</span>
                            </button>
                            <button type="button" onclick="exportThreats()" class="action-btn">
                                <span class="action-icon">💾</span>
                                <span>Export Data</span>
                            </button>
                            <button type="button" onclick="escalateToAgency()" class="action-btn">
                                <span class="action-icon">📤</span>
                                <span>Escalate</span>
                            </button>
                        </div>
                        <div class="escalation-links">
                            <a href="https://cyber999.gov.my" target="_blank" class="escalation-link">
                                <img src="assets/images/cyber999-logo.png" alt="Cyber999">
                                <span>Report to Cyber999</span>
                            </a>
                            <a href="https://www.rmp.gov.my/e-reporting" target="_blank" class="escalation-link">
                                <img src="assets/images/pdrm-logo.png" alt="PDRM">
                                <span>PDRM e-Reporting</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

                    <!-- PDPA Compliance Notice -->
                    <div class="compliance-notice">
                        <h4>Data Privacy & Compliance</h4>
                        <p>This OSINT monitoring system complies with Malaysia's Personal Data Protection Act (PDPA) and PETRONAS data governance policies. All collected data is from publicly available sources and is processed securely.</p>
                    </div>
                </div>

                <!-- Semak Mule Tab -->
                <div class="tab-content" id="tab-semak-mule">
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

                <!-- Username Checker Tab -->
                <div class="tab-content" id="tab-username-checker">
                    <div class="osint-tool-section">
                        <h2>Username Checker (Mr.Holmes)</h2>
                        <p class="tool-description">Check username availability and existence across multiple social media platforms using Mr.Holmes.</p>
                        
                        <div class="tool-input-section">
                            <div class="input-group">
                                <label>Username</label>
                                <input type="text" id="usernameCheckInput" class="form-input" placeholder="username">
                            </div>
                            <button type="button" onclick="checkUsername()" class="btn btn-primary">Check Username</button>
                        </div>
                        
                        <div id="usernameCheckResults" class="tool-results"></div>
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

    <!-- Create Case Modal (Only for logged-in investigators) -->
    <?php if (isLoggedIn() && hasPermission('manage_investigations')): ?>
    <div id="createCaseModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Create New Investigation Case</h3>
                <button type="button" onclick="closeCreateCaseModal()" class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <form id="createCaseForm">
                    <div class="form-group">
                        <label>Case Title *</label>
                        <input type="text" id="caseTitle" class="form-input" required placeholder="e.g., Phishing Campaign Investigation">
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="caseDescription" class="form-input" rows="4" placeholder="Brief description of the investigation"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Priority</label>
                        <select id="casePriority" class="form-select">
                            <option value="low">Low</option>
                            <option value="medium" selected>Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" onclick="createCase()" class="btn btn-primary">Create Case</button>
                <button type="button" onclick="closeCreateCaseModal()" class="btn btn-outline">Cancel</button>
            </div>
        </div>
    </div>

    </div>
    <?php endif; ?>

    <!-- Case Details Modal (Only for logged-in investigators) -->
    <?php if (isLoggedIn() && hasPermission('manage_investigations')): ?>
    <div id="caseDetailsModal" class="modal">
        <div class="modal-content modal-large">
            <div class="modal-header">
                <h3 id="caseDetailsTitle">Case Details</h3>
                <button type="button" onclick="closeCaseDetailsModal()" class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="case-details-tabs">
                    <button type="button" class="detail-tab active" onclick="showCaseTab('overview')">Overview</button>
                    <button type="button" class="detail-tab" onclick="showCaseTab('evidence')">Evidence</button>
                    <button type="button" class="detail-tab" onclick="showCaseTab('notes')">Notes</button>
                    <button type="button" class="detail-tab" onclick="showCaseTab('timeline')">Timeline</button>
                </div>
                
                <div id="caseOverviewTab" class="case-tab-content active">
                    <div id="caseOverviewContent"></div>
                </div>
                
                <div id="caseEvidenceTab" class="case-tab-content">
                    <div id="caseEvidenceContent"></div>
                </div>
                
                <div id="caseNotesTab" class="case-tab-content">
                    <div id="caseNotesContent"></div>
                </div>
                
                <div id="caseTimelineTab" class="case-tab-content">
                    <div id="caseTimelineContent"></div>
                </div>
            </div>
        </div>
    </div>

    </div>
    <?php endif; ?>

    <!-- Save Query Modal (Only for logged-in investigators) -->
    <?php if (isLoggedIn() && hasPermission('manage_investigations')): ?>
    <div id="saveQueryModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Save OSINT Query</h3>
                <button type="button" onclick="closeSaveQueryModal()" class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <form id="saveQueryForm">
                    <div class="form-group">
                        <label>Link to Case (Optional)</label>
                        <select id="queryCaseId" class="form-select">
                            <option value="">No case</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Notes</label>
                        <textarea id="queryNotes" class="form-input" rows="3" placeholder="Add notes about this query"></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" onclick="saveCurrentQuery()" class="btn btn-primary">Save Query</button>
                <button type="button" onclick="closeSaveQueryModal()" class="btn btn-outline">Cancel</button>
            </div>
        </div>
    </div>
    <?php endif; ?>
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
