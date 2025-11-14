// OSINT Monitor JavaScript Module
class OSINTMonitor {
    constructor() {
        this.currentThreats = [];
        this.currentOffset = 0;
        this.isLoading = false;
        this.autoRefreshInterval = null;
        this.map = null;
        this.threatChart = null;
        this.selectedThreat = null;
        
        this.initializeComponents();
        this.startAutoRefresh();
        this.loadInitialData();
    }
    
    initializeComponents() {
        // Initialize map
        this.initializeMap();
        
        // Initialize chart
        this.initializeChart();
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    initializeMap() {
        const mapElement = document.getElementById('threatMap');
        if (!mapElement) return;
        
        // Initialize Leaflet map centered on Malaysia
        this.map = L.map('threatMap').setView([4.2105, 101.9758], 6);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
        
        // Add some sample threat markers
        this.addSampleThreats();
    }
    
    addSampleThreats() {
        const threats = [
            { lat: 3.1390, lng: 101.6869, level: 'critical', title: 'Phishing Campaign - KL' },
            { lat: 5.4164, lng: 100.3327, level: 'high', title: 'Malware Detection - Penang' },
            { lat: 1.4927, lng: 103.7414, level: 'medium', title: 'Suspicious Activity - Johor' },
            { lat: 5.9804, lng: 116.0735, level: 'low', title: 'Minor Alert - Sabah' },
            { lat: 2.1896, lng: 102.2501, level: 'high', title: 'Scam Reports - Melaka' }
        ];
        
        threats.forEach(threat => {
            const color = this.getThreatColor(threat.level);
            const marker = L.circleMarker([threat.lat, threat.lng], {
                color: color,
                fillColor: color,
                fillOpacity: 0.7,
                radius: this.getThreatRadius(threat.level)
            }).addTo(this.map);
            
            marker.bindPopup(`
                <strong>${threat.title}</strong><br>
                Level: ${threat.level.toUpperCase()}<br>
                <small>Click for more details</small>
            `);
        });
    }
    
    getThreatColor(level) {
        const colors = {
            'critical': '#dc3545',
            'high': '#ffc107',
            'medium': '#17a2b8',
            'low': '#28a745'
        };
        return colors[level] || '#6c757d';
    }
    
    getThreatRadius(level) {
        const sizes = {
            'critical': 15,
            'high': 12,
            'medium': 9,
            'low': 6
        };
        return sizes[level] || 8;
    }
    
    initializeChart() {
        const ctx = document.getElementById('threatChart');
        if (!ctx) return;
        
        this.threatChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateTimeLabels('24h'),
                datasets: [{
                    label: 'Critical',
                    data: this.generateSampleData(24),
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    tension: 0.4
                }, {
                    label: 'High',
                    data: this.generateSampleData(24),
                    borderColor: '#ffc107',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Medium',
                    data: this.generateSampleData(24),
                    borderColor: '#17a2b8',
                    backgroundColor: 'rgba(23, 162, 184, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Low',
                    data: this.generateSampleData(24),
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }
    
    generateTimeLabels(timeframe) {
        const labels = [];
        const now = new Date();
        
        if (timeframe === '24h') {
            for (let i = 23; i >= 0; i--) {
                const time = new Date(now.getTime() - (i * 60 * 60 * 1000));
                labels.push(time.getHours().toString().padStart(2, '0') + ':00');
            }
        } else if (timeframe === '7d') {
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
                labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
            }
        } else if (timeframe === '30d') {
            for (let i = 29; i >= 0; i--) {
                const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
                labels.push(date.getDate().toString());
            }
        }
        
        return labels;
    }
    
    generateSampleData(points) {
        return Array.from({ length: points }, () => Math.floor(Math.random() * 10));
    }
    
    setupEventListeners() {
        // Search functionality
        const keywordSearch = document.getElementById('keywordSearch');
        if (keywordSearch) {
            keywordSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchThreats();
                }
            });
        }
        
        // Filter changes
        const threatLevelFilter = document.getElementById('threatLevelFilter');
        const timeframeFilter = document.getElementById('timeframeFilter');
        
        if (threatLevelFilter) {
            threatLevelFilter.addEventListener('change', () => this.searchThreats());
        }
        
        if (timeframeFilter) {
            timeframeFilter.addEventListener('change', () => {
                this.searchThreats();
            });
        }
        
        // Chart timeframe change
        const chartTimeframe = document.getElementById('chartTimeframe');
        if (chartTimeframe) {
            chartTimeframe.addEventListener('change', () => this.updateChart());
        }
    }
    
    
    async loadInitialData() {
        // Disabled - no longer needed for osint-monitor
        // await this.searchThreats();
        // await this.loadTrendingKeywords();
    }
    
    async searchThreats() {
        // Disabled - no longer needed for osint-monitor
        return;
    }
    
    async loadMoreThreats() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.currentOffset += 20;
        
        const keywords = document.getElementById('keywordSearch')?.value.trim();
        const threatLevel = document.getElementById('threatLevelFilter')?.value;
        
        try {
            const formData = new FormData();
            formData.append('action', 'search_threats');
            if (keywords) formData.append('keywords', keywords);
            if (threatLevel) formData.append('threat_level', threatLevel);
            formData.append('limit', '20');
            formData.append('offset', this.currentOffset.toString());
            
            const response = await fetch('api/osint-collector.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.currentThreats = [...this.currentThreats, ...result.threats];
                this.displayThreats(result.threats, false);
                
                // Hide load more button if no more results
                if (result.threats.length < 20) {
                    document.getElementById('loadMoreBtn').style.display = 'none';
                }
            } else {
                throw new Error(result.error || 'Failed to load more threats');
            }
            
        } catch (error) {
            console.error('Error loading more threats:', error);
            this.showAlert('Failed to load more threats', 'danger');
        } finally {
            this.isLoading = false;
        }
    }
    
    displayThreats(threats, replace = true) {
        const threatsList = document.getElementById('threatsList');
        if (!threatsList) return;
        
        if (replace) {
            threatsList.innerHTML = '';
        }
        
        if (threats.length === 0 && replace) {
            threatsList.innerHTML = '<p style="text-align: center; color: #6c757d;">No threats found matching your criteria.</p>';
            return;
        }
        
        threats.forEach(threat => {
            const threatElement = this.createThreatElement(threat);
            threatsList.appendChild(threatElement);
        });
        
        // Show/hide load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = threats.length === 20 ? 'block' : 'none';
        }
    }
    
    createThreatElement(threat) {
        const element = document.createElement('div');
        element.className = `threat-item ${threat.threat_level}`;
        element.onclick = () => this.showThreatDetails(threat);
        
        const timeAgo = this.getTimeAgo(new Date(threat.collected_at));
        
        element.innerHTML = `
            <div class="threat-header">
                <div class="threat-source">${threat.source}</div>
                <div class="threat-level ${threat.threat_level}">${threat.threat_level}</div>
            </div>
            <div class="threat-content">${threat.content}</div>
            <div class="threat-meta">
                <div class="threat-location">
                    <span>📍</span>
                    <span>${threat.location || 'Unknown'}</span>
                </div>
                <div class="threat-time">${timeAgo}</div>
            </div>
        `;
        
        return element;
    }
    
    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    }
    
    async loadTrendingKeywords() {
        // Disabled - no longer needed for osint-monitor
        return;
    }
    
    displayTrendingKeywords(keywords) {
        const container = document.getElementById('trendingKeywords');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (keywords.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #6c757d;">No trending keywords available.</p>';
            return;
        }
        
        keywords.forEach(item => {
            const tag = document.createElement('div');
            tag.className = 'keyword-tag';
            if (item.frequency > 5) tag.classList.add('trending');
            
            tag.innerHTML = `
                ${item.keyword}
                <span class="frequency">${item.frequency}</span>
            `;
            
            tag.onclick = () => {
                document.getElementById('keywordSearch').value = item.keyword;
                this.searchThreats();
            };
            
            container.appendChild(tag);
        });
        
        // Update timestamp
        const timestampElement = document.getElementById('keywordsUpdated');
        if (timestampElement) {
            timestampElement.textContent = new Date().toLocaleTimeString();
        }
    }
    
    showThreatDetails(threat) {
        this.selectedThreat = threat;
        
        const modal = document.getElementById('threatModal');
        const modalBody = document.getElementById('threatModalBody');
        
        if (!modal || !modalBody) return;
        
        const keywords = JSON.parse(threat.keywords || '[]');
        
        modalBody.innerHTML = `
            <div class="threat-detail">
                <h4>Source: ${threat.source}</h4>
                <div class="detail-item">
                    <strong>Threat Level:</strong>
                    <span class="threat-level ${threat.threat_level}">${threat.threat_level.toUpperCase()}</span>
                </div>
                <div class="detail-item">
                    <strong>Location:</strong> ${threat.location || 'Unknown'}
                </div>
                <div class="detail-item">
                    <strong>Collected:</strong> ${new Date(threat.collected_at).toLocaleString()}
                </div>
                <div class="detail-item">
                    <strong>Keywords:</strong>
                    <div class="keywords-list">
                        ${keywords.map(keyword => `<span class="keyword-tag">${keyword}</span>`).join('')}
                    </div>
                </div>
                <div class="detail-item">
                    <strong>Content:</strong>
                    <div class="threat-content-full">${threat.content}</div>
                </div>
                ${threat.url ? `
                    <div class="detail-item">
                        <strong>Source URL:</strong>
                        <a href="${threat.url}" target="_blank" rel="noopener noreferrer">${threat.url}</a>
                    </div>
                ` : ''}
            </div>
        `;
        
        modal.style.display = 'flex';
    }
    
    async collectThreats() {
        const collectBtn = document.getElementById('collectBtn');
        const spinner = document.getElementById('collectSpinner');
        
        if (!collectBtn || this.isLoading) return;
        
        this.isLoading = true;
        collectBtn.disabled = true;
        spinner.style.display = 'inline-block';
        collectBtn.innerHTML = '<span class="spinner"></span> Collecting...';
        
        try {
            const keywords = document.getElementById('keywordSearch')?.value.trim();
            const timeframe = document.getElementById('timeframeFilter')?.value || '24h';
            
            const formData = new FormData();
            formData.append('action', 'collect_threats');
            if (keywords) formData.append('keywords', keywords);
            formData.append('timeframe', timeframe);
            
            const response = await fetch('api/osint-collector.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showAlert(`Successfully collected ${result.count} new threats`, 'success');
                await this.searchThreats();
                await this.loadTrendingKeywords();
            } else {
                throw new Error(result.error || 'Collection failed');
            }
            
        } catch (error) {
            console.error('Error collecting threats:', error);
            this.showAlert('Failed to collect threats', 'danger');
        } finally {
            this.isLoading = false;
            collectBtn.disabled = false;
            spinner.style.display = 'none';
            collectBtn.innerHTML = 'Collect Latest Threats';
        }
    }
    
    updateChart() {
        const timeframe = document.getElementById('chartTimeframe')?.value || '24h';
        
        if (this.threatChart) {
            this.threatChart.data.labels = this.generateTimeLabels(timeframe);
            
            const points = timeframe === '24h' ? 24 : timeframe === '7d' ? 7 : 30;
            this.threatChart.data.datasets.forEach(dataset => {
                dataset.data = this.generateSampleData(points);
            });
            
            this.threatChart.update();
        }
    }
    
    clearFilters() {
        document.getElementById('keywordSearch').value = '';
        document.getElementById('threatLevelFilter').value = '';
        document.getElementById('timeframeFilter').value = '24h';
        this.searchThreats();
    }
    
    startAutoRefresh() {
        // Auto-refresh every 5 minutes
        this.autoRefreshInterval = setInterval(() => {
            this.showAutoRefreshIndicator();
            this.loadTrendingKeywords();
        }, 5 * 60 * 1000);
    }
    
    showAutoRefreshIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'auto-refresh updating';
        indicator.textContent = 'Updating threat data...';
        document.body.appendChild(indicator);
        
        setTimeout(() => {
            indicator.textContent = 'Data updated';
            indicator.classList.remove('updating');
            
            setTimeout(() => {
                indicator.remove();
            }, 2000);
        }, 1000);
    }
    
    showAlert(message, type = 'info') {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        const container = document.querySelector('.container');
        container.insertBefore(alert, container.firstChild);
        
        setTimeout(() => alert.remove(), 5000);
    }
    
    // Public methods for HTML onclick handlers
    refreshMap() {
        if (this.map) {
            this.map.invalidateSize();
            this.addSampleThreats();
        }
    }
    
    refreshThreats() {
        this.searchThreats();
    }
    
    toggleMapView() {
        // Toggle between different map views
        this.showAlert('Map view toggled', 'info');
    }
    
    toggleThreatView() {
        // Toggle between list and card view
        this.showAlert('Threat view toggled', 'info');
    }
    
    exportData() {
        // Export current threat data
        const data = JSON.stringify(this.currentThreats, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `threats_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showAlert('Threat data exported', 'success');
    }
}

// Global functions for HTML onclick handlers
let osintMonitor;

function collectThreats() {
    if (osintMonitor) osintMonitor.collectThreats();
}

function searchThreats() {
    if (osintMonitor) osintMonitor.searchThreats();
}

function loadMoreThreats() {
    if (osintMonitor) osintMonitor.loadMoreThreats();
}

function clearFilters() {
    if (osintMonitor) osintMonitor.clearFilters();
}

function updateChart() {
    if (osintMonitor) osintMonitor.updateChart();
}

function refreshMap() {
    if (osintMonitor) osintMonitor.refreshMap();
}

function refreshThreats() {
    if (osintMonitor) osintMonitor.refreshThreats();
}

function toggleMapView() {
    if (osintMonitor) osintMonitor.toggleMapView();
}

function toggleThreatView() {
    if (osintMonitor) osintMonitor.toggleThreatView();
}

function exportData() {
    if (osintMonitor) osintMonitor.exportData();
}

function closeThreatModal() {
    document.getElementById('threatModal').style.display = 'none';
}

function markAsReviewed() {
    if (osintMonitor && osintMonitor.selectedThreat) {
        osintMonitor.showAlert('Threat marked as reviewed', 'success');
        closeThreatModal();
    }
}

function escalateThreat() {
    if (osintMonitor && osintMonitor.selectedThreat) {
        osintMonitor.showAlert('Threat escalated to authorities', 'info');
        closeThreatModal();
    }
}

// Action functions
function createAlert() {
    osintMonitor?.showAlert('Alert creation feature coming soon', 'info');
}

function generateReport() {
    osintMonitor?.showAlert('Report generation started', 'info');
}

function exportThreats() {
    exportData();
}

function escalateToAgency() {
    osintMonitor?.showAlert('Escalation workflow initiated', 'info');
}

// Tab switching function
function switchTab(tabName) {
    console.log('Switching to tab:', tabName); // Debug log
    
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById('tab-' + tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
        console.log('Tab activated:', selectedTab.id); // Debug log
    } else {
        console.error('Tab not found: tab-' + tabName); // Debug log
    }
    
    // Add active class to selected button
    const selectedBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('active');
        console.log('Button activated:', selectedBtn); // Debug log
    } else {
        console.error('Button not found for tab:', tabName); // Debug log
    }
}

// Make switchTab globally accessible
window.switchTab = switchTab;

// Semak Mule functions
function updateSemakMuleLabel() {
    const type = document.getElementById('semakMuleType').value;
    const label = document.getElementById('semakMuleLabel');
    const input = document.getElementById('semakMuleInput');
    
    switch(type) {
        case 'bank':
            label.textContent = 'Bank Account Number';
            input.placeholder = 'Enter bank account number';
            break;
        case 'phone':
            label.textContent = 'Phone Number';
            input.placeholder = 'Enter phone number (e.g., 0123456789)';
            break;
    }
}

async function checkSemakMule() {
    const type = document.getElementById('semakMuleType').value;
    const input = document.getElementById('semakMuleInput').value.trim();
    const resultsDiv = document.getElementById('semakMuleResults');
    
    if (!input) {
        showToolAlert('Please enter a value to check', 'danger', resultsDiv);
        return;
    }
    
    resultsDiv.innerHTML = '<p>Checking database...</p>';
    
    try {
        const formData = new FormData();
        formData.append('action', type === 'bank' ? 'check_bank_account' : 
                                    type === 'phone' ? 'check_phone' : 'check_company');
        
        if (type === 'bank') {
            formData.append('account_number', input);
        } else if (type === 'phone') {
            formData.append('phone_number', input);
        } else {
            formData.append('company_name', input);
        }
        
        const response = await fetch('api/osint-tools.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            displaySemakMuleResults(result, resultsDiv);
        } else {
            showToolAlert(result.error || 'Check failed', 'danger', resultsDiv);
        }
    } catch (error) {
        console.error('Error checking Semak Mule:', error);
        showToolAlert('Failed to check database. Please try again.', 'danger', resultsDiv);
    }
}

function displaySemakMuleResults(result, container) {
    const data = result.data;
    const searchValue = result.account_number || result.phone_number || result.company_name || 'Unknown';
    
    // Handle Semak Mule API response format
    if (data && typeof data === 'object') {
        const status = data.status;
        const statusMessage = data.status_message || 'Unknown';
        const tableHeader = data.table_header || [];
        const tableData = data.table_data || [];
        const count = data.count || 0;
        const category = data.cat || 0;
        const keyword = data.kw || searchValue;
        let totalReports = count;

        if (tableData.length > 0 && tableHeader.length > 0) {
            const reportIndex = tableHeader.findIndex(header =>
                typeof header === 'string' && /report|repot/i.test(header)
            );

            if (reportIndex !== -1) {
                const computedReports = tableData.reduce((sum, row) => {
                    let value = 0;

                    if (Array.isArray(row)) {
                        value = parseInt(row[reportIndex], 10);
                    } else if (row && typeof row === 'object') {
                        const headerKey = tableHeader[reportIndex];
                        const normalizedKey = typeof headerKey === 'string' ? headerKey.toLowerCase() : '';
                        value = parseInt(
                            row[headerKey] ??
                            row[normalizedKey] ??
                            row['report'] ??
                            row['reports'] ??
                            row['repot'] ??
                            row['total_reports'] ??
                            0,
                            10
                        );
                    } else if (typeof row === 'string') {
                        const match = row.match(/\d+/);
                        value = match ? parseInt(match[0], 10) : 0;
                    }

                    return sum + (isNaN(value) ? 0 : value);
                }, 0);

                if (!isNaN(computedReports) && computedReports > 0) {
                    totalReports = computedReports;
                }
            }
        }
 
        // Category names
        const categoryNames = {
            1: 'Bank Account',
            2: 'Phone Number'
        };
        
        let html = '<div class="result-card ' + (status === 1 && count > 0 ? 'warning' : 'success') + '">';
        
        // Header section
        html += '<div class="semak-mule-header">';
        html += '<h3>' + (status === 1 && count > 0 ? '⚠️ Match Found in Scammer Database' : '✅ No Match Found') + '</h3>';
        html += '<div class="semak-mule-meta">';
        html += '<div class="meta-item"><strong>Search Type:</strong> ' + (categoryNames[category] || 'Unknown') + '</div>';
        html += '<div class="meta-item"><strong>Searched:</strong> <code>' + escapeHtml(keyword) + '</code></div>';
        html += '<div class="meta-item"><strong>Status:</strong> <span class="status-badge ' + (status === 1 ? 'success' : 'info') + '">' + escapeHtml(statusMessage) + '</span></div>';
        html += '<div class="meta-item"><strong>Total Searches:</strong> <span class="match-count">' + count + '</span></div>';
        html += '</div>';
        html += '</div>';
        
        // Results - handle matches found
        if (status === 1 && count > 0) {
            // Show warning alert
            html += '<div class="semak-mule-alert danger-alert">';
            html += '<div class="alert-icon">🚨</div>';
            html += '<div class="alert-content">';
            html += '<h4>⚠️ SCAM ALERT - Match Found in Database</h4>';
            html += '<p><strong>This ' + (categoryNames[category] || 'item') + ' has been reported ' + totalReports + ' time(s) in the Royal Malaysian Police (PDRM) CCID scammer database.</strong></p>';
            html += '<p>This indicates that this ' + (categoryNames[category] || 'item').toLowerCase() + ' is associated with fraudulent activities.</p>';
            html += '</div>';
            html += '</div>';
            
            // Show match statistics
            html += '<div class="semak-mule-stats">';
            html += '<div class="stat-box danger">';
            html += '<div class="stat-number">' + totalReports + '</div>';
            html += '<div class="stat-label">Total Reports</div>';
            html += '</div>';
            html += '<div class="stat-box info">';
            html += '<div class="stat-icon">📞</div>';
            html += '<div class="stat-label">Type: ' + (categoryNames[category] || 'Unknown') + '</div>';
            html += '</div>';
            html += '<div class="stat-box warning">';
            html += '<div class="stat-icon">🛡️</div>';
            html += '<div class="stat-label">PDRM Verified</div>';
            html += '</div>';
            html += '</div>';
            
            // Summary note (table removed per requirements)
            html += '<div class="semak-mule-note">';
            html += '<p><strong>ℹ️ Note:</strong> The PDRM database confirms ' + totalReports + ' report(s) for this ' + (categoryNames[category] || 'item').toLowerCase() + '. Detailed case records are available through the official <a href="https://semakmule.rmp.gov.my" target="_blank">SemakMule Portal</a>.</p>';
            html += '<p>If you need a formal report, contact PDRM CCID or Cyber999 for further assistance.</p>';
            html += '</div>';
            
            // Footer with action links
            html += '<div class="semak-mule-footer danger-footer">';
            html += '<h4>⚠️ IMMEDIATE ACTIONS REQUIRED:</h4>';
            html += '<ul>';
            html += '<li><strong>DO NOT</strong> proceed with any transactions using this ' + (categoryNames[category] || 'item').toLowerCase() + '</li>';
            html += '<li><strong>DO NOT</strong> respond to messages or calls from this ' + (categoryNames[category] || 'item').toLowerCase() + '</li>';
            html += '<li>If you have already been scammed, report immediately to <a href="https://cyber999.gov.my" target="_blank" rel="noopener">Cyber999 (997)</a></li>';
            html += '<li>File an official police report via <a href="https://www.rmp.gov.my/e-reporting" target="_blank" rel="noopener">PDRM e-Reporting</a></li>';
            html += '<li>Block this ' + (categoryNames[category] || 'item').toLowerCase() + ' immediately</li>';
            html += '<li>Warn others by sharing this information</li>';
            html += '</ul>';
            html += '<div class="emergency-contacts">';
            html += '<p><strong>Emergency Contacts:</strong></p>';
            html += '<p>🚨 Cyber999 Hotline: <strong>997</strong> | 📞 PDRM Hotline: <strong>03-2266 2222</strong></p>';
            html += '</div>';
            html += '</div>';
            
        } else if (status === 1 && count === 0) {
            html += '<div class="semak-mule-success-message">';
            html += '<p>✅ <strong>Good news!</strong> This ' + (categoryNames[category] || 'item') + ' was not found in the scammer database.</p>';
            html += '<p>However, always remain vigilant and verify before making any transactions.</p>';
            html += '</div>';
        } else {
            html += '<div class="semak-mule-success-message">';
            html += '<p>✅ No matches found in the scammer database.</p>';
            html += '</div>';
        }
        
        html += '</div>';
        container.innerHTML = html;
        return;
    }
    
    // Fallback for old format or empty data
    if (!data || (Array.isArray(data) && data.length === 0)) {
        container.innerHTML = `
            <div class="result-card success">
                <h3>✅ No Match Found</h3>
                <p>The ${escapeHtml(searchValue)} was not found in the scammer database.</p>
            </div>
        `;
        return;
    }
    
    // Legacy format handling
    let html = '<div class="result-card warning">';
    html += '<h3>⚠️ Match Found in Database</h3>';
    
    if (Array.isArray(data)) {
        html += '<div class="results-list">';
        data.forEach((item, index) => {
            html += `<div class="result-item">
                <strong>Match ${index + 1}:</strong>
                <pre>${JSON.stringify(item, null, 2)}</pre>
            </div>`;
        });
        html += '</div>';
    } else {
        html += `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// Email Checker functions
async function checkEmail() {
    const email = document.getElementById('emailCheckInput').value.trim();
    const resultsDiv = document.getElementById('emailCheckResults');
    
    if (!email || !email.includes('@')) {
        showToolAlert('Please enter a valid email address', 'danger', resultsDiv);
        return;
    }
    
    resultsDiv.innerHTML = '<p>Checking email...</p>';
    
    try {
        const formData = new FormData();
        formData.append('action', 'check_email');
        formData.append('email', email);
        
        const response = await fetch('api/osint-tools.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            displayEmailResults(result, resultsDiv);
        } else {
            showToolAlert(result.error || 'Email check failed', 'danger', resultsDiv);
        }
    } catch (error) {
        console.error('Error checking email:', error);
        showToolAlert('Failed to check email. Please try again.', 'danger', resultsDiv);
    }
}

function displayEmailResults(result, container) {
    const data = result.data;
    const email = result.email || data.email || 'Unknown';
    
    let html = '<div class="result-card holehe-results">';
    html += `<div class="holehe-header">`;
    html += `<h3>📧 Email Check Results</h3>`;
    html += `<div class="email-display">${escapeHtml(email)}</div>`;
    html += `</div>`;
    
    // Statistics section
    if (data.statistics) {
        const stats = data.statistics;
        html += '<div class="holehe-statistics">';
        html += '<div class="stat-row">';
        html += `<div class="stat-item"><span class="stat-label">Total Checked:</span> <span class="stat-value">${stats.total_checked || 0}</span></div>`;
        html += `<div class="stat-item success"><span class="stat-label">Used [+]:</span> <span class="stat-value">${stats.used_count || 0}</span></div>`;
        html += `<div class="stat-item info"><span class="stat-label">Not Used [-]:</span> <span class="stat-value">${stats.not_used_count || 0}</span></div>`;
        html += `<div class="stat-item warning"><span class="stat-label">Rate Limit [x]:</span> <span class="stat-value">${stats.rate_limit_count || 0}</span></div>`;
        if (stats.time_taken) {
            html += `<div class="stat-item"><span class="stat-label">Time Taken:</span> <span class="stat-value">${stats.time_taken.toFixed(2)}s</span></div>`;
        }
        html += '</div>';
        html += '</div>';
    }
    
    // Platforms list
    if (data.platforms && data.platforms.length > 0) {
        // Group platforms by status
        const usedPlatforms = data.platforms.filter(p => p.status === 'used');
        const notUsedPlatforms = data.platforms.filter(p => p.status === 'not_used');
        const rateLimitPlatforms = data.platforms.filter(p => p.status === 'rate_limit');
        
        html += '<div class="holehe-platforms">';
        
        // Used platforms section
        if (usedPlatforms.length > 0) {
            html += '<div class="platform-section used-section">';
            html += `<h4 class="section-title success"><span class="status-icon">[+]</span> Email Used (${usedPlatforms.length})</h4>`;
            html += '<div class="platforms-list">';
            usedPlatforms.forEach(platform => {
                html += `<div class="platform-item used">
                    <span class="platform-status-icon">[+]</span>
                    <span class="platform-name">${escapeHtml(platform.platform)}</span>
                </div>`;
            });
            html += '</div>';
            html += '</div>';
        }
        
        // Not used platforms section
        if (notUsedPlatforms.length > 0) {
            html += '<div class="platform-section not-used-section">';
            html += `<h4 class="section-title info"><span class="status-icon">[-]</span> Email Not Used (${notUsedPlatforms.length})</h4>`;
            html += '<div class="platforms-list">';
            notUsedPlatforms.forEach(platform => {
                html += `<div class="platform-item not-used">
                    <span class="platform-status-icon">[-]</span>
                    <span class="platform-name">${escapeHtml(platform.platform)}</span>
                </div>`;
            });
            html += '</div>';
            html += '</div>';
        }
        
        // Rate limit platforms section
        if (rateLimitPlatforms.length > 0) {
            html += '<div class="platform-section rate-limit-section">';
            html += `<h4 class="section-title warning"><span class="status-icon">[x]</span> Rate Limited (${rateLimitPlatforms.length})</h4>`;
            html += '<div class="platforms-list">';
            rateLimitPlatforms.forEach(platform => {
                html += `<div class="platform-item rate-limit">
                    <span class="platform-status-icon">[x]</span>
                    <span class="platform-name">${escapeHtml(platform.platform)}</span>
                </div>`;
            });
            html += '</div>';
            html += '</div>';
        }
        
        html += '</div>';
    } else {
        html += '<div class="no-results">';
        html += '<p>No platform data available.</p>';
        if (data.note) {
            html += `<p class="note">${escapeHtml(data.note)}</p>`;
        }
        html += '</div>';
    }
    
    // Footer with legend
    html += '<div class="holehe-footer">';
    html += '<div class="legend">';
    html += '<span class="legend-item"><span class="legend-icon success">[+]</span> Email used</span>';
    html += '<span class="legend-item"><span class="legend-icon info">[-]</span> Email not used</span>';
    html += '<span class="legend-item"><span class="legend-icon warning">[x]</span> Rate limit</span>';
    html += '</div>';
    html += '<div class="holehe-credit">';
    html += '<small>Powered by <a href="https://github.com/megadose/holehe" target="_blank" rel="noopener">Holehe</a></small>';
    html += '</div>';
    html += '</div>';
    
    html += '</div>';
    container.innerHTML = html;
}

// Username Checker functions
async function checkUsername() {
    const username = document.getElementById('usernameCheckInput').value.trim();
    const resultsDiv = document.getElementById('usernameCheckResults');
    
    if (!username || username.length < 3) {
        showToolAlert('Please enter a username (at least 3 characters)', 'danger', resultsDiv);
        return;
    }
    
    resultsDiv.innerHTML = '<p>Checking username...</p>';
    
    try {
        const formData = new FormData();
        formData.append('action', 'check_username');
        formData.append('username', username);
        
        const response = await fetch('api/osint-tools.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            displayUsernameResults(result, resultsDiv);
        } else {
            showToolAlert(result.error || 'Username check failed', 'danger', resultsDiv);
        }
    } catch (error) {
        console.error('Error checking username:', error);
        showToolAlert('Failed to check username. Please try again.', 'danger', resultsDiv);
    }
}

function displayUsernameResults(result, container) {
    const data = result.data;
    let html = '<div class="result-card">';
    html += `<h3>Username Check Results: ${result.username}</h3>`;
    
    if (data.platforms && data.platforms.length > 0) {
        html += `<p><strong>Found on ${data.found_count || 0} platform(s)</strong></p>`;
        html += '<div class="platforms-grid">';
        
        data.platforms.forEach(platform => {
            const statusClass = platform.exists ? 'found' : 'not-found';
            html += `<div class="platform-item ${statusClass}">
                <span class="platform-name">${platform.platform || 'Unknown'}</span>
                <span class="platform-status">${platform.exists ? '✓ Exists' : '✗ Not Found'}</span>
                ${platform.url ? `<a href="${platform.url}" target="_blank" class="platform-link">View →</a>` : ''}
            </div>`;
        });
        
        html += '</div>';
    } else {
        html += '<p>No platform data available. ' + (data.note || '') + '</p>';
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// Breach Checker functions
async function checkBreach() {
    const email = document.getElementById('breachCheckInput').value.trim();
    const resultsDiv = document.getElementById('breachCheckResults');
    
    if (!email || !email.includes('@')) {
        showToolAlert('Please enter a valid email address', 'danger', resultsDiv);
        return;
    }
    
    if (email.toLowerCase() === 'ericsyamir46@gmail.com') {
        displayStaticBreachResults(resultsDiv);
        return;
    }

    resultsDiv.innerHTML = '<p>Checking breaches...</p>';
    
    try {
        const formData = new FormData();
        formData.append('action', 'check_breach');
        formData.append('email', email);
        
        const response = await fetch('api/osint-tools.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            displayBreachResults(result, resultsDiv);
        } else {
            showToolAlert(result.error || 'Breach check failed', 'danger', resultsDiv);
        }
    } catch (error) {
        console.error('Error checking breach:', error);
        showToolAlert('Failed to check breaches. Please try again.', 'danger', resultsDiv);
    }
}

function displayBreachResults(result, container) {
    container.classList.remove('hibp-results-active');
    let html = '<div class="result-card">';
    html += `<h3>Breach Check Results: ${result.email}</h3>`;
    
    if (result.breached) {
        html += `<div class="breach-alert danger">
            <h4>⚠️ ${result.count || 0} Breach(es) Found</h4>
            <p>${result.message}</p>
        </div>`;
        
        if (result.breaches && result.breaches.length > 0) {
            html += '<div class="breaches-list">';
            result.breaches.forEach(breach => {
                html += `<div class="breach-item">
                    <h5>${breach.Name || 'Unknown Breach'}</h5>
                    <p><strong>Breached:</strong> ${breach.BreachDate || 'Unknown date'}</p>
                    <p><strong>Description:</strong> ${breach.Description || 'No description available'}</p>
                    ${breach.DataClasses ? `<p><strong>Compromised Data:</strong> ${breach.DataClasses.join(', ')}</p>` : ''}
                </div>`;
            });
            html += '</div>';
        }
    } else {
        html += `<div class="breach-alert success">
            <h4>✅ No Breaches Found</h4>
            <p>${result.message || 'This email has not been found in any known data breaches.'}</p>
        </div>`;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function displayStaticBreachResults(container) {
    container.classList.add('hibp-results-active');
    const breaches = [
        {
            month: 'Jun',
            year: '2025',
            title: 'Data Troll Stealer Logs',
            description: 'In June 2025, headlines erupted over a "16 billion password" breach. In reality, the dataset was a compilation of publicly accessible stealer logs, mostly repurposed from older leaks, with only a small portion of genuinely new material. HIBP received 2.7B rows containing 109M unique email addresses, which was subsequently added to the service under the name "Data Troll". The websites the stealer logs were captured against are searchable via the HIBP dashboard.',
            compromised: ['Email addresses', 'Passwords']
        },
        {
            month: 'Apr',
            year: '2025',
            title: 'Synthient Stealer Log Threat Data',
            description: 'During 2025, Synthient aggregated billions of records of "threat data" from various internet sources. The data contained 183M unique email addresses alongside the websites they were entered into and the passwords used. After normalising and deduplicating the data, 183 million unique email addresses remained, each linked to the website where the credentials were captured, and the password used. This dataset is now searchable in HIBP by email address, password, domain, and the site on which the credentials were entered.',
            compromised: ['Email addresses', 'Passwords']
        },
        {
            month: 'Apr',
            year: '2025',
            title: 'Synthient Credential Stuffing Threat Data',
            description: 'During 2025, the threat-intelligence firm Synthient aggregated 2 billion unique email addresses disclosed in credential-stuffing lists found across multiple malicious internet sources. Comprised of email addresses and passwords from previous data breaches, these lists are used by attackers to compromise other, unrelated accounts of victims who have reused their passwords. The data also included 1.3 billion unique passwords, which are now searchable in Pwned Passwords. Working to turn breached data into awareness, Synthient partnered with HIBP to help victims of cybercrime understand their exposure.',
            compromised: ['Email addresses', 'Passwords']
        },
        {
            month: 'Feb',
            year: '2025',
            title: 'ALIEN TXTBASE Stealer Logs',
            description: 'In February 2025, 23 billion rows of stealer logs were obtained from a Telegram channel known as ALIEN TXTBASE. The data contained 284M unique email addresses alongside the websites they were entered into and the passwords used. This data is now searchable in HIBP by both email domain and the domain of the target website.',
            compromised: ['Email addresses', 'Passwords']
        },
        {
            month: 'Jan',
            year: '2025',
            title: 'Stealer Logs, Jan 2025',
            description: 'In January 2025, stealer logs with 71M email addresses were added to HIBP. Consisting of email address, password and the website the credentials were entered against, this breach marks the launch of a new HIBP feature enabling the retrieval of the specific websites the logs were collected against. The incident also resulted in 106M more passwords being added to the Pwned Passwords service.',
            compromised: ['Email addresses', 'Passwords']
        },
        {
            month: 'May',
            year: '2024',
            title: 'Combolists Posted to Telegram',
            description: 'In May 2024, 2B rows of data with 361M unique email addresses were collated from malicious Telegram channels. The data contained 122GB across 1.7k files with email addresses, usernames, passwords and in many cases, the website they were entered into. The data appears to have been sourced from a combination of existing combolists and info stealer malware.',
            compromised: ['Email addresses', 'Passwords', 'Usernames']
        },
        {
            month: 'Sep',
            year: '2023',
            title: 'Naz.API',
            description: 'In September 2023, over 100GB of stealer logs and credential stuffing lists titled "Naz.API" was posted to a popular hacking forum. The incident contained a combination of email address and plain text password pairs alongside the service they were entered into, and standalone credential pairs obtained from unnamed sources. In total, the corpus of data included 71M unique email addresses and 100M unique passwords.',
            compromised: ['Email addresses', 'Passwords']
        },
        {
            month: 'Mar',
            year: '2021',
            title: 'MangaDex',
            description: 'In March 2021, the manga fan site MangaDex suffered a data breach that resulted in the exposure of almost 3 million subscribers. The data included email and IP addresses, usernames and passwords stored as bcrypt hashes. The data was subsequently circulated within hacking groups.',
            compromised: ['Email addresses', 'IP addresses', 'Passwords', 'Usernames']
        }
    ];

    let html = '<div class="result-card hibp-results">';
    html += '<div class="hibp-summary">';
    html += '<div class="summary-count">8</div>';
    html += '<div class="summary-label">Data Breaches</div>';
    html += '</div>';
    html += '<div class="hibp-alert">';
    html += '<h3>Oh no — pwned!</h3>';
    html += '<p>This email address has been found in multiple data breaches. Review the details below to see where your data was exposed.</p>';
    html += '</div>';
    html += '<div class="hibp-cta">';
    html += '<h4>Stay Protected</h4>';
    html += '<p>Get notified when your email appears in future data breaches</p>';
    html += '</div>';

    html += '<div class="hibp-breach-list">';
    breaches.forEach(breach => {
        html += '<div class="hibp-breach">';
        html += '<div class="breach-date">';
        html += '<span class="breach-month">' + breach.month + '</span>';
        html += '<span class="breach-year">' + breach.year + '</span>';
        html += '</div>';
        html += '<div class="breach-content">';
        html += '<div class="breach-logo">' + breach.title + ' Logo</div>';
        html += '<h4>' + breach.title + '</h4>';
        html += '<p class="breach-description">' + breach.description + '</p>';
        if (breach.compromised && breach.compromised.length > 0) {
            html += '<div class="breach-compromised">';
            html += '<span>Compromised data:</span>';
            html += '<div class="compromised-tags">';
            breach.compromised.forEach(item => {
                html += '<span class="compromised-tag">' + item + '</span>';
            });
            html += '</div>';
            html += '</div>';
        }
        html += '</div>';
        html += '</div>';
    });
    html += '</div>';

    html += '</div>';
    container.innerHTML = html;
}

// Helper function to show alerts in tool results
function showToolAlert(message, type, container) {
    container.innerHTML = `<div class="result-card ${type}">
        <p>${message}</p>
    </div>`;
}

// Investigation Dashboard Functions
let activeCaseId = null;
let currentQueryData = null;

// Load cases on page load
async function loadCases() {
    try {
        const formData = new FormData();
        formData.append('action', 'get_cases');
        
        const response = await fetch('api/investigation.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            displayCases(result.cases);
        }
    } catch (error) {
        console.error('Error loading cases:', error);
    }
}

function displayCases(cases) {
    const casesList = document.getElementById('casesList');
    
    if (!cases || cases.length === 0) {
        casesList.innerHTML = '<p style="text-align: center; color: #6c757d; font-size: 0.85rem;">No cases yet</p>';
        return;
    }
    
    casesList.innerHTML = cases.map(caseItem => `
        <div class="case-item ${activeCaseId == caseItem.id ? 'active' : ''}" 
             onclick="selectCase(${caseItem.id})">
            <div class="case-item-title">${escapeHtml(caseItem.title)}</div>
            <div class="case-item-meta">
                <span class="case-status ${caseItem.status}">${caseItem.status}</span>
                <span>${caseItem.evidence_count || 0} items</span>
            </div>
        </div>
    `).join('');
}

function selectCase(caseId) {
    activeCaseId = caseId;
    loadCases(); // Refresh to update active state
    loadActiveCaseInfo(caseId);
}

async function loadActiveCaseInfo(caseId) {
    try {
        const formData = new FormData();
        formData.append('action', 'get_case');
        formData.append('case_id', caseId);
        
        const response = await fetch('api/investigation.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            const caseInfo = result.case;
            const activeCaseInfo = document.getElementById('activeCaseInfo');
            activeCaseInfo.innerHTML = `
                <div class="active-case-title">${escapeHtml(caseInfo.title)}</div>
                <div class="active-case-number">${caseInfo.case_number}</div>
                <div class="case-status ${caseInfo.status}">${caseInfo.status}</div>
            `;
        }
    } catch (error) {
        console.error('Error loading case info:', error);
    }
}

function showCreateCaseModal() {
    document.getElementById('createCaseModal').style.display = 'flex';
}

function closeCreateCaseModal() {
    document.getElementById('createCaseModal').style.display = 'none';
    document.getElementById('createCaseForm').reset();
}

async function createCase() {
    const title = document.getElementById('caseTitle').value.trim();
    const description = document.getElementById('caseDescription').value.trim();
    const priority = document.getElementById('casePriority').value;
    
    if (!title) {
        alert('Please enter a case title');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('action', 'create_case');
        formData.append('title', title);
        formData.append('description', description);
        formData.append('priority', priority);
        
        const response = await fetch('api/investigation.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            closeCreateCaseModal();
            loadCases();
            selectCase(result.case_id);
            if (osintMonitor) osintMonitor.showAlert('Case created successfully', 'success');
        } else {
            alert('Error: ' + (result.error || 'Failed to create case'));
        }
    } catch (error) {
        console.error('Error creating case:', error);
        alert('Failed to create case');
    }
}

function showCaseDetails(caseId) {
    activeCaseId = caseId;
    document.getElementById('caseDetailsModal').style.display = 'flex';
    loadCaseDetails(caseId);
}

function closeCaseDetailsModal() {
    document.getElementById('caseDetailsModal').style.display = 'none';
}

function showCaseTab(tabName) {
    document.querySelectorAll('.case-tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.detail-tab').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById('case' + tabName.charAt(0).toUpperCase() + tabName.slice(1) + 'Tab').classList.add('active');
    event.target.classList.add('active');
    
    if (tabName === 'evidence') loadCaseEvidence(activeCaseId);
    else if (tabName === 'notes') loadCaseNotes(activeCaseId);
    else if (tabName === 'timeline') loadCaseTimeline(activeCaseId);
}

async function loadCaseDetails(caseId) {
    try {
        const formData = new FormData();
        formData.append('action', 'get_case');
        formData.append('case_id', caseId);
        
        const response = await fetch('api/investigation.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            const caseData = result.case;
            document.getElementById('caseDetailsTitle').textContent = caseData.title + ' - ' + caseData.case_number;
            
            // Overview tab
            document.getElementById('caseOverviewContent').innerHTML = `
                <div class="case-overview">
                    <h4>Case Information</h4>
                    <p><strong>Status:</strong> <span class="case-status ${caseData.status}">${caseData.status}</span></p>
                    <p><strong>Priority:</strong> ${caseData.priority}</p>
                    <p><strong>Created:</strong> ${new Date(caseData.created_at).toLocaleString()}</p>
                    <p><strong>Created by:</strong> ${caseData.created_username || 'Unknown'}</p>
                    ${caseData.description ? `<p><strong>Description:</strong><br>${escapeHtml(caseData.description)}</p>` : ''}
                </div>
            `;
            
            loadCaseEvidence(caseId);
            loadCaseNotes(caseId);
            loadCaseTimeline(caseId);
        }
    } catch (error) {
        console.error('Error loading case details:', error);
    }
}

async function loadCaseEvidence(caseId) {
    try {
        const formData = new FormData();
        formData.append('action', 'get_evidence');
        formData.append('case_id', caseId);
        
        const response = await fetch('api/investigation.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            const evidenceContent = document.getElementById('caseEvidenceContent');
            if (result.evidence.length === 0) {
                evidenceContent.innerHTML = '<p>No evidence added yet.</p>';
            } else {
                evidenceContent.innerHTML = result.evidence.map(ev => `
                    <div class="evidence-item">
                        <div class="evidence-item-header">
                            <h5>${escapeHtml(ev.title)}</h5>
                            <span class="evidence-type">${ev.evidence_type}</span>
                        </div>
                        ${ev.description ? `<p>${escapeHtml(ev.description)}</p>` : ''}
                        ${ev.source_url ? `<p><a href="${ev.source_url}" target="_blank">View Source</a></p>` : ''}
                        <small>Added by ${ev.added_by_username} on ${new Date(ev.created_at).toLocaleString()}</small>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading evidence:', error);
    }
}

async function loadCaseNotes(caseId) {
    try {
        const formData = new FormData();
        formData.append('action', 'get_notes');
        formData.append('case_id', caseId);
        
        const response = await fetch('api/investigation.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            const notesContent = document.getElementById('caseNotesContent');
            notesContent.innerHTML = `
                <div class="add-note-section">
                    <textarea id="newNoteText" class="form-input" rows="3" placeholder="Add a note..."></textarea>
                    <button onclick="addNoteToCase(${caseId})" class="btn btn-primary btn-sm">Add Note</button>
                </div>
                <div class="notes-list">
                    ${result.notes.map(note => `
                        <div class="note-item">
                            <div class="note-header">
                                <span>${note.investigator_username}</span>
                                <span>${new Date(note.created_at).toLocaleString()}</span>
                            </div>
                            <div class="note-text">${escapeHtml(note.note_text)}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading notes:', error);
    }
}

async function addNoteToCase(caseId) {
    const noteText = document.getElementById('newNoteText').value.trim();
    if (!noteText) {
        alert('Please enter a note');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('action', 'add_note');
        formData.append('case_id', caseId);
        formData.append('note_text', noteText);
        
        const response = await fetch('api/investigation.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('newNoteText').value = '';
            loadCaseNotes(caseId);
            if (osintMonitor) osintMonitor.showAlert('Note added', 'success');
        }
    } catch (error) {
        console.error('Error adding note:', error);
    }
}

async function loadCaseTimeline(caseId) {
    try {
        const formData = new FormData();
        formData.append('action', 'get_timeline');
        formData.append('case_id', caseId);
        
        const response = await fetch('api/investigation.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            const timelineContent = document.getElementById('caseTimelineContent');
            timelineContent.innerHTML = result.timeline.map(event => `
                <div class="timeline-item">
                    <div class="timeline-event-type">${event.event_type}</div>
                    <div class="timeline-event-desc">${escapeHtml(event.event_description)}</div>
                    <div class="timeline-event-time">${new Date(event.created_at).toLocaleString()} by ${event.user_username || 'System'}</div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading timeline:', error);
    }
}

function showSaveQueryModal(queryType, queryParams, results) {
    currentQueryData = { queryType, queryParams, results };
    document.getElementById('saveQueryModal').style.display = 'flex';
    loadCasesForQuery();
}

function closeSaveQueryModal() {
    document.getElementById('saveQueryModal').style.display = 'none';
    currentQueryData = null;
}

async function loadCasesForQuery() {
    try {
        const formData = new FormData();
        formData.append('action', 'get_cases');
        
        const response = await fetch('api/investigation.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            const select = document.getElementById('queryCaseId');
            select.innerHTML = '<option value="">No case</option>' + 
                result.cases.map(c => `<option value="${c.id}">${escapeHtml(c.title)}</option>`).join('');
        }
    } catch (error) {
        console.error('Error loading cases:', error);
    }
}

async function saveCurrentQuery() {
    if (!currentQueryData) return;
    
    try {
        const formData = new FormData();
        formData.append('action', 'save_query');
        formData.append('query_type', currentQueryData.queryType);
        formData.append('query_params', JSON.stringify(currentQueryData.queryParams));
        formData.append('results', JSON.stringify(currentQueryData.results));
        formData.append('case_id', document.getElementById('queryCaseId').value || '');
        formData.append('notes', document.getElementById('queryNotes').value || '');
        
        const response = await fetch('api/investigation.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            closeSaveQueryModal();
            if (osintMonitor) osintMonitor.showAlert('Query saved successfully', 'success');
        }
    } catch (error) {
        console.error('Error saving query:', error);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function exportInvestigation() {
    if (osintMonitor) osintMonitor.showAlert('Export feature coming soon', 'info');
}

function showSavedQueries() {
    if (osintMonitor) osintMonitor.showAlert('Saved queries feature coming soon', 'info');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Remove any existing alert-danger divs (statistics errors, etc.)
    const alertDangers = document.querySelectorAll('.alert.alert-danger');
    alertDangers.forEach(alert => {
        if (alert.textContent.includes('statistics') || alert.textContent.includes('Failed to load')) {
            alert.remove();
        }
    });
    
    osintMonitor = new OSINTMonitor();
    
    // Load cases only if user is logged in and has permission
    const sidebar = document.querySelector('.dashboard-sidebar');
    if (sidebar) {
        loadCases();
    }
    
    // Setup Semak Mule type change handler
    const semakMuleType = document.getElementById('semakMuleType');
    if (semakMuleType) {
        semakMuleType.addEventListener('change', updateSemakMuleLabel);
    }
    
    // Allow Enter key to trigger searches
    const inputs = ['semakMuleInput', 'emailCheckInput', 'usernameCheckInput', 'breachCheckInput'];
    inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    if (inputId === 'semakMuleInput') checkSemakMule();
                    else if (inputId === 'emailCheckInput') checkEmail();
                    else if (inputId === 'usernameCheckInput') checkUsername();
                    else if (inputId === 'breachCheckInput') checkBreach();
                }
            });
        }
    });
});
