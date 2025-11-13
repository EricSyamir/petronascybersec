<?php
/**
 * Example Usage of SemakMule API Client
 * This file demonstrates how to use the API client to connect to the scammer database
 */

require_once 'api-client.php';

// Initialize the API client
$client = new SemakMuleAPIClient();

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SemakMule API - Example Usage</title>
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
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 3px solid #0066cc;
            padding-bottom: 10px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #555;
        }
        input[type="text"] {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
            box-sizing: border-box;
        }
        button {
            background-color: #0066cc;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background-color: #0052a3;
        }
        .result {
            margin-top: 20px;
            padding: 15px;
            background-color: #f9f9f9;
            border-left: 4px solid #0066cc;
            border-radius: 4px;
        }
        .error {
            border-left-color: #cc0000;
            background-color: #ffe6e6;
        }
        .success {
            border-left-color: #00cc00;
            background-color: #e6ffe6;
        }
        pre {
            background-color: #f4f4f4;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 SemakMule API - Scammer Database Check</h1>
        
        <form method="POST" action="">
            <div class="form-group">
                <label for="account">Bank Account Number:</label>
                <input type="text" id="account" name="account" placeholder="Enter bank account number">
            </div>
            
            <div class="form-group">
                <label for="phone">Phone Number:</label>
                <input type="text" id="phone" name="phone" placeholder="Enter phone number (e.g., 0123456789)">
            </div>
            
            <div class="form-group">
                <label for="company">Company Name:</label>
                <input type="text" id="company" name="company" placeholder="Enter company name">
            </div>
            
            <button type="submit" name="action" value="check">Check Database</button>
            <a href="?debug=1" style="margin-left: 10px; padding: 12px 24px; background-color: #666; color: white; text-decoration: none; border-radius: 4px; display: inline-block;">Debug Mode</a>
        </form>
        
        <?php
        // Show the actual URL being called for debugging
        if (isset($_GET['debug'])) {
            echo '<div class="result" style="background-color: #fff3cd; border-left-color: #ffc107;">';
            echo '<h3>Debug Information</h3>';
            echo '<p><strong>Main API:</strong> ' . htmlspecialchars($client->apiEndPoint) . '</p>';
            echo '<p><strong>Mule API:</strong> ' . htmlspecialchars($client->apiEndPointMule) . '</p>';
            echo '<p><em>Add ?debug=1 to URL to see this information</em></p>';
            echo '</div>';
        }
        
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $action = $_POST['action'] ?? '';
            
            echo '<div class="result">';
            
            if ($action === 'check') {
                // Check bank account
                if (!empty($_POST['account'])) {
                    echo '<h3>Bank Account Check:</h3>';
                    $result = $client->checkBankAccount($_POST['account']);
                    if (isset($_GET['debug'])) {
                        echo '<p><strong>Debug URL:</strong> ' . htmlspecialchars($client->apiEndPointMule) . '</p>';
                        echo '<p><strong>Payload:</strong> <pre>' . htmlspecialchars(json_encode(['category' => 'bank', 'bankAccount' => $_POST['account'], 'telNo' => '', 'companyName' => '', 'captcha' => ''], JSON_PRETTY_PRINT)) . '</pre></p>';
                    }
                    displayResult($result);
                }
                
                // Check phone number
                if (!empty($_POST['phone'])) {
                    echo '<h3>Phone Number Check:</h3>';
                    $result = $client->checkPhoneNumber($_POST['phone']);
                    displayResult($result);
                }
                
                // Check company
                if (!empty($_POST['company'])) {
                    echo '<h3>Company Check:</h3>';
                    $result = $client->checkCompany($_POST['company']);
                    displayResult($result);
                }
                
                // If no input provided
                if (empty($_POST['account']) && empty($_POST['phone']) && empty($_POST['company'])) {
                    echo '<p class="error">Please enter at least one field to check.</p>';
                }
            } elseif ($action === 'stats') {
                echo '<h3>Note:</h3>';
                echo '<p>The stats endpoint is not available. Use the check functions to query the database.</p>';
            }
            
            echo '</div>';
        }
        
        function displayResult($result) {
            if ($result['success'] && isset($result['data'])) {
                $data = $result['data'];
                
                echo '<div class="success">';
                echo '<p><strong>Status:</strong> Success (HTTP ' . $result['http_code'] . ')</p>';
                
                // Display API response in a formatted way
                if (isset($data['status'])) {
                    echo '<p><strong>API Status:</strong> ' . ($data['status'] == 1 ? '✅ Success' : '❌ Failed') . '</p>';
                    if (isset($data['status_message'])) {
                        echo '<p><strong>Message:</strong> ' . htmlspecialchars($data['status_message']) . '</p>';
                    }
                    if (isset($data['count'])) {
                        echo '<p><strong>Total Records Found:</strong> ' . htmlspecialchars($data['count']) . '</p>';
                    }
                    if (isset($data['kw'])) {
                        echo '<p><strong>Searched For:</strong> ' . htmlspecialchars($data['kw']) . '</p>';
                    }
                    
                    // Display table data if available
                    if (isset($data['table_data']) && is_array($data['table_data']) && !empty($data['table_data'])) {
                        echo '<h4>Results:</h4>';
                        echo '<p><strong>Total Records Found:</strong> ' . htmlspecialchars($data['count'] ?? '0') . '</p>';
                        echo '<table style="width:100%; border-collapse: collapse; margin-top: 10px;">';
                        
                        // Display headers if available
                        if (isset($data['table_header']) && is_array($data['table_header']) && !empty($data['table_header'])) {
                            echo '<thead><tr style="background-color: #0066cc; color: white;">';
                            foreach ($data['table_header'] as $header) {
                                echo '<th style="padding: 8px; border: 1px solid #ddd;">' . htmlspecialchars($header) . '</th>';
                            }
                            echo '</tr></thead>';
                        }
                        
                        // Display data rows
                        echo '<tbody>';
                        foreach ($data['table_data'] as $row) {
                            echo '<tr>';
                            foreach ($row as $cell) {
                                echo '<td style="padding: 8px; border: 1px solid #ddd;">' . htmlspecialchars($cell) . '</td>';
                            }
                            echo '</tr>';
                        }
                        echo '</tbody></table>';
                    } else {
                        if (isset($data['count']) && $data['count'] > 0) {
                            echo '<p><strong>Total Records Found:</strong> ' . htmlspecialchars($data['count']) . '</p>';
                            echo '<p><em>Note: Data found but table_data is empty. Check raw response in debug mode.</em></p>';
                        } else {
                            echo '<p><em>No matching records found in the database.</em></p>';
                        }
                    }
                }
                
                // Show raw JSON for debugging
                if (isset($_GET['debug'])) {
                    echo '<h4>Raw Response:</h4>';
                    echo '<pre>' . htmlspecialchars(json_encode($data, JSON_PRETTY_PRINT)) . '</pre>';
                }
                
                echo '</div>';
            } else {
                echo '<div class="error">';
                echo '<p><strong>Status:</strong> Error (HTTP ' . $result['http_code'] . ')</p>';
                if (isset($result['error'])) {
                    echo '<p><strong>Error:</strong> ' . htmlspecialchars($result['error']) . '</p>';
                }
                if (isset($result['raw_response'])) {
                    echo '<pre>' . htmlspecialchars($result['raw_response']) . '</pre>';
                }
                if (isset($result['data'])) {
                    echo '<pre>' . htmlspecialchars(print_r($result['data'], true)) . '</pre>';
                }
                echo '</div>';
            }
        }
        ?>
        
        <hr style="margin: 30px 0;">
        
        <h2>API Endpoints</h2>
        <ul>
            <li><strong>Main API:</strong> <?php echo $client->apiEndPoint; ?></li>
            <li><strong>Mule API:</strong> <?php echo $client->apiEndPointMule; ?></li>
        </ul>
        
        <h2>Available Methods</h2>
        <ul>
            <li><code>checkBankAccount($accountNumber, $captcha = '')</code> - Check if a bank account is in the scammer database</li>
            <li><code>checkPhoneNumber($phoneNumber, $captcha = '')</code> - Check if a phone number is in the scammer database</li>
            <li><code>checkCompany($companyName, $captcha = '')</code> - Check if a company name is in the scammer database</li>
            <li><code>search($searchParams)</code> - Perform a custom search with full control over parameters</li>
            <li><strong>API Endpoint:</strong> <code>https://semakmule.rmp.gov.my/api/mule/get_search_data.php</code></li>
        </ul>
    </div>
</body>
</html>

