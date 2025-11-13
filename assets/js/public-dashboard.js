/**
 * Public Dashboard JavaScript
 * Handles search functionality, results display, and user interactions
 */

class PublicDashboard {
    constructor() {
        this.currentPage = 0;
        this.pageSize = 20;
        this.currentQuery = '';
        this.currentType = 'all';
        this.currentFilters = {};
        this.searchTimeout = null;
        this.isLoading = false;
        this.scammerDatabase = null; // Store JSON data for searching
        
        this.initializeElements();
        this.bindEvents();
        this.loadStatistics();
        this.loadScammerDatabase();
    }
    
    initializeElements() {
        // Search elements
        this.searchInput = document.getElementById('searchInput');
        this.searchType = document.getElementById('searchType');
        this.searchBtn = document.getElementById('searchBtn');
        
        // Filter elements
        this.filtersSection = document.getElementById('filtersSection');
        this.toggleFiltersBtn = document.getElementById('toggleFiltersBtn');
        this.scamTypeFilter = document.getElementById('scamTypeFilter');
        this.threatLevelFilter = document.getElementById('threatLevelFilter');
        this.verificationFilter = document.getElementById('verificationFilter');
        this.applyFiltersBtn = document.getElementById('applyFiltersBtn');
        this.clearFiltersBtn = document.getElementById('clearFiltersBtn');
        
        // Results elements
        this.resultsSection = document.getElementById('resultsSection');
        this.resultsTitle = document.getElementById('resultsTitle');
        this.resultsCount = document.getElementById('resultsCount');
        this.resultsGrid = document.getElementById('resultsGrid');
        this.noResults = document.getElementById('noResults');
        this.exportBtn = document.getElementById('exportBtn');
        
        // Pagination elements
        this.pagination = document.getElementById('pagination');
        this.prevPageBtn = document.getElementById('prevPageBtn');
        this.nextPageBtn = document.getElementById('nextPageBtn');
        this.pageInfo = document.getElementById('pageInfo');
        
        // Statistics elements
        this.totalScammers = document.getElementById('totalScammers');
        this.verifiedScammers = document.getElementById('verifiedScammers');
        this.recentReports = document.getElementById('recentReports');
        this.highThreat = document.getElementById('highThreat');
        
        // Modal elements
        this.modal = document.getElementById('scammerModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalBody = document.getElementById('modalBody');
        this.modalClose = document.getElementById('modalClose');
        this.modalCloseBtn = document.getElementById('modalCloseBtn');
        this.reportSimilarBtn = document.getElementById('reportSimilarBtn');
        
        // Data breach checker elements
        this.breachEmailInput = document.getElementById('breachEmailInput');
        this.checkBreachBtn = document.getElementById('checkBreachBtn');
        this.breachResults = document.getElementById('breachResults');
        this.breachLoading = document.getElementById('breachLoading');
        this.breachAlert = document.getElementById('breachAlert');
        this.breachAlertTitle = document.getElementById('breachAlertTitle');
        this.breachAlertMessage = document.getElementById('breachAlertMessage');
        this.breachList = document.getElementById('breachList');
    }
    
    bindEvents() {
        // Search events
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                if (e.target.value.length >= 3 || e.target.value.length === 0) {
                    this.performSearch();
                }
            }, 500);
        });
        
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.performSearch();
            }
        });
        
        this.searchType.addEventListener('change', () => {
            if (this.currentQuery) {
                this.performSearch();
            }
        });
        
        this.searchBtn.addEventListener('click', () => {
            this.performSearch();
        });
        
        // Filter events
        this.toggleFiltersBtn.addEventListener('click', () => {
            this.toggleFilters();
        });
        
        this.applyFiltersBtn.addEventListener('click', () => {
            this.applyFilters();
        });
        
        this.clearFiltersBtn.addEventListener('click', () => {
            this.clearFilters();
        });
        
        // Pagination events
        this.prevPageBtn.addEventListener('click', () => {
            if (this.currentPage > 0) {
                this.currentPage--;
                this.performSearch();
            }
        });
        
        this.nextPageBtn.addEventListener('click', () => {
            this.currentPage++;
            this.performSearch();
        });
        
        // Export events
        this.exportBtn.addEventListener('click', () => {
            this.exportResults();
        });
        
        // Modal events
        this.modalClose.addEventListener('click', () => {
            this.closeModal();
        });
        
        this.modalCloseBtn.addEventListener('click', () => {
            this.closeModal();
        });
        
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        this.reportSimilarBtn.addEventListener('click', () => {
            window.open('report-incident.php', '_blank');
        });
        
        // Data breach checker events
        this.checkBreachBtn.addEventListener('click', () => {
            this.checkDataBreach();
        });
        
        this.breachEmailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.checkDataBreach();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display !== 'none') {
                this.closeModal();
            }
            
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                this.searchInput.focus();
            }
        });
    }
    
    async loadStatistics() {
        try {
            const response = await fetch('api/scammer-search.php?action=stats');
            const data = await response.json();
            
            if (data.success) {
                const stats = data.stats;
                
                this.updateStatistic(this.totalScammers, stats.total_scammers);
                this.updateStatistic(this.verifiedScammers, stats.verified_scammers);
                this.updateStatistic(this.recentReports, stats.recent_reports);
                
                // Calculate high threat count
                const highThreatCount = stats.by_threat_level
                    .filter(item => ['high', 'critical'].includes(item.threat_level))
                    .reduce((sum, item) => sum + parseInt(item.count), 0);
                
                this.updateStatistic(this.highThreat, highThreatCount);
            }
        } catch (error) {
            console.error('Failed to load statistics:', error);
            this.updateStatistic(this.totalScammers, 'N/A');
            this.updateStatistic(this.verifiedScammers, 'N/A');
            this.updateStatistic(this.recentReports, 'N/A');
            this.updateStatistic(this.highThreat, 'N/A');
        }
    }
    
    updateStatistic(element, value) {
        if (element) {
            element.textContent = typeof value === 'number' ? value.toLocaleString() : value;
        }
    }
    
    toggleFilters() {
        const isVisible = this.filtersSection.style.display !== 'none';
        
        if (isVisible) {
            this.filtersSection.style.display = 'none';
            this.toggleFiltersBtn.innerHTML = 'Show Advanced Filters ⚙️';
        } else {
            this.filtersSection.style.display = 'block';
            this.toggleFiltersBtn.innerHTML = 'Hide Advanced Filters ⚙️';
        }
    }
    
    applyFilters() {
        // Filters are disabled for JSON-only search
        // Keeping method for compatibility but filters won't affect results
        this.currentPage = 0;
        if (this.currentQuery) {
            this.performSearch();
        }
    }
    
    clearFilters() {
        // Filters are disabled for JSON-only search
        this.currentPage = 0;
        if (this.currentQuery) {
            this.performSearch();
        }
    }
    
    async performSearch() {
        const query = this.searchInput.value.trim();
        
        if (query.length < 3 && query.length > 0) {
            this.showError('Search query must be at least 3 characters long');
            return;
        }
        
        if (this.isLoading) {
            return;
        }
        
        this.currentQuery = query;
        this.currentType = this.searchType.value;
        
        if (!query) {
            this.hideResults();
            return;
        }
        
        // Wait for database to load if not loaded yet
        if (!this.scammerDatabase) {
            await this.loadScammerDatabase();
        }
        
        this.isLoading = true;
        
        try {
            // Search in JSON data
            const results = this.searchInScammerDatabase(query, this.currentType);
            const totalResults = results.length;
            const startIndex = this.currentPage * this.pageSize;
            const endIndex = startIndex + this.pageSize;
            const paginatedResults = results.slice(startIndex, endIndex);
            
            const data = {
                success: true,
                results: paginatedResults,
                total_results: totalResults,
                page_info: {
                    current_page: this.currentPage,
                    has_more: endIndex < totalResults
                }
            };
            
            this.displayResults(data);
        } catch (error) {
            console.error('Search error:', error);
            this.showError('Search temporarily unavailable. Please try again later.');
        } finally {
            this.isLoading = false;
        }
    }
    
    searchInScammerDatabase(query, searchType) {
        if (!this.scammerDatabase) {
            return [];
        }
        
        const lowerQuery = query.toLowerCase();
        const results = [];
        
        // Search phone numbers
        if (searchType === 'all' || searchType === 'phone') {
            this.scammerDatabase.phone_numbers.forEach(item => {
                if (item.phone.toLowerCase().includes(lowerQuery)) {
                    results.push({
                        id: `phone-${item.rank}`,
                        type: 'phone',
                        phone: item.phone,
                        police_reports: item.police_reports,
                        rank: item.rank,
                        description: `Phone number reported ${item.police_reports} time(s) to police`,
                        threat_level: item.police_reports >= 15 ? 'high' : item.police_reports >= 10 ? 'medium' : 'low',
                        verification_status: 'verified',
                        first_reported: 'N/A',
                        report_count: item.police_reports
                    });
                }
            });
        }
        
        // Search bank accounts
        if (searchType === 'all' || searchType === 'website') {
            this.scammerDatabase.bank_accounts.forEach(item => {
                if (item.account.toLowerCase().includes(lowerQuery)) {
                    results.push({
                        id: `bank-${item.rank}`,
                        type: 'bank_account',
                        bank_account: item.account,
                        police_reports: item.police_reports,
                        rank: item.rank,
                        description: `Bank account reported ${item.police_reports} time(s) to police`,
                        threat_level: item.police_reports >= 20 ? 'high' : item.police_reports >= 15 ? 'medium' : 'low',
                        verification_status: 'verified',
                        first_reported: 'N/A',
                        report_count: item.police_reports
                    });
                }
            });
        }
        
        // Sort by police reports (descending)
        results.sort((a, b) => b.police_reports - a.police_reports);
        
        return results;
    }
    
    
    hideResults() {
        this.resultsSection.style.display = 'none';
    }
    
    displayResults(data) {
        const { results, total_results, page_info } = data;
        
        this.resultsTitle.textContent = `Search Results for "${this.currentQuery}"`;
        this.resultsCount.textContent = `${total_results.toLocaleString()} result${total_results !== 1 ? 's' : ''} found`;
        
        if (results.length === 0) {
            this.showNoResults();
            return;
        }
        
        this.renderResults(results);
        this.updatePagination(page_info, total_results);
        
        this.resultsGrid.style.display = 'grid';
        this.noResults.style.display = 'none';
        this.exportBtn.style.display = total_results > 0 ? 'block' : 'none';
    }
    
    showNoResults() {
        this.resultsGrid.style.display = 'none';
        this.noResults.style.display = 'block';
        this.pagination.style.display = 'none';
        this.exportBtn.style.display = 'none';
    }
    
    renderResults(results) {
        this.resultsGrid.innerHTML = '';
        
        results.forEach(scammer => {
            const card = this.createResultCard(scammer);
            this.resultsGrid.appendChild(card);
        });
    }
    
    createResultCard(scammer) {
        const card = document.createElement('div');
        card.className = `result-card threat-${scammer.threat_level}`;
        
        const verificationBadge = this.createBadge('verification', scammer.verification_status || 'verified');
        const threatBadge = this.createBadge('threat', scammer.threat_level);
        const typeBadge = scammer.type === 'phone' ? 
            this.createBadge('scam-type', 'Phone Scam') : 
            this.createBadge('scam-type', 'Bank Account Scam');
        
        card.innerHTML = `
            <div class="result-header">
                <div class="result-badges">
                    ${verificationBadge}
                    ${threatBadge}
                    ${typeBadge}
                </div>
            </div>
            
            <div class="result-content">
                ${scammer.phone ? `
                    <div class="result-field">
                        <strong>📱 Phone Number:</strong>
                        <span class="field-value masked-data">${scammer.phone}</span>
                    </div>
                ` : ''}
                
                ${scammer.bank_account ? `
                    <div class="result-field">
                        <strong>🏦 Bank Account:</strong>
                        <span class="field-value masked-data">${scammer.bank_account}</span>
                    </div>
                ` : ''}
                
                <div class="result-description">
                    ${this.escapeHtml(scammer.description)}
                </div>
            </div>
            
            <div class="result-meta">
                <div class="meta-info">
                    <div>Police Reports: <strong>${scammer.police_reports}</strong></div>
                    <div>Rank: #${scammer.rank}</div>
                </div>
                
                <div class="result-actions">
                    <button class="btn-sm btn-info" onclick="dashboard.showScammerDetails('${scammer.id}')">
                        View Details
                    </button>
                    <button class="btn-sm btn-warning" onclick="dashboard.reportSimilar('${scammer.id}')">
                        Report Similar
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }
    
    createBadge(type, value) {
        const className = `badge ${type}-${value.replace(/\s+/g, '-').toLowerCase()}`;
        const displayValue = value.replace(/_/g, ' ').toUpperCase();
        return `<span class="${className}">${displayValue}</span>`;
    }
    
    updatePagination(pageInfo, totalResults) {
        const totalPages = Math.ceil(totalResults / this.pageSize);
        const currentPageNum = this.currentPage + 1;
        
        this.pageInfo.textContent = `Page ${currentPageNum} of ${totalPages}`;
        
        this.prevPageBtn.disabled = this.currentPage === 0;
        this.nextPageBtn.disabled = !pageInfo.has_more;
        
        this.pagination.style.display = totalPages > 1 ? 'flex' : 'none';
    }
    
    async showScammerDetails(scammerId) {
        if (!this.scammerDatabase) {
            await this.loadScammerDatabase();
        }
        
        // Find the scammer in the database
        const [type, rank] = scammerId.split('-');
        let scammer = null;
        
        if (type === 'phone' && this.scammerDatabase.phone_numbers) {
            scammer = this.scammerDatabase.phone_numbers.find(item => item.rank === parseInt(rank));
            if (scammer) {
                scammer.type = 'phone';
            }
        } else if (type === 'bank' && this.scammerDatabase.bank_accounts) {
            scammer = this.scammerDatabase.bank_accounts.find(item => item.rank === parseInt(rank));
            if (scammer) {
                scammer.type = 'bank_account';
            }
        }
        
        if (!scammer) {
            this.modalTitle.textContent = 'Scammer Details';
            this.modalBody.innerHTML = '<p>Details not found.</p>';
            this.modal.style.display = 'flex';
            return;
        }
        
        this.modalTitle.textContent = scammer.type === 'phone' ? 'Phone Number Details' : 'Bank Account Details';
        this.modalBody.innerHTML = `
            <div class="scammer-details-modal">
                ${scammer.type === 'phone' ? `
                    <div class="detail-field">
                        <strong>Phone Number:</strong>
                        <span class="detail-value">${scammer.phone}</span>
                    </div>
                ` : `
                    <div class="detail-field">
                        <strong>Bank Account:</strong>
                        <span class="detail-value">${scammer.account}</span>
                    </div>
                `}
                
                <div class="detail-field">
                    <strong>Rank:</strong>
                    <span class="detail-value">#${scammer.rank}</span>
                </div>
                
                <div class="detail-field">
                    <strong>Police Reports:</strong>
                    <span class="detail-value">${scammer.police_reports} report(s)</span>
                </div>
                
                <div class="detail-field">
                    <strong>Threat Level:</strong>
                    <span class="detail-value">
                        ${scammer.police_reports >= 20 ? 'High' : scammer.police_reports >= 15 ? 'Medium' : 'Low'}
                    </span>
                </div>
                
                <div class="detail-note">
                    <p><strong>Note:</strong> This information is based on police reports. If you have been scammed by this ${scammer.type === 'phone' ? 'phone number' : 'bank account'}, please report it to the authorities.</p>
                </div>
            </div>
        `;
        
        this.modal.style.display = 'flex';
    }
    
    reportSimilar(scammerId) {
        window.open('report-incident.php', '_blank');
    }
    
    closeModal() {
        this.modal.style.display = 'none';
    }
    
    async exportResults() {
        if (!this.currentQuery) {
            return;
        }
        
        try {
            const params = new URLSearchParams({
                action: 'search',
                q: this.currentQuery,
                type: this.currentType,
                limit: 1000, // Export more results
                offset: 0
            });
            
            // Add filters to params
            Object.entries(this.currentFilters).forEach(([key, value]) => {
                if (value) {
                    params.append(key, value);
                }
            });
            
            const response = await fetch(`api/scammer-search.php?${params}`);
            const data = await response.json();
            
            if (data.success) {
                this.downloadCSV(data.results);
            } else {
                this.showError('Export failed');
            }
        } catch (error) {
            console.error('Export error:', error);
            this.showError('Export temporarily unavailable');
        }
    }
    
    downloadCSV(results) {
        const headers = ['Email', 'Phone', 'Website', 'Scam Type', 'Threat Level', 'Verification', 'Location', 'Description', 'First Reported', 'Report Count'];
        
        const csvContent = [
            headers.join(','),
            ...results.map(scammer => [
                this.csvEscape(scammer.email || ''),
                this.csvEscape(scammer.phone || ''),
                this.csvEscape(scammer.website || ''),
                this.csvEscape(scammer.scam_type || ''),
                this.csvEscape(scammer.threat_level || ''),
                this.csvEscape(scammer.verification_status || ''),
                this.csvEscape(scammer.location || ''),
                this.csvEscape(scammer.description || ''),
                this.csvEscape(scammer.first_reported || ''),
                scammer.report_count || 0
            ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `scammer-search-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
    
    csvEscape(str) {
        if (typeof str !== 'string') {
            str = String(str);
        }
        
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        
        return str;
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-MY', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showError(message) {
        // Create a temporary error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.innerHTML = `
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <span class="error-message">${message}</span>
                <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Add error styles if not already present
        if (!document.getElementById('error-styles')) {
            const style = document.createElement('style');
            style.id = 'error-styles';
            style.textContent = `
                .error-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #f8d7da;
                    color: #721c24;
                    border: 1px solid #f5c6cb;
                    border-radius: 8px;
                    padding: 1rem;
                    z-index: 1001;
                    max-width: 400px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                
                .error-content {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .error-close {
                    background: none;
                    border: none;
                    font-size: 1.2rem;
                    cursor: pointer;
                    color: #721c24;
                    margin-left: auto;
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(errorDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }
    
    async loadScammerDatabase() {
        try {
            const response = await fetch('data/scammer-database.json');
            const data = await response.json();
            
            // Store data for searching only (not displayed)
            this.scammerDatabase = data;
        } catch (error) {
            console.error('Failed to load scammer database:', error);
        }
    }
    
    async checkDataBreach() {
        const email = this.breachEmailInput.value.trim();
        
        if (!email) {
            this.showError('Please enter an email address');
            return;
        }
        
        if (!this.isValidEmail(email)) {
            this.showError('Please enter a valid email address');
            return;
        }
        
        // Show loading
        this.breachLoading.style.display = 'block';
        this.breachResults.style.display = 'none';
        this.checkBreachBtn.disabled = true;
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock HIBP API response - always returns the same breaches
        const mockBreaches = this.getMockBreachData();
        
        // Hide loading
        this.breachLoading.style.display = 'none';
        this.checkBreachBtn.disabled = false;
        
        // Display results
        this.displayBreachResults(email, mockBreaches);
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    getMockBreachData() {
        // Return mock breach data similar to HIBP format
        return [
            {
                name: "Data Troll",
                title: "Data Troll",
                domain: "Various",
                breachDate: "2025-06-01",
                addedDate: "2025-06-15",
                modifiedDate: "2025-06-15",
                pwnCount: 109000000,
                description: "In June 2025, headlines erupted over a \"16 billion password\" breach. In reality, the dataset was a compilation of publicly accessible stealer logs, mostly repurposed from older leaks, with only a small portion of genuinely new material. HIBP received 2.7B rows containing 109M unique email addresses, which was subsequently added to the service under the name \"Data Troll\". The websites the stealer logs were captured against are searchable via the HIBP dashboard.",
                dataClasses: ["Email addresses", "Passwords"]
            },
            {
                name: "SynthientStealerLogThreatData",
                title: "Synthient Stealer Log Threat Data",
                domain: "Various",
                breachDate: "2025-04-01",
                addedDate: "2025-04-20",
                modifiedDate: "2025-04-20",
                pwnCount: 183000000,
                description: "During 2025, Synthient aggregated billions of records of \"threat data\" from various internet sources. The data contained 183M unique email addresses alongside the websites they were entered into and the passwords used. After normalising and deduplicating the data, 183 million unique email addresses remained, each linked to the website where the credentials were captured, and the password used. This dataset is now searchable in HIBP by email address, password, domain, and the site on which the credentials were entered.",
                dataClasses: ["Email addresses", "Passwords"]
            },
            {
                name: "AlienStealerLogs",
                title: "ALIEN TXTBASE Stealer Logs",
                domain: "Various",
                breachDate: "2025-02-01",
                addedDate: "2025-02-15",
                modifiedDate: "2025-02-15",
                pwnCount: 284000000,
                description: "In February 2025, 23 billion rows of stealer logs were obtained from a Telegram channel known as ALIEN TXTBASE. The data contained 284M unique email addresses alongside the websites they were entered into and the passwords used. This data is now searchable in HIBP by both email domain and the domain of the target website.",
                dataClasses: ["Email addresses", "Passwords"]
            },
            {
                name: "StealerLogsJan2025",
                title: "Stealer Logs, Jan 2025",
                domain: "Various",
                breachDate: "2025-01-01",
                addedDate: "2025-01-20",
                modifiedDate: "2025-01-20",
                pwnCount: 71000000,
                description: "In January 2025, stealer logs with 71M email addresses were added to HIBP. Consisting of email address, password and the website the credentials were entered against, this breach marks the launch of a new HIBP feature enabling the retrieval of the specific websites the logs were collected against. The incident also resulted in 106M more passwords being added to the Pwned Passwords service.",
                dataClasses: ["Email addresses", "Passwords"]
            },
            {
                name: "TelegramCombolists",
                title: "Combolists Posted to Telegram",
                domain: "Various",
                breachDate: "2024-05-01",
                addedDate: "2024-05-20",
                modifiedDate: "2024-05-20",
                pwnCount: 361000000,
                description: "In May 2024, 2B rows of data with 361M unique email addresses were collated from malicious Telegram channels. The data contained 122GB across 1.7k files with email addresses, usernames, passwords and in many cases, the website they were entered into. The data appears to have been sourced from a combination of existing combolists and info stealer malware.",
                dataClasses: ["Email addresses", "Passwords", "Usernames"]
            },
            {
                name: "NazApi",
                title: "Naz.API",
                domain: "Various",
                breachDate: "2023-09-01",
                addedDate: "2023-09-20",
                modifiedDate: "2023-09-20",
                pwnCount: 71000000,
                description: "In September 2023, over 100GB of stealer logs and credential stuffing lists titled \"Naz.API\" was posted to a popular hacking forum. The incident contained a combination of email address and plain text password pairs alongside the service they were entered into, and standalone credential pairs obtained from unnamed sources. In total, the corpus of data included 71M unique email addresses and 100M unique passwords.",
                dataClasses: ["Email addresses", "Passwords"]
            },
            {
                name: "MangaDex",
                title: "MangaDex",
                domain: "mangadex.org",
                breachDate: "2021-03-01",
                addedDate: "2021-03-15",
                modifiedDate: "2021-03-15",
                pwnCount: 3000000,
                description: "In March 2021, the manga fan site MangaDex suffered a data breach that resulted in the exposure of almost 3 million subscribers. The data included email and IP addresses, usernames and passwords stored as bcrypt hashes. The data was subsequently circulated within hacking groups.",
                dataClasses: ["Email addresses", "IP addresses", "Passwords", "Usernames"]
            }
        ];
    }
    
    displayBreachResults(email, breaches) {
        this.breachResults.style.display = 'block';
        
        // Update alert
        this.breachAlertTitle.textContent = `⚠️ Breach Detected: ${breaches.length} breach${breaches.length !== 1 ? 'es' : ''} found`;
        this.breachAlertMessage.textContent = `The email "${email}" was found in ${breaches.length} data breach${breaches.length !== 1 ? 'es' : ''}.`;
        
        // Render breach list
        this.breachList.innerHTML = breaches.map((breach, index) => `
            <div class="breach-item">
                <div class="breach-header">
                    <h4 class="breach-title">${this.escapeHtml(breach.title)}</h4>
                    <span class="breach-date">${this.formatBreachDate(breach.breachDate)}</span>
                </div>
                <div class="breach-info">
                    <div class="breach-description">
                        ${this.escapeHtml(breach.description)}
                    </div>
                    <div class="breach-details">
                        <div class="breach-detail-item">
                            <strong>Compromised accounts:</strong> ${breach.pwnCount.toLocaleString()}
                        </div>
                        <div class="breach-detail-item">
                            <strong>Compromised data:</strong>
                            <ul class="data-classes-list">
                                ${breach.dataClasses.map(dataClass => `<li>${this.escapeHtml(dataClass)}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Scroll to results
        this.breachResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    formatBreachDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short'
        });
    }
}

// Initialize dashboard when DOM is loaded
let dashboard;

document.addEventListener('DOMContentLoaded', () => {
    dashboard = new PublicDashboard();
});

// Make dashboard available globally for onclick handlers
window.dashboard = dashboard;
