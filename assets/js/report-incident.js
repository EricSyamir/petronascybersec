// Report Incident JavaScript Module
class IncidentReporter {
    constructor() {
        this.selectedFiles = [];
        this.maxFiles = 10;
        this.maxFileSize = 50 * 1024 * 1024; // 50MB
        this.allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
            'application/pdf', 'text/plain', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        this.initializeEventListeners();
        this.setupFormValidation();
    }
    
    initializeEventListeners() {
        // File upload handling
        const fileInput = document.getElementById('evidenceFiles');
        const uploadArea = document.getElementById('evidenceUpload');
        
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileSelection(e.target.files);
            });
        }
        
        if (uploadArea) {
            // Drag and drop functionality
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });
            
            uploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                this.handleFileSelection(e.dataTransfer.files);
            });
        }
        
        // Form submission
        const form = document.getElementById('incidentForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }
        
        // Character counters
        this.setupCharacterCounters();
        
        // Real-time validation
        this.setupRealtimeValidation();
    }
    
    handleFileSelection(files) {
        const newFiles = Array.from(files);
        
        // Validate file count
        if (this.selectedFiles.length + newFiles.length > this.maxFiles) {
            this.showAlert(`Maximum ${this.maxFiles} files allowed`, 'warning');
            return;
        }
        
        // Validate and add files
        const validFiles = [];
        for (const file of newFiles) {
            const validation = this.validateFile(file);
            if (validation.valid) {
                validFiles.push(file);
            } else {
                this.showAlert(`${file.name}: ${validation.message}`, 'danger');
            }
        }
        
        if (validFiles.length > 0) {
            this.selectedFiles = [...this.selectedFiles, ...validFiles];
            this.updateFilesList();
            this.analyzeFilesForDeepfake(validFiles);
        }
    }
    
    validateFile(file) {
        if (!this.allowedTypes.includes(file.type)) {
            return {
                valid: false,
                message: 'Invalid file type. Please upload images, videos, or documents only.'
            };
        }
        
        if (file.size > this.maxFileSize) {
            return {
                valid: false,
                message: 'File too large. Maximum size is 50MB.'
            };
        }
        
        // Check for duplicate names
        if (this.selectedFiles.some(f => f.name === file.name)) {
            return {
                valid: false,
                message: 'File already selected.'
            };
        }
        
        return { valid: true };
    }
    
    updateFilesList() {
        const filesList = document.getElementById('filesList');
        const filesContainer = document.getElementById('filesContainer');
        
        if (!filesList || !filesContainer) return;
        
        if (this.selectedFiles.length === 0) {
            filesList.style.display = 'none';
            return;
        }
        
        filesList.style.display = 'block';
        filesContainer.innerHTML = '';
        
        this.selectedFiles.forEach((file, index) => {
            const fileItem = this.createFileItem(file, index);
            filesContainer.appendChild(fileItem);
        });
    }
    
    createFileItem(file, index) {
        const item = document.createElement('div');
        item.className = 'file-item';
        
        const fileIcon = this.getFileIcon(file.type);
        const fileSize = this.formatFileSize(file.size);
        
        item.innerHTML = `
            <div class="file-info">
                <div class="file-icon">${fileIcon}</div>
                <div class="file-details">
                    <h5>${file.name}</h5>
                    <p>${fileSize} • ${file.type}</p>
                </div>
            </div>
            <div class="file-actions">
                <button type="button" class="file-remove" onclick="incidentReporter.removeFile(${index})">
                    Remove
                </button>
            </div>
        `;
        
        return item;
    }
    
    getFileIcon(mimeType) {
        if (mimeType.startsWith('image/')) return '🖼️';
        if (mimeType.startsWith('video/')) return '🎥';
        if (mimeType === 'application/pdf') return '📄';
        if (mimeType.includes('word')) return '📝';
        if (mimeType === 'text/plain') return '📄';
        return '📎';
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    removeFile(index) {
        this.selectedFiles.splice(index, 1);
        this.updateFilesList();
    }
    
    async analyzeFilesForDeepfake(files) {
        for (const file of files) {
            if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                try {
                    await this.analyzeFileForDeepfake(file);
                } catch (error) {
                    console.error('Deepfake analysis error:', error);
                }
            }
        }
    }
    
    async analyzeFileForDeepfake(file) {
        // This would integrate with the deepfake scanner API
        // For demo purposes, we'll simulate the analysis
        
        const analysisResult = {
            is_deepfake: Math.random() > 0.8, // 20% chance of being flagged
            confidence_score: Math.random(),
            indicators: []
        };
        
        if (analysisResult.is_deepfake) {
            analysisResult.indicators.push('AI-generated content detected');
        }
        
        this.displayDeepfakeResult(file, analysisResult);
    }
    
    displayDeepfakeResult(file, result) {
        // Find the file item and add analysis result
        const filesContainer = document.getElementById('filesContainer');
        const fileItems = filesContainer.querySelectorAll('.file-item');
        
        fileItems.forEach(item => {
            const fileName = item.querySelector('h5').textContent;
            if (fileName === file.name) {
                const resultDiv = document.createElement('div');
                resultDiv.className = `deepfake-result ${result.is_deepfake ? 'danger' : 'safe'}`;
                
                if (result.is_deepfake) {
                    resultDiv.innerHTML = `
                        <h5>⚠️ Potential Deepfake Detected</h5>
                        <p>Confidence: ${Math.round(result.confidence_score * 100)}% - This content may be artificially generated</p>
                    `;
                } else {
                    resultDiv.innerHTML = `
                        <h5>✅ Content Appears Authentic</h5>
                        <p>No signs of AI generation detected</p>
                    `;
                }
                
                item.appendChild(resultDiv);
            }
        });
    }
    
    setupCharacterCounters() {
        const textareas = document.querySelectorAll('.form-textarea[maxlength]');
        const inputs = document.querySelectorAll('.form-input[maxlength]');
        
        [...textareas, ...inputs].forEach(element => {
            const maxLength = parseInt(element.getAttribute('maxlength'));
            if (maxLength) {
                this.addCharacterCounter(element, maxLength);
            }
        });
    }
    
    addCharacterCounter(element, maxLength) {
        const counter = document.createElement('div');
        counter.className = 'char-counter';
        element.parentNode.appendChild(counter);
        
        const updateCounter = () => {
            const current = element.value.length;
            counter.textContent = `${current}/${maxLength}`;
            
            counter.className = 'char-counter';
            if (current > maxLength * 0.9) {
                counter.classList.add('warning');
            }
            if (current >= maxLength) {
                counter.classList.add('danger');
            }
        };
        
        element.addEventListener('input', updateCounter);
        updateCounter();
    }
    
    setupRealtimeValidation() {
        const requiredFields = document.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            field.addEventListener('blur', () => {
                this.validateField(field);
            });
            
            field.addEventListener('input', () => {
                this.clearFieldError(field);
            });
        });
        
        // Email validation
        const emailFields = document.querySelectorAll('input[type="email"]');
        emailFields.forEach(field => {
            field.addEventListener('blur', () => {
                this.validateEmail(field);
            });
        });
    }
    
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let message = '';
        
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            message = 'This field is required';
        }
        
        if (isValid && field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                message = 'Please enter a valid email address';
            }
        }
        
        this.updateFieldValidation(field, isValid, message);
        return isValid;
    }
    
    validateEmail(field) {
        const value = field.value.trim();
        if (value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const isValid = emailRegex.test(value);
            this.updateFieldValidation(field, isValid, isValid ? '' : 'Please enter a valid email address');
        }
    }
    
    updateFieldValidation(field, isValid, message) {
        field.classList.remove('invalid', 'valid');
        field.classList.add(isValid ? 'valid' : 'invalid');
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.form-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Add error message if invalid
        if (!isValid && message) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'form-error';
            errorDiv.textContent = message;
            field.parentNode.appendChild(errorDiv);
        }
    }
    
    clearFieldError(field) {
        field.classList.remove('invalid');
        const errorDiv = field.parentNode.querySelector('.form-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }
    
    setupFormValidation() {
        const form = document.getElementById('incidentForm');
        if (!form) return;
        
        // Custom validation messages
        const validationMessages = {
            valueMissing: 'This field is required',
            typeMismatch: 'Please enter a valid value',
            tooLong: 'This value is too long',
            tooShort: 'This value is too short'
        };
        
        // Apply custom validation to all inputs
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('invalid', (e) => {
                e.preventDefault();
                const validity = e.target.validity;
                let message = '';
                
                for (const key in validationMessages) {
                    if (validity[key]) {
                        message = validationMessages[key];
                        break;
                    }
                }
                
                this.updateFieldValidation(e.target, false, message);
            });
        });
    }
    
    async handleFormSubmit() {
        const form = document.getElementById('incidentForm');
        const submitBtn = document.getElementById('submitBtn');
        const submitText = document.getElementById('submitText');
        const submitSpinner = document.getElementById('submitSpinner');
        
        // Validate form
        if (!this.validateForm()) {
            this.showAlert('Please correct the errors in the form', 'danger');
            return;
        }
        
        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        submitText.style.display = 'none';
        submitSpinner.style.display = 'inline-block';
        
        try {
            // Create FormData with files
            const formData = new FormData(form);
            
            // Add selected files to form data
            this.selectedFiles.forEach((file, index) => {
                formData.append(`evidence_files[${index}]`, file);
            });
            
            // Submit form
            const response = await fetch(form.action || window.location.href, {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                // Form submitted successfully - page will reload with success message
                return;
            } else {
                throw new Error('Form submission failed');
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showAlert('An error occurred while submitting your report. Please try again.', 'danger');
        } finally {
            // Reset loading state
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitText.style.display = 'inline';
            submitSpinner.style.display = 'none';
        }
    }
    
    validateForm() {
        const form = document.getElementById('incidentForm');
        let isValid = true;
        
        // Validate required fields
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        // Validate at least one consent checkbox is checked
        const consentCheckboxes = form.querySelectorAll('input[name^="consent_"]:checked');
        if (consentCheckboxes.length === 0) {
            this.showAlert('Please accept the required consent terms', 'warning');
            isValid = false;
        }
        
        return isValid;
    }
    
    showAlert(message, type = 'info') {
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.alert.temp-alert');
        existingAlerts.forEach(alert => alert.remove());
        
        // Create new alert
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} temp-alert`;
        alert.innerHTML = `<p>${message}</p>`;
        
        // Insert at top of container
        const container = document.querySelector('.container');
        container.insertBefore(alert, container.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            alert.remove();
        }, 5000);
        
        // Scroll to alert
        alert.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Global functions for HTML onclick handlers
let incidentReporter;

function clearForm() {
    if (confirm('Are you sure you want to clear all form data?')) {
        const form = document.getElementById('incidentForm');
        form.reset();
        
        if (incidentReporter) {
            incidentReporter.selectedFiles = [];
            incidentReporter.updateFilesList();
        }
        
        // Clear validation states
        const fields = form.querySelectorAll('.form-input, .form-select, .form-textarea');
        fields.forEach(field => {
            field.classList.remove('valid', 'invalid');
            const errorDiv = field.parentNode.querySelector('.form-error');
            if (errorDiv) {
                errorDiv.remove();
            }
        });
    }
}

// Auto-save functionality
class AutoSave {
    constructor() {
        this.saveKey = 'incident_report_draft';
        this.saveInterval = 30000; // 30 seconds
        this.setupAutoSave();
    }
    
    setupAutoSave() {
        const form = document.getElementById('incidentForm');
        if (!form) return;
        
        // Load saved data
        this.loadDraft();
        
        // Setup auto-save
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                clearTimeout(this.saveTimeout);
                this.saveTimeout = setTimeout(() => {
                    this.saveDraft();
                }, 2000); // Save 2 seconds after last input
            });
        });
        
        // Periodic save
        setInterval(() => {
            this.saveDraft();
        }, this.saveInterval);
        
        // Clear draft on successful submission
        form.addEventListener('submit', () => {
            this.clearDraft();
        });
    }
    
    saveDraft() {
        const form = document.getElementById('incidentForm');
        const formData = new FormData(form);
        const draftData = {};
        
        for (const [key, value] of formData.entries()) {
            draftData[key] = value;
        }
        
        try {
            localStorage.setItem(this.saveKey, JSON.stringify(draftData));
            this.showSaveIndicator();
        } catch (error) {
            console.error('Auto-save error:', error);
        }
    }
    
    loadDraft() {
        try {
            const savedData = localStorage.getItem(this.saveKey);
            if (!savedData) return;
            
            const draftData = JSON.parse(savedData);
            const form = document.getElementById('incidentForm');
            
            for (const [key, value] of Object.entries(draftData)) {
                const field = form.querySelector(`[name="${key}"]`);
                if (field && field.type !== 'file') {
                    if (field.type === 'checkbox') {
                        field.checked = value === 'on';
                    } else {
                        field.value = value;
                    }
                }
            }
            
            this.showDraftLoadedMessage();
        } catch (error) {
            console.error('Draft loading error:', error);
        }
    }
    
    clearDraft() {
        localStorage.removeItem(this.saveKey);
    }
    
    showSaveIndicator() {
        // Remove existing indicator
        const existing = document.querySelector('.auto-save-indicator');
        if (existing) existing.remove();
        
        // Show save indicator
        const indicator = document.createElement('div');
        indicator.className = 'auto-save-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: var(--success);
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 0.9rem;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        indicator.textContent = 'Draft saved';
        
        document.body.appendChild(indicator);
        
        // Animate in
        setTimeout(() => {
            indicator.style.opacity = '1';
        }, 100);
        
        // Animate out
        setTimeout(() => {
            indicator.style.opacity = '0';
            setTimeout(() => indicator.remove(), 300);
        }, 2000);
    }
    
    showDraftLoadedMessage() {
        const alert = document.createElement('div');
        alert.className = 'alert alert-info temp-alert';
        alert.innerHTML = `
            <p>📝 A draft of your report was restored. You can continue editing or clear the form to start fresh.</p>
            <button onclick="this.parentElement.remove()" class="btn btn-outline" style="margin-top: 10px;">Dismiss</button>
        `;
        
        const container = document.querySelector('.container');
        container.insertBefore(alert, container.firstChild);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    incidentReporter = new IncidentReporter();
    
    // Initialize auto-save (optional feature)
    if (localStorage) {
        new AutoSave();
    }
});
