<?php
require_once '../config/database.php';
require_once '../includes/auth.php';

class OSINTCollector {
    private $fake_osint_data;
    
    public function __construct() {
        // Use fake data from global array
        $this->fake_osint_data = $GLOBALS['fake_osint_data'];
    }
    
    /**
     * Collect threat intelligence - returns fake data
     */
    public function collectThreatIntelligence($keywords = [], $timeframe = '24h') {
        // Return fake threats
        return $this->fake_osint_data;
    }
    
    /**
     * Get threat statistics
     */
    public function getThreatStats($timeframe = '24h') {
        $threats = $this->fake_osint_data;
        
        $stats = [
            'total_threats' => count($threats),
            'critical_threats' => count(array_filter($threats, fn($t) => $t['threat_level'] === 'critical')),
            'high_threats' => count(array_filter($threats, fn($t) => $t['threat_level'] === 'high')),
            'medium_threats' => count(array_filter($threats, fn($t) => $t['threat_level'] === 'medium')),
            'low_threats' => count(array_filter($threats, fn($t) => $t['threat_level'] === 'low'))
        ];
        
        return $stats;
    }
    
    /**
     * Search threats by keywords
     */
    public function searchThreats($keywords, $threatLevel = null, $limit = 50, $offset = 0) {
        $threats = $this->fake_osint_data;
        
        // Filter by keywords if provided
        if (!empty($keywords)) {
            $threats = array_filter($threats, function($threat) use ($keywords) {
                foreach ($keywords as $keyword) {
                    if (empty(trim($keyword))) continue;
                    
                    if (stripos($threat['content'], $keyword) !== false) {
                        return true;
                    }
                    
                    $threat_keywords = json_decode($threat['keywords'], true);
                    if ($threat_keywords && in_array(strtolower($keyword), array_map('strtolower', $threat_keywords))) {
                        return true;
                    }
                }
                return false;
            });
        }
        
        // Filter by threat level
        if ($threatLevel) {
            $threats = array_filter($threats, fn($t) => $t['threat_level'] === $threatLevel);
        }
        
        // Apply pagination
        $threats = array_slice(array_values($threats), $offset, $limit);
        
        return $threats;
    }
    
    /**
     * Get threat trends by location
     */
    public function getThreatsByLocation($timeframe = '7d') {
        $threats = $this->fake_osint_data;
        
        $locationData = [];
        foreach ($threats as $threat) {
            $loc = $threat['location'];
            if (!isset($locationData[$loc])) {
                $locationData[$loc] = [
                    'location' => $loc,
                    'threat_count' => 0,
                    'threat_level' => $threat['threat_level'],
                    'level_count' => 0
                ];
            }
            $locationData[$loc]['threat_count']++;
            $locationData[$loc]['level_count']++;
        }
        
        return array_values($locationData);
    }
    
    /**
     * Get trending keywords
     */
    public function getTrendingKeywords($limit = 10) {
        // Fake trending keywords
        return [
            ['keyword' => 'phishing', 'frequency' => 45],
            ['keyword' => 'scam', 'frequency' => 38],
            ['keyword' => 'bank', 'frequency' => 32],
            ['keyword' => 'petronas', 'frequency' => 28],
            ['keyword' => 'cryptocurrency', 'frequency' => 25],
            ['keyword' => 'malware', 'frequency' => 22],
            ['keyword' => 'deepfake', 'frequency' => 18],
            ['keyword' => 'whatsapp', 'frequency' => 15],
            ['keyword' => 'investment', 'frequency' => 12],
            ['keyword' => 'sms', 'frequency' => 10]
        ];
    }
}

// API endpoint for AJAX requests
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    header('Content-Type: application/json');
    
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
                    'count' => count($threats),
                    'message' => 'Threats collected successfully (fake data)'
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
