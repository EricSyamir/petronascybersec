<?php
/**
 * AI Detection Tester Class
 * 
 * This class handles PyTorch model inference for AI vs Human image detection.
 * It calls a Python script that loads the trained model and performs inference.
 */

class AIDetectionTester {
    private $pythonScript;
    private $modelPath;
    private $uploadDir;
    
    public function __construct() {
        // Path to the Python inference script
        $this->pythonScript = __DIR__ . '/../ai_detection_inference.py';
        
        // Path to the trained model
        $this->modelPath = __DIR__ . '/../best_model.pth';
        
        // Temporary upload directory
        $this->uploadDir = __DIR__ . '/../uploads/test_ai_detection/';
        
        // Create upload directory if it doesn't exist
        if (!file_exists($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }
    
    /**
     * Detect if an image is AI-generated or human-generated
     * 
     * @param string $imagePath Path to the image file
     * @return array Result array with success, label, confidence, etc.
     */
    public function detect($imagePath) {
        // Validate image path
        if (!file_exists($imagePath)) {
            return [
                'success' => false,
                'error' => 'Image file not found: ' . $imagePath
            ];
        }
        
        // Validate model exists
        if (!file_exists($this->modelPath)) {
            return [
                'success' => false,
                'error' => 'Model file not found: ' . $this->modelPath
            ];
        }
        
        // Validate Python script exists
        if (!file_exists($this->pythonScript)) {
            return [
                'success' => false,
                'error' => 'Python inference script not found: ' . $this->pythonScript
            ];
        }
        
        // Get absolute path
        $absoluteImagePath = realpath($imagePath);
        
        // Build command to run Python script
        $pythonCmd = $this->findPythonCommand();
        if (!$pythonCmd) {
            // Try to find any Python and provide helpful error
            $testPython = shell_exec('python --version 2>&1');
            $pythonFound = !empty($testPython) && strpos($testPython, 'Python') !== false;
            
            $errorMsg = 'Python with PyTorch not found. ';
            if ($pythonFound) {
                $errorMsg .= 'Python is installed but PyTorch is not available. ';
                $errorMsg .= 'Please run: pip install torch torchvision timm albumentations Pillow numpy';
            } else {
                $errorMsg .= 'Please install Python 3 and then run: pip install torch torchvision timm albumentations Pillow numpy';
            }
            
            return [
                'success' => false,
                'error' => $errorMsg
            ];
        }
        
        // Escape the image path for shell execution
        $escapedPath = escapeshellarg($absoluteImagePath);
        $escapedScript = escapeshellarg($this->pythonScript);
        
        // Use proc_open for better control over stdout/stderr
        $descriptorspec = array(
            0 => array("pipe", "r"),  // stdin
            1 => array("pipe", "w"),  // stdout
            2 => array("pipe", "w")   // stderr
        );
        
        $process = proc_open(
            escapeshellarg($pythonCmd) . ' ' . $escapedScript . ' ' . $escapedPath,
            $descriptorspec,
            $pipes,
            __DIR__ . '/..',
            null
        );
        
        if (!is_resource($process)) {
            return [
                'success' => false,
                'error' => 'Failed to start Python process'
            ];
        }
        
        // Close stdin (we don't need to send input)
        fclose($pipes[0]);
        
        // Read stdout (JSON output)
        $output = stream_get_contents($pipes[1]);
        fclose($pipes[1]);
        
        // Read stderr (debug/error messages)
        $stderr = stream_get_contents($pipes[2]);
        fclose($pipes[2]);
        
        // Get exit code
        $returnCode = proc_close($process);
        
        // Log stderr for debugging (if there's content)
        if (!empty(trim($stderr))) {
            error_log("Python stderr: " . trim($stderr));
        }
        
        // Log the command for debugging
        error_log("Python command: " . escapeshellarg($pythonCmd) . ' ' . $escapedScript . ' ' . $escapedPath);
        
        // Check if process failed
        if ($returnCode !== 0) {
            $errorMsg = 'Python script exited with code ' . $returnCode;
            if (!empty(trim($stderr))) {
                $errorMsg .= ': ' . trim($stderr);
            }
            if (!empty(trim($output))) {
                // Try to parse error from JSON output
                $errorJson = json_decode(trim($output), true);
                if ($errorJson && isset($errorJson['error'])) {
                    $errorMsg = $errorJson['error'];
                }
            }
            return [
                'success' => false,
                'error' => $errorMsg
            ];
        }
        
        if (empty(trim($output))) {
            return [
                'success' => false,
                'error' => 'Python script returned no output. ' . (!empty($stderr) ? 'Error: ' . trim($stderr) : '')
            ];
        }
        
        // Parse JSON output - extract JSON from output (in case there's extra text)
        $output = trim($output);
        
        // Try to find JSON in the output (in case there's extra text before/after)
        $jsonStart = strpos($output, '{');
        $jsonEnd = strrpos($output, '}');
        
        if ($jsonStart !== false && $jsonEnd !== false && $jsonEnd > $jsonStart) {
            $jsonOutput = substr($output, $jsonStart, $jsonEnd - $jsonStart + 1);
        } else {
            $jsonOutput = $output;
        }
        
        $result = json_decode($jsonOutput, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            // Log the actual output for debugging
            error_log("Failed to parse JSON. Output: " . substr($output, 0, 1000));
            error_log("JSON error: " . json_last_error_msg());
            
            return [
                'success' => false,
                'error' => 'Invalid JSON response from Python script. ' . json_last_error_msg() . '. Output: ' . substr($output, 0, 200)
            ];
        }
        
        return $result;
    }
    
    /**
     * Handle file upload and detect
     * 
     * @param array $file $_FILES array element
     * @return array Result array
     */
    public function detectUploadedFile($file) {
        // Validate upload
        if (!isset($file['tmp_name'])) {
            return [
                'success' => false,
                'error' => 'No file uploaded. Check PHP upload_max_filesize and post_max_size settings.'
            ];
        }
        
        if (!is_uploaded_file($file['tmp_name'])) {
            return [
                'success' => false,
                'error' => 'Invalid file upload. File may not have been uploaded correctly.'
            ];
        }
        
        // Check if file actually exists
        if (!file_exists($file['tmp_name'])) {
            return [
                'success' => false,
                'error' => 'Uploaded file not found in temporary directory.'
            ];
        }
        
        // Validate file type
        $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        if (!in_array($mimeType, $allowedTypes)) {
            return [
                'success' => false,
                'error' => 'Invalid file type. Only images are allowed.'
            ];
        }
        
        // Move uploaded file to temp directory
        $fileName = uniqid() . '_' . basename($file['name']);
        $tempPath = $this->uploadDir . $fileName;
        
        if (!move_uploaded_file($file['tmp_name'], $tempPath)) {
            return [
                'success' => false,
                'error' => 'Failed to save uploaded file'
            ];
        }
        
        // Perform detection
        $result = $this->detect($tempPath);
        
        // Clean up temp file
        if (file_exists($tempPath)) {
            unlink($tempPath);
        }
        
        return $result;
    }
    
    /**
     * Find Python command (python3 or python)
     * Works on both Windows and Unix-like systems
     * Also checks for PyTorch installation
     * 
     * @return string|false Python command or false if not found
     */
    private function findPythonCommand() {
        $commands = ['python3', 'python'];
        $isWindows = strtoupper(substr(PHP_OS, 0, 3)) === 'WIN';
        
        // Check environment variable first (for Render/cloud deployments)
        $envPython = getenv('PYTHON_PATH');
        if ($envPython && file_exists($envPython)) {
            // Test if this Python has PyTorch
            $testCmd = escapeshellarg($envPython) . ' -c "import torch" 2>&1';
            $output = shell_exec($testCmd);
            if ($output === null || trim($output) === '') {
                return $envPython;
            }
        }
        
        // On Windows, also check common installation paths
        if ($isWindows) {
            $username = getenv('USERNAME') ?: getenv('USER') ?: 'User';
            $commonPaths = [
                'C:\\Python39\\python.exe',
                'C:\\Python310\\python.exe',
                'C:\\Python311\\python.exe',
                'C:\\Python312\\python.exe',
                'C:\\Python313\\python.exe',
                'C:\\Program Files\\Python39\\python.exe',
                'C:\\Program Files\\Python310\\python.exe',
                'C:\\Program Files\\Python311\\python.exe',
                'C:\\Program Files\\Python312\\python.exe',
                'C:\\Program Files\\Python313\\python.exe',
                "C:\\Users\\{$username}\\AppData\\Local\\Programs\\Python\\Python39\\python.exe",
                "C:\\Users\\{$username}\\AppData\\Local\\Programs\\Python\\Python310\\python.exe",
                "C:\\Users\\{$username}\\AppData\\Local\\Programs\\Python\\Python311\\python.exe",
                "C:\\Users\\{$username}\\AppData\\Local\\Programs\\Python\\Python312\\python.exe",
                "C:\\Users\\{$username}\\AppData\\Local\\Programs\\Python\\Python313\\python.exe",
            ];
            
            // First check common paths
            foreach ($commonPaths as $path) {
                if (file_exists($path)) {
                    // Test if this Python has PyTorch
                    $testCmd = escapeshellarg($path) . ' -c "import torch" 2>&1';
                    $output = shell_exec($testCmd);
                    if ($output === null || trim($output) === '') {
                        return $path;
                    }
                }
            }
        }
        
        // Try standard commands (python3, python)
        foreach ($commands as $cmd) {
            $whichCommand = $isWindows ? 'where' : 'which';
            $result = @shell_exec($whichCommand . ' ' . $cmd . ' 2>&1');
            
            if ($result && !empty(trim($result))) {
                $pythonPath = trim(explode("\n", $result)[0]);
                if (file_exists($pythonPath)) {
                    // Test if this Python has PyTorch
                    $testCmd = escapeshellarg($pythonPath) . ' -c "import torch" 2>&1';
                    $output = shell_exec($testCmd);
                    if ($output === null || trim($output) === '') {
                        return $pythonPath;
                    }
                }
            }
        }
        
        return false;
    }
}

