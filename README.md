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

The PETRONAS Cybercrime Platform is a PHP-based web application designed to help combat cybercrime in Malaysia, with a **primary focus on deepfake recognition and detection**. The platform leverages advanced AI technology to identify and analyze deepfake content in images and videos.

### Key Capabilities

- **🎯 Deepfake Recognition**: Advanced AI-powered detection of AI-generated and deepfake content in images and videos
- **📊 Real-time Analysis**: Instant deepfake detection with confidence scoring and detailed technical analysis
- **🔍 Multi-format Support**: Analyze images (JPEG, PNG, GIF, WebP, BMP) and videos (MP4, AVI, MOV, WMV)
- **🌐 URL & Upload Support**: Analyze media from file uploads or direct URLs
- **📈 Comprehensive Reporting**: Detailed analysis reports with authenticity scores and indicators

### Additional Features

- **Incident Reporting**: Report cybercrime incidents with automatic deepfake detection
- **OSINT Monitoring**: Real-time threat intelligence monitoring and analysis
- **Scammer Database**: Searchable database of known scammers
- **Public Dashboard**: Public-facing interface for scammer searches and breach checking

## Features

### 🎯 Primary Feature: Deepfake Recognition

**Deepfake Scanner** (`deepfake-scanner.php`) - **The Platform's Core Feature**

The platform's flagship feature is its advanced deepfake recognition system, powered by Sightengine's state-of-the-art AI detection models.

#### Deepfake Detection Capabilities

- **✅ Image Deepfake Detection**
  - Detects AI-generated images with high accuracy
  - Identifies deepfake faces and manipulated content
  - Supports JPEG, PNG, GIF, WebP, BMP formats
  - Confidence scoring (0-100%) for authenticity assessment

- **✅ Video Deepfake Detection**
  - Analyzes video files frame-by-frame for AI-generated content
  - Detects deepfake videos and synthetic media
  - Supports MP4, AVI, MOV, WMV formats
  - Frame-level analysis for comprehensive detection

- **✅ Dual Analysis Methods**
  - **File Upload**: Direct upload from device
  - **URL Analysis**: Analyze media from web URLs
  - Automatic format detection and processing

- **✅ Comprehensive Analysis Reports**
  - AI-generated content detection score
  - Deepfake confidence percentage
  - Detailed technical indicators
  - Authenticity assessment
  - Multiple analysis tabs:
    - General analysis overview
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
  - `genai` - AI-generated content detection (images & videos)
  - `deepfake` - Deepfake-specific detection (images only)
- **Accuracy**: High-precision detection with confidence scoring
- **Processing Speed**: Real-time analysis for images, frame-by-frame for videos
- **Rate Limiting**: 10 scans per 5 minutes per user

### Additional Core Features

1. **Public Dashboard** (`public-dashboard.php`)
   - Scammer database search (phone, email, bank account, website)
   - Data breach checking via HaveIBeenPwned API
   - Statistics dashboard
   - Safety education resources

3. **Incident Reporting** (`report-incident.php`)
   - Multiple incident types (Phishing, Scam, Deepfake, etc.)
   - Evidence file upload
   - Automatic deepfake detection
   - OSINT threat matching
   - Priority assignment

4. **OSINT Monitor** (`osint-monitor.php`)
   - Interactive Malaysia threat map
   - Threat trend visualization
   - Real-time statistics
   - Multiple OSINT tools:
     - Semak Mule (Scammer Database)
     - Email Checker (Holehe)
     - Username Checker (Mr.Holmes)
     - Breach Checker (HaveIBeenPwned)

5. **Investigation Dashboard** (Requires login)
   - Case management
   - Evidence collection
   - Investigation notes
   - Activity timeline
   - Query saving

## System Requirements

### Server Requirements

- **PHP**: 7.4+ (Recommended: PHP 8.1+)
- **Web Server**: Apache 2.4+ or Nginx 1.18+
- **Database**: MySQL 5.7+ or MariaDB 10.3+ (Optional - platform uses mock data)
- **PHP Extensions**:
  - cURL (for API calls)
  - JSON
  - GD or ImageMagick (for image processing)
  - OpenSSL
  - mbstring

### PHP Configuration

```ini
upload_max_filesize = 50M
post_max_size = 50M
max_execution_time = 300
memory_limit = 256M
session.gc_maxlifetime = 3600
```

### Browser Support

- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

## Installation

1. **Clone or download the repository**
   ```bash
   git clone https://github.com/EricSyamir/petronascybersec.git
   cd petronas-cybercrime-platform
   ```

2. **Configure web server**
   - Point document root to project directory
   - Ensure mod_rewrite is enabled (Apache)
   - Set proper file permissions

3. **Configure API keys** (see Configuration section)

4. **Set up upload directories**
   ```bash
   mkdir -p uploads/deepfake_scans
   mkdir -p uploads/evidence
   chmod 755 uploads uploads/deepfake_scans uploads/evidence
   ```

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

#### 3. Add Scammer API
**Endpoint**: `api/add-scammer.php`  
**Method**: POST  
**Content-Type**: application/json

**Request Body**:
```json
{
  "scam_type": "phishing",
  "description": "Fake bank email scam",
  "scammer_email": "scammer@example.com",
  "scammer_phone": "012-345-6789",
  "scammer_website": "fake-bank.com",
  "threat_level": "high",
  "verification_status": "unverified"
}
```

**Valid Scam Types**: `phishing`, `romance`, `investment`, `lottery`, `job`, `shopping`, `cryptocurrency`, `other`  
**Valid Threat Levels**: `low`, `medium`, `high`, `critical`

#### 4. Sightengine API Wrapper
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

#### 5. OSINT Collector API
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

#### 6. OSINT Tools API
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

#### 7. Investigation API
**Endpoint**: `api/investigation.php`  
**Method**: POST  
**Authentication**: Required (Investigator/Admin role)

**Actions**:
- `create_case`: Create investigation case
- `get_cases`: Get list of cases
- `get_case`: Get case details
- `save_query`: Save OSINT query
- `add_evidence`: Add evidence to case
- `add_note`: Add note to case
- `get_timeline`: Get case activity timeline
- `update_status`: Update case status

**Request** (create_case):
```
POST api/investigation.php
action=create_case
title=Phishing Investigation
description=Investigating phishing campaign
priority=high
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

### Authenticated Access

**Default Accounts** (Change in production):
- Admin: `admin` / `admin123`
- Investigator: `investigator` / `investigator123`

Login at `login.php` to access:
- Investigation dashboard
- Case management
- Evidence collection

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

### Sightengine API (Primary Deepfake Recognition Engine)

**Purpose**: **Advanced AI-generated content and deepfake detection** - The core technology powering the platform's deepfake recognition feature  
**Status**: ✅ Active  
**Endpoint**: `https://api.sightengine.com/1.0/check.json`  
**Models**: 
- `genai` - AI-generated content detection (works for both images and videos)
- `deepfake` - Specialized deepfake detection (images only, provides enhanced accuracy for face-swapping and manipulation detection)  
**Rate Limit**: Subject to subscription tier  
**Cost**: Pay-per-use

**Deepfake Recognition Capabilities**:
- Detects AI-generated images with high precision
- Identifies deepfake faces and manipulated content
- Analyzes video files frame-by-frame for synthetic content
- Provides confidence scores for authenticity assessment
- Supports multiple image and video formats

**Integration Points**:
- `api/sightengine.php` - Main deepfake detection API wrapper
- `deepfake-scanner.php` - Primary deepfake recognition interface
- `report-incident.php` - Automatic deepfake detection in incident reports
- Chrome Extension - Browser-based deepfake scanning

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

