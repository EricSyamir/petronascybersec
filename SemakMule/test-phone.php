<?php
/**
 * Test Phone Number Search
 */

require_once 'api-client.php';

echo "Testing Phone Number Search\n";
echo "===========================\n\n";

$client = new SemakMuleAPIClient();

// Test with the example phone number
$phoneNumber = '01161051865';
echo "Test: Check Phone Number '$phoneNumber'\n";
echo "Endpoint: " . $client->apiEndPointMule . "\n\n";

$result = $client->checkPhoneNumber($phoneNumber);

if ($result['success']) {
    echo "✅ SUCCESS!\n";
    echo "HTTP Code: " . $result['http_code'] . "\n\n";
    
    if (isset($result['data'])) {
        $data = $result['data'];
        echo "Response Data:\n";
        echo "Status: " . ($data['status'] ?? 'N/A') . "\n";
        echo "Message: " . ($data['status_message'] ?? 'N/A') . "\n";
        echo "Count: " . ($data['count'] ?? 'N/A') . "\n";
        echo "Category: " . ($data['cat'] ?? 'N/A') . "\n";
        echo "Keyword: " . ($data['kw'] ?? 'N/A') . "\n";
        
        if (isset($data['table_data']) && !empty($data['table_data'])) {
            echo "\nTable Data:\n";
            if (isset($data['table_header'])) {
                echo "Headers: " . implode(', ', $data['table_header']) . "\n";
            }
            foreach ($data['table_data'] as $row) {
                echo "Row: " . implode(' | ', $row) . "\n";
            }
        }
        
        echo "\nFull JSON Response:\n";
        echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
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
}

echo "\n\n";
echo "Test Complete!\n";
?>

