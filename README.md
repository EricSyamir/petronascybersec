# PETRONAS Cybercrime Platform

**Advanced Deepfake Recognition & Cybersecurity Platform**

A comprehensive cybersecurity platform featuring state-of-the-art **deepfake recognition technology** for combating cybercrime in Malaysia. The platform specializes in AI-powered deepfake detection and analysis, along with incident reporting, OSINT monitoring, and scammer database management.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Usage](#usage)
- [Chrome Extension](#chrome-extension)
- [External APIs](#external-apis)
- [Security](#security)
- [Project Structure](#project-structure)

## Overview

The PETRONAS Cybercrime Platform is a Python Flask-based web application designed to help combat cybercrime in Malaysia, with a **primary focus on deepfake recognition and detection**. The platform leverages a **dual detection system** combining Sightengine API (60% weight) and Machine Learning (40% weight) to identify and analyze deepfake content in images and videos with enhanced accuracy.

### Key Capabilities

- **🎯 Deepfake Recognition**: Advanced dual-system detection combining Sightengine API (60%) and Machine Learning (40%) for AI-generated and deepfake content in images and videos
- **📊 Real-time Analysis**: Instant deepfake detection with weighted confidence scoring and detailed technical analysis
- **🔍 Multi-format Support**: Analyze images (JPEG, PNG, GIF, WebP, BMP) with dual detection, videos (MP4, AVI, MOV, WMV) with Sightengine
- **🌐 URL & Upload Support**: Analyze media from file uploads or direct URLs
- **📈 Comprehensive Reporting**: Detailed analysis reports with weighted scores, individual system results, and authenticity indicators

### Additional Features

- **Incident Reporting**: Report cybercrime incidents with automatic deepfake detection
- **OSINT Monitoring**: Real-time threat intelligence monitoring and analysis
- **Scammer Database**: Searchable database of known scammers
- **Public Dashboard**: Public-facing interface for scammer searches and breach checking

## Features

### 🎯 Primary Feature: Deepfake Recognition

**Deepfake Scanner** (`deepfake-scanner.php`) - **The Platform's Core Feature**

The platform's flagship feature is its advanced deepfake recognition system, utilizing a **dual detection approach** that combines **Sightengine API** and **Machine Learning (PyTorch)** for enhanced accuracy and reliability.

#### Dual Detection System with Weighted Scoring

The platform employs a sophisticated **weighted combination** of two detection methods:

- **🔵 Sightengine API (60% weight)**
  - Industry-leading cloud-based deepfake detection
  - Supports both images and videos
  - Uses `genai` model for AI-generated content detection
  - Uses `deepfake` model for specialized face-swapping detection (images only)
  - Real-time analysis with high accuracy

- **🟢 Machine Learning Model (40% weight)**
  - Local PyTorch-based AI detection model
  - Trained on extensive dataset for AI vs Human classification
  - Available for images only (JPEG, PNG, GIF, WebP, BMP)
  - Provides additional validation layer
  - Runs locally for privacy-sensitive content

**Combined Scoring Formula:**
```
Final AI Probability = (SightEngine Score × 0.6) + (ML Score × 0.4)
Final Confidence = (SightEngine Confidence × 0.6) + (ML Confidence × 0.4)
```

**Benefits of Dual Detection:**
- ✅ **Higher Accuracy**: Cross-validation between two independent systems
- ✅ **Reduced False Positives**: ML model provides additional verification
- ✅ **Flexible Fallback**: If ML unavailable, SightEngine-only analysis is performed
- ✅ **Privacy Options**: ML runs locally, reducing data transmission
- ✅ **Comprehensive Coverage**: SightEngine handles videos, ML enhances image analysis

#### Deepfake Detection Capabilities

- **✅ Image Deepfake Detection**
  - **Dual Analysis**: Combines Sightengine API (60%) + ML Model (40%)
  - Detects AI-generated images with enhanced accuracy
  - Identifies deepfake faces and manipulated content
  - Supports JPEG, PNG, GIF, WebP, BMP formats
  - Weighted confidence scoring (0-100%) for authenticity assessment
  - Detailed breakdown showing individual scores and combined result

- **✅ Video Deepfake Detection**
  - **Sightengine Only**: Videos analyzed using Sightengine API (100%)
  - Analyzes video files frame-by-frame for AI-generated content
  - Detects deepfake videos and synthetic media
  - Supports MP4, AVI, MOV, WMV formats
  - Frame-level analysis for comprehensive detection
  - Note: ML model supports images only

- **✅ Dual Analysis Methods**
  - **File Upload**: Direct upload from device
  - **URL Analysis**: Analyze media from web URLs
  - Automatic format detection and processing
  - Automatic method selection (combined for images, SightEngine-only for videos)

- **✅ Comprehensive Analysis Reports**
  - **Combined Analysis Section**: Shows weighted breakdown
    - SightEngine score with 60% weight
    - ML score with 40% weight (images only)
    - Final combined score calculation
  - AI-generated content detection score
  - Deepfake confidence percentage
  - Detailed technical indicators from both systems
  - Authenticity assessment
  - Multiple analysis tabs:
    - General analysis overview
    - Combined weighted analysis breakdown
    - Face analysis (for images)
    - Text content analysis
    - Technical details and metadata

- **✅ Integration Features**
  - Automatic deepfake detection in incident reports
  - Chrome Extension integration for browser-based scanning
  - API access for programmatic analysis
  - Batch processing support

#### Technical Specifications

- **Detection Models**: 
  - **Sightengine API**:
    - `genai` - AI-generated content detection (images & videos)
    - `deepfake` - Deepfake-specific detection (images only)
  - **Machine Learning**:
    - PyTorch-based custom model (`best_model.pth`)
    - EfficientNet architecture with transfer learning
    - Trained for AI vs Human image classification
- **Weightage Distribution**:
  - Images: 60% SightEngine + 40% ML
  - Videos: 100% SightEngine (ML not applicable)
- **Accuracy**: Enhanced precision through dual-system validation
- **Processing Speed**: Real-time analysis for images, frame-by-frame for videos
- **Rate Limiting**: 10 scans per 5 minutes per user

### Additional Core Features


2. **Incident Reporting** (`report-incident.php`)
   - Multiple incident types (Phishing, Scam, Deepfake, etc.)
   - Evidence file upload
   - Automatic deepfake detection
   - OSINT threat matching
   - Priority assignment

3. **OSINT Monitor** (`osint-monitor.php`)
   - Interactive Malaysia threat map
   - Threat trend visualization
   - Real-time statistics
   - Multiple OSINT tools:
     - Semak Mule (Scammer Database)
     - Email Checker (Holehe)
     - Username Checker (Mr.Holmes)
     - Breach Checker (HaveIBeenPwned)


## System Requirements

### Server Requirements

- **Python**: 3.7+ (Recommended: Python 3.9+)
- **Web Server**: Gunicorn (production) or Flask development server
- **Database**: Not required (platform uses mock data)
- **Python Packages**:
  - Flask 2.3.0+
  - requests 2.31.0+
  - Werkzeug 2.3.0+
  - gunicorn 21.2.0+ (for production)
  - PyTorch 2.0.0+ (for ML detection - optional but recommended)
  - torchvision, timm, albumentations, Pillow, numpy (for ML model)

### Python Configuration

- **File Upload Limit**: 50MB (configured in Flask app)
- **Session Timeout**: 3600 seconds (1 hour)
- **ML Model**: `best_model.pth` (required for dual detection, optional for Sightengine-only)

### Browser Support

- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

## Installation

### Local Development

1. **Clone or download the repository**
   ```bash
   git clone https://github.com/EricSyamir/petronascybersec.git
   cd petronas-cybercrime-platform
   ```

2. **Set up Python virtual environment** (recommended)
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Configure API keys** (see Configuration section)

4. **Set up upload directories**
   ```bash
   mkdir -p uploads/deepfake_scans
   mkdir -p uploads/evidence
   mkdir -p uploads/test_ai_detection
   chmod 755 uploads uploads/deepfake_scans uploads/evidence uploads/test_ai_detection
   ```

5. **Install Python dependencies** (for ML model - required for dual detection)
   ```bash
   pip install -r requirements.txt
   ```
   **Note**: ML model is optional but recommended. If not available, the platform will use Sightengine-only detection (100% weight instead of 60%).

### Deploy to Render

1. **Connect your GitHub repository to Render**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your repository: `EricSyamir/petronascybersec`

2. **Configure service settings:**
   - **Environment**: Python (Flask)
   - **Region**: Singapore (or closest to users)
   - **Build Command**: 
     ```bash
     mkdir -p uploads/deepfake_scans uploads/evidence uploads/test_ai_detection templates && pip install -r requirements.txt && pip install gunicorn
     ```
   - **Start Command**: 
     ```bash
     gunicorn --bind 0.0.0.0:$PORT app:app
     ```
   **Note**: The platform now runs on Python Flask. ML model dependencies are included in requirements.txt for dual detection support.

3. **Set environment variables:**
   - `SIGHTENGINE_API_USER`: Your Sightengine API user
   - `SIGHTENGINE_API_SECRET`: Your Sightengine API secret
   - `ENCRYPTION_KEY`: Generate with `openssl rand -hex 32`
   - `PYTHON_PATH`: `/usr/bin/python3` (or your Python path)

4. **Deploy** - Render will automatically build and deploy your application

See `render.yaml` for automated deployment configuration.

## Configuration

### API Configuration (`config/database.php`)

The platform uses mock data by default. To configure external APIs:

```php
// Sightengine API (Required for deepfake detection)
define('SIGHTENGINE_API_USER', 'your_api_user');
define('SIGHTENGINE_API_SECRET', 'your_api_secret');
define('SIGHTENGINE_API_URL', 'https://api.sightengine.com/1.0/check.json');

// Security settings
define('ENCRYPTION_KEY', 'your_encryption_key');
define('SESSION_TIMEOUT', 3600); // 1 hour
define('MAX_UPLOAD_SIZE', 50 * 1024 * 1024); // 50MB
```

### Chrome Extension Configuration

The Chrome Extension uses Gemini API for content analysis. Configure in `chrome-extension/llm-analyzer.js`:

```javascript
const GEMINI_API_KEY = 'your_gemini_api_key';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
```

## API Documentation

### Internal REST APIs

All APIs return JSON responses and support CORS.

#### 1. Status API
**Endpoint**: `api/status.php`  
**Method**: GET  
**Description**: Health check endpoint

**Response**:
```json
{
  "success": true,
  "status": "online",
  "services": {
    "database": true,
    "sightengine": true
  }
}
```

#### 2. Scammer Search API
**Endpoint**: `api/scammer-search.php`  
**Method**: GET

**Parameters**:
- `action`: `search` or `stats`
- `q`: Search query (required for search)
- `type`: `all`, `email`, `phone`, `website`, `description` (default: `all`)
- `limit`: Results per page (default: 20, max: 100)
- `offset`: Pagination offset (default: 0)

**Example**:
```
GET api/scammer-search.php?action=search&q=test@example.com&type=email
```

**Response**:
```json
{
  "success": true,
  "results": [...],
  "total_results": 10,
  "page_info": {
    "limit": 20,
    "offset": 0,
    "has_more": false
  }
}
```

#### 3. Sightengine API Wrapper
**Endpoint**: `api/sightengine.php`  
**Method**: POST

**Actions**:
- `analyze_upload`: Analyze uploaded file
- `analyze_url`: Analyze media from URL
- `get_stats`: Get detection statistics

**Request** (analyze_upload):
```
POST api/sightengine.php
Content-Type: multipart/form-data
action=analyze_upload
media=[file]
```

**Response**:
```json
{
  "success": true,
  "detection": {
    "id": 1234,
    "is_ai_generated": true,
    "is_deepfake": false,
    "confidence_score": 0.85,
    "indicators": [...]
  }
}
```

**Rate Limiting**: 10 scans per 5 minutes per user

#### 4. OSINT Collector API
**Endpoint**: `api/osint-collector.php`  
**Method**: POST

**Actions**:
- `collect_threats`: Collect latest threats
- `search_threats`: Search threats by keywords
- `get_stats`: Get threat statistics
- `get_location_data`: Get threats by location
- `get_trending`: Get trending keywords

**Request** (search_threats):
```
POST api/osint-collector.php
action=search_threats
keywords=phishing,scam
threat_level=high
limit=50
offset=0
```

**Response**:
```json
{
  "success": true,
  "threats": [...],
  "count": 15
}
```

#### 5. OSINT Tools API
**Endpoint**: `api/osint-tools.php`  
**Method**: POST

**Actions**:
- `check_email`: Check email on platforms (Holehe)
- `check_username`: Check username on social media (Mr.Holmes)
- `check_breach`: Check email breaches (HaveIBeenPwned)
- `check_bank_account`: Check bank account (Semak Mule)
- `check_phone`: Check phone number (Semak Mule)
- `check_company`: Check company name (Semak Mule)

**Request** (check_email):
```
POST api/osint-tools.php
action=check_email
email=test@example.com
```

**Response**:
```json
{
  "success": true,
  "data": {
    "email": "test@example.com",
    "platforms": [...],
    "registered_count": 5,
    "analysis": {
      "type": "real_person",
      "confidence": "high"
    }
  }
}
```


## Usage

### Public Access

1. **🎯 Deepfake Recognition** (Primary Feature): 
   - Navigate to `deepfake-scanner.php`
   - Upload images/videos or provide URL
   - Get instant deepfake detection results with confidence scores
   - View detailed analysis reports
2. **Scammer Search**: Navigate to `public-dashboard.php` and search by phone, email, bank account, or website
3. **Report Incident**: Submit cybercrime reports at `report-incident.php` (includes automatic deepfake detection)
4. **OSINT Monitor**: Access OSINT tools at `osint-monitor.php`


## Chrome Extension

### Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `chrome-extension` directory

### Features

- **Context Menu Integration**: Right-click to scan images, check links, report content
- **Auto-Scanning**: Automatic page threat detection
- **Real-time Notifications**: Threat alerts and deepfake detection results
- **Bilingual Support**: English/Bahasa Malaysia toggle

### Permissions

- `activeTab`: Access current tab content
- `storage`: Store settings and cache
- `contextMenus`: Right-click menu integration
- `notifications`: Show threat alerts

## External APIs

### Sightengine API (Primary Deepfake Recognition Engine - 60% Weight)

**Purpose**: **Advanced AI-generated content and deepfake detection** - Primary component (60% weight) of the platform's dual deepfake recognition system  
**Status**: ✅ Active  
**Endpoint**: `https://api.sightengine.com/1.0/check.json`  
**Models**: 
- `genai` - AI-generated content detection (works for both images and videos)
- `deepfake` - Specialized deepfake detection (images only, provides enhanced accuracy for face-swapping and manipulation detection)  
**Rate Limit**: Subject to subscription tier  
**Cost**: Pay-per-use  
**Weight in Combined Analysis**: 60%

**Deepfake Recognition Capabilities**:
- Detects AI-generated images with high precision
- Identifies deepfake faces and manipulated content
- Analyzes video files frame-by-frame for synthetic content
- Provides confidence scores for authenticity assessment
- Supports multiple image and video formats
- Primary detection method for videos (100% weight)

**Integration Points**:
- `api/sightengine.php` - Main deepfake detection API wrapper
- `deepfake-scanner.php` - Primary deepfake recognition interface (60% weight in combined analysis)
- `report-incident.php` - Automatic deepfake detection in incident reports
- Chrome Extension - Browser-based deepfake scanning

### Machine Learning Model (Secondary Deepfake Recognition - 40% Weight)

**Purpose**: **Local AI detection model** - Secondary component (40% weight) providing additional validation layer  
**Status**: ✅ Active (Images only)  
**Model File**: `best_model.pth`  
**Framework**: PyTorch  
**Architecture**: EfficientNet with transfer learning  
**Weight in Combined Analysis**: 40% (Images only)  
**API Endpoint**: `api/ai_detection.php`

**Deepfake Recognition Capabilities**:
- Local PyTorch-based AI vs Human image classification
- Trained on extensive dataset for high accuracy
- Provides privacy-preserving local analysis option
- Cross-validates with Sightengine results for enhanced reliability
- Supports JPEG, PNG, GIF, WebP, BMP formats
- **Note**: Only available for images (videos use Sightengine only)

**Integration Points**:
- `api/ai_detection.php` - ML detection API endpoint
- `includes/ai_detection_tester.php` - ML detection class
- `ai_detection_inference.py` - Python inference script
- `deepfake-scanner.js` - Client-side combination logic (40% weight)
- Combined with Sightengine results for final weighted score

**Requirements**:
- Python 3.7+ with PyTorch installed
- Model file: `best_model.pth`
- Dependencies: torch, torchvision, timm, albumentations, Pillow, numpy

### HaveIBeenPwned API

**Purpose**: Data breach checking  
**Status**: ✅ Active  
**Endpoint**: `https://haveibeenpwned.com/api/v3/breachedaccount/{email}`  
**Rate Limit**: Free tier available  
**Cost**: Free tier or paid subscription

**Integration Points**:
- `api/osint-tools.php` (check_breach action)
- `public-dashboard.php`

### Semak Mule API

**Purpose**: Scammer database (Royal Malaysian Police)  
**Status**: ✅ Active  
**Endpoint**: `https://semakmule.rmp.gov.my/api/check`  
**Integration**: Via `SemakMule/api-client.php`

**Integration Points**:
- `api/osint-tools.php`
- `osint-monitor.php`

### Gemini API (Chrome Extension)

**Purpose**: LLM-powered content analysis  
**Status**: ✅ Active (Chrome Extension only)  
**Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`  
**Cost**: Pay-per-use

**Integration Points**:
- `chrome-extension/llm-analyzer.js`

## Security

### Authentication & Authorization

- Role-based access control (RBAC)
- Session management with timeout
- Password hashing (bcrypt)
- CSRF token protection
- Login attempt logging

### Rate Limiting

- Search API: 30 requests per 5 minutes
- Deepfake scanning: 10 scans per 5 minutes
- Incident reporting: 5 reports per hour

### Data Protection

- Sensitive data masking (emails, phone numbers)
- PDPA compliance considerations
- Audit logging for all actions
- Encrypted data transmission (HTTPS recommended)

### Input Validation

- File type validation
- File size limits (50MB)
- SQL injection prevention (prepared statements)
- XSS prevention (output escaping)

## Project Structure

```
petronas-cybercrime-platform/
├── api/                          # API endpoints
│   ├── add-scammer.php          # Add scammer to database
│   ├── investigation.php        # Investigation case management
│   ├── init-osint-data.php      # OSINT data initialization
│   ├── osint-collector.php      # Threat intelligence collection
│   ├── osint-tools.php          # OSINT tools (email, username, breach)
│   ├── scammer-search.php       # Scammer database search
│   ├── sightengine.php          # Deepfake detection wrapper
│   └── status.php               # Health check endpoint
├── assets/                      # Static assets
│   ├── css/
│   │   └── petronas-master.css # Main stylesheet
│   ├── images/                 # Images and logos
│   └── js/                      # JavaScript files
│       ├── deepfake-scanner.js
│       ├── main.js
│       ├── osint-monitor.js
│       ├── public-dashboard.js
│       └── report-incident.js
├── chrome-extension/           # Chrome browser extension
│   ├── background.js           # Background service worker
│   ├── content.js             # Content script
│   ├── llm-analyzer.js        # Gemini API integration
│   ├── manifest.json          # Extension manifest
│   ├── popup.html/js/css      # Extension popup UI
│   └── options.html/js/css    # Extension settings
├── config/
│   └── database.php            # Configuration and API keys
├── includes/
│   ├── auth.php                # Authentication functions
│   └── language.php            # Internationalization
├── SemakMule/                  # Semak Mule API client
│   ├── api-client.php          # PHP client
│   └── api-client.js          # JavaScript client
├── scripts/                    # Python scripts (optional)
│   ├── holehe_check.py        # Email checker
│   └── mrholmes_check.py      # Username checker
├── uploads/                     # Upload directories
│   ├── deepfake_scans/        # Temporary scan files
│   └── evidence/              # Evidence files
├── index.php                   # Home page
├── login.php                   # Login page
├── logout.php                  # Logout handler
├── deepfake-scanner.php        # 🎯 PRIMARY: Deepfake recognition & detection page
├── osint-monitor.php          # OSINT monitoring dashboard
├── public-dashboard.php       # Public scammer search
├── report-incident.php        # Incident reporting form
└── README.md                   # This file
```

## Language Support

The platform supports bilingual interface:
- **English** (en)
- **Bahasa Malaysia** (bm)

Language preference is stored in session and can be toggled via UI.

## File Upload

### Supported Formats

- **Images**: JPEG, PNG, GIF, WebP, BMP
- **Videos**: MP4, AVI, MOV, WMV
- **Documents**: PDF, DOC, DOCX, TXT

### Upload Limits

- Maximum file size: 50MB
- Upload directories: `uploads/deepfake_scans/`, `uploads/evidence/`

## Troubleshooting

### Common Issues

1. **API Errors**
   - Verify API keys in `config/database.php`
   - Check internet connectivity
   - Verify API service status

2. **File Upload Errors**
   - Check PHP `upload_max_filesize` and `post_max_size`
   - Verify directory permissions (755)
   - Ensure upload directories exist

3. **Chrome Extension Issues**
   - Verify manifest.json permissions
   - Check API keys in `llm-analyzer.js`
   - Ensure platform URL is correct in `background.js`

## License

This project is provided as-is for educational and demonstration purposes.

## Support

For issues or questions:
- Check API documentation in respective API files
- Review configuration in `config/database.php`
- Verify external API status and credentials

---

## 🎯 Deepfake Recognition - Platform Highlight

This platform specializes in **deepfake recognition and detection**, providing state-of-the-art AI-powered analysis to identify synthetic and manipulated media. Whether you need to verify the authenticity of an image, detect deepfake videos, or analyze suspicious content, the platform's advanced detection algorithms provide accurate, real-time results with detailed confidence scoring.

**Key Use Cases**:
- Verify authenticity of images and videos
- Detect deepfake content in social media
- Analyze suspicious media in incident reports
- Protect against AI-generated misinformation
- Investigate potential deepfake scams

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Primary Feature**: Advanced Deepfake Recognition & Detection

