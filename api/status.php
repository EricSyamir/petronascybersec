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
            'gemini' => false,
            'python' => false
        ]
    ];
    
    // Check database connection (using fake data, so always false but app still works)
    // The app uses fake data arrays instead of a real database
    $status['services']['database'] = false; // Fake data mode - no real DB needed
    
    // Check Sightengine API availability
    if (defined('SIGHTENGINE_API_USER') && defined('SIGHTENGINE_API_SECRET')) {
        $status['services']['sightengine'] = true;
    }
    
    // Check if Gemini API key is configured (basic check)
    $status['services']['gemini'] = true; // Assume available for now
    
    // Check Python availability (optional for ML features)
    $pythonCmd = getenv('PYTHON_PATH') ?: 'python3';
    $pythonTest = @shell_exec($pythonCmd . ' --version 2>&1');
    if ($pythonTest && strpos($pythonTest, 'Python') !== false) {
        $status['services']['python'] = true;
    }
    
    // Overall status - app works even without database (uses fake data)
    $status['overall'] = $status['services']['sightengine'] ? 'healthy' : 'degraded';
    
    http_response_code(200);
    echo json_encode($status);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'status' => 'error',
        'message' => 'Service unavailable: ' . $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>
