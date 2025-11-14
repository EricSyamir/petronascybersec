// LLM-based Scammer/Phishing Detection Service
class LLMAnalyzer {
    constructor() {
        this.geminiApiKey = 'AIzaSyCOnJaGxm18KuXFBj7kJdo16mEcdmyJYzw';
        this.geminiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
        this.sightengineEndpoint = 'http://localhost/petronas-cybercrime-platform/api/sightengine.php';
        
        // Cache for recent analyses to avoid duplicate API calls
        this.analysisCache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }
    
    /**
     * Analyze page content for scammer/phishing indicators using Gemini LLM
     */
    async analyzePageContent(pageData) {
        const cacheKey = this.generateCacheKey('page', pageData.url + pageData.title);
        
        // Check cache first
        if (this.analysisCache.has(cacheKey)) {
            const cached = this.analysisCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.result;
            }
        }
        
        try {
            const prompt = this.buildPageAnalysisPrompt(pageData);
            const analysis = await this.callGeminiAPI(prompt);
            
            const result = this.parsePageAnalysisResult(analysis);
            
            // Cache the result
            this.analysisCache.set(cacheKey, {
                result: result,
                timestamp: Date.now()
            });
            
            return result;
            
        } catch (error) {
            console.error('LLM page analysis error:', error);
            return this.getFallbackPageAnalysis(pageData);
        }
    }
    
    /**
     * Analyze specific text content for scammer/phishing indicators
     */
    async analyzeTextContent(text, context = {}) {
        const cacheKey = this.generateCacheKey('text', text.substring(0, 100));
        
        if (this.analysisCache.has(cacheKey)) {
            const cached = this.analysisCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.result;
            }
        }
        
        try {
            const prompt = this.buildTextAnalysisPrompt(text, context);
            const analysis = await this.callGeminiAPI(prompt);
            
            const result = this.parseTextAnalysisResult(analysis);
            
            this.analysisCache.set(cacheKey, {
                result: result,
                timestamp: Date.now()
            });
            
            return result;
            
        } catch (error) {
            console.error('LLM text analysis error:', error);
            return this.getFallbackTextAnalysis(text);
        }
    }
    
    /**
     * Analyze URL for suspicious patterns using LLM
     */
    async analyzeURL(url, pageTitle = '') {
        const cacheKey = this.generateCacheKey('url', url);
        
        if (this.analysisCache.has(cacheKey)) {
            const cached = this.analysisCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.result;
            }
        }
        
        try {
            const prompt = this.buildURLAnalysisPrompt(url, pageTitle);
            const analysis = await this.callGeminiAPI(prompt);
            
            const result = this.parseURLAnalysisResult(analysis);
            
            this.analysisCache.set(cacheKey, {
                result: result,
                timestamp: Date.now()
            });
            
            return result;
            
        } catch (error) {
            console.error('LLM URL analysis error:', error);
            return this.getFallbackURLAnalysis(url);
        }
    }
    
    /**
     * Analyze image for AI/deepfake content using existing Sightengine API
     */
    async analyzeImageForAI(imageUrl, imageData = null) {
        try {
            const formData = new FormData();
            let isUpload = false;
            
            if (imageData) {
                // Align with backend API expectations (same as deepfake-scanner.php)
                formData.append('media', imageData);
                formData.append('action', 'analyze_upload');
                isUpload = true;
            } else if (imageUrl) {
                formData.append('url', imageUrl);
                formData.append('action', 'analyze_url');
            } else {
                throw new Error('No image data or URL provided');
            }
            
            const response = await fetch(this.sightengineEndpoint, {
                method: 'POST',
                body: formData
            });
            
            const rawText = await response.text();
            let data;
            try {
                data = JSON.parse(rawText);
            } catch (parseError) {
                console.error('Sightengine response parse error:', parseError, rawText);
                throw new Error('Invalid response from analysis service');
            }
            
            if (!response.ok || !data.success) {
                const message = data?.error || `Analysis failed with status ${response.status}`;
                throw new Error(message);
            }
            
            const analysis = isUpload
                ? (data?.detection?.analysis || data?.analysis)
                : data?.analysis;
            
            if (!analysis) {
                throw new Error('Unexpected response format from analysis service');
            }
            
            return {
                isAI: Boolean(analysis.is_deepfake || analysis.is_ai_generated),
                confidence: Number(analysis.confidence_score || 0),
                indicators: analysis.indicators || [],
                details: analysis,
                rawResults: analysis.raw_results || null
            };
            
        } catch (error) {
            console.error('Image AI analysis error:', error);
            return {
                isAI: false,
                confidence: 0,
                indicators: [],
                details: {},
                error: error.message
            };
        }
    }
    
    /**
     * Build prompt for page analysis
     */
    buildPageAnalysisPrompt(pageData) {
        return `Analyze this webpage content for potential scammer/phishing indicators. Focus on Malaysian cybercrime patterns.

URL: ${pageData.url}
Title: ${pageData.title}
Domain: ${pageData.domain}
Protocol: ${pageData.protocol}

Page Content (first 1000 chars):
${pageData.text.substring(0, 1000)}

Additional Info:
- Has password fields: ${pageData.hasPasswordFields}
- Number of images: ${pageData.imageCount}
- Number of links: ${pageData.linkCount}
- Number of forms: ${pageData.formCount}

Please analyze this content and respond with a JSON object containing:
{
    "isSuspicious": boolean,
    "riskLevel": "low" | "medium" | "high" | "critical",
    "confidence": number (0-1),
    "indicators": [array of specific suspicious indicators found],
    "scamType": "phishing" | "romance" | "investment" | "lottery" | "job" | "shopping" | "other" | null,
    "reasoning": "brief explanation of the analysis",
    "recommendations": [array of user recommendations]
}

Focus on Malaysian-specific scam patterns like fake PETRONAS jobs, Maybank phishing, EPF scams, etc.`;
    }
    
    /**
     * Build prompt for text analysis
     */
    buildTextAnalysisPrompt(text, context) {
        return `Analyze this text content for scammer/phishing indicators, particularly Malaysian cybercrime patterns:

Text to analyze:
"${text}"

Context:
- Source URL: ${context.url || 'Unknown'}
- Element type: ${context.elementType || 'Unknown'}

Look for:
1. Malaysian-specific scam patterns (fake government agencies, banks, etc.)
2. Urgency tactics and pressure language
3. Financial information requests
4. Suspicious grammar/spelling patterns
5. Romance scam indicators
6. Investment fraud language
7. Job scam patterns

Respond with JSON:
{
    "isSuspicious": boolean,
    "riskLevel": "low" | "medium" | "high" | "critical",
    "confidence": number (0-1),
    "indicators": [array of specific indicators],
    "scamType": "phishing" | "romance" | "investment" | "lottery" | "job" | "shopping" | "other" | null,
    "reasoning": "explanation",
    "suspiciousPhrases": [array of specific suspicious phrases found]
}`;
    }
    
    /**
     * Build prompt for URL analysis
     */
    buildURLAnalysisPrompt(url, pageTitle) {
        return `Analyze this URL for potential scammer/phishing indicators:

URL: ${url}
Page Title: ${pageTitle}

Check for:
1. Domain spoofing (fake Malaysian banks, government sites, PETRONAS, etc.)
2. Suspicious TLD usage
3. URL shorteners
4. Typosquatting
5. IP addresses instead of domains
6. Suspicious subdomains
7. Non-HTTPS for sensitive sites

Respond with JSON:
{
    "isSuspicious": boolean,
    "riskLevel": "low" | "medium" | "high" | "critical",
    "confidence": number (0-1),
    "indicators": [array of specific indicators],
    "spoofedBrand": "name of brand being spoofed" | null,
    "reasoning": "explanation"
}`;
    }
    
    /**
     * Call Gemini API with the given prompt
     */
    async callGeminiAPI(prompt) {
        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: prompt
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.1,
                topK: 1,
                topP: 1,
                maxOutputTokens: 1024
            }
        };
        
        try {
            const response = await fetch(`${this.geminiEndpoint}?key=${this.geminiApiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Gemini API error response:', errorText);
                throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                console.error('Gemini API returned error:', data.error);
                throw new Error(`Gemini API error: ${data.error.message || 'Unknown error'}`);
            }
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            } else {
                console.error('Invalid Gemini API response structure:', data);
                throw new Error('Invalid response from Gemini API');
            }
        } catch (networkError) {
            console.error('Network error calling Gemini API:', networkError);
            throw new Error(`Network error: ${networkError.message}`);
        }
    }
    
    /**
     * Parse page analysis result from LLM
     */
    parsePageAnalysisResult(analysisText) {
        try {
            // Extract JSON from the response (LLM might include extra text)
            const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);
                
                // Validate and sanitize the result
                return {
                    isSuspicious: Boolean(result.isSuspicious),
                    riskLevel: this.validateRiskLevel(result.riskLevel),
                    confidence: Math.max(0, Math.min(1, Number(result.confidence) || 0)),
                    indicators: Array.isArray(result.indicators) ? result.indicators : [],
                    scamType: this.validateScamType(result.scamType),
                    reasoning: String(result.reasoning || ''),
                    recommendations: Array.isArray(result.recommendations) ? result.recommendations : []
                };
            }
        } catch (error) {
            console.error('Failed to parse LLM page analysis result:', error);
        }
        
        // Fallback result
        return {
            isSuspicious: false,
            riskLevel: 'low',
            confidence: 0,
            indicators: [],
            scamType: null,
            reasoning: 'Analysis parsing failed',
            recommendations: []
        };
    }
    
    /**
     * Parse text analysis result from LLM
     */
    parseTextAnalysisResult(analysisText) {
        try {
            const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);
                
                return {
                    isSuspicious: Boolean(result.isSuspicious),
                    riskLevel: this.validateRiskLevel(result.riskLevel),
                    confidence: Math.max(0, Math.min(1, Number(result.confidence) || 0)),
                    indicators: Array.isArray(result.indicators) ? result.indicators : [],
                    scamType: this.validateScamType(result.scamType),
                    reasoning: String(result.reasoning || ''),
                    suspiciousPhrases: Array.isArray(result.suspiciousPhrases) ? result.suspiciousPhrases : []
                };
            }
        } catch (error) {
            console.error('Failed to parse LLM text analysis result:', error);
        }
        
        return {
            isSuspicious: false,
            riskLevel: 'low',
            confidence: 0,
            indicators: [],
            scamType: null,
            reasoning: 'Analysis parsing failed',
            suspiciousPhrases: []
        };
    }
    
    /**
     * Parse URL analysis result from LLM
     */
    parseURLAnalysisResult(analysisText) {
        try {
            const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);
                
                return {
                    isSuspicious: Boolean(result.isSuspicious),
                    riskLevel: this.validateRiskLevel(result.riskLevel),
                    confidence: Math.max(0, Math.min(1, Number(result.confidence) || 0)),
                    indicators: Array.isArray(result.indicators) ? result.indicators : [],
                    spoofedBrand: result.spoofedBrand || null,
                    reasoning: String(result.reasoning || '')
                };
            }
        } catch (error) {
            console.error('Failed to parse LLM URL analysis result:', error);
        }
        
        return {
            isSuspicious: false,
            riskLevel: 'low',
            confidence: 0,
            indicators: [],
            spoofedBrand: null,
            reasoning: 'Analysis parsing failed'
        };
    }
    
    /**
     * Validate risk level
     */
    validateRiskLevel(level) {
        const validLevels = ['low', 'medium', 'high', 'critical'];
        return validLevels.includes(level) ? level : 'low';
    }
    
    /**
     * Validate scam type
     */
    validateScamType(type) {
        const validTypes = ['phishing', 'romance', 'investment', 'lottery', 'job', 'shopping', 'other'];
        return validTypes.includes(type) ? type : null;
    }
    
    /**
     * Generate cache key
     */
    generateCacheKey(type, content) {
        const hash = this.simpleHash(content);
        return `${type}_${hash}`;
    }
    
    /**
     * Simple hash function for cache keys
     */
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }
    
    /**
     * Fallback analysis methods (when LLM fails)
     */
    getFallbackPageAnalysis(pageData) {
        const suspiciousIndicators = [];
        let riskLevel = 'low';
        
        // Basic URL checks
        if (pageData.protocol === 'http:' && !pageData.domain.includes('localhost')) {
            suspiciousIndicators.push('Insecure HTTP connection');
            riskLevel = 'medium';
        }
        
        // Domain checks
        if (/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/.test(pageData.domain)) {
            suspiciousIndicators.push('IP address instead of domain');
            riskLevel = 'high';
        }
        
        // Content checks
        const suspiciousKeywords = ['verify account', 'suspended', 'urgent', 'click here'];
        const lowerText = pageData.text.toLowerCase();
        
        suspiciousKeywords.forEach(keyword => {
            if (lowerText.includes(keyword)) {
                suspiciousIndicators.push(`Suspicious keyword: ${keyword}`);
                riskLevel = 'medium';
            }
        });
        
        return {
            isSuspicious: suspiciousIndicators.length > 0,
            riskLevel: riskLevel,
            confidence: 0.6,
            indicators: suspiciousIndicators,
            scamType: null,
            reasoning: 'Fallback analysis (LLM unavailable)',
            recommendations: ['Verify the website through official channels']
        };
    }
    
    getFallbackTextAnalysis(text) {
        const suspiciousKeywords = [
            'verify your account', 'suspended', 'urgent action', 'click here',
            'confirm identity', 'update payment', 'congratulations you won'
        ];
        
        const lowerText = text.toLowerCase();
        const foundKeywords = suspiciousKeywords.filter(keyword => 
            lowerText.includes(keyword)
        );
        
        return {
            isSuspicious: foundKeywords.length > 0,
            riskLevel: foundKeywords.length > 2 ? 'high' : foundKeywords.length > 0 ? 'medium' : 'low',
            confidence: 0.5,
            indicators: foundKeywords.map(k => `Suspicious phrase: ${k}`),
            scamType: null,
            reasoning: 'Fallback keyword analysis',
            suspiciousPhrases: foundKeywords
        };
    }
    
    getFallbackURLAnalysis(url) {
        const indicators = [];
        let riskLevel = 'low';
        
        try {
            const urlObj = new URL(url);
            
            // Check for IP addresses
            if (/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/.test(urlObj.hostname)) {
                indicators.push('IP address instead of domain');
                riskLevel = 'high';
            }
            
            // Check for URL shorteners
            const shorteners = ['bit.ly', 'tinyurl.com', 't.co'];
            if (shorteners.some(s => urlObj.hostname.includes(s))) {
                indicators.push('URL shortener detected');
                riskLevel = 'medium';
            }
            
            // Check protocol
            if (urlObj.protocol === 'http:' && !urlObj.hostname.includes('localhost')) {
                indicators.push('Insecure HTTP connection');
                riskLevel = 'medium';
            }
            
        } catch (error) {
            indicators.push('Invalid URL format');
            riskLevel = 'high';
        }
        
        return {
            isSuspicious: indicators.length > 0,
            riskLevel: riskLevel,
            confidence: 0.5,
            indicators: indicators,
            spoofedBrand: null,
            reasoning: 'Fallback URL analysis'
        };
    }
    
    /**
     * Clear old cache entries
     */
    clearOldCache() {
        const now = Date.now();
        for (const [key, value] of this.analysisCache.entries()) {
            if (now - value.timestamp > this.cacheTimeout) {
                this.analysisCache.delete(key);
            }
        }
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LLMAnalyzer;
} else if (typeof window !== 'undefined') {
    window.LLMAnalyzer = LLMAnalyzer;
}
