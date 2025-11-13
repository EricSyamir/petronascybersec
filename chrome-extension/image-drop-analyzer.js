// Drag & Drop Image Analyzer for Chrome Extension
class ImageDropAnalyzer {
    constructor(containerElement, onAnalysisComplete) {
        this.container = containerElement;
        this.onAnalysisComplete = onAnalysisComplete;
        this.llmAnalyzer = new LLMAnalyzer();
        this.isAnalyzing = false;
        
        this.initializeDropZone();
        this.setupEventHandlers();
    }
    
    initializeDropZone() {
        // Create drop zone HTML
        this.container.innerHTML = `
            <div class="image-drop-zone" id="imageDropZone">
                <div class="drop-zone-content">
                    <div class="drop-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M16 13L8 21L4 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <h3>Drop Image Here for AI Analysis</h3>
                    <p>Drag and drop an image to check for AI/deepfake content</p>
                    <div class="supported-formats">
                        <small>Supports: JPG, PNG, GIF, WebP (Max 10MB)</small>
                    </div>
                    <div class="drop-actions">
                        <button class="browse-btn" id="browseBtn">
                            <span>📁 Browse Files</span>
                        </button>
                        <input type="file" id="fileInput" accept="image/*" style="display: none;">
                    </div>
                </div>
                
                <div class="analysis-progress" id="analysisProgress" style="display: none;">
                    <div class="progress-spinner"></div>
                    <h4>Analyzing Image...</h4>
                    <p id="progressText">Preparing analysis...</p>
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>
                </div>
                
                <div class="analysis-results" id="analysisResults" style="display: none;">
                    <!-- Results will be populated here -->
                </div>
            </div>
        `;
        
        // Add CSS styles
        this.injectStyles();
        
        // Get references to elements
        this.dropZone = document.getElementById('imageDropZone');
        this.dropContent = this.dropZone.querySelector('.drop-zone-content');
        this.analysisProgress = document.getElementById('analysisProgress');
        this.analysisResults = document.getElementById('analysisResults');
        this.progressText = document.getElementById('progressText');
        this.progressFill = document.getElementById('progressFill');
        this.browseBtn = document.getElementById('browseBtn');
        this.fileInput = document.getElementById('fileInput');
    }
    
    setupEventHandlers() {
        // Drag and drop events
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('drag-over');
        });
        
        this.dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            if (!this.dropZone.contains(e.relatedTarget)) {
                this.dropZone.classList.remove('drag-over');
            }
        });
        
        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('drag-over');
            
            const files = Array.from(e.dataTransfer.files);
            const imageFiles = files.filter(file => file.type.startsWith('image/'));
            
            if (imageFiles.length > 0) {
                this.analyzeImage(imageFiles[0]);
            } else {
                this.showError('Please drop an image file (JPG, PNG, GIF, WebP)');
            }
        });
        
        // Browse button
        this.browseBtn.addEventListener('click', () => {
            this.fileInput.click();
        });
        
        this.fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                this.analyzeImage(file);
            }
        });
    }
    
    async analyzeImage(file) {
        if (this.isAnalyzing) return;
        
        // Validate file
        if (!this.validateFile(file)) {
            return;
        }
        
        this.isAnalyzing = true;
        this.showProgress();
        
        try {
            // Step 1: Prepare image
            this.updateProgress(10, 'Preparing image...');
            const imageData = await this.prepareImageData(file);
            
            // Step 2: Analyze with AI detection
            this.updateProgress(30, 'Analyzing for AI/deepfake content...');
            const aiAnalysis = await this.llmAnalyzer.analyzeImageForAI(null, file);
            
            // Step 3: Get image metadata
            this.updateProgress(60, 'Extracting image metadata...');
            const metadata = await this.extractImageMetadata(file);
            
            // Step 4: Perform additional checks
            this.updateProgress(80, 'Running additional checks...');
            const additionalChecks = await this.performAdditionalChecks(file, imageData);
            
            // Step 5: Compile results
            this.updateProgress(100, 'Analysis complete!');
            
            const results = {
                filename: file.name,
                filesize: file.size,
                filetype: file.type,
                aiAnalysis: aiAnalysis,
                metadata: metadata,
                additionalChecks: additionalChecks,
                timestamp: new Date().toISOString()
            };
            
            await this.delay(500);
            this.showResults(results);
            
            // Callback to parent component
            if (this.onAnalysisComplete) {
                this.onAnalysisComplete(results);
            }
            
        } catch (error) {
            console.error('Image analysis error:', error);
            this.showError(`Analysis failed: ${error.message}`);
        } finally {
            this.isAnalyzing = false;
        }
    }
    
    validateFile(file) {
        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            this.showError('Unsupported file type. Please use JPG, PNG, GIF, or WebP.');
            return false;
        }
        
        // Check file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            this.showError('File too large. Maximum size is 10MB.');
            return false;
        }
        
        return true;
    }
    
    async prepareImageData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    resolve({
                        dataUrl: e.target.result,
                        width: img.naturalWidth,
                        height: img.naturalHeight,
                        aspectRatio: img.naturalWidth / img.naturalHeight
                    });
                };
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target.result;
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }
    
    async extractImageMetadata(file) {
        try {
            // Basic metadata
            const metadata = {
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: new Date(file.lastModified).toISOString()
            };
            
            // Try to extract EXIF data (simplified)
            if (file.type === 'image/jpeg') {
                const exifData = await this.extractEXIFData(file);
                metadata.exif = exifData;
            }
            
            return metadata;
            
        } catch (error) {
            console.error('Metadata extraction error:', error);
            return {
                name: file.name,
                size: file.size,
                type: file.type,
                error: 'Failed to extract metadata'
            };
        }
    }
    
    async extractEXIFData(file) {
        // Simplified EXIF extraction (in a real implementation, you'd use a library like exif-js)
        return new Promise((resolve) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const arrayBuffer = e.target.result;
                const dataView = new DataView(arrayBuffer);
                
                // Check for JPEG signature
                if (dataView.getUint16(0) !== 0xFFD8) {
                    resolve({ error: 'Not a valid JPEG file' });
                    return;
                }
                
                // Look for EXIF marker (simplified)
                let hasExif = false;
                for (let i = 2; i < Math.min(arrayBuffer.byteLength, 1000); i += 2) {
                    if (dataView.getUint16(i) === 0xFFE1) {
                        hasExif = true;
                        break;
                    }
                }
                
                resolve({
                    hasExifData: hasExif,
                    fileSignature: 'Valid JPEG',
                    note: 'Detailed EXIF parsing requires specialized library'
                });
            };
            
            reader.onerror = () => resolve({ error: 'Failed to read file for EXIF' });
            reader.readAsArrayBuffer(file.slice(0, 1024)); // Read first 1KB for header analysis
        });
    }
    
    async performAdditionalChecks(file, imageData) {
        const checks = {
            suspiciousAspectRatio: false,
            unusualFileSize: false,
            potentialScreenshot: false,
            lowQuality: false
        };
        
        // Check aspect ratio (common deepfake ratios)
        const aspectRatio = imageData.aspectRatio;
        if (aspectRatio === 1 || Math.abs(aspectRatio - 16/9) < 0.01 || Math.abs(aspectRatio - 4/3) < 0.01) {
            checks.suspiciousAspectRatio = true;
        }
        
        // Check file size vs dimensions
        const expectedSize = imageData.width * imageData.height * 3; // Rough estimate
        const compressionRatio = file.size / expectedSize;
        if (compressionRatio < 0.01 || compressionRatio > 0.5) {
            checks.unusualFileSize = true;
        }
        
        // Check if it might be a screenshot (common for fake content)
        if (file.name.toLowerCase().includes('screenshot') || 
            file.name.toLowerCase().includes('screen') ||
            (imageData.width % 100 === 0 && imageData.height % 100 === 0)) {
            checks.potentialScreenshot = true;
        }
        
        // Check for low quality (often indicates processed/re-encoded content)
        if (file.size < 50000 && (imageData.width > 500 || imageData.height > 500)) {
            checks.lowQuality = true;
        }
        
        return checks;
    }
    
    showProgress() {
        this.dropContent.style.display = 'none';
        this.analysisResults.style.display = 'none';
        this.analysisProgress.style.display = 'block';
    }
    
    updateProgress(percentage, text) {
        this.progressText.textContent = text;
        this.progressFill.style.width = `${percentage}%`;
    }
    
    showResults(results) {
        this.analysisProgress.style.display = 'none';
        this.analysisResults.style.display = 'block';
        
        const aiAnalysis = results.aiAnalysis;
        const isAI = aiAnalysis.isAI;
        const confidence = Math.round(aiAnalysis.confidence * 100);
        
        // Determine result class and icon
        let resultClass, resultIcon, resultTitle, resultMessage;
        
        if (isAI && confidence > 70) {
            resultClass = 'danger';
            resultIcon = '⚠️';
            resultTitle = 'AI/Deepfake Detected';
            resultMessage = `This image appears to be AI-generated or manipulated (${confidence}% confidence)`;
        } else if (isAI && confidence > 40) {
            resultClass = 'warning';
            resultIcon = '🔍';
            resultTitle = 'Potentially AI-Generated';
            resultMessage = `This image may be AI-generated or manipulated (${confidence}% confidence)`;
        } else {
            resultClass = 'success';
            resultIcon = '✅';
            resultTitle = 'Appears Authentic';
            resultMessage = `This image appears to be authentic (${100 - confidence}% confidence)`;
        }
        
        this.analysisResults.innerHTML = `
            <div class="result-header ${resultClass}">
                <div class="result-icon">${resultIcon}</div>
                <div class="result-info">
                    <h3>${resultTitle}</h3>
                    <p>${resultMessage}</p>
                </div>
            </div>
            
            <div class="result-details">
                <div class="detail-section">
                    <h4>Analysis Details</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Confidence Score:</label>
                            <span class="confidence-bar">
                                <div class="confidence-fill ${resultClass}" style="width: ${confidence}%"></div>
                                <span class="confidence-text">${confidence}%</span>
                            </span>
                        </div>
                        
                        ${aiAnalysis.indicators && aiAnalysis.indicators.length > 0 ? `
                        <div class="detail-item">
                            <label>Indicators:</label>
                            <ul class="indicators-list">
                                ${aiAnalysis.indicators.map(indicator => `<li>${indicator}</li>`).join('')}
                            </ul>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>File Information</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Filename:</label>
                            <span>${results.filename}</span>
                        </div>
                        <div class="detail-item">
                            <label>File Size:</label>
                            <span>${this.formatFileSize(results.filesize)}</span>
                        </div>
                        <div class="detail-item">
                            <label>File Type:</label>
                            <span>${results.filetype}</span>
                        </div>
                    </div>
                </div>
                
                ${this.generateAdditionalChecksHTML(results.additionalChecks)}
            </div>
            
            <div class="result-actions">
                <button class="action-btn primary" onclick="imageDropAnalyzer.reportImage('${results.filename}')">
                    📝 Report This Image
                </button>
                <button class="action-btn secondary" onclick="imageDropAnalyzer.analyzeAnother()">
                    🔍 Analyze Another Image
                </button>
                <button class="action-btn tertiary" onclick="imageDropAnalyzer.exportResults()">
                    📥 Export Results
                </button>
            </div>
        `;
        
        // Store results for later use
        this.lastResults = results;
    }
    
    generateAdditionalChecksHTML(checks) {
        const warnings = [];
        
        if (checks.suspiciousAspectRatio) {
            warnings.push('Suspicious aspect ratio detected');
        }
        if (checks.unusualFileSize) {
            warnings.push('Unusual file size for image dimensions');
        }
        if (checks.potentialScreenshot) {
            warnings.push('May be a screenshot or screen capture');
        }
        if (checks.lowQuality) {
            warnings.push('Low quality/heavily compressed image');
        }
        
        if (warnings.length === 0) {
            return '';
        }
        
        return `
            <div class="detail-section">
                <h4>Additional Observations</h4>
                <ul class="warnings-list">
                    ${warnings.map(warning => `<li>⚠️ ${warning}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    showError(message) {
        this.analysisProgress.style.display = 'none';
        this.analysisResults.style.display = 'block';
        
        this.analysisResults.innerHTML = `
            <div class="result-header danger">
                <div class="result-icon">❌</div>
                <div class="result-info">
                    <h3>Analysis Error</h3>
                    <p>${message}</p>
                </div>
            </div>
            
            <div class="result-actions">
                <button class="action-btn secondary" onclick="imageDropAnalyzer.analyzeAnother()">
                    🔄 Try Again
                </button>
            </div>
        `;
    }
    
    analyzeAnother() {
        this.analysisResults.style.display = 'none';
        this.dropContent.style.display = 'block';
        this.fileInput.value = ''; // Clear file input
    }
    
    reportImage(filename) {
        // Open report form with image information
        const reportUrl = `http://localhost/petronas-cybercrime-platform/report-incident.php?type=deepfake&description=${encodeURIComponent(`Suspicious AI-generated image detected: ${filename}`)}`;
        
        if (typeof chrome !== 'undefined' && chrome.tabs) {
            chrome.tabs.create({ url: reportUrl });
        } else {
            window.open(reportUrl, '_blank');
        }
    }
    
    exportResults() {
        if (!this.lastResults) return;
        
        const exportData = {
            analysis: this.lastResults,
            exportedAt: new Date().toISOString(),
            platform: 'PETRONAS Cybercrime Extension'
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `image-analysis-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    injectStyles() {
        if (document.getElementById('image-drop-analyzer-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'image-drop-analyzer-styles';
        style.textContent = `
            .image-drop-zone {
                border: 2px dashed #ccc;
                border-radius: 12px;
                padding: 2rem;
                text-align: center;
                background: #f9f9f9;
                transition: all 0.3s ease;
                min-height: 200px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .image-drop-zone.drag-over {
                border-color: #00A651;
                background: #f0f8f0;
                transform: scale(1.02);
            }
            
            .drop-zone-content {
                max-width: 400px;
            }
            
            .drop-icon {
                color: #666;
                margin-bottom: 1rem;
            }
            
            .drop-zone-content h3 {
                color: #333;
                margin-bottom: 0.5rem;
                font-size: 1.2rem;
            }
            
            .drop-zone-content p {
                color: #666;
                margin-bottom: 1rem;
            }
            
            .supported-formats {
                margin-bottom: 1.5rem;
            }
            
            .supported-formats small {
                color: #999;
            }
            
            .browse-btn {
                background: #003366;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.9rem;
                transition: background 0.3s ease;
            }
            
            .browse-btn:hover {
                background: #004080;
            }
            
            .analysis-progress {
                text-align: center;
                padding: 2rem;
            }
            
            .progress-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #00A651;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .analysis-progress h4 {
                color: #333;
                margin-bottom: 0.5rem;
            }
            
            .progress-bar {
                width: 100%;
                height: 8px;
                background: #f0f0f0;
                border-radius: 4px;
                overflow: hidden;
                margin-top: 1rem;
            }
            
            .progress-fill {
                height: 100%;
                background: #00A651;
                width: 0%;
                transition: width 0.3s ease;
            }
            
            .analysis-results {
                padding: 1rem;
            }
            
            .result-header {
                display: flex;
                align-items: center;
                padding: 1rem;
                border-radius: 8px;
                margin-bottom: 1.5rem;
            }
            
            .result-header.success {
                background: #d4edda;
                border: 1px solid #c3e6cb;
            }
            
            .result-header.warning {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
            }
            
            .result-header.danger {
                background: #f8d7da;
                border: 1px solid #f5c6cb;
            }
            
            .result-icon {
                font-size: 2rem;
                margin-right: 1rem;
            }
            
            .result-info h3 {
                margin: 0 0 0.5rem 0;
                color: #333;
            }
            
            .result-info p {
                margin: 0;
                color: #666;
            }
            
            .detail-section {
                margin-bottom: 1.5rem;
                padding: 1rem;
                background: #f8f9fa;
                border-radius: 6px;
            }
            
            .detail-section h4 {
                margin: 0 0 1rem 0;
                color: #333;
                font-size: 1rem;
            }
            
            .detail-grid {
                display: grid;
                gap: 0.75rem;
            }
            
            .detail-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .detail-item label {
                font-weight: 600;
                color: #555;
            }
            
            .confidence-bar {
                position: relative;
                width: 100px;
                height: 20px;
                background: #e9ecef;
                border-radius: 10px;
                overflow: hidden;
            }
            
            .confidence-fill {
                height: 100%;
                transition: width 0.3s ease;
            }
            
            .confidence-fill.success {
                background: #28a745;
            }
            
            .confidence-fill.warning {
                background: #ffc107;
            }
            
            .confidence-fill.danger {
                background: #dc3545;
            }
            
            .confidence-text {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 0.8rem;
                font-weight: 600;
                color: #333;
            }
            
            .indicators-list, .warnings-list {
                margin: 0;
                padding-left: 1rem;
            }
            
            .indicators-list li, .warnings-list li {
                margin-bottom: 0.25rem;
                color: #666;
            }
            
            .result-actions {
                display: flex;
                gap: 0.75rem;
                flex-wrap: wrap;
                justify-content: center;
                margin-top: 1.5rem;
            }
            
            .action-btn {
                padding: 0.75rem 1rem;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.9rem;
                transition: all 0.3s ease;
            }
            
            .action-btn.primary {
                background: #dc3545;
                color: white;
            }
            
            .action-btn.primary:hover {
                background: #c82333;
            }
            
            .action-btn.secondary {
                background: #6c757d;
                color: white;
            }
            
            .action-btn.secondary:hover {
                background: #5a6268;
            }
            
            .action-btn.tertiary {
                background: #17a2b8;
                color: white;
            }
            
            .action-btn.tertiary:hover {
                background: #138496;
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.ImageDropAnalyzer = ImageDropAnalyzer;
}
