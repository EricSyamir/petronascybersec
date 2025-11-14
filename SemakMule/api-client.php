<?php
/**
 * SemakMule API Client
 * Connects to the Royal Malaysian Police CCID Portal scammer database
 */

class SemakMuleAPIClient {
    public $apiEndPoint;
    public $apiEndPointMule;
    private $timeout;
    
    public function __construct() {
        $this->apiEndPoint = "https://mule.the-oaks.my/api/p/";
        $this->apiEndPointMule = "https://semakmule.rmp.gov.my/api/mule/get_search_data.php";
        $this->timeout = 30; // seconds
    }
    
    /**
     * Make a GET request to the API
     * @param string $endpoint - API endpoint path
     * @param array $params - Query parameters
     * @param bool $useMuleEndpoint - Use mule endpoint instead of main endpoint
     * @return array - Response data
     */
    public function get($endpoint, $params = [], $useMuleEndpoint = false) {
        $baseUrl = $useMuleEndpoint ? $this->apiEndPointMule : $this->apiEndPoint;
        $url = rtrim($baseUrl, '/') . '/' . ltrim($endpoint, '/');
        
        if (!empty($params)) {
            $url .= '?' . http_build_query($params);
        }
        
        return $this->makeRequest($url, 'GET');
    }
    
    /**
     * Make a POST request to the API
     * @param string $endpoint - API endpoint path (empty string uses full URL when useMuleEndpoint is true)
     * @param array $data - POST data
     * @param bool $useMuleEndpoint - Use mule endpoint instead of main endpoint
     * @return array - Response data
     */
    public function post($endpoint, $data = [], $useMuleEndpoint = false) {
        if ($useMuleEndpoint && empty($endpoint)) {
            // Use the full mule endpoint URL directly
            $url = $this->apiEndPointMule;
        } else {
            $baseUrl = $useMuleEndpoint ? $this->apiEndPointMule : $this->apiEndPoint;
            $url = rtrim($baseUrl, '/') . '/' . ltrim($endpoint, '/');
        }
        
        return $this->makeRequest($url, 'POST', $data);
    }
    
    /**
     * Check a bank account number
     * @param string $accountNumber - Bank account number to check
     * @param string $captcha - Captcha value (optional)
     * @return array - Check result
     */
    public function checkBankAccount($accountNumber, $captcha = '') {
        $payload = [
            'data' => [
                'category' => 'bank',
                'bankAccount' => $accountNumber,
                'telNo' => '',
                'companyName' => '',
                'captcha' => $captcha
            ]
        ];
        return $this->post('', $payload, true);
    }
    
    /**
     * Check a phone number
     * @param string $phoneNumber - Phone number to check
     * @param string $captcha - Captcha value (optional)
     * @return array - Check result
     */
    public function checkPhoneNumber($phoneNumber, $captcha = '') {
        $payload = [
            'data' => [
                'category' => 'telefon',
                'bankAccount' => $phoneNumber,
                'telNo' => $phoneNumber,
                'companyName' => '',
                'captcha' => $captcha
            ]
        ];
        return $this->post('', $payload, true);
    }
    
    /**
     * Check a company name
     * @param string $companyName - Company name to check
     * @param string $captcha - Captcha value (optional)
     * @return array - Check result
     */
    public function checkCompany($companyName, $captcha = '') {
        $payload = [
            'data' => [
                'category' => 'company',
                'bankAccount' => '',
                'telNo' => '',
                'companyName' => $companyName,
                'captcha' => $captcha
            ]
        ];
        return $this->post('', $payload, true);
    }
    
    /**
     * Search for scammers with custom parameters
     * @param array $searchParams - Search parameters with keys: category, bankAccount, telNo, companyName, captcha
     * @return array - Search results
     */
    public function search($searchParams) {
        // Map category names to API format
        $categoryMap = [
            'bank' => 'bank',
            'phone' => 'telefon',
            'telefon' => 'telefon',
            'company' => 'company'
        ];
        
        $category = $searchParams['category'] ?? 'bank';
        $category = $categoryMap[$category] ?? $category;
        
        $payload = [
            'data' => [
                'category' => $category,
                'bankAccount' => $searchParams['bankAccount'] ?? '',
                'telNo' => $searchParams['telNo'] ?? '',
                'companyName' => $searchParams['companyName'] ?? '',
                'captcha' => $searchParams['captcha'] ?? ''
            ]
        ];
        
        // For telefon category, set both bankAccount and telNo to the phone number
        if ($category === 'telefon' && !empty($searchParams['telNo'])) {
            $payload['data']['bankAccount'] = $searchParams['telNo'];
        }
        
        return $this->post('', $payload, true);
    }
    
    /**
     * Make HTTP request using cURL
     * @param string $url - Full URL
     * @param string $method - HTTP method (GET, POST, etc.)
     * @param array $data - POST data (if POST request)
     * @return array - Response data
     */
    private function makeRequest($url, $method = 'GET', $data = []) {
        $ch = curl_init();
        
        // Always disable SSL verification for testing (XAMPP on Windows often has SSL issues)
        // Set SSL options FIRST before other curl options to ensure they take effect
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        
        // Optional: Check if CA bundle exists for production use
        // Uncomment the code below if you want to enable SSL verification with CA bundle
        /*
        $caBundle = null;
        $caPaths = [
            __DIR__ . '/cacert.pem',
            'C:/xampp/apache/bin/curl-ca-bundle.crt',
            'C:/xampp/php/extras/ssl/cacert.pem',
            ini_get('curl.cainfo'),
            ini_get('openssl.cafile')
        ];
        
        foreach ($caPaths as $path) {
            if ($path && file_exists($path)) {
                $caBundle = $path;
                break;
            }
        }
        
        if ($caBundle && file_exists($caBundle)) {
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
            curl_setopt($ch, CURLOPT_CAINFO, $caBundle);
        }
        */
        
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => $this->timeout,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_ENCODING => '', // Enable automatic decompression (gzip, deflate, etc.)
            CURLOPT_USERAGENT => 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
            CURLOPT_REFERER => 'https://semakmule.rmp.gov.my/',
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Accept: */*',
                'Origin: https://semakmule.rmp.gov.my',
                'Accept-Language: en-US,en;q=0.9,ms;q=0.8,fr;q=0.7,zh-CN;q=0.6,zh;q=0.5,id;q=0.4',
                'Accept-Encoding: gzip, deflate, br, zstd',
                'apikey: j3j389#nklala2',
                'Connection: keep-alive',
                'sec-ch-ua: "Not)A;Brand";v="8", "Chromium";v="138", "Opera GX";v="122"',
                'sec-ch-ua-mobile: ?1',
                'sec-ch-ua-platform: "Android"',
                'sec-fetch-dest: empty',
                'sec-fetch-mode: cors',
                'sec-fetch-site: same-origin'
            ]
        ]);
        
        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            if (!empty($data)) {
                // API expects JSON format (as shown in browser DevTools)
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        
        curl_close($ch);
        
        if ($error) {
            return [
                'success' => false,
                'error' => $error,
                'http_code' => $httpCode
            ];
        }
        
        $decodedResponse = json_decode($response, true);
        
        return [
            'success' => ($httpCode >= 200 && $httpCode < 300),
            'http_code' => $httpCode,
            'data' => $decodedResponse !== null ? $decodedResponse : $response,
            'raw_response' => $response
        ];
    }
}

// Example usage:
/*
$client = new SemakMuleAPIClient();

// Check a bank account
$result = $client->checkBankAccount('1234567890');
print_r($result);

// Check a phone number
$result = $client->checkPhoneNumber('0123456789');
print_r($result);

// Get statistics
$stats = $client->getStats();
print_r($stats);

// Custom search
$searchResult = $client->search([
    'account' => '1234567890',
    'phone' => '0123456789'
]);
print_r($searchResult);
*/
?>

