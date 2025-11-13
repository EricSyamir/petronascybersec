// PETRONAS Cybercrime Platform - Main JavaScript Module

class PetronasMainApp {
    constructor() {
        this.currentLanguage = 'en';
        this.isLoggedIn = false;
        this.notificationTimeout = null;
        
        this.initializeApp();
    }
    
    initializeApp() {
        this.setupEventListeners();
        this.checkAuthStatus();
        this.loadLanguagePreference();
        this.setupNotifications();
        this.initializeComponents();
        
        console.log('PETRONAS Cybercrime Platform initialized');
    }
    
    setupEventListeners() {
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'k':
                        e.preventDefault();
                        this.showSearchModal();
                        break;
                    case 'r':
                        e.preventDefault();
                        window.location.href = 'report-incident.php';
                        break;
                    case 'l':
                        e.preventDefault();
                        this.toggleLanguage();
                        break;
                }
            }
            
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
        
        // Handle form submissions with loading states
        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('ajax-form')) {
                e.preventDefault();
                this.handleAjaxForm(e.target);
            }
        });
        
        // Auto-save for forms
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('auto-save')) {
                this.debounceAutoSave(e.target);
            }
        });
        
        // Theme detection
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                this.handleThemeChange(e.matches ? 'dark' : 'light');
            });
        }
    }
    
    checkAuthStatus() {
        // Check if user is logged in based on page elements
        this.isLoggedIn = document.querySelector('.nav-link.logout') !== null;
        
        if (this.isLoggedIn) {
            this.setupAuthenticatedFeatures();
        }
    }
    
    setupAuthenticatedFeatures() {
        // Set up features only available to logged-in users
        this.startPeriodicUpdates();
        this.setupRealTimeNotifications();
    }
    
    loadLanguagePreference() {
        const stored = localStorage.getItem('petronas_language');
        if (stored) {
            this.currentLanguage = stored;
        } else {
            // Detect browser language
            const browserLang = navigator.language || navigator.userLanguage;
            this.currentLanguage = browserLang.startsWith('ms') ? 'bm' : 'en';
        }
    }
    
    setupNotifications() {
        // Request notification permission if supported
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        // Setup service worker for notifications if available
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(console.error);
        }
    }
    
    initializeComponents() {
        // Initialize tooltips
        this.initializeTooltips();
        
        // Initialize modals
        this.initializeModals();
        
        // Initialize charts if Chart.js is available
        if (typeof Chart !== 'undefined') {
            this.initializeCharts();
        }
        
        // Initialize maps if Leaflet is available
        if (typeof L !== 'undefined') {
            this.initializeMaps();
        }
        
        // Setup accessibility features
        this.setupAccessibility();
    }
    
    initializeTooltips() {
        const tooltips = document.querySelectorAll('[data-tooltip]');
        tooltips.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target, e.target.getAttribute('data-tooltip'));
            });
            
            element.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }
    
    showTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        tooltip.id = 'active-tooltip';
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.position = 'absolute';
        tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';
        tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
        tooltip.style.zIndex = '9999';
    }
    
    hideTooltip() {
        const tooltip = document.getElementById('active-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }
    
    initializeModals() {
        const modalTriggers = document.querySelectorAll('[data-modal]');
        modalTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const modalId = trigger.getAttribute('data-modal');
                this.showModal(modalId);
            });
        });
        
        // Close modal on backdrop click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                this.closeModal(e.target.nextElementSibling);
            }
        });
    }
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.classList.add('modal-open');
            
            // Focus first focusable element
            const focusable = modal.querySelector('input, button, textarea, select');
            if (focusable) {
                focusable.focus();
            }
        }
    }
    
    closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
            document.body.classList.remove('modal-open');
        }
    }
    
    closeAllModals() {
        document.querySelectorAll('.modal.active').forEach(modal => {
            this.closeModal(modal);
        });
    }
    
    setupAccessibility() {
        // Add skip link functionality
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(skipLink.getAttribute('href'));
                if (target) {
                    target.focus();
                    target.scrollIntoView();
                }
            });
        }
        
        // Enhance keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-nav');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-nav');
        });
    }
    
    async handleAjaxForm(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        try {
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> Processing...';
            
            const formData = new FormData(form);
            const response = await fetch(form.action || window.location.href, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification(result.message || 'Operation completed successfully', 'success');
                if (result.redirect) {
                    setTimeout(() => {
                        window.location.href = result.redirect;
                    }, 1000);
                }
            } else {
                throw new Error(result.error || 'Operation failed');
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showNotification(error.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
    
    debounceAutoSave(element) {
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            this.autoSaveField(element);
        }, 2000);
    }
    
    async autoSaveField(element) {
        try {
            const data = {
                field: element.name,
                value: element.value,
                auto_save: true
            };
            
            await fetch(window.location.href, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(data)
            });
            
            // Show subtle save indicator
            this.showSaveIndicator(element);
            
        } catch (error) {
            console.error('Auto-save error:', error);
        }
    }
    
    showSaveIndicator(element) {
        const indicator = document.createElement('span');
        indicator.className = 'save-indicator';
        indicator.textContent = '✓ Saved';
        indicator.style.cssText = `
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            color: #28a745;
            font-size: 12px;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        
        element.parentNode.style.position = 'relative';
        element.parentNode.appendChild(indicator);
        
        setTimeout(() => indicator.style.opacity = '1', 100);
        setTimeout(() => {
            indicator.style.opacity = '0';
            setTimeout(() => indicator.remove(), 300);
        }, 2000);
    }
    
    startPeriodicUpdates() {
        // Update statistics every 5 minutes
        setInterval(() => {
            this.updateDashboardStats();
        }, 5 * 60 * 1000);
        
        // Check for new threats every minute
        setInterval(() => {
            this.checkForNewThreats();
        }, 60 * 1000);
    }
    
    async updateDashboardStats() {
        try {
            const response = await fetch('/api/stats.php');
            const stats = await response.json();
            
            if (stats.success) {
                this.updateStatsDisplay(stats.data);
            }
        } catch (error) {
            console.error('Stats update error:', error);
        }
    }
    
    updateStatsDisplay(stats) {
        Object.keys(stats).forEach(key => {
            const element = document.getElementById(key + 'Count');
            if (element) {
                this.animateNumber(element, parseInt(element.textContent) || 0, stats[key]);
            }
        });
    }
    
    animateNumber(element, start, end) {
        const duration = 1000;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.floor(start + (end - start) * progress);
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    async checkForNewThreats() {
        try {
            const response = await fetch('/api/threats.php?check=1');
            const result = await response.json();
            
            if (result.newThreats > 0) {
                this.showNotification(
                    `${result.newThreats} new threat(s) detected`,
                    'warning',
                    true
                );
            }
        } catch (error) {
            console.error('Threat check error:', error);
        }
    }
    
    setupRealTimeNotifications() {
        // Setup EventSource for real-time updates if available
        if (typeof EventSource !== 'undefined') {
            const eventSource = new EventSource('/api/events.php');
            
            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleRealTimeUpdate(data);
            };
            
            eventSource.onerror = () => {
                console.warn('Real-time connection lost, falling back to polling');
                eventSource.close();
            };
        }
    }
    
    handleRealTimeUpdate(data) {
        switch (data.type) {
            case 'new_threat':
                this.showNotification(`New ${data.level} threat detected`, 'warning', true);
                break;
            case 'report_update':
                this.showNotification('Your report has been updated', 'info');
                break;
            case 'system_alert':
                this.showNotification(data.message, 'error', true);
                break;
        }
    }
    
    showNotification(message, type = 'info', persistent = false) {
        // Clear existing notification timeout
        if (this.notificationTimeout) {
            clearTimeout(this.notificationTimeout);
        }
        
        // Remove existing notification
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto-remove unless persistent
        if (!persistent) {
            this.notificationTimeout = setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 5000);
        }
        
        // Browser notification for important alerts
        if (type === 'warning' || type === 'error') {
            this.showBrowserNotification(message, type);
        }
    }
    
    showBrowserNotification(message, type) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const icon = type === 'error' ? '/assets/images/error-icon.png' : '/assets/images/warning-icon.png';
            
            new Notification('PETRONAS Cybercrime Platform', {
                body: message,
                icon: icon,
                badge: '/assets/images/petronas-badge.png'
            });
        }
    }
    
    handleThemeChange(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('petronas_theme', theme);
    }
    
    // Utility functions
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    
    formatDate(date, locale = 'en-MY') {
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('Copied to clipboard', 'success');
        } catch (error) {
            console.error('Clipboard error:', error);
            this.showNotification('Failed to copy to clipboard', 'error');
        }
    }
    
    // Public API for other scripts
    getLanguage() {
        return this.currentLanguage;
    }
    
    setLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('petronas_language', lang);
        // Trigger language change event
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
    }
    
    isAuthenticated() {
        return this.isLoggedIn;
    }
}

// Global notification function for compatibility
function showAlert(message, type = 'info') {
    if (window.petronasApp) {
        window.petronasApp.showNotification(message, type);
    } else {
        alert(message);
    }
}

// Global language toggle function
function toggleLanguage() {
    if (window.petronasApp) {
        const newLang = window.petronasApp.getLanguage() === 'en' ? 'bm' : 'en';
        window.petronasApp.setLanguage(newLang);
        
        // Reload page to apply language change
        window.location.reload();
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.petronasApp = new PetronasMainApp();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PetronasMainApp;
}
