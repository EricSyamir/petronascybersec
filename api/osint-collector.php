<?php
require_once '../config/database.php';
require_once '../includes/auth.php';

class OSINTCollector {
    private $pdo;
    private $malaysianSources;
    
    public function __construct() {
        global $pdo;
        $this->pdo = $pdo;
        
        // Malaysian-focused sources for OSINT data collection
        $this->malaysianSources = [
            'social_media' => [
                'facebook_pages' => [
                    'malaysia.cybersecurity',
                    'cyber999malaysia',
                    'pdrm.official'
                ],
                'twitter_accounts' => [
                    '@CyberSecurityMY',
                    '@PDRMsia',
                    '@mcmcgovmy'
                ],
                'telegram_channels' => [
                    'malaysiacybersecurity',
                    'pdrmupdates'
                ]
            ],
            'forums' => [
                'lowyat.net' => '/forums/cybersecurity',
                'cari.com.my' => '/technology/cybersecurity',
                'malaysiacybersec.org' => '/threats'
            ],
            'news_sources' => [
                'bernama.com',
                'malaysiakini.com',
                'thestar.com.my',
                'nst.com.my'
            ],
            'government' => [
                'cyber999.gov.my',
                'mcmc.gov.my',
                'mampu.gov.my'
            ]
        ];
    }
    
    /**
     * Collect threat intelligence from Malaysian sources
     */
    public function collectThreatIntelligence($keywords = [], $timeframe = '24h') {
        $threats = [];
        
        // Simulate data collection from various sources
        // In production, this would integrate with actual APIs and web scraping
        
        $threats = array_merge($threats, $this->collectSocialMediaThreats($keywords, $timeframe));
        $threats = array_merge($threats, $this->collectForumThreats($keywords, $timeframe));
        $threats = array_merge($threats, $this->collectNewsThreats($keywords, $timeframe));
        $threats = array_merge($threats, $this->collectGovernmentAlerts($timeframe));
        
        // Store collected data
        foreach ($threats as $threat) {
            $this->storeThreatData($threat);
        }
        
        return $threats;
    }
    
    /**
     * Simulate social media threat collection
     */
    private function collectSocialMediaThreats($keywords, $timeframe) {
        $threats = [];
        
        // Simulated social media threats (replace with actual API calls in production)
        $sampleThreats = [
            [
                'source' => 'Facebook Malaysia Cybersecurity Group',
                'content' => 'New phishing campaign targeting Malaysian bank customers. Fake SMS claiming account suspension.',
                'keywords' => ['phishing', 'bank', 'sms'],
                'threat_level' => 'high',
                'location' => 'Kuala Lumpur, Malaysia',
                'url' => 'https://facebook.com/groups/malaysiasec/posts/123456',
                'collected_at' => date('Y-m-d H:i:s', strtotime('-2 hours'))
            ],
            [
                'source' => 'Twitter @CyberSecurityMY',
                'content' => 'Warning: Fake PETRONAS job recruitment emails circulating. Do not click suspicious links.',
                'keywords' => ['scam', 'petronas', 'recruitment'],
                'threat_level' => 'medium',
                'location' => 'Malaysia',
                'url' => 'https://twitter.com/CyberSecurityMY/status/123456',
                'collected_at' => date('Y-m-d H:i:s', strtotime('-4 hours'))
            ],
            [
                'source' => 'Telegram Malaysia Cyber Alerts',
                'content' => 'Deepfake video of PM circulating on WhatsApp groups. Video quality analysis suggests AI generation.',
                'keywords' => ['deepfake', 'pm', 'whatsapp'],
                'threat_level' => 'critical',
                'location' => 'Nationwide',
                'url' => 'https://t.me/malaysiasec/456',
                'collected_at' => date('Y-m-d H:i:s', strtotime('-1 hour'))
            ]
        ];
        
        // Filter by keywords if provided
        if (!empty($keywords)) {
            $sampleThreats = array_filter($sampleThreats, function($threat) use ($keywords) {
                foreach ($keywords as $keyword) {
                    if (stripos($threat['content'], $keyword) !== false || 
                        in_array(strtolower($keyword), $threat['keywords'])) {
                        return true;
                    }
                }
                return false;
            });
        }
        
        return $sampleThreats;
    }
    
    /**
     * Simulate forum threat collection
     */
    private function collectForumThreats($keywords, $timeframe) {
        $threats = [];
        
        // Simulated forum posts (replace with actual scraping in production)
        $sampleThreats = [
            [
                'source' => 'Lowyat.NET Cybersecurity Forum',
                'content' => 'User reports credit card skimming device found at KL shopping mall ATM.',
                'keywords' => ['skimming', 'atm', 'credit card'],
                'threat_level' => 'high',
                'location' => 'Kuala Lumpur',
                'url' => 'https://lowyat.net/forums/topic/123456',
                'collected_at' => date('Y-m-d H:i:s', strtotime('-3 hours'))
            ],
            [
                'source' => 'Cari.com.my Technology Section',
                'content' => 'Discussion about new ransomware variant targeting Malaysian SMEs.',
                'keywords' => ['ransomware', 'sme', 'malaysia'],
                'threat_level' => 'critical',
                'location' => 'Malaysia',
                'url' => 'https://cari.com.my/technology/ransomware-123',
                'collected_at' => date('Y-m-d H:i:s', strtotime('-5 hours'))
            ]
        ];
        
        // Filter by keywords
        if (!empty($keywords)) {
            $sampleThreats = array_filter($sampleThreats, function($threat) use ($keywords) {
                foreach ($keywords as $keyword) {
                    if (stripos($threat['content'], $keyword) !== false || 
                        in_array(strtolower($keyword), $threat['keywords'])) {
                        return true;
                    }
                }
                return false;
            });
        }
        
        return $sampleThreats;
    }
    
    /**
     * Simulate news threat collection
     */
    private function collectNewsThreats($keywords, $timeframe) {
        $threats = [];
        
        // Simulated news articles
        $sampleThreats = [
            [
                'source' => 'The Star Online',
                'content' => 'Malaysian companies lose RM50 million to business email compromise scams this year.',
                'keywords' => ['bec', 'business email', 'scam'],
                'threat_level' => 'high',
                'location' => 'Malaysia',
                'url' => 'https://thestar.com.my/tech/cybersecurity/bec-scams',
                'collected_at' => date('Y-m-d H:i:s', strtotime('-6 hours'))
            ],
            [
                'source' => 'Bernama',
                'content' => 'MCMC warns of fake 5G upgrade scam targeting mobile users.',
                'keywords' => ['5g', 'scam', 'mobile'],
                'threat_level' => 'medium',
                'location' => 'Malaysia',
                'url' => 'https://bernama.com/tech/5g-scam-warning',
                'collected_at' => date('Y-m-d H:i:s', strtotime('-8 hours'))
            ]
        ];
        
        // Filter by keywords
        if (!empty($keywords)) {
            $sampleThreats = array_filter($sampleThreats, function($threat) use ($keywords) {
                foreach ($keywords as $keyword) {
                    if (stripos($threat['content'], $keyword) !== false || 
                        in_array(strtolower($keyword), $threat['keywords'])) {
                        return true;
                    }
                }
                return false;
            });
        }
        
        return $sampleThreats;
    }
    
    /**
     * Simulate government alerts
     */
    private function collectGovernmentAlerts($timeframe) {
        return [
            [
                'source' => 'Cyber999 Official',
                'content' => 'High-priority alert: New malware strain targeting government employees via email attachments.',
                'keywords' => ['malware', 'government', 'email'],
                'threat_level' => 'critical',
                'location' => 'Malaysia',
                'url' => 'https://cyber999.gov.my/alerts/malware-2024-001',
                'collected_at' => date('Y-m-d H:i:s', strtotime('-1 hour'))
            ],
            [
                'source' => 'MCMC Security Advisory',
                'content' => 'Advisory on securing IoT devices following increase in botnet recruitment.',
                'keywords' => ['iot', 'botnet', 'security'],
                'threat_level' => 'medium',
                'location' => 'Malaysia',
                'url' => 'https://mcmc.gov.my/security/iot-advisory',
                'collected_at' => date('Y-m-d H:i:s', strtotime('-12 hours'))
            ]
        ];
    }
    
    /**
     * Store threat data in database
     */
    private function storeThreatData($threat) {
        try {
            // Check if threat already exists (prevent duplicates)
            $stmt = $this->pdo->prepare("SELECT id FROM osint_data WHERE url = ? AND content = ?");
            $stmt->execute([$threat['url'], $threat['content']]);
            
            if ($stmt->fetch()) {
                return; // Threat already exists
            }
            
            // Insert new threat
            $stmt = $this->pdo->prepare("
                INSERT INTO osint_data (source, content, keywords, threat_level, location, url, collected_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $threat['source'],
                $threat['content'],
                json_encode($threat['keywords']),
                $threat['threat_level'],
                $threat['location'],
                $threat['url'],
                $threat['collected_at']
            ]);
            
        } catch (Exception $e) {
            error_log("Error storing threat data: " . $e->getMessage());
        }
    }
    
    /**
     * Get threat statistics
     */
    public function getThreatStats($timeframe = '24h') {
        $interval = match($timeframe) {
            '1h' => 'INTERVAL 1 HOUR',
            '24h' => 'INTERVAL 24 HOUR',
            '7d' => 'INTERVAL 7 DAY',
            '30d' => 'INTERVAL 30 DAY',
            default => 'INTERVAL 24 HOUR'
        };
        
        $stmt = $this->pdo->prepare("
            SELECT 
                COUNT(*) as total_threats,
                SUM(CASE WHEN threat_level = 'critical' THEN 1 ELSE 0 END) as critical_threats,
                SUM(CASE WHEN threat_level = 'high' THEN 1 ELSE 0 END) as high_threats,
                SUM(CASE WHEN threat_level = 'medium' THEN 1 ELSE 0 END) as medium_threats,
                SUM(CASE WHEN threat_level = 'low' THEN 1 ELSE 0 END) as low_threats
            FROM osint_data 
            WHERE collected_at > DATE_SUB(NOW(), $interval)
        ");
        
        $stmt->execute();
        return $stmt->fetch();
    }
    
    /**
     * Search threats by keywords
     */
    public function searchThreats($keywords, $threatLevel = null, $limit = 50, $offset = 0) {
        $whereConditions = [];
        $params = [];
        
        // Build keyword search
        if (!empty($keywords)) {
            $keywordConditions = [];
            foreach ($keywords as $keyword) {
                $keywordConditions[] = "content LIKE ? OR JSON_SEARCH(keywords, 'one', ?) IS NOT NULL";
                $params[] = "%{$keyword}%";
                $params[] = $keyword;
            }
            $whereConditions[] = "(" . implode(" OR ", $keywordConditions) . ")";
        }
        
        // Filter by threat level
        if ($threatLevel) {
            $whereConditions[] = "threat_level = ?";
            $params[] = $threatLevel;
        }
        
        // Only show recent threats (last 30 days)
        $whereConditions[] = "collected_at > DATE_SUB(NOW(), INTERVAL 30 DAY)";
        
        $whereClause = !empty($whereConditions) ? "WHERE " . implode(" AND ", $whereConditions) : "";
        
        $stmt = $this->pdo->prepare("
            SELECT * FROM osint_data 
            $whereClause
            ORDER BY collected_at DESC 
            LIMIT ? OFFSET ?
        ");
        
        $params[] = $limit;
        $params[] = $offset;
        
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
    
    /**
     * Get threat trends by location
     */
    public function getThreatsByLocation($timeframe = '7d') {
        $interval = match($timeframe) {
            '24h' => 'INTERVAL 24 HOUR',
            '7d' => 'INTERVAL 7 DAY',
            '30d' => 'INTERVAL 30 DAY',
            default => 'INTERVAL 7 DAY'
        };
        
        $stmt = $this->pdo->prepare("
            SELECT 
                location,
                COUNT(*) as threat_count,
                threat_level,
                COUNT(*) as level_count
            FROM osint_data 
            WHERE collected_at > DATE_SUB(NOW(), $interval)
            GROUP BY location, threat_level
            ORDER BY threat_count DESC
        ");
        
        $stmt->execute();
        return $stmt->fetchAll();
    }
    
    /**
     * Get trending keywords
     */
    public function getTrendingKeywords($limit = 10) {
        $stmt = $this->pdo->prepare("
            SELECT 
                JSON_UNQUOTE(JSON_EXTRACT(keywords, CONCAT('$[', seq.seq, ']'))) as keyword,
                COUNT(*) as frequency
            FROM osint_data
            CROSS JOIN (
                SELECT 0 as seq UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL 
                SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL 
                SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
            ) seq
            WHERE collected_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
            AND JSON_EXTRACT(keywords, CONCAT('$[', seq.seq, ']')) IS NOT NULL
            GROUP BY keyword
            HAVING keyword IS NOT NULL
            ORDER BY frequency DESC
            LIMIT ?
        ");
        
        $stmt->execute([$limit]);
        return $stmt->fetchAll();
    }
}

// API endpoint for AJAX requests
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    header('Content-Type: application/json');
    
    // Public access allowed for basic OSINT monitoring
    // Advanced features (collect_threats) require authentication
    $publicActions = ['search_threats', 'get_stats', 'get_trending', 'get_location_data'];
    $action = $_POST['action'] ?? '';
    
    if (!in_array($action, $publicActions) && !hasPermission('view_osint')) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Access denied. Login required for this feature.']);
        exit;
    }
    
    try {
        $osint = new OSINTCollector();
        $action = $_POST['action'];
        
        switch ($action) {
            case 'collect_threats':
                $keywords = isset($_POST['keywords']) ? explode(',', $_POST['keywords']) : [];
                $keywords = array_map('trim', $keywords);
                $timeframe = $_POST['timeframe'] ?? '24h';
                
                $threats = $osint->collectThreatIntelligence($keywords, $timeframe);
                
                echo json_encode([
                    'success' => true,
                    'threats' => $threats,
                    'count' => count($threats)
                ]);
                break;
                
            case 'search_threats':
                $keywords = isset($_POST['keywords']) ? array_filter(explode(',', $_POST['keywords'])) : [];
                $keywords = array_map('trim', $keywords);
                $threatLevel = $_POST['threat_level'] ?? null;
                $limit = min(100, intval($_POST['limit'] ?? 50));
                $offset = intval($_POST['offset'] ?? 0);
                
                $threats = $osint->searchThreats($keywords, $threatLevel, $limit, $offset);
                
                echo json_encode([
                    'success' => true,
                    'threats' => $threats,
                    'count' => count($threats)
                ]);
                break;
                
            case 'get_stats':
                $timeframe = $_POST['timeframe'] ?? '24h';
                $stats = $osint->getThreatStats($timeframe);
                
                echo json_encode([
                    'success' => true,
                    'stats' => $stats
                ]);
                break;
                
            case 'get_location_data':
                $timeframe = $_POST['timeframe'] ?? '7d';
                $locationData = $osint->getThreatsByLocation($timeframe);
                
                echo json_encode([
                    'success' => true,
                    'locations' => $locationData
                ]);
                break;
                
            case 'get_trending':
                $limit = min(20, intval($_POST['limit'] ?? 10));
                $trending = $osint->getTrendingKeywords($limit);
                
                echo json_encode([
                    'success' => true,
                    'keywords' => $trending
                ]);
                break;
                
            default:
                throw new Exception('Invalid action');
        }
        
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
    exit;
}

// GET endpoint for basic stats (public access)
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['stats'])) {
    header('Content-Type: application/json');
    
    try {
        $osint = new OSINTCollector();
        $stats = $osint->getThreatStats();
        
        echo json_encode([
            'success' => true,
            'public_stats' => [
                'total_threats' => $stats['total_threats'],
                'critical_threats' => $stats['critical_threats'],
                'last_updated' => date('Y-m-d H:i:s')
            ]
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Unable to fetch statistics'
        ]);
    }
    exit;
}
?>
