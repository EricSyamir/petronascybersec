# PETRONAS Cybercrime Platform - Features & APIs Report

## Executive Summary
This document provides a comprehensive overview of all features and APIs implemented in the PETRONAS Cybercrime Platform. The platform is designed to combat cybercrime in Malaysia through incident reporting, deepfake detection, OSINT monitoring, and scammer database management.

---

## Core Features

### 1. Public Dashboard (`public-dashboard.php`)
**Purpose**: Public-facing interface for searching scammer database and checking data breaches

**Features**:
- **Scammer Database Search**
  - Search by phone number, bank account, email, or website
  - Advanced filters (scam type, threat level, verification status)
  - Pagination support
  - Export results functionality
  - Real-time statistics display
  - Modal-based detailed scammer information

- **Data Breach Checker**
  - Integration with HaveIBeenPwned (HIBP) API
  - Email breach checking
  - Display of breach details and affected services

- **Statistics Dashboard**
  - Total reported scammers
  - Verified reports count
  - Monthly reports tracking
  - High threat level indicators

- **Safety Education**
  - Safety tips and best practices
  - How-to-report guides
  - Links to external resources (Cyber999, PDRM)

**APIs Used**:
- HaveIBeenPwned API (HIBP) - for data breach checking
- Internal API: `api/scammer-search.php` - for database searches

---

### 2. Deepfake Scanner (`deepfake-scanner.php`)
**Purpose**: Detect AI-generated and deepfake content in images and videos

**Features**:
- **Media Upload**
  - Drag-and-drop file upload
  - Support for images and videos
  - Multiple file upload capability
  - URL-based media analysis

- **Analysis Results**
  - Authenticity assessment with confidence scores
  - AI-generated content detection
  - Detailed technical analysis tabs:
    - General analysis
    - Face analysis
    - Text content analysis
    - Technical details

- **Recent Scans History**
  - View previously scanned media
  - Quick re-analysis capability

- **Education & Warnings**
  - Deepfake warning banners
  - Educational content about deepfakes
  - Reporting links for suspicious content

**APIs Used**:
- **Sightengine API** - Primary deepfake/AI detection service
  - Endpoint: `https://api.sightengine.com/1.0/check.json`
  - Model: `genai` (AI-generated content detection)
  - Methods: File upload and URL analysis
- Internal API: `api/sightengine.php` - Wrapper for Sightengine API

---

### 3. Incident Reporting (`report-incident.php`)
**Purpose**: Allow users to report cybercrime incidents

**Features**:
- **Incident Classification**
  - Types: Phishing, Scam, Deepfake, Identity Theft, Malware, Other
  - Priority determination (low, medium, high, critical)
  - Location tracking

- **Evidence Management**
  - Multiple file upload support
  - Supported formats: Images, Videos, PDFs, Documents
  - Automatic deepfake detection on media files
  - File validation and size limits (50MB max)

- **OSINT Matching**
  - Automatic keyword extraction
  - Match against existing OSINT data
  - Threat correlation

- **Priority Assignment**
  - Automatic priority calculation based on:
    - Incident type severity
    - Deepfake detection results
    - OSINT match correlation
  - High-priority notification system

- **Contact Information**
  - Required for non-logged-in users
  - Optional organization affiliation

- **Consent Management**
  - Investigation consent
  - Contact consent
  - Data usage consent for research

**APIs Used**:
- Internal API: `api/sightengine.php` - for automatic deepfake detection
- Internal API: `api/osint-collector.php` - for threat matching
- Internal API: `api/add-scammer.php` - for adding scammers to database

---

### 4. OSINT Monitor (`osint-monitor.php`)
**Purpose**: Real-time threat intelligence monitoring dashboard (Investigator/Admin only)

**Features**:
- **Threat Collection**
  - Manual trigger for latest threat collection
  - Malaysian-focused sources:
    - Social media (Facebook, Twitter, Telegram)
    - Forums (Lowyat.NET, Cari.com.my)
    - News sources (Bernama, The Star, MalaysiaKini)
    - Government sources (Cyber999, MCMC, MAMPU)

- **Visualization**
  - Malaysia Threat Map (Leaflet.js)
  - Threat trends chart (Chart.js)
  - Trending keywords cloud
  - Real-time statistics cards

- **Search & Filtering**
  - Keyword-based search
  - Threat level filtering (critical, high, medium, low)
  - Timeframe filtering (24h, 7d, 30d)

- **Threat Management**
  - View threat details in modal
  - Mark threats as reviewed
  - Escalate threats to authorities
  - Export threat data

- **Source Monitoring**
  - Active source status indicators
  - Threat count per source
  - Source health monitoring

**APIs Used**:
- **Leaflet.js** - Interactive mapping library
- **Chart.js** - Data visualization
- Internal API: `api/osint-collector.php` - for threat collection and management

---

### 5. Index/Home Page (`index.php`)
**Purpose**: Landing page with platform overview

**Features**:
- Quick statistics display
- Call-to-action buttons
- External resource links (Cyber999, PDRM)
- Bilingual support (English/Bahasa Malaysia)

**Statistics Displayed**:
- Total known scammers
- Verified reports
- Total reports
- Deepfakes detected

---

## API Endpoints

### 1. Status API (`api/status.php`)
**Purpose**: Health check endpoint for Chrome extension

**Features**:
- Service status checking
- Database connection verification
- API availability checks (Sightengine, Gemini)
- CORS support for browser extensions

**Response Format**:
```json
{
  "success": true,
  "status": "online",
  "services": {
    "database": true,
    "sightengine": true,
    "gemini": true
  },
  "overall": "healthy"
}
```

---

### 2. Scammer Search API (`api/scammer-search.php`)
**Purpose**: Search scammer database

**Features**:
- **Search Types**:
  - Email search
  - Phone number search
  - Website search
  - Description search
  - Social media search
  - All fields search

- **Rate Limiting**: 30 searches per 5 minutes per IP
- **Data Masking**: Sensitive data (emails, phones) masked for privacy
- **Pagination**: Configurable limit and offset
- **Statistics**: Aggregate statistics endpoint

**Endpoints**:
- `GET ?action=search&q={query}&type={type}&limit={limit}&offset={offset}`
- `GET ?action=stats`

**Response Format**:
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

---

### 3. Add Scammer API (`api/add-scammer.php`)
**Purpose**: Add new scammers to database

**Features**:
- Duplicate detection (by email, phone, website)
- Automatic report count incrementing
- Threat level escalation logic
- Verification status management

**Valid Scam Types**:
- phishing, romance, investment, lottery, job, shopping, cryptocurrency, other

**Valid Threat Levels**:
- low, medium, high, critical

**Request Format**:
```json
{
  "scam_type": "phishing",
  "description": "...",
  "scammer_email": "...",
  "scammer_phone": "...",
  "threat_level": "high",
  "verification_status": "unverified"
}
```

---

### 4. Sightengine API Wrapper (`api/sightengine.php`)
**Purpose**: Deepfake and AI-generated content detection

**Features**:
- File upload analysis
- URL-based analysis
- Result processing and storage
- Detection statistics
- Rate limiting (10 scans per 5 minutes)

**Actions**:
- `analyze_upload` - Analyze uploaded file
- `analyze_url` - Analyze media from URL
- `get_stats` - Get detection statistics

**Integration**:
- Uses Sightengine API with `genai` model
- Stores results in `deepfake_detections` table
- File hash deduplication

---

### 5. OSINT Collector API (`api/osint-collector.php`)
**Purpose**: Collect and manage threat intelligence

**Features**:
- **Threat Collection**:
  - Social media monitoring
  - Forum scraping (simulated)
  - News aggregation
  - Government alerts

- **Threat Search**:
  - Keyword-based search
  - Threat level filtering
  - Location-based filtering
  - Timeframe filtering

- **Analytics**:
  - Threat statistics by timeframe
  - Location-based threat mapping
  - Trending keywords analysis

**Actions**:
- `collect_threats` - Collect latest threats
- `search_threats` - Search existing threats
- `get_stats` - Get threat statistics
- `get_location_data` - Get threats by location
- `get_trending` - Get trending keywords

**Access Control**: Requires investigator or admin role

---

### 6. Working API (`WORKING API/check_ai.php`)
**Purpose**: Alternative deepfake detection endpoint

**Features**:
- File upload support
- URL-based analysis
- Sightengine API integration
- Simplified response format

---

## Database Schema

### Tables

1. **users**
   - User accounts with roles (public, petronas_staff, investigator, admin)
   - Language preferences
   - Organization affiliations

2. **reports**
   - Incident reports
   - Evidence files (JSON)
   - Deepfake analysis results (JSON)
   - OSINT matches (JSON)
   - Priority and status tracking

3. **deepfake_detections**
   - Detection results from Sightengine
   - File hash deduplication
   - Confidence scores
   - Links to reports

4. **osint_data**
   - Collected threat intelligence
   - Keywords (JSON)
   - Threat levels
   - Source tracking

5. **scammer_database**
   - Public scammer records
   - Verification status
   - Report counts
   - Threat levels

6. **investigation_logs**
   - Case investigation tracking
   - Investigator actions
   - Case details

7. **audit_logs**
   - Comprehensive audit trail
   - User actions
   - Data changes
   - Security events

---

## External APIs & Services

### 1. Sightengine API
**Purpose**: AI-generated content and deepfake detection

**Configuration**:
- API User: `1931720966`
- Endpoint: `https://api.sightengine.com/1.0/check.json`
- Model: `genai`
- Methods: File upload (CURLFile) and URL analysis

**Used In**:
- Deepfake Scanner page
- Incident reporting (automatic analysis)
- Working API endpoint

---

### 2. HaveIBeenPwned (HIBP) API
**Purpose**: Data breach checking

**Used In**:
- Public Dashboard (breach checker)

**Note**: Implementation appears in frontend JavaScript (not visible in PHP files)

---

## Security Features

### 1. Authentication & Authorization
- Role-based access control (RBAC)
- Session management with timeout
- Password hashing (bcrypt)
- CSRF token protection
- Login attempt logging

### 2. Rate Limiting
- Search API: 30 requests per 5 minutes
- Deepfake scanning: 10 scans per 5 minutes
- Incident reporting: 5 reports per hour
- Session-based rate limiting

### 3. Data Protection
- Sensitive data masking (emails, phone numbers)
- PDPA compliance mentions
- Audit logging for all actions
- Encrypted data transmission

### 4. Input Validation
- File type validation
- File size limits (50MB)
- SQL injection prevention (prepared statements)
- XSS prevention (output escaping)

---

## Language Support

### Bilingual Interface
- **Languages**: English (en) and Bahasa Malaysia (bm)
- **Implementation**: `includes/language.php`
- **Features**:
  - Session-based language preference
  - User preference storage
  - Dynamic language switching
  - Comprehensive translations for all UI elements

---

## File Upload Management

### Supported File Types
- **Images**: JPEG, PNG, GIF, WebP, BMP
- **Videos**: MP4, AVI, MOV, WMV
- **Documents**: PDF, DOC, DOCX, TXT

### Upload Directories
- Evidence: `uploads/evidence/{Y}/{m}/{d}/`
- Deepfake scans: `uploads/deepfake_scans/`

### Security
- File type validation
- Size limits (50MB default, 10MB for API)
- Temporary file cleanup
- Unique filename generation

---

## Integration Points

### 1. Chrome Extension
- Status API for health checks
- CORS-enabled endpoints
- JSON response format

### 2. External Authorities
- Cyber999 (cyber999.gov.my)
- PDRM e-Reporting (rmp.gov.my/e-reporting)
- Links integrated throughout platform

### 3. Malaysian Sources
- Facebook pages
- Twitter accounts
- Telegram channels
- Forums (Lowyat.NET, Cari.com.my)
- News sources (Bernama, The Star, etc.)
- Government portals

---

## Configuration

### Database
- Host: localhost
- Database: petronas_cybercrime
- User: root
- Auto-initialization on first run

### API Keys
- Sightengine API credentials configured in `config/database.php`
- API keys stored as constants (should use environment variables in production)

### Constants
- `MAX_UPLOAD_SIZE`: 50MB
- `SESSION_TIMEOUT`: 3600 seconds (1 hour)
- `OSINT_UPDATE_INTERVAL`: 300 seconds (5 minutes)
- `OSINT_DATA_RETENTION`: 30 days

---

## Statistics & Analytics

### Tracked Metrics
- Total scammers in database
- Verified reports count
- Deepfakes detected
- Active threats (OSINT)
- Report counts by type
- Threat levels distribution
- Recent reports (30 days)
- Location-based threat data

---

## Compliance & Governance

### PDPA Compliance
- Personal Data Protection Act mentions
- Data anonymization for research
- Consent management
- Privacy policy references

### PETRONAS Code of Business Ethics
- COBE references in incident reporting
- Ethical handling of reports
- Transparency notices

---

## Browser Extension Compatibility

### Chrome Extension Support
- Status endpoint for health checks
- CORS headers configured
- JSON response format
- API versioning (v1.0.0)

---

## Error Handling

### Logging
- Error logging to PHP error log
- Audit logging for security events
- Failed login attempt logging
- API error tracking

### User Feedback
- Success/error messages
- Validation feedback
- Loading indicators
- Graceful error messages

---

## Future Enhancements (Inferred from Code)

### Potential Features
- Gemini API integration (status check present)
- Real-time notifications
- Email notifications for high-priority reports
- Advanced analytics dashboard
- Mobile app support
- API authentication tokens

---

## Summary

The PETRONAS Cybercrime Platform is a comprehensive cybersecurity solution featuring:

1. **Public-facing features**: Scammer database search, data breach checking, deepfake detection
2. **Reporting system**: Incident reporting with automatic threat analysis
3. **OSINT monitoring**: Real-time threat intelligence from Malaysian sources
4. **APIs**: RESTful APIs for search, reporting, and threat management
5. **Security**: Multi-layered security with authentication, authorization, rate limiting
6. **Compliance**: PDPA compliance and PETRONAS COBE alignment
7. **Internationalization**: Bilingual support (English/Bahasa Malaysia)

The platform integrates with external services (Sightengine, HIBP) and provides a solid foundation for cybersecurity incident management and threat intelligence in Malaysia.

---

**Report Generated**: 2025
**Platform Version**: 1.0.0
**Total PHP Files Analyzed**: 16

