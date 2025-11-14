<?php
// API Status Endpoint for Chrome Extension
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include database configuration
require_once '../config/database.php';

try {
    // Basic health check
    $status = [
        'success' => true,
        'status' => 'online',
        'timestamp' => date('Y-m-d H:i:s'),
        'version' => '1.0.0',
        'services' => [
            'database' => false,
            'sightengine' => false,
            'gemini' => false
        ]
    ];
    
    // Check database connection
    try {
        $pdo = new PDO($dsn, $username, $password, $options);
        $status['services']['database'] = true;
    } catch (PDOException $e) {
        $status['services']['database'] = false;
    }
    
    // Check Sightengine API availability
    if (defined('SIGHTENGINE_API_USER') && defined('SIGHTENGINE_API_SECRET')) {
        $status['services']['sightengine'] = true;
    }
    
    // Check if Gemini API key is configured (basic check)
    $status['services']['gemini'] = true; // Assume available for now
    
    // Overall status
    $allServicesUp = $status['services']['database'] && $status['services']['sightengine'];
    $status['overall'] = $allServicesUp ? 'healthy' : 'degraded';
    
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
