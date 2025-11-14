<?php
// FAKE DATA CONFIGURATION - NO DATABASE REQUIRED
// All database functionality has been replaced with static/mock data

// Security settings
// Use environment variables if available (for Render/cloud deployment), otherwise use defaults
define('ENCRYPTION_KEY', getenv('ENCRYPTION_KEY') ?: 'petronas_secure_key_2024');
define('SESSION_TIMEOUT', 3600); // 1 hour
define('MAX_UPLOAD_SIZE', 50 * 1024 * 1024); // 50MB

// Sightengine API Configuration (KEPT - External API)
// Use environment variables if available (for Render/cloud deployment), otherwise use defaults
define('SIGHTENGINE_API_USER', getenv('SIGHTENGINE_API_USER') ?: '1931720966');
define('SIGHTENGINE_API_SECRET', getenv('SIGHTENGINE_API_SECRET') ?: 'Ey7EbcJMjAtQZDiD38xLtyXvJrqpCVmw');
define('SIGHTENGINE_API_URL', 'https://api.sightengine.com/1.0/check.json');

// OSINT Configuration
define('OSINT_UPDATE_INTERVAL', 300); // 5 minutes
define('OSINT_DATA_RETENTION', 86400 * 30); // 30 days

// No PDO connection - using fake data instead
$pdo = null;

// FAKE DATA ARRAYS
$GLOBALS['fake_scammers'] = [
    [
        'id' => 1,
        'scammer_email' => 'sc***er@example.com',
        'scammer_phone' => '011-***-4567',
        'scammer_website' => 'fake-petronas-job.com',
        'scammer_social_media' => json_encode(['facebook' => 'fakerecruitment', 'telegram' => '@scammer123']),
        'scam_type' => 'job',
        'description' => 'Fake PETRONAS recruitment scam. Requesting payment for job application processing.',
        'verification_status' => 'verified',
        'threat_level' => 'high',
        'location' => 'Kuala Lumpur',
        'first_reported' => date('Y-m-d H:i:s', strtotime('-10 days')),
        'last_updated' => date('Y-m-d H:i:s', strtotime('-2 days')),
        'report_count' => 15,
        'is_active' => true
    ],
    [
        'id' => 2,
        'scammer_email' => 'inv***@gmail.com',
        'scammer_phone' => '012-***-8901',
        'scammer_website' => 'quick-crypto-profits.net',
        'scammer_social_media' => json_encode(['whatsapp' => '0128888901', 'instagram' => '@cryptoinvestor']),
        'scam_type' => 'cryptocurrency',
        'description' => 'Cryptocurrency investment scam promising 500% returns in 30 days.',
        'verification_status' => 'verified',
        'threat_level' => 'critical',
        'location' => 'Selangor',
        'first_reported' => date('Y-m-d H:i:s', strtotime('-30 days')),
        'last_updated' => date('Y-m-d H:i:s', strtotime('-1 day')),
        'report_count' => 42,
        'is_active' => true
    ],
    [
        'id' => 3,
        'scammer_email' => 'ban***@hotmail.com',
        'scammer_phone' => '013-***-2345',
        'scammer_website' => null,
        'scammer_social_media' => json_encode(['telegram' => '@bankhelper']),
        'scam_type' => 'phishing',
        'description' => 'Fake bank SMS claiming account suspension. Asking for TAC codes.',
        'verification_status' => 'verified',
        'threat_level' => 'high',
        'location' => 'Johor',
        'first_reported' => date('Y-m-d H:i:s', strtotime('-5 days')),
        'last_updated' => date('Y-m-d H:i:s', strtotime('-1 day')),
        'report_count' => 28,
        'is_active' => true
    ],
    [
        'id' => 4,
        'scammer_email' => 'lov***@yahoo.com',
        'scammer_phone' => '010-***-6789',
        'scammer_website' => null,
        'scammer_social_media' => json_encode(['facebook' => 'loveconnection2024']),
        'scam_type' => 'romance',
        'description' => 'Romance scam using fake military profile. Requesting money for emergency.',
        'verification_status' => 'pending',
        'threat_level' => 'medium',
        'location' => 'Penang',
        'first_reported' => date('Y-m-d H:i:s', strtotime('-15 days')),
        'last_updated' => date('Y-m-d H:i:s', strtotime('-3 days')),
        'report_count' => 8,
        'is_active' => true
    ],
    [
        'id' => 5,
        'scammer_email' => 'win***@gmail.com',
        'scammer_phone' => '019-***-1234',
        'scammer_website' => 'mega-lottery-winner.com',
        'scammer_social_media' => json_encode(['whatsapp' => '0191111234']),
        'scam_type' => 'lottery',
        'description' => 'Fake lottery winning notification. Claiming user won RM500,000.',
        'verification_status' => 'verified',
        'threat_level' => 'medium',
        'location' => 'Kuala Lumpur',
        'first_reported' => date('Y-m-d H:i:s', strtotime('-20 days')),
        'last_updated' => date('Y-m-d H:i:s', strtotime('-5 days')),
        'report_count' => 12,
        'is_active' => true
    ]
];

$GLOBALS['fake_osint_data'] = [
    [
        'id' => 1,
        'source' => 'Facebook Malaysia Cybersecurity Group',
        'content' => 'New phishing campaign targeting Malaysian bank customers. Fake SMS claiming account suspension. URLs: bank-security[.]net',
        'keywords' => json_encode(['phishing', 'bank', 'sms', 'maybank', 'account']),
        'threat_level' => 'high',
        'location' => 'Kuala Lumpur',
        'url' => 'https://facebook.com/groups/malaysiasec/posts/123456',
        'collected_at' => date('Y-m-d H:i:s', strtotime('-2 hours')),
        'verified' => true
    ],
    [
        'id' => 2,
        'source' => 'Twitter @CyberSecurityMY',
        'content' => 'Warning: Fake PETRONAS job recruitment emails circulating. Do not click suspicious links. Verify all job postings on official PETRONAS careers website only.',
        'keywords' => json_encode(['scam', 'petronas', 'recruitment', 'job', 'fake']),
        'threat_level' => 'high',
        'location' => 'Malaysia',
        'url' => 'https://twitter.com/CyberSecurityMY/status/123456',
        'collected_at' => date('Y-m-d H:i:s', strtotime('-4 hours')),
        'verified' => true
    ],
    [
        'id' => 3,
        'source' => 'Telegram Malaysia Cyber Alerts',
        'content' => 'Deepfake video of PM circulating on WhatsApp groups. Video quality analysis suggests AI generation. Do not spread unverified content.',
        'keywords' => json_encode(['deepfake', 'pm', 'whatsapp', 'ai', 'video']),
        'threat_level' => 'critical',
        'location' => 'Nationwide',
        'url' => 'https://t.me/malaysiasec/456',
        'collected_at' => date('Y-m-d H:i:s', strtotime('-1 hour')),
        'verified' => false
    ],
    [
        'id' => 4,
        'source' => 'Lowyat.NET Cybersecurity Forum',
        'content' => 'User reports credit card skimming device found at Pavilion KL shopping mall ATM. PDRM has been notified. Check ATM card readers carefully.',
        'keywords' => json_encode(['skimming', 'atm', 'credit card', 'pavilion', 'kl']),
        'threat_level' => 'high',
        'location' => 'Kuala Lumpur',
        'url' => 'https://lowyat.net/forums/topic/123456',
        'collected_at' => date('Y-m-d H:i:s', strtotime('-3 hours')),
        'verified' => true
    ],
    [
        'id' => 5,
        'source' => 'Cyber999 Official',
        'content' => 'High-priority alert: New malware strain targeting Malaysian government employees via email attachments. Exercise caution with .zip and .exe files.',
        'keywords' => json_encode(['malware', 'government', 'email', 'attachment', 'ransomware']),
        'threat_level' => 'critical',
        'location' => 'Malaysia',
        'url' => 'https://cyber999.gov.my/alerts/malware-2024-001',
        'collected_at' => date('Y-m-d H:i:s', strtotime('-1 hour')),
        'verified' => true
    ],
    [
        'id' => 6,
        'source' => 'The Star Online',
        'content' => 'Malaysian companies lose RM50 million to business email compromise (BEC) scams this year. FBI warns of increasing sophistication.',
        'keywords' => json_encode(['bec', 'business email', 'scam', 'corporate', 'fraud']),
        'threat_level' => 'high',
        'location' => 'Malaysia',
        'url' => 'https://thestar.com.my/tech/cybersecurity/bec-scams',
        'collected_at' => date('Y-m-d H:i:s', strtotime('-6 hours')),
        'verified' => true
    ]
];

$GLOBALS['fake_reports'] = [];
$GLOBALS['fake_deepfake_detections'] = [];
$GLOBALS['fake_investigation_cases'] = [];

// Helper functions returning fake data
function getTotalReports() {
    return 1247;
}

function getDeepfakesDetected() {
    return 89;
}

function getActiveThreats() {
    return 23;
}

function getTotalScammers() {
    global $fake_scammers;
    return count($fake_scammers);
}

function getVerifiedScammers() {
    global $fake_scammers;
    return count(array_filter($fake_scammers, function($s) {
        return $s['verification_status'] === 'verified';
    }));
}

// Fake database initialization (does nothing)
function initializeDatabase() {
    return true;
}

// Session management for fake user
if (!isset($_SESSION['db_initialized'])) {
    $_SESSION['db_initialized'] = true;
}
?>
