<?php
/**
 * AI Detection API Endpoint
 * Uses the PyTorch model for AI vs Human image detection
 * Only works with images (not videos)
 */

// Include the AIDetectionTester class
require_once __DIR__ . '/../includes/ai_detection_tester.php';

header('Content-Type: application/json');

// Handle CORS if needed
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    }
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    }
    exit(0);
}

try {
    $action = $_POST['action'] ?? $_GET['action'] ?? '';
    
    if ($action === 'analyze_upload') {
        // Handle file upload
        if (!isset($_FILES['media'])) {
            echo json_encode([
                'success' => false,
                'error' => 'No file uploaded'
            ]);
            exit;
        }
        
        $file = $_FILES['media'];
        
        // Check if it's an image (ML only works with images)
        $imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
        if (!in_array($file['type'], $imageTypes)) {
            echo json_encode([
                'success' => false,
                'error' => 'Machine Learning detection only supports images. Videos are not supported.',
                'is_video' => true
            ]);
            exit;
        }
        
        // Validate upload
        if ($file['error'] !== UPLOAD_ERR_OK) {
            echo json_encode([
                'success' => false,
                'error' => 'File upload error: ' . $file['error']
            ]);
            exit;
        }
        
        // Perform detection
        $detector = new AIDetectionTester();
        $result = $detector->detectUploadedFile($file);
        
        echo json_encode($result);
        
    } elseif ($action === 'analyze_url') {
        // Handle URL analysis
        $url = $_POST['url'] ?? $_GET['url'] ?? '';
        
        if (empty($url)) {
            echo json_encode([
                'success' => false,
                'error' => 'No URL provided'
            ]);
            exit;
        }
        
        // Check if URL is an image
        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
        $urlLower = strtolower($url);
        $isImage = false;
        
        foreach ($imageExtensions as $ext) {
            if (strpos($urlLower, '.' . $ext) !== false) {
                $isImage = true;
                break;
            }
        }
        
        if (!$isImage) {
            echo json_encode([
                'success' => false,
                'error' => 'Machine Learning detection only supports images. Videos are not supported.',
                'is_video' => true
            ]);
            exit;
        }
        
        // Download image temporarily
        $tempFile = tempnam(sys_get_temp_dir(), 'ai_detection_');
        $tempFile .= '.jpg';
        
        $imageData = @file_get_contents($url);
        if ($imageData === false) {
            echo json_encode([
                'success' => false,
                'error' => 'Failed to download image from URL'
            ]);
            exit;
        }
        
        file_put_contents($tempFile, $imageData);
        
        // Perform detection
        $detector = new AIDetectionTester();
        $result = $detector->detect($tempFile);
        
        // Clean up temp file
        if (file_exists($tempFile)) {
            unlink($tempFile);
        }
        
        echo json_encode($result);
        
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Invalid action. Use "analyze_upload" or "analyze_url"'
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}

