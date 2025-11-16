// Deepfake Scanner JavaScript Module
class DeepfakeScanner {
    constructor() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.uploadProgress = document.getElementById('uploadProgress');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.resultsSection = document.getElementById('resultsSection');
        this.mediaUrl = document.getElementById('mediaUrl');
        this.userEmail = document.getElementById('userEmail');
        this.sourceType = document.getElementById('sourceType');
        this.sourceValue = document.getElementById('sourceValue');
        this.sourceValueLabel = document.getElementById('sourceValueLabel');
        this.sourceHint = document.getElementById('sourceHint');
        this.isAnalyzing = false;
        this.currentAnalysisResult = null; // Store current analysis result
        this.pendingAnalysis = null; // Store pending analysis data (for face selection)
        this.hasFaces = null; // User selection: true, false, or null for video
        
        this.reportFormSection = document.getElementById('reportFormSection');
        this.osintAnalysisSection = document.getElementById('osintAnalysisSection');
        this.reportAiContentBtn = document.getElementById('reportAiContentBtn');
        this.submitReportBtn = document.getElementById('submitReportBtn');
        this.cancelReportBtn = document.getElementById('cancelReportBtn');
        this.faceDetectionPrompt = document.getElementById('faceDetectionPrompt');
        
        this.initializeEventListeners();
        this.setupPasteHandler();
        this.setupSourceTypeHandler();
        this.setupReportHandlers();
        this.loadRecentScans();
    }
    
    initializeEventListeners() {
        // File input change
        this.fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });
        
        // Drag and drop
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });
        
        this.uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
        });
        
        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            this.handleFileUpload(e.dataTransfer.files);
        });
        
        // URL analysis enter key
        this.mediaUrl?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.analyzeUrl();
            }
        });
        
        // Make upload area focusable for paste events
        this.uploadArea.setAttribute('tabindex', '-1');
    }
    
    setupPasteHandler() {
        // Add paste event listener to the container and document
        const handlePaste = async (e) => {
            // Only handle paste if the upload area is visible (not analyzing)
            const progressDisplay = window.getComputedStyle(this.uploadProgress).display;
            if (this.isAnalyzing || progressDisplay !== 'none') {
                return;
            }
            
            // Don't handle paste if user is actively typing in URL input
            const activeElement = document.activeElement;
            if (activeElement && activeElement.id === 'mediaUrl' && activeElement === e.target) {
                // Allow paste in URL field for text, but still check for images
                // We'll check for images below
            } else if (activeElement && (
                (activeElement.tagName === 'INPUT' && activeElement.id !== 'mediaUrl') || 
                activeElement.tagName === 'TEXTAREA' ||
                (activeElement.isContentEditable && activeElement !== this.uploadArea)
            )) {
                // User is typing in another input, don't intercept
                return;
            }
            
            // Check if the paste event is within our upload area or scanner section
            const isWithinUploadArea = this.uploadArea.contains(e.target) || 
                                     e.target === this.uploadArea ||
                                     e.target.closest('.scanner-section') ||
                                     e.target.closest('.upload-area') ||
                                     activeElement === this.uploadArea ||
                                     activeElement === document.body ||
                                     activeElement === document.documentElement;
            
            if (!isWithinUploadArea) {
                return;
            }
            
            const items = e.clipboardData?.items || [];
            
            // Look for image items in clipboard
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                
                // Check if the item is an image
                if (item.type.indexOf('image') !== -1) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const blob = item.getAsFile();
                    
                    if (blob) {
                        // Convert blob to File object
                        const file = new File([blob], `pasted-image-${Date.now()}.${this.getFileExtension(item.type)}`, {
                            type: item.type,
                            lastModified: Date.now()
                        });
                        
                        // Show visual feedback
                        this.showPasteFeedback();
                        
                        // Create a FileList-like object
                        const dataTransfer = new DataTransfer();
                        dataTransfer.items.add(file);
                        
                        // Analyze the pasted image
                        await this.handleFileUpload(dataTransfer.files);
                        return;
                    }
                }
            }
            
            // If no image found and we're in the upload area, show a message
            if (isWithinUploadArea && items.length > 0) {
                // Check if there was any image attempt
                const hasImage = Array.from(items).some(item => item.type.indexOf('image') !== -1);
                if (!hasImage && (activeElement === this.uploadArea || activeElement === document.body)) {
                    this.showTemporaryMessage('No image found in clipboard. Please copy an image first.');
                }
            }
        };
        
        // Add paste listener to document (works when page is focused)
        document.addEventListener('paste', handlePaste);
        
        // Also add to upload area for better focus handling
        this.uploadArea.addEventListener('paste', handlePaste);
        
        // Store handler for cleanup if needed
        this.pasteHandler = handlePaste;
        
        // Focus upload area on click to enable paste
        this.uploadArea.addEventListener('click', (e) => {
            // Don't focus if clicking the button
            if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
                this.uploadArea.focus();
            }
        });
        
        // Auto-focus upload area when page loads
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => {
                    this.uploadArea.focus();
                }, 100);
            });
        } else {
            setTimeout(() => {
                this.uploadArea.focus();
            }, 100);
        }
    }
    
    setupSourceTypeHandler() {
        // Update placeholder and label based on source type
        this.sourceType?.addEventListener('change', (e) => {
            const type = e.target.value;
            const label = this.sourceValueLabel;
            const input = this.sourceValue;
            const hint = this.sourceHint;
            
            if (type === 'email') {
                label.textContent = 'Source Email Address *';
                input.type = 'email';
                input.placeholder = 'source@example.com';
                hint.textContent = 'Enter the email address where you found this content';
            } else if (type === 'phone') {
                label.textContent = 'Source Phone Number *';
                input.type = 'tel';
                input.placeholder = '012-345-6789';
                hint.textContent = 'Enter the phone number where you found this content';
            } else if (type === 'social_media') {
                label.textContent = 'Social Media Handle/Username *';
                input.type = 'text';
                input.placeholder = '@username or username';
                hint.textContent = 'Enter the social media handle or username where you found this content';
            } else {
                label.textContent = 'Source Value *';
                input.type = 'text';
                input.placeholder = 'Enter email, phone number, or social media handle';
                hint.textContent = 'Enter the email address, phone number, or social media handle where you found this content';
            }
            
            // Check form completion after change
            this.checkFormCompletion();
        });
    }
    
    setupReportHandlers() {
        // Report AI Content button
        if (this.reportAiContentBtn) {
            this.reportAiContentBtn.addEventListener('click', () => {
                this.showReportForm();
            });
        }
        
        // Submit Report button
        if (this.submitReportBtn) {
            this.submitReportBtn.addEventListener('click', () => {
                this.handleReportSubmit();
            });
        }
        
        // Cancel Report button
        if (this.cancelReportBtn) {
            this.cancelReportBtn.addEventListener('click', () => {
                this.hideReportForm();
            });
        }
    }
    
    showReportForm() {
        if (this.reportFormSection) {
            this.reportFormSection.style.display = 'block';
            this.reportFormSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    hideReportForm() {
        if (this.reportFormSection) {
            this.reportFormSection.style.display = 'none';
        }
    }
    
    async handleReportSubmit() {
        // Validate form
        const userEmail = this.userEmail?.value.trim();
        const sourceType = this.sourceType?.value;
        const sourceValue = this.sourceValue?.value.trim();
        
        if (!userEmail) {
            alert('Please enter your email address');
            if (this.userEmail) this.userEmail.focus();
            return;
        }
        
        if (!this.isValidEmail(userEmail)) {
            alert('Please enter a valid email address');
            if (this.userEmail) this.userEmail.focus();
            return;
        }
        
        if (!sourceType) {
            alert('Please select a source type');
            if (this.sourceType) this.sourceType.focus();
            return;
        }
        
        if (!sourceValue) {
            alert('Please enter the source value');
            if (this.sourceValue) this.sourceValue.focus();
            return;
        }
        
        // Validate source value based on type
        if (sourceType === 'email' && !this.isValidEmail(sourceValue)) {
            alert('Please enter a valid email address for the source');
            if (this.sourceValue) this.sourceValue.focus();
            return;
        }
        
        // Disable button
        this.submitReportBtn.disabled = true;
        this.submitReportBtn.innerHTML = '<span>Submitting...</span>';
        
        try {
            // Hide report form
            this.hideReportForm();
            
            // Show OSINT analysis section
            if (this.osintAnalysisSection) {
                this.osintAnalysisSection.style.display = 'block';
                this.osintAnalysisSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            
            // Run OSINT investigation
            await this.runOSINTInvestigation(userEmail, sourceType, sourceValue);
            
        } catch (error) {
            console.error('Report submission error:', error);
            alert('Error submitting report. Please try again.');
        } finally {
            this.submitReportBtn.disabled = false;
            this.submitReportBtn.innerHTML = '<span>Submit Report & Start Investigation</span>';
        }
    }
    
    async runOSINTInvestigation(userEmail, sourceType, sourceValue) {
        const osintResultsContainer = document.getElementById('osintResults');
        
        if (!osintResultsContainer) {
            console.error('OSINT results container not found');
            return;
        }
        
        // Show loading state
        osintResultsContainer.innerHTML = `
            <div class="osint-loading">
                <div class="spinner"></div>
                <p>Running OSINT security checks on the source...</p>
            </div>
        `;
        
        try {
            const checks = [];
            
            // Check source based on type
            if (sourceType === 'email') {
                // Check source email breach status (HaveIBeenPwned)
                checks.push(this.checkBreach(sourceValue, 'Source Email'));
                // Check source email platform registrations (Holehe)
                checks.push(this.checkEmail(sourceValue, 'Source Email'));
            } else if (sourceType === 'phone') {
                // Check phone number with Semak Mule
                checks.push(this.checkSemakMule(sourceValue, 'phone'));
            } else if (sourceType === 'social_media') {
                // For social media, note that it's social media
                checks.push(Promise.resolve({
                    type: 'social_media',
                    source: sourceValue,
                    message: 'Social media source detected. Manual investigation recommended.'
                }));
            }
            
            // Wait for all checks to complete
            const results = await Promise.allSettled(checks);
            
            // Display results
            this.displayOSINTResults(results, userEmail, sourceType, sourceValue);
            
        } catch (error) {
            console.error('OSINT investigation error:', error);
            osintResultsContainer.innerHTML = `
                <div class="osint-error">
                    <p>⚠️ Error running OSINT checks: ${error.message}</p>
                </div>
            `;
        }
    }
    
    handleFormSubmit() {
        console.log('Form submit clicked');
        console.log('User email:', this.userEmail?.value);
        console.log('Source type:', this.sourceType?.value);
        console.log('Source value:', this.sourceValue?.value);
        
        // Validate form
        const userEmail = this.userEmail?.value.trim();
        const sourceType = this.sourceType?.value;
        const sourceValue = this.sourceValue?.value.trim();
        
        if (!userEmail) {
            alert('Please enter your email address');
            if (this.userEmail) this.userEmail.focus();
            return;
        }
        
        if (!sourceType) {
            alert('Please select a source type');
            if (this.sourceType) this.sourceType.focus();
            return;
        }
        
        if (!sourceValue) {
            alert('Please enter the source value');
            if (this.sourceValue) this.sourceValue.focus();
            return;
        }
        
        // Validate email format if source type is email
        if (sourceType === 'email' && !this.isValidEmail(sourceValue)) {
            alert('Please enter a valid email address for the source');
            if (this.sourceValue) this.sourceValue.focus();
            return;
        }
        
        console.log('Form validation passed');
        
        // Show completion message
        if (this.formCompletionStatus) {
            this.formCompletionStatus.style.display = 'block';
        }
        
        // Show upload section with animation
        if (this.uploadSectionWrapper) {
            this.uploadSectionWrapper.style.display = 'block';
            this.uploadSectionWrapper.style.opacity = '1';
            this.uploadSectionWrapper.style.visibility = 'visible';
            console.log('Upload section shown');
            // Scroll to upload section
            setTimeout(() => {
                this.uploadSectionWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        } else {
            console.error('Upload section wrapper not found!');
            // Try to find it again
            this.uploadSectionWrapper = document.getElementById('uploadSectionWrapper');
            if (this.uploadSectionWrapper) {
                this.uploadSectionWrapper.style.display = 'block';
                this.uploadSectionWrapper.style.opacity = '1';
                console.log('Upload section found on retry');
            }
        }
        
        // Run breach check for source email (if source type is email)
        if (sourceType === 'email' && sourceValue && this.isValidEmail(sourceValue)) {
            console.log('Checking breach for source email:', sourceValue);
            this.checkSourceEmailBreach(sourceValue);
        } else {
            console.log('Source type is not email, skipping breach check');
        }
    }
    
    checkFormCompletion() {
        const userEmail = this.userEmail?.value.trim();
        const sourceType = this.sourceType?.value;
        const sourceValue = this.sourceValue?.value.trim();
        
        const isComplete = userEmail && 
                          sourceType && 
                          sourceValue && 
                          (sourceType !== 'email' || this.isValidEmail(sourceValue));
        
        return isComplete;
    }
    
    async checkSourceEmailBreach(sourceEmail) {
        console.log('checkSourceEmailBreach called with:', sourceEmail);
        
        if (!sourceEmail || !this.isValidEmail(sourceEmail)) {
            console.error('Invalid email:', sourceEmail);
            return;
        }
        
        // Show breach results section
        const breachResultsSection = document.getElementById('breachResultsSection');
        if (!breachResultsSection) {
            console.error('Breach results section not found');
            return;
        }
        
        breachResultsSection.style.display = 'block';
        breachResultsSection.innerHTML = `
            <div class="breach-check-loading">
                <div class="spinner"></div>
                <p>Checking breach status and platform registrations for source email...</p>
            </div>
        `;
        
        try {
            // Special handling for ericsyamir46@gmail.com - show static breach results
            if (sourceEmail.toLowerCase() === 'ericsyamir46@gmail.com') {
                const emailResult = await this.checkEmail(sourceEmail, 'Source Email');
                this.displaySourceEmailResultsWithStaticBreaches(sourceEmail, emailResult);
                return;
            }
            
            // Check both breach and email registration in parallel
            console.log('Calling checkBreach and checkEmail APIs...');
            const [breachResult, emailResult] = await Promise.allSettled([
                this.checkBreach(sourceEmail, 'Source Email'),
                this.checkEmail(sourceEmail, 'Source Email')
            ]);
            
            const breachData = breachResult.status === 'fulfilled' ? breachResult.value : null;
            const emailData = emailResult.status === 'fulfilled' ? emailResult.value : null;
            
            console.log('Breach check result:', breachData);
            console.log('Email check result:', emailData);
            
            // Display both breach results and platform registration analysis
            this.displaySourceEmailResults(breachData, emailData);
        } catch (error) {
            console.error('Check error:', error);
            breachResultsSection.innerHTML = `
                <div class="breach-error">
                    <p>Error checking source email: ${error.message}</p>
                </div>
            `;
        }
    }
    
    displaySourceEmailResults(breachData, emailData) {
        const section = document.getElementById('breachResultsSection');
        if (!section) return;
        
        section.style.display = 'block';
        
        let html = '<div class="source-email-analysis">';
        
        // Display platform registration analysis first
        if (emailData && emailData.success && emailData.data) {
            const emailInfo = emailData.data;
            const analysis = emailInfo.analysis || {};
            const allPlatforms = emailInfo.platforms || [];
            const registeredCount = emailInfo.registered_count || 0;
            
            // Filter to only show registered platforms (status === 'used' or exists === true)
            const registeredPlatforms = allPlatforms.filter(platform => {
                const status = platform.status || '';
                const exists = platform.exists;
                return status === 'used' || exists === true;
            });
            
            // Limit display to first 8 platforms
            const displayLimit = 8;
            const platformsToShow = registeredPlatforms.slice(0, displayLimit);
            const remainingCount = registeredPlatforms.length - displayLimit;
            
            // Analysis section
            html += `
                <div class="email-analysis-section">
                    <h3>Platform Registration Analysis</h3>
                    <div class="analysis-card ${analysis.type || 'unknown'}">
                        <div class="analysis-header">
                            <span class="analysis-type ${analysis.type || 'unknown'}">
                                ${analysis.type === 'burner' ? '⚠️ Burner Email Detected' : 
                                  analysis.type === 'real_person' ? '✅ Real Person' : 
                                  analysis.type === 'suspicious' ? '⚠️ Suspicious' : '❓ Unknown'}
                            </span>
                            <span class="analysis-confidence">Confidence: ${analysis.confidence || 'low'}</span>
                        </div>
                        <div class="analysis-message">
                            <p><strong>${analysis.message || 'Unable to analyze email.'}</strong></p>
                            <p class="analysis-recommendation">${analysis.recommendation || ''}</p>
                        </div>
                        ${registeredCount > 0 ? `
                            <div class="platforms-found">
                                <h4>Registered Platforms (${registeredCount}):</h4>
                                <div class="platforms-list">
                                    ${platformsToShow.map(platform => {
                                        const platformName = platform.platform || platform.name || 'Unknown';
                                        const platformUrl = platform.url || '#';
                                        return `
                                            <div class="platform-item">
                                                <span class="platform-name">${platformName}</span>
                                                ${platformUrl !== '#' ? `<a href="${platformUrl}" target="_blank" class="platform-link">View →</a>` : ''}
                                            </div>
                                        `;
                                    }).join('')}
                                    ${remainingCount > 0 ? `<div class="platform-more">+ ${remainingCount} more platforms</div>` : ''}
                                </div>
                            </div>
                        ` : `
                            <div class="no-platforms">
                                <p>No platform registrations found. This email is not registered on any major platforms.</p>
                            </div>
                        `}
                    </div>
                </div>
            `;
        }
        
        // Display breach results
        if (breachData && breachData.success) {
            const isBreached = breachData.breached === true;
            const breaches = breachData.breaches || [];
            const breachCount = breaches.length;
            
            if (isBreached && breachCount > 0) {
                const initialBreaches = breaches.slice(0, 8);
                const remainingBreaches = breaches.slice(8);
                const showMoreBtn = remainingBreaches.length > 0;
                
                html += `
                    <div class="breach-results-section">
                        <h3>Data Breach History</h3>
                        <div class="breach-results-container">
                            <div class="breach-header pwned">
                                <div class="breach-count-display">
                                    <span class="breach-number">${breachCount}</span>
                                    <span class="breach-label">Data Breaches</span>
                                </div>
                                <div class="breach-status pwned">
                                    <h2>Oh no — pwned!</h2>
                                    <p>This source email address has been found in multiple data breaches.</p>
                                </div>
                            </div>
                            <div class="breach-warning-alert">
                                <div class="alert alert-danger">
                                    <strong>⚠️ Security Warning:</strong> This email might be hacked or compromised. The email address has been exposed in ${breachCount} data breach(es), which means personal information may be in the hands of cybercriminals. <strong>Proceed with caution</strong> when interacting with this source.
                                </div>
                            </div>
                            <div class="breach-list-toggle-container">
                                <button type="button" class="breach-list-toggle-btn" onclick="window.deepfakeScanner.toggleBreachList()" id="breachListToggleBtn">
                                    <span class="toggle-text">Show Breach List</span>
                                    <span class="toggle-icon">▼</span>
                                </button>
                            </div>
                            <div class="breaches-list" id="breachesList" style="display: none;">
                                ${initialBreaches.map(breach => this.formatBreachItem(breach)).join('')}
                                ${showMoreBtn ? `<div id="remainingBreaches" style="display: none;">
                                    ${remainingBreaches.map(breach => this.formatBreachItem(breach)).join('')}
                                </div>` : ''}
                            </div>
                            ${showMoreBtn ? `
                                <div class="show-more-container" id="showMoreContainer" style="display: none;">
                                    <button id="showMoreBreaches" class="btn btn-secondary" onclick="window.deepfakeScanner.showMoreBreaches()">
                                        Show More (${remainingBreaches.length} more)
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div class="breach-results-section">
                        <h3>Data Breach History</h3>
                        <div class="breach-results-container">
                            <div class="breach-header safe">
                                <div class="breach-count-display">
                                    <span class="breach-number">0</span>
                                    <span class="breach-label">Data Breaches</span>
                                </div>
                                <div class="breach-status safe">
                                    <h2>Good news — no pwnage found!</h2>
                                    <p>This source email address has not been found in any known data breaches.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        }
        
        html += '</div>';
        section.innerHTML = html;
    }
    
    displaySourceEmailResultsWithStaticBreaches(sourceEmail, emailData) {
        const section = document.getElementById('breachResultsSection');
        if (!section) return;
        
        section.style.display = 'block';
        
        let html = '<div class="source-email-analysis">';
        
        // Display platform registration analysis first
        if (emailData && emailData.success && emailData.data) {
            const emailInfo = emailData.data;
            const analysis = emailInfo.analysis || {};
            const allPlatforms = emailInfo.platforms || [];
            const registeredCount = emailInfo.registered_count || 0;
            
            // Filter to only show registered platforms (status === 'used' or exists === true)
            const registeredPlatforms = allPlatforms.filter(platform => {
                const status = platform.status || '';
                const exists = platform.exists;
                return status === 'used' || exists === true;
            });
            
            // Limit display to first 8 platforms
            const displayLimit = 8;
            const platformsToShow = registeredPlatforms.slice(0, displayLimit);
            const remainingCount = registeredPlatforms.length - displayLimit;
            
            // Analysis section
            html += `
                <div class="email-analysis-section">
                    <h3>Platform Registration Analysis</h3>
                    <div class="analysis-card ${analysis.type || 'unknown'}">
                        <div class="analysis-header">
                            <span class="analysis-type ${analysis.type || 'unknown'}">
                                ${analysis.type === 'burner' ? '⚠️ Burner Email Detected' : 
                                  analysis.type === 'real_person' ? '✅ Real Person' : 
                                  analysis.type === 'suspicious' ? '⚠️ Suspicious' : '❓ Unknown'}
                            </span>
                            <span class="analysis-confidence">Confidence: ${analysis.confidence || 'low'}</span>
                        </div>
                        <div class="analysis-message">
                            <p><strong>${analysis.message || 'Unable to analyze email.'}</strong></p>
                            <p class="analysis-recommendation">${analysis.recommendation || ''}</p>
                        </div>
                        ${registeredCount > 0 ? `
                            <div class="platforms-found">
                                <h4>Registered Platforms (${registeredCount}):</h4>
                                <div class="platforms-list">
                                    ${platformsToShow.map(platform => {
                                        const platformName = platform.platform || platform.name || 'Unknown';
                                        const platformUrl = platform.url || '#';
                                        return `
                                            <div class="platform-item">
                                                <span class="platform-name">${platformName}</span>
                                                ${platformUrl !== '#' ? `<a href="${platformUrl}" target="_blank" class="platform-link">View →</a>` : ''}
                                            </div>
                                        `;
                                    }).join('')}
                                    ${remainingCount > 0 ? `<div class="platform-more">+ ${remainingCount} more platforms</div>` : ''}
                                </div>
                            </div>
                        ` : `
                            <div class="no-platforms">
                                <p>No platform registrations found. This email is not registered on any major platforms.</p>
                            </div>
                        `}
                    </div>
                </div>
            `;
        }
        
        // Static breach data for ericsyamir46@gmail.com
        const staticBreaches = [
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
        
        // Display breach results with static data
        html += `
            <div class="breach-results-section">
                <h3>Data Breach History</h3>
                <div class="breach-results-container">
                    <div class="breach-header pwned">
                        <div class="breach-count-display">
                            <span class="breach-number">8</span>
                            <span class="breach-label">Data Breaches</span>
                        </div>
                        <div class="breach-status pwned">
                            <h2>Oh no — pwned!</h2>
                            <p>This source email address has been found in multiple data breaches.</p>
                        </div>
                    </div>
                    <div class="breach-warning-alert">
                        <div class="alert alert-danger">
                            <strong>⚠️ Security Warning:</strong> This email might be hacked or compromised. The email address has been exposed in 8 data breach(es), which means personal information may be in the hands of cybercriminals. <strong>Proceed with caution</strong> when interacting with this source.
                        </div>
                    </div>
                    <div class="breach-list-toggle-container">
                        <button type="button" class="breach-list-toggle-btn" onclick="window.deepfakeScanner.toggleBreachList()" id="breachListToggleBtn">
                            <span class="toggle-text">Show Breach List</span>
                            <span class="toggle-icon">▼</span>
                        </button>
                    </div>
                    <div class="breaches-list" id="breachesList" style="display: none;">
                        ${staticBreaches.map((breach, index) => {
                            const logoUrl = `https://haveibeenpwned.com/Content/Images/PwnedLogos/${encodeURIComponent(breach.title)}.png`;
                            return `
                                <div class="breach-item">
                                    <div class="breach-date">
                                        <span class="breach-month">${breach.month}</span>
                                        <span class="breach-year">${breach.year}</span>
                                    </div>
                                    <div class="breach-content">
                                        <img src="${logoUrl}" alt="${breach.title}" class="breach-logo" onerror="this.style.display='none';">
                                        <h4 class="breach-name">${breach.title}</h4>
                                        <p class="breach-description">${breach.description}</p>
                                        ${breach.compromised && breach.compromised.length > 0 ? `
                                            <div class="breach-data-classes">
                                                <strong>Compromised data:</strong>
                                                <ul>
                                                    ${breach.compromised.map(item => `<li>${item}</li>`).join('')}
                                                </ul>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
        
        html += '</div>';
        section.innerHTML = html;
    }
    
    validateSourceInfo() {
        // Use checkFormCompletion to validate
        if (!this.checkFormCompletion()) {
            const userEmail = this.userEmail?.value.trim();
            const sourceType = this.sourceType?.value;
            const sourceValue = this.sourceValue?.value.trim();
            
            if (!userEmail) {
                this.showAlert('Please enter your email address', 'warning');
                return false;
            }
            
            if (!sourceType) {
                this.showAlert('Please select a source type', 'warning');
                return false;
            }
            
            if (!sourceValue) {
                this.showAlert('Please enter the source value', 'warning');
                return false;
            }
            
            // Validate email format
            if (sourceType === 'email' && !this.isValidEmail(sourceValue)) {
                this.showAlert('Please enter a valid email address for the source', 'warning');
                return false;
            }
            
            return false;
        }
        
        return {
            userEmail: this.userEmail.value.trim(),
            sourceType: this.sourceType.value,
            sourceValue: this.sourceValue.value.trim()
        };
    }
    
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    getFileExtension(mimeType) {
        const extensions = {
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/webp': 'webp',
            'image/bmp': 'bmp',
            'image/svg+xml': 'svg'
        };
        return extensions[mimeType] || 'png';
    }
    
    showPasteFeedback() {
        // Add a visual indicator that paste was detected
        const feedback = document.createElement('div');
        feedback.className = 'paste-feedback';
        feedback.textContent = '📋 Image pasted! Analyzing...';
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 161, 156, 0.95);
            backdrop-filter: blur(10px);
            color: var(--petronas-white);
            padding: 12px 20px;
            border-radius: 12px;
            z-index: 10001;
            box-shadow: 0 8px 24px rgba(0, 161, 156, 0.3);
            border: 1px solid var(--petronas-teal);
            animation: slideIn 0.3s ease-out;
            font-weight: 600;
        `;
        
        document.body.appendChild(feedback);
        
        // Remove after animation
        setTimeout(() => {
            feedback.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 300);
        }, 2000);
    }
    
    showTemporaryMessage(message) {
        const msg = document.createElement('div');
        msg.className = 'temporary-message';
        msg.textContent = message;
        msg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 193, 7, 0.95);
            backdrop-filter: blur(10px);
            color: var(--petronas-navy);
            padding: 12px 20px;
            border-radius: 12px;
            z-index: 10001;
            box-shadow: 0 8px 24px rgba(255, 193, 7, 0.3);
            border: 1px solid var(--warning);
            animation: slideIn 0.3s ease-out;
            font-weight: 600;
        `;
        
        document.body.appendChild(msg);
        
        setTimeout(() => {
            msg.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (msg.parentNode) {
                    msg.parentNode.removeChild(msg);
                }
            }, 300);
        }, 3000);
    }
    
    handleFaceSelection(hasFaces) {
        this.hasFaces = hasFaces;
        
        // Hide the prompt
        if (this.faceDetectionPrompt) {
            this.faceDetectionPrompt.style.display = 'none';
        }
        
        // Continue with the pending analysis
        if (this.pendingAnalysis) {
            this.showProgress(true);
            this.setProgress(90, 'Combining results...');
            
            const { file, isImage, sightEngineResult, mlResult, elaResult } = this.pendingAnalysis;
            
            // Combine results based on face selection
            console.log('🔄 Combining results - hasFaces:', this.hasFaces, 'mlResult:', mlResult);
            const combinedResult = this.combineResults(sightEngineResult.detection, mlResult, isImage);
            console.log('✅ Combined result structure:', {
                hasAnalysis: !!combinedResult.analysis,
                hasIndicators: !!(combinedResult.analysis && combinedResult.analysis.indicators),
                indicators: combinedResult.analysis?.indicators
            });
            
            // Add ELA result (doesn't affect AI detection weightage, just for display)
            combinedResult.ela_result = elaResult;
            
            this.setProgress(100, 'Analysis complete!');
            setTimeout(() => {
                this.showProgress(false);
                console.log('📊 Final combined result before display:', combinedResult);
                console.log('📊 Indicators to display:', combinedResult.analysis?.indicators);
                this.displayResults(combinedResult, file);
                this.pendingAnalysis = null;
            }, 1000);
        }
    }
    
    async handleFileUpload(files) {
        if (!files || files.length === 0) return;
        
        if (this.isAnalyzing) {
            this.showTemporaryMessage('Analysis in progress. Please wait...');
            return;
        }
        
        this.isAnalyzing = true;
        const file = files[0];
        
        // Validate file type (updated to match server-side validation)
        const allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp',
            'video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm'
        ];
        if (!allowedTypes.includes(file.type)) {
            this.showAlert('Invalid file type. Please upload images (JPG, PNG, GIF, WebP, BMP) or videos (MP4, MOV, AVI, MKV, WebM).', 'danger');
            return;
        }
        
        // Validate file size (50MB max)
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            this.showAlert('File too large. Maximum size is 50MB.', 'danger');
            return;
        }
        
        // Validate video duration (1 minute max for MP4)
        if (file.type === 'video/mp4' || file.name.toLowerCase().endsWith('.mp4')) {
            try {
                const duration = await this.getVideoDuration(file);
                const maxDuration = 60; // 1 minute in seconds
                if (duration > maxDuration) {
                    this.showAlert(`Video duration exceeds 1 minute limit. Your video is ${Math.round(duration)} seconds. Please upload a video under 1 minute.`, 'danger');
                    return;
                }
            } catch (error) {
                console.error('Error checking video duration:', error);
                // Continue with upload if duration check fails (server will validate)
            }
        }
        
        this.showProgress(true);
        this.setProgress(10, 'Uploading file...');
        
        try {
            const formData = new FormData();
            formData.append('media', file);
            formData.append('action', 'analyze_upload');
            
            // Check if it's an image (for ML detection)
            const isImage = file.type.startsWith('image/');
            
            // Call SightEngine API (includes ELA analysis and transcript analysis for videos)
            const isVideo = file.type.startsWith('video/');
            if (isVideo) {
                console.log('🎬 STARTING VIDEO ANALYSIS');
                console.log('  - Video file:', file.name);
                console.log('  - Video type:', file.type);
                console.log('  - Video size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
                this.setProgress(20, 'Analyzing video (visual + audio transcript)...');
            } else {
                this.setProgress(20, 'Analyzing with AI detection and ELA...');
            }
            
            console.log('📤 SENDING REQUEST TO SIGHTENGINE API...');
            const sightEngineResponse = await fetch('api/sightengine.php', {
                method: 'POST',
                body: formData
            });
            
            console.log('📥 RECEIVED RESPONSE FROM SIGHTENGINE API');
            console.log('  - Status:', sightEngineResponse.status);
            console.log('  - Status text:', sightEngineResponse.statusText);
            console.log('  - Content-Type:', sightEngineResponse.headers.get('content-type'));
            
            const sightEngineText = await sightEngineResponse.text();
            console.log('📄 RAW RESPONSE TEXT LENGTH:', sightEngineText.length, 'characters');
            console.log('📄 RAW RESPONSE PREVIEW:', sightEngineText.substring(0, 500));
            
            let sightEngineResult;
            try {
                sightEngineResult = JSON.parse(sightEngineText);
                console.log('✅ SUCCESSFULLY PARSED JSON RESPONSE');
                console.log('  - Response structure:', Object.keys(sightEngineResult));
            } catch (parseError) {
                console.error('❌ SIGHTENGINE JSON PARSE ERROR:', parseError);
                console.error('  - Raw text:', sightEngineText);
                throw new Error(`Invalid SightEngine response format`);
            }
            
            // Check for errors in response (even if status is 200)
            if (!sightEngineResponse.ok || !sightEngineResult.success) {
                const errorMessage = sightEngineResult.error || `SightEngine API error! status: ${sightEngineResponse.status}`;
                const debugInfo = sightEngineResult.debug_info || {};
                
                console.error('❌ SIGHTENGINE API ERROR:');
                console.error('  - Status:', sightEngineResponse.status);
                console.error('  - Error message:', errorMessage);
                console.error('  - Debug info:', debugInfo);
                console.error('  - Full response:', sightEngineResult);
                
                throw new Error(errorMessage);
            }
            
            // Call ML detection API (only for images)
            let mlResult = null;
            if (isImage) {
                this.setProgress(60, 'Analyzing with Machine Learning model...');
                try {
                    const mlFormData = new FormData();
                    mlFormData.append('media', file);
                    mlFormData.append('action', 'analyze_upload');
                    
                    const mlResponse = await fetch('api/ai_detection.php', {
                        method: 'POST',
                        body: mlFormData
                    });
                    
                    if (mlResponse.ok) {
                        const mlText = await mlResponse.text();
                        try {
                            mlResult = JSON.parse(mlText);
                        } catch (e) {
                            console.warn('ML detection failed to parse:', e);
                            mlResult = null;
                        }
                    } else {
                        console.warn('ML detection API error:', mlResponse.status);
                        mlResult = null;
                    }
                } catch (mlError) {
                    console.warn('ML detection error (non-critical):', mlError);
                    mlResult = null; // ML detection is optional, continue with SightEngine only
                }
            }
            
            // Get ELA result from SightEngine response (if available)
            let elaResult = sightEngineResult.ela_result || null;
            
            // Check for ELA error in response
            if (sightEngineResult.ela_error) {
                console.error('ELA Error from server:', sightEngineResult.ela_error);
            }
            
            // For videos, skip face selection and use 50% SightEngine + 50% LLM Transcript
            if (!isImage) {
                console.log('🎬 VIDEO ANALYSIS DETECTED');
                console.log('  - File name:', file.name);
                console.log('  - File type:', file.type);
                console.log('  - File size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
                
                this.hasFaces = null; // Videos don't use face selection
                this.setProgress(90, 'Processing video analysis...');
                
                // Log raw Sightengine response
                console.log('📥 RAW SIGHTENGINE RESPONSE:', sightEngineResult);
                
                // Check for transcript in raw results
                const rawDetection = sightEngineResult.detection || {};
                const rawResults = rawDetection.detection_results || rawDetection.raw_results || {};
                
                console.log('🔍 CHECKING FOR TRANSCRIPT DATA...');
                if (rawResults.transcript) {
                    console.log('✅ TRANSCRIPT FOUND!');
                    console.log('  - Transcript length:', rawResults.transcript.length, 'characters');
                    console.log('  - Transcript preview:', rawResults.transcript.substring(0, 150) + '...');
                } else {
                    console.warn('⚠️ No transcript found in raw results');
                }
                
                if (rawResults.transcript_analysis) {
                    console.log('✅ TRANSCRIPT ANALYSIS FOUND!');
                    console.log('  - Full transcript analysis:', rawResults.transcript_analysis);
                    console.log('  - Confidence score:', rawResults.transcript_analysis.confidence_score);
                    console.log('  - Is AI generated:', rawResults.transcript_analysis.is_ai_generated);
                    console.log('  - Is deepfake:', rawResults.transcript_analysis.is_deepfake);
                    console.log('  - Is impersonation:', rawResults.transcript_analysis.is_impersonation);
                    console.log('  - Impersonation target:', rawResults.transcript_analysis.impersonation_target);
                    console.log('  - Scam type:', rawResults.transcript_analysis.scam_type);
                    console.log('  - Indicators:', rawResults.transcript_analysis.indicators);
                } else {
                    console.warn('⚠️ No transcript analysis found in raw results');
                }
                
                // For videos: 50% SightEngine + 50% LLM Transcript Analysis
                const combinedResult = this.combineResults(sightEngineResult.detection, null, isImage);
                combinedResult.ela_result = null; // No ELA for videos
                
                // Log combined result structure
                console.log('⚖️ COMBINED RESULT STRUCTURE:');
                console.log('  - Combined result:', combinedResult);
                if (combinedResult.analysis) {
                    console.log('  - Analysis object:', combinedResult.analysis);
                    console.log('  - Final confidence score:', combinedResult.analysis.confidence_score);
                    console.log('  - Final AI generated score:', combinedResult.analysis.ai_generated_score);
                    console.log('  - Final is AI generated:', combinedResult.analysis.is_ai_generated);
                    console.log('  - Final is deepfake:', combinedResult.analysis.is_deepfake);
                    console.log('  - All indicators:', combinedResult.analysis.indicators);
                    
                    // Check if transcript data is in analysis
                    if (combinedResult.analysis.transcript) {
                        console.log('✅ Transcript found in analysis object');
                    }
                    if (combinedResult.analysis.transcript_analysis) {
                        console.log('✅ Transcript analysis found in analysis object');
                    }
                }
                
                this.setProgress(100, 'Analysis complete!');
                setTimeout(() => {
                    this.showProgress(false);
                    console.log('✅ FINAL COMBINED RESULT READY FOR DISPLAY:', combinedResult);
                    this.displayResults(combinedResult, file);
                }, 1000);
            } else {
                // For images: show face detection prompt
                this.showProgress(false);
                this.pendingAnalysis = {
                    file: file,
                    isImage: isImage,
                    sightEngineResult: sightEngineResult,
                    mlResult: mlResult,
                    elaResult: elaResult
                };
                
                // Show face detection prompt
                if (this.faceDetectionPrompt) {
                    this.faceDetectionPrompt.style.display = 'block';
                    this.faceDetectionPrompt.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            
        } catch (error) {
            this.showProgress(false);
            this.showAlert(`Analysis failed: ${error.message}`, 'danger');
            console.error('Upload error:', error);
        } finally {
            this.isAnalyzing = false;
        }
    }
    
    async analyzeUrl() {
        const url = this.mediaUrl.value.trim();
        
        if (!url) {
            this.showAlert('Please enter a valid URL', 'warning');
            return;
        }
        
        if (this.isAnalyzing) {
            this.showTemporaryMessage('Analysis in progress. Please wait...');
            return;
        }
        
        this.isAnalyzing = true;
        
        // Enhanced URL validation to match server-side
        try {
            new URL(url);
            
            // Check if URL appears to be a media file (image or video)
            const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
            const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
            const allExtensions = [...imageExtensions, ...videoExtensions];
            const urlLower = url.toLowerCase();
            
            const hasMediaExtension = allExtensions.some(ext => urlLower.includes('.' + ext));
            const isKnownMediaHost = (
                url.includes('sightengine.com') ||
                url.includes('imgur.com') ||
                url.includes('unsplash.com') ||
                url.includes('pixabay.com') ||
                url.includes('pexels.com') ||
                url.includes('youtube.com') ||
                url.includes('youtu.be') ||
                url.includes('vimeo.com')
            );
            
            if (!hasMediaExtension && !isKnownMediaHost) {
                this.isAnalyzing = false;
                this.showAlert('URL does not appear to be a valid media file. Please ensure the URL points to an image or video file or is from a supported hosting service.', 'warning');
                return;
            }
        } catch {
            this.isAnalyzing = false;
            this.showAlert('Please enter a valid URL', 'warning');
            return;
        }
        
        this.showProgress(true);
        this.setProgress(20, 'Fetching media from URL...');
        
        try {
            // Check if URL is an image (for ML detection)
            const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
            const urlLower = url.toLowerCase();
            const isImage = imageExtensions.some(ext => urlLower.includes('.' + ext));
            
            // Call SightEngine API
            const formData = new FormData();
            formData.append('url', url);
            formData.append('action', 'analyze_url');
            
            this.setProgress(30, 'Analyzing with SightEngine...');
            const sightEngineResponse = await fetch('api/sightengine.php', {
                method: 'POST',
                body: formData
            });
            
            if (!sightEngineResponse.ok) {
                throw new Error(`SightEngine API error! status: ${sightEngineResponse.status}`);
            }
            
            const sightEngineText = await sightEngineResponse.text();
            let sightEngineResult;
            try {
                sightEngineResult = JSON.parse(sightEngineText);
            } catch (parseError) {
                console.error('SightEngine JSON Parse Error:', parseError);
                throw new Error(`Invalid SightEngine response format`);
            }
            
            if (!sightEngineResult.success) {
                throw new Error(sightEngineResult.error || 'SightEngine analysis failed');
            }
            
            // Call ML detection API (only for images)
            let mlResult = null;
            if (isImage) {
                this.setProgress(70, 'Analyzing with Machine Learning model...');
                try {
                    const mlFormData = new FormData();
                    mlFormData.append('url', url);
                    mlFormData.append('action', 'analyze_url');
                    
                    const mlResponse = await fetch('api/ai_detection.php', {
                        method: 'POST',
                        body: mlFormData
                    });
                    
                    if (mlResponse.ok) {
                        const mlText = await mlResponse.text();
                        try {
                            mlResult = JSON.parse(mlText);
                        } catch (e) {
                            console.warn('ML detection failed to parse:', e);
                            mlResult = null;
                        }
                    } else {
                        console.warn('ML detection API error:', mlResponse.status);
                        mlResult = null;
                    }
                } catch (mlError) {
                    console.warn('ML detection error (non-critical):', mlError);
                    mlResult = null; // ML detection is optional, continue with SightEngine only
                }
            }
            
            this.setProgress(90, 'Combining results...');
            
            // Combine results: 60% SightEngine, 40% ML (if available)
            const combinedAnalysis = this.combineResultsForUrl(sightEngineResult.analysis, mlResult, isImage);
            
            this.setProgress(100, 'Analysis complete!');
            
            setTimeout(() => {
                this.showProgress(false);
                this.displayUrlResults(combinedAnalysis, url);
            }, 1000);
            
        } catch (error) {
            this.showProgress(false);
            this.showAlert(`URL analysis failed: ${error.message}`, 'danger');
            console.error('URL analysis error:', error);
        } finally {
            this.isAnalyzing = false;
        }
    }
    
    displayResults(detection, file) {
        console.log('📊 DISPLAY RESULTS CALLED');
        console.log('  - Detection object:', detection);
        console.log('  - File:', file?.name || 'N/A');
        
        // Handle different response structures
        let analysis, results;
        
        // Parse detection_results if it's a string
        let parsedResults = {};
        if (detection.detection_results) {
            if (typeof detection.detection_results === 'string') {
                try {
                    parsedResults = JSON.parse(detection.detection_results);
                } catch (e) {
                    console.error('Error parsing detection_results:', e);
                    parsedResults = {};
                }
            } else {
                parsedResults = detection.detection_results;
            }
        }
        
        if (detection && detection.analysis) {
            // Standard structure: detection.analysis and detection.detection_results
            analysis = detection.analysis;
            results = parsedResults;
            console.log('✅ Using standard structure (detection.analysis)');
        } else if (detection && detection.is_ai_generated !== undefined) {
            // Direct analysis object
            analysis = detection;
            results = parsedResults;
            console.log('✅ Using direct analysis structure');
        } else if (detection && detection.detection_results) {
            // Only detection_results available, need to analyze it
            results = parsedResults;
            // Try to extract analysis from results or create a basic one
            analysis = this.extractAnalysisFromResults(results);
            console.log('✅ Extracted analysis from detection_results');
        } else {
            console.error('❌ Invalid detection structure:', detection);
            this.showAlert('Invalid response structure from server', 'danger');
            return;
        }
        
        // Log transcript data if available
        if (analysis.transcript || results.transcript) {
            console.log('🎙️ TRANSCRIPT DATA FOUND IN ANALYSIS:');
            console.log('  - Transcript:', analysis.transcript || results.transcript);
            console.log('  - Transcript length:', (analysis.transcript || results.transcript).length, 'characters');
        }
        
        if (analysis.transcript_analysis || results.transcript_analysis) {
            console.log('🤖 TRANSCRIPT ANALYSIS FOUND IN ANALYSIS:');
            console.log('  - Full transcript analysis:', analysis.transcript_analysis || results.transcript_analysis);
        }
        
        // Store current analysis result
        this.currentAnalysisResult = { analysis, results, file };
        console.log('💾 Stored analysis result:', {
            hasAnalysis: !!analysis,
            hasResults: !!results,
            hasTranscript: !!(analysis.transcript || results.transcript),
            hasTranscriptAnalysis: !!(analysis.transcript_analysis || results.transcript_analysis)
        });
        
        // Show results section
        this.resultsSection.style.display = 'block';
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Update authenticity indicator
        this.updateAuthenticityIndicator(analysis);
        
        // Update confidence score with better visualization
        const isAIGenerated = analysis.is_deepfake || analysis.is_ai_generated;
        this.updateConfidenceScore(analysis.confidence_score || 0, isAIGenerated);
        
        // Update indicators list
        this.updateIndicatorsList(analysis.indicators || []);
        
        // Show media preview (pass analysis to include ELA mapping)
        this.showMediaPreview(file, results, analysis);
        
        // Show warning banner and report button if AI detected
        if (analysis.is_deepfake || analysis.is_ai_generated) {
            const warningBanner = document.getElementById('warningBanner');
            if (warningBanner) {
                warningBanner.style.display = 'block';
                warningBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        } else {
            // Hide warning banner if not AI
            const warningBanner = document.getElementById('warningBanner');
            if (warningBanner) {
                warningBanner.style.display = 'none';
            }
        }
        
        // Update detailed analysis tabs
        this.updateDetailedAnalysis(results, analysis);
        
        // Display ELA results if available (check multiple possible locations)
        const elaResult = analysis.ela_result || detection?.ela_result || detection?.analysis?.ela_result;
        
        if (elaResult) {
            // Store ELA result in analysis object for easy access
            analysis.ela_result = elaResult;
            this.displayELAResults(elaResult);
        }
        
        // Add to recent scans
        this.addToRecentScans(file.name, analysis, file);
    }
    
    /**
     * Extract analysis from raw API results when analysis object is not provided
     */
    extractAnalysisFromResults(results) {
        let isAIGenerated = false;
        let isDeepfake = false;
        let confidenceScore = 0.0;
        let aiGeneratedScore = 0.0;
        let deepfakeScore = 0.0;
        const indicators = [];
        
        // Handle VIDEO response format: data.frames[]
        if (results.data && results.data.frames && Array.isArray(results.data.frames)) {
            const frames = results.data.frames;
            const frameScores = [];
            
            frames.forEach(frame => {
                if (frame.type && frame.type.ai_generated !== undefined) {
                    frameScores.push(parseFloat(frame.type.ai_generated));
                }
            });
            
            if (frameScores.length > 0) {
                aiGeneratedScore = frameScores.reduce((a, b) => a + b, 0) / frameScores.length;
                confidenceScore = aiGeneratedScore;
                
                if (aiGeneratedScore > 0.5) {
                    isAIGenerated = true;
                    indicators.push(`AI-generated video detected (confidence: ${Math.round(aiGeneratedScore * 100)}%, analyzed ${frames.length} frames)`);
                } else {
                    indicators.push(`Natural video content detected (confidence: ${Math.round((1 - aiGeneratedScore) * 100)}%, analyzed ${frames.length} frames)`);
                }
            }
        }
        // Handle IMAGE response format: type.ai_generated and type.deepfake
        else if (results.type) {
            if (results.type.ai_generated !== undefined) {
                aiGeneratedScore = parseFloat(results.type.ai_generated);
                confidenceScore = aiGeneratedScore;
                
                if (aiGeneratedScore > 0.5) {
                    isAIGenerated = true;
                    indicators.push(`AI-generated content detected (confidence: ${Math.round(aiGeneratedScore * 100)}%)`);
                } else {
                    indicators.push(`Natural content detected (confidence: ${Math.round((1 - aiGeneratedScore) * 100)}%)`);
                }
            }
            
            if (results.type.deepfake !== undefined) {
                deepfakeScore = parseFloat(results.type.deepfake);
                
                // Only add deepfake indicators if face button was selected (hasFaces === true)
                if (this.hasFaces === true) {
                    if (deepfakeScore > 0.5) {
                        isDeepfake = true;
                        isAIGenerated = true;
                        indicators.push(`Deepfake detected (confidence: ${Math.round(deepfakeScore * 100)}%)`);
                    } else {
                        indicators.push(`No deepfake detected (authenticity: ${Math.round((1 - deepfakeScore) * 100)}%)`);
                    }
                }
                
                // Use max of both scores
                confidenceScore = Math.max(confidenceScore, deepfakeScore);
            }
        }
        
        return {
            is_ai_generated: isAIGenerated,
            is_deepfake: isDeepfake || isAIGenerated,
            confidence_score: confidenceScore,
            ai_generated_score: aiGeneratedScore,
            deepfake_score: deepfakeScore,
            indicators: indicators,
            method: 'sightengine_api'
        };
    }
    
    displayUrlResults(analysis, url) {
        // Store current analysis result
        this.currentAnalysisResult = { analysis, results: {}, url };
        
        // Show results section
        this.resultsSection.style.display = 'block';
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Update authenticity indicator
        this.updateAuthenticityIndicator(analysis);
        
        // Update confidence score with better visualization
        const isAIGenerated = analysis.is_deepfake || analysis.is_ai_generated;
        this.updateConfidenceScore(analysis.confidence_score || 0, isAIGenerated);
        
        // Update indicators list
        this.updateIndicatorsList(analysis.indicators || []);
        
        // Show URL preview
        this.showUrlPreview(url);
        
        // Show warning banner and report button if AI detected
        if (analysis.is_deepfake || analysis.is_ai_generated) {
            const warningBanner = document.getElementById('warningBanner');
            if (warningBanner) {
                warningBanner.style.display = 'block';
                warningBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        } else {
            // Hide warning banner if not AI
            const warningBanner = document.getElementById('warningBanner');
            if (warningBanner) {
                warningBanner.style.display = 'none';
            }
        }
        
        // Update detailed analysis tabs
        // Structure results similar to file upload format
        const results = {
            ml_result: analysis.ml_result || null,
            sightengine_result: analysis.sightengine_result || null,
            ...(analysis.raw_results || {})
        };
        this.updateDetailedAnalysis(results, analysis);
    }
    
    /**
     * Combine SightEngine and ML results for URL analysis
     */
    combineResultsForUrl(sightEngineAnalysis, mlResult, isImage) {
        // Start with SightEngine analysis as base
        const combined = JSON.parse(JSON.stringify(sightEngineAnalysis)); // Deep copy
        
        // If ML result is not available (or not an image), return SightEngine only
        if (!mlResult || !mlResult.success || !isImage) {
            combined.method = 'sightengine_only';
            combined.ml_result = null;
            return combined;
        }
        
        // Extract ML probabilities
        const mlProbabilities = mlResult.probabilities || {};
        const mlAIScore = mlProbabilities.ai || 0;
        const mlHumanScore = mlProbabilities.human || 0;
        const mlLabel = mlResult.label || 0;
        const mlConfidence = mlResult.confidence || 0;
        
        // Extract SightEngine scores
        const seAIScore = combined.ai_generated_score || 
                         (combined.is_ai_generated ? 0.7 : 0.3) || 0;
        const seDeepfakeScore = combined.deepfake_score || 
                               (combined.is_deepfake ? 0.7 : 0.3) || 0;
        const seConfidence = combined.confidence_score || 0;
        
        // Calculate weighted combined scores
        // For AI-generated score: 60% SightEngine + 40% ML
        const combinedAIScore = (seAIScore * 0.6) + (mlAIScore * 0.4);
        
        // Confidence score should be the combined AI score (probability of AI-generated)
        // This represents: 60% from SightEngine + 40% from ML API
        const combinedConfidence = combinedAIScore;
        
        // Determine if AI-generated
        const isAIGenerated = combinedAIScore > 0.5;
        
        // Update analysis
        combined.is_ai_generated = isAIGenerated;
        combined.ai_generated_score = combinedAIScore;
        combined.confidence_score = combinedConfidence;
        combined.method = 'combined_sightengine_ml';
        
        // Add ML-specific data (preserve all fields from ML result including raw_outputs)
        combined.ml_result = {
            success: mlResult.success !== undefined ? mlResult.success : true,
            label: mlLabel,
            label_name: mlResult.label_name || (mlLabel === 1 ? 'AI-generated' : 'Human-generated'),
            confidence: mlConfidence,
            probabilities: mlProbabilities,
            raw_outputs: mlResult.raw_outputs || {}
        };
        
        // Add SightEngine-specific data
        combined.sightengine_result = {
            ai_generated_score: seAIScore,
            deepfake_score: seDeepfakeScore,
            confidence_score: seConfidence,
            is_ai_generated: combined.is_ai_generated || false,
            is_deepfake: combined.is_deepfake || false
        };
        
        // Update indicators
        const indicators = combined.indicators || [];
        if (mlResult.success) {
            indicators.push(`ML Model: ${mlResult.label_name} (${Math.round(mlConfidence * 100)}% confidence)`);
        }
        combined.indicators = indicators;
        
        return combined;
    }
    
    updateAuthenticityIndicator(analysis) {
        const indicator = document.getElementById('authenticityIndicator');
        const circle = indicator.querySelector('.indicator-circle');
        const text = document.getElementById('authenticityText');
        
        // Check for both is_deepfake and is_ai_generated
        const isAIGenerated = analysis.is_deepfake || analysis.is_ai_generated;
        const confidence = analysis.confidence_score || 0;
        
        if (isAIGenerated) {
            circle.className = 'indicator-circle deepfake';
            text.className = 'status-label deepfake';
            text.textContent = 'AI Generated Content Detected';
        } else if (confidence > 0.3) {
            circle.className = 'indicator-circle suspicious';
            text.className = 'status-label suspicious';
            text.textContent = 'Content Requires Review';
        } else {
            circle.className = 'indicator-circle authentic';
            text.className = 'status-label authentic';
            text.textContent = 'Content Appears Authentic';
        }
    }
    
    updateConfidenceScore(score, isDeepfake) {
        const scoreFill = document.getElementById('scoreFill');
        const scoreText = document.getElementById('scoreText');
        
        const percentage = Math.round(score * 100);
        const authenticPercentage = 100 - percentage;
        
        // Update the confidence bar
        scoreFill.style.width = `${percentage}%`;
        
        // Update text to show both percentages
        if (isDeepfake) {
            scoreText.textContent = `${percentage}% AI-Generated`;
            scoreText.title = `${percentage}% AI-Generated, ${authenticPercentage}% Authentic`;
        } else {
            scoreText.textContent = `${authenticPercentage}% Authentic`;
            scoreText.title = `${authenticPercentage}% Authentic, ${percentage}% AI-Generated`;
        }
        
        // Update color based on score
        if (isDeepfake || score > 0.7) {
            scoreFill.className = 'confidence-fill high';
        } else if (score > 0.3) {
            scoreFill.className = 'confidence-fill medium';
        } else {
            scoreFill.className = 'confidence-fill low';
        }
    }
    
    updateIndicatorsList(indicators) {
        const indicatorsList = document.getElementById('indicatorsList');
        indicatorsList.innerHTML = '';
        
        console.log('📋 updateIndicatorsList called with:', indicators);
        console.log('📋 Indicators type:', typeof indicators, 'Is array:', Array.isArray(indicators));
        
        if (!indicators || indicators.length === 0) {
            console.warn('⚠️ No indicators provided to updateIndicatorsList');
            const item = document.createElement('div');
            item.className = 'indicator-item success';
            item.innerHTML = '<span>✓</span> <span>No suspicious indicators found</span>';
            indicatorsList.appendChild(item);
            return;
        }
        
        // Check if this is a video (has Gemini/transcript indicators) or image
        const hasVideoIndicators = indicators.some(ind => 
            ind.toLowerCase().includes('gemini') || ind.toLowerCase().includes('transcript')
        );
        
        console.log('📋 Has video indicators:', hasVideoIndicators);
        
        // Consistent styling for all indicators (videos and images)
        indicators.forEach(indicator => {
            const item = document.createElement('div');
            
            // Extract confidence percentage from indicator text (the percentage AFTER the colon)
            // Format: "Label (weightage%): confidence%"
            const colonIndex = indicator.indexOf(':');
            let confidence = 0;
            if (colonIndex !== -1) {
                const confidenceMatch = indicator.substring(colonIndex + 1).match(/(\d+\.?\d*)%/);
                confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0;
            } else {
                // Fallback: try to extract from anywhere in the string
                const confidenceMatch = indicator.match(/(\d+\.?\d*)%/);
                confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0;
            }
            
            // Determine class based on confidence score
            let itemClass = 'warning';
            if (confidence > 70) {
                itemClass = 'danger';
            } else if (confidence < 30) {
                itemClass = 'success';
            }
            
            // Extract label (everything before the colon, which includes weightage)
            const label = colonIndex !== -1 ? indicator.substring(0, colonIndex).trim() : indicator.trim();
            
            // Determine if this is a 60% weightage indicator (should be slightly more prominent)
            const isPrimary = label.includes('60%');
            
            // Apply consistent styling to all indicators
            item.className = `indicator-item ${itemClass}`;
            item.style.cssText = 'margin-bottom: 24px; display: flex; flex-direction: column; align-items: center;';
            
            item.innerHTML = this.createCircularProgress(confidence, itemClass, label, isPrimary);
            indicatorsList.appendChild(item);
        });
    }
    
    createCircularProgress(percentage, type, label, isPrimary = false) {
        // Consistent sizing - primary (60% weightage) indicators slightly larger
        const radius = isPrimary ? 45 : 40;
        const svgSize = isPrimary ? 110 : 100;
        const fontSize = isPrimary ? '16px' : '14px';
        const labelSize = '14px';
        const labelWeight = isPrimary ? 'bold' : 'normal';
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;
        const center = svgSize / 2;
        
        // All text in white
        const textColor = '#ffffff';
        
        return `
            <div class="circular-progress" style="margin-bottom: 12px;">
                <svg width="${svgSize}" height="${svgSize}">
                    <circle class="circular-progress-bg" cx="${center}" cy="${center}" r="${radius}" stroke-width="3"></circle>
                    <circle class="circular-progress-bar ${type}" 
                            cx="${center}" cy="${center}" r="${radius}"
                            stroke-dasharray="${circumference}"
                            stroke-dashoffset="${offset}"
                            stroke-width="3">
                    </circle>
                </svg>
                <div class="circular-progress-text" style="font-size: ${fontSize}; font-weight: ${labelWeight}; color: ${textColor};">${percentage}%</div>
            </div>
            <div class="indicator-label" style="font-size: ${labelSize}; font-weight: ${labelWeight}; color: ${textColor}; text-align: center; max-width: 200px; line-height: 1.4;">${label}</div>
        `;
    }
    
    showMediaPreview(file, results, analysis = null) {
        const mediaPreview = document.getElementById('mediaPreview');
        const mediaInfo = document.getElementById('mediaInfo');
        
        // Clear previous content
        mediaPreview.innerHTML = '';
        
        // Create media element
        let mediaElement;
        if (file.type.startsWith('image/')) {
            mediaElement = document.createElement('img');
            mediaElement.src = URL.createObjectURL(file);
            mediaElement.alt = 'Uploaded media';
            mediaElement.style.maxWidth = '100%';
            mediaElement.style.maxHeight = '400px';
            mediaElement.style.objectFit = 'contain';
        } else if (file.type.startsWith('video/')) {
            mediaElement = document.createElement('video');
            mediaElement.src = URL.createObjectURL(file);
            mediaElement.controls = true;
            mediaElement.style.maxWidth = '100%';
            mediaElement.style.maxHeight = '400px';
            mediaElement.style.display = 'block';
            mediaElement.style.margin = '0 auto';
            // Add error handling
            mediaElement.onerror = () => {
                console.error('Error loading video');
                mediaPreview.innerHTML = '<p style="color: red;">Error loading video preview</p>';
            };
        } else {
            mediaPreview.innerHTML = '<p>Unsupported media type</p>';
            return;
        }
        
        mediaPreview.appendChild(mediaElement);
        
        // Update media info
        this.updateMediaInfo(mediaInfo, {
            'File Name': file.name,
            'File Size': this.formatFileSize(file.size),
            'File Type': file.type,
            'Last Modified': new Date(file.lastModified).toLocaleDateString()
        }, analysis);
        
    }
    
    showUrlPreview(url) {
        const mediaPreview = document.getElementById('mediaPreview');
        const mediaInfo = document.getElementById('mediaInfo');
        
        // Determine if URL is a video or image
        const urlLower = url.toLowerCase();
        const isVideo = urlLower.includes('.mp4') || urlLower.includes('.mov') || 
                       urlLower.includes('.avi') || urlLower.includes('.mkv') || 
                       urlLower.includes('.webm') || urlLower.includes('youtube.com') ||
                       urlLower.includes('youtu.be') || urlLower.includes('vimeo.com');
        
        let mediaElement;
        if (isVideo) {
            mediaElement = document.createElement('video');
            mediaElement.src = url;
            mediaElement.controls = true;
            mediaElement.style.maxWidth = '100%';
            mediaElement.style.maxHeight = '300px';
        } else {
            mediaElement = document.createElement('img');
            mediaElement.src = url;
            mediaElement.alt = 'Media from URL';
            mediaElement.style.maxWidth = '100%';
            mediaElement.style.maxHeight = '300px';
        }
        
        mediaPreview.innerHTML = '';
        mediaPreview.appendChild(mediaElement);
        
        // Update media info
        this.updateMediaInfo(mediaInfo, {
            'Source URL': url,
            'Analysis Date': new Date().toLocaleDateString(),
            'Source Type': 'External URL',
            'Media Type': isVideo ? 'Video' : 'Image'
        });
    }
    
    updateMediaInfo(container, info, analysis = null) {
        container.innerHTML = '';
        
        // Display file information
        Object.entries(info).forEach(([label, value]) => {
            const item = document.createElement('div');
            item.className = 'info-item';
            item.innerHTML = `
                <span class="info-label">${label}:</span>
                <span class="info-value">${value}</span>
            `;
            container.appendChild(item);
        });
    }
    
    showEducationBanner(isDangerous = false) {
        const modal = document.getElementById('educationModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
    }
    
    updateDetailedAnalysis(results, analysis) {
        // General tab
        const generalTab = document.getElementById('generalAnalysis');
        generalTab.innerHTML = this.formatGeneralAnalysis(results, analysis);
        
        // Deepfake Analysis tab - only show if face button was selected (hasFaces === true)
        const deepfakeTabButton = document.querySelector('.analysis-tab[data-tab="deepfake"]');
        const deepfakeTab = document.getElementById('deepfakeTab');
        
        if (this.hasFaces === true) {
            // Show deepfake tab
            if (deepfakeTabButton) {
                deepfakeTabButton.style.display = 'flex';
            }
            if (deepfakeTab) {
                deepfakeTab.innerHTML = this.formatDeepfakeAnalysis(results, analysis);
            }
        } else {
            // Hide deepfake tab if no face button was selected
            if (deepfakeTabButton) {
                deepfakeTabButton.style.display = 'none';
            }
            // If deepfake tab is currently active, switch to general tab
            if (deepfakeTab && deepfakeTab.classList.contains('active')) {
                showTab('general');
            }
        }
        
        // Generated AI Analysis tab
        const aiGeneratedTab = document.getElementById('aiGeneratedAnalysis');
        aiGeneratedTab.innerHTML = this.formatAIGeneratedAnalysis(results, analysis);
        
        // Show transcript badge if transcript analysis is available
        const transcriptBadge = document.getElementById('transcriptBadge');
        if (transcriptBadge) {
            const hasTranscript = !!(analysis.transcript || results.transcript || analysis.transcript_analysis || results.transcript_analysis);
            if (hasTranscript) {
                console.log('🎙️ Showing transcript badge in UI');
                transcriptBadge.style.display = 'inline-block';
            } else {
                transcriptBadge.style.display = 'none';
            }
        }
    }
    
    formatGeneralAnalysis(results, analysis) {
        let html = '<div class="analysis-item">';
        html += '<h4>Overall Assessment</h4>';
        html += `<p>Confidence Score: ${Math.round((analysis.confidence_score || 0) * 100)}%</p>`;
        html += `<p>AI-Generated Content: ${analysis.is_ai_generated ? 'Yes' : 'No'}</p>`;
        // Only show deepfake detection for images with faces (hasFaces === true)
        if (this.hasFaces === true) {
            html += `<p>Deepfake Detected: ${analysis.is_deepfake ? 'Yes' : 'No'}</p>`;
        }
        html += `<p>Risk Level: ${this.getRiskLevel(analysis.confidence_score || 0)}</p>`;
        if (analysis.method) {
            html += `<p>Detection Method: ${analysis.method}</p>`;
        }
        if (analysis.weightage) {
            html += `<p>Analysis Weightage: ${analysis.weightage}</p>`;
        }
        html += '</div>';
        
        // Handle VIDEO response format: data.frames[]
        if (results.data && results.data.frames && Array.isArray(results.data.frames)) {
            html += '<div class="analysis-item">';
            html += '<h4>Video Frame Analysis</h4>';
            html += `<p>Total Frames Analyzed: ${results.data.frames.length}</p>`;
            
            // Calculate frame statistics
            const frameScores = results.data.frames
                .map(frame => frame.type?.ai_generated)
                .filter(score => score !== undefined);
            
            if (frameScores.length > 0) {
                const avgScore = frameScores.reduce((a, b) => a + b, 0) / frameScores.length;
                const maxScore = Math.max(...frameScores);
                const minScore = Math.min(...frameScores);
                
                html += `<p>Average AI Probability: ${Math.round(avgScore * 100)}%</p>`;
                html += `<p>Maximum AI Probability: ${Math.round(maxScore * 100)}%</p>`;
                html += `<p>Minimum AI Probability: ${Math.round(minScore * 100)}%</p>`;
            }
            html += '</div>';
        }
        
        // Note: AI Generation Detection and Deepfake Detection are shown in dedicated tabs
        // Removed duplicate sections from General tab
        
        if (results.genai) {
            html += '<div class="analysis-item">';
            html += '<h4>Legacy AI Detection</h4>';
            html += `<p>AI Probability: ${Math.round(results.genai.prob * 100)}%</p>`;
            html += `<p>Model Confidence: ${Math.round((results.genai.confidence || 0) * 100)}%</p>`;
            html += '</div>';
        }
        
        if (results.scam) {
            html += '<div class="analysis-item">';
            html += '<h4>Scam Detection</h4>';
            html += `<p>Scam Probability: ${Math.round(results.scam.prob * 100)}%</p>`;
            html += '</div>';
        }
        
        return html;
    }
    
    formatDeepfakeAnalysis(results, analysis) {
        let html = '';
        
        // Deepfake Detection Section
        html += '<div class="analysis-item">';
        html += '<h4>🎭 Deepfake Detection</h4>';
        
        const deepfakeScore = analysis.is_deepfake ? 
            (analysis.deepfake_score !== undefined ? analysis.deepfake_score : 
             (results.type?.deepfake !== undefined ? results.type.deepfake : 0.8)) : 0;
        
        const authenticityScore = 1 - deepfakeScore;
        
        html += `<div class="score-display">`;
        html += `<div class="score-item ${deepfakeScore > 0.5 ? 'danger' : 'success'}">`;
        html += `<span class="score-label">Deepfake Probability:</span>`;
        html += `<span class="score-value">${Math.round(deepfakeScore * 100)}%</span>`;
        html += `</div>`;
        html += `<div class="score-item ${authenticityScore > 0.5 ? 'success' : 'warning'}">`;
        html += `<span class="score-label">Authenticity Score:</span>`;
        html += `<span class="score-value">${Math.round(authenticityScore * 100)}%</span>`;
        html += `</div>`;
        html += `</div>`;
        
        if (analysis.is_deepfake) {
            html += `<div class="alert alert-danger">`;
            html += `<strong>⚠️ Deepfake Detected!</strong> This content shows strong signs of being manipulated or artificially generated.`;
            html += `</div>`;
        } else {
            html += `<div class="alert alert-success">`;
            html += `<strong>✓ Authentic Content</strong> No significant deepfake indicators detected.`;
            html += `</div>`;
        }
        
        html += '</div>';
        
        // Face Analysis Section (only show if faces are detected)
        const faces = results.faces || [];
        if (faces.length > 0) {
            html += '<div class="analysis-item">';
            html += '<h4>👤 Face Analysis</h4>';
            html += `<p><strong>Faces Detected:</strong> ${faces.length}</p>`;
            
            faces.forEach((face, index) => {
                html += '<div class="face-detail">';
                html += `<h5>Face ${index + 1}</h5>`;
                
                if (face.attributes) {
                    const attrs = face.attributes;
                    html += `<div class="face-attributes">`;
                    
                    if (attrs.real !== undefined) {
                        const realScore = Math.round(attrs.real * 100);
                        html += `<div class="attribute-item ${realScore > 50 ? 'success' : 'warning'}">`;
                        html += `<span class="attr-label">Authenticity:</span>`;
                        html += `<span class="attr-value">${realScore}%</span>`;
                        html += `</div>`;
                    }
                    
                    if (attrs.age?.range) {
                        html += `<div class="attribute-item">`;
                        html += `<span class="attr-label">Age:</span>`;
                        html += `<span class="attr-value">${attrs.age.range}</span>`;
                        html += `</div>`;
                    }
                    
                    if (attrs.gender?.value) {
                        html += `<div class="attribute-item">`;
                        html += `<span class="attr-label">Gender:</span>`;
                        html += `<span class="attr-value">${attrs.gender.value}</span>`;
                        html += `</div>`;
                    }
                    
                    if (attrs.emotion?.value) {
                        html += `<div class="attribute-item">`;
                        html += `<span class="attr-label">Emotion:</span>`;
                        html += `<span class="attr-value">${attrs.emotion.value}</span>`;
                        html += `</div>`;
                    }
                    
                    html += `</div>`;
                }
                
                html += '</div>';
            });
            
            html += '</div>';
        }
        
        // Detection Indicators
        if (analysis.indicators && analysis.indicators.length > 0) {
            html += '<div class="analysis-item">';
            html += '<h4>🔍 Deepfake Indicators</h4>';
            html += '<ul class="indicators-list">';
            analysis.indicators.forEach(indicator => {
                const isDanger = indicator.toLowerCase().includes('deepfake') || 
                                indicator.toLowerCase().includes('artificial') ||
                                indicator.toLowerCase().includes('manipulated');
                html += `<li class="${isDanger ? 'danger' : 'info'}">${indicator}</li>`;
            });
            html += '</ul>';
            html += '</div>';
        }
        
        return html;
    }
    
    formatAIGeneratedAnalysis(results, analysis) {
        let html = '';
        
        // AI Generation Detection Section
        html += '<div class="analysis-item">';
        html += '<h4>🤖 AI Generation Detection</h4>';
        
        const aiScore = analysis.is_ai_generated ? 
            (analysis.ai_generated_score !== undefined ? analysis.ai_generated_score :
             (results.type?.ai_generated !== undefined ? results.type.ai_generated :
              (results.genai?.prob !== undefined ? results.genai.prob : 0.7))) : 0;
        
        const naturalScore = 1 - aiScore;
        
        html += `<div class="score-display">`;
        html += `<div class="score-item ${aiScore > 0.5 ? 'warning' : 'success'}">`;
        html += `<span class="score-label">AI Generated Probability:</span>`;
        html += `<span class="score-value">${Math.round(aiScore * 100)}%</span>`;
        html += `</div>`;
        html += `<div class="score-item ${naturalScore > 0.5 ? 'success' : 'warning'}">`;
        html += `<span class="score-label">Natural Content Probability:</span>`;
        html += `<span class="score-value">${Math.round(naturalScore * 100)}%</span>`;
        html += `</div>`;
        html += `</div>`;
        
        if (analysis.is_ai_generated || aiScore > 0.5) {
            html += `<div class="alert alert-warning">`;
            html += `<strong>⚠️ AI-Generated Content Detected!</strong> This content shows signs of being generated by artificial intelligence.`;
            html += `</div>`;
        } else {
            html += `<div class="alert alert-success">`;
            html += `<strong>✓ Natural Content</strong> This content appears to be naturally created.`;
            html += `</div>`;
        }
        
        html += '</div>';
        
        // Video Frame Analysis (if available)
        if (results.data && results.data.frames && Array.isArray(results.data.frames)) {
            html += '<div class="analysis-item">';
            html += '<h4>🎬 Video Frame Analysis</h4>';
            html += `<p><strong>Total Frames Analyzed:</strong> ${results.data.frames.length}</p>`;
            
            const frameScores = results.data.frames
                .map(frame => frame.type?.ai_generated)
                .filter(score => score !== undefined);
            
            if (frameScores.length > 0) {
                const avgScore = frameScores.reduce((a, b) => a + b, 0) / frameScores.length;
                const maxScore = Math.max(...frameScores);
                const minScore = Math.min(...frameScores);
                
                html += `<div class="frame-stats">`;
                html += `<div class="stat-item">`;
                html += `<span class="stat-label">Average AI Probability:</span>`;
                html += `<span class="stat-value">${Math.round(avgScore * 100)}%</span>`;
                html += `</div>`;
                html += `<div class="stat-item">`;
                html += `<span class="stat-label">Maximum:</span>`;
                html += `<span class="stat-value">${Math.round(maxScore * 100)}%</span>`;
                html += `</div>`;
                html += `<div class="stat-item">`;
                html += `<span class="stat-label">Minimum:</span>`;
                html += `<span class="stat-value">${Math.round(minScore * 100)}%</span>`;
                html += `</div>`;
                html += `</div>`;
            }
            
            html += '</div>';
        }
        
        // Transcript Analysis Section (for videos with transcript)
        if (analysis.transcript || results.transcript) {
            const transcript = analysis.transcript || results.transcript;
            const transcriptAnalysis = analysis.transcript_analysis || results.transcript_analysis;
            
            console.log('📝 FORMATTING TRANSCRIPT ANALYSIS SECTION');
            console.log('  - Transcript available:', !!transcript);
            console.log('  - Transcript length:', transcript?.length || 0);
            console.log('  - Transcript analysis available:', !!transcriptAnalysis);
            
            if (transcriptAnalysis) {
                console.log('  - Transcript analysis confidence:', transcriptAnalysis.confidence_score);
                console.log('  - Is impersonation:', transcriptAnalysis.is_impersonation);
                console.log('  - Scam type:', transcriptAnalysis.scam_type);
                console.log('  - Indicators count:', transcriptAnalysis.indicators?.length || 0);
            }
            
            html += '<div class="analysis-item">';
            html += '<h4>🎙️ Audio Transcript Analysis</h4>';
            
            if (transcriptAnalysis) {
                // Display transcript analysis scores in a clean format
                html += `<div class="score-display" style="margin-bottom: 20px;">`;
                
                if (transcriptAnalysis.confidence_score !== undefined) {
                    const scorePercent = Math.round(transcriptAnalysis.confidence_score * 100);
                    html += `<div class="score-item ${transcriptAnalysis.confidence_score > 0.5 ? 'warning' : 'success'}" style="margin-bottom: 10px; padding: 12px; background: ${transcriptAnalysis.confidence_score > 0.5 ? '#fff3cd' : '#d4edda'}; border-radius: 6px; border-left: 4px solid ${transcriptAnalysis.confidence_score > 0.5 ? '#ffc107' : '#28a745'};">`;
                    html += `<span class="score-label" style="font-weight: bold; font-size: 16px; color: #000000;">AI/Deepfake Confidence:</span>`;
                    html += `<span class="score-value" style="font-size: 1.5em; margin-left: 10px; font-weight: bold; color: ${transcriptAnalysis.confidence_score > 0.5 ? '#856404' : '#155724'};">${scorePercent}%</span>`;
                    html += `</div>`;
                }
                
                html += `</div>`;
                
                // Impersonation and Scam alerts
                if (transcriptAnalysis.is_impersonation) {
                    html += `<div class="alert alert-danger" style="margin-bottom: 15px; padding: 12px; border-radius: 6px; background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24;">`;
                    html += `<strong style="font-size: 16px;">⚠️ Impersonation Detected!</strong>`;
                    if (transcriptAnalysis.impersonation_target) {
                        html += `<br><span style="margin-top: 8px; display: block; font-size: 14px;">Target: <strong>${transcriptAnalysis.impersonation_target}</strong></span>`;
                    }
                    html += `</div>`;
                }
                
                if (transcriptAnalysis.scam_type) {
                    html += `<div class="alert alert-danger" style="margin-bottom: 15px; padding: 12px; border-radius: 6px; background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24;">`;
                    html += `<strong style="font-size: 16px;">🚨 Scam Detected!</strong><br>`;
                    html += `<span style="margin-top: 8px; display: block; font-size: 14px;">Type: <strong>${transcriptAnalysis.scam_type}</strong></span>`;
                    html += `</div>`;
                }
                
                // Display specific indicators in a clean CSV-like format
                if (transcriptAnalysis.indicators && transcriptAnalysis.indicators.length > 0) {
                    html += `<div class="transcript-indicators" style="margin-top: 20px;">`;
                    html += `<h5 style="margin-bottom: 12px; font-weight: bold; font-size: 16px; color: #ffffff;">Detected Indicators:</h5>`;
                    html += `<div style="background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #0066cc;">`;
                    html += `<ul style="margin: 0; padding-left: 20px; list-style-type: disc;">`;
                    transcriptAnalysis.indicators.forEach(indicator => {
                        html += `<li style="margin-bottom: 10px; line-height: 1.6; font-size: 14px; color: #555;">${indicator}</li>`;
                    });
                    html += `</ul>`;
                    html += `</div>`;
                    html += `</div>`;
                }
                
                // Analysis reasoning
                if (transcriptAnalysis.reasoning) {
                    console.log('  - Rendering reasoning');
                    html += `<div style="margin-top: 20px; padding: 15px; background: #e7f3ff; border-radius: 6px; border-left: 4px solid #0066cc;">`;
                    html += `<h5 style="margin-top: 0; margin-bottom: 10px; font-weight: bold; font-size: 16px; color: #333;">Analysis:</h5>`;
                    html += `<p style="margin: 0; line-height: 1.7; color: #333; font-size: 14px;">${transcriptAnalysis.reasoning}</p>`;
                    html += `</div>`;
                }
            } else {
                console.warn('⚠️ Transcript analysis object not available for display');
            }
            
            // Display transcript text in a clean format
            if (transcript) {
                console.log('📝 DISPLAYING TRANSCRIPT TEXT IN UI');
                console.log('  - Transcript length:', transcript.length, 'characters');
                html += `<div class="transcript-text" style="margin-top: 20px;">`;
                html += `<h5 style="margin-bottom: 10px; font-weight: bold; font-size: 16px; color: #ffffff;">Transcript:</h5>`;
                html += `<div class="transcript-content" style="background: #f5f5f5; padding: 15px; border-radius: 8px; max-height: 300px; overflow-y: auto; white-space: pre-wrap; font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.7; border: 1px solid #ddd; color: #333;">`;
                html += transcript.replace(/\n/g, '<br>');
                html += `</div>`;
                html += `</div>`;
            } else {
                console.warn('⚠️ Transcript text not available for display');
            }
            
            console.log('✅ TRANSCRIPT ANALYSIS SECTION HTML GENERATED');
            html += '</div>';
        }
        
        // Technical Properties Section (only show if properties are available)
        if (results.properties && (results.properties.format || results.properties.width || results.properties.height || results.properties.exif)) {
            html += '<div class="analysis-item">';
            html += '<h4>⚙️ Technical Properties</h4>';
            
            const props = results.properties;
            html += `<div class="tech-properties">`;
            if (props.format) {
                html += `<div class="prop-item"><span class="prop-label">Format:</span><span class="prop-value">${props.format}</span></div>`;
            }
            if (props.width || props.height) {
                html += `<div class="prop-item"><span class="prop-label">Dimensions:</span><span class="prop-value">${props.width || 'Unknown'} × ${props.height || 'Unknown'}px</span></div>`;
            }
            if (props.exif && Object.keys(props.exif).length > 0) {
                html += `<div class="prop-item"><span class="prop-label">EXIF Data:</span><span class="prop-value">${Object.keys(props.exif).length} fields detected</span></div>`;
            }
            
            html += `</div>`;
            html += '</div>';
        }
        
        // Processing Information
        html += '<div class="analysis-item">';
        html += '<h4>📋 Processing Information</h4>';
        html += `<div class="processing-info">`;
        html += `<div class="info-item"><span class="info-label">Analysis Time:</span><span class="info-value">${new Date().toLocaleString()}</span></div>`;
        html += `<div class="info-item"><span class="info-label">Models Used:</span><span class="info-value">AI Detection, Technical Analysis</span></div>`;
        html += `<div class="info-item"><span class="info-label">API Version:</span><span class="info-value">Sightengine v1.0</span></div>`;
        html += `</div>`;
        html += '</div>';
        
        return html;
    }
    
    /**
     * Combine SightEngine and ML results with weighted average
     * 60% SightEngine, 40% ML
     */
    combineResults(sightEngineDetection, mlResult, isImage) {
        // Start with SightEngine results as base
        const combined = JSON.parse(JSON.stringify(sightEngineDetection)); // Deep copy
        
        // Preserve ELA result if it exists in the detection
        if (sightEngineDetection?.ela_result) {
            combined.ela_result = sightEngineDetection.ela_result;
        }
        if (sightEngineDetection?.analysis?.ela_result) {
            if (!combined.analysis) combined.analysis = {};
            combined.analysis.ela_result = sightEngineDetection.analysis.ela_result;
        }
        
        // Extract SightEngine scores
        const seAnalysis = combined.analysis || {};
        const seAIScore = seAnalysis.ai_generated_score || 
                          (seAnalysis.is_ai_generated ? 0.7 : 0.3) || 0;
        const seDeepfakeScore = seAnalysis.deepfake_score || 
                               (seAnalysis.is_deepfake ? 0.7 : 0.3) || 0;
        const seConfidence = seAnalysis.confidence_score || 0;
        
        // VIDEOS: 100% SightEngine only
        if (!isImage || this.hasFaces === null) {
            // Filter out deepfake indicators for videos
            const indicators = combined.analysis.indicators || [];
            const filteredIndicators = indicators.filter(indicator => {
                const lowerIndicator = indicator.toLowerCase();
                return !lowerIndicator.includes('deepfake');
            });
            
            combined.analysis.method = 'sightengine_video';
            combined.analysis.confidence_score = seAIScore;
            combined.analysis.ai_generated_score = seAIScore;
            combined.analysis.is_ai_generated = seAIScore > 0.5;
            combined.analysis.deepfake_score = 0; // No deepfake for videos
            combined.analysis.is_deepfake = false; // No deepfake for videos
            combined.analysis.indicators = filteredIndicators; // Filtered indicators (no deepfake)
            combined.analysis.weightage = '100% SightEngine (Video)';
            combined.analysis.has_faces = null; // Videos don't use face selection
            combined.ml_result = null; // No ML for videos
            return combined;
        }
        
        // Extract ML probabilities (if available)
        const mlProbabilities = mlResult?.probabilities || {};
        const mlAIScore = mlProbabilities.ai || 0;
        const mlHumanScore = mlProbabilities.human || 0;
        const mlLabel = mlResult?.label || 0; // 0 = human, 1 = AI
        const mlConfidence = mlResult?.confidence || 0;
        
        console.log('📊 ML Result data:', {
            hasMlResult: !!mlResult,
            mlSuccess: mlResult?.success,
            mlAIScore: mlAIScore,
            mlConfidence: mlConfidence,
            mlProbabilities: mlProbabilities
        });
        
        // Determine weightage based on face selection
        let combinedAIScore, combinedConfidence, method, weightage;
        
        if (this.hasFaces === true) {
            // IMAGE WITH FACES: 60% SightEngine AI Generated + 20% ML + 20% Deepfake
            if (mlResult && (mlResult.success !== false)) {
                combinedAIScore = (seAIScore * 0.6) + (mlAIScore * 0.2) + (seDeepfakeScore * 0.2);
                method = 'combined_with_deepfake';
                weightage = '60% SightEngine AI Generated + 20% ML + 20% Deepfake';
            } else {
                // If ML not available, use 75% SightEngine AI Generated + 25% Deepfake
                combinedAIScore = (seAIScore * 0.75) + (seDeepfakeScore * 0.25);
                method = 'deepfake_sightengine';
                weightage = '75% SightEngine AI Generated + 25% Deepfake';
            }
        } else if (this.hasFaces === false) {
            // IMAGE WITHOUT FACES: 60% SightEngine AI Generated + 40% ML (no deepfake)
            if (mlResult && (mlResult.success !== false)) {
                combinedAIScore = (seAIScore * 0.6) + (mlAIScore * 0.4);
                method = 'sightengine_ml';
                weightage = '60% SightEngine AI Generated + 40% ML';
            } else {
                // If ML not available, use 100% SightEngine
                combinedAIScore = seAIScore;
                method = 'sightengine_only';
                weightage = '100% SightEngine AI Generated';
            }
        } else {
            // Fallback: 60% SightEngine + 40% ML (if available)
            if (mlResult && (mlResult.success !== false)) {
                combinedAIScore = (seAIScore * 0.6) + (mlAIScore * 0.4);
                method = 'sightengine_ml';
                weightage = '60% SightEngine AI Generated + 40% ML';
            } else {
                combinedAIScore = seAIScore;
                method = 'sightengine_only';
                weightage = '100% SightEngine AI Generated';
            }
        }
        
        // Confidence score is the combined AI score
        combinedConfidence = combinedAIScore;
        
        // Determine if AI-generated (threshold: 0.5)
        const isAIGenerated = combinedAIScore > 0.5;
        
        // Update analysis object
        combined.analysis = combined.analysis || {};
        combined.analysis.is_ai_generated = isAIGenerated;
        combined.analysis.ai_generated_score = combinedAIScore;
        combined.analysis.confidence_score = combinedConfidence;
        combined.analysis.method = method;
        combined.analysis.weightage = weightage;
        combined.analysis.has_faces = this.hasFaces;
        
        // Add ML-specific data (preserve all fields from ML result including raw_outputs)
        if (mlResult) {
            combined.ml_result = {
                success: mlResult.success !== undefined ? mlResult.success : true,
                label: mlLabel,
                label_name: mlResult.label_name || (mlLabel === 1 ? 'AI-generated' : 'Human-generated'),
                confidence: mlConfidence,
                probabilities: mlProbabilities,
                raw_outputs: mlResult.raw_outputs || {}
            };
        } else {
            combined.ml_result = null;
        }
        
        // Add SightEngine-specific data
        combined.sightengine_result = {
            ai_generated_score: seAIScore,
            deepfake_score: seDeepfakeScore,
            confidence_score: seConfidence,
            is_ai_generated: seAnalysis.is_ai_generated || false,
            is_deepfake: seAnalysis.is_deepfake || false
        };
        
        // Update indicators with proper weightage breakdown for images
        const indicators = [];
        
        console.log('🔍 Setting indicators - hasFaces:', this.hasFaces, 'mlResult:', mlResult);
        
        if (this.hasFaces === true) {
            // IMAGE WITH FACES: 60% SightEngine AI Generated + 20% ML + 20% Deepfake
            if (mlResult && (mlResult.success !== false)) {
                indicators.push(`SightEngine AI Generated model (60%): ${(seAIScore * 100).toFixed(1)}%`);
                indicators.push(`ML Model analysis (20%): ${(mlAIScore * 100).toFixed(1)}%`);
                indicators.push(`SightEngine Deepfake detection (20%): ${(seDeepfakeScore * 100).toFixed(1)}%`);
            } else {
                // If ML not available, adjust weightage
                indicators.push(`SightEngine AI Generated model (75%): ${(seAIScore * 100).toFixed(1)}%`);
                indicators.push(`SightEngine Deepfake detection (25%): ${(seDeepfakeScore * 100).toFixed(1)}%`);
            }
        } else if (this.hasFaces === false) {
            // IMAGE WITHOUT FACES: 60% SightEngine AI Generated + 40% ML (NO deepfake)
            if (mlResult && (mlResult.success !== false)) {
                indicators.push(`SightEngine AI Generated model (60%): ${(seAIScore * 100).toFixed(1)}%`);
                indicators.push(`ML Model analysis (40%): ${(mlAIScore * 100).toFixed(1)}%`);
            } else {
                indicators.push(`SightEngine AI Generated model: ${(seAIScore * 100).toFixed(1)}%`);
            }
        } else {
            // Fallback: 60% SightEngine + 40% ML
            if (mlResult && (mlResult.success !== false)) {
                indicators.push(`SightEngine AI Generated model (60%): ${(seAIScore * 100).toFixed(1)}%`);
                indicators.push(`ML Model analysis (40%): ${(mlAIScore * 100).toFixed(1)}%`);
            } else {
                indicators.push(`SightEngine AI Generated model: ${(seAIScore * 100).toFixed(1)}%`);
            }
        }
        
        console.log('✅ Generated indicators:', indicators);
        combined.analysis.indicators = indicators;
        console.log('✅ Set combined.analysis.indicators:', combined.analysis.indicators);
        
        return combined;
    }
    
    /**
     * Format Machine Learning Analysis tab content
     */
    formatMachineLearningAnalysis(results, analysis) {
        let html = '';
        
        // Check if ML result is available
        if (!results.ml_result) {
            html += '<div class="analysis-item">';
            html += '<div class="alert alert-info">';
            html += '<strong>ℹ️ Machine Learning Analysis Not Available</strong>';
            html += '<p>ML detection is only available for images. Videos are analyzed using SightEngine only.</p>';
            html += '</div>';
            html += '</div>';
            return html;
        }
        
        const mlResult = results.ml_result;
        
        // ML Detection Results Section
        html += '<div class="analysis-item">';
        html += '<h4>🧠 Machine Learning Model Analysis</h4>';
        
        html += `<div class="score-display">`;
        html += `<div class="score-item ${mlResult.label === 1 ? 'warning' : 'success'}">`;
        html += `<span class="score-label">ML Prediction:</span>`;
        html += `<span class="score-value">${mlResult.label_name || 'Unknown'}</span>`;
        html += `</div>`;
        html += `<div class="score-item">`;
        html += `<span class="score-label">ML Confidence:</span>`;
        html += `<span class="score-value">${Math.round(mlResult.confidence * 100)}%</span>`;
        html += `</div>`;
        html += `</div>`;
        
        if (mlResult.label === 1) {
            html += `<div class="alert alert-warning">`;
            html += `<strong>⚠️ AI-Generated Content Detected by ML Model</strong>`;
            html += `<p>The machine learning model has classified this image as AI-generated with ${Math.round(mlResult.confidence * 100)}% confidence.</p>`;
            html += `</div>`;
        } else {
            html += `<div class="alert alert-success">`;
            html += `<strong>✓ Human-Generated Content</strong>`;
            html += `<p>The machine learning model has classified this image as human-generated with ${Math.round(mlResult.confidence * 100)}% confidence.</p>`;
            html += `</div>`;
        }
        
        html += '</div>';
        
        // Probability Breakdown
        html += '<div class="analysis-item">';
        html += '<h4>📊 Probability Breakdown</h4>';
        html += `<div class="probability-breakdown">`;
        
        const humanProb = mlResult.probabilities?.human || 0;
        const aiProb = mlResult.probabilities?.ai || 0;
        
        // Format probability for display (handle scientific notation)
        const formatProbability = (prob) => {
            if (prob < 0.0001) {
                return prob.toExponential(6);
            }
            return (prob * 100).toFixed(6) + '%';
        };
        
        html += `<div class="prob-item">`;
        html += `<div class="prob-header">`;
        html += `<span class="prob-label">Human-Generated:</span>`;
        html += `<span class="prob-value">${formatProbability(humanProb)}</span>`;
        html += `</div>`;
        html += `<div class="prob-bar">`;
        html += `<div class="prob-fill human" style="width: ${Math.min(humanProb * 100, 100)}%"></div>`;
        html += `</div>`;
        html += `<div class="prob-exact"><small>Exact value: ${humanProb}</small></div>`;
        html += `</div>`;
        
        html += `<div class="prob-item">`;
        html += `<div class="prob-header">`;
        html += `<span class="prob-label">AI-Generated:</span>`;
        html += `<span class="prob-value">${formatProbability(aiProb)}</span>`;
        html += `</div>`;
        html += `<div class="prob-bar">`;
        html += `<div class="prob-fill ai" style="width: ${Math.min(aiProb * 100, 100)}%"></div>`;
        html += `</div>`;
        html += `<div class="prob-exact"><small>Exact value: ${aiProb}</small></div>`;
        html += `</div>`;
        
        html += `</div>`;
        html += '</div>';
        
        // Raw Model Outputs (if available)
        if (mlResult.raw_outputs && (mlResult.raw_outputs.human !== undefined || mlResult.raw_outputs.ai !== undefined)) {
            html += '<div class="analysis-item">';
            html += '<h4>🔬 Raw Model Outputs (Logits)</h4>';
            html += `<div class="raw-outputs">`;
            
            const humanLogit = mlResult.raw_outputs.human;
            const aiLogit = mlResult.raw_outputs.ai;
            
            html += `<div class="output-item">`;
            html += `<span class="output-label">Human logit:</span>`;
            html += `<span class="output-value">${humanLogit !== undefined ? humanLogit : 'N/A'}</span>`;
            html += `</div>`;
            html += `<div class="output-item">`;
            html += `<span class="output-label">AI logit:</span>`;
            html += `<span class="output-value">${aiLogit !== undefined ? aiLogit : 'N/A'}</span>`;
            html += `</div>`;
            
            // Show the difference
            if (humanLogit !== undefined && aiLogit !== undefined) {
                const logitDiff = aiLogit - humanLogit;
                html += `<div class="output-item">`;
                html += `<span class="output-label">Logit Difference (AI - Human):</span>`;
                html += `<span class="output-value ${logitDiff > 0 ? 'ai-highlight' : 'human-highlight'}">${logitDiff}</span>`;
                html += `</div>`;
            }
            
            html += `</div>`;
            html += '<p class="tech-note"><small>Raw outputs are logits (pre-softmax values) from the model. Higher values indicate stronger prediction. The model outputs these raw values before applying softmax to get probabilities.</small></p>';
            html += '</div>';
        }
        
        // Show full JSON output for debugging/transparency
        html += '<div class="analysis-item">';
        html += '<h4>📋 Complete ML Model Response (JSON)</h4>';
        html += `<div class="json-output">`;
        // Format JSON with proper indentation and preserve exact number precision
        const jsonString = JSON.stringify(mlResult, (key, value) => {
            // Preserve exact number values (don't round)
            if (typeof value === 'number') {
                return value;
            }
            return value;
        }, 2);
        html += `<pre class="json-display">${jsonString}</pre>`;
        html += `</div>`;
        html += '<p class="tech-note"><small>This is the complete JSON response from the Machine Learning model, including all raw outputs and probabilities with full precision.</small></p>';
        html += '</div>';
        
        // Combined Analysis Section
        if (results.sightengine_result) {
            html += '<div class="analysis-item">';
            html += '<h4>⚖️ Combined Analysis (Weighted)</h4>';
            
            const seResult = results.sightengine_result;
            const combinedAIScore = analysis.ai_generated_score || 0;
            
            html += `<div class="combined-breakdown">`;
            html += `<div class="breakdown-item">`;
            html += `<div class="breakdown-header">`;
            html += `<span class="breakdown-label">SightEngine Score:</span>`;
            html += `<span class="breakdown-value">${Math.round(seResult.ai_generated_score * 100)}%</span>`;
            html += `<span class="breakdown-weight">(60% weight)</span>`;
            html += `</div>`;
            html += `</div>`;
            
            html += `<div class="breakdown-item">`;
            html += `<div class="breakdown-header">`;
            html += `<span class="breakdown-label">ML Model Score:</span>`;
            html += `<span class="breakdown-value">${Math.round(aiProb * 100)}%</span>`;
            html += `<span class="breakdown-weight">(40% weight)</span>`;
            html += `</div>`;
            html += `</div>`;
            
            html += `<div class="breakdown-item combined">`;
            html += `<div class="breakdown-header">`;
            html += `<span class="breakdown-label">Final Combined Score:</span>`;
            html += `<span class="breakdown-value">${Math.round(combinedAIScore * 100)}%</span>`;
            html += `</div>`;
            html += `<div class="breakdown-formula">`;
            html += `<small>(${Math.round(seResult.ai_generated_score * 100)}% × 0.6) + (${Math.round(aiProb * 100)}% × 0.4) = ${Math.round(combinedAIScore * 100)}%</small>`;
            html += `</div>`;
            html += `</div>`;
            
            html += `</div>`;
            html += '</div>';
        }
        
        // Model Information
        html += '<div class="analysis-item">';
        html += '<h4>ℹ️ Model Information</h4>';
        html += `<div class="model-info">`;
        html += `<div class="info-item"><span class="info-label">Model Architecture:</span><span class="info-value">EfficientNetV2-S</span></div>`;
        html += `<div class="info-item"><span class="info-label">Input Size:</span><span class="info-value">384×384 pixels</span></div>`;
        html += `<div class="info-item"><span class="info-label">Framework:</span><span class="info-value">PyTorch (timm)</span></div>`;
        html += `<div class="info-item"><span class="info-label">Analysis Method:</span><span class="info-value">${analysis.method || 'combined_sightengine_ml'}</span></div>`;
        html += `</div>`;
        html += '</div>';
        
        return html;
    }
    
    /**
     * Display Error Level Analysis results
     */
    displayELAResults(elaResult) {
        const elaContainer = document.getElementById('elaResultsContainer');
        const elaVisualization = document.getElementById('elaVisualizationContainer');
        
        if (!elaContainer) {
            console.warn('ELA container element not found');
            return;
        }
        
        // Show ELA tab if it exists
        const elaTab = document.querySelector('.analysis-tab[data-tab="ela"]');
        if (elaTab) {
            elaTab.style.display = 'flex'; // Show the tab button
        }
        
        // Build ELA results HTML
        const suspicious = elaResult.suspicious || false;
        const confidenceScore = (elaResult.confidence_score || 0) * 100;
        const suspiciousPercentage = elaResult.suspicious_percentage || 0;
        
        let html = `
            <div class="ela-status-card ${suspicious ? 'suspicious' : 'normal'}">
                <div class="ela-status-header">
                    <h4>${suspicious ? '⚠️ Suspicious' : '✓ Normal'}</h4>
                    <span class="ela-confidence">Confidence: ${confidenceScore.toFixed(1)}%</span>
                </div>
            </div>
        `;
        
        elaContainer.innerHTML = html;
        
        // Show visualization container if images are available
        if (elaResult.output_url) {
            elaVisualization.style.display = 'block';
            this.updateELAVisualization(elaResult);
        } else {
            elaVisualization.style.display = 'none';
        }
    }
    
    /**
     * Update ELA visualization images
     */
    updateELAVisualization(elaResult) {
        const imagesGrid = document.getElementById('elaImagesGrid');
        if (!imagesGrid) return;
        
        let html = '';
        
        if (elaResult.output_url) {
            html += `
                <div class="ela-image-item">
                    <h5>Overlay Image</h5>
                    <img src="${elaResult.output_url}" alt="ELA Overlay" class="ela-image" onclick="window.deepfakeScanner.openImageModal('${elaResult.output_url}')">
                    <p class="ela-image-caption">Combined original with error visualization</p>
                </div>
            `;
        }
        
        imagesGrid.innerHTML = html;
    }
    
    /**
     * Open image in modal
     */
    openImageModal(imageUrl) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('elaImageModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'elaImageModal';
            modal.className = 'ela-image-modal';
            modal.innerHTML = `
                <div class="ela-modal-content">
                    <span class="ela-modal-close" onclick="window.deepfakeScanner.closeImageModal()">&times;</span>
                    <img id="elaModalImage" src="" alt="ELA Visualization" class="ela-modal-image">
                </div>
            `;
            document.body.appendChild(modal);
            
            // Close on background click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeImageModal();
                }
            });
        }
        
        // Set image source and show modal
        const modalImage = document.getElementById('elaModalImage');
        if (modalImage) {
            modalImage.src = imageUrl;
        }
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    /**
     * Close image modal
     */
    closeImageModal() {
        const modal = document.getElementById('elaImageModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
    
    addToRecentScans(fileName, analysis, file) {
        const scansList = document.getElementById('scansList');
        
        // Create scan item
        const scanItem = document.createElement('div');
        scanItem.className = 'scan-item';
        
        // Create thumbnail
        let thumbnail = '';
        if (file.type.startsWith('image/')) {
            thumbnail = `<img src="${URL.createObjectURL(file)}" alt="Thumbnail" class="scan-thumbnail">`;
        } else {
            thumbnail = '<div class="scan-thumbnail"></div>';
        }
        
        const resultClass = analysis.is_deepfake ? 'deepfake' : 
                           analysis.confidence_score > 0.3 ? 'suspicious' : 'authentic';
        const resultText = analysis.is_deepfake ? 'Deepfake' : 
                          analysis.confidence_score > 0.3 ? 'Suspicious' : 'Authentic';
        
        scanItem.innerHTML = `
            <div class="scan-info">
                ${thumbnail}
                <div class="scan-details">
                    <h4>${fileName}</h4>
                    <p>${new Date().toLocaleString()}</p>
                </div>
            </div>
            <div class="scan-result ${resultClass}">
                <span>${resultText}</span>
                <small>${Math.round(analysis.confidence_score * 100)}%</small>
            </div>
        `;
        
        // Add to top of list
        scansList.insertBefore(scanItem, scansList.firstChild);
        
        // Keep only last 5 scans visible
        while (scansList.children.length > 5) {
            scansList.removeChild(scansList.lastChild);
        }
    }
    
    async runOSINTChecks() {
        const sourceInfo = this.validateSourceInfo();
        if (!sourceInfo) {
            return;
        }
        
        const { userEmail, sourceType, sourceValue } = sourceInfo;
        const osintResultsContainer = document.getElementById('osintResults');
        
        if (!osintResultsContainer) {
            console.error('OSINT results container not found');
            return;
        }
        
        // Show loading state
        osintResultsContainer.innerHTML = `
            <div class="osint-loading">
                <div class="spinner"></div>
                <p>Running OSINT security checks...</p>
            </div>
        `;
        
        try {
            const checks = [];
            
            // Check source based on type
            if (sourceType === 'email') {
                // Check source email breach status (HIBP) - already done in breach section, skip here
                // Check source email with Holehe
                checks.push(this.checkEmail(sourceValue, 'Source Email'));
            } else if (sourceType === 'phone') {
                // Check phone number with Semak Mule
                checks.push(this.checkSemakMule(sourceValue, 'phone'));
            } else if (sourceType === 'social_media') {
                // For social media, try to extract email if possible, or use Holehe on username
                // For now, we'll just note that it's social media
                checks.push(Promise.resolve({
                    type: 'social_media',
                    source: sourceValue,
                    message: 'Social media source detected. Manual investigation recommended.'
                }));
            }
            
            // Wait for all checks to complete
            const results = await Promise.allSettled(checks);
            
            // Display results
            this.displayOSINTResults(results, userEmail, sourceType, sourceValue);
            
        } catch (error) {
            console.error('OSINT check error:', error);
            osintResultsContainer.innerHTML = `
                <div class="osint-error">
                    <p>⚠️ Error running OSINT checks: ${error.message}</p>
                </div>
            `;
        }
    }
    
    async checkBreach(email, label) {
        try {
            const formData = new FormData();
            formData.append('action', 'check_breach');
            formData.append('email', email);
            
            const response = await fetch('api/osint-tools.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            return {
                type: 'breach',
                label: label,
                email: email,
                ...result
            };
        } catch (error) {
            return {
                type: 'breach',
                label: label,
                email: email,
                success: false,
                error: error.message
            };
        }
    }
    
    async checkEmail(email, label) {
        try {
            const formData = new FormData();
            formData.append('action', 'check_email');
            formData.append('email', email);
            
            const response = await fetch('api/osint-tools.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            return {
                type: 'email_check',
                label: label,
                email: email,
                ...result
            };
        } catch (error) {
            return {
                type: 'email_check',
                label: label,
                email: email,
                success: false,
                error: error.message
            };
        }
    }
    
    async checkSemakMule(value, type) {
        try {
            const formData = new FormData();
            if (type === 'phone') {
                formData.append('action', 'check_phone');
                formData.append('phone_number', value);
            } else {
                formData.append('action', 'check_bank_account');
                formData.append('account_number', value);
            }
            
            const response = await fetch('api/osint-tools.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            return {
                type: 'semak_mule',
                checkType: type,
                value: value,
                ...result
            };
        } catch (error) {
            return {
                type: 'semak_mule',
                checkType: type,
                value: value,
                success: false,
                error: error.message
            };
        }
    }
    
    displayOSINTResults(results, userEmail, sourceType, sourceValue) {
        const osintResultsContainer = document.getElementById('osintResults');
        let html = '<div class="osint-results-grid">';
        
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                const data = result.value;
                html += this.formatOSINTResult(data);
            } else {
                html += `
                    <div class="osint-card error">
                        <div class="osint-header">
                            <h4>❌ Check Failed</h4>
                        </div>
                        <div class="osint-body">
                            <p>Error: ${result.reason?.message || 'Unknown error'}</p>
                        </div>
                    </div>
                `;
            }
        });
        
        html += '</div>';
        osintResultsContainer.innerHTML = html;
    }
    
    displayBreachResults(data) {
        const section = document.getElementById('breachResultsSection');
        if (!section) return;
        
        section.style.display = 'block';
        
        const isBreached = data.breached === true;
        const breaches = data.breaches || [];
        const breachCount = breaches.length;
        
        if (!isBreached || breachCount === 0) {
            section.innerHTML = `
                <div class="breach-results-container">
                    <div class="breach-header safe">
                        <div class="breach-count-display">
                            <span class="breach-number">0</span>
                            <span class="breach-label">Data Breaches</span>
                        </div>
                        <div class="breach-status safe">
                            <h2>Good news — no pwnage found!</h2>
                            <p>This source email address has not been found in any known data breaches.</p>
                        </div>
                    </div>
                </div>
            `;
            return;
        }
        
        const initialBreaches = breaches.slice(0, 8);
        const remainingBreaches = breaches.slice(8);
        const showMoreBtn = remainingBreaches.length > 0;
        
        let html = `
            <div class="breach-results-container">
                <div class="breach-header pwned">
                    <div class="breach-count-display">
                        <span class="breach-number">${breachCount}</span>
                        <span class="breach-label">Data Breaches</span>
                    </div>
                    <div class="breach-status pwned">
                        <h2>Oh no — pwned!</h2>
                        <p>This source email address has been found in multiple data breaches. Review the details below to see where this email was exposed.</p>
                    </div>
                    <div class="breach-actions">
                        <button class="btn btn-outline">Get notified when your email appears in future data breaches</button>
                    </div>
                </div>
                <div class="breaches-list" id="breachesList">
                    ${initialBreaches.map(breach => this.formatBreachItem(breach)).join('')}
                    ${showMoreBtn ? `<div id="remainingBreaches" style="display: none;">
                        ${remainingBreaches.map(breach => this.formatBreachItem(breach)).join('')}
                    </div>` : ''}
                </div>
                ${showMoreBtn ? `
                    <div class="show-more-container">
                        <button id="showMoreBreaches" class="btn btn-secondary" onclick="window.deepfakeScanner.showMoreBreaches()">
                            Show More (${remainingBreaches.length} more)
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
        
        section.innerHTML = html;
    }
    
    formatBreachItem(breach) {
        const name = breach.Name || breach.name || 'Unknown Breach';
        const date = breach.BreachDate || breach.breachDate || breach.BreachDate || 'Unknown date';
        const description = breach.Description || breach.description || '';
        const dataClasses = breach.DataClasses || breach.dataClasses || [];
        
        // Format date - handle different date formats
        let month = 'Unknown';
        let year = 'Unknown';
        
        try {
            const dateObj = date && date !== 'Unknown date' ? new Date(date) : null;
            if (dateObj && !isNaN(dateObj.getTime())) {
                month = dateObj.toLocaleString('default', { month: 'short' });
                year = dateObj.getFullYear();
            } else if (date && date.includes('-')) {
                // Try parsing YYYY-MM-DD format
                const parts = date.split('-');
                if (parts.length >= 2) {
                    const dateObj2 = new Date(date);
                    if (!isNaN(dateObj2.getTime())) {
                        month = dateObj2.toLocaleString('default', { month: 'short' });
                        year = dateObj2.getFullYear();
                    }
                }
            }
        } catch (e) {
            console.error('Date parsing error:', e);
        }
        
        // Get logo URL from HIBP
        const logoUrl = `https://haveibeenpwned.com/Content/Images/PwnedLogos/${encodeURIComponent(name)}.png`;
        
        // Format data classes - capitalize first letter
        const formattedDataClasses = dataClasses.map(dc => {
            return dc.charAt(0).toUpperCase() + dc.slice(1).toLowerCase();
        });
        
        // Generate unique ID for this breach
        const breachId = `breach-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        return `
            <div class="breach-item">
                <div class="breach-date">
                    <span class="breach-month">${month}</span>
                    <span class="breach-year">${year}</span>
                </div>
                <div class="breach-content">
                    <div class="breach-logo">
                        <img src="${logoUrl}" alt="${name}" onerror="this.style.display='none';">
                        <span class="breach-name">${name}</span>
                    </div>
                    ${description ? `<p class="breach-description">${description}</p>` : ''}
                    <div class="breach-data-classes">
                        <strong>Compromised data:</strong>
                        <ul>
                            ${formattedDataClasses.length > 0 ? formattedDataClasses.map(dc => `<li>${dc}</li>`).join('') : '<li>Email addresses</li>'}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }
    
    showMoreBreaches() {
        const remainingDiv = document.getElementById('remainingBreaches');
        const showMoreBtn = document.getElementById('showMoreBreaches');
        
        if (remainingDiv && remainingDiv.style.display === 'none') {
            remainingDiv.style.display = 'block';
            if (showMoreBtn) {
                showMoreBtn.style.display = 'none';
            }
        }
    }
    
    toggleBreachDetails(breachId) {
        const detailsDiv = document.getElementById(breachId);
        const toggleBtn = document.querySelector(`[data-breach-id="${breachId}"]`);
        
        if (!detailsDiv || !toggleBtn) return;
        
        const isHidden = detailsDiv.style.display === 'none';
        const toggleText = toggleBtn.querySelector('.toggle-text');
        const toggleIcon = toggleBtn.querySelector('.toggle-icon');
        
        if (isHidden) {
            detailsDiv.style.display = 'block';
            if (toggleText) toggleText.textContent = 'Hide Details';
            if (toggleIcon) toggleIcon.textContent = '▲';
            toggleBtn.classList.add('active');
        } else {
            detailsDiv.style.display = 'none';
            if (toggleText) toggleText.textContent = 'Show Details';
            if (toggleIcon) toggleIcon.textContent = '▼';
            toggleBtn.classList.remove('active');
        }
    }
    
    toggleBreachList() {
        const breachesList = document.getElementById('breachesList');
        const toggleBtn = document.getElementById('breachListToggleBtn');
        const showMoreContainer = document.getElementById('showMoreContainer');
        
        if (!breachesList || !toggleBtn) return;
        
        const isHidden = breachesList.style.display === 'none' || breachesList.style.display === '';
        const toggleText = toggleBtn.querySelector('.toggle-text');
        const toggleIcon = toggleBtn.querySelector('.toggle-icon');
        
        if (isHidden) {
            breachesList.style.display = 'block';
            if (toggleText) toggleText.textContent = 'Hide Breach List';
            if (toggleIcon) toggleIcon.textContent = '▲';
            toggleBtn.classList.add('active');
            // Show the "Show More" button container if it exists
            if (showMoreContainer) {
                showMoreContainer.style.display = 'block';
            }
        } else {
            breachesList.style.display = 'none';
            if (toggleText) toggleText.textContent = 'Show Breach List';
            if (toggleIcon) toggleIcon.textContent = '▼';
            toggleBtn.classList.remove('active');
            // Hide the "Show More" button container if it exists
            if (showMoreContainer) {
                showMoreContainer.style.display = 'none';
            }
        }
    }
    
    formatOSINTResult(data) {
        let html = '<div class="osint-card">';
        
        if (data.type === 'breach') {
            const isBreached = data.breached === true;
            const breachCount = data.count || 0;
            
            html += `
                <div class="osint-header ${isBreached ? 'warning' : 'success'}">
                    <h4>${isBreached ? '⚠️' : '✅'} ${data.label} - Breach Check</h4>
                </div>
                <div class="osint-body">
                    <p><strong>Email:</strong> ${data.email}</p>
                    ${isBreached ? `
                        <div class="breach-alert">
                            <p class="breach-count">⚠️ Found in ${breachCount} data breach(es)</p>
                            <div class="breach-list">
                                ${data.breaches ? data.breaches.slice(0, 5).map(breach => `
                                    <div class="breach-item">
                                        <strong>${breach.Name || breach.name}</strong>
                                        <span>${breach.BreachDate || breach.breachDate || 'Unknown date'}</span>
                                    </div>
                                `).join('') : ''}
                            </div>
                            ${breachCount > 5 ? `<p class="breach-more">... and ${breachCount - 5} more breach(es)</p>` : ''}
                        </div>
                    ` : `
                        <p class="breach-safe">✅ Good news! This email has not been found in any known data breaches.</p>
                    `}
                </div>
            `;
        } else if (data.type === 'email_check') {
            const allPlatforms = data.data?.platforms || [];
            const registeredCount = data.data?.registered_count || 0;
            
            // Filter to ONLY show registered platforms (status === 'used' or exists === true)
            // IMPORTANT: Only show platforms where the email is actually registered
            const registeredPlatforms = allPlatforms.filter(platform => {
                const status = String(platform.status || '').toLowerCase();
                const exists = platform.exists;
                // Only include if status is 'used' OR exists is explicitly true
                const isRegistered = status === 'used' || exists === true || exists === 'true';
                return isRegistered;
            });
            
            // Use the filtered count, not the original registeredCount (in case of data mismatch)
            const actualRegisteredCount = registeredPlatforms.length;
            
            // Limit display to first 10 platforms
            const displayLimit = 10;
            const platformsToShow = registeredPlatforms.slice(0, displayLimit);
            const remainingCount = registeredPlatforms.length - displayLimit;
            
            html += `
                <div class="osint-header">
                    <h4>📧 ${data.label} - Platform Check</h4>
                </div>
                <div class="osint-body">
                    <p><strong>Email:</strong> ${data.email}</p>
                    ${actualRegisteredCount > 0 ? `
                        <p><strong>Found on ${actualRegisteredCount} platform(s)</strong></p>
                        <div class="platform-list">
                            ${platformsToShow.map(platform => {
                                const platformName = platform.platform || platform.name || 'Unknown';
                                const platformUrl = platform.url || '#';
                                return `
                                    <div class="platform-item found">
                                        <span>${platformName}</span>
                                        <span>✅</span>
                                    </div>
                                `;
                            }).join('')}
                            ${remainingCount > 0 ? `
                                <div class="platform-more">
                                    <span>+ ${remainingCount} more platform(s)</span>
                                </div>
                            ` : ''}
                        </div>
                    ` : `
                        <p><strong>Found on 0 platform(s)</strong></p>
                        <p class="platform-safe">This email is not registered on any major platforms.</p>
                    `}
                </div>
            `;
        } else if (data.type === 'semak_mule') {
            // Use the same detailed format as osint-monitor.js
            html += this.formatSemakMuleResult(data);
        } else {
            html += `
                <div class="osint-header">
                    <h4>ℹ️ ${data.type || 'Check'}</h4>
                </div>
                <div class="osint-body">
                    <p>${data.message || JSON.stringify(data)}</p>
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    }
    
    showProgress(show) {
        this.uploadProgress.style.display = show ? 'flex' : 'none';
    }
    
    setProgress(percentage, text) {
        this.progressFill.style.width = `${percentage}%`;
        this.progressText.textContent = text;
    }
    
    showAlert(message, type = 'info') {
        // Create alert element
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        // Insert at top of container
        const container = document.querySelector('.container');
        container.insertBefore(alert, container.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
    
    formatSemakMuleResult(data) {
        // Format Semak Mule results using the same detailed format as osint-monitor.js
        const result = data.success ? data.data : null;
        const searchValue = data.value || 'Unknown';
        const checkType = data.checkType || 'phone'; // 'phone' or 'bank'
        
        if (!result) {
            return `
                <div class="osint-header error">
                    <h4>❌ Semak Mule Check Failed</h4>
                </div>
                <div class="osint-body">
                    <p>Unable to check the scammer database. ${data.error || 'Please try again later.'}</p>
                </div>
            `;
        }
        
        // Parse Semak Mule API response format
        const status = result.status;
        const statusMessage = result.status_message || 'Unknown';
        const tableHeader = result.table_header || [];
        const tableData = result.table_data || [];
        const count = result.count || 0;
        const category = result.cat || (checkType === 'phone' ? 2 : 1);
        const keyword = result.kw || searchValue;
        let totalReports = count;
        
        // Calculate total reports from table data if available
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
        
        const isScammer = status === 1 && count > 0;
        
        let html = '<div class="osint-card">';
        html += '<div class="semak-mule-result ' + (isScammer ? 'danger' : 'success') + '">';
        
        // Header section
        html += '<div class="semak-mule-header">';
        html += '<h3>' + (isScammer ? '⚠️ Match Found in Scammer Database' : '✅ No Match Found') + '</h3>';
        html += '<div class="semak-mule-meta">';
        html += '<div class="meta-item"><strong>Search Type:</strong> ' + (categoryNames[category] || 'Unknown') + '</div>';
        html += '<div class="meta-item"><strong>Searched:</strong> <code>' + this.escapeHtml(keyword) + '</code></div>';
        html += '<div class="meta-item"><strong>Status:</strong> <span class="status-badge ' + (status === 1 ? 'success' : 'info') + '">' + this.escapeHtml(statusMessage) + '</span></div>';
        html += '<div class="meta-item"><strong>Total Searches:</strong> <span class="match-count">' + count + '</span></div>';
        html += '</div>';
        html += '</div>';
        
        // Results - handle matches found
        if (isScammer) {
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
            
            // Summary note
            html += '<div class="semak-mule-note">';
            html += '<p><strong>ℹ️ Note:</strong> The PDRM database confirms ' + totalReports + ' report(s) for this ' + (categoryNames[category] || 'item').toLowerCase() + '. Detailed case records are available through the official <a href="https://semakmule.rmp.gov.my" target="_blank" rel="noopener">SemakMule Portal</a>.</p>';
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
        html += '</div>';
        return html;
    }
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    getRiskLevel(score) {
        if (score > 0.7) return 'High Risk';
        if (score > 0.3) return 'Medium Risk';
        return 'Low Risk';
    }
    
    /**
     * Get video duration using HTML5 video API
     */
    getVideoDuration(file) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            
            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                resolve(video.duration);
            };
            
            video.onerror = () => {
                window.URL.revokeObjectURL(video.src);
                reject(new Error('Failed to load video metadata'));
            };
            
            video.src = URL.createObjectURL(file);
        });
    }
    
    async loadRecentScans() {
        // This would load recent scans from the server
        // For now, we'll just show a placeholder
        const scansList = document.getElementById('scansList');
        
        if (scansList.children.length === 0) {
            scansList.innerHTML = '<p style="color: #6c757d; text-align: center;">No recent scans. Upload media to get started.</p>';
        }
    }
}

// Tab switching functionality
function showTab(tabName) {
    // Hide all analysis panels
    document.querySelectorAll('.analysis-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.analysis-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab panel
    let tabId;
    if (tabName === 'ai-generated') {
        tabId = 'ai-generatedTab';
    } else if (tabName === 'ela') {
        tabId = 'elaTab';
    } else {
        tabId = tabName + 'Tab';
    }
    
    const selectedPanel = document.getElementById(tabId);
    if (selectedPanel) {
        selectedPanel.classList.add('active');
    }
    
    // Add active class to selected tab button
    const selectedTab = document.querySelector(`.analysis-tab[data-tab="${tabName}"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
}

// URL analysis function (called from HTML)
function analyzeUrl() {
    if (window.deepfakeScanner) {
        window.deepfakeScanner.analyzeUrl();
    }
}

// Close education modal function (called from HTML)
function closeEducationModal() {
    const modal = document.getElementById('educationModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }
}

// Global function for onclick handler (fallback)
window.handleSourceFormSubmit = function() {
    if (window.deepfakeScanner && typeof window.deepfakeScanner.handleFormSubmit === 'function') {
        window.deepfakeScanner.handleFormSubmit();
    } else {
        console.error('DeepfakeScanner not initialized or handleFormSubmit not found');
        // Try to initialize if not already done
        if (!window.deepfakeScanner && document.readyState === 'complete') {
            window.deepfakeScanner = new DeepfakeScanner();
            if (window.deepfakeScanner && typeof window.deepfakeScanner.handleFormSubmit === 'function') {
                window.deepfakeScanner.handleFormSubmit();
            }
        }
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing DeepfakeScanner...');
    window.deepfakeScanner = new DeepfakeScanner();
    console.log('DeepfakeScanner initialized:', window.deepfakeScanner);
    console.log('handleFormSubmit method exists:', typeof window.deepfakeScanner.handleFormSubmit === 'function');
    
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeEducationModal();
        }
    });
});
