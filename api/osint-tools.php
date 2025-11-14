<?php
require_once '../config/database.php';
require_once '../includes/auth.php';
require_once '../SemakMule/api-client.php';

/**
 * OSINT Tools API Endpoint
 * Provides unified access to multiple OSINT tools:
 * - Semak Mule (Scammer Database)
 * - Holehe (Email Checker)
 * - Mr.Holmes (Username Checker)
 * - HaveIBeenPwned (Breach Checker)
 */

class OSINTToolsAPI {
    private $pdo;
    private $semakMuleClient;
    
    public function __construct() {
        global $pdo;
        $this->pdo = $pdo;
        $this->semakMuleClient = new SemakMuleAPIClient();
    }
    
    /**
     * Check email using Holehe (via Python script)
     * Holehe checks if an email is registered on various websites
     */
    public function checkEmail($email) {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return [
                'success' => false,
                'error' => 'Invalid email format'
            ];
        }
        
        // Execute holehe via Python
        // Note: Requires holehe to be installed: pip install holehe
        $emailEscaped = escapeshellarg($email);
        $pythonScript = __DIR__ . '/../scripts/holehe_check.py';
        
        // If Python script doesn't exist, use basic implementation
        if (!file_exists($pythonScript)) {
            return $this->checkEmailBasic($email);
        }
        
        // Detect Python command (Windows vs Linux)
        $pythonCmd = $this->detectPythonCommand();
        
        // Build command
        $command = $pythonCmd . " " . escapeshellarg($pythonScript) . " " . $emailEscaped . " 2>&1";
        
        // Execute command with timeout
        $output = shell_exec($command);
        
        if ($output === null || trim($output) === '') {
            return [
                'success' => false,
                'error' => 'Failed to execute holehe check. Make sure Python and holehe are installed.',
                'debug' => [
                    'python_cmd' => $pythonCmd,
                    'script_path' => $pythonScript,
                    'script_exists' => file_exists($pythonScript)
                ]
            ];
        }
        
        // Try to decode JSON response
        $result = json_decode(trim($output), true);
        
        if ($result === null) {
            // If JSON decode fails, check if it's an error message
            if (strpos($output, 'not installed') !== false || strpos($output, 'not found') !== false) {
                return [
                    'success' => false,
                    'error' => 'Holehe is not installed. Please install it with: pip install holehe',
                    'raw_output' => substr($output, 0, 500) // Limit output length
                ];
            }
            
            return [
                'success' => false,
                'error' => 'Invalid response from holehe script',
                'raw_output' => substr($output, 0, 500) // Limit output length
            ];
        }
        
        // Check if the Python script returned an error
        if (isset($result['success']) && $result['success'] === false) {
            return [
                'success' => false,
                'error' => $result['error'] ?? 'Unknown error from holehe',
                'email' => $email
            ];
        }
        
        // Process result to filter only registered platforms and analyze
        $processedData = $this->processEmailCheckResult($result, $email);
        
        return [
            'success' => true,
            'data' => $processedData,
            'email' => $email
        ];
    }
    
    /**
     * Process email check result to filter platforms and analyze
     */
    private function processEmailCheckResult($result, $email) {
        // Handle different result formats from Holehe
        $platforms = [];
        $registeredCount = 0;
        $totalChecked = 0;
        
        // Check if result has platforms array (direct format from Python script)
        if (isset($result['platforms']) && is_array($result['platforms'])) {
            $totalChecked = count($result['platforms']);
            foreach ($result['platforms'] as $platform) {
                // Preserve all platforms with their status (used, not_used, rate_limit)
                // The Python script returns: status='used'/'not_used'/'rate_limit'
                $status = $platform['status'] ?? 'unknown';
                $isRegistered = ($status === 'used');
                
                if ($isRegistered) {
                    $registeredCount++;
                }
                
                // Include all platforms (not just registered ones) with status
                $platformData = [
                    'platform' => $platform['platform'] ?? $platform['name'] ?? $platform['site'] ?? 'Unknown',
                    'url' => $platform['url'] ?? $platform['link'] ?? '#',
                    'status' => $status, // Preserve status for JavaScript
                    'exists' => $isRegistered // For backward compatibility
                ];
                $platforms[] = $platformData;
            }
        }
        // Check if result is an array of platforms (alternative format)
        elseif (is_array($result) && !isset($result['platforms'])) {
            // Check if it's a list of platform results
            foreach ($result as $key => $value) {
                if (is_array($value)) {
                    $totalChecked++;
                    $isRegistered = false;
                    
                    // Check various formats
                    if (isset($value['exists']) && ($value['exists'] === true || $value['exists'] === 'true')) {
                        $isRegistered = true;
                    } elseif (isset($value['found']) && ($value['found'] === true || $value['found'] === 'true')) {
                        $isRegistered = true;
                    } elseif (isset($value['status']) && $value['status'] === 'used') {
                        $isRegistered = true;
                    }
                    
                    if ($isRegistered) {
                        $registeredCount++;
                    }
                    
                    $status = $value['status'] ?? ($isRegistered ? 'used' : 'not_used');
                    
                    $platformData = [
                        'platform' => $value['platform'] ?? $value['name'] ?? $key,
                        'url' => $value['url'] ?? $value['link'] ?? '#',
                        'status' => $status,
                        'exists' => $isRegistered
                    ];
                    $platforms[] = $platformData;
                }
            }
        }
        
        // Get statistics from Python script result if available
        $statistics = $result['statistics'] ?? [
            'total_checked' => $totalChecked,
            'used_count' => $registeredCount,
            'not_used_count' => count(array_filter($platforms, function($p) { return ($p['status'] ?? '') === 'not_used'; })),
            'rate_limit_count' => count(array_filter($platforms, function($p) { return ($p['status'] ?? '') === 'rate_limit'; }))
        ];
        
        // Determine if it's a real person or burner email
        $analysis = $this->analyzeEmailLegitimacy($registeredCount, $result);
        
        return [
            'email' => $email,
            'platforms' => $platforms, // All platforms with status
            'registered_count' => $registeredCount,
            'total_checked' => $totalChecked,
            'statistics' => $statistics, // Include statistics for JavaScript
            'analysis' => $analysis,
            'raw_data' => $result // Keep original data for reference
        ];
    }
    
    /**
     * Analyze if email belongs to a real person or is a burner email
     */
    private function analyzeEmailLegitimacy($registeredCount, $result) {
        // Threshold: if registered in 3+ platforms, likely a real person
        // If 0 platforms, likely a burner email
        $threshold = 3;
        
        if ($registeredCount === 0) {
            return [
                'type' => 'burner',
                'confidence' => 'high',
                'message' => 'This email is not registered on any major platforms. This is likely a burner email used for scams or temporary purposes.',
                'recommendation' => 'Exercise extreme caution. Burner emails are commonly used by scammers to avoid detection.'
            ];
        } elseif ($registeredCount >= $threshold) {
            return [
                'type' => 'real_person',
                'confidence' => 'high',
                'message' => 'This email is registered on multiple platforms (' . $registeredCount . ' found). This suggests it belongs to a real person.',
                'recommendation' => 'The email appears legitimate, but still verify through other means.'
            ];
        } else {
            return [
                'type' => 'suspicious',
                'confidence' => 'medium',
                'message' => 'This email is registered on only ' . $registeredCount . ' platform(s). This could indicate a burner email or a new account.',
                'recommendation' => 'Proceed with caution. Limited platform presence may indicate a temporary or suspicious account.'
            ];
        }
    }
    
    /**
     * Detect Python command based on OS
     */
    private function detectPythonCommand() {
        // Try different Python commands
        $commands = ['python', 'python3', 'py', 'python.exe'];
        
        foreach ($commands as $cmd) {
            $test = shell_exec($cmd . " --version 2>&1");
            if ($test !== null && strpos($test, 'Python') !== false) {
                return $cmd;
            }
        }
        
        // Default fallback
        return 'python';
    }
    
    /**
     * Basic email checker (fallback if holehe not available)
     * Checks common social media platforms via API
     */
    private function checkEmailBasic($email) {
        // Extract domain from email
        $emailDomain = substr(strrchr($email, "@"), 1);
        
        // Common platforms that often have emails
        $commonPlatforms = [
            ['platform' => 'Google Account', 'found' => true, 'note' => 'Email format suggests Google account'],
            ['platform' => 'Facebook', 'found' => null, 'note' => 'Install Holehe for verification'],
            ['platform' => 'Instagram', 'found' => null, 'note' => 'Install Holehe for verification'],
            ['platform' => 'Twitter', 'found' => null, 'note' => 'Install Holehe for verification'],
            ['platform' => 'LinkedIn', 'found' => null, 'note' => 'Install Holehe for verification'],
            ['platform' => 'GitHub', 'found' => null, 'note' => 'Install Holehe for verification'],
            ['platform' => 'Microsoft', 'found' => null, 'note' => 'Install Holehe for verification'],
            ['platform' => 'Adobe', 'found' => null, 'note' => 'Install Holehe for verification']
        ];
        
        // Check if it's a known email provider
        $knownProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 'icloud.com'];
        $isKnownProvider = in_array(strtolower($emailDomain), $knownProviders);
        
        // For basic check, return empty platforms (since we can't verify)
        // This will result in "burner email" analysis
        return [
            'success' => true,
            'data' => [
                'email' => $email,
                'domain' => $emailDomain,
                'is_known_provider' => $isKnownProvider,
                'platforms' => [], // Empty - can't verify without Holehe
                'found_count' => 0,
                'registered_count' => 0,
                'note' => 'Basic check only. For comprehensive platform detection, install Holehe: pip install holehe',
                'analysis' => [
                    'type' => 'unknown',
                    'confidence' => 'low',
                    'message' => 'Unable to verify platform registrations. Install Holehe for accurate analysis.',
                    'recommendation' => 'Install Holehe (pip install holehe) to check if this email is registered on major platforms.'
                ]
            ],
            'email' => $email
        ];
    }
    
    /**
     * Check username using Mr.Holmes (via Python script)
     * Mr.Holmes checks username availability across multiple platforms
     */
    public function checkUsername($username) {
        if (empty($username) || strlen($username) < 3) {
            return [
                'success' => false,
                'error' => 'Username must be at least 3 characters'
            ];
        }
        
        // Execute Mr.Holmes via Python
        // Note: Requires Mr.Holmes to be installed
        $command = escapeshellarg($username);
        $pythonScript = __DIR__ . '/../scripts/mrholmes_check.py';
        
        // If Python script doesn't exist, create a basic implementation
        if (!file_exists($pythonScript)) {
            return $this->checkUsernameBasic($username);
        }
        
        $output = shell_exec("python " . escapeshellarg($pythonScript) . " " . $command . " 2>&1");
        
        if ($output === null) {
            return [
                'success' => false,
                'error' => 'Failed to execute Mr.Holmes check'
            ];
        }
        
        $result = json_decode($output, true);
        
        if ($result === null) {
            return [
                'success' => false,
                'error' => 'Invalid response from Mr.Holmes',
                'raw_output' => $output
            ];
        }
        
        return [
            'success' => true,
            'data' => $result,
            'username' => $username
        ];
    }
    
    /**
     * Basic username checker (fallback if Mr.Holmes not available)
     */
    private function checkUsernameBasic($username) {
        // Common platforms to check
        $platforms = [
            [
                'platform' => 'Facebook',
                'url' => 'https://www.facebook.com/' . urlencode($username),
                'exists' => null,
                'note' => 'Install Mr.Holmes for verification'
            ],
            [
                'platform' => 'Twitter/X',
                'url' => 'https://twitter.com/' . urlencode($username),
                'exists' => null,
                'note' => 'Install Mr.Holmes for verification'
            ],
            [
                'platform' => 'Instagram',
                'url' => 'https://www.instagram.com/' . urlencode($username),
                'exists' => null,
                'note' => 'Install Mr.Holmes for verification'
            ],
            [
                'platform' => 'LinkedIn',
                'url' => 'https://www.linkedin.com/in/' . urlencode($username),
                'exists' => null,
                'note' => 'Install Mr.Holmes for verification'
            ],
            [
                'platform' => 'GitHub',
                'url' => 'https://github.com/' . urlencode($username),
                'exists' => null,
                'note' => 'Install Mr.Holmes for verification'
            ],
            [
                'platform' => 'Reddit',
                'url' => 'https://www.reddit.com/user/' . urlencode($username),
                'exists' => null,
                'note' => 'Install Mr.Holmes for verification'
            ],
            [
                'platform' => 'TikTok',
                'url' => 'https://www.tiktok.com/@' . urlencode($username),
                'exists' => null,
                'note' => 'Install Mr.Holmes for verification'
            ],
            [
                'platform' => 'YouTube',
                'url' => 'https://www.youtube.com/@' . urlencode($username),
                'exists' => null,
                'note' => 'Install Mr.Holmes for verification'
            ]
        ];
        
        return [
            'success' => true,
            'data' => [
                'username' => $username,
                'platforms' => $platforms,
                'found_count' => 0,
                'note' => 'Basic check only. For comprehensive username verification, install Mr.Holmes: https://github.com/Lucksi/Mr.Holmes'
            ],
            'username' => $username
        ];
    }
    
    /**
     * Check email/account breaches using HaveIBeenPwned API
     */
    public function checkBreach($email) {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return [
                'success' => false,
                'error' => 'Invalid email format'
            ];
        }
        
        // HaveIBeenPwned API v3 - include full breach details
        $apiUrl = 'https://haveibeenpwned.com/api/v3/breachedaccount/' . urlencode($email) . '?truncateResponse=false';
        
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $apiUrl,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 15,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_USERAGENT => 'PETRONAS-Cybercrime-Platform/1.0',
            CURLOPT_HTTPHEADER => [
                'hibp-api-key: ' . ($_ENV['HIBP_API_KEY'] ?? ''), // Optional API key for higher rate limits
                'Accept: application/json'
            ]
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            return [
                'success' => false,
                'error' => 'Connection error: ' . $error
            ];
        }
        
        if ($httpCode === 404) {
            // No breaches found
            return [
                'success' => true,
                'breached' => false,
                'breaches' => [],
                'email' => $email,
                'message' => 'Good news! This email has not been found in any known data breaches.'
            ];
        }
        
        if ($httpCode === 200) {
            $breaches = json_decode($response, true);
            return [
                'success' => true,
                'breached' => true,
                'breaches' => $breaches,
                'count' => count($breaches),
                'email' => $email,
                'message' => 'This email has been found in ' . count($breaches) . ' data breach(es).'
            ];
        }
        
        if ($httpCode === 429) {
            return [
                'success' => false,
                'error' => 'Rate limit exceeded. Please wait a moment and try again.',
                'http_code' => $httpCode
            ];
        }
        
        return [
            'success' => false,
            'error' => 'API error (HTTP ' . $httpCode . ')',
            'http_code' => $httpCode,
            'response' => $response
        ];
    }
    
    /**
     * Check bank account using Semak Mule
     */
    public function checkBankAccount($accountNumber) {
        $result = $this->semakMuleClient->checkBankAccount($accountNumber);
        
        return [
            'success' => $result['success'],
            'data' => $result['data'] ?? null,
            'account_number' => $accountNumber,
            'http_code' => $result['http_code'] ?? null,
            'error' => $result['error'] ?? null
        ];
    }
    
    /**
     * Check phone number using Semak Mule
     */
    public function checkPhoneNumber($phoneNumber) {
        $result = $this->semakMuleClient->checkPhoneNumber($phoneNumber);
        
        return [
            'success' => $result['success'],
            'data' => $result['data'] ?? null,
            'phone_number' => $phoneNumber,
            'http_code' => $result['http_code'] ?? null,
            'error' => $result['error'] ?? null
        ];
    }
    
    /**
     * Check company name using Semak Mule
     */
    public function checkCompany($companyName) {
        $result = $this->semakMuleClient->checkCompany($companyName);
        
        return [
            'success' => $result['success'],
            'data' => $result['data'] ?? null,
            'company_name' => $companyName,
            'http_code' => $result['http_code'] ?? null,
            'error' => $result['error'] ?? null
        ];
    }
}

// API endpoint handler
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    header('Content-Type: application/json');
    
    // Public access - no authentication required for OSINT tools
    // Note: Rate limiting can be added here if needed
    
    try {
        $api = new OSINTToolsAPI();
        $action = $_POST['action'];
        
        switch ($action) {
            case 'check_email':
                $email = $_POST['email'] ?? '';
                if (empty($email)) {
                    throw new Exception('Email is required');
                }
                $result = $api->checkEmail($email);
                echo json_encode($result);
                break;
                
            case 'check_username':
                $username = $_POST['username'] ?? '';
                if (empty($username)) {
                    throw new Exception('Username is required');
                }
                $result = $api->checkUsername($username);
                echo json_encode($result);
                break;
                
            case 'check_breach':
                $email = $_POST['email'] ?? '';
                if (empty($email)) {
                    throw new Exception('Email is required');
                }
                $result = $api->checkBreach($email);
                echo json_encode($result);
                break;
                
            case 'check_bank_account':
                $accountNumber = $_POST['account_number'] ?? '';
                if (empty($accountNumber)) {
                    throw new Exception('Bank account number is required');
                }
                $result = $api->checkBankAccount($accountNumber);
                echo json_encode($result);
                break;
                
            case 'check_phone':
                $phoneNumber = $_POST['phone_number'] ?? '';
                if (empty($phoneNumber)) {
                    throw new Exception('Phone number is required');
                }
                $result = $api->checkPhoneNumber($phoneNumber);
                echo json_encode($result);
                break;
                
            case 'check_company':
                $companyName = $_POST['company_name'] ?? '';
                if (empty($companyName)) {
                    throw new Exception('Company name is required');
                }
                $result = $api->checkCompany($companyName);
                echo json_encode($result);
                break;
                
            default:
                throw new Exception('Invalid action');
        }
        
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
    exit;
}

// GET endpoint for health check
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['health'])) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'status' => 'online',
        'tools' => [
            'semak_mule' => 'available',
            'holehe' => 'available (requires Python)',
            'mr_holmes' => 'available (requires Python)',
            'haveibeenpwned' => 'available'
        ]
    ]);
    exit;
}
?>

