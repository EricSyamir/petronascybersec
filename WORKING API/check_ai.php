<?php
require_once 'config.php';

header('Content-Type: application/json');

// Enable CORS if needed
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

/**
 * Send JSON response
 */
function sendResponse($success, $data = null, $error = null) {
    echo json_encode([
        'success' => $success,
        'result' => $data,
        'error' => $error
    ]);
    exit;
}

/**
 * Validate uploaded file
 */
function validateFile($file) {
    // Check if file was uploaded
    if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
        return 'No file uploaded or upload error occurred.';
    }

    // Check file size
    if ($file['size'] > MAX_FILE_SIZE) {
        return 'File size exceeds the maximum limit of ' . (MAX_FILE_SIZE / 1024 / 1024) . 'MB.';
    }

    // Check file extension
    $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($fileExtension, ALLOWED_EXTENSIONS)) {
        return 'Invalid file type. Allowed types: ' . implode(', ', ALLOWED_EXTENSIONS);
    }

    // Check if it's actually an image
    $imageInfo = getimagesize($file['tmp_name']);
    if ($imageInfo === false) {
        return 'Invalid image file.';
    }

    return null; // No errors
}

/**
 * Save uploaded file temporarily
 */
function saveUploadedFile($file) {
    $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $fileName = uniqid('ai_check_') . '.' . $fileExtension;
    $filePath = UPLOAD_DIR . $fileName;
    
    if (move_uploaded_file($file['tmp_name'], $filePath)) {
        return $filePath;
    }
    
    return false;
}

/**
 * Call SightEngine API to check for AI-generated content using file upload
 */
function checkAIContentByFile($imagePath) {
    $params = [
        'media' => new CurlFile($imagePath),
        'models' => 'genai',
        'api_user' => SIGHTENGINE_API_USER,
        'api_secret' => SIGHTENGINE_API_SECRET,
    ];

    $ch = curl_init(SIGHTENGINE_API_URL);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Only for development
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        return ['error' => 'Network error: ' . $curlError];
    }

    if ($httpCode !== 200) {
        return ['error' => 'API request failed with HTTP code: ' . $httpCode];
    }

    $result = json_decode($response, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        return ['error' => 'Invalid API response format'];
    }

    return $result;
}

/**
 * Call SightEngine API to check for AI-generated content using URL
 */
function checkAIContentByUrl($imageUrl) {
    $params = [
        'url' => $imageUrl,
        'models' => 'genai',
        'api_user' => SIGHTENGINE_API_USER,
        'api_secret' => SIGHTENGINE_API_SECRET,
    ];

    $url = SIGHTENGINE_API_URL . '?' . http_build_query($params);
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Only for development
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        return ['error' => 'Network error: ' . $curlError];
    }

    if ($httpCode !== 200) {
        return ['error' => 'API request failed with HTTP code: ' . $httpCode];
    }

    $result = json_decode($response, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        return ['error' => 'Invalid API response format'];
    }

    return $result;
}

/**
 * Validate image URL
 */
function validateImageUrl($url) {
    if (empty($url)) {
        return 'Image URL is required.';
    }

    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        return 'Invalid URL format.';
    }

    // Check if URL has image extension or is from known image hosting services
    $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
    $urlLower = strtolower($url);
    
    $hasImageExtension = false;
    foreach ($imageExtensions as $ext) {
        if (strpos($urlLower, '.' . $ext) !== false) {
            $hasImageExtension = true;
            break;
        }
    }
    
    $isKnownImageHost = (
        strpos($url, 'sightengine.com') !== false ||
        strpos($url, 'imgur.com') !== false ||
        strpos($url, 'unsplash.com') !== false ||
        strpos($url, 'pixabay.com') !== false ||
        strpos($url, 'pexels.com') !== false
    );
    
    if (!$hasImageExtension && !$isKnownImageHost) {
        return 'URL does not appear to be a valid image. Please ensure the URL points to an image file or is from a supported image hosting service.';
    }

    return null; // No errors
}

/**
 * Clean up temporary file
 */
function cleanupFile($filePath) {
    if (file_exists($filePath)) {
        unlink($filePath);
    }
}

// Main execution
try {
    // Check if request method is POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendResponse(false, null, 'Only POST requests are allowed.');
    }

    $apiResult = null;
    $tempFilePath = null;

    // Check if it's a URL-based request
    if (isset($_POST['image_url']) && !empty($_POST['image_url'])) {
        // Handle URL-based image checking
        $imageUrl = trim($_POST['image_url']);
        
        // Validate the URL
        $validationError = validateImageUrl($imageUrl);
        if ($validationError) {
            sendResponse(false, null, $validationError);
        }

        // Call SightEngine API with URL
        $apiResult = checkAIContentByUrl($imageUrl);
        
    } elseif (isset($_FILES['image'])) {
        // Handle file upload-based image checking
        
        // Validate the uploaded file
        $validationError = validateFile($_FILES['image']);
        if ($validationError) {
            sendResponse(false, null, $validationError);
        }

        // Save the uploaded file temporarily
        $tempFilePath = saveUploadedFile($_FILES['image']);
        if (!$tempFilePath) {
            sendResponse(false, null, 'Failed to save uploaded file.');
        }

        try {
            // Call SightEngine API with file
            $apiResult = checkAIContentByFile($tempFilePath);
            
        } catch (Exception $e) {
            // Clean up the temporary file in case of exception
            if ($tempFilePath) {
                cleanupFile($tempFilePath);
            }
            sendResponse(false, null, 'Processing error: ' . $e->getMessage());
        }
        
    } else {
        sendResponse(false, null, 'No image file or URL provided.');
    }

    // Clean up temporary file if it exists
    if ($tempFilePath) {
        cleanupFile($tempFilePath);
    }
    
    // Check for API errors
    if (isset($apiResult['error'])) {
        sendResponse(false, null, $apiResult['error']);
    }

    // Check if the API returned an error status
    if (isset($apiResult['status']) && $apiResult['status'] === 'failure') {
        $errorMsg = isset($apiResult['error']['message']) ? $apiResult['error']['message'] : 'API request failed';
        sendResponse(false, null, $errorMsg);
    }

    // Extract AI detection results
    $aiGenerated = 0;
    if (isset($apiResult['type']['ai_generated'])) {
        $aiGenerated = floatval($apiResult['type']['ai_generated']);
    }

    // Prepare response data
    $responseData = [
        'ai_generated' => $aiGenerated,
        'confidence' => $aiGenerated,
        'is_ai' => $aiGenerated > 0.5,
        'method' => isset($_POST['image_url']) ? 'url' : 'upload',
        'raw_response' => $apiResult // Include full API response for debugging
    ];

    sendResponse(true, $responseData);

} catch (Exception $e) {
    // Clean up temporary file if it exists
    if (isset($tempFilePath) && $tempFilePath) {
        cleanupFile($tempFilePath);
    }
    sendResponse(false, null, 'Server error: ' . $e->getMessage());
}
?>
