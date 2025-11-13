<?php
// Debug endpoint for API testing
header('Content-Type: application/json');

// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo json_encode([
    'status' => 'debug_mode',
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => phpversion(),
    'extensions' => [
        'curl' => extension_loaded('curl'),
        'json' => extension_loaded('json'),
        'pdo' => extension_loaded('pdo')
    ],
    'config' => [
        'api_user' => defined('SIGHTENGINE_API_USER') ? SIGHTENGINE_API_USER : 'NOT_DEFINED',
        'api_url' => defined('SIGHTENGINE_API_URL') ? SIGHTENGINE_API_URL : 'NOT_DEFINED'
    ],
    'request_method' => $_SERVER['REQUEST_METHOD'],
    'post_data' => $_POST,
    'files_data' => $_FILES
]);
?>
