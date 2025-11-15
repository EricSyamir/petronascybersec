<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/language.php';

class SightengineAPI {
    private $apiUser;
    private $apiSecret;
    private $apiUrl;
    
    public function __construct() {
        $this->apiUser = SIGHTENGINE_API_USER;
        $this->apiSecret = SIGHTENGINE_API_SECRET;
        $this->apiUrl = SIGHTENGINE_API_URL;
    }
    
    /**
     * Send JSON response
     */
    private function sendResponse($success, $data = null, $error = null) {
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
    public function validateFile($file) {
        // Check if file was uploaded
        if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
            return 'No file uploaded or upload error occurred.';
        }

        // Check file size
        if ($file['size'] > MAX_UPLOAD_SIZE) {
            return 'File size exceeds the maximum limit of ' . (MAX_UPLOAD_SIZE / 1024 / 1024) . 'MB.';
        }

        // Check file extension
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'mp4', 'mov', 'avi', 'mkv', 'webm'];
        $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($fileExtension, $allowedExtensions)) {
            return 'Invalid file type. Allowed types: ' . implode(', ', $allowedExtensions);
        }

        // Check if it's an image or video
        $isImage = in_array($fileExtension, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']);
        $isVideo = in_array($fileExtension, ['mp4', 'mov', 'avi', 'mkv', 'webm']);
        
        if ($isImage) {
            // Validate image file
            $imageInfo = getimagesize($file['tmp_name']);
            if ($imageInfo === false) {
                return 'Invalid image file.';
            }
        } elseif ($isVideo) {
            // Basic video file validation - check if file exists and has content
            if (!file_exists($file['tmp_name']) || filesize($file['tmp_name']) === 0) {
                return 'Invalid video file.';
            }
            
            // Validate MP4 duration (1 minute max)
            if ($fileExtension === 'mp4') {
                $duration = $this->getVideoDuration($file['tmp_name']);
                if ($duration !== null && $duration > 60) {
                    return 'MP4 video duration exceeds 1 minute limit. Maximum allowed duration is 60 seconds.';
                }
            }
        } else {
            return 'Unsupported file type.';
        }

        return null; // No errors
    }
    
    /**
     * Validate media URL (image or video)
     */
    public function validateImageUrl($url) {
        if (empty($url)) {
            return 'Media URL is required.';
        }

        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            return 'Invalid URL format.';
        }

        // Check if URL has media extension or is from known hosting services
        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
        $videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
        $allExtensions = array_merge($imageExtensions, $videoExtensions);
        $urlLower = strtolower($url);
        
        $hasMediaExtension = false;
        foreach ($allExtensions as $ext) {
            if (strpos($urlLower, '.' . $ext) !== false) {
                $hasMediaExtension = true;
                break;
            }
        }
        
        $isKnownMediaHost = (
            strpos($url, 'sightengine.com') !== false ||
            strpos($url, 'imgur.com') !== false ||
            strpos($url, 'unsplash.com') !== false ||
            strpos($url, 'pixabay.com') !== false ||
            strpos($url, 'pexels.com') !== false ||
            strpos($url, 'youtube.com') !== false ||
            strpos($url, 'youtu.be') !== false ||
            strpos($url, 'vimeo.com') !== false
        );
        
        if (!$hasMediaExtension && !$isKnownMediaHost) {
            return 'URL does not appear to be a valid media file. Please ensure the URL points to an image or video file or is from a supported hosting service.';
        }

        return null; // No errors
    }
    
    /**
     * Get video duration using FFmpeg if available, otherwise return null
     * Note: Requires FFmpeg to be installed on the server
     */
    private function getVideoDuration($filePath) {
        // Check if FFmpeg is available
        $ffmpegPath = $this->findFFmpeg();
        if (!$ffmpegPath) {
            // FFmpeg not available, skip server-side duration check
            // Client-side validation will handle this
            return null;
        }
        
        // Use FFmpeg to get video duration
        $command = escapeshellarg($ffmpegPath) . ' -i ' . escapeshellarg($filePath) . ' 2>&1';
        $output = shell_exec($command);
        
        // Parse duration from FFmpeg output
        if (preg_match('/Duration: (\d{2}):(\d{2}):(\d{2})\.(\d{2})/', $output, $matches)) {
            $hours = intval($matches[1]);
            $minutes = intval($matches[2]);
            $seconds = intval($matches[3]);
            $totalSeconds = ($hours * 3600) + ($minutes * 60) + $seconds;
            return $totalSeconds;
        }
        
        return null;
    }
    
    /**
     * Find FFmpeg executable path
     */
    private function findFFmpeg() {
        // Try to find via which/where command first (most reliable)
        $whichCommand = strtoupper(substr(PHP_OS, 0, 3)) === 'WIN' ? 'where' : 'which';
        $result = @shell_exec($whichCommand . ' ffmpeg 2>&1');
        if ($result && !empty(trim($result)) && file_exists(trim($result))) {
            return trim($result);
        }
        
        // Try common paths
        $possiblePaths = [
            '/usr/bin/ffmpeg',
            '/usr/local/bin/ffmpeg',
            'C:\\ffmpeg\\bin\\ffmpeg.exe', // Windows
        ];
        
        foreach ($possiblePaths as $path) {
            if (file_exists($path) && is_executable($path)) {
                return $path;
            }
        }
        
        return null;
    }
    
    /**
     * Clean up temporary file
     */
    public function cleanupFile($filePath) {
        if (file_exists($filePath)) {
            unlink($filePath);
        }
    }
    
    /**
     * Analyze media file for AI-generated content using Sightengine API
     * Uses different endpoints for images vs videos
     */
    public function analyzeFile($filePath, $models = null) {
        if (!file_exists($filePath)) {
            return ['error' => 'File not found: ' . $filePath];
        }
        
        // Determine if file is image or video
        $fileExtension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        $isImage = in_array($fileExtension, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']);
        $isVideo = in_array($fileExtension, ['mp4', 'mov', 'avi', 'mkv', 'webm']);
        
        if (!$isImage && !$isVideo) {
            return ['error' => 'Unsupported file type'];
        }
        
        // Set appropriate endpoint and models
        // NOTE: genai for both videos AND images, deepfake ONLY for images
        if ($isImage) {
            $apiUrl = 'https://api.sightengine.com/1.0/check.json';
            $models = $models ?: 'genai,deepfake'; // genai + deepfake for images
        } else {
            // Video - only genai, no deepfake
            $apiUrl = 'https://api.sightengine.com/1.0/video/check-sync.json';
            $models = $models ?: 'genai'; // Only genai for videos
        }
        
        // Prepare the request with the specified parameters
        $params = array(
            'media' => new CURLFile($filePath),
            'models' => $models,
            'api_user' => $this->apiUser,
            'api_secret' => $this->apiSecret,
        );
        
        $ch = curl_init($apiUrl);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
        curl_setopt($ch, CURLOPT_TIMEOUT, 60); // Increased timeout for videos
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_USERAGENT, 'PETRONAS-Cybercrime-Platform/1.0');
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            return ['error' => 'Network error: ' . $curlError];
        }

        if ($httpCode !== 200) {
            return ['error' => 'API request failed with HTTP code: ' . $httpCode . '. Response: ' . substr($response, 0, 200)];
        }

        $result = json_decode($response, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            return ['error' => 'Invalid API response format'];
        }

        return $result;
    }
    
    /**
     * Analyze media from URL for AI-generated content
     * Uses different endpoints for images vs videos
     */
    public function analyzeUrl($url, $models = null) {
        // Validate URL first
        $validationError = $this->validateImageUrl($url);
        if ($validationError) {
            return ['error' => $validationError];
        }
        
        // Determine if URL is image or video
        $urlLower = strtolower($url);
        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
        $videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
        
        $isImage = false;
        $isVideo = false;
        
        foreach ($imageExtensions as $ext) {
            if (strpos($urlLower, '.' . $ext) !== false) {
                $isImage = true;
                break;
            }
        }
        
        if (!$isImage) {
            foreach ($videoExtensions as $ext) {
                if (strpos($urlLower, '.' . $ext) !== false) {
                    $isVideo = true;
                    break;
                }
            }
        }
        
        // Default to image if can't determine
        if (!$isImage && !$isVideo) {
            $isImage = true; // Default to image endpoint
        }
        
        // Set appropriate endpoint and models
        // NOTE: genai for both videos AND images, deepfake ONLY for images
        if ($isImage) {
            $apiUrl = 'https://api.sightengine.com/1.0/check.json';
            $models = $models ?: 'genai,deepfake'; // genai + deepfake for images
        } else {
            // Video - only genai, no deepfake
            $apiUrl = 'https://api.sightengine.com/1.0/video/check-sync.json';
            $models = $models ?: 'genai'; // Only genai for videos
        }
        
        $params = array(
            'url' => $url,
            'models' => $models,
            'api_user' => $this->apiUser,
            'api_secret' => $this->apiSecret,
        );
        
        // For images, use GET request with query string
        // For videos, use POST request
        if ($isImage) {
            $apiUrl = $apiUrl . '?' . http_build_query($params);
            $ch = curl_init($apiUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        } else {
            // Video URL - use POST
            $ch = curl_init($apiUrl);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 60); // Increased timeout for videos
        }
        
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_USERAGENT, 'PETRONAS-Cybercrime-Platform/1.0');
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            return ['error' => 'Network error: ' . $curlError];
        }

        if ($httpCode !== 200) {
            return ['error' => 'API request failed with HTTP code: ' . $httpCode . '. Response: ' . substr($response, 0, 200)];
        }

        $result = json_decode($response, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            return ['error' => 'Invalid API response format'];
        }

        return $result;
    }
    
    
    /**
     * Process and save detection results - FAKE VERSION (no database)
     */
    public function processDetection($filePath, $results, $reportId = null) {
        try {
            // Generate file hash for deduplication
            $fileHash = hash_file('sha256', $filePath);
            
            // Analyze results for deepfake indicators
            $analysis = $this->analyzeResults($results);
            
            // Generate fake detection ID
            $detectionId = rand(1000, 9999);
            
            return [
                'id' => $detectionId,
                'detection_results' => $results, // Return as object
                'analysis' => $analysis,
                'file_hash' => $fileHash
            ];
            
        } catch (Exception $e) {
            error_log("Detection processing error: " . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Analyze Sightengine results for AI-generated content and deepfakes
     * Handles both image and video response formats
     */
    public function analyzeResults($results) {
        // Handle error responses
        if (isset($results['error'])) {
            return [
                'is_ai_generated' => false,
                'is_deepfake' => false,
                'confidence_score' => 0.0,
                'ai_generated_score' => 0.0,
                'deepfake_score' => 0.0,
                'indicators' => ['Error: ' . $results['error']],
                'raw_results' => $results,
                'error' => $results['error']
            ];
        }
        
        // Check for API error status
        if (isset($results['status']) && $results['status'] === 'failure') {
            $errorMsg = isset($results['error']['message']) ? $results['error']['message'] : 'API request failed';
            return [
                'is_ai_generated' => false,
                'is_deepfake' => false,
                'confidence_score' => 0.0,
                'ai_generated_score' => 0.0,
                'deepfake_score' => 0.0,
                'indicators' => ['Error: ' . $errorMsg],
                'raw_results' => $results,
                'error' => $errorMsg
            ];
        }
        
        $isAIGenerated = false;
        $isDeepfake = false;
        $confidenceScore = 0.0;
        $aiGeneratedScore = 0.0;
        $deepfakeScore = 0.0;
        $indicators = [];
        
        // VIDEO RESPONSE FORMAT: data.frames[].type.ai_generated
        if (isset($results['data']['frames']) && is_array($results['data']['frames'])) {
            // This is a video response
            $frames = $results['data']['frames'];
            $frameScores = [];
            
            foreach ($frames as $frame) {
                if (isset($frame['type']['ai_generated'])) {
                    $frameScores[] = floatval($frame['type']['ai_generated']);
                }
            }
            
            if (!empty($frameScores)) {
                // Calculate average score across all frames
                $aiGeneratedScore = array_sum($frameScores) / count($frameScores);
                
                if ($aiGeneratedScore > 0.5) {
                    $isAIGenerated = true;
                    $indicators[] = 'AI-generated video detected (confidence: ' . round($aiGeneratedScore * 100, 1) . '%, analyzed ' . count($frames) . ' frames)';
                } else {
                    $indicators[] = 'Natural video content detected (confidence: ' . round((1 - $aiGeneratedScore) * 100, 1) . '%, analyzed ' . count($frames) . ' frames)';
                }
                
                $confidenceScore = $aiGeneratedScore;
            }
        }
        // IMAGE RESPONSE FORMAT: type.ai_generated and type.deepfake
        else {
            // Check for AI-generated content using the genai model response format
            if (isset($results['type']['ai_generated'])) {
                $aiScore = floatval($results['type']['ai_generated']);
                $aiGeneratedScore = $aiScore;
                
                if ($aiScore > 0.5) {
                    $isAIGenerated = true;
                    $indicators[] = 'AI-generated content detected (confidence: ' . round($aiScore * 100, 1) . '%)';
                } else {
                    $indicators[] = 'Natural content detected (confidence: ' . round((1 - $aiScore) * 100, 1) . '%)';
                }
            }
            
            // Check for deepfake content using the deepfake model response format (images only)
            if (isset($results['type']['deepfake'])) {
                $deepfakeValue = floatval($results['type']['deepfake']);
                $deepfakeScore = $deepfakeValue;
                
                if ($deepfakeValue > 0.5) {
                    $isDeepfake = true;
                    $isAIGenerated = true; // Deepfake is a type of AI-generated content
                    $indicators[] = 'Deepfake detected (confidence: ' . round($deepfakeValue * 100, 1) . '%)';
                } else {
                    $indicators[] = 'No deepfake detected (authenticity: ' . round((1 - $deepfakeValue) * 100, 1) . '%)';
                }
            }
            
            // Calculate overall confidence score - use the maximum of both scores if available
            if ($aiGeneratedScore > 0 && $deepfakeScore > 0) {
                $confidenceScore = max($aiGeneratedScore, $deepfakeScore);
            } elseif ($deepfakeScore > 0) {
                $confidenceScore = $deepfakeScore;
            } elseif ($aiGeneratedScore > 0) {
                $confidenceScore = $aiGeneratedScore;
            }
        }
        
        // Additional analysis for comprehensive detection
        if (isset($results['text']['has_artificial']) && $results['text']['has_artificial'] > 0.5) {
            $indicators[] = 'Artificial text content detected';
        }
        
        if (isset($results['text']['has_natural']) && $results['text']['has_natural'] > 0.5) {
            $indicators[] = 'Natural text content detected';
        }
        
        return [
            'is_ai_generated' => $isAIGenerated,
            'is_deepfake' => $isDeepfake || $isAIGenerated, // Deepfake or AI-generated content
            'confidence_score' => round($confidenceScore, 4),
            'ai_generated_score' => round($aiGeneratedScore, 4),
            'deepfake_score' => round($deepfakeScore, 4),
            'indicators' => $indicators,
            'raw_results' => $results,
            'method' => 'sightengine_api'
        ];
    }
    
    /**
     * Get detection statistics - FAKE VERSION
     */
    public function getDetectionStats($timeframe = '24h') {
        // Return fake statistics
        return [
            'total_scans' => 156,
            'deepfakes_found' => 23,
            'avg_confidence' => 0.7842,
            'max_confidence' => 0.9823
        ];
    }
}

// API endpoint for AJAX requests - only run when accessed directly via HTTP
if (basename($_SERVER['PHP_SELF']) === 'sightengine.php' && isset($_SERVER['REQUEST_METHOD'])) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    // Clean any previous output
    if (ob_get_level()) {
        ob_clean();
    }
    
    // Set proper headers
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-cache, must-revalidate');
    
    // Disable error display to prevent HTML in JSON response
    ini_set('display_errors', 0);
    error_reporting(E_ALL);
    
    try {
        // Rate limiting
        if (!checkRateLimit('deepfake_scan', 10, 300)) { // 10 scans per 5 minutes
            throw new Exception('Rate limit exceeded. Please wait before scanning again.');
        }
        
        $sightengine = new SightengineAPI();
        $action = $_POST['action'];
        
        switch ($action) {
            case 'analyze_upload':
                if (!isset($_FILES['media'])) {
                    throw new Exception('No file uploaded');
                }
                
                // Validate the uploaded file using improved validation
                $validationError = $sightengine->validateFile($_FILES['media']);
                if ($validationError) {
                    throw new Exception($validationError);
                }
                
                $uploadDir = '../uploads/deepfake_scans/';
                if (!file_exists($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                }
                
                $file = $_FILES['media'];
                $fileName = uniqid('ai_check_') . '_' . basename($file['name']);
                $filePath = $uploadDir . $fileName;
                
                if (!move_uploaded_file($file['tmp_name'], $filePath)) {
                    throw new Exception('Failed to save uploaded file');
                }
                
                try {
                    // Analyze with Sightengine
                    $results = $sightengine->analyzeFile($filePath);
                    
                    // Check for API errors in results
                    if (isset($results['error'])) {
                        throw new Exception($results['error']);
                    }
                    
                    $detection = $sightengine->processDetection($filePath, $results);
                    
                    // Run ELA analysis for images (JPG/PNG only)
                    $elaResult = null;
                    $elaError = null;
                    $fileExtension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
                    $isImageForELA = in_array($fileExtension, ['jpg', 'jpeg', 'png']);
                    
                    error_log("ELA DEBUG: File extension: $fileExtension, isImageForELA: " . ($isImageForELA ? 'true' : 'false'));
                    
                    if ($isImageForELA) {
                        try {
                            error_log("ELA DEBUG: Starting ELA analysis for file: $filePath");
                            
                            // Include ELA analysis functions
                            require_once __DIR__ . '/ela_analysis.php';
                            
                            // Run ELA analysis with quality 75
                            $elaResult = runELAAnalysis($filePath, 75);
                            
                            error_log("ELA DEBUG: ELA analysis completed successfully");
                            error_log("ELA DEBUG: ELA result keys: " . implode(', ', array_keys($elaResult)));
                            error_log("ELA DEBUG: ELA output_url: " . ($elaResult['output_url'] ?? 'NOT SET'));
                            
                        } catch (Exception $elaError) {
                            // ELA is optional, log error but continue
                            $errorMsg = "ELA analysis error (non-critical): " . $elaError->getMessage();
                            error_log($errorMsg);
                            error_log("ELA DEBUG: Exception trace: " . $elaError->getTraceAsString());
                            $elaResult = null;
                            $elaError = $errorMsg;
                        }
                    } else {
                        error_log("ELA DEBUG: Skipping ELA - not a JPG/PNG image");
                    }
                    
                    $response = [
                        'success' => true,
                        'detection' => $detection,
                        'file_path' => $filePath,
                        'message' => translateText('analysis_complete')
                    ];
                    
                    // Add ELA result to detection object if available
                    if ($elaResult !== null) {
                        error_log("ELA DEBUG: Adding ELA result to response");
                        $response['ela_result'] = $elaResult;
                        // Also add to detection for easier access
                        if (isset($detection['analysis'])) {
                            $detection['analysis']['ela_result'] = $elaResult;
                        }
                        $response['detection'] = $detection;
                    } else {
                        error_log("ELA DEBUG: ELA result is null - NOT adding to response");
                        if ($elaError) {
                            $response['ela_error'] = $elaError; // Include error in response for debugging
                        }
                    }
                    
                    echo json_encode($response);
                    
                } catch (Exception $e) {
                    // Clean up the temporary file in case of exception
                    $sightengine->cleanupFile($filePath);
                    throw $e;
                } finally {
                    // Clean up temporary file (but keep ELA output images)
                    $sightengine->cleanupFile($filePath);
                }
                break;
                
            case 'analyze_url':
                if (!isset($_POST['url']) || empty($_POST['url'])) {
                    throw new Exception('No URL provided');
                }
                
                $url = trim($_POST['url']);
                
                // Analyze with Sightengine (validation is done inside analyzeUrl)
                $results = $sightengine->analyzeUrl($url);
                
                // Check for API errors in results
                if (isset($results['error'])) {
                    throw new Exception($results['error']);
                }
                
                $analysis = $sightengine->analyzeResults($results);
                
                echo json_encode([
                    'success' => true,
                    'analysis' => $analysis,
                    'url' => $url,
                    'message' => translateText('analysis_complete')
                ]);
                break;
                
            case 'get_stats':
                $timeframe = $_POST['timeframe'] ?? '24h';
                $stats = $sightengine->getDetectionStats($timeframe);
                
                echo json_encode([
                    'success' => true,
                    'stats' => $stats
                ]);
                break;
                
            default:
                throw new Exception('Invalid action');
        }
        
    } catch (Exception $e) {
        // Log the error for debugging
        error_log("Sightengine API Error: " . $e->getMessage());
        
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage(),
            'debug_info' => [
                'timestamp' => date('Y-m-d H:i:s'),
                'api_user' => $sightengine->apiUser ?? SIGHTENGINE_API_USER,
                'api_url' => $sightengine->apiUrl ?? SIGHTENGINE_API_URL
            ]
        ], JSON_UNESCAPED_UNICODE);
    }
    exit;
    } else {
        // Handle non-POST requests only when accessed directly via HTTP
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid request method. Use POST.'
        ]);
    }
}
?>
