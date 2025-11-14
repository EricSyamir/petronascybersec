<?php
/**
 * Test AI Detection Model Integration
 * 
 * This PHP script tests the PyTorch model inference for AI vs Human image detection.
 * It calls a Python script that loads the trained model and performs inference.
 * 
 * Usage:
 *   - Upload an image via POST request with 'image' field
 *   - Or provide image path via GET parameter 'image_path'
 *   - Or use as a class: $detector = new AIDetectionTester(); $result = $detector->detect($imagePath);
 */

class AIDetectionTester {
    private $pythonScript;
    private $modelPath;
    private $uploadDir;
    
    public function __construct() {
        // Path to the Python inference script
        $this->pythonScript = __DIR__ . '/ai_detection_inference.py';
        
        // Path to the trained model
        $this->modelPath = __DIR__ . '/best_model.pth';
        
        // Temporary upload directory for testing
        $this->uploadDir = __DIR__ . '/uploads/test_ai_detection/';
        
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
        // Use python3 or python depending on system
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
        
        // Execute Python script
        // On Windows, use full path if needed
        $isWindows = strtoupper(substr(PHP_OS, 0, 3)) === 'WIN';
        
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
            __DIR__,
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
        $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
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
     * 
     * @return string|false Python command or false if not found
     */
    private function findPythonCommand() {
        $commands = ['python3', 'python'];
        $isWindows = strtoupper(substr(PHP_OS, 0, 3)) === 'WIN';
        
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
                        // No error means torch is installed
                        return $path;
                    }
                }
            }
        }
        
        // Then check commands in PATH
        foreach ($commands as $cmd) {
            if ($isWindows) {
                // On Windows, try to execute python and check if it works
                $testCmd = escapeshellarg($cmd) . ' --version 2>&1';
                $output = shell_exec($testCmd);
                if ($output && strpos($output, 'Python') !== false) {
                    // Also check if PyTorch is available
                    $torchTest = escapeshellarg($cmd) . ' -c "import torch" 2>&1';
                    $torchOutput = shell_exec($torchTest);
                    if ($torchOutput === null || trim($torchOutput) === '') {
                        return $cmd;
                    }
                }
            } else {
                // On Unix-like systems, use which
                $output = shell_exec("which $cmd 2>&1");
                if ($output && trim($output) !== '') {
                    $pythonPath = trim($output);
                    // Check if PyTorch is available
                    $torchTest = escapeshellarg($pythonPath) . ' -c "import torch" 2>&1';
                    $torchOutput = shell_exec($torchTest);
                    if ($torchOutput === null || trim($torchOutput) === '') {
                        return $pythonPath;
                    }
                }
            }
        }
        
        return false;
    }
    
    /**
     * Format result for display
     * 
     * @param array $result Detection result
     * @return string Formatted HTML output
     */
    public function formatResult($result) {
        if (!$result['success']) {
            return '<div class="error">Error: ' . htmlspecialchars($result['error']) . '</div>';
        }
        
        $label = $result['label_name'];
        $confidence = round($result['confidence'] * 100, 2);
        $humanProb = round($result['probabilities']['human'] * 100, 2);
        $aiProb = round($result['probabilities']['ai'] * 100, 2);
        
        $isAI = $result['label'] == 1;
        $class = $isAI ? 'ai-generated' : 'human-generated';
        
        $html = '<div class="detection-result ' . $class . '">';
        $html .= '<h3>Detection Result</h3>';
        $html .= '<div class="label">Label: <strong>' . htmlspecialchars($label) . '</strong></div>';
        $html .= '<div class="confidence">Confidence: <strong>' . $confidence . '%</strong></div>';
        $html .= '<div class="probabilities">';
        $html .= '<div>Human-generated probability: ' . $humanProb . '%</div>';
        $html .= '<div>AI-generated probability: ' . $aiProb . '%</div>';
        $html .= '</div>';
        $html .= '</div>';
        
        return $html;
    }
}

// Handle requests
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['image'])) {
    header('Content-Type: application/json');
    
    // Debug: Log file upload info (remove in production)
    error_log('File upload received: ' . print_r($_FILES, true));
    
    // Check for upload errors
    if (isset($_FILES['image']['error']) && $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        $errorMessages = [
            UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize directive in php.ini',
            UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE directive in HTML form',
            UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
            UPLOAD_ERR_NO_FILE => 'No file was uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
            UPLOAD_ERR_EXTENSION => 'File upload stopped by extension'
        ];
        
        $errorCode = $_FILES['image']['error'];
        $errorMsg = isset($errorMessages[$errorCode]) 
            ? $errorMessages[$errorCode] 
            : 'Unknown upload error (code: ' . $errorCode . ')';
        
        echo json_encode([
            'success' => false,
            'error' => $errorMsg
        ], JSON_PRETTY_PRINT);
        exit;
    }
    
    $detector = new AIDetectionTester();
    $result = $detector->detectUploadedFile($_FILES['image']);
    
    echo json_encode($result, JSON_PRETTY_PRINT);
    exit;
}

if (isset($_GET['image_path'])) {
    header('Content-Type: application/json');
    
    $detector = new AIDetectionTester();
    $result = $detector->detect($_GET['image_path']);
    
    echo json_encode($result, JSON_PRETTY_PRINT);
    exit;
}

// Diagnostic endpoint
if (isset($_GET['diagnostics'])) {
    header('Content-Type: application/json');
    
    $detector = new AIDetectionTester();
    $pythonCmd = false;
    try {
        // Use reflection to access private method for diagnostics
        $reflection = new ReflectionClass($detector);
        $method = $reflection->getMethod('findPythonCommand');
        $method->setAccessible(true);
        $pythonCmd = $method->invoke($detector);
    } catch (Exception $e) {
        $pythonCmd = 'error: ' . $e->getMessage();
    }
    
    $diagnostics = [
        'php_version' => PHP_VERSION,
        'upload_max_filesize' => ini_get('upload_max_filesize'),
        'post_max_size' => ini_get('post_max_size'),
        'max_file_uploads' => ini_get('max_file_uploads'),
        'file_uploads' => ini_get('file_uploads') ? 'enabled' : 'disabled',
        'shell_exec_enabled' => function_exists('shell_exec') ? 'enabled' : 'disabled',
        'python_script_exists' => file_exists(__DIR__ . '/ai_detection_inference.py'),
        'model_file_exists' => file_exists(__DIR__ . '/best_model.pth'),
        'upload_dir_writable' => is_writable(__DIR__ . '/uploads/test_ai_detection/'),
        'upload_dir_exists' => file_exists(__DIR__ . '/uploads/test_ai_detection/'),
        'os' => PHP_OS,
        'python_command' => $pythonCmd ?: 'not found'
    ];
    
    echo json_encode($diagnostics, JSON_PRETTY_PRINT);
    exit;
}

// HTML interface for testing
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Detection Model Tester</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            margin-bottom: 30px;
        }
        .upload-area {
            border: 2px dashed #ccc;
            border-radius: 8px;
            padding: 40px;
            text-align: center;
            margin-bottom: 20px;
            cursor: pointer;
            transition: border-color 0.3s;
        }
        .upload-area:hover {
            border-color: #007bff;
        }
        .upload-area.dragover {
            border-color: #007bff;
            background-color: #f0f8ff;
        }
        input[type="file"] {
            display: none;
        }
        button {
            background-color: #007bff;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 10px;
        }
        button:hover {
            background-color: #0056b3;
        }
        button:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }
        .result-area {
            margin-top: 30px;
            padding: 20px;
            border-radius: 8px;
            display: none;
        }
        .detection-result {
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
        }
        .detection-result.ai-generated {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
        }
        .detection-result.human-generated {
            background-color: #d4edda;
            border-left: 4px solid #28a745;
        }
        .detection-result h3 {
            margin-top: 0;
        }
        .detection-result .label {
            font-size: 18px;
            margin: 10px 0;
        }
        .detection-result .confidence {
            font-size: 16px;
            margin: 10px 0;
        }
        .detection-result .probabilities {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
        }
        .error {
            background-color: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 4px;
            border-left: 4px solid #dc3545;
        }
        .loading {
            text-align: center;
            padding: 20px;
            color: #666;
        }
        .preview-image {
            max-width: 100%;
            max-height: 400px;
            margin: 20px 0;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>AI Detection Model Tester</h1>
        <p>Upload an image to test if it's AI-generated or human-generated.</p>
        
        <div style="margin-bottom: 20px;">
            <button type="button" onclick="checkDiagnostics()" style="background-color: #6c757d;">Check System Diagnostics</button>
            <div id="diagnosticsResult" style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px; display: none;"></div>
        </div>
        
        <form id="uploadForm" enctype="multipart/form-data" method="POST">
            <div class="upload-area" id="uploadArea">
                <p>Click to select an image or drag and drop</p>
                <input type="file" id="imageInput" name="image" accept="image/*">
                <button type="submit" id="submitBtn">Analyze Image</button>
            </div>
        </form>
        
        <div id="previewArea"></div>
        <div id="resultArea" class="result-area"></div>
    </div>

    <script>
        // Check system diagnostics - define globally so it's available for onclick
        window.checkDiagnostics = async function() {
            const diagnosticsDiv = document.getElementById('diagnosticsResult');
            if (!diagnosticsDiv) {
                console.error('Diagnostics div not found');
                return;
            }
            diagnosticsDiv.style.display = 'block';
            diagnosticsDiv.innerHTML = '<div class="loading">Checking system...</div>';
            
            try {
                const response = await fetch('test_ai_detection.php?diagnostics=1');
                const data = await response.json();
                
                let html = '<h4>System Diagnostics</h4><ul>';
                for (const [key, value] of Object.entries(data)) {
                    html += `<li><strong>${key}:</strong> ${value}</li>`;
                }
                html += '</ul>';
                
                diagnosticsDiv.innerHTML = html;
            } catch (error) {
                diagnosticsDiv.innerHTML = `<div class="error">Error: ${error.message}</div>`;
            }
        };
        
        // Wait for DOM to be fully loaded
        document.addEventListener('DOMContentLoaded', function() {
            const uploadArea = document.getElementById('uploadArea');
            const imageInput = document.getElementById('imageInput');
            const uploadForm = document.getElementById('uploadForm');
            const resultArea = document.getElementById('resultArea');
            const previewArea = document.getElementById('previewArea');
            const submitBtn = document.getElementById('submitBtn');
            
            if (!uploadArea || !imageInput || !uploadForm || !resultArea || !previewArea || !submitBtn) {
                console.error('Required DOM elements not found');
                return;
            }

        // Click to select file
        uploadArea.addEventListener('click', () => {
            imageInput.click();
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                imageInput.files = files;
                previewImage(files[0]);
            }
        });

        // File input change
        imageInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                previewImage(e.target.files[0]);
            }
        });

        // Preview image
        function previewImage(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewArea.innerHTML = '<img src="' + e.target.result + '" class="preview-image" alt="Preview">';
            };
            reader.readAsDataURL(file);
        }

        // Form submission
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!imageInput.files.length) {
                alert('Please select an image');
                return;
            }

            const formData = new FormData();
            formData.append('image', imageInput.files[0]);

            submitBtn.disabled = true;
            submitBtn.textContent = 'Analyzing...';
            resultArea.style.display = 'block';
            resultArea.innerHTML = '<div class="loading">Analyzing image, please wait...</div>';

            try {
                const response = await fetch('test_ai_detection.php', {
                    method: 'POST',
                    body: formData
                });

                // Check if response is OK
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                if (result.success) {
                    const label = result.label_name;
                    const confidence = (result.confidence * 100).toFixed(2);
                    const humanProb = (result.probabilities.human * 100).toFixed(2);
                    const aiProb = (result.probabilities.ai * 100).toFixed(2);
                    const isAI = result.label == 1;
                    const resultClass = isAI ? 'ai-generated' : 'human-generated';

                    resultArea.innerHTML = `
                        <div class="detection-result ${resultClass}">
                            <h3>Detection Result</h3>
                            <div class="label">Label: <strong>${label}</strong></div>
                            <div class="confidence">Confidence: <strong>${confidence}%</strong></div>
                            <div class="probabilities">
                                <div>Human-generated probability: ${humanProb}%</div>
                                <div>AI-generated probability: ${aiProb}%</div>
                            </div>
                        </div>
                    `;
                } else {
                    resultArea.innerHTML = `<div class="error">Error: ${result.error || 'Unknown error'}</div>`;
                }
            } catch (error) {
                resultArea.innerHTML = `<div class="error">Error: ${error.message}</div>`;
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Analyze Image';
            }
        });
        }); // End of DOMContentLoaded
    </script>
</body>
</html>

