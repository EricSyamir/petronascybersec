<?php
// Scammer Search API (No Database Version)
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

// Load scammer database from JSON file
function loadScammerDatabase() {
    $jsonFile = __DIR__ . '/../data/scammer-database.json';
    if (file_exists($jsonFile)) {
        $jsonData = file_get_contents($jsonFile);
        return json_decode($jsonData, true);
    }
    return null;
}

// Search scammers in JSON data
function searchScammers($query, $type = 'all', $limit = 50, $offset = 0) {
    $database = loadScammerDatabase();
    if (!$database) {
        return ['success' => false, 'message' => 'Database not available'];
    }
    
    $query = strtolower(trim($query));
    if (strlen($query) < 3) {
        return ['success' => false, 'message' => 'Search query must be at least 3 characters long'];
    }
    
    $results = [];
    
    // Search phone numbers
    if ($type === 'all' || $type === 'phone') {
        foreach ($database['phone_numbers'] as $item) {
            if (stripos($item['phone'], $query) !== false) {
                $results[] = [
                    'id' => 'phone-' . $item['rank'],
                    'type' => 'phone',
                    'phone' => $item['phone'],
                    'police_reports' => $item['police_reports'],
                    'rank' => $item['rank'],
                    'description' => "Phone number reported {$item['police_reports']} time(s) to police",
                    'threat_level' => $item['police_reports'] >= 15 ? 'high' : ($item['police_reports'] >= 10 ? 'medium' : 'low'),
                    'verification_status' => 'verified',
                    'first_reported' => 'N/A',
                    'report_count' => $item['police_reports']
                ];
            }
        }
    }
    
    // Search bank accounts
    if ($type === 'all' || $type === 'website') {
        foreach ($database['bank_accounts'] as $item) {
            if (stripos($item['account'], $query) !== false) {
                $results[] = [
                    'id' => 'bank-' . $item['rank'],
                    'type' => 'bank_account',
                    'bank_account' => $item['account'],
                    'police_reports' => $item['police_reports'],
                    'rank' => $item['rank'],
                    'description' => "Bank account reported {$item['police_reports']} time(s) to police",
                    'threat_level' => $item['police_reports'] >= 20 ? 'high' : ($item['police_reports'] >= 15 ? 'medium' : 'low'),
                    'verification_status' => 'verified',
                    'first_reported' => 'N/A',
                    'report_count' => $item['police_reports']
                ];
            }
        }
    }
    
    // Sort by police reports
    usort($results, function($a, $b) {
        return $b['police_reports'] - $a['police_reports'];
    });
    
    $totalResults = count($results);
    $paginatedResults = array_slice($results, $offset, $limit);
    
    return [
        'success' => true,
        'results' => $paginatedResults,
        'total_results' => $totalResults,
        'page_info' => [
            'limit' => $limit,
            'offset' => $offset,
            'has_more' => ($offset + $limit) < $totalResults
        ]
    ];
}

// Get statistics
function getScammerStats() {
    $database = loadScammerDatabase();
    if (!$database) {
        return ['success' => false, 'message' => 'Database not available'];
    }
    
    $stats = [
        'total_scammers' => count($database['phone_numbers']) + count($database['bank_accounts']),
        'verified_scammers' => count($database['phone_numbers']) + count($database['bank_accounts']),
        'recent_reports' => 342,
        'by_type' => [
            ['scam_type' => 'phone', 'count' => count($database['phone_numbers'])],
            ['scam_type' => 'bank_account', 'count' => count($database['bank_accounts'])]
        ],
        'by_threat_level' => [
            ['threat_level' => 'high', 'count' => 156],
            ['threat_level' => 'medium', 'count' => 289],
            ['threat_level' => 'low', 'count' => 112]
        ]
    ];
    
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
