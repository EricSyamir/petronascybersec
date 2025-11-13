// Language Toggle Module for PETRONAS Cybercrime Platform

class LanguageManager {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {};
        this.storageKey = 'petronas_language';
        
        this.initialize();
    }
    
    initialize() {
        this.loadLanguagePreference();
        this.loadTranslations();
        this.setupEventListeners();
        this.applyLanguage();
        
        console.log('Language manager initialized:', this.currentLanguage);
    }
    
    loadLanguagePreference() {
        // Try to get saved preference
        const saved = localStorage.getItem(this.storageKey);
        if (saved && ['en', 'bm'].includes(saved)) {
            this.currentLanguage = saved;
            return;
        }
        
        // Detect from browser
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('ms') || browserLang.startsWith('my')) {
            this.currentLanguage = 'bm';
        } else {
            this.currentLanguage = 'en';
        }
        
        // Save the detected/default language
        this.saveLanguagePreference();
    }
    
    saveLanguagePreference() {
        localStorage.setItem(this.storageKey, this.currentLanguage);
    }
    
    loadTranslations() {
        // Define translations for dynamic content
        this.translations = {
            en: {
                // Common UI elements
                'loading': 'Loading...',
                'error': 'Error',
                'success': 'Success',
                'warning': 'Warning',
                'info': 'Information',
                'close': 'Close',
                'cancel': 'Cancel',
                'save': 'Save',
                'delete': 'Delete',
                'edit': 'Edit',
                'view': 'View',
                'download': 'Download',
                'upload': 'Upload',
                'search': 'Search',
                'filter': 'Filter',
                'sort': 'Sort',
                'refresh': 'Refresh',
                'export': 'Export',
                
                // Time and dates
                'now': 'now',
                'minute_ago': 'minute ago',
                'minutes_ago': 'minutes ago',
                'hour_ago': 'hour ago',
                'hours_ago': 'hours ago',
                'day_ago': 'day ago',
                'days_ago': 'days ago',
                'week_ago': 'week ago',
                'weeks_ago': 'weeks ago',
                'month_ago': 'month ago',
                'months_ago': 'months ago',
                'year_ago': 'year ago',
                'years_ago': 'years ago',
                
                // File operations
                'file_uploaded': 'File uploaded successfully',
                'file_upload_error': 'Failed to upload file',
                'file_too_large': 'File is too large',
                'file_invalid_type': 'Invalid file type',
                'file_deleted': 'File deleted successfully',
                
                // Form validation
                'field_required': 'This field is required',
                'email_invalid': 'Please enter a valid email address',
                'password_weak': 'Password is too weak',
                'passwords_no_match': 'Passwords do not match',
                'url_invalid': 'Please enter a valid URL',
                'phone_invalid': 'Please enter a valid phone number',
                
                // Notifications
                'notification_new_threat': 'New threat detected',
                'notification_report_updated': 'Your report has been updated',
                'notification_system_alert': 'System alert',
                'notification_maintenance': 'System maintenance scheduled',
                
                // Actions
                'action_confirm': 'Are you sure?',
                'action_irreversible': 'This action cannot be undone',
                'action_completed': 'Action completed successfully',
                'action_failed': 'Action failed',
                
                // Connection status
                'connection_online': 'Connected',
                'connection_offline': 'Disconnected',
                'connection_reconnecting': 'Reconnecting...',
                'connection_failed': 'Connection failed'
            },
            
            bm: {
                // Common UI elements
                'loading': 'Memuatkan...',
                'error': 'Ralat',
                'success': 'Berjaya',
                'warning': 'Amaran',
                'info': 'Maklumat',
                'close': 'Tutup',
                'cancel': 'Batal',
                'save': 'Simpan',
                'delete': 'Padam',
                'edit': 'Edit',
                'view': 'Lihat',
                'download': 'Muat Turun',
                'upload': 'Muat Naik',
                'search': 'Cari',
                'filter': 'Tapis',
                'sort': 'Susun',
                'refresh': 'Segar Semula',
                'export': 'Eksport',
                
                // Time and dates
                'now': 'sekarang',
                'minute_ago': 'minit lalu',
                'minutes_ago': 'minit lalu',
                'hour_ago': 'jam lalu',
                'hours_ago': 'jam lalu',
                'day_ago': 'hari lalu',
                'days_ago': 'hari lalu',
                'week_ago': 'minggu lalu',
                'weeks_ago': 'minggu lalu',
                'month_ago': 'bulan lalu',
                'months_ago': 'bulan lalu',
                'year_ago': 'tahun lalu',
                'years_ago': 'tahun lalu',
                
                // File operations
                'file_uploaded': 'Fail berjaya dimuat naik',
                'file_upload_error': 'Gagal memuat naik fail',
                'file_too_large': 'Fail terlalu besar',
                'file_invalid_type': 'Jenis fail tidak sah',
                'file_deleted': 'Fail berjaya dipadam',
                
                // Form validation
                'field_required': 'Medan ini diperlukan',
                'email_invalid': 'Sila masukkan alamat e-mel yang sah',
                'password_weak': 'Kata laluan terlalu lemah',
                'passwords_no_match': 'Kata laluan tidak sepadan',
                'url_invalid': 'Sila masukkan URL yang sah',
                'phone_invalid': 'Sila masukkan nombor telefon yang sah',
                
                // Notifications
                'notification_new_threat': 'Ancaman baru dikesan',
                'notification_report_updated': 'Laporan anda telah dikemas kini',
                'notification_system_alert': 'Amaran sistem',
                'notification_maintenance': 'Penyelenggaraan sistem dijadualkan',
                
                // Actions
                'action_confirm': 'Adakah anda pasti?',
                'action_irreversible': 'Tindakan ini tidak boleh dibatalkan',
                'action_completed': 'Tindakan berjaya diselesaikan',
                'action_failed': 'Tindakan gagal',
                
                // Connection status
                'connection_online': 'Tersambung',
                'connection_offline': 'Terputus',
                'connection_reconnecting': 'Menyambung semula...',
                'connection_failed': 'Sambungan gagal'
            }
        };
    }
    
    setupEventListeners() {
        // Listen for language toggle events
        document.addEventListener('click', (e) => {
            if (e.target.matches('.lang-btn, .language-toggle button')) {
                e.preventDefault();
                this.toggleLanguage();
            }
        });
        
        // Listen for custom language change events
        document.addEventListener('languageChanged', (e) => {
            this.currentLanguage = e.detail;
            this.applyLanguage();
        });
        
        // Handle keyboard shortcut (Ctrl/Cmd + L)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
                e.preventDefault();
                this.toggleLanguage();
            }
        });
    }
    
    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'en' ? 'bm' : 'en';
        this.saveLanguagePreference();
        this.applyLanguage();
        
        // Dispatch event for other components
        document.dispatchEvent(new CustomEvent('languageChanged', {
            detail: this.currentLanguage
        }));
        
        // Show brief notification
        this.showLanguageChangeNotification();
        
        // For server-side rendered content, reload the page
        if (this.requiresReload()) {
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
    }
    
    requiresReload() {
        // Check if page has server-rendered content that needs reloading
        return document.querySelector('[data-en], [data-bm]') !== null;
    }
    
    applyLanguage() {
        // Update language toggle buttons
        this.updateLanguageButtons();
        
        // Update dynamic content
        this.updateDynamicContent();
        
        // Update form placeholders and labels
        this.updateFormElements();
        
        // Update time/date displays
        this.updateTimeDisplays();
        
        // Update document language attribute
        document.documentElement.lang = this.currentLanguage === 'bm' ? 'ms' : 'en';
    }
    
    updateLanguageButtons() {
        const langButtons = document.querySelectorAll('.lang-btn, .language-toggle button');
        langButtons.forEach(btn => {
            btn.textContent = this.currentLanguage === 'en' ? 'BM' : 'EN';
            btn.setAttribute('aria-label', 
                this.currentLanguage === 'en' 
                    ? 'Switch to Bahasa Malaysia' 
                    : 'Tukar ke Bahasa Inggeris'
            );
        });
    }
    
    updateDynamicContent() {
        // Update elements with data-en and data-bm attributes
        const translatableElements = document.querySelectorAll('[data-en], [data-bm]');
        translatableElements.forEach(element => {
            const englishText = element.getAttribute('data-en');
            const malayText = element.getAttribute('data-bm');
            
            if (this.currentLanguage === 'en' && englishText) {
                element.textContent = englishText;
            } else if (this.currentLanguage === 'bm' && malayText) {
                element.textContent = malayText;
            }
        });
        
        // Update elements with data-translate attribute
        const dataTranslateElements = document.querySelectorAll('[data-translate]');
        dataTranslateElements.forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.translate(key);
            if (translation) {
                element.textContent = translation;
            }
        });
    }
    
    updateFormElements() {
        // Update placeholders
        const placeholderElements = document.querySelectorAll('[data-placeholder-en], [data-placeholder-bm]');
        placeholderElements.forEach(element => {
            const englishPlaceholder = element.getAttribute('data-placeholder-en');
            const malayPlaceholder = element.getAttribute('data-placeholder-bm');
            
            if (this.currentLanguage === 'en' && englishPlaceholder) {
                element.placeholder = englishPlaceholder;
            } else if (this.currentLanguage === 'bm' && malayPlaceholder) {
                element.placeholder = malayPlaceholder;
            }
        });
        
        // Update tooltips/titles
        const titleElements = document.querySelectorAll('[data-title-en], [data-title-bm]');
        titleElements.forEach(element => {
            const englishTitle = element.getAttribute('data-title-en');
            const malayTitle = element.getAttribute('data-title-bm');
            
            if (this.currentLanguage === 'en' && englishTitle) {
                element.title = englishTitle;
            } else if (this.currentLanguage === 'bm' && malayTitle) {
                element.title = malayTitle;
            }
        });
    }
    
    updateTimeDisplays() {
        // Update relative time displays
        const timeElements = document.querySelectorAll('[data-time]');
        timeElements.forEach(element => {
            const timestamp = element.getAttribute('data-time');
            if (timestamp) {
                element.textContent = this.formatRelativeTime(new Date(timestamp));
            }
        });
        
        // Update date displays
        const dateElements = document.querySelectorAll('[data-date]');
        dateElements.forEach(element => {
            const dateString = element.getAttribute('data-date');
            if (dateString) {
                element.textContent = this.formatDate(new Date(dateString));
            }
        });
    }
    
    translate(key, params = {}) {
        const translation = this.translations[this.currentLanguage]?.[key] || 
                          this.translations['en']?.[key] || 
                          key;
        
        // Simple parameter substitution
        return Object.keys(params).reduce((text, param) => {
            return text.replace(`{${param}}`, params[param]);
        }, translation);
    }
    
    formatRelativeTime(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        const diffWeeks = Math.floor(diffDays / 7);
        const diffMonths = Math.floor(diffDays / 30);
        const diffYears = Math.floor(diffDays / 365);
        
        if (diffSecs < 60) {
            return this.translate('now');
        } else if (diffMins < 60) {
            return diffMins === 1 
                ? this.translate('minute_ago')
                : `${diffMins} ${this.translate('minutes_ago')}`;
        } else if (diffHours < 24) {
            return diffHours === 1 
                ? this.translate('hour_ago')
                : `${diffHours} ${this.translate('hours_ago')}`;
        } else if (diffDays < 7) {
            return diffDays === 1 
                ? this.translate('day_ago')
                : `${diffDays} ${this.translate('days_ago')}`;
        } else if (diffWeeks < 4) {
            return diffWeeks === 1 
                ? this.translate('week_ago')
                : `${diffWeeks} ${this.translate('weeks_ago')}`;
        } else if (diffMonths < 12) {
            return diffMonths === 1 
                ? this.translate('month_ago')
                : `${diffMonths} ${this.translate('months_ago')}`;
        } else {
            return diffYears === 1 
                ? this.translate('year_ago')
                : `${diffYears} ${this.translate('years_ago')}`;
        }
    }
    
    formatDate(date) {
        const locale = this.currentLanguage === 'bm' ? 'ms-MY' : 'en-MY';
        
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }
    
    formatNumber(number) {
        const locale = this.currentLanguage === 'bm' ? 'ms-MY' : 'en-MY';
        return new Intl.NumberFormat(locale).format(number);
    }
    
    formatCurrency(amount, currency = 'MYR') {
        const locale = this.currentLanguage === 'bm' ? 'ms-MY' : 'en-MY';
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency
        }).format(amount);
    }
    
    showLanguageChangeNotification() {
        // Create a subtle notification
        const notification = document.createElement('div');
        notification.className = 'language-change-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--petronas-green);
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            font-size: 14px;
            z-index: 9999;
            opacity: 0;
            transform: translateX(100px);
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        
        const langName = this.currentLanguage === 'en' ? 'English' : 'Bahasa Malaysia';
        notification.innerHTML = `
            <span>🌐 ${this.translate('connection_online')} - ${langName}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100px)';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
    
    // Public API
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    setLanguage(lang) {
        if (['en', 'bm'].includes(lang) && lang !== this.currentLanguage) {
            this.currentLanguage = lang;
            this.saveLanguagePreference();
            this.applyLanguage();
            
            document.dispatchEvent(new CustomEvent('languageChanged', {
                detail: this.currentLanguage
            }));
        }
    }
    
    getTranslation(key, params = {}) {
        return this.translate(key, params);
    }
    
    // Helper for other scripts
    t(key, params = {}) {
        return this.translate(key, params);
    }
}

// Initialize language manager
let languageManager;

document.addEventListener('DOMContentLoaded', () => {
    languageManager = new LanguageManager();
    
    // Make it globally available
    window.languageManager = languageManager;
    
    // Convenience functions
    window.t = (key, params) => languageManager.getTranslation(key, params);
    window.toggleLanguage = () => languageManager.toggleLanguage();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LanguageManager;
}
