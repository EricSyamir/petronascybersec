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
    <title>Scammer Database - PETRONAS Cybercrime Platform</title>
    <link rel="stylesheet" href="assets/css/petronas-master.css">
    <link rel="icon" type="image/svg+xml" href="<?php echo $baseUrl; ?>/assets/images/shield-icon.svg">
    <link rel="icon" type="image/x-icon" href="<?php echo $baseUrl; ?>/assets/images/shield-icon.svg">
    <link rel="shortcut icon" type="image/svg+xml" href="<?php echo $baseUrl; ?>/assets/images/shield-icon.svg">
    <link rel="apple-touch-icon" href="<?php echo $baseUrl; ?>/assets/images/shield-icon.svg">
    <meta name="description" content="Search the public database of reported scammers and cybercriminals. Protect yourself and others from online fraud.">
    <meta name="keywords" content="scammer, fraud, cybercrime, malaysia, petronas, search, database">
</head>
<body>
    <header class="main-header">
        <nav class="navbar">
            <div class="nav-container">
                <div class="logo">
                    <img src="<?php echo $baseUrl; ?>/petronas.png" alt="PETRONAS" class="logo-img" onerror="this.src='<?php echo $baseUrl; ?>/assets/images/shield-icon.svg'; this.onerror=null;">
                    <span class="platform-name">PETRONAS Cybercrime Platform</span>
                </div>
                <div class="nav-links">
                    <a href="index.php" class="nav-link">Home</a>
                    <a href="public-dashboard.php" class="nav-link active">Scammer Database</a>
                    <a href="deepfake-scanner.php" class="nav-link">Deepfake Scanner</a>
                    <a href="osint-monitor.php" class="nav-link">OSINT Monitor</a>
                    <a href="report-incident.php" class="nav-link">Report Incident</a>
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
            <!-- Page Header -->
            <div class="page-header">
                <h1>Public Scammer & Data Breach Database</h1>
                <p>Search our database of reported scammers, cybercriminals and data breaches. Help protect yourself and others from online fraud.</p>
            </div>

            <!-- Statistics Dashboard -->
            <div class="stats-section" id="statsSection">
                <h2>📊 Database Statistics</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">🎯</div>
                        <div class="stat-content">
                            <h3 id="totalScammers">Loading...</h3>
                            <p>Total Reported Scammers</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">✅</div>
                        <div class="stat-content">
                            <h3 id="verifiedScammers">Loading...</h3>
                            <p>Verified Reports</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📈</div>
                        <div class="stat-content">
                            <h3 id="recentReports">Loading...</h3>
                            <p>Reports This Month</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🔥</div>
                        <div class="stat-content">
                            <h3 id="highThreat">Loading...</h3>
                            <p>High Threat Level</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Data Breach Checker Section -->
            <div class="breach-checker-section">
                <h2>🔐 Check Data Breach (Powered by HIBP)</h2>
                <p class="section-description">Check if your email address has been compromised in known data breaches from HaveIBeenPwned.com.</p>
                
                <div class="breach-checker-container">
                    <div class="breach-input-group">
                        <input type="email" 
                               id="breachEmailInput" 
                               placeholder="Enter email address to check..." 
                               class="breach-input"
                               autocomplete="off">
                        <button id="checkBreachBtn" class="breach-check-btn">
                            <span class="check-icon">🔍</span>
                            Check Breach
                        </button>
                    </div>
                    
                    <div class="breach-results" id="breachResults" style="display: none;">
                        <div class="breach-alert" id="breachAlert">
                            <h3 id="breachAlertTitle">⚠️ Breach Detected</h3>
                            <p id="breachAlertMessage">Your email address has been found in data breaches.</p>
                        </div>
                        
                        <div class="breach-list" id="breachList">
                            <!-- Breach results will be populated here -->
                        </div>
                    </div>
                    
                    <div class="breach-loading" id="breachLoading" style="display: none;">
                        <div class="spinner"></div>
                        <p>Checking data breaches...</p>
                    </div>
                </div>
            </div>

            <!-- Search Section -->
            <div class="search-section">
                <h2>🔍 Search Scammer Database</h2>
                
                <div class="search-container">
                    <div class="search-input-group">
                        <input type="text" 
                               id="searchInput" 
                               placeholder="Enter phone number or bank account to search..." 
                               class="search-input"
                               autocomplete="off">
                        <select id="searchType" class="search-type-select">
                            <option value="all">All Fields</option>
                            <option value="phone">Phone Number</option>
                            <option value="website">Bank Account</option>
                        </select>
                        <button id="searchBtn" class="search-btn">
                            <span class="search-icon">🔍</span>
                            Search
                        </button>
                    </div>
                    
                    <div class="search-tips">
                        <p><strong>Search Tips:</strong> Search for phone numbers or bank accounts from our database. Partial matches work (e.g., "011" to find phone numbers starting with 011). Minimum 3 characters required.</p>
                    </div>
                </div>

                <!-- Advanced Filters -->
                <div class="filters-section" id="filtersSection" style="display: none;">
                    <h3>🎛️ Advanced Filters</h3>
                    <div class="filters-grid">
                        <div class="filter-group">
                            <label for="scamTypeFilter">Scam Type:</label>
                            <select id="scamTypeFilter" class="filter-select">
                                <option value="">All Types</option>
                                <option value="phishing">Phishing</option>
                                <option value="romance">Romance Scam</option>
                                <option value="investment">Investment Fraud</option>
                                <option value="lottery">Lottery Scam</option>
                                <option value="job">Job Scam</option>
                                <option value="shopping">Shopping Fraud</option>
                                <option value="cryptocurrency">Crypto Scam</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label for="threatLevelFilter">Threat Level:</label>
                            <select id="threatLevelFilter" class="filter-select">
                                <option value="">All Levels</option>
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label for="verificationFilter">Verification:</label>
                            <select id="verificationFilter" class="filter-select">
                                <option value="">All Status</option>
                                <option value="verified">Verified</option>
                                <option value="pending">Pending</option>
                                <option value="unverified">Unverified</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="filter-actions">
                        <button id="applyFiltersBtn" class="btn btn-primary">Apply Filters</button>
                        <button id="clearFiltersBtn" class="btn btn-outline">Clear Filters</button>
                    </div>
                </div>
                
                <button id="toggleFiltersBtn" class="toggle-filters-btn">
                    <span id="filtersToggleText">Show Advanced Filters</span> ⚙️
                </button>
            </div>

            <!-- Search Results -->
            <div class="results-section" id="resultsSection" style="display: none;">
                <div class="results-header">
                    <h2 id="resultsTitle">Search Results</h2>
                    <div class="results-info">
                        <span id="resultsCount">0 results</span>
                        <button id="exportBtn" class="export-btn" style="display: none;">📥 Export Results</button>
                    </div>
                </div>
                
                <!-- Results Grid -->
                <div class="results-grid" id="resultsGrid">
                    <!-- Results will be populated here -->
                </div>
                
                <!-- Pagination -->
                <div class="pagination" id="pagination" style="display: none;">
                    <button id="prevPageBtn" class="page-btn" disabled>← Previous</button>
                    <span id="pageInfo">Page 1 of 1</span>
                    <button id="nextPageBtn" class="page-btn" disabled>Next →</button>
                </div>
                
                <!-- No Results Message -->
                <div class="no-results" id="noResults" style="display: none;">
                    <div class="no-results-content">
                        <h3>🔍 No Results Found</h3>
                        <p>We couldn't find any scammers matching your search criteria.</p>
                        <div class="no-results-suggestions">
                            <h4>Try:</h4>
                            <ul>
                                <li>Using different keywords</li>
                                <li>Checking your spelling</li>
                                <li>Using partial matches (e.g., domain names)</li>
                                <li>Broadening your search criteria</li>
                            </ul>
                        </div>
                        <div class="no-results-actions">
                            <a href="report-incident.php" class="btn btn-primary">Report New Scammer</a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- How to Report Section -->
            <div class="report-section">
                <h2>📝 How to Report a Scammer</h2>
                <div class="report-steps">
                    <div class="step-card">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <h3>Gather Evidence</h3>
                            <p>Collect screenshots, emails, phone numbers, and any other evidence of the scam.</p>
                        </div>
                    </div>
                    
                    <div class="step-card">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <h3>Report to Authorities</h3>
                            <p>File an official report with Cyber999 or PDRM for legal action.</p>
                        </div>
                    </div>
                    
                    <div class="step-card">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <h3>Share with Community</h3>
                            <p>Submit details to our database to warn others about the scammer.</p>
                        </div>
                    </div>
                </div>
                
                <div class="report-actions">
                    <a href="report-incident.php" class="btn btn-primary btn-large">Report a Scammer</a>
                    <a href="https://cyber999.gov.my" target="_blank" class="btn btn-outline">Visit Cyber999</a>
                </div>
            </div>

            <!-- Safety Tips -->
            <div class="safety-section">
                <h2>🛡️ Stay Safe Online</h2>
                <div class="safety-tips">
                    <div class="tip-card">
                        <div class="tip-icon">🚫</div>
                        <h3>Never Send Money</h3>
                        <p>Legitimate organizations never ask for upfront payments or personal banking details via email or phone.</p>
                    </div>
                    
                    <div class="tip-card">
                        <div class="tip-icon">🔍</div>
                        <h3>Verify Identities</h3>
                        <p>Always verify the identity of people requesting money or personal information through official channels.</p>
                    </div>
                    
                    <div class="tip-card">
                        <div class="tip-icon">⏰</div>
                        <h3>Don't Rush</h3>
                        <p>Scammers create urgency to pressure you. Take time to think and consult with trusted friends or family.</p>
                    </div>
                    
                    <div class="tip-card">
                        <div class="tip-icon">🔒</div>
                        <h3>Protect Personal Info</h3>
                        <p>Never share passwords, IC numbers, or banking details with unsolicited contacts.</p>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <footer class="main-footer">
        <div class="footer-content">
            <p>&copy; 2025 SecureTech. All rights reserved. This database is provided for public safety and educational purposes.</p>
            <div class="footer-links">
                <a href="privacy-policy.php">Privacy Policy</a>
                <a href="terms-of-service.php">Terms of Service</a>
                <a href="report-incident.php">Report Incident</a>
            </div>
        </div>
    </footer>

    <!-- Scammer Detail Modal -->
    <div class="modal" id="scammerModal" style="display: none;">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modalTitle">Scammer Details</h3>
                <button class="modal-close" id="modalClose">&times;</button>
            </div>
            <div class="modal-body" id="modalBody">
                <!-- Scammer details will be populated here -->
            </div>
            <div class="modal-footer">
                <button id="reportSimilarBtn" class="btn btn-primary">Report Similar Scammer</button>
                <button id="modalCloseBtn" class="btn btn-outline">Close</button>
            </div>
        </div>
    </div>

    <script src="assets/js/anime.min.js"></script>
    <script src="assets/js/main.js"></script>
    <script src="assets/js/language-toggle.js"></script>
    <script src="assets/js/public-dashboard.js"></script>
    <script src="assets/js/petronas-animations.js"></script>
    <script src="assets/js/deepfake-animations.js"></script>
</body>
</html>
