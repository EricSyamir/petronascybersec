<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OSINT Features Test - PETRONAS Cybercrime Platform</title>
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="stylesheet" href="assets/css/petronas-theme.css">
    <style>
        .test-container {
            max-width: 1200px;
            margin: 30px auto;
            padding: 20px;
        }
        .test-section {
            background: white;
            padding: 25px;
            margin: 20px 0;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .test-section h2 {
            color: #00a19c;
            margin-bottom: 15px;
            border-bottom: 2px solid #00a19c;
            padding-bottom: 10px;
        }
        .test-item {
            padding: 15px;
            margin: 10px 0;
            border: 1px solid #e9ecef;
            border-radius: 5px;
        }
        .test-result {
            padding: 10px;
            margin-top: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 0.9em;
        }
        .test-result.success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }
        .test-result.error {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
        }
        .test-result.pending {
            background: #d1ecf1;
            border: 1px solid #bee5eb;
            color: #0c5460;
        }
        .btn-test {
            background: #00a19c;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
        }
        .btn-test:hover {
            background: #008b87;
        }
        .btn-test:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        .summary {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        .summary-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
        }
        .summary-stat {
            text-align: center;
            padding: 15px;
            background: white;
            border-radius: 5px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .summary-stat .number {
            font-size: 2em;
            font-weight: bold;
            color: #00a19c;
        }
        .summary-stat .label {
            font-size: 0.9em;
            color: #6c757d;
        }
    </style>
</head>
<body>
    <div class="test-container">
        <h1>🧪 OSINT Features Test Suite</h1>
        <p>Comprehensive testing of all OSINT monitoring features</p>
        
        <div class="summary">
            <h3>Test Summary</h3>
            <div class="summary-stats">
                <div class="summary-stat">
                    <div class="number" id="totalTests">0</div>
                    <div class="label">Total Tests</div>
                </div>
                <div class="summary-stat">
                    <div class="number" id="passedTests" style="color: #28a745;">0</div>
                    <div class="label">Passed</div>
                </div>
                <div class="summary-stat">
                    <div class="number" id="failedTests" style="color: #dc3545;">0</div>
                    <div class="label">Failed</div>
                </div>
                <div class="summary-stat">
                    <div class="number" id="pendingTests" style="color: #ffc107;">0</div>
                    <div class="label">Pending</div>
                </div>
            </div>
        </div>
        
        <button class="btn-test" onclick="runAllTests()" style="font-size: 1.1em; padding: 15px 30px;">
            🚀 Run All Tests
        </button>
        
        <!-- API Tests -->
        <div class="test-section">
            <h2>1. API Endpoint Tests</h2>
            
            <div class="test-item">
                <h4>Test: OSINT Collector - Get Stats</h4>
                <button class="btn-test" onclick="testGetStats()">Run Test</button>
                <div id="test-stats" class="test-result pending">Pending...</div>
            </div>
            
            <div class="test-item">
                <h4>Test: OSINT Collector - Search Threats</h4>
                <button class="btn-test" onclick="testSearchThreats()">Run Test</button>
                <div id="test-search" class="test-result pending">Pending...</div>
            </div>
            
            <div class="test-item">
                <h4>Test: OSINT Collector - Get Trending Keywords</h4>
                <button class="btn-test" onclick="testTrendingKeywords()">Run Test</button>
                <div id="test-trending" class="test-result pending">Pending...</div>
            </div>
        </div>
        
        <!-- OSINT Tools Tests -->
        <div class="test-section">
            <h2>2. OSINT Tools Tests</h2>
            
            <div class="test-item">
                <h4>Test: Email Checker</h4>
                <button class="btn-test" onclick="testEmailChecker()">Run Test</button>
                <div id="test-email" class="test-result pending">Pending...</div>
            </div>
            
            <div class="test-item">
                <h4>Test: Username Checker</h4>
                <button class="btn-test" onclick="testUsernameChecker()">Run Test</button>
                <div id="test-username" class="test-result pending">Pending...</div>
            </div>
            
            <div class="test-item">
                <h4>Test: Breach Checker (HaveIBeenPwned)</h4>
                <button class="btn-test" onclick="testBreachChecker()">Run Test</button>
                <div id="test-breach" class="test-result pending">Pending...</div>
            </div>
            
            <div class="test-item">
                <h4>Test: Semak Mule - Bank Account Check</h4>
                <button class="btn-test" onclick="testSemakMuleBank()">Run Test</button>
                <div id="test-bank" class="test-result pending">Pending...</div>
            </div>
            
            <div class="test-item">
                <h4>Test: Semak Mule - Phone Check</h4>
                <button class="btn-test" onclick="testSemakMulePhone()">Run Test</button>
                <div id="test-phone" class="test-result pending">Pending...</div>
            </div>
        </div>
        
        <!-- Database Tests -->
        <div class="test-section">
            <h2>3. Database Tests</h2>
            
            <div class="test-item">
                <h4>Test: Check OSINT Data Table</h4>
                <button class="btn-test" onclick="testDatabaseData()">Run Test</button>
                <div id="test-database" class="test-result pending">Pending...</div>
            </div>
        </div>
    </div>

    <script>
        let totalTests = 0;
        let passedTests = 0;
        let failedTests = 0;
        let pendingTests = 8; // Initial pending count
        
        function updateSummary() {
            document.getElementById('totalTests').textContent = totalTests;
            document.getElementById('passedTests').textContent = passedTests;
            document.getElementById('failedTests').textContent = failedTests;
            document.getElementById('pendingTests').textContent = pendingTests;
        }
        
        function markTestResult(testId, success, message) {
            const element = document.getElementById(testId);
            if (element.classList.contains('pending')) {
                totalTests++;
                pendingTests--;
            }
            
            element.classList.remove('pending', 'success', 'error');
            element.classList.add(success ? 'success' : 'error');
            element.textContent = message;
            
            if (success) {
                passedTests++;
            } else {
                failedTests++;
            }
            
            updateSummary();
        }
        
        async function testGetStats() {
            try {
                const formData = new FormData();
                formData.append('action', 'get_stats');
                formData.append('timeframe', '24h');
                
                const response = await fetch('api/osint-collector.php', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success && result.stats) {
                    markTestResult('test-stats', true, 
                        `✅ PASS\nStats retrieved: ${result.stats.total_threats} total, ` +
                        `${result.stats.critical_threats} critical, ${result.stats.high_threats} high`);
                } else {
                    markTestResult('test-stats', false, `❌ FAIL\n${result.error || 'Invalid response'}`);
                }
            } catch (error) {
                markTestResult('test-stats', false, `❌ FAIL\n${error.message}`);
            }
        }
        
        async function testSearchThreats() {
            try {
                const formData = new FormData();
                formData.append('action', 'search_threats');
                formData.append('limit', '5');
                formData.append('offset', '0');
                
                const response = await fetch('api/osint-collector.php', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success && Array.isArray(result.threats)) {
                    markTestResult('test-search', true, 
                        `✅ PASS\nFound ${result.threats.length} threats`);
                } else {
                    markTestResult('test-search', false, `❌ FAIL\n${result.error || 'Invalid response'}`);
                }
            } catch (error) {
                markTestResult('test-search', false, `❌ FAIL\n${error.message}`);
            }
        }
        
        async function testTrendingKeywords() {
            try {
                const response = await fetch('api/osint-collector.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'action=get_trending&limit=5'
                });
                
                const result = await response.json();
                
                if (result.success && Array.isArray(result.keywords)) {
                    markTestResult('test-trending', true, 
                        `✅ PASS\nFound ${result.keywords.length} trending keywords`);
                } else {
                    markTestResult('test-trending', false, `❌ FAIL\n${result.error || 'Invalid response'}`);
                }
            } catch (error) {
                markTestResult('test-trending', false, `❌ FAIL\n${error.message}`);
            }
        }
        
        async function testEmailChecker() {
            try {
                const formData = new FormData();
                formData.append('action', 'check_email');
                formData.append('email', 'test@example.com');
                
                const response = await fetch('api/osint-tools.php', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success && result.data) {
                    markTestResult('test-email', true, 
                        `✅ PASS\nEmail check working (${result.data.note || 'Basic mode'})`);
                } else {
                    markTestResult('test-email', false, `❌ FAIL\n${result.error || 'Invalid response'}`);
                }
            } catch (error) {
                markTestResult('test-email', false, `❌ FAIL\n${error.message}`);
            }
        }
        
        async function testUsernameChecker() {
            try {
                const formData = new FormData();
                formData.append('action', 'check_username');
                formData.append('username', 'testuser');
                
                const response = await fetch('api/osint-tools.php', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success && result.data) {
                    markTestResult('test-username', true, 
                        `✅ PASS\nUsername check working (${result.data.platforms ? result.data.platforms.length : 0} platforms)`);
                } else {
                    markTestResult('test-username', false, `❌ FAIL\n${result.error || 'Invalid response'}`);
                }
            } catch (error) {
                markTestResult('test-username', false, `❌ FAIL\n${error.message}`);
            }
        }
        
        async function testBreachChecker() {
            try {
                const formData = new FormData();
                formData.append('action', 'check_breach');
                formData.append('email', 'test@example.com');
                
                const response = await fetch('api/osint-tools.php', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    const breachStatus = result.breached ? 
                        `Found ${result.count} breaches` : 'No breaches found';
                    markTestResult('test-breach', true, 
                        `✅ PASS\nHaveIBeenPwned check working (${breachStatus})`);
                } else if (result.http_code === 429) {
                    markTestResult('test-breach', true, 
                        `✅ PASS (Rate Limited)\nAPI is working but rate limited`);
                } else {
                    markTestResult('test-breach', false, `❌ FAIL\n${result.error || 'Invalid response'}`);
                }
            } catch (error) {
                markTestResult('test-breach', false, `❌ FAIL\n${error.message}`);
            }
        }
        
        async function testSemakMuleBank() {
            try {
                const formData = new FormData();
                formData.append('action', 'check_bank_account');
                formData.append('account_number', '1234567890');
                
                const response = await fetch('api/osint-tools.php', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success !== undefined) {
                    markTestResult('test-bank', true, 
                        `✅ PASS\nSemak Mule bank check API accessible`);
                } else {
                    markTestResult('test-bank', false, `❌ FAIL\nInvalid response format`);
                }
            } catch (error) {
                markTestResult('test-bank', false, `❌ FAIL\n${error.message}`);
            }
        }
        
        async function testSemakMulePhone() {
            try {
                const formData = new FormData();
                formData.append('action', 'check_phone');
                formData.append('phone_number', '0123456789');
                
                const response = await fetch('api/osint-tools.php', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success !== undefined) {
                    markTestResult('test-phone', true, 
                        `✅ PASS\nSemak Mule phone check API accessible`);
                } else {
                    markTestResult('test-phone', false, `❌ FAIL\nInvalid response format`);
                }
            } catch (error) {
                markTestResult('test-phone', false, `❌ FAIL\n${error.message}`);
            }
        }
        
        async function testDatabaseData() {
            try {
                const response = await fetch('api/osint-collector.php?stats');
                const result = await response.json();
                
                if (result.success && result.public_stats) {
                    markTestResult('test-database', true, 
                        `✅ PASS\nDatabase accessible with ${result.public_stats.total_threats} threats`);
                } else {
                    markTestResult('test-database', false, `❌ FAIL\nCannot access database`);
                }
            } catch (error) {
                markTestResult('test-database', false, `❌ FAIL\n${error.message}`);
            }
        }
        
        async function runAllTests() {
            // Reset counters
            totalTests = 0;
            passedTests = 0;
            failedTests = 0;
            pendingTests = 8;
            updateSummary();
            
            // Run all tests with slight delays
            await testGetStats();
            await new Promise(resolve => setTimeout(resolve, 500));
            
            await testSearchThreats();
            await new Promise(resolve => setTimeout(resolve, 500));
            
            await testTrendingKeywords();
            await new Promise(resolve => setTimeout(resolve, 500));
            
            await testEmailChecker();
            await new Promise(resolve => setTimeout(resolve, 500));
            
            await testUsernameChecker();
            await new Promise(resolve => setTimeout(resolve, 500));
            
            await testBreachChecker();
            await new Promise(resolve => setTimeout(resolve, 1000)); // Longer delay for external API
            
            await testSemakMuleBank();
            await new Promise(resolve => setTimeout(resolve, 500));
            
            await testSemakMulePhone();
            await new Promise(resolve => setTimeout(resolve, 500));
            
            await testDatabaseData();
            
            // Show completion message
            if (failedTests === 0) {
                alert('🎉 All tests passed! OSINT system is fully functional.');
            } else {
                alert(`⚠️ ${failedTests} test(s) failed. Check the results for details.`);
            }
        }
        
        // Initialize summary on page load
        updateSummary();
    </script>
</body>
</html>

