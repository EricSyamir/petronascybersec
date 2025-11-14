// PETRONAS Cybercrime Reporter Extension - Popup Script
class PetronasCyberExtension {
    constructor() {
        this.baseUrl = 'http://localhost/petronas-cybercrime-platform'; // Update with actual domain
        this.currentLanguage = 'en';
        this.isConnected = false;
        this.llmAnalyzer = null;
        this.imageDropAnalyzer = null;
        
        this.initializeExtension();
    }
    
    async initializeExtension() {
        await this.loadSettings();
        this.setupEventListeners();
        this.setupLanguageToggle();
        this.checkConnection();
        this.loadStats();
        this.loadAlerts();
        this.initializeLLMAnalyzer();
        this.updateUI();
    }
    
    initializeLLMAnalyzer() {
        try {
            this.llmAnalyzer = new LLMAnalyzer();
            console.log('LLM Analyzer initialized');
        } catch (error) {
            console.error('Failed to initialize LLM Analyzer:', error);
        }
    }
    
    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get(['language', 'baseUrl', 'notifications']);
            this.currentLanguage = result.language || 'en';
            this.baseUrl = result.baseUrl || this.baseUrl;
            this.notificationsEnabled = result.notifications !== false;
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }
    
    setupEventListeners() {
        // Main action buttons
        document.getElementById('scanPageBtn').addEventListener('click', () => this.scanCurrentPage());
        document.getElementById('reportIncidentBtn').addEventListener('click', () => this.openReportForm());
        document.getElementById('scanImageBtn').addEventListener('click', () => this.openImageAnalyzer());
        
        // Quick links
        document.getElementById('dashboardLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.openDashboard();
        });
        document.getElementById('osintLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.openOSINTMonitor();
        });
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());
        
        // Modal controls
        document.getElementById('closeModal').addEventListener('click', () => this.hideModal());
        document.getElementById('closeBtn').addEventListener('click', () => this.hideModal());
        document.getElementById('reportBtn').addEventListener('click', () => this.reportScanResult());
        
        // Image analyzer modal controls
        document.getElementById('closeImageModal').addEventListener('click', () => this.hideImageAnalyzer());
        document.getElementById('closeImageBtn').addEventListener('click', () => this.hideImageAnalyzer());
        
        // Language toggle
        document.getElementById('langToggle').addEventListener('click', () => this.toggleLanguage());
    }
    
    setupLanguageToggle() {
        const langBtn = document.getElementById('langToggle');
        langBtn.textContent = this.currentLanguage === 'en' ? 'BM' : 'EN';
        this.updateLanguage();
    }
    
    updateLanguage() {
        const elements = document.querySelectorAll('[data-en]');
        elements.forEach(element => {
            const text = element.getAttribute(`data-${this.currentLanguage}`);
            if (text) {
                element.textContent = text;
            }
        });
    }
    
    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'en' ? 'bm' : 'en';
        this.setupLanguageToggle();
        
        // Save language preference
        chrome.storage.sync.set({ language: this.currentLanguage });
    }
    
    async checkConnection() {
        try {
            const response = await fetch(`${this.baseUrl}/api/status.php`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            this.isConnected = response.ok;
        } catch (error) {
            this.isConnected = false;
        }
        
        this.updateConnectionStatus();
    }
    
    updateConnectionStatus() {
        const statusIndicator = document.getElementById('connectionStatus');
        const statusText = document.getElementById('statusText');
        
        if (this.isConnected) {
            statusIndicator.className = 'status-indicator online';
            statusText.textContent = this.currentLanguage === 'en' ? 'Ready' : 'Sedia';
        } else {
            statusIndicator.className = 'status-indicator offline';
            statusText.textContent = this.currentLanguage === 'en' ? 'Offline' : 'Luar Talian';
        }
    }
    
    async loadStats() {
        try {
            const response = await fetch(`${this.baseUrl}/api/osint-collector.php?stats=1`);
            const data = await response.json();
            
            if (data.success) {
                document.getElementById('totalReports').textContent = data.public_stats.total_threats || 0;
                document.getElementById('activeThreats').textContent = data.public_stats.critical_threats || 0;
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
            document.getElementById('totalReports').textContent = '-';
            document.getElementById('activeThreats').textContent = '-';
        }
    }
    
    async loadAlerts() {
        const alertsList = document.getElementById('alertsList');
        
        try {
            // Simulate loading Malaysian cyber alerts
            const alerts = await this.getMalaysianCyberAlerts();
            
            alertsList.innerHTML = '';
            
            if (alerts.length === 0) {
                alertsList.innerHTML = '<div class="loading">No alerts available</div>';
                return;
            }
            
            alerts.slice(0, 3).forEach(alert => {
                const alertElement = this.createAlertElement(alert);
                alertsList.appendChild(alertElement);
            });
            
        } catch (error) {
            console.error('Failed to load alerts:', error);
            alertsList.innerHTML = '<div class="loading">Failed to load alerts</div>';
        }
    }
    
    async getMalaysianCyberAlerts() {
        // Simulate Malaysian cyber alerts (in production, this would fetch from real sources)
        return [
            {
                title: 'New phishing campaign targeting Malaysian banks',
                source: 'Cyber999',
                level: 'high',
                time: '2h ago'
            },
            {
                title: 'Ransomware affecting SMEs in KL',
                source: 'CyberSecurity Malaysia',
                level: 'critical',
                time: '4h ago'
            },
            {
                title: 'Fake PETRONAS recruitment scam detected',
                source: 'PDRM Commercial Crime',
                level: 'medium',
                time: '6h ago'
            }
        ];
    }
    
    createAlertElement(alert) {
        const element = document.createElement('div');
        element.className = `alert-item ${alert.level}`;
        element.innerHTML = `
            <div class="alert-title">${alert.title}</div>
            <div class="alert-source">${alert.source} • ${alert.time}</div>
        `;
        
        element.addEventListener('click', () => {
            this.showAlertDetails(alert);
        });
        
        return element;
    }
    
    async scanCurrentPage() {
        const scanBtn = document.getElementById('scanPageBtn');
        const originalText = scanBtn.querySelector('.title').textContent;
        
        console.log('🔍 Starting page scan...');
        
        try {
            // Disable button and show loading
            scanBtn.disabled = true;
            scanBtn.querySelector('.title').textContent = this.currentLanguage === 'en' ? 'Scanning...' : 'Mengimbas...';
            
            // Get current tab
            console.log('📋 Getting current tab...');
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            console.log('📋 Current tab:', tab.url);
            
            // Check if we can access the tab
            if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('moz-extension://')) {
                throw new Error('Cannot scan browser internal pages');
            }
            
            // Show scanning modal first
            this.showModal();
            this.updateScanProgress(10, this.currentLanguage === 'en' ? 'Connecting to page...' : 'Menyambung ke halaman...');
            
            // Try to communicate with content script first
            let pageContent;
            console.log('📡 Attempting to communicate with content script...');
            
            try {
                const response = await chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_CONTENT' });
                console.log('📡 Content script response:', response);
                
                if (response && response.success) {
                    pageContent = response.content;
                    console.log('✅ Content extracted via content script');
                } else {
                    throw new Error('Content script not responding properly');
                }
            } catch (contentScriptError) {
                console.log('⚠️ Content script error:', contentScriptError.message);
                console.log('🔧 Falling back to direct script injection...');
                
                try {
                    // Fallback: inject extraction function directly
                    const results = await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        function: () => {
                            console.log('🔧 Direct injection: Extracting page content...');
                            
                            // Check if document is ready
                            if (!document.body) {
                                throw new Error('Document body not available');
                            }
                            
                            const content = {
                                url: window.location.href,
                                title: document.title,
                                images: [],
                                links: [],
                                text: document.body.innerText ? document.body.innerText.substring(0, 2000) : '',
                                domain: window.location.hostname,
                                protocol: window.location.protocol,
                                hasPasswordFields: document.querySelectorAll('input[type="password"]').length > 0,
                                imageCount: document.querySelectorAll('img').length,
                                linkCount: document.querySelectorAll('a[href]').length,
                                formCount: document.querySelectorAll('form').length,
                                suspiciousElements: []
                            };
                            
                            // Extract images safely
                            try {
                                const images = document.querySelectorAll('img');
                                for (let i = 0; i < Math.min(images.length, 10); i++) {
                                    const img = images[i];
                                    if (img.src && !img.src.startsWith('data:')) {
                                        content.images.push({
                                            src: img.src,
                                            alt: img.alt || '',
                                            width: img.naturalWidth || 0,
                                            height: img.naturalHeight || 0
                                        });
                                    }
                                }
                            } catch (imgError) {
                                console.error('Error extracting images:', imgError);
                            }
                            
                            // Extract links safely
                            try {
                                const links = document.querySelectorAll('a[href]');
                                for (let i = 0; i < Math.min(links.length, 20); i++) {
                                    const link = links[i];
                                    content.links.push({
                                        href: link.href,
                                        text: link.textContent ? link.textContent.trim().substring(0, 100) : ''
                                    });
                                }
                            } catch (linkError) {
                                console.error('Error extracting links:', linkError);
                            }
                            
                            console.log('✅ Direct injection: Content extracted successfully');
                            return content;
                        }
                    });
                    
                    if (results && results[0] && results[0].result) {
                        pageContent = results[0].result;
                        console.log('✅ Content extracted via direct injection');
                    } else {
                        throw new Error('Direct injection failed to return content');
                    }
                } catch (injectionError) {
                    console.error('❌ Direct injection failed:', injectionError);
                    throw new Error(`Failed to extract page content: ${injectionError.message}`);
                }
            }
            
            console.log('📊 Extracted content:', {
                url: pageContent.url,
                title: pageContent.title,
                textLength: pageContent.text ? pageContent.text.length : 0,
                imageCount: pageContent.images ? pageContent.images.length : 0,
                linkCount: pageContent.links ? pageContent.links.length : 0
            });
            
            this.updateScanProgress(20, this.currentLanguage === 'en' ? 'Analyzing page content...' : 'Menganalisis kandungan halaman...');
            
            // Analyze with LLM and traditional methods
            console.log('🤖 Starting content analysis...');
            await this.analyzePageContentWithLLM(pageContent);
            
        } catch (error) {
            console.error('❌ Page scan error:', error);
            this.hideModal();
            
            let errorMessage = 'Failed to scan page';
            if (error.message.includes('Cannot scan browser internal pages')) {
                errorMessage = 'Cannot scan browser internal pages';
            } else if (error.message.includes('Cannot access')) {
                errorMessage = 'Cannot access this page. Try refreshing the page first.';
            } else if (error.message.includes('Failed to extract')) {
                errorMessage = 'Could not read page content. Please refresh and try again.';
            }
            
            console.error('❌ Final error message:', errorMessage);
            this.showNotification(errorMessage, 'error');
        } finally {
            scanBtn.disabled = false;
            scanBtn.querySelector('.title').textContent = originalText;
        }
    }
    
    
    async analyzePageContentWithLLM(content) {
        const suspiciousItems = [];
        
        try {
            // Step 1: LLM-based page analysis
            this.updateScanProgress(30, 'Running AI analysis...');
            
            if (this.llmAnalyzer) {
                const llmAnalysis = await this.llmAnalyzer.analyzePageContent(content);
                
                if (llmAnalysis.isSuspicious) {
                    suspiciousItems.push({
                        type: 'AI-detected threat',
                        details: llmAnalysis.reasoning,
                        risk: llmAnalysis.riskLevel,
                        confidence: Math.round(llmAnalysis.confidence * 100),
                        scamType: llmAnalysis.scamType,
                        indicators: llmAnalysis.indicators
                    });
                }
            }
            
            // Step 2: Traditional URL analysis
            this.updateScanProgress(50, 'Checking URLs...');
            await this.delay(500);
            
            for (const link of content.links.slice(0, 5)) {
                if (this.llmAnalyzer) {
                    const urlAnalysis = await this.llmAnalyzer.analyzeURL(link.href, content.title);
                    
                    if (urlAnalysis.isSuspicious) {
                        suspiciousItems.push({
                            type: 'Suspicious URL',
                            details: link.href,
                            risk: urlAnalysis.riskLevel,
                            confidence: Math.round(urlAnalysis.confidence * 100),
                            spoofedBrand: urlAnalysis.spoofedBrand
                        });
                    }
                } else if (this.isSuspiciousURL(link.href)) {
                    suspiciousItems.push({
                        type: 'Suspicious URL',
                        details: link.href,
                        risk: 'medium'
                    });
                }
            }
            
            // Step 3: Text content analysis
            this.updateScanProgress(70, 'Analyzing text content...');
            await this.delay(500);
            
            if (this.llmAnalyzer && content.text) {
                const textAnalysis = await this.llmAnalyzer.analyzeTextContent(content.text, {
                    url: content.url,
                    elementType: 'page_content'
                });
                
                if (textAnalysis.isSuspicious) {
                    suspiciousItems.push({
                        type: 'Suspicious text content',
                        details: textAnalysis.reasoning,
                        risk: textAnalysis.riskLevel,
                        confidence: Math.round(textAnalysis.confidence * 100),
                        suspiciousPhrases: textAnalysis.suspiciousPhrases
                    });
                }
            }
            
            // Step 4: Traditional checks
            this.updateScanProgress(90, 'Running additional checks...');
            await this.delay(500);
            
            // Add any suspicious elements found by traditional methods
            content.suspiciousElements.forEach(element => {
                suspiciousItems.push({
                    type: 'Suspicious content',
                    details: element,
                    risk: 'medium'
                });
            });
            
        } catch (error) {
            console.error('LLM analysis error:', error);
            
            // Fallback to traditional analysis
            this.updateScanProgress(60, 'Running fallback analysis...');
            await this.analyzePageContentTraditional(content, suspiciousItems);
            
            // Add a note about fallback analysis
            suspiciousItems.push({
                type: 'Analysis Note',
                details: 'AI analysis unavailable - using traditional methods',
                risk: 'info',
                confidence: 50
            });
        }
        
        this.updateScanProgress(100, 'Analysis complete');
        await this.delay(500);
        
        this.showScanResults(suspiciousItems);
    }
    
    async analyzePageContentTraditional(content, suspiciousItems) {
        // Traditional analysis as fallback
        content.links.forEach(link => {
            if (this.isSuspiciousURL(link.href)) {
                suspiciousItems.push({
                    type: 'Suspicious URL',
                    details: link.href,
                    risk: 'medium'
                });
            }
        });
        
        // Add any suspicious elements found
        content.suspiciousElements.forEach(element => {
            suspiciousItems.push({
                type: 'Suspicious content',
                details: element,
                risk: 'medium'
            });
        });
    }
    
    isSuspiciousURL(url) {
        const suspiciousDomains = ['bit.ly', 'tinyurl.com', 'short.link'];
        const suspiciousPatterns = [
            /[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/, // IP addresses
            /[a-z]+-[a-z]+-[a-z]+\.com/, // Multiple hyphens
            /[0-9]{4,}\.com/ // Numbers in domain
        ];
        
        try {
            const domain = new URL(url).hostname;
            
            if (suspiciousDomains.some(d => domain.includes(d))) {
                return true;
            }
            
            return suspiciousPatterns.some(pattern => pattern.test(domain));
        } catch {
            return false;
        }
    }
    
    updateScanProgress(percentage, status) {
        document.getElementById('progressFill').style.width = `${percentage}%`;
        document.getElementById('scanStatus').textContent = status;
    }
    
    showScanResults(suspiciousItems) {
        const scanResults = document.getElementById('scanResults');
        const reportBtn = document.getElementById('reportBtn');
        
        scanResults.innerHTML = '';
        
        if (suspiciousItems.length === 0) {
            scanResults.innerHTML = `
                <div class="result-item safe">
                    <div class="result-title">✅ No threats detected</div>
                    <div class="result-description">This page appears to be safe</div>
                </div>
            `;
            reportBtn.classList.add('hidden');
        } else {
            suspiciousItems.forEach(item => {
                const resultClass = this.getRiskClass(item.risk);
                const resultElement = document.createElement('div');
                resultElement.className = `result-item ${resultClass}`;
                
                let confidenceHtml = '';
                if (item.confidence) {
                    confidenceHtml = `<div class="confidence">Confidence: ${item.confidence}%</div>`;
                }
                
                let indicatorsHtml = '';
                if (item.indicators && item.indicators.length > 0) {
                    indicatorsHtml = `
                        <div class="indicators">
                            <strong>Indicators:</strong>
                            <ul>${item.indicators.map(ind => `<li>${ind}</li>`).join('')}</ul>
                        </div>
                    `;
                }
                
                let scamTypeHtml = '';
                if (item.scamType) {
                    scamTypeHtml = `<div class="scam-type">Type: ${item.scamType.toUpperCase()}</div>`;
                }
                
                let spoofedBrandHtml = '';
                if (item.spoofedBrand) {
                    spoofedBrandHtml = `<div class="spoofed-brand">⚠️ Spoofing: ${item.spoofedBrand}</div>`;
                }
                
                resultElement.innerHTML = `
                    <div class="result-header">
                        <div class="result-title">${item.type}</div>
                        <div class="risk-badge ${item.risk}">${item.risk?.toUpperCase() || 'MEDIUM'}</div>
                    </div>
                    <div class="result-description">${item.details}</div>
                    ${confidenceHtml}
                    ${scamTypeHtml}
                    ${spoofedBrandHtml}
                    ${indicatorsHtml}
                `;
                scanResults.appendChild(resultElement);
            });
            
            reportBtn.classList.remove('hidden');
        }
        
        scanResults.classList.remove('hidden');
    }
    
    showModal() {
        document.getElementById('scanModal').classList.remove('hidden');
        document.getElementById('scanResults').classList.add('hidden');
        document.getElementById('reportBtn').classList.add('hidden');
        this.updateScanProgress(0, 'Starting scan...');
    }
    
    hideModal() {
        document.getElementById('scanModal').classList.add('hidden');
    }
    
    async openReportForm() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const reportUrl = `${this.baseUrl}/report-incident.php?url=${encodeURIComponent(tab.url)}&title=${encodeURIComponent(tab.title)}`;
            
            await chrome.tabs.create({ url: reportUrl });
        } catch (error) {
            console.error('Failed to open report form:', error);
            this.showNotification('Failed to open report form', 'error');
        }
    }
    
    async openDashboard() {
        try {
            await chrome.tabs.create({ url: `${this.baseUrl}/public-dashboard.php` });
        } catch (error) {
            console.error('Failed to open dashboard:', error);
            this.showNotification('Failed to open dashboard', 'error');
        }
    }
    
    async openOSINTMonitor() {
        try {
            await chrome.tabs.create({ url: `${this.baseUrl}/osint-monitor.php` });
        } catch (error) {
            console.error('Failed to open OSINT monitor:', error);
            this.showNotification('Failed to open OSINT monitor', 'error');
        }
    }
    
    openSettings() {
        chrome.runtime.openOptionsPage();
    }
    
    openImageAnalyzer() {
        const modal = document.getElementById('imageAnalyzerModal');
        modal.classList.remove('hidden');
        
        // Initialize image drop analyzer if not already done
        if (!this.imageDropAnalyzer) {
            const container = document.getElementById('imageDropContainer');
            this.imageDropAnalyzer = new ImageDropAnalyzer(container, (results) => {
                this.handleImageAnalysisComplete(results);
            });
            
            // Make it globally accessible for the analyzer's button callbacks
            window.imageDropAnalyzer = this.imageDropAnalyzer;
        }
        
        // Make modal body focusable for paste events
        const modalBody = modal.querySelector('.modal-body');
        if (modalBody) {
            modalBody.setAttribute('tabindex', '-1');
            // Focus the modal body so paste events work immediately
            setTimeout(() => {
                modalBody.focus();
            }, 100);
        }
    }
    
    hideImageAnalyzer() {
        const modal = document.getElementById('imageAnalyzerModal');
        modal.classList.add('hidden');
    }
    
    handleImageAnalysisComplete(results) {
        console.log('Image analysis complete:', results);
        
        // Show notification based on results
        const aiAnalysis = results.aiAnalysis;
        if (aiAnalysis.isAI && aiAnalysis.confidence > 0.7) {
            this.showNotification(
                `⚠️ AI/Deepfake detected in ${results.filename} (${Math.round(aiAnalysis.confidence * 100)}% confidence)`,
                'warning'
            );
        } else if (aiAnalysis.isAI && aiAnalysis.confidence > 0.4) {
            this.showNotification(
                `🔍 Potentially AI-generated: ${results.filename}`,
                'info'
            );
        } else {
            this.showNotification(
                `✅ ${results.filename} appears authentic`,
                'success'
            );
        }
    }
    
    reportScanResult() {
        this.hideModal();
        this.openReportForm();
    }
    
    showAlertDetails(alert) {
        // Create a simple alert details popup
        const message = `${alert.title}\n\nSource: ${alert.source}\nLevel: ${alert.level.toUpperCase()}\nTime: ${alert.time}`;
        
        if (confirm(message + '\n\nOpen full details in browser?')) {
            chrome.tabs.create({ url: `${this.baseUrl}/osint-monitor.php` });
        }
    }
    
    showNotification(message, type = 'info') {
        if (this.notificationsEnabled) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: 'PETRONAS Cybercrime Reporter',
                message: message
            });
        }
        
        // Also show in-popup notification
        this.showInPopupNotification(message, type);
    }
    
    showInPopupNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `popup-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: ${type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#28a745'};
            color: white;
            padding: 10px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 2000;
            max-width: 250px;
            word-wrap: break-word;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    updateUI() {
        // Update quick links based on connection status
        const dashboardLink = document.getElementById('dashboardLink');
        const osintLink = document.getElementById('osintLink');
        
        // Always allow clicking - connection check happens when opening
        dashboardLink.style.opacity = '1';
        osintLink.style.opacity = '1';
        dashboardLink.style.pointerEvents = 'auto';
        osintLink.style.pointerEvents = 'auto';
    }
    
    getRiskClass(risk) {
        switch (risk) {
            case 'critical':
            case 'high':
                return 'danger';
            case 'medium':
                return 'warning';
            case 'low':
                return 'info';
            default:
                return 'warning';
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize extension when popup opens
document.addEventListener('DOMContentLoaded', () => {
    new PetronasCyberExtension();
});

// Handle messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'SCAN_IMAGE') {
        // Handle image scan request from context menu
        console.log('Image scan requested:', request.imageUrl);
        // Implement image scanning logic here
    }
    
    if (request.type === 'THREAT_ALERT') {
        // Handle threat alerts
        console.log('Threat alert received:', request.alert);
        // Update UI with new threat information
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case '1':
                e.preventDefault();
                document.getElementById('scanPageBtn').click();
                break;
            case '2':
                e.preventDefault();
                document.getElementById('reportIncidentBtn').click();
                break;
            case 'l':
                e.preventDefault();
                document.getElementById('langToggle').click();
                break;
        }
    }
    
    if (e.key === 'Escape') {
        const modal = document.getElementById('scanModal');
        if (!modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
        }
    }
});
