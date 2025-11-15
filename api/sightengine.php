<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/language.php';

class SightengineAPI {
    private $apiUser;
    private $apiSecret;
    private $apiUrl;
    private $geminiApiKey;
    private $geminiEndpoint;
    
    public function __construct() {
        $this->apiUser = SIGHTENGINE_API_USER;
        $this->apiSecret = SIGHTENGINE_API_SECRET;
        $this->apiUrl = SIGHTENGINE_API_URL;
        
        // Gemini API for transcript analysis
        $this->geminiApiKey = 'AIzaSyCOnJaGxm18KuXFBj7kJdo16mEcdmyJYzw';
        $this->geminiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
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
     * Extract audio from video file and return audio file path
     */
    private function extractAudioFromVideo($videoPath) {
        $ffmpegPath = $this->findFFmpeg();
        if (!$ffmpegPath) {
            error_log("FFmpeg not found - skipping audio extraction");
            return null;
        }
        
        // Create temporary audio file
        $audioPath = sys_get_temp_dir() . '/audio_' . uniqid() . '.wav';
        
        // Extract audio using FFmpeg
        $command = escapeshellarg($ffmpegPath) . ' -i ' . escapeshellarg($videoPath) . 
                   ' -vn -acodec pcm_s16le -ar 16000 -ac 1 ' . escapeshellarg($audioPath) . ' 2>&1';
        
        $output = shell_exec($command);
        
        if (file_exists($audioPath) && filesize($audioPath) > 0) {
            return $audioPath;
        }
        
        error_log("Failed to extract audio: " . $output);
        return null;
    }
    
    /**
     * Transcribe audio using Gemini 2.0 Flash with audio support
     */
    private function transcribeAudio($audioPath) {
        try {
            // Read audio file and convert to base64
            $audioData = file_get_contents($audioPath);
            if (!$audioData) {
                return null;
            }
            
            $base64Audio = base64_encode($audioData);
            
            // Use Gemini 2.0 Flash for audio transcription
            $requestBody = [
                'contents' => [
                    [
                        'parts' => [
                            [
                                'inline_data' => [
                                    'mime_type' => 'audio/wav',
                                    'data' => $base64Audio
                                ]
                            ],
                            [
                                'text' => 'Please transcribe the audio from this video. Provide only the transcript text without any additional commentary.'
                            ]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.1,
                    'maxOutputTokens' => 2048
                ]
            ];
            
            $ch = curl_init($this->geminiEndpoint . '?key=' . $this->geminiApiKey);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestBody));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_TIMEOUT, 60);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($httpCode !== 200) {
                error_log("Gemini transcription failed: HTTP $httpCode - $response");
                return null;
            }
            
            $result = json_decode($response, true);
            
            if (isset($result['candidates'][0]['content']['parts'][0]['text'])) {
                return $result['candidates'][0]['content']['parts'][0]['text'];
            }
            
            return null;
            
        } catch (Exception $e) {
            error_log("Transcription error: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Transcribe video using Gemini API with file upload method
     * This method uploads the video file to Gemini, waits for processing, then transcribes
     */
    private function transcribeVideo($videoPath) {
        try {
            error_log("Starting video transcription using Gemini file upload API");
            
            if (!file_exists($videoPath)) {
                error_log("Video file not found: " . $videoPath);
                return null;
            }
            
            $videoMimeType = 'video/mp4';
            $fileExtension = strtolower(pathinfo($videoPath, PATHINFO_EXTENSION));
            
            // Determine MIME type based on extension
            $mimeTypes = [
                'mp4' => 'video/mp4',
                'mov' => 'video/quicktime',
                'avi' => 'video/x-msvideo',
                'mkv' => 'video/x-matroska',
                'webm' => 'video/webm'
            ];
            if (isset($mimeTypes[$fileExtension])) {
                $videoMimeType = $mimeTypes[$fileExtension];
            }
            
            // ==========================================================
            // STEP 1: UPLOAD THE VIDEO FILE TO GEMINI
            // ==========================================================
            error_log("Step 1: Uploading video file to Gemini API...");
            $fileBytes = file_get_contents($videoPath);
            if (!$fileBytes) {
                error_log("Failed to read video file");
                return null;
            }
            
            $uploadUrl = 'https://generativelanguage.googleapis.com/upload/v1beta/files?key=' . $this->geminiApiKey . '&uploadType=media';
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $uploadUrl);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $fileBytes);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: ' . $videoMimeType]);
            curl_setopt($ch, CURLOPT_TIMEOUT, 120); // Increased timeout for file upload
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $err = curl_error($ch);
            curl_close($ch);
            
            if ($err) {
                error_log("cURL Error (Upload): " . $err);
                return null;
            }
            
            if ($httpCode !== 200) {
                error_log("Upload failed: HTTP $httpCode - $response");
                return null;
            }
            
            $uploadResult = json_decode($response, true);
            if (!isset($uploadResult['file'])) {
                error_log("Error uploading file: " . $response);
                return null;
            }
            
            $fileUri = $uploadResult['file']['uri'];
            $fileName = $uploadResult['file']['name']; // e.g., "files/abc-123"
            error_log("File uploaded successfully. URI: $fileUri, Name: $fileName");
            
            // ==========================================================
            // STEP 2: POLL FOR FILE STATUS (wait until ACTIVE)
            // ==========================================================
            error_log("Step 2: Waiting for file to be processed...");
            $fileApiUrl = 'https://generativelanguage.googleapis.com/v1beta/' . $fileName . '?key=' . $this->geminiApiKey;
            $fileState = '';
            $maxAttempts = 12; // Maximum 60 seconds (12 * 5)
            $attempt = 0;
            
            while ($fileState !== 'ACTIVE' && $attempt < $maxAttempts) {
                $attempt++;
                error_log("Polling attempt $attempt/$maxAttempts...");
                
                sleep(5); // Wait 5 seconds between polls
                
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, $fileApiUrl);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 30);
                
                $response = curl_exec($ch);
                $err = curl_error($ch);
                curl_close($ch);
                
                if ($err) {
                    error_log("cURL Error (Polling): " . $err);
                    continue;
                }
                
                $fileData = json_decode($response, true);
                if (isset($fileData['state'])) {
                    $fileState = $fileData['state'];
                    error_log("File state: $fileState");
                } elseif (isset($fileData['error'])) {
                    error_log("Error checking file state: " . $fileData['error']['message']);
                    return null;
                }
                
                if ($fileState === 'FAILED') {
                    error_log("File processing failed");
                    return null;
                }
            }
            
            if ($fileState !== 'ACTIVE') {
                error_log("File did not become ACTIVE within timeout period");
                return null;
            }
            
            error_log("File is ACTIVE and ready for transcription");
            
            // ==========================================================
            // STEP 3: REQUEST TRANSCRIPTION
            // ==========================================================
            error_log("Step 3: Sending transcription request...");
            $modelUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . $this->geminiApiKey;
            
            $prompt = 'Please provide a full, accurate transcript of this video. Provide only the transcript text without any additional commentary.';
            
            $postData = [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt],
                            [
                                'fileData' => [
                                    'mimeType' => $videoMimeType,
                                    'fileUri' => $fileUri
                                ]
                            ]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.1,
                    'maxOutputTokens' => 2048
                ]
            ];
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $modelUrl);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_TIMEOUT, 120);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $err = curl_error($ch);
            curl_close($ch);
            
            if ($err) {
                error_log("cURL Error (Transcription): " . $err);
                return null;
            }
            
            if ($httpCode !== 200) {
                error_log("Transcription failed: HTTP $httpCode - $response");
                return null;
            }
            
            $result = json_decode($response, true);
            
            if (!isset($result['candidates'][0]['content']['parts'][0]['text'])) {
                error_log("Error in transcription response: " . $response);
                return null;
            }
            
            $transcript = $result['candidates'][0]['content']['parts'][0]['text'];
            error_log("Transcription completed successfully. Length: " . strlen($transcript) . " characters");
            
            return $transcript;
            
        } catch (Exception $e) {
            error_log("Video transcription error: " . $e->getMessage());
            error_log("Exception trace: " . $e->getTraceAsString());
            return null;
        }
    }
    
    /**
     * Analyze transcript for AI/deepfake/impersonation indicators using LLM
     */
    private function analyzeTranscriptWithLLM($transcript) {
        try {
            $prompt = "Analyze this video transcript for AI-generated content, deepfake, and impersonation indicators.\n\n";
            $prompt .= "Transcript:\n\"" . $transcript . "\"\n\n";
            $prompt .= "Please analyze and provide a detailed assessment focusing on:\n";
            $prompt .= "1. AI-generated speech patterns (unnatural cadence, robotic tone indicators)\n";
            $prompt .= "2. Deepfake indicators (inconsistent voice characteristics, audio artifacts)\n";
            $prompt .= "3. Impersonation attempts (mimicking celebrities, authority figures, brands)\n";
            $prompt .= "4. Scam indicators (urgency, financial requests, suspicious claims)\n";
            $prompt .= "5. Malaysian-specific scam patterns (fake PETRONAS, government agencies, banks)\n\n";
            $prompt .= "Respond with JSON only:\n";
            $prompt .= "{\n";
            $prompt .= "  \"is_ai_generated\": boolean,\n";
            $prompt .= "  \"is_deepfake\": boolean,\n";
            $prompt .= "  \"is_impersonation\": boolean,\n";
            $prompt .= "  \"confidence_score\": number (0-1),\n";
            $prompt .= "  \"ai_speech_score\": number (0-1),\n";
            $prompt .= "  \"deepfake_score\": number (0-1),\n";
            $prompt .= "  \"impersonation_score\": number (0-1),\n";
            $prompt .= "  \"scam_score\": number (0-1),\n";
            $prompt .= "  \"indicators\": [array of specific indicators found],\n";
            $prompt .= "  \"impersonation_target\": \"name of person/brand being impersonated\" | null,\n";
            $prompt .= "  \"scam_type\": \"phishing\" | \"investment\" | \"job\" | \"lottery\" | \"romance\" | \"other\" | null,\n";
            $prompt .= "  \"reasoning\": \"brief explanation\",\n";
            $prompt .= "  \"suspicious_phrases\": [array of suspicious phrases from transcript]\n";
            $prompt .= "}";
            
            $requestBody = [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.1,
                    'topK' => 1,
                    'topP' => 1,
                    'maxOutputTokens' => 2048
                ]
            ];
            
            $ch = curl_init($this->geminiEndpoint . '?key=' . $this->geminiApiKey);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestBody));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_TIMEOUT, 60);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($httpCode !== 200) {
                error_log("Gemini analysis failed: HTTP $httpCode - $response");
                return null;
            }
            
            $result = json_decode($response, true);
            
            if (isset($result['candidates'][0]['content']['parts'][0]['text'])) {
                $analysisText = $result['candidates'][0]['content']['parts'][0]['text'];
                
                // Extract JSON from response
                if (preg_match('/\{[\s\S]*\}/', $analysisText, $matches)) {
                    $analysisResult = json_decode($matches[0], true);
                    
                    if ($analysisResult) {
                        // Validate and sanitize
                        return [
                            'is_ai_generated' => (bool)($analysisResult['is_ai_generated'] ?? false),
                            'is_deepfake' => (bool)($analysisResult['is_deepfake'] ?? false),
                            'is_impersonation' => (bool)($analysisResult['is_impersonation'] ?? false),
                            'confidence_score' => (float)min(1, max(0, $analysisResult['confidence_score'] ?? 0)),
                            'ai_speech_score' => (float)min(1, max(0, $analysisResult['ai_speech_score'] ?? 0)),
                            'deepfake_score' => (float)min(1, max(0, $analysisResult['deepfake_score'] ?? 0)),
                            'impersonation_score' => (float)min(1, max(0, $analysisResult['impersonation_score'] ?? 0)),
                            'scam_score' => (float)min(1, max(0, $analysisResult['scam_score'] ?? 0)),
                            'indicators' => (array)($analysisResult['indicators'] ?? []),
                            'impersonation_target' => $analysisResult['impersonation_target'] ?? null,
                            'scam_type' => $analysisResult['scam_type'] ?? null,
                            'reasoning' => (string)($analysisResult['reasoning'] ?? ''),
                            'suspicious_phrases' => (array)($analysisResult['suspicious_phrases'] ?? [])
                        ];
                    }
                }
            }
            
            return null;
            
        } catch (Exception $e) {
            error_log("Transcript analysis error: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Analyze media file for AI-generated content using Sightengine API
     * Uses different endpoints for images vs videos
     * For videos, also performs transcript analysis with LLM
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
        
        // For videos, perform transcript analysis with LLM
        // Note: Transcript analysis is optional - if it fails, we still return Sightengine results
        if ($isVideo) {
            error_log("VIDEO DETECTED - Starting transcript analysis process");
            $transcriptAnalysis = null;
            $transcript = null;
            $audioPath = null;
            $transcriptError = null;
            
            try {
                // Use direct video transcription with Gemini file upload API
                error_log("Using Gemini file upload API for video transcription");
                $transcript = $this->transcribeVideo($filePath);
                
                if ($transcript && strlen(trim($transcript)) > 10) {
                    error_log("Transcript received, length: " . strlen($transcript) . " characters");
                    error_log("Transcript preview: " . substr($transcript, 0, 100));
                    // Analyze transcript with LLM
                    error_log("Starting LLM transcript analysis...");
                    $transcriptAnalysis = $this->analyzeTranscriptWithLLM($transcript);
                    if ($transcriptAnalysis) {
                        error_log("Transcript analysis completed successfully");
                    } else {
                        error_log("Transcript analysis returned null");
                    }
                } else {
                    error_log("Transcript too short or empty: " . ($transcript ? strlen($transcript) : 'null'));
                }
            } catch (Exception $e) {
                // Log error but don't fail the entire request
                $transcriptError = $e->getMessage();
                error_log("Video transcript analysis error (non-critical): " . $transcriptError);
                error_log("Exception trace: " . $e->getTraceAsString());
            }
            
            // Add transcript analysis to result (even if null/failed)
            $result['transcript'] = $transcript;
            $result['transcript_analysis'] = $transcriptAnalysis;
            if ($transcriptError) {
                $result['transcript_error'] = $transcriptError;
            }
            
            error_log("Transcript data added to result - transcript: " . ($transcript ? "YES (" . strlen($transcript) . " chars)" : "NO") . ", analysis: " . ($transcriptAnalysis ? "YES" : "NO"));
        } else {
            error_log("Not a video file, skipping transcript analysis");
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
            
            $sightengineScore = 0.0;
            if (!empty($frameScores)) {
                // Calculate average score across all frames (Sightengine visual analysis)
                $sightengineScore = array_sum($frameScores) / count($frameScores);
            }
            
            // Check if transcript analysis is available
            $transcriptScore = 0.0;
            $hasTranscriptAnalysis = false;
            
            if (isset($results['transcript_analysis']) && is_array($results['transcript_analysis'])) {
                $transcriptAnalysis = $results['transcript_analysis'];
                $hasTranscriptAnalysis = true;
                
                // Use the confidence score from LLM transcript analysis
                $transcriptScore = floatval($transcriptAnalysis['confidence_score'] ?? 0);
            }
            
            // Calculate weighted average: 60% Transcript Analysis + 40% Sightengine Visual
            if ($hasTranscriptAnalysis) {
                $aiGeneratedScore = ($transcriptScore * 0.6) + ($sightengineScore * 0.4);
                $confidenceScore = $aiGeneratedScore;
                
                // Only show 2 main scores that total 100%: Gemini (60% weightage) and Sightengine (40% weightage)
                // Show the actual confidence percentages, not the weightage percentages
                $indicators[] = 'Gemini transcript analysis (60%): ' . round($transcriptScore * 100, 1) . '%';
                $indicators[] = 'Sightengine visual analysis (40%): ' . round($sightengineScore * 100, 1) . '%';
                
                // Determine if AI-generated based on combined score
                if ($aiGeneratedScore > 0.5) {
                    $isAIGenerated = true;
                }
                
                // Check for deepfake based on transcript analysis
                if (!empty($transcriptAnalysis['is_deepfake']) || !empty($transcriptAnalysis['is_impersonation'])) {
                    $isDeepfake = true;
                }
            } else {
                // Fallback to Sightengine only if transcript analysis not available
                $aiGeneratedScore = $sightengineScore;
                $confidenceScore = $sightengineScore;
                $indicators[] = 'Sightengine visual analysis: ' . round($sightengineScore * 100, 1) . '%';
                $indicators[] = 'Gemini transcript analysis: Not available';
                
                if ($aiGeneratedScore > 0.5) {
                    $isAIGenerated = true;
                }
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
        
        $returnData = [
            'is_ai_generated' => $isAIGenerated,
            'is_deepfake' => $isDeepfake || $isAIGenerated, // Deepfake or AI-generated content
            'confidence_score' => round($confidenceScore, 4),
            'ai_generated_score' => round($aiGeneratedScore, 4),
            'deepfake_score' => round($deepfakeScore, 4),
            'indicators' => $indicators,
            'raw_results' => $results,
            'method' => 'sightengine_api'
        ];
        
        // Add transcript data if available (for videos)
        if (isset($results['transcript'])) {
            $returnData['transcript'] = $results['transcript'];
        }
        
        if (isset($results['transcript_analysis'])) {
            $returnData['transcript_analysis'] = $results['transcript_analysis'];
        }
        
        return $returnData;
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
                    
                    // Log transcript data from analyzeFile
                    error_log("After analyzeFile() - Checking for transcript data...");
                    error_log("Results keys: " . implode(', ', array_keys($results)));
                    error_log("Full results structure: " . json_encode(array_keys($results)));
                    
                    if (isset($results['transcript'])) {
                        error_log("✓ Transcript found in results: " . strlen($results['transcript']) . " characters");
                        error_log("Transcript preview: " . substr($results['transcript'], 0, 200));
                    } else {
                        error_log("✗ No transcript in results");
                        // Check if it's nested somewhere
                        if (isset($results['data'])) {
                            error_log("Checking results['data'] keys: " . implode(', ', array_keys($results['data'])));
                        }
                    }
                    if (isset($results['transcript_analysis'])) {
                        error_log("✓ Transcript analysis found in results");
                        error_log("Transcript analysis keys: " . implode(', ', array_keys($results['transcript_analysis'])));
                    } else {
                        error_log("✗ No transcript_analysis in results");
                    }
                    
                    $detection = $sightengine->processDetection($filePath, $results);
                    
                    // Ensure transcript data is preserved in detection object
                    // Transcript data comes from analyzeFile() and should be in $results
                    if (isset($results['transcript'])) {
                        error_log("Adding transcript to detection object");
                        $detection['transcript'] = $results['transcript'];
                        // Also add to detection_results for easier access
                        if (isset($detection['detection_results'])) {
                            $detection['detection_results']['transcript'] = $results['transcript'];
                        }
                    }
                    if (isset($results['transcript_analysis'])) {
                        error_log("Adding transcript_analysis to detection object");
                        $detection['transcript_analysis'] = $results['transcript_analysis'];
                        // Also add to detection_results for easier access
                        if (isset($detection['detection_results'])) {
                            $detection['detection_results']['transcript_analysis'] = $results['transcript_analysis'];
                        }
                    }
                    if (isset($results['transcript_error'])) {
                        error_log("Adding transcript_error to detection object: " . $results['transcript_error']);
                        $detection['transcript_error'] = $results['transcript_error'];
                    }
                    
                    // Run ELA analysis for images (JPG/PNG only)
                    $elaResult = null;
                    $elaError = null;
                    $fileExtension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
                    $isImageForELA = in_array($fileExtension, ['jpg', 'jpeg', 'png']);
                    
                    if ($isImageForELA) {
                        try {
                            // Include ELA analysis functions
                            require_once __DIR__ . '/ela_analysis.php';
                            
                            // Run ELA analysis with quality 75
                            $elaResult = runELAAnalysis($filePath, 75);
                            
                        } catch (Exception $elaError) {
                            // ELA is optional, log error but continue
                            $errorMsg = "ELA analysis error (non-critical): " . $elaError->getMessage();
                            error_log($errorMsg);
                            $elaResult = null;
                            $elaError = $errorMsg;
                        }
                    }
                    
                    $response = [
                        'success' => true,
                        'detection' => $detection,
                        'file_path' => $filePath,
                        'message' => translateText('analysis_complete')
                    ];
                    
                    // Also add transcript data directly to response for easier access
                    if (isset($results['transcript'])) {
                        error_log("Adding transcript to response object");
                        $response['transcript'] = $results['transcript'];
                    }
                    if (isset($results['transcript_analysis'])) {
                        error_log("Adding transcript_analysis to response object");
                        $response['transcript_analysis'] = $results['transcript_analysis'];
                    }
                    
                    error_log("Final response keys: " . implode(', ', array_keys($response)));
                    
                    // Debug: Log full response structure
                    if (isset($response['detection'])) {
                        error_log("Response detection keys: " . implode(', ', array_keys($response['detection'])));
                        if (isset($response['detection']['detection_results'])) {
                            error_log("Detection results keys: " . implode(', ', array_keys($response['detection']['detection_results'])));
                        }
                        if (isset($response['detection']['analysis'])) {
                            error_log("Detection analysis keys: " . implode(', ', array_keys($response['detection']['analysis'])));
                        }
                    }
                    
                    // Ensure transcript is in multiple places for frontend access
                    if (isset($results['transcript'])) {
                        // Add to detection.analysis as well
                        if (isset($response['detection']['analysis'])) {
                            $response['detection']['analysis']['transcript'] = $results['transcript'];
                        }
                        // Add to detection.detection_results as well
                        if (isset($response['detection']['detection_results'])) {
                            $response['detection']['detection_results']['transcript'] = $results['transcript'];
                        }
                    }
                    if (isset($results['transcript_analysis'])) {
                        // Add to detection.analysis as well
                        if (isset($response['detection']['analysis'])) {
                            $response['detection']['analysis']['transcript_analysis'] = $results['transcript_analysis'];
                        }
                        // Add to detection.detection_results as well
                        if (isset($response['detection']['detection_results'])) {
                            $response['detection']['detection_results']['transcript_analysis'] = $results['transcript_analysis'];
                        }
                    }
                    
                    // Add ELA result to detection object if available
                    if ($elaResult !== null) {
                        $response['ela_result'] = $elaResult;
                        // Also add to detection for easier access
                        if (isset($detection['analysis'])) {
                            $detection['analysis']['ela_result'] = $elaResult;
                        }
                        $response['detection'] = $detection;
                    } else {
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
