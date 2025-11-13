<?php
// API Status Endpoint (No Database Version)
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Basic health check
    $status = [
        'success' => true,
        'status' => 'online',
        'timestamp' => date('Y-m-d H:i:s'),
        'version' => '1.0.0',
        'services' => [
            'database' => false,
            'sightengine' => true,
            'gemini' => true
        ],
        'overall' => 'healthy'
    ];
    
    http_response_code(200);
    echo json_encode($status);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'status' => 'error',
        'message' => 'Service unavailable',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>
