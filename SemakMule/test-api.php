<?php
/**
 * Quick Test Script
 * Test the API connection with the actual endpoint
 */

require_once 'api-client.php';

echo "Testing SemakMule API Connection\n";
echo "==================================\n\n";

$client = new SemakMuleAPIClient();

// Test with the example bank account from the user
echo "Test 1: Check Bank Account '512802774281'\n";
echo "Endpoint: " . $client->apiEndPointMule . "\n";
echo "Payload: category=bank, bankAccount=512802774281\n\n";

$result = $client->checkBankAccount('512802774281');

if ($result['success']) {
    echo "✅ SUCCESS!\n";
    echo "HTTP Code: " . $result['http_code'] . "\n\n";
    
    if (isset($result['data'])) {
        $data = $result['data'];
        echo "Response Data:\n";
        echo "Status: " . ($data['status'] ?? 'N/A') . "\n";
        echo "Message: " . ($data['status_message'] ?? 'N/A') . "\n";
        echo "Count: " . ($data['count'] ?? 'N/A') . "\n";
        echo "Keyword: " . ($data['kw'] ?? 'N/A') . "\n";
        
        if (isset($data['table_data']) && !empty($data['table_data'])) {
            echo "\nTable Data:\n";
            if (isset($data['table_header'])) {
                echo "Headers: " . implode(', ', $data['table_header']) . "\n";
            }
            foreach ($data['table_data'] as $row) {
                echo "Row: " . implode(', ', $row) . "\n";
            }
        }
        
        echo "\nFull JSON Response:\n";
        echo json_encode($data, JSON_PRETTY_PRINT) . "\n";
    }
} else {
    echo "❌ FAILED!\n";
    echo "HTTP Code: " . $result['http_code'] . "\n";
    if (isset($result['error'])) {
        echo "Error: " . $result['error'] . "\n";
    }
    if (isset($result['raw_response'])) {
        echo "Response: " . substr($result['raw_response'], 0, 500) . "\n";
    }
    
    // Check if it's an SSL error
    if (isset($result['error']) && strpos($result['error'], 'SSL') !== false) {
        echo "\n⚠️ SSL Certificate Error Detected!\n";
        echo "Solution: Run 'download-ca-cert.php' to download CA certificates,\n";
        echo "or the API client will automatically disable SSL verification for testing.\n";
    }
}

echo "\n\n";
echo "Test Complete!\n";
?>


