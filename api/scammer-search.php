<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

// Use fake data from global array
$fake_scammers = $GLOBALS['fake_scammers'];

// Sanitize and validate search input
function sanitizeSearchInput($input) {
    $input = trim($input);
    $input = filter_var($input, FILTER_SANITIZE_STRING);
    $input = preg_replace('/[\'";\\\\]/', '', $input);
    return $input;
}

// Main search function using fake data
function searchScammers($query, $type = 'all', $limit = 50, $offset = 0) {
    global $fake_scammers;
    
    $query = sanitizeSearchInput($query);
    
    if (strlen($query) < 3) {
        return ['success' => false, 'message' => 'Search query must be at least 3 characters long'];
    }
    
    // Filter scammers based on search query and type
    $results = array_filter($fake_scammers, function($scammer) use ($query, $type) {
        $query_lower = strtolower($query);
        
        if ($type === 'email' || $type === 'all') {
            if ($scammer['scammer_email'] && stripos($scammer['scammer_email'], $query) !== false) {
                return true;
            }
        }
        
        if ($type === 'phone' || $type === 'all') {
            if ($scammer['scammer_phone'] && stripos($scammer['scammer_phone'], $query) !== false) {
                return true;
            }
        }
        
        if ($type === 'website' || $type === 'all') {
            if ($scammer['scammer_website'] && stripos($scammer['scammer_website'], $query) !== false) {
                return true;
            }
        }
        
        if ($type === 'description' || $type === 'all') {
            if (stripos($scammer['description'], $query) !== false) {
                return true;
            }
        }
        
        return false;
    });
    
    $totalResults = count($results);
    
    // Sort by verification status and threat level
    usort($results, function($a, $b) {
        $statusOrder = ['verified' => 1, 'pending' => 2, 'unverified' => 3];
        $statusA = $statusOrder[$a['verification_status']] ?? 4;
        $statusB = $statusOrder[$b['verification_status']] ?? 4;
        
        if ($statusA !== $statusB) {
            return $statusA - $statusB;
        }
        
        return $b['report_count'] - $a['report_count'];
    });
    
    // Apply pagination
    $results = array_slice($results, $offset, $limit);
    
    // Process results for safe display
    $processedResults = [];
    foreach ($results as $result) {
        $processedResults[] = [
            'id' => $result['id'],
            'email' => $result['scammer_email'],
            'phone' => $result['scammer_phone'],
            'website' => $result['scammer_website'],
            'social_media' => $result['scammer_social_media'] ? json_decode($result['scammer_social_media'], true) : null,
            'scam_type' => $result['scam_type'],
            'description' => $result['description'],
            'verification_status' => $result['verification_status'],
            'threat_level' => $result['threat_level'],
            'location' => $result['location'],
            'first_reported' => $result['first_reported'],
            'last_updated' => $result['last_updated'],
            'report_count' => $result['report_count']
        ];
    }
    
    return [
        'success' => true,
        'results' => $processedResults,
        'total_results' => $totalResults,
        'page_info' => [
            'limit' => $limit,
            'offset' => $offset,
            'has_more' => ($offset + $limit) < $totalResults
        ]
    ];
}

// Get scammer statistics
function getScammerStats() {
    global $fake_scammers;
    
    $stats = [];
    
    // Total active scammers
    $stats['total_scammers'] = count($fake_scammers);
    
    // Verified scammers
    $stats['verified_scammers'] = count(array_filter($fake_scammers, function($s) {
        return $s['verification_status'] === 'verified' && $s['is_active'];
    }));
    
    // By scam type
    $byType = [];
    foreach ($fake_scammers as $scammer) {
        if (!isset($byType[$scammer['scam_type']])) {
            $byType[$scammer['scam_type']] = 0;
        }
        $byType[$scammer['scam_type']]++;
    }
    $stats['by_type'] = [];
    foreach ($byType as $type => $count) {
        $stats['by_type'][] = ['scam_type' => $type, 'count' => $count];
    }
    
    // By threat level
    $byThreat = [];
    foreach ($fake_scammers as $scammer) {
        if (!isset($byThreat[$scammer['threat_level']])) {
            $byThreat[$scammer['threat_level']] = 0;
        }
        $byThreat[$scammer['threat_level']]++;
    }
    $stats['by_threat_level'] = [];
    foreach ($byThreat as $level => $count) {
        $stats['by_threat_level'][] = ['threat_level' => $level, 'count' => $count];
    }
    
    // Recent reports (fake - just use 2 for demo)
    $stats['recent_reports'] = 2;
    
    return ['success' => true, 'stats' => $stats];
}

// Handle API requests
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $action = $_GET['action'] ?? 'search';
    
    switch ($action) {
        case 'search':
            $query = $_GET['q'] ?? '';
            $type = $_GET['type'] ?? 'all';
            $limit = min(100, max(1, intval($_GET['limit'] ?? 20)));
            $offset = max(0, intval($_GET['offset'] ?? 0));
            
            if (empty($query)) {
                echo json_encode(['success' => false, 'message' => 'Search query is required']);
                exit;
            }
            
            $result = searchScammers($query, $type, $limit, $offset);
            echo json_encode($result);
            break;
            
        case 'stats':
            $result = getScammerStats();
            echo json_encode($result);
            break;
            
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
    
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
