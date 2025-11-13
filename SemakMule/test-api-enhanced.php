<?php
/**
 * Enhanced Test Script with Debugging
 * Test the API connection and show detailed request/response info
 */

require_once 'api-client.php';

echo "Testing SemakMule API Connection (Enhanced)\n";
echo "============================================\n\n";

$client = new SemakMuleAPIClient();

// Test with the example bank account
echo "Test: Check Bank Account '512802774281'\n";
echo "Endpoint: " . $client->apiEndPointMule . "\n";
echo "Payload: category=bank, bankAccount=512802774281\n\n";

$result = $client->checkBankAccount('512802774281');

echo "=== REQUEST DETAILS ===\n";
echo "URL: " . $client->apiEndPointMule . "\n";
echo "Method: POST\n";
echo "Payload: category=bank&bankAccount=512802774281&telNo=&companyName=&captcha=\n\n";

echo "=== RESPONSE DETAILS ===\n";
if ($result['success']) {
    echo "✅ HTTP Status: " . $result['http_code'] . " (Success)\n\n";
    
    if (isset($result['data'])) {
        $data = $result['data'];
        
        echo "API Response:\n";
        echo "  Status: " . ($data['status'] ?? 'N/A') . "\n";
        echo "  Message: " . ($data['status_message'] ?? 'N/A') . "\n";
        echo "  Count: " . ($data['count'] ?? '0') . "\n";
        echo "  Category: " . ($data['cat'] ?? 'N/A') . "\n";
        echo "  Keyword: " . ($data['kw'] ?? 'N/A') . "\n\n";
        
        if (isset($data['table_header']) && !empty($data['table_header'])) {
            echo "Table Headers: " . implode(', ', $data['table_header']) . "\n";
        }
        
        if (isset($data['table_data']) && !empty($data['table_data'])) {
            echo "\nTable Data (" . count($data['table_data']) . " rows):\n";
            foreach ($data['table_data'] as $index => $row) {
                echo "  Row " . ($index + 1) . ": " . implode(' | ', $row) . "\n";
            }
        } else {
            echo "\n⚠️  Table Data: Empty\n";
            if (isset($data['count']) && $data['count'] > 0) {
                echo "   Note: Count is " . $data['count'] . " but table_data is empty.\n";
                echo "   This might indicate the API requires additional headers or parameters.\n";
            }
        }
        
        echo "\n=== FULL JSON RESPONSE ===\n";
        echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
    } else {
        echo "⚠️  No data in response\n";
        echo "Raw Response: " . substr($result['raw_response'] ?? '', 0, 500) . "\n";
    }
} else {
    echo "❌ HTTP Status: " . $result['http_code'] . " (Failed)\n";
    if (isset($result['error'])) {
        echo "Error: " . $result['error'] . "\n";
    }
    if (isset($result['raw_response'])) {
        echo "\nRaw Response: " . substr($result['raw_response'], 0, 500) . "\n";
    }
}

echo "\n\n=== TROUBLESHOOTING ===\n";
echo "If you're getting count > 0 but empty table_data:\n";
echo "1. The API might require cookies/session from the website\n";
echo "2. Try accessing https://semakmule.rmp.gov.my first in a browser\n";
echo "3. Copy cookies/headers from browser DevTools Network tab\n";
echo "4. The API might have rate limiting or IP restrictions\n\n";

echo "Test Complete!\n";
?>

