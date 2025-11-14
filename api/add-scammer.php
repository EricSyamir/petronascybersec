<?php
/**
 * Add Scammer API - FAKE VERSION
 * Returns success without actually storing data
 */

header('Content-Type: application/json');
require_once '../config/database.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
    exit;
}

// Validate required fields
$requiredFields = ['scam_type', 'description'];
foreach ($requiredFields as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
        exit;
    }
}

// Validate scam type
$validScamTypes = ['phishing', 'romance', 'investment', 'lottery', 'job', 'shopping', 'cryptocurrency', 'other'];
if (!in_array($input['scam_type'], $validScamTypes)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid scam type']);
    exit;
}

// Fake response - always succeed
$scammerId = rand(1000, 9999);
$isNew = rand(0, 1); // Randomly decide if it's new or existing

if ($isNew) {
    echo json_encode([
        'success' => true,
        'message' => 'New scammer added to database (fake data)',
        'scammer_id' => $scammerId,
        'action' => 'created'
    ]);
} else {
    echo json_encode([
        'success' => true,
        'message' => 'Existing scammer updated (fake data)',
        'scammer_id' => $scammerId,
        'action' => 'updated',
        'new_report_count' => rand(2, 20)
    ]);
}
?>
