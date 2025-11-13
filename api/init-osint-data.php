<?php
/**
 * Initialize OSINT Database with Sample Data
 * This script populates the database with sample threat data for demonstration
 */

require_once '../config/database.php';

function initializeOSINTData() {
    global $pdo;
    
    // Sample threat data for Malaysia
    $sampleThreats = [
        // Critical threats
        [
            'source' => 'Cyber999 Official',
            'content' => 'URGENT: New ransomware variant "MalayLock" targeting Malaysian government agencies and businesses. Uses sophisticated encryption and demands payment in cryptocurrency.',
            'keywords' => json_encode(['ransomware', 'malware', 'encryption', 'cryptocurrency', 'government']),
            'threat_level' => 'critical',
            'location' => 'Putrajaya, Malaysia',
            'url' => 'https://cyber999.gov.my/alerts/2024/malaylock-ransomware',
            'collected_at' => date('Y-m-d H:i:s', strtotime('-1 hour'))
        ],
        [
            'source' => 'Telegram Malaysia Cyber Alerts',
            'content' => 'Deepfake video of PM making false economic statements circulating on WhatsApp groups. Video analysis suggests AI-generated content. Report immediately if encountered.',
            'keywords' => json_encode(['deepfake', 'pm', 'whatsapp', 'misinformation', 'ai']),
            'threat_level' => 'critical',
            'location' => 'Nationwide',
            'url' => 'https://t.me/malaysiasec/789',
            'collected_at' => date('Y-m-d H:i:s', strtotime('-45 minutes'))
        ],
        
        // High threats
        [
            'source' => 'Facebook Malaysia Cybersecurity Group',
            'content' => 'New phishing campaign impersonating major Malaysian banks (Maybank, CIMB, Public Bank). Fake SMS messages claiming account suspension with malicious links.',
            'keywords' => json_encode(['phishing', 'bank', 'sms', 'maybank', 'cimb']),
            'threat_level' => 'high',
            'location' => 'Kuala Lumpur, Malaysia',
            'url' => 'https://facebook.com/groups/malaysiasec/posts/123789',
            'collected_at' => date('Y-m-d H:i:s', strtotime('-2 hours'))
        ],
        [
            'source' => 'Twitter @CyberSecurityMY',
            'content' => 'WARNING: Fake PETRONAS job recruitment emails circulating with malicious attachments. Do not open attachments or click links. Verify all job postings on official PETRONAS website.',
            'keywords' => json_encode(['scam', 'petronas', 'recruitment', 'malware', 'email']),
            'threat_level' => 'high',
            'location' => 'Malaysia',
            'url' => 'https://twitter.com/CyberSecurityMY/status/456789',
            'collected_at' => date('Y-m-d H:i:s', strtotime('-3 hours'))
        ],
        [
            'source' => 'Lowyat.NET Cybersecurity Forum',
            'content' => 'Multiple reports of credit card skimming devices found at ATMs in major KL shopping malls (Pavilion, KLCC, Mid Valley). Users advised to check ATMs before use.',
            'keywords' => json_encode(['skimming', 'atm', 'credit card', 'shopping mall', 'klcc']),
            'threat_level' => 'high',
            'location' => 'Kuala Lumpur',
            'url' => 'https://lowyat.net/forums/topic/2024/atm-skimming',
            'collected_at' => date('Y-m-d H:i:s', strtotime('-4 hours'))
        ],
        [
            'source' => 'The Star Online',
            'content' => 'Malaysian companies lose RM50 million to business email compromise (BEC) scams this year. Companies urged to implement email verification protocols.',
            'keywords' => json_encode(['bec', 'business email', 'scam', 'corporate', 'rm50million']),
            'threat_level' => 'high',
            'location' => 'Malaysia',
            'url' => 'https://thestar.com.my/tech/cybersecurity/bec-scams-2024',
            'collected_at' => date('Y-m-d H:i:s', strtotime('-5 hours'))
        ],
        
        // Medium threats
        [
            'source' => 'MCMC Security Advisory',
            'content' => 'Advisory on securing IoT devices following 30% increase in botnet recruitment attempts targeting Malaysian networks. Update firmware and change default passwords.',
            'keywords' => json_encode(['iot', 'botnet', 'security', 'firmware', 'passwords']),
            'threat_level' => 'medium',
            'location' => 'Malaysia',
            'url' => 'https://mcmc.gov.my/security/iot-advisory-2024',
            'collected_at' => date('Y-m-d H:i:s', strtotime('-6 hours'))
        ],
        [
            'source' => 'Bernama',
            'content' => 'MCMC warns of fake 5G network upgrade scam targeting mobile users. Scammers claiming free 5G upgrades but asking for banking details.',
            'keywords' => json_encode(['5g', 'scam', 'mobile', 'mcmc', 'banking']),
            'threat_level' => 'medium',
            'location' => 'Malaysia',
            'url' => 'https://bernama.com/tech/5g-scam-warning-2024',
            'collected_at' => date('Y-m-d H:i:s', strtotime('-8 hours'))
        ],
        [
            'source' => 'Cari.com.my Technology Section',
            'content' => 'Discussion thread: New ransomware variant targeting Malaysian SMEs. Several small businesses in Penang and JB affected. Backup data regularly.',
            'keywords' => json_encode(['ransomware', 'sme', 'malaysia', 'backup', 'penang']),
            'threat_level' => 'medium',
            'location' => 'Penang & Johor Bahru',
            'url' => 'https://cari.com.my/technology/ransomware-sme-2024',
            'collected_at' => date('Y-m-d H:i:s', strtotime('-9 hours'))
        ],
        [
            'source' => 'Reddit r/Malaysia',
            'content' => 'PSA: Fake Shopee/Lazada customer service scam. Scammers calling users claiming order issues and requesting OTP codes to "cancel" fraudulent orders.',
            'keywords' => json_encode(['scam', 'shopee', 'lazada', 'otp', 'ecommerce']),
            'threat_level' => 'medium',
            'location' => 'Malaysia',
            'url' => 'https://reddit.com/r/malaysia/comments/scam_alert',
            'collected_at' => date('Y-m-d H:i:s', strtotime('-12 hours'))
        ],
        [
            'source' => 'Malaysian News Network',
            'content' => 'Cryptocurrency investment scam using fake celebrity endorsements on Facebook. Several Malaysians lost RM2 million in total. Verify investment platforms.',
            'keywords' => json_encode(['cryptocurrency', 'investment', 'scam', 'facebook', 'celebrity']),
            'threat_level' => 'medium',
            'location' => 'Malaysia',
            'url' => 'https://malaysianews.my/crypto-scam-alert',
            'collected_at' => date('Y-m-d H:i:s', strtotime('-15 hours'))
        ],
        
        // Low threats
        [
            'source' => 'Malaysia Cybersecurity Forum',
            'content' => 'Reminder: Update your passwords regularly. Recent study shows 60% of Malaysians still use weak passwords like "123456" and "password".',
            'keywords' => json_encode(['password', 'security', 'awareness', 'best practices']),
            'threat_level' => 'low',
            'location' => 'Malaysia',
            'url' => 'https://cybersec.my/password-awareness',
            'collected_at' => date('Y-m-d H:i:s', strtotime('-18 hours'))
        ],
        [
            'source' => 'PDRM E-Reporting',
            'content' => 'Public reminder to verify online sellers before making payments. Use secure payment methods and check seller reviews on e-commerce platforms.',
            'keywords' => json_encode(['online shopping', 'verification', 'payment', 'ecommerce']),
            'threat_level' => 'low',
            'location' => 'Malaysia',
            'url' => 'https://pdrm.gov.my/e-reporting/advisory',
            'collected_at' => date('Y-m-d H:i:s', strtotime('-20 hours'))
        ],
        [
            'source' => 'Tech News Malaysia',
            'content' => 'New security update available for popular Malaysian banking apps. Users advised to update to latest version for enhanced security features.',
            'keywords' => json_encode(['banking app', 'security update', 'mobile', 'update']),
            'threat_level' => 'low',
            'location' => 'Malaysia',
            'url' => 'https://technews.my/banking-app-update',
            'collected_at' => date('Y-m-d H:i:s', strtotime('-22 hours'))
        ],
        
        // Additional recent threats
        [
            'source' => 'LinkedIn Malaysia Security Group',
            'content' => 'Job seekers alert: Fake HR representatives from multinational companies requesting payment for "processing fees". Legitimate companies never charge job application fees.',
            'keywords' => json_encode(['job scam', 'recruitment', 'fake hr', 'processing fee']),
            'threat_level' => 'medium',
            'location' => 'Malaysia',
            'url' => 'https://linkedin.com/groups/malaysia-security/posts',
            'collected_at' => date('Y-m-d H:i:s', strtotime('-30 minutes'))
        ],
        [
            'source' => 'Instagram @MalaysiaCyberAlert',
            'content' => 'New Instagram phishing campaign using fake verification badges. Scammers requesting login credentials claiming "account verification required".',
            'keywords' => json_encode(['instagram', 'phishing', 'verification', 'credentials', 'social media']),
            'threat_level' => 'high',
            'location' => 'Malaysia',
            'url' => 'https://instagram.com/p/cyber-alert-2024',
            'collected_at' => date('Y-m-d H:i:s', strtotime('-90 minutes'))
        ]
    ];
    
    try {
        $pdo->beginTransaction();
        
        // Clear existing sample data (optional - comment out to keep existing data)
        // $pdo->exec("DELETE FROM osint_data WHERE source LIKE '%Sample%'");
        
        $stmt = $pdo->prepare("
            INSERT INTO osint_data (source, content, keywords, threat_level, location, url, collected_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                content = VALUES(content),
                keywords = VALUES(keywords),
                threat_level = VALUES(threat_level),
                location = VALUES(location)
        ");
        
        $insertedCount = 0;
        foreach ($sampleThreats as $threat) {
            $stmt->execute([
                $threat['source'],
                $threat['content'],
                $threat['keywords'],
                $threat['threat_level'],
                $threat['location'],
                $threat['url'],
                $threat['collected_at']
            ]);
            $insertedCount++;
        }
        
        $pdo->commit();
        
        return [
            'success' => true,
            'message' => "Successfully initialized {$insertedCount} sample threat records",
            'count' => $insertedCount
        ];
        
    } catch (Exception $e) {
        $pdo->rollBack();
        return [
            'success' => false,
            'error' => 'Failed to initialize data: ' . $e->getMessage()
        ];
    }
}

// Run initialization if called directly
if (php_sapi_name() === 'cli' || (isset($_GET['init']) && $_GET['init'] === 'osint_data')) {
    $result = initializeOSINTData();
    
    if (php_sapi_name() === 'cli') {
        echo json_encode($result, JSON_PRETTY_PRINT) . "\n";
    } else {
        header('Content-Type: application/json');
        echo json_encode($result);
    }
} else {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Access denied']);
}
?>

