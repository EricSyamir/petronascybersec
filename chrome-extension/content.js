// PETRONAS Cybercrime Reporter Extension - Content Script

class PetronasContentScript {
    constructor() {
        this.scanResults = [];
        this.isScanning = false;
        this.pageAnalyzed = false;
        this.llmAnalyzer = null;
        
        this.initializeContentScript();
    }
    
    initializeContentScript() {
        this.setupMessageHandlers();
        this.observePageChanges();
        this.injectPageAnalysisTools();
        
        // Mark script as loaded
        document.documentElement.setAttribute('data-petronas-extension', 'loaded');
        
        console.log('🚀 PETRONAS content script initialized on:', window.location.href);
        console.log('📋 Document ready state:', document.readyState);
        console.log('🔧 Extension data attribute set:', document.documentElement.getAttribute('data-petronas-extension'));
    }
    
    setupMessageHandlers() {
        // Listen for messages from background script and popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Keep message channel open for async response
        });
    }
    
    async handleMessage(request, sender, sendResponse) {
        console.log('📨 Content script received message:', request.type);
        
        try {
            switch (request.type) {
                case 'ANALYZE_PAGE':
                    console.log('🔍 Analyzing page...');
                    const threats = await this.analyzePage();
                    console.log('✅ Page analysis complete, threats found:', threats.length);
                    sendResponse({ success: true, threats: threats.length, results: threats });
                    break;
                    
                case 'SCAN_IMAGES':
                    console.log('🖼️ Scanning images...');
                    const imageResults = await this.scanImages();
                    sendResponse({ success: true, results: imageResults });
                    break;
                    
                case 'EXTRACT_CONTENT':
                    console.log('📄 Extracting page content...');
                    try {
                        const content = this.extractPageContent();
                        console.log('✅ Content extracted successfully:', {
                            url: content.url,
                            textLength: content.text ? content.text.length : 0,
                            imageCount: content.images ? content.images.length : 0,
                            linkCount: content.links ? content.links.length : 0
                        });
                        sendResponse({ success: true, content: content });
                    } catch (extractError) {
                        console.error('❌ Content extraction failed:', extractError);
                        sendResponse({ success: false, error: `Content extraction failed: ${extractError.message}` });
                    }
                    break;
                    
                case 'HIGHLIGHT_THREATS':
                    console.log('🎯 Highlighting threats...');
                    this.highlightThreats(request.threats);
                    sendResponse({ success: true });
                    break;
                    
                case 'GET_PAGE_INFO':
                    console.log('ℹ️ Getting page info...');
                    const pageInfo = this.getPageInfo();
                    sendResponse({ success: true, pageInfo: pageInfo });
                    break;
                    
                default:
                    console.warn('⚠️ Unknown message type:', request.type);
                    sendResponse({ success: false, error: 'Unknown message type' });
            }
        } catch (error) {
            console.error('❌ Content script message handling error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }
    
    observePageChanges() {
        // Watch for dynamic content changes
        const observer = new MutationObserver((mutations) => {
            let shouldReanalyze = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Check if new content contains images or suspicious elements
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const hasImages = node.querySelectorAll && node.querySelectorAll('img').length > 0;
                            const hasLinks = node.querySelectorAll && node.querySelectorAll('a').length > 0;
                            
                            if (hasImages || hasLinks) {
                                shouldReanalyze = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldReanalyze && !this.isScanning) {
                this.debounceAnalysis();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        this.mutationObserver = observer;
    }
    
    debounceAnalysis() {
        clearTimeout(this.analysisTimeout);
        this.analysisTimeout = setTimeout(() => {
            this.performQuickAnalysis();
        }, 2000);
    }
    
    async performQuickAnalysis() {
        if (this.isScanning) return;
        
        try {
            this.isScanning = true;
            const threats = await this.scanForNewThreats();
            
            if (threats.length > 0) {
                // Notify background script about new threats
                chrome.runtime.sendMessage({
                    type: 'NEW_THREATS_DETECTED',
                    threats: threats,
                    url: window.location.href
                });
            }
        } catch (error) {
            console.error('Quick analysis error:', error);
        } finally {
            this.isScanning = false;
        }
    }
    
    injectPageAnalysisTools() {
        // Add visual indicators for scanned content
        const style = document.createElement('style');
        style.textContent = `
            .petronas-threat-highlight {
                outline: 2px solid #dc3545 !important;
                outline-offset: 2px !important;
                background-color: rgba(220, 53, 69, 0.1) !important;
            }
            
            .petronas-safe-highlight {
                outline: 2px solid #28a745 !important;
                outline-offset: 2px !important;
                background-color: rgba(40, 167, 69, 0.1) !important;
            }
            
            .petronas-scan-overlay {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #003366;
                color: white;
                padding: 10px 15px;
                border-radius: 5px;
                font-family: Arial, sans-serif;
                font-size: 14px;
                z-index: 10000;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                max-width: 300px;
            }
            
            .petronas-scan-progress {
                width: 100%;
                height: 4px;
                background: rgba(255,255,255,0.3);
                border-radius: 2px;
                margin-top: 8px;
                overflow: hidden;
            }
            
            .petronas-scan-progress-bar {
                height: 100%;
                background: #00A651;
                width: 0%;
                transition: width 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }
    
    async analyzePage() {
        this.showScanOverlay('Analyzing page content...');
        
        const threats = [];
        
        try {
            // Analyze different aspects of the page
            const urlThreats = this.analyzeUrl();
            const textThreats = await this.analyzeTextContent();
            const imageThreats = await this.analyzeImages();
            const linkThreats = this.analyzeLinks();
            const formThreats = this.analyzeForms();
            
            threats.push(...urlThreats, ...textThreats, ...imageThreats, ...linkThreats, ...formThreats);
            
            this.scanResults = threats;
            this.pageAnalyzed = true;
            
            this.hideScanOverlay();
            
            return threats;
            
        } catch (error) {
            console.error('Page analysis error:', error);
            this.hideScanOverlay();
            return [];
        }
    }
    
    analyzeUrl() {
        const threats = [];
        const url = window.location.href.toLowerCase();
        const hostname = window.location.hostname;
        
        // Check for suspicious URL patterns
        const suspiciousPatterns = [
            {
                pattern: /[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/,
                threat: 'IP address instead of domain name',
                risk: 'medium'
            },
            {
                pattern: /[a-z]+-[a-z]+-[a-z]+\.(com|net|org)/,
                threat: 'Suspicious domain with multiple hyphens',
                risk: 'medium'
            },
            {
                pattern: /[0-9]{4,}\.(com|net|org)/,
                threat: 'Domain contains many numbers',
                risk: 'low'
            }
        ];
        
        suspiciousPatterns.forEach(({ pattern, threat, risk }) => {
            if (pattern.test(hostname)) {
                threats.push({
                    type: 'url',
                    threat: threat,
                    risk: risk,
                    element: null,
                    details: `Suspicious URL pattern: ${hostname}`
                });
            }
        });
        
        // Check protocol
        if (window.location.protocol === 'http:' && hostname !== 'localhost') {
            threats.push({
                type: 'url',
                threat: 'Insecure connection (HTTP)',
                risk: 'medium',
                element: null,
                details: 'This page is not using HTTPS encryption'
            });
        }
        
        return threats;
    }
    
    async analyzeTextContent() {
        const threats = [];
        const bodyText = document.body.innerText.toLowerCase();
        
        // Suspicious phrases that often appear in scams
        const suspiciousPhrases = [
            {
                phrases: ['verify your account', 'account suspended', 'urgent action required'],
                threat: 'Account verification scam indicators',
                risk: 'high'
            },
            {
                phrases: ['click here immediately', 'act now', 'limited time'],
                threat: 'Urgency manipulation tactics',
                risk: 'medium'
            },
            {
                phrases: ['confirm your identity', 'update payment method', 'billing information'],
                threat: 'Financial information phishing',
                risk: 'high'
            },
            {
                phrases: ['congratulations you have won', 'you are the winner', 'claim your prize'],
                threat: 'Prize scam indicators',
                risk: 'medium'
            },
            {
                phrases: ['nigerian prince', 'inheritance', 'million dollars'],
                threat: 'Advance fee fraud indicators',
                risk: 'high'
            }
        ];
        
        suspiciousPhrases.forEach(({ phrases, threat, risk }) => {
            phrases.forEach(phrase => {
                if (bodyText.includes(phrase)) {
                    // Find the element containing this text
                    const elements = this.findElementsContainingText(phrase);
                    
                    threats.push({
                        type: 'text',
                        threat: threat,
                        risk: risk,
                        element: elements[0] || null,
                        details: `Suspicious phrase detected: "${phrase}"`
                    });
                }
            });
        });
        
        return threats;
    }
    
    async analyzeImages() {
        const threats = [];
        const images = document.querySelectorAll('img');
        
        for (let i = 0; i < Math.min(images.length, 10); i++) {
            const img = images[i];
            
            // Skip very small images (likely icons or tracking pixels)
            if (img.naturalWidth < 50 || img.naturalHeight < 50) continue;
            
            try {
                // Basic URL analysis
                if (this.isSuspiciousImageUrl(img.src)) {
                    threats.push({
                        type: 'image',
                        threat: 'Suspicious image source',
                        risk: 'low',
                        element: img,
                        details: `Image from suspicious domain: ${new URL(img.src).hostname}`
                    });
                }
                
                // Check alt text for suspicious content
                if (img.alt && this.hasSuspiciousText(img.alt)) {
                    threats.push({
                        type: 'image',
                        threat: 'Suspicious image description',
                        risk: 'medium',
                        element: img,
                        details: `Suspicious alt text: "${img.alt}"`
                    });
                }
                
            } catch (error) {
                console.error('Image analysis error:', error);
            }
        }
        
        return threats;
    }
    
    analyzeLinks() {
        const threats = [];
        const links = document.querySelectorAll('a[href]');
        
        links.forEach(link => {
            try {
                const href = link.href.toLowerCase();
                const linkText = link.textContent.trim().toLowerCase();
                const url = new URL(link.href);
                
                // Check for URL shorteners
                const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'short.link', 'is.gd'];
                if (shorteners.some(shortener => url.hostname.includes(shortener))) {
                    threats.push({
                        type: 'link',
                        threat: 'URL shortener detected',
                        risk: 'medium',
                        element: link,
                        details: `Shortened URL: ${url.hostname}`
                    });
                }
                
                // Check for suspicious link text
                if (this.hasSuspiciousText(linkText)) {
                    threats.push({
                        type: 'link',
                        threat: 'Suspicious link text',
                        risk: 'medium',
                        element: link,
                        details: `Suspicious text: "${linkText}"`
                    });
                }
                
                // Check for deceptive links (text doesn't match destination)
                if (this.isDeceptiveLink(linkText, url.hostname)) {
                    threats.push({
                        type: 'link',
                        threat: 'Deceptive link destination',
                        risk: 'high',
                        element: link,
                        details: `Link text suggests different destination than actual URL`
                    });
                }
                
            } catch (error) {
                // Invalid URL, which is itself suspicious
                threats.push({
                    type: 'link',
                    threat: 'Invalid or malformed URL',
                    risk: 'medium',
                    element: link,
                    details: `Malformed URL: ${link.href}`
                });
            }
        });
        
        return threats;
    }
    
    analyzeForms() {
        const threats = [];
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            // Check if form submits to different domain
            if (form.action) {
                try {
                    const formUrl = new URL(form.action, window.location.href);
                    if (formUrl.hostname !== window.location.hostname) {
                        threats.push({
                            type: 'form',
                            threat: 'Form submits to external domain',
                            risk: 'medium',
                            element: form,
                            details: `Form submits to: ${formUrl.hostname}`
                        });
                    }
                } catch (error) {
                    threats.push({
                        type: 'form',
                        threat: 'Form has invalid action URL',
                        risk: 'medium',
                        element: form,
                        details: 'Malformed form action URL'
                    });
                }
            }
            
            // Check for password fields on non-HTTPS pages
            const passwordFields = form.querySelectorAll('input[type="password"]');
            if (passwordFields.length > 0 && window.location.protocol === 'http:') {
                threats.push({
                    type: 'form',
                    threat: 'Password field on insecure page',
                    risk: 'high',
                    element: form,
                    details: 'Password forms should only be used on HTTPS pages'
                });
            }
        });
        
        return threats;
    }
    
    isSuspiciousImageUrl(src) {
        try {
            const url = new URL(src);
            const hostname = url.hostname.toLowerCase();
            
            // Check for suspicious domains
            const suspiciousDomains = [
                'bit.ly', 'tinyurl.com', 'discord.com', 'imgur.com'
            ];
            
            return suspiciousDomains.some(domain => hostname.includes(domain));
        } catch {
            return true; // Invalid URL is suspicious
        }
    }
    
    hasSuspiciousText(text) {
        const suspiciousKeywords = [
            'verify', 'urgent', 'suspended', 'locked', 'expired',
            'confirm', 'update', 'click here', 'act now', 'limited'
        ];
        
        const lowerText = text.toLowerCase();
        return suspiciousKeywords.some(keyword => lowerText.includes(keyword));
    }
    
    isDeceptiveLink(linkText, actualDomain) {
        // Check if link text mentions a different domain
        const domainPattern = /([a-z0-9-]+\.(com|net|org|gov|edu|mil))/gi;
        const textDomains = linkText.match(domainPattern);
        
        if (textDomains) {
            return !textDomains.some(domain => 
                actualDomain.toLowerCase().includes(domain.toLowerCase())
            );
        }
        
        return false;
    }
    
    findElementsContainingText(text) {
        const elements = [];
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        let node;
        while (node = walker.nextNode()) {
            if (node.textContent.toLowerCase().includes(text.toLowerCase())) {
                elements.push(node.parentElement);
            }
        }
        
        return elements;
    }
    
    async scanForNewThreats() {
        // Quick scan for new threats (used for dynamic content)
        const newImages = document.querySelectorAll('img:not([data-petronas-scanned])');
        const newLinks = document.querySelectorAll('a[href]:not([data-petronas-scanned])');
        
        const threats = [];
        
        // Mark as scanned
        newImages.forEach(img => img.setAttribute('data-petronas-scanned', 'true'));
        newLinks.forEach(link => link.setAttribute('data-petronas-scanned', 'true'));
        
        // Quick analysis of new elements
        for (const img of newImages) {
            if (this.isSuspiciousImageUrl(img.src)) {
                threats.push({
                    type: 'image',
                    threat: 'New suspicious image detected',
                    risk: 'medium',
                    element: img
                });
            }
        }
        
        for (const link of newLinks) {
            try {
                const url = new URL(link.href);
                if (url.hostname.includes('bit.ly') || url.hostname.includes('tinyurl')) {
                    threats.push({
                        type: 'link',
                        threat: 'New shortened URL detected',
                        risk: 'medium',
                        element: link
                    });
                }
            } catch (error) {
                // Ignore invalid URLs for quick scan
            }
        }
        
        return threats;
    }
    
    highlightThreats(threats) {
        // Remove existing highlights
        document.querySelectorAll('.petronas-threat-highlight, .petronas-safe-highlight')
            .forEach(el => {
                el.classList.remove('petronas-threat-highlight', 'petronas-safe-highlight');
            });
        
        // Add new highlights
        threats.forEach(threat => {
            if (threat.element) {
                const highlightClass = threat.risk === 'high' ? 
                    'petronas-threat-highlight' : 'petronas-safe-highlight';
                threat.element.classList.add(highlightClass);
            }
        });
    }
    
    extractPageContent() {
        const content = {
            url: window.location.href,
            title: document.title,
            text: document.body.innerText.substring(0, 2000),
            imageCount: document.querySelectorAll('img').length,
            linkCount: document.querySelectorAll('a[href]').length,
            formCount: document.querySelectorAll('form').length,
            domain: window.location.hostname,
            protocol: window.location.protocol,
            hasPasswordFields: document.querySelectorAll('input[type="password"]').length > 0,
            images: [],
            links: [],
            suspiciousElements: []
        };
        
        // Extract images (limit to first 10 for performance)
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
        
        // Extract links (limit to first 20 for performance)
        const links = document.querySelectorAll('a[href]');
        for (let i = 0; i < Math.min(links.length, 20); i++) {
            const link = links[i];
            content.links.push({
                href: link.href,
                text: link.textContent.trim().substring(0, 100)
            });
        }
        
        // Check for suspicious elements
        const suspiciousKeywords = ['urgent', 'verify account', 'suspended', 'click here', 'limited time'];
        const pageText = content.text.toLowerCase();
        
        suspiciousKeywords.forEach(keyword => {
            if (pageText.includes(keyword)) {
                content.suspiciousElements.push(`Suspicious text: "${keyword}"`);
            }
        });
        
        return content;
    }
    
    getPageInfo() {
        return {
            url: window.location.href,
            title: document.title,
            domain: window.location.hostname,
            protocol: window.location.protocol,
            lastScanned: this.pageAnalyzed ? Date.now() : null,
            threatCount: this.scanResults.length
        };
    }
    
    showScanOverlay(message) {
        this.hideScanOverlay(); // Remove existing overlay
        
        const overlay = document.createElement('div');
        overlay.className = 'petronas-scan-overlay';
        overlay.id = 'petronas-scan-overlay';
        overlay.innerHTML = `
            <div>${message}</div>
            <div class="petronas-scan-progress">
                <div class="petronas-scan-progress-bar" id="petronas-progress-bar"></div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Animate progress bar
        let progress = 0;
        this.progressInterval = setInterval(() => {
            progress += Math.random() * 20;
            if (progress > 90) progress = 90;
            
            const progressBar = document.getElementById('petronas-progress-bar');
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
        }, 500);
    }
    
    hideScanOverlay() {
        const overlay = document.getElementById('petronas-scan-overlay');
        if (overlay) {
            overlay.remove();
        }
        
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }
    }
    
    // Cleanup when page unloads
    destroy() {
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
        
        if (this.analysisTimeout) {
            clearTimeout(this.analysisTimeout);
        }
        
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }
        
        this.hideScanOverlay();
    }
}

// Initialize content script when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new PetronasContentScript();
    });
} else {
    new PetronasContentScript();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.petronasContentScript) {
        window.petronasContentScript.destroy();
    }
});
