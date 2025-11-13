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
        
        this.initializeEventListeners();
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
    }
    
    async handleFileUpload(files) {
        if (!files || files.length === 0) return;
        
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
            
            const response = await fetch('api/sightengine.php', {
                method: 'POST',
                body: formData
            });
            
            this.setProgress(50, 'Analyzing content...');
            
            // Check if response is ok
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Get response text first to check if it's valid JSON
            const responseText = await response.text();
            console.log('API Response:', responseText);
            
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                console.error('Response was:', responseText);
                throw new Error(`Invalid response format. Expected JSON but got: ${responseText.substring(0, 100)}...`);
            }
            
            this.setProgress(90, 'Processing results...');
            
            if (result.success) {
                this.setProgress(100, 'Analysis complete!');
                setTimeout(() => {
                    this.showProgress(false);
                    console.log('Full API result:', result);
                    console.log('Detection object:', result.detection);
                    this.displayResults(result.detection, file);
                }, 1000);
            } else {
                // Enhanced error handling
                let errorMessage = result.error || 'Analysis failed';
                if (result.debug_info) {
                    console.error('API Debug Info:', result.debug_info);
                }
                throw new Error(errorMessage);
            }
            
        } catch (error) {
            this.showProgress(false);
            this.showAlert(`Analysis failed: ${error.message}`, 'danger');
            console.error('Upload error:', error);
        }
    }
    
    async analyzeUrl() {
        const url = this.mediaUrl.value.trim();
        
        if (!url) {
            this.showAlert('Please enter a valid URL', 'warning');
            return;
        }
        
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
                this.showAlert('URL does not appear to be a valid media file. Please ensure the URL points to an image or video file or is from a supported hosting service.', 'warning');
                return;
            }
        } catch {
            this.showAlert('Please enter a valid URL', 'warning');
            return;
        }
        
        this.showProgress(true);
        this.setProgress(20, 'Fetching media from URL...');
        
        try {
            const formData = new FormData();
            formData.append('url', url);
            formData.append('action', 'analyze_url');
            
            const response = await fetch('api/sightengine.php', {
                method: 'POST',
                body: formData
            });
            
            this.setProgress(70, 'Analyzing content...');
            
            // Check if response is ok
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Get response text first to check if it's valid JSON
            const responseText = await response.text();
            console.log('API Response:', responseText);
            
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                console.error('Response was:', responseText);
                throw new Error(`Invalid response format. Expected JSON but got: ${responseText.substring(0, 100)}...`);
            }
            
            this.setProgress(100, 'Analysis complete!');
            
            if (result.success) {
                setTimeout(() => {
                    this.showProgress(false);
                    this.displayUrlResults(result.analysis, url);
                }, 1000);
            } else {
                // Enhanced error handling
                let errorMessage = result.error || 'Analysis failed';
                if (result.debug_info) {
                    console.error('API Debug Info:', result.debug_info);
                }
                throw new Error(errorMessage);
            }
            
        } catch (error) {
            this.showProgress(false);
            this.showAlert(`URL analysis failed: ${error.message}`, 'danger');
            console.error('URL analysis error:', error);
        }
    }
    
    displayResults(detection, file) {
        console.log('Displaying results:', detection);
        
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
        } else if (detection && detection.is_ai_generated !== undefined) {
            // Direct analysis object
            analysis = detection;
            results = parsedResults;
        } else if (detection && detection.detection_results) {
            // Only detection_results available, need to analyze it
            results = parsedResults;
            // Try to extract analysis from results or create a basic one
            analysis = this.extractAnalysisFromResults(results);
        } else {
            console.error('Invalid detection structure:', detection);
            this.showAlert('Invalid response structure from server', 'danger');
            return;
        }
        
        // Show results section
        this.resultsSection.style.display = 'block';
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Update authenticity indicator
        this.updateAuthenticityIndicator(analysis);
        
        // Update confidence score
        this.updateConfidenceScore(analysis.confidence_score || 0, analysis.is_deepfake || false);
        
        // Update indicators list
        this.updateIndicatorsList(analysis.indicators || []);
        
        // Show media preview
        this.showMediaPreview(file, results);
        
        // Show education banner if deepfake detected
        if (analysis.is_deepfake || analysis.is_ai_generated) {
            this.showEducationBanner(true);
        }
        
        // Update detailed analysis tabs
        this.updateDetailedAnalysis(results, analysis);
        
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
                
                if (deepfakeScore > 0.5) {
                    isDeepfake = true;
                    isAIGenerated = true;
                    indicators.push(`Deepfake detected (confidence: ${Math.round(deepfakeScore * 100)}%)`);
                } else {
                    indicators.push(`No deepfake detected (authenticity: ${Math.round((1 - deepfakeScore) * 100)}%)`);
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
        // Show results section
        this.resultsSection.style.display = 'block';
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Update authenticity indicator
        this.updateAuthenticityIndicator(analysis);
        
        // Update confidence score
        this.updateConfidenceScore(analysis.confidence_score, analysis.is_deepfake);
        
        // Update indicators list
        this.updateIndicatorsList(analysis.indicators);
        
        // Show URL preview
        this.showUrlPreview(url);
        
        // Show education banner if deepfake detected
        if (analysis.is_deepfake) {
            this.showEducationBanner(true);
        }
        
        // Update detailed analysis tabs
        this.updateDetailedAnalysis(analysis.raw_results, analysis);
    }
    
    updateAuthenticityIndicator(analysis) {
        const indicator = document.getElementById('authenticityIndicator');
        const circle = indicator.querySelector('.indicator-circle');
        const text = document.getElementById('authenticityText');
        
        if (analysis.is_deepfake) {
            circle.className = 'indicator-circle deepfake';
            text.className = 'deepfake';
            text.textContent = 'AI Generated Content Detected';
        } else if (analysis.confidence_score > 0.3) {
            circle.className = 'indicator-circle suspicious';
            text.className = 'suspicious';
            text.textContent = 'Content Requires Review';
        } else {
            circle.className = 'indicator-circle authentic';
            text.className = 'authentic';
            text.textContent = 'Content Appears Authentic';
        }
    }
    
    updateConfidenceScore(score, isDeepfake) {
        const scoreFill = document.getElementById('scoreFill');
        const scoreText = document.getElementById('scoreText');
        
        const percentage = Math.round(score * 100);
        scoreFill.style.width = `${percentage}%`;
        scoreText.textContent = `${percentage}%`;
        
        // Update color based on score
        if (isDeepfake || score > 0.7) {
            scoreFill.className = 'score-fill high';
        } else if (score > 0.3) {
            scoreFill.className = 'score-fill medium';
        } else {
            scoreFill.className = 'score-fill low';
        }
    }
    
    updateIndicatorsList(indicators) {
        const indicatorsList = document.getElementById('indicatorsList');
        indicatorsList.innerHTML = '';
        
        if (indicators.length === 0) {
            const item = document.createElement('div');
            item.className = 'indicator-item success';
            item.innerHTML = '<span>✓</span> <span>No suspicious indicators found</span>';
            indicatorsList.appendChild(item);
            return;
        }
        
        indicators.forEach(indicator => {
            const item = document.createElement('div');
            item.className = 'indicator-item warning';
            item.innerHTML = `<span>⚠️</span> <span>${indicator}</span>`;
            indicatorsList.appendChild(item);
        });
    }
    
    showMediaPreview(file, results) {
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
        });
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
    
    updateMediaInfo(container, info) {
        container.innerHTML = '';
        
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
        
        // Faces tab
        const facesTab = document.getElementById('faceAnalysis');
        facesTab.innerHTML = this.formatFaceAnalysis(results.faces || []);
        
        // Text tab
        const textTab = document.getElementById('textAnalysis');
        textTab.innerHTML = this.formatTextAnalysis(results.text || {});
        
        // Technical tab
        const technicalTab = document.getElementById('technicalAnalysis');
        technicalTab.innerHTML = this.formatTechnicalAnalysis(results);
    }
    
    formatGeneralAnalysis(results, analysis) {
        let html = '<div class="analysis-item">';
        html += '<h4>Overall Assessment</h4>';
        html += `<p>Confidence Score: ${Math.round((analysis.confidence_score || 0) * 100)}%</p>`;
        html += `<p>AI-Generated Content: ${analysis.is_ai_generated ? 'Yes' : 'No'}</p>`;
        html += `<p>Deepfake Detected: ${analysis.is_deepfake ? 'Yes' : 'No'}</p>`;
        html += `<p>Risk Level: ${this.getRiskLevel(analysis.confidence_score || 0)}</p>`;
        if (analysis.method) {
            html += `<p>Detection Method: ${analysis.method}</p>`;
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
        
        // Handle IMAGE response format: type.ai_generated and type.deepfake
        if (results.type) {
            if (results.type.ai_generated !== undefined) {
                html += '<div class="analysis-item">';
                html += '<h4>AI Generation Detection (genai)</h4>';
                html += `<p>AI Probability: ${Math.round(results.type.ai_generated * 100)}%</p>`;
                html += `<p>Natural Probability: ${Math.round((1 - results.type.ai_generated) * 100)}%</p>`;
                html += '</div>';
            }
            
            if (results.type.deepfake !== undefined) {
                html += '<div class="analysis-item">';
                html += '<h4>Deepfake Detection</h4>';
                html += `<p>Deepfake Probability: ${Math.round(results.type.deepfake * 100)}%</p>`;
                html += `<p>Authenticity Score: ${Math.round((1 - results.type.deepfake) * 100)}%</p>`;
                html += '</div>';
            }
        }
        
        // Show analysis scores from processed results
        if (analysis.ai_generated_score !== undefined) {
            html += '<div class="analysis-item">';
            html += '<h4>Processed Analysis Scores</h4>';
            html += `<p>AI Generated Score: ${Math.round(analysis.ai_generated_score * 100)}%</p>`;
            if (analysis.deepfake_score !== undefined) {
                html += `<p>Deepfake Score: ${Math.round(analysis.deepfake_score * 100)}%</p>`;
            }
            html += '</div>';
        }
        
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
    
    formatFaceAnalysis(faces) {
        if (!faces || faces.length === 0) {
            return '<p>No faces detected in the media.</p>';
        }
        
        let html = '';
        faces.forEach((face, index) => {
            html += '<div class="analysis-item">';
            html += `<h4>Face ${index + 1}</h4>`;
            
            if (face.attributes) {
                const attrs = face.attributes;
                html += `<p>Age: ${attrs.age?.range || 'Unknown'}</p>`;
                html += `<p>Gender: ${attrs.gender?.value || 'Unknown'}</p>`;
                html += `<p>Emotion: ${attrs.emotion?.value || 'Unknown'}</p>`;
                
                if (attrs.real !== undefined) {
                    html += `<p>Authenticity: ${Math.round(attrs.real * 100)}%</p>`;
                }
            }
            
            html += '</div>';
        });
        
        return html;
    }
    
    formatTextAnalysis(textData) {
        if (!textData.text) {
            return '<p>No text content detected in the media.</p>';
        }
        
        let html = '<div class="analysis-item">';
        html += '<h4>Detected Text</h4>';
        html += `<p><strong>Content:</strong> ${textData.text}</p>`;
        
        if (textData.language) {
            html += `<p><strong>Language:</strong> ${textData.language}</p>`;
        }
        
        if (textData.confidence) {
            html += `<p><strong>OCR Confidence:</strong> ${Math.round(textData.confidence * 100)}%</p>`;
        }
        
        html += '</div>';
        
        return html;
    }
    
    formatTechnicalAnalysis(results) {
        let html = '<div class="analysis-item">';
        html += '<h4>Technical Properties</h4>';
        
        if (results.properties) {
            const props = results.properties;
            html += `<p><strong>Format:</strong> ${props.format || 'Unknown'}</p>`;
            html += `<p><strong>Width:</strong> ${props.width || 'Unknown'}px</p>`;
            html += `<p><strong>Height:</strong> ${props.height || 'Unknown'}px</p>`;
            
            if (props.exif) {
                html += `<p><strong>EXIF Data:</strong> ${Object.keys(props.exif).length} fields detected</p>`;
            }
        }
        
        html += '</div>';
        
        html += '<div class="analysis-item">';
        html += '<h4>Processing Information</h4>';
        html += `<p><strong>Analysis Time:</strong> ${new Date().toLocaleString()}</p>`;
        html += `<p><strong>Models Used:</strong> Deepfake Detection, Face Analysis, Text Recognition</p>`;
        html += `<p><strong>API Version:</strong> Sightengine v1.0</p>`;
        html += '</div>';
        
        return html;
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
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.deepfakeScanner = new DeepfakeScanner();
    
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeEducationModal();
        }
    });
});
