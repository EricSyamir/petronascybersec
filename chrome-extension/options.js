// PETRONAS Cybercrime Reporter Extension - Options Script

class PetronasOptions {
    constructor() {
        this.defaultSettings = {
            language: 'en',
            platformUrl: 'https://localhost/petronas-cybercrime-platform',
            notifications: true,
            autoScan: false,
            dataCollection: true,
            threatSharing: true,
            scanSensitivity: 'medium',
            showHighlights: true,
            showFloatingButton: false,
            theme: 'auto',
            blockedSites: [],
            apiTimeout: 30,
            debugMode: false
        };
        
        this.currentSettings = {};
        this.statistics = {
            totalScans: 0,
            threatsDetected: 0,
            reportsSubmitted: 0,
            lastScan: null
        };
        
        this.initializeOptions();
    }
    
    async initializeOptions() {
        await this.loadSettings();
        await this.loadStatistics();
        this.setupEventListeners();
        this.populateForm();
        this.updateTheme();
        this.updateVersion();
        console.log('PETRONAS options page initialized');
    }
    
    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get(this.defaultSettings);
            this.currentSettings = { ...this.defaultSettings, ...result };
        } catch (error) {
            console.error('Failed to load settings:', error);
            this.currentSettings = { ...this.defaultSettings };
        }
    }
    
    async loadStatistics() {
        try {
            const result = await chrome.storage.local.get([
                'totalScans', 'threatsDetected', 'reportsSubmitted', 'lastScan'
            ]);
            this.statistics = { ...this.statistics, ...result };
        } catch (error) {
            console.error('Failed to load statistics:', error);
        }
    }
    
    setupEventListeners() {
        // Save and Cancel buttons
        document.getElementById('saveSettings').addEventListener('click', () => this.saveSettings());
        document.getElementById('cancelSettings').addEventListener('click', () => this.cancelSettings());
        
        // Theme change
        document.getElementById('theme').addEventListener('change', (e) => {
            this.updateTheme(e.target.value);
        });
        
        // Blocked sites management
        document.getElementById('addBlockedSite').addEventListener('click', () => this.addBlockedSite());
        document.getElementById('newBlockedSite').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addBlockedSite();
            }
        });
        
        // Statistics actions
        document.getElementById('clearStats').addEventListener('click', () => this.clearStatistics());
        document.getElementById('exportData').addEventListener('click', () => this.exportData());
        
        // Advanced settings
        document.getElementById('resetSettings').addEventListener('click', () => this.resetAllSettings());
        
        // Real-time validation
        document.getElementById('platformUrl').addEventListener('input', (e) => {
            this.validateUrl(e.target);
        });
        
        document.getElementById('apiTimeout').addEventListener('input', (e) => {
            this.validateTimeout(e.target);
        });
        
        // Auto-save on certain changes
        const autoSaveElements = [
            'language', 'notifications', 'autoScan', 'showHighlights', 
            'showFloatingButton', 'scanSensitivity'
        ];
        
        autoSaveElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    this.autoSave(id, this.getElementValue(element));
                });
            }
        });
    }
    
    populateForm() {
        // Populate all form fields with current settings
        Object.keys(this.currentSettings).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                this.setElementValue(element, this.currentSettings[key]);
            }
        });
        
        // Populate blocked sites list
        this.updateBlockedSitesList();
        
        // Populate statistics
        this.updateStatisticsDisplay();
    }
    
    setElementValue(element, value) {
        if (element.type === 'checkbox') {
            element.checked = value;
        } else {
            element.value = value;
        }
    }
    
    getElementValue(element) {
        if (element.type === 'checkbox') {
            return element.checked;
        } else if (element.type === 'number') {
            return parseInt(element.value, 10);
        } else {
            return element.value;
        }
    }
    
    updateBlockedSitesList() {
        const container = document.getElementById('blockedSitesList');
        const blockedSites = this.currentSettings.blockedSites || [];
        
        if (blockedSites.length === 0) {
            container.innerHTML = '<div class="empty-list">No blocked sites configured</div>';
            return;
        }
        
        container.innerHTML = '';
        blockedSites.forEach((site, index) => {
            const item = document.createElement('div');
            item.className = 'blocked-site-item';
            item.innerHTML = `
                <span class="blocked-site-url">${site}</span>
                <button class="remove-site" data-index="${index}">Remove</button>
            `;
            
            item.querySelector('.remove-site').addEventListener('click', () => {
                this.removeBlockedSite(index);
            });
            
            container.appendChild(item);
        });
    }
    
    addBlockedSite() {
        const input = document.getElementById('newBlockedSite');
        const site = input.value.trim().toLowerCase();
        
        if (!site) {
            this.showMessage('Please enter a valid site URL', 'error');
            return;
        }
        
        // Basic URL validation
        if (!this.isValidDomain(site)) {
            this.showMessage('Please enter a valid domain (e.g., example.com)', 'error');
            return;
        }
        
        // Check if already blocked
        if (this.currentSettings.blockedSites.includes(site)) {
            this.showMessage('This site is already blocked', 'warning');
            return;
        }
        
        this.currentSettings.blockedSites.push(site);
        input.value = '';
        this.updateBlockedSitesList();
        this.showMessage('Site added to blocked list', 'success');
    }
    
    removeBlockedSite(index) {
        this.currentSettings.blockedSites.splice(index, 1);
        this.updateBlockedSitesList();
        this.showMessage('Site removed from blocked list', 'success');
    }
    
    isValidDomain(domain) {
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
        return domainRegex.test(domain);
    }
    
    updateStatisticsDisplay() {
        document.getElementById('totalScans').textContent = this.statistics.totalScans || 0;
        document.getElementById('threatsDetected').textContent = this.statistics.threatsDetected || 0;
        document.getElementById('reportsSubmitted').textContent = this.statistics.reportsSubmitted || 0;
        
        const lastScan = this.statistics.lastScan;
        if (lastScan) {
            const date = new Date(lastScan);
            document.getElementById('lastScan').textContent = date.toLocaleDateString();
        } else {
            document.getElementById('lastScan').textContent = 'Never';
        }
    }
    
    async saveSettings() {
        const saveBtn = document.getElementById('saveSettings');
        const originalText = saveBtn.textContent;
        
        try {
            // Show loading state
            saveBtn.textContent = 'Saving...';
            saveBtn.disabled = true;
            
            // Collect all form values
            const newSettings = {};
            Object.keys(this.defaultSettings).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    newSettings[key] = this.getElementValue(element);
                }
            });
            
            // Add blocked sites
            newSettings.blockedSites = this.currentSettings.blockedSites;
            
            // Validate settings
            const validation = this.validateSettings(newSettings);
            if (!validation.valid) {
                throw new Error(validation.message);
            }
            
            // Save to storage
            await chrome.storage.sync.set(newSettings);
            this.currentSettings = newSettings;
            
            // Apply theme immediately
            this.updateTheme(newSettings.theme);
            
            // Notify background script of settings change
            chrome.runtime.sendMessage({
                type: 'SETTINGS_UPDATED',
                settings: newSettings
            });
            
            this.showMessage('Settings saved successfully!', 'success');
            
        } catch (error) {
            console.error('Settings save error:', error);
            this.showMessage(`Failed to save settings: ${error.message}`, 'error');
        } finally {
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
        }
    }
    
    validateSettings(settings) {
        // URL validation
        if (settings.platformUrl) {
            try {
                new URL(settings.platformUrl);
            } catch {
                return { valid: false, message: 'Invalid platform URL' };
            }
        }
        
        // Timeout validation
        if (settings.apiTimeout < 5 || settings.apiTimeout > 60) {
            return { valid: false, message: 'API timeout must be between 5 and 60 seconds' };
        }
        
        return { valid: true };
    }
    
    async cancelSettings() {
        // Reload original settings
        await this.loadSettings();
        this.populateForm();
        this.showMessage('Changes cancelled', 'warning');
    }
    
    async autoSave(key, value) {
        try {
            await chrome.storage.sync.set({ [key]: value });
            this.currentSettings[key] = value;
            
            // Apply certain settings immediately
            if (key === 'theme') {
                this.updateTheme(value);
            }
            
        } catch (error) {
            console.error('Auto-save error:', error);
        }
    }
    
    updateTheme(theme) {
        const body = document.body;
        const currentTheme = theme || this.currentSettings.theme || 'auto';
        
        // Remove existing theme classes
        body.removeAttribute('data-theme');
        
        // Apply new theme
        if (currentTheme !== 'auto') {
            body.setAttribute('data-theme', currentTheme);
        }
        
        // Update select if provided value
        if (theme) {
            document.getElementById('theme').value = theme;
        }
    }
    
    async clearStatistics() {
        if (confirm('Are you sure you want to clear all statistics? This action cannot be undone.')) {
            try {
                await chrome.storage.local.remove([
                    'totalScans', 'threatsDetected', 'reportsSubmitted', 'lastScan'
                ]);
                
                this.statistics = {
                    totalScans: 0,
                    threatsDetected: 0,
                    reportsSubmitted: 0,
                    lastScan: null
                };
                
                this.updateStatisticsDisplay();
                this.showMessage('Statistics cleared', 'success');
                
            } catch (error) {
                console.error('Clear statistics error:', error);
                this.showMessage('Failed to clear statistics', 'error');
            }
        }
    }
    
    async exportData() {
        try {
            const exportData = {
                settings: this.currentSettings,
                statistics: this.statistics,
                exportDate: new Date().toISOString(),
                version: chrome.runtime.getManifest().version
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `petronas-extension-data-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            this.showMessage('Data exported successfully', 'success');
            
        } catch (error) {
            console.error('Export error:', error);
            this.showMessage('Failed to export data', 'error');
        }
    }
    
    async resetAllSettings() {
        if (confirm('Are you sure you want to reset all settings to their default values? This action cannot be undone.')) {
            try {
                // Clear all stored settings
                await chrome.storage.sync.clear();
                
                // Reset to defaults
                this.currentSettings = { ...this.defaultSettings };
                this.populateForm();
                this.updateTheme();
                
                // Save defaults
                await chrome.storage.sync.set(this.currentSettings);
                
                this.showMessage('All settings have been reset to defaults', 'success');
                
            } catch (error) {
                console.error('Reset settings error:', error);
                this.showMessage('Failed to reset settings', 'error');
            }
        }
    }
    
    validateUrl(input) {
        try {
            const url = new URL(input.value);
            input.setCustomValidity('');
            input.style.borderColor = '';
        } catch {
            input.setCustomValidity('Please enter a valid URL');
            input.style.borderColor = '#dc3545';
        }
    }
    
    validateTimeout(input) {
        const value = parseInt(input.value, 10);
        if (value < 5 || value > 60) {
            input.setCustomValidity('Timeout must be between 5 and 60 seconds');
            input.style.borderColor = '#dc3545';
        } else {
            input.setCustomValidity('');
            input.style.borderColor = '';
        }
    }
    
    updateVersion() {
        const manifest = chrome.runtime.getManifest();
        document.getElementById('version').textContent = manifest.version;
        
        // Update privacy policy link
        const privacyLink = document.getElementById('privacyLink');
        privacyLink.href = `${this.currentSettings.platformUrl}/privacy-policy.php`;
    }
    
    showMessage(message, type = 'success') {
        const messageEl = document.getElementById('statusMessage');
        messageEl.textContent = message;
        messageEl.className = `status-message ${type}`;
        messageEl.classList.remove('hidden');
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            messageEl.classList.add('hidden');
        }, 3000);
    }
}

// Initialize options page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PetronasOptions();
});

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 's':
                e.preventDefault();
                document.getElementById('saveSettings').click();
                break;
            case 'r':
                if (e.shiftKey) {
                    e.preventDefault();
                    document.getElementById('resetSettings').click();
                }
                break;
        }
    }
    
    if (e.key === 'Escape') {
        document.getElementById('cancelSettings').click();
    }
});
