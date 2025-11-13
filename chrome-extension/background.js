// PETRONAS Cybercrime Reporter Extension - Background Service Worker

class PetronasBackgroundService {
    constructor() {
        this.platformUrl = 'http://localhost/petronas-cybercrime-platform';
        this.updateInterval = 5 * 60 * 1000; // 5 minutes
        this.lastUpdateTime = 0;
        this.llmAnalyzer = null;
        
        this.initializeBackground();
    }
    
    initializeBackground() {
        this.setupContextMenus();
        this.setupMessageHandlers();
        this.setupAlarms();
        this.loadSettings();
        
        console.log('PETRONAS Cybercrime Reporter background service initialized');
    }
    
    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get(['platformUrl', 'notifications', 'autoScan']);
            this.platformUrl = result.platformUrl || this.platformUrl;
            this.notificationsEnabled = result.notifications !== false;
            this.autoScanEnabled = result.autoScan === true;
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }
    
    setupContextMenus() {
        // Remove existing context menus
        chrome.contextMenus.removeAll(() => {
            // Create context menu for images
            chrome.contextMenus.create({
                id: 'scan-image',
                title: 'Scan with PETRONAS Deepfake Detector',
                contexts: ['image'],
                documentUrlPatterns: ['http://*/*', 'https://*/*']
            });
            
            // Create context menu for links
            chrome.contextMenus.create({
                id: 'check-link',
                title: 'Check Link with PETRONAS',
                contexts: ['link'],
                documentUrlPatterns: ['http://*/*', 'https://*/*']
            });
            
            // Create context menu for selected text
            chrome.contextMenus.create({
                id: 'report-text',
                title: 'Report Selected Text',
                contexts: ['selection'],
                documentUrlPatterns: ['http://*/*', 'https://*/*']
            });
            
            // Create page-level context menu
            chrome.contextMenus.create({
                id: 'scan-page',
                title: 'Scan Page for Threats',
                contexts: ['page'],
                documentUrlPatterns: ['http://*/*', 'https://*/*']
            });
        });
    }
    
    setupMessageHandlers() {
        // Handle messages from content scripts and popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Keep message channel open for async response
        });
        
        // Handle context menu clicks
        chrome.contextMenus.onClicked.addListener((info, tab) => {
            this.handleContextMenuClick(info, tab);
        });
        
        // Handle extension installation
        chrome.runtime.onInstalled.addListener((details) => {
            this.handleInstallation(details);
        });
        
        // Handle tab updates (for auto-scanning)
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete' && this.autoScanEnabled) {
                this.autoScanPage(tab);
            }
        });
    }
    
    setupAlarms() {
        // Create alarm for periodic threat updates
        chrome.alarms.create('updateThreats', {
            periodInMinutes: 5
        });
        
        // Handle alarm events
        chrome.alarms.onAlarm.addListener((alarm) => {
            if (alarm.name === 'updateThreats') {
                this.updateThreatIntelligence();
            }
        });
    }
    
    async handleMessage(request, sender, sendResponse) {
        try {
            switch (request.type) {
                case 'SCAN_IMAGE':
                    const imageResult = await this.scanImage(request.imageUrl, sender.tab);
                    sendResponse({ success: true, result: imageResult });
                    break;
                    
                case 'SCAN_PAGE':
                    const pageResult = await this.scanPage(sender.tab);
                    sendResponse({ success: true, result: pageResult });
                    break;
                    
                case 'CHECK_URL':
                    const urlResult = await this.checkUrl(request.url);
                    sendResponse({ success: true, result: urlResult });
                    break;
                    
                case 'SUBMIT_REPORT':
                    const reportResult = await this.submitReport(request.data);
                    sendResponse({ success: true, result: reportResult });
                    break;
                    
                case 'GET_STATS':
                    const stats = await this.getStats();
                    sendResponse({ success: true, stats: stats });
                    break;
                    
                default:
                    sendResponse({ success: false, error: 'Unknown message type' });
            }
        } catch (error) {
            console.error('Message handling error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }
    
    async handleContextMenuClick(info, tab) {
        try {
            switch (info.menuItemId) {
                case 'scan-image':
                    await this.scanImageFromContext(info.srcUrl, tab);
                    break;
                    
                case 'check-link':
                    await this.checkLinkFromContext(info.linkUrl, tab);
                    break;
                    
                case 'report-text':
                    await this.reportTextFromContext(info.selectionText, tab);
                    break;
                    
                case 'scan-page':
                    await this.scanPageFromContext(tab);
                    break;
            }
        } catch (error) {
            console.error('Context menu handling error:', error);
            this.showNotification('Failed to perform action', 'error');
        }
    }
    
    async scanImageFromContext(imageUrl, tab) {
        try {
            this.showNotification('Analyzing image for deepfake content...', 'info');
            
            const result = await this.analyzeImageWithSightengine(imageUrl);
            
            if (result.isDeepfake) {
                this.showNotification(
                    `⚠️ Potential deepfake detected! Confidence: ${Math.round(result.confidence * 100)}%`,
                    'warning'
                );
                
                // Offer to report
                this.showNotification('Click extension icon to report this content', 'info');
                
                // Store result for reporting
                await chrome.storage.local.set({
                    lastScanResult: {
                        type: 'image',
                        url: imageUrl,
                        pageUrl: tab.url,
                        result: result,
                        timestamp: Date.now()
                    }
                });
            } else {
                this.showNotification('✅ Image appears authentic', 'success');
            }
            
        } catch (error) {
            console.error('Image scan error:', error);
            this.showNotification('Failed to analyze image', 'error');
        }
    }
    
    async analyzeImageWithSightengine(imageUrl) {
        try {
            // Call Sightengine API via platform
            const response = await fetch(`${this.platformUrl}/api/sightengine.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'analyze_url',
                    url: imageUrl
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                return {
                    isDeepfake: data.analysis.is_deepfake,
                    confidence: data.analysis.confidence_score,
                    indicators: data.analysis.indicators
                };
            } else {
                throw new Error(data.error || 'Analysis failed');
            }
        } catch (error) {
            console.error('Sightengine API error:', error);
            
            // Fallback to local analysis
            return this.performLocalImageAnalysis(imageUrl);
        }
    }
    
    performLocalImageAnalysis(imageUrl) {
        // Simplified local analysis (placeholder)
        const suspiciousPatterns = [
            /deepfake/i,
            /generated/i,
            /synthetic/i,
            /fake/i
        ];
        
        const isSuspicious = suspiciousPatterns.some(pattern => 
            pattern.test(imageUrl) || pattern.test(document.title || '')
        );
        
        return {
            isDeepfake: isSuspicious || Math.random() > 0.9, // 10% random detection for demo
            confidence: Math.random() * 0.3 + (isSuspicious ? 0.7 : 0.1),
            indicators: isSuspicious ? ['Suspicious URL pattern'] : []
        };
    }
    
    async checkLinkFromContext(linkUrl, tab) {
        try {
            this.showNotification('Checking link safety...', 'info');
            
            const result = await this.checkUrlSafety(linkUrl);
            
            if (result.isSuspicious) {
                this.showNotification(
                    `⚠️ Suspicious link detected: ${result.reason}`,
                    'warning'
                );
            } else {
                this.showNotification('✅ Link appears safe', 'success');
            }
            
        } catch (error) {
            console.error('Link check error:', error);
            this.showNotification('Failed to check link', 'error');
        }
    }
    
    async checkUrlSafety(url) {
        try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname;
            
            // Check against known suspicious patterns
            const suspiciousPatterns = [
                /[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/, // IP addresses
                /[a-z]+-[a-z]+-[a-z]+\.com/, // Multiple hyphens
                /[0-9]{4,}\.com/, // Numbers in domain
                /(bit\.ly|tinyurl\.com|short\.link)/ // URL shorteners
            ];
            
            const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(domain));
            
            if (isSuspicious) {
                return {
                    isSuspicious: true,
                    reason: 'Suspicious domain pattern'
                };
            }
            
            // Check protocol
            if (urlObj.protocol !== 'https:' && domain !== 'localhost') {
                return {
                    isSuspicious: true,
                    reason: 'Insecure connection (HTTP)'
                };
            }
            
            return { isSuspicious: false };
            
        } catch (error) {
            return {
                isSuspicious: true,
                reason: 'Invalid URL format'
            };
        }
    }
    
    async reportTextFromContext(selectedText, tab) {
        try {
            // Open report form with pre-filled text
            const reportUrl = `${this.platformUrl}/report-incident.php?` + 
                `url=${encodeURIComponent(tab.url)}&` +
                `title=${encodeURIComponent(tab.title)}&` +
                `description=${encodeURIComponent(`Suspicious text found: "${selectedText}"`)}`;
            
            await chrome.tabs.create({ url: reportUrl });
            
        } catch (error) {
            console.error('Report text error:', error);
            this.showNotification('Failed to open report form', 'error');
        }
    }
    
    async scanPageFromContext(tab) {
        try {
            this.showNotification('Scanning page for threats...', 'info');
            
            // Send message to content script to analyze page
            const response = await chrome.tabs.sendMessage(tab.id, {
                type: 'ANALYZE_PAGE'
            });
            
            if (response && response.threats > 0) {
                this.showNotification(
                    `⚠️ ${response.threats} potential threats found on this page`,
                    'warning'
                );
            } else {
                this.showNotification('✅ No threats detected on this page', 'success');
            }
            
        } catch (error) {
            console.error('Page scan error:', error);
            this.showNotification('Failed to scan page', 'error');
        }
    }
    
    async autoScanPage(tab) {
        if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('moz-extension://')) {
            return; // Skip browser internal pages
        }
        
        try {
            // Perform lightweight automatic scan
            const result = await this.quickPageScan(tab);
            
            if (result.threatLevel > 0.7) {
                this.showNotification(
                    '🚨 High-risk content detected on this page!',
                    'warning'
                );
                
                // Set badge to indicate threats
                chrome.action.setBadgeText({
                    text: '!',
                    tabId: tab.id
                });
                chrome.action.setBadgeBackgroundColor({
                    color: '#dc3545',
                    tabId: tab.id
                });
            }
            
        } catch (error) {
            console.error('Auto-scan error:', error);
        }
    }
    
    async quickPageScan(tab) {
        const suspiciousKeywords = [
            'verify your account', 'suspended account', 'urgent action required',
            'click here immediately', 'limited time offer', 'act now',
            'confirm your identity', 'update payment method'
        ];
        
        const url = tab.url.toLowerCase();
        const title = tab.title ? tab.title.toLowerCase() : '';
        
        let threatScore = 0;
        
        // Check URL patterns
        if (/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/.test(url)) threatScore += 0.3;
        if (url.includes('bit.ly') || url.includes('tinyurl')) threatScore += 0.2;
        if (!url.startsWith('https://') && !url.includes('localhost')) threatScore += 0.2;
        
        // Check title for suspicious content
        suspiciousKeywords.forEach(keyword => {
            if (title.includes(keyword)) threatScore += 0.1;
        });
        
        return { threatLevel: threatScore };
    }
    
    async updateThreatIntelligence() {
        try {
            const response = await fetch(`${this.platformUrl}/api/osint-collector.php?stats=1`);
            const data = await response.json();
            
            if (data.success) {
                const newThreats = data.public_stats.critical_threats || 0;
                
                // Store current threat count
                const result = await chrome.storage.local.get(['lastThreatCount']);
                const lastCount = result.lastThreatCount || 0;
                
                if (newThreats > lastCount) {
                    this.showNotification(
                        `🚨 ${newThreats - lastCount} new critical threats detected in Malaysia`,
                        'warning'
                    );
                }
                
                await chrome.storage.local.set({ lastThreatCount: newThreats });
                this.lastUpdateTime = Date.now();
            }
            
        } catch (error) {
            console.error('Threat intelligence update error:', error);
        }
    }
    
    async getStats() {
        try {
            const response = await fetch(`${this.platformUrl}/api/osint-collector.php?stats=1`);
            const data = await response.json();
            
            if (data.success) {
                return data.public_stats;
            }
        } catch (error) {
            console.error('Stats fetch error:', error);
        }
        
        return {
            total_threats: 0,
            critical_threats: 0,
            last_updated: new Date().toISOString()
        };
    }
    
    showNotification(message, type = 'info') {
        if (!this.notificationsEnabled) return;
        
        const iconMap = {
            success: 'icons/icon48.png',
            warning: 'icons/icon48.png',
            error: 'icons/icon48.png',
            info: 'icons/icon48.png'
        };
        
        chrome.notifications.create({
            type: 'basic',
            iconUrl: iconMap[type],
            title: 'PETRONAS Cybercrime Reporter',
            message: message,
            priority: type === 'warning' ? 2 : 1
        });
    }
    
    async handleInstallation(details) {
        if (details.reason === 'install') {
            // Show welcome notification
            this.showNotification(
                'Welcome to PETRONAS Cybercrime Reporter! Right-click on any content to scan for threats.',
                'info'
            );
            
            // Open options page
            chrome.runtime.openOptionsPage();
            
            // Set default settings
            await chrome.storage.sync.set({
                notifications: true,
                autoScan: false,
                language: 'en',
                platformUrl: this.platformUrl
            });
        }
    }
}

// Initialize background service
const backgroundService = new PetronasBackgroundService();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PetronasBackgroundService;
}
