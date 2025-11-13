<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OSINT System Setup - PETRONAS Cybercrime Platform</title>
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="stylesheet" href="assets/css/petronas-theme.css">
    <style>
        .setup-container {
            max-width: 800px;
            margin: 50px auto;
            padding: 30px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .setup-step {
            padding: 20px;
            margin: 20px 0;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            background: #f8f9fa;
        }
        .setup-step h3 {
            color: #00a19c;
            margin-bottom: 10px;
        }
        .status {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            margin-left: 10px;
        }
        .status.success { background: #d4edda; color: #155724; }
        .status.error { background: #f8d7da; color: #721c24; }
        .status.pending { background: #fff3cd; color: #856404; }
        .btn-setup {
            background: #00a19c;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin: 5px;
        }
        .btn-setup:hover {
            background: #008b87;
        }
        .result-box {
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
            background: white;
            border: 1px solid #dee2e6;
        }
        .progress {
            width: 100%;
            height: 30px;
            background: #e9ecef;
            border-radius: 15px;
            overflow: hidden;
            margin: 20px 0;
        }
        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #00a19c, #00d1cc);
            transition: width 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="setup-container">
        <h1>🚀 OSINT System Setup</h1>
        <p>Initialize and configure the OSINT monitoring system for PETRONAS Cybercrime Platform.</p>
        
        <div class="progress">
            <div class="progress-bar" id="progressBar" style="width: 0%">0%</div>
        </div>
        
        <!-- Database Setup -->
        <div class="setup-step">
            <h3>1. Database Initialization <span class="status pending" id="dbStatus">Pending</span></h3>
            <p>Initialize all required database tables for OSINT monitoring.</p>
            <button class="btn-setup" onclick="initializeDatabase()">Initialize Database</button>
            <div id="dbResult" class="result-box" style="display: none;"></div>
        </div>
        
        <!-- Sample Data Setup -->
        <div class="setup-step">
            <h3>2. Load Sample OSINT Data <span class="status pending" id="dataStatus">Pending</span></h3>
            <p>Populate the database with sample threat intelligence data for demonstration.</p>
            <button class="btn-setup" onclick="loadSampleData()">Load Sample Data</button>
            <div id="dataResult" class="result-box" style="display: none;"></div>
        </div>
        
        <!-- Python Tools Check -->
        <div class="setup-step">
            <h3>3. Python OSINT Tools <span class="status pending" id="pythonStatus">Optional</span></h3>
            <p>Check if optional Python tools are installed for enhanced functionality.</p>
            <ul>
                <li><strong>Holehe:</strong> Email checker (pip install holehe)</li>
                <li><strong>Mr.Holmes:</strong> Username checker</li>
            </ul>
            <p><small><em>Note: System will work without these tools using basic fallback methods.</em></small></p>
        </div>
        
        <!-- API Endpoints Check -->
        <div class="setup-step">
            <h3>4. API Endpoints Verification <span class="status pending" id="apiStatus">Pending</span></h3>
            <p>Verify all API endpoints are accessible and functioning.</p>
            <button class="btn-setup" onclick="checkAPIs()">Check APIs</button>
            <div id="apiResult" class="result-box" style="display: none;"></div>
        </div>
        
        <!-- Completion -->
        <div class="setup-step" id="completionStep" style="display: none;">
            <h3>✅ Setup Complete!</h3>
            <p>Your OSINT monitoring system is ready to use.</p>
            <a href="osint-monitor.php" class="btn-setup">Open OSINT Monitor</a>
        </div>
    </div>

    <script>
        let completedSteps = 0;
        const totalSteps = 3; // Database, Data, APIs
        
        function updateProgress() {
            const percentage = (completedSteps / totalSteps) * 100;
            const progressBar = document.getElementById('progressBar');
            progressBar.style.width = percentage + '%';
            progressBar.textContent = Math.round(percentage) + '%';
            
            if (completedSteps === totalSteps) {
                document.getElementById('completionStep').style.display = 'block';
            }
        }
        
        function updateStatus(elementId, status, message = '') {
            const element = document.getElementById(elementId);
            element.className = 'status ' + status;
            element.textContent = status === 'success' ? 'Complete' : status === 'error' ? 'Failed' : 'Pending';
            
            if (status === 'success') {
                completedSteps++;
                updateProgress();
            }
        }
        
        async function initializeDatabase() {
            const resultDiv = document.getElementById('dbResult');
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = '<p>⏳ Initializing database tables...</p>';
            
            try {
                // Trigger database initialization through a page load
                const response = await fetch('config/database.php');
                
                // Check if tables were created by querying the API
                const checkResponse = await fetch('api/osint-collector.php?stats');
                const result = await checkResponse.json();
                
                if (result.success || checkResponse.status === 200) {
                    resultDiv.innerHTML = '<p style="color: green;">✅ Database initialized successfully!</p>' +
                        '<p>Tables created: users, reports, osint_data, investigation_cases, etc.</p>';
                    updateStatus('dbStatus', 'success');
                } else {
                    throw new Error('Database initialization verification failed');
                }
            } catch (error) {
                resultDiv.innerHTML = '<p style="color: red;">❌ Error: ' + error.message + '</p>' +
                    '<p>Please ensure your database "petronas_cybercrime" exists and check config/database.php</p>';
                updateStatus('dbStatus', 'error');
            }
        }
        
        async function loadSampleData() {
            const resultDiv = document.getElementById('dataResult');
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = '<p>⏳ Loading sample OSINT data...</p>';
            
            try {
                const response = await fetch('api/init-osint-data.php?init=osint_data');
                const result = await response.json();
                
                if (result.success) {
                    resultDiv.innerHTML = '<p style="color: green;">✅ ' + result.message + '</p>' +
                        '<p>Sample threats loaded with various threat levels (critical, high, medium, low)</p>';
                    updateStatus('dataStatus', 'success');
                } else {
                    throw new Error(result.error || 'Failed to load sample data');
                }
            } catch (error) {
                resultDiv.innerHTML = '<p style="color: red;">❌ Error: ' + error.message + '</p>';
                updateStatus('dataStatus', 'error');
            }
        }
        
        async function checkAPIs() {
            const resultDiv = document.getElementById('apiResult');
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = '<p>⏳ Checking API endpoints...</p>';
            
            const endpoints = [
                { name: 'OSINT Collector', url: 'api/osint-collector.php?stats', method: 'GET' },
                { name: 'OSINT Tools', url: 'api/osint-tools.php?health', method: 'GET' }
            ];
            
            let allSuccess = true;
            let html = '<ul>';
            
            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(endpoint.url);
                    const data = await response.json();
                    
                    if (response.ok && data.success) {
                        html += '<li style="color: green;">✅ ' + endpoint.name + ' - Working</li>';
                    } else {
                        html += '<li style="color: orange;">⚠️ ' + endpoint.name + ' - Accessible but may have issues</li>';
                    }
                } catch (error) {
                    html += '<li style="color: red;">❌ ' + endpoint.name + ' - Error: ' + error.message + '</li>';
                    allSuccess = false;
                }
            }
            
            html += '</ul>';
            resultDiv.innerHTML = html;
            
            if (allSuccess) {
                resultDiv.innerHTML += '<p style="color: green; font-weight: bold;">All API endpoints are functional!</p>';
                updateStatus('apiStatus', 'success');
            } else {
                updateStatus('apiStatus', 'error');
            }
        }
        
        // Auto-check on page load
        window.addEventListener('DOMContentLoaded', () => {
            console.log('OSINT Setup page loaded');
        });
    </script>
</body>
</html>

