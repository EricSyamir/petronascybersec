# PETRONAS Cybercrime Platform
## System Requirements & API Dependencies
### Technical Documentation for Stakeholders

---

## Document Information
- **Document Version**: 1.0
- **Date**: January 2025
- **Platform Version**: 1.0.0
- **Prepared For**: Shareholders & Technical Review Board

---

## Executive Summary

The PETRONAS Cybercrime Platform is a comprehensive cybersecurity solution built on PHP with MySQL database, integrating third-party AI services for deepfake detection and threat intelligence. The platform requires standard web hosting infrastructure with specific API integrations and dependencies.

---

## 1. External APIs & Third-Party Services

### 1.1 Sightengine API (Primary Service)
**Status**: ✅ **ACTIVELY INTEGRATED**

**Purpose**: AI-generated content and deepfake detection

**Service Provider**: Sightengine (https://sightengine.com)

**API Endpoint**: `https://api.sightengine.com/1.0/check.json`

**API Credentials**:
- API User ID: `1931720966`
- API Secret: Configured (stored securely)

**Integration Points**:
- Deepfake Scanner (`api/sightengine.php`)
- Incident Reporting (automatic media analysis)
- Working API endpoint (`WORKING API/check_ai.php`)

**API Usage**:
- **Method**: REST API (POST requests)
- **Model Used**: `genai` (AI-generated content detection)
- **Request Types**:
  - File upload (multipart/form-data)
  - URL-based analysis (GET with query parameters)
- **Rate Limiting**: 10 scans per 5 minutes per user
- **Timeout**: 30 seconds per request

**Cost Implications**:
- **Pricing Model**: Pay-per-use API
- **Usage**: Based on number of media scans
- **Estimated Monthly Cost**: Varies based on scan volume
- **Note**: Requires active subscription with Sightengine

**Files Using This API**:
1. `api/sightengine.php` (Primary integration)
2. `WORKING API/check_ai.php` (Alternative endpoint)
3. `report-incident.php` (Automatic deepfake detection)
4. `deepfake-scanner.php` (User-initiated scans)
5. `chrome-extension/background.js` (Browser extension integration)

---

### 1.2 HaveIBeenPwned (HIBP) API

**Purpose**: Data breach checking for email addresses

**Service Provider**: HaveIBeenPwned (https://haveibeenpwned.com)

**Current Status**: 
- UI components implemented
- Mock data structure in place
- **Actual API integration pending**

**Intended Integration**:
- Endpoint: `https://haveibeenpwned.com/api/v3/breachedaccount/{email}`
- **Note**: Requires API key subscription for production use
- Free tier available with rate limits

**Cost Implications**:
- **Free Tier**: Limited requests per month
- **Paid Tier**: Required for production (pricing varies)
- **Current Cost**: $0 (not integrated)

**Files Referencing HIBP**:
- `public-dashboard.php` (UI component)
- `assets/js/public-dashboard.js` (Mock implementation)

---



**Purpose**: Advanced AI-powered scammer/phishing detection and content analysis

**Service Provider**: Google (Generative AI)

**Current Status**: 
- **Fully integrated in Chrome Extension**
- Used for page content analysis
- Text content analysis for phishing indicators
- URL safety analysis
- LLM-powered threat detection

**API Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`

**API Key**: Configured in Chrome Extension (`llm-analyzer.js`)
- API Key: `AIzaSyCOnJaGxm18KuXFBj7kJdo16mEcdmyJYzw`

**Integration Points**:
- Chrome Extension LLM Analyzer (`chrome-extension/llm-analyzer.js`)
- Page content analysis
- Text content analysis
- URL safety checking
- Phishing detection
- Scam pattern recognition

**Usage**:
- **Model**: `gemini-2.0-flash`
- **Method**: REST API (POST requests)
- **Rate Limiting**: 5-minute cache to prevent duplicate calls
- **Fallback**: Local pattern matching when API fails
- **Timeout**: Configurable (default 30 seconds)

**Cost Implications**:
- **Pricing Model**: Pay-per-use (Google Generative AI)
- **Current Cost**: Based on API usage from extension
- **Estimated Monthly Cost**: $10 - $100 (based on usage volume)
- **Note**: Free tier available with limits

**Files Using This API**:
1. `chrome-extension/llm-analyzer.js` (Primary integration)
2. `chrome-extension/popup.js` (Extension UI integration)
3. `chrome-extension/content.js` (Content script integration)

---

## 2. Third-Party Libraries & CDN Dependencies

### 2.1 Chart.js
**Status**: ✅ **ACTIVE**

**Purpose**: Data visualization for threat trends and statistics

**Source**: CDN (https://cdn.jsdelivr.net/npm/chart.js)

**Version**: Latest (from CDN)

**Usage**: 
- OSINT Monitor dashboard
- Threat trend visualization
- Statistics charts

**Files Using**:
- `osint-monitor.php` (Chart.js integration)

**Cost**: **FREE** (Open source, CDN hosted)

**Dependency**: Requires internet connection for CDN access

---

### 2.2 Leaflet.js
**Status**: ✅ **ACTIVE**

**Purpose**: Interactive mapping for threat geolocation

**Source**: CDN (https://unpkg.com/leaflet@1.9.4/)

**Version**: 1.9.4

**Usage**:
- Malaysia Threat Map visualization
- Geographic threat distribution
- Location-based threat tracking

**Files Using**:
- `osint-monitor.php` (Leaflet.js integration)

**Cost**: **FREE** (Open source, CDN hosted)

**Dependency**: Requires internet connection for CDN access

---

## 2.5 Chrome Extension Integration

**Status**: ✅ **ACTIVE**

**Extension Name**: PETRONAS Cybercrime Reporter

**Version**: 1.0.0

**Manifest Version**: 3 (Chrome Extension Manifest V3)

### 2.5.1 Extension Platform APIs Used

The Chrome Extension integrates with the following platform APIs:

1. **`api/status.php`**
   - Health check and connection status
   - Service availability verification

2. **`api/sightengine.php`**
   - Deepfake detection via platform wrapper
   - Image analysis from extension context

3. **`api/osint-collector.php`**
   - Threat intelligence statistics
   - Critical threat notifications

### 2.5.2 External APIs Used by Extension

1. **Sightengine API** (via platform)
   - Indirect access through platform API
   - Image deepfake detection

2. **Gemini API** (Direct integration)
   - Direct API calls from extension
   - LLM-powered content analysis
   - Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`

### 2.5.3 Chrome Extension Permissions

**Required Permissions**:
- `activeTab` - Access current tab content
- `storage` - Store user settings and cache
- `contextMenus` - Right-click menu integration
- `scripting` - Execute content scripts
- `notifications` - Show threat alerts
- `tabs` - Access browser tabs

**Host Permissions**:
- `https://api.sightengine.com/*` - Direct Sightengine access
- `https://generativelanguage.googleapis.com/*` - Gemini API access
- `https://localhost/*` - Local development
- `http://localhost/*` - Local development
- `https://petronas-cybercrime.com/*` - Production domain

### 2.5.4 Extension Features

**Core Features**:
- **Context Menu Integration**:
  - Scan image for deepfakes
  - Check link safety
  - Report selected text
  - Scan entire page

- **Auto-Scanning** (Optional):
  - Automatic page threat detection
  - Badge notifications for threats
  - Background threat monitoring

- **Real-time Notifications**:
  - Threat alerts
  - Critical threat updates
  - Deepfake detection results

- **Language Support**:
  - English/Bahasa Malaysia toggle
  - Settings persistence

### 2.5.5 Extension API Dependencies

**Chrome APIs Used**:
- `chrome.storage` - Settings and data storage
- `chrome.contextMenus` - Right-click menu
- `chrome.notifications` - User notifications
- `chrome.tabs` - Tab management
- `chrome.runtime` - Extension lifecycle
- `chrome.action` - Extension icon and badge

**External Service APIs**:
- **Gemini API** (Direct) - Content analysis
- **Sightengine API** (via platform) - Image analysis
- **Platform APIs** - Status, OSINT, reporting

### 2.5.6 Extension File Structure

**Key Files**:
- `manifest.json` - Extension configuration
- `popup.js` - Extension popup UI
- `background.js` - Background service worker
- `content.js` - Content script for page analysis
- `llm-analyzer.js` - Gemini API integration
- `image-drop-analyzer.js` - Image analysis UI
- `options.js` - Settings page

**External Resources**:
- Links to `https://cyber999.gov.my`
- Links to `https://semakmule.rmp.gov.my`

---

## 3. System Requirements

### 3.1 Server Requirements

#### Operating System
- **Recommended**: Linux (Ubuntu 20.04+ / CentOS 8+)
- **Alternative**: Windows Server 2019+ (with XAMPP/WAMP)
- **Development**: Windows 10/11 (XAMPP)

#### Web Server
- **Recommended**: Apache HTTP Server 2.4+
- **Alternative**: Nginx 1.18+
- **Development**: Apache (XAMPP 8.0+)

**Required Modules**:
- `mod_rewrite` (Apache)
- `mod_ssl` (for HTTPS)
- `mod_headers` (for security headers)

#### PHP Requirements
**Minimum Version**: PHP 7.4+
**Recommended Version**: PHP 8.1+ or PHP 8.2+

**Required PHP Extensions**:
1. **PDO** - Database connectivity
   - `pdo_mysql` - MySQL database driver
2. **cURL** - HTTP requests to external APIs
   - Required for Sightengine API calls
3. **JSON** - JSON data handling
   - Built into PHP 7.4+
4. **GD** or **ImageMagick** - Image processing
   - For image validation and manipulation
5. **OpenSSL** - Encryption support
   - For secure data transmission
6. **mbstring** - Multi-byte string handling
   - For internationalization support

**PHP Configuration**:
```ini
upload_max_filesize = 50M
post_max_size = 50M
max_execution_time = 300
memory_limit = 256M
session.gc_maxlifetime = 3600
```

---

### 3.2 Database Requirements

#### Database Server
- **Type**: MySQL 5.7+ or MariaDB 10.3+
- **Recommended**: MySQL 8.0+ or MariaDB 10.6+

**Database Configuration**:
- **Database Name**: `petronas_cybercrime`
- **Character Set**: `utf8mb4`
- **Collation**: `utf8mb4_unicode_ci`

**Storage Requirements**:
- **Initial**: ~100MB (empty database)
- **Estimated Growth**: 
  - 1GB per 10,000 reports
  - 500MB per 1,000 deepfake detections
  - 200MB per 10,000 OSINT records
- **Recommended**: 10GB+ for production

**Performance Requirements**:
- **Connection Pool**: Minimum 20 concurrent connections
- **Query Cache**: Enabled
- **Indexes**: Auto-created on key fields

**Database Tables** (7 total):
1. `users` - User accounts and authentication
2. `reports` - Incident reports
3. `deepfake_detections` - AI detection results
4. `osint_data` - Threat intelligence data
5. `investigation_logs` - Case management
6. `audit_logs` - Security audit trail
7. `scammer_database` - Public scammer records

---

### 3.3 Network & Connectivity Requirements

#### Internet Connectivity
- **Required**: Stable internet connection
- **Bandwidth**: Minimum 10 Mbps (production)
- **Latency**: < 100ms to API endpoints

#### External API Access
- **Sightengine API**: `https://api.sightengine.com` (HTTPS)
- **CDN Access**: 
  - `cdn.jsdelivr.net` (Chart.js)
  - `unpkg.com` (Leaflet.js)
- **Future**: 
  - `haveibeenpwned.com` (HIBP API)
  - `generativelanguage.googleapis.com` (Gemini API)

#### Firewall Configuration
- **Outbound HTTPS**: Required (port 443)
- **Inbound HTTP**: Port 80 (production should use HTTPS)
- **Inbound HTTPS**: Port 443 (recommended)

---

### 3.4 Storage Requirements

#### File Storage
- **Upload Directory**: `uploads/`
  - `uploads/evidence/` - Incident report evidence
  - `uploads/deepfake_scans/` - Temporary scan files

**Storage Allocation**:
- **Per File**: Maximum 50MB
- **Estimated Monthly**: 
  - 10GB for evidence files
  - 5GB for temporary scans
- **Recommended**: 100GB+ for production

#### Backup Requirements
- **Database**: Daily automated backups
- **File Storage**: Daily incremental backups
- **Retention**: 30 days minimum

---

### 3.5 Security Requirements

#### SSL/TLS Certificate
- **Required**: Valid SSL certificate for HTTPS
- **Recommended**: Let's Encrypt (free) or commercial certificate
- **Protocol**: TLS 1.2 or higher

#### Encryption
- **Database**: Encrypted connections (PDO with SSL)
- **API Communication**: HTTPS only
- **Session**: Secure session cookies (httponly, secure flags)

#### Authentication
- **Password Hashing**: bcrypt (PHP password_hash)
- **Session Management**: Server-side sessions
- **CSRF Protection**: Token-based validation

---

## 4. Development Dependencies

### 4.1 Development Environment
- **XAMPP 8.0+** (for Windows development)
- **PHP 8.1+** (local development)
- **MySQL 8.0+** (local database)
- **Git** (version control)

### 4.2 Code Dependencies
All dependencies are managed through:
- **No package manager required** (vanilla PHP)
- **CDN-based libraries** (Chart.js, Leaflet.js)
- **Native PHP extensions** (PDO, cURL, JSON)

---

## 5. API Integration Details

### 5.1 Sightengine API Integration

**Authentication Method**: API User + Secret Key

**Request Format**:
```php
// File Upload
POST https://api.sightengine.com/1.0/check.json
Content-Type: multipart/form-data
Parameters:
  - media: [file]
  - models: genai
  - api_user: [API_USER]
  - api_secret: [API_SECRET]

// URL Analysis
GET https://api.sightengine.com/1.0/check.json?url=[IMAGE_URL]&models=genai&api_user=[USER]&api_secret=[SECRET]
```

**Response Format**:
```json
{
  "type": {
    "ai_generated": 0.85
  },
  "text": {
    "has_artificial": 0.0,
    "has_natural": 1.0
  }
}
```

**Error Handling**:
- Network timeout: 30 seconds
- Retry logic: None (manual retry required)
- Fallback: Error message to user

**Rate Limiting**:
- **Platform Limit**: 10 scans per 5 minutes per user
- **API Limit**: Subject to Sightengine subscription tier

---

## 6. Infrastructure Costs Estimate

### 6.1 Third-Party Services (Monthly)

| Service | Status | Estimated Monthly Cost |
|---------|--------|----------------------|
| **Sightengine API** | Active | $50 - $500 (based on usage) |
| **Gemini API** | Active (Extension) | $10 - $100 (based on usage) |
| **HIBP API** | Planned | $0 - $50 (if integrated) |
| **SSL Certificate** | Required | $0 (Let's Encrypt) or $50-200/year |
| **CDN Libraries** | Active | $0 (free) |

**Total Third-Party Services**: ~$60 - $650/month

---

### 6.2 Infrastructure (Monthly)

| Component | Specification | Estimated Cost |
|-----------|--------------|----------------|
| **Web Server** | 2 vCPU, 4GB RAM, 100GB SSD | $20-50/month |
| **Database Server** | 2 vCPU, 4GB RAM, 100GB SSD | $20-50/month |
| **Storage** | 100GB additional storage | $10-20/month |
| **Bandwidth** | 100GB/month | $10-30/month |
| **Backup Service** | Automated backups | $5-15/month |

**Total Infrastructure**: ~$65 - $165/month

---

### 6.3 Total Estimated Monthly Cost

**Minimum (Development)**: ~$125/month
- Infrastructure: $65
- Sightengine API: $50
- Gemini API: $10

**Production (Medium Scale)**: ~$500/month
- Infrastructure: $150
- Sightengine API: $250
- Gemini API: $100

**Production (High Scale)**: ~$815/month
- Infrastructure: $165
- Sightengine API: $500
- Gemini API: $100
- HIBP API: $50

---

## 7. Technical Specifications Summary

### 7.1 Core Technologies
- **Backend**: PHP 8.1+ (Procedural + OOP)
- **Database**: MySQL 8.0+ / MariaDB 10.6+
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Web Server**: Apache 2.4+ / Nginx 1.18+

### 7.2 External Services
- **AI Detection**: Sightengine API (Active)
- **AI Analysis**: Gemini API (Active - Chrome Extension)
- **Data Breach**: HIBP API (Planned)

### 7.3 Libraries & Frameworks
- **Charts**: Chart.js (CDN)
- **Maps**: Leaflet.js 1.9.4 (CDN)
- **No Frontend Framework**: Vanilla JavaScript

### 7.4 Security Features
- Password hashing (bcrypt)
- CSRF protection
- SQL injection prevention (prepared statements)
- XSS prevention (output escaping)
- Rate limiting
- Audit logging

---

## 8. API Endpoints Provided

### 8.1 Internal REST APIs

The platform provides the following internal API endpoints:

1. **`api/status.php`**
   - Health check endpoint
   - Service status monitoring
   - Chrome extension compatibility

2. **`api/scammer-search.php`**
   - Search scammer database
   - Get statistics
   - Rate limited (30 requests per 5 minutes)

3. **`api/add-scammer.php`**
   - Add new scammer records
   - Update existing records
   - POST only

4. **`api/sightengine.php`**
   - Deepfake detection wrapper
   - File upload analysis
   - URL analysis
   - Rate limited (10 scans per 5 minutes)

5. **`api/osint-collector.php`**
   - Threat intelligence collection
   - Threat search
   - Statistics retrieval
   - Requires authentication

---

## 9. Browser Compatibility

### 9.1 Supported Browsers
- **Chrome**: 90+ (recommended)
- **Firefox**: 88+
- **Edge**: 90+
- **Safari**: 14+
- **Opera**: 76+

### 9.2 Browser Extension
- **Chrome Extension**: ✅ Available
- **Extension Name**: PETRONAS Cybercrime Reporter
- **Manifest Version**: 3
- **Version**: 1.0.0

**Extension Capabilities**:
- Context menu integration (right-click scanning)
- Real-time page threat detection
- Image deepfake detection
- Link safety checking
- Background threat monitoring
- Bilingual support (EN/BM)

**Extension APIs Integrated**:
- Gemini API (direct integration)
- Sightengine API (via platform)
- Platform status and OSINT APIs

**Extension Permissions**:
- Active tab access
- Storage (settings and cache)
- Context menus
- Notifications
- Scripting
- Tab management

**Extension Distribution**:
- Chrome Web Store (planned)
- Manual installation (development)
- Enterprise distribution (planned)

---

## 10. Compliance & Standards

### 10.1 Data Protection
- **PDPA Compliance**: Personal Data Protection Act (Malaysia)
- **Data Retention**: 30 days (configurable)
- **Data Encryption**: HTTPS for all communications

### 10.2 Code Standards
- **PHP Standards**: PSR-1, PSR-2 (partial)
- **Security**: OWASP Top 10 considerations
- **Error Handling**: Comprehensive logging

---

## 11. Scalability Considerations

### 11.1 Current Architecture
- **Single Server**: Suitable for small to medium scale
- **Database**: Single MySQL instance
- **File Storage**: Local filesystem

### 11.2 Scaling Options
- **Horizontal Scaling**: Requires load balancer
- **Database**: Master-slave replication
- **File Storage**: Cloud storage (S3, Azure Blob)
- **CDN**: Static asset delivery
- **Caching**: Redis/Memcached for sessions

---

## 12. Monitoring & Maintenance

### 12.1 Required Monitoring
- API response times
- Database performance
- Disk space usage
- Error rates
- API quota usage (Sightengine)

### 12.2 Maintenance Tasks
- Daily database backups
- Weekly log rotation
- Monthly security updates
- Quarterly API key rotation

---

## 13. Risk Assessment

### 13.1 External Dependencies
- **Sightengine API**: Critical dependency
  - Risk: Service outage
  - Mitigation: Error handling, fallback messaging
- **CDN Libraries**: Low risk
  - Risk: CDN downtime
  - Mitigation: Local fallback files (not implemented)

### 13.2 Infrastructure Risks
- **Single Point of Failure**: Database server
  - Mitigation: Regular backups, replication plan
- **API Rate Limits**: Sightengine quotas
  - Mitigation: Rate limiting, usage monitoring

---

## 14. Recommendations for Production

### 14.1 Immediate Actions
1. ✅ Implement actual HIBP API integration
2. ✅ Move API keys to environment variables (Gemini key in extension)
3. ✅ Implement comprehensive error logging
4. ✅ Set up automated backups
5. ✅ Configure SSL certificate
6. ✅ Chrome Extension already integrated with Gemini API

### 14.2 Future Enhancements
1. ✅ Gemini API integration (already in extension)
2. Add Redis caching layer
3. Implement CDN for static assets
4. Set up monitoring dashboard
5. Implement automated API testing
6. Chrome Web Store publication
7. Firefox extension development
8. Safari extension development

---

## 15. Contact & Support

### 15.1 API Support
- **Sightengine**: https://sightengine.com/support
- **HIBP**: https://haveibeenpwned.com/API/v3

### 15.2 Technical Documentation
- Platform documentation: Internal wiki
- API documentation: In-code comments
- Database schema: `config/database.php`

---

## Appendix A: File Structure Reference

### PHP Files Using External APIs

1. **Sightengine API**:
   - `api/sightengine.php` (Primary)
   - `WORKING API/check_ai.php` (Alternative)
   - `report-incident.php` (Automatic detection)

2. **Status Monitoring**:
   - `api/status.php` (Checks API availability)

3. **CDN Libraries**:
   - `osint-monitor.php` (Chart.js, Leaflet.js)

### Chrome Extension Files Using External APIs

1. **Gemini API** (Direct Integration):
   - `chrome-extension/llm-analyzer.js` (Primary integration)
   - `chrome-extension/popup.js` (UI integration)
   - `chrome-extension/content.js` (Content analysis)

2. **Sightengine API** (via Platform):
   - `chrome-extension/background.js` (Image analysis)
   - `chrome-extension/popup.js` (Extension UI)

3. **Platform APIs**:
   - `chrome-extension/background.js` (Status, OSINT)
   - `chrome-extension/popup.js` (Statistics, alerts)

4. **External Links**:
   - `chrome-extension/popup.html` (Cyber999, PDRM links)

---

## Appendix B: Configuration Files

### Key Configuration Files
- `config/database.php` - Database and API credentials
- `WORKING API/config.php` - Sightengine API config
- `includes/auth.php` - Authentication settings
- `includes/language.php` - Internationalization

### Chrome Extension Configuration Files
- `chrome-extension/manifest.json` - Extension manifest and permissions
- `chrome-extension/llm-analyzer.js` - Gemini API key and configuration
- `chrome-extension/background.js` - Platform URL configuration
- `chrome-extension/options.js` - User settings and API timeout configuration

---

## Document Approval

**Prepared By**: Development Team  
**Reviewed By**: [To be filled]  
**Approved By**: [To be filled]  
**Date**: [To be filled]

---

**End of Document**

