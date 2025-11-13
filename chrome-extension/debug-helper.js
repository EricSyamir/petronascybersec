// Debug Helper for PETRONAS Chrome Extension
// Run this in the browser console to diagnose issues

function debugExtension() {
    console.log('🔧 PETRONAS Extension Debug Helper');
    console.log('=====================================');
    
    // Check if content script is loaded
    const extensionMarker = document.documentElement.getAttribute('data-petronas-extension');
    console.log('📋 Content script loaded:', extensionMarker === 'loaded' ? '✅ YES' : '❌ NO');
    
    // Check document state
    console.log('📄 Document ready state:', document.readyState);
    console.log('📄 Document body available:', document.body ? '✅ YES' : '❌ NO');
    
    // Check page content
    if (document.body) {
        console.log('📊 Page stats:');
        console.log('  - Images:', document.querySelectorAll('img').length);
        console.log('  - Links:', document.querySelectorAll('a[href]').length);
        console.log('  - Forms:', document.querySelectorAll('form').length);
        console.log('  - Password fields:', document.querySelectorAll('input[type="password"]').length);
        console.log('  - Text length:', document.body.innerText ? document.body.innerText.length : 0);
    }
    
    // Check Chrome APIs
    console.log('🔌 Chrome APIs:');
    console.log('  - chrome.runtime:', typeof chrome !== 'undefined' && chrome.runtime ? '✅ Available' : '❌ Not available');
    console.log('  - chrome.tabs:', typeof chrome !== 'undefined' && chrome.tabs ? '✅ Available' : '❌ Not available');
    console.log('  - chrome.scripting:', typeof chrome !== 'undefined' && chrome.scripting ? '✅ Available' : '❌ Not available');
    
    // Test content script communication
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        console.log('📡 Testing content script communication...');
        
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_PAGE_INFO' }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.log('❌ Content script communication failed:', chrome.runtime.lastError.message);
                    } else {
                        console.log('✅ Content script communication successful:', response);
                    }
                });
            }
        });
    }
    
    // Check for common issues
    console.log('🚨 Common Issues Check:');
    
    const url = window.location.href;
    if (url.startsWith('chrome://') || url.startsWith('chrome-extension://')) {
        console.log('  ⚠️ Cannot scan browser internal pages');
    } else {
        console.log('  ✅ Page is scannable');
    }
    
    if (url.startsWith('https://')) {
        console.log('  ✅ Secure HTTPS connection');
    } else if (url.startsWith('http://')) {
        console.log('  ⚠️ Insecure HTTP connection');
    }
    
    // Check for suspicious content (basic test)
    const bodyText = document.body ? document.body.innerText.toLowerCase() : '';
    const suspiciousKeywords = ['urgent', 'verify account', 'suspended', 'click here', 'limited time'];
    const foundKeywords = suspiciousKeywords.filter(keyword => bodyText.includes(keyword));
    
    if (foundKeywords.length > 0) {
        console.log('  🎯 Suspicious keywords found:', foundKeywords);
    } else {
        console.log('  ✅ No obvious suspicious keywords detected');
    }
    
    console.log('=====================================');
    console.log('🔧 Debug complete. Check the messages above for issues.');
}

// Auto-run if in extension context
if (typeof chrome !== 'undefined' && chrome.runtime) {
    // Wait a bit for everything to load
    setTimeout(debugExtension, 1000);
} else {
    console.log('🔧 Debug helper loaded. Run debugExtension() to diagnose issues.');
}

// Make function globally available
window.debugExtension = debugExtension;
