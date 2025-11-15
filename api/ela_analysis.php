<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/language.php';

/**
 * Error Level Analysis (ELA) API Endpoint
 * Integrates with error_level_analysis.py for JPEG tampering detection
 */

/**
 * Run Error Level Analysis using Python script
 * 
 * @param string $filePath Path to image file
 * @param int $quality JPEG quality level (1-100)
 * @param string|null $outputDir Optional output directory
 * @return array Analysis results
 */
function runELAAnalysis($filePath, $quality = 75, $outputDir = null) {
    // Get the path to the Python script
    $scriptPath = __DIR__ . '/../sherloq/error_level_analysis.py';
    
    if (!file_exists($scriptPath)) {
        throw new Exception('ELA analysis script not found');
    }
    
    // Detect Python command (Windows vs Linux) - same as holehe
    $pythonCmd = detectPythonCommand();
    
    // Build command with --json flag (same pattern as holehe_check.py)
    $filePathEscaped = escapeshellarg($filePath);
    $command = $pythonCmd . " " . escapeshellarg($scriptPath) . " " . $filePathEscaped;
    $command .= " --quality " . intval($quality);
    $command .= " --json"; // Request JSON output
    
    if ($outputDir !== null) {
        $command .= " --output-dir " . escapeshellarg($outputDir);
    }
    
    $command .= " 2>&1"; // Redirect stderr to stdout
    
    // Log command for debugging
    error_log("ELA DEBUG: Executing command: " . $command);
    
    // Execute command with shell_exec (same as holehe)
    $output = shell_exec($command);
    
    error_log("ELA DEBUG: Command output length: " . strlen($output ?? ''));
    error_log("ELA DEBUG: Command output (first 500 chars): " . substr($output ?? '', 0, 500));
    
    if ($output === null || trim($output) === '') {
        $errorMsg = 'Failed to execute ELA analysis. Make sure Python and required libraries are installed. Command: ' . $command;
        error_log("ELA DEBUG ERROR: " . $errorMsg);
        throw new Exception($errorMsg);
    }
    
    // Try to decode JSON response (same as holehe)
    $trimmedOutput = trim($output);
    $result = json_decode($trimmedOutput, true);
    
    if ($result === null) {
        // If JSON decode fails, check if it's an error message
        if (strpos($output, 'not installed') !== false || strpos($output, 'not found') !== false || strpos($output, 'Error') !== false) {
            $errorMsg = 'ELA analysis failed: ' . substr($output, 0, 500);
            error_log("ELA DEBUG ERROR: " . $errorMsg);
            throw new Exception($errorMsg);
        }
        
        $errorMsg = 'Invalid JSON response from ELA script. Output: ' . substr($output, 0, 500);
        error_log("ELA DEBUG ERROR: " . $errorMsg);
        error_log("ELA DEBUG: JSON decode error: " . json_last_error_msg());
        throw new Exception($errorMsg);
    }
    
    error_log("ELA DEBUG: JSON decoded successfully");
    error_log("ELA DEBUG: Result keys: " . implode(', ', array_keys($result)));
    
    // Check if the Python script returned an error
    if (isset($result['error'])) {
        $errorMsg = 'ELA analysis error: ' . $result['error'];
        error_log("ELA DEBUG ERROR: " . $errorMsg);
        throw new Exception($errorMsg);
    }
    
    error_log("ELA DEBUG: ELA analysis successful, output_path: " . ($result['output_path'] ?? 'NOT SET'));
    
    // Calculate confidence score based on ELA metrics
    $confidenceScore = calculateELAConfidence(
        $result['max_error'] ?? 0.0,
        $result['mean_error'] ?? 0.0,
        $result['error_variance'] ?? 0.0,
        $result['error_std'] ?? 0.0,
        $result['suspicious_percentage'] ?? 0.0
    );
    
    $result['confidence_score'] = $confidenceScore;
    
    // Convert absolute paths to relative URLs for web access
    $docRoot = str_replace('\\', '/', $_SERVER['DOCUMENT_ROOT']);
    $docRootNormalized = rtrim($docRoot, '/');
    
    // Get the base URL path for the project (e.g., /petronas-cybercrime-platform)
    $scriptPath = str_replace('\\', '/', dirname(dirname($_SERVER['SCRIPT_NAME'])));
    $basePath = rtrim($scriptPath, '/');
    
    error_log("ELA DEBUG: Document root: " . $docRootNormalized);
    error_log("ELA DEBUG: Script path (base): " . $basePath);
    
    // Normalize paths for Windows compatibility and convert to web-accessible URLs
    $normalizePath = function($path) use ($docRootNormalized, $basePath) {
        if (empty($path)) {
            return null;
        }
        
        $pathNormalized = str_replace('\\', '/', $path);
        
        error_log("ELA DEBUG: Normalizing path: " . $pathNormalized);
        
        // Check if path is within document root
        if (strpos($pathNormalized, $docRootNormalized) === 0) {
            $relativePath = substr($pathNormalized, strlen($docRootNormalized));
            $relativePath = ltrim($relativePath, '/');
            error_log("ELA DEBUG: Relative path (from doc root): " . $relativePath);
            return $relativePath;
        }
        
        // If not in document root, try to make it relative to project root
        // This handles cases where files are in uploads/ directory
        $projectRoot = str_replace('\\', '/', dirname(dirname(__DIR__)));
        $projectRootNormalized = rtrim($projectRoot, '/');
        
        error_log("ELA DEBUG: Project root: " . $projectRootNormalized);
        
        if (strpos($pathNormalized, $projectRootNormalized) === 0) {
            $relativePath = substr($pathNormalized, strlen($projectRootNormalized));
            $relativePath = ltrim($relativePath, '/');
            error_log("ELA DEBUG: Relative path (from project root): " . $relativePath);
            
            // Prepend base path to make it web-accessible
            if ($basePath && $basePath !== '/') {
                $relativePath = ltrim($basePath, '/') . '/' . $relativePath;
                error_log("ELA DEBUG: Relative path with base: " . $relativePath);
            }
            
            return $relativePath;
        }
        
        // Fallback: try to extract just the filename and directory relative to uploads
        // This handles cases where the path might be outside document root
        if (preg_match('/uploads\/deepfake_scans\/(.+)$/', $pathNormalized, $matches)) {
            $relativePath = 'uploads/deepfake_scans/' . $matches[1];
            
            // Prepend base path
            if ($basePath && $basePath !== '/') {
                $relativePath = ltrim($basePath, '/') . '/' . $relativePath;
            }
            
            error_log("ELA DEBUG: Relative path (extracted with base): " . $relativePath);
            return $relativePath;
        }
        
        // Last resort: return as-is
        error_log("ELA DEBUG: Using path as-is: " . $pathNormalized);
        return $pathNormalized;
    };
    
    // Generate URL for overlay output file (only one we display)
    if (!empty($result['output_path']) && file_exists($result['output_path'])) {
        $relativePath = $normalizePath($result['output_path']);
        if ($relativePath) {
            $result['output_url'] = '/' . $relativePath;
            error_log("ELA DEBUG: output_url: " . $result['output_url']);
        }
    }
    
    return $result;
}

/**
 * Calculate confidence score from ELA metrics
 * Higher score = more likely tampered
 */
function calculateELAConfidence($maxError, $meanError, $errorVariance, $errorStd, $suspiciousPercentage) {
    $score = 0.0;
    
    // Max error contribution (0-0.4)
    if ($maxError !== null) {
        $maxErrorScore = min(0.4, ($maxError / 0.15) * 0.4); // Normalize to 0.15 max
        $score += $maxErrorScore;
    }
    
    // Variance contribution (0-0.3)
    if ($errorVariance !== null) {
        $varianceScore = min(0.3, ($errorVariance / 0.005) * 0.3); // Normalize to 0.005 max
        $score += $varianceScore;
    }
    
    // Suspicious percentage contribution (0-0.3)
    if ($suspiciousPercentage !== null) {
        $percentageScore = min(0.3, ($suspiciousPercentage / 5.0) * 0.3); // Normalize to 5% max
        $score += $percentageScore;
    }
    
    // Clamp between 0 and 1
    return min(1.0, max(0.0, $score));
}

/**
 * Detect Python command (Windows vs Linux) - same as osint-tools.php
 */
function detectPythonCommand() {
    // Try python3 first (Linux/Mac)
    $testCmd = 'python3 --version 2>&1';
    $output = @shell_exec($testCmd);
    if ($output && strpos($output, 'Python') !== false) {
        return 'python3';
    }
    
    // Try python (Windows or older systems)
    $testCmd = 'python --version 2>&1';
    $output = @shell_exec($testCmd);
    if ($output && strpos($output, 'Python') !== false) {
        return 'python';
    }
    
    // Try common Windows paths
    $windowsPaths = [
        'C:\\Python\\python.exe',
        'C:\\Python3\\python.exe',
        'C:\\Python39\\python.exe',
        'C:\\Python310\\python.exe',
        'C:\\Python311\\python.exe',
        'C:\\Python312\\python.exe',
        'C:\\Python313\\python.exe'
    ];
    
    foreach ($windowsPaths as $path) {
        if (file_exists($path)) {
            return escapeshellarg($path);
        }
    }
    
    // Fallback
    return 'python3';
}

/**
 * Get base URL for file access
 */
function getBaseUrl() {
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $scriptPath = dirname(dirname($_SERVER['SCRIPT_NAME']));
    $basePath = rtrim($scriptPath, '/');
    if ($basePath === '.' || $basePath === '') {
        $basePath = '';
    } else {
        $basePath = '/' . ltrim($basePath, '/');
    }
    return $protocol . '://' . $host . $basePath;
}

// Only run HTTP endpoint when accessed directly via HTTP
if (basename($_SERVER['PHP_SELF']) === 'ela_analysis.php' && isset($_SERVER['REQUEST_METHOD'])) {
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
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            throw new Exception('Invalid request method. Use POST.');
        }
        
        if (!isset($_POST['action'])) {
            throw new Exception('No action specified');
        }
        
        $action = $_POST['action'];
        
        switch ($action) {
            case 'analyze_file':
                if (!isset($_POST['file_path']) || empty($_POST['file_path'])) {
                    throw new Exception('No file path provided');
                }
                
                $filePath = $_POST['file_path'];
                
                // Convert relative path to absolute if needed
                if (!file_exists($filePath)) {
                    // Try relative to document root
                    $docRoot = $_SERVER['DOCUMENT_ROOT'];
                    $relativePath = ltrim($filePath, '/');
                    $absolutePath = $docRoot . '/' . $relativePath;
                    
                    if (file_exists($absolutePath)) {
                        $filePath = $absolutePath;
                    } else {
                        // Try relative to script directory
                        $scriptDir = dirname(__DIR__);
                        $absolutePath = $scriptDir . '/' . ltrim($filePath, '/');
                        if (file_exists($absolutePath)) {
                            $filePath = $absolutePath;
                        } else {
                            throw new Exception('File not found: ' . $filePath);
                        }
                    }
                }
                
                // Ensure we have absolute path
                if (!file_exists($filePath)) {
                    throw new Exception('File not found: ' . $filePath);
                }
                
                // Check if file is an image (ELA only works on images)
                $allowedExtensions = ['jpg', 'jpeg', 'png'];
                $fileExtension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
                
                if (!in_array($fileExtension, $allowedExtensions)) {
                    throw new Exception('ELA analysis only supports JPG and PNG images');
                }
                
                // Get quality level (optional, default 75)
                $quality = isset($_POST['quality']) ? intval($_POST['quality']) : 75;
                $quality = max(1, min(100, $quality)); // Clamp between 1-100
                
                // Get output directory (optional)
                $outputDir = isset($_POST['output_dir']) ? $_POST['output_dir'] : null;
                
                // Run ELA analysis
                $result = runELAAnalysis($filePath, $quality, $outputDir);
                
                echo json_encode([
                    'success' => true,
                    'ela_result' => $result
                ]);
                break;
                
            default:
                throw new Exception('Invalid action. Use "analyze_file"');
        }
        
    } catch (Exception $e) {
        error_log("ELA Analysis Error: " . $e->getMessage());
        
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

