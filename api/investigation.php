<?php
// Investigation API (No Database Version)
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Return mock data for investigation features
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $action = $_POST['action'];
    
    switch ($action) {
        case 'create_case':
            echo json_encode([
                'success' => true,
                'case_id' => rand(1000, 9999),
                'case_number' => 'CASE-' . date('Ym') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT)
            ]);
            break;
            
        case 'get_cases':
            echo json_encode([
                'success' => true,
                'cases' => []
            ]);
            break;
            
        default:
            echo json_encode([
                'success' => false,
                'error' => 'Feature requires database'
            ]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
