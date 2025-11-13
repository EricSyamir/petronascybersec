# PETRONAS Cybercrime Platform

A comprehensive cybersecurity platform for reporting cybercrime incidents, detecting deepfakes, and monitoring cyber threats in Malaysia.

## Features

### 🔍 Public Scammer Database
- Search phone numbers and bank accounts against reported scammers
- Verified reports from Royal Malaysian Police CCID Portal
- Real-time statistics and threat levels
- Data breach checker powered by HaveIBeenPwned integration

### 🎭 Deepfake Scanner
- AI-powered deepfake detection using Sightengine API
- Upload images and videos for analysis
- Comprehensive technical analysis and confidence scoring
- Real-time threat assessment

### 🌐 OSINT Monitor
- Threat monitoring dashboard
- Multi-tool OSINT integration:
  - **Semak Mule** - Malaysian scammer database
  - **Holehe** - Email checker across platforms
  - **Mr.Holmes** - Username search across social media
  - **HaveIBeenPwned** - Data breach checker
- Real-time threat intelligence
- Interactive threat map for Malaysia

### 📝 Incident Reporting
- Comprehensive incident reporting system
- Multiple incident types support (phishing, scams, deepfakes, etc.)
- Evidence upload with automatic deepfake analysis
- PDPA compliant data handling

### 🌍 Bilingual Support
- English and Bahasa Malaysia
- Dynamic language switching
- Localized content and translations

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Animations**: Anime.js for smooth UI transitions
- **Mapping**: Leaflet.js for threat visualization
- **Charts**: Chart.js for data visualization
- **API Integration**: 
  - Sightengine API for deepfake detection
  - HaveIBeenPwned API for breach checking
  - Google Gemini API for AI analysis

## Installation

1. Clone the repository:
```bash
git clone https://github.com/EricSyamir/petronascybersec.git
cd petronascybersec
```

2. Configure your web server (Apache/Nginx) to point to the project directory

3. Set up API keys:
   - Sightengine API credentials (for deepfake detection)
   - Configure in respective API files

4. Ensure proper permissions for upload directories:
```bash
chmod 755 uploads/
```

5. Access the platform through your web browser

## File Structure

```
petronas-cybercrime-platform/
├── api/                    # API endpoints
│   ├── status.php         # Health check endpoint
│   ├── scammer-search.php # Scammer database search
│   └── investigation.php  # Investigation features
├── assets/                # Static assets
│   ├── css/              # Stylesheets
│   ├── js/               # JavaScript files
│   └── images/           # Images and icons
├── chrome-extension/      # Browser extension
├── data/                 # JSON databases
│   └── scammer-database.json
├── includes/             # PHP includes
│   └── language.php      # Translation system
├── scripts/              # Python OSINT scripts
├── SemakMule/           # Semak Mule integration
├── uploads/             # User uploaded files
├── index.php            # Homepage
├── public-dashboard.php  # Public scammer database
├── deepfake-scanner.php  # Deepfake detection tool
├── osint-monitor.php     # OSINT investigation dashboard
└── report-incident.php   # Incident reporting form
```

## Usage

### Public Dashboard
Visit the public dashboard to search for known scammers by phone number or bank account. The system searches through verified police reports and displays threat levels.

### Deepfake Scanner
Upload suspicious images or videos to check for AI-generated content. The system provides detailed technical analysis and confidence scores.

### OSINT Tools
Access comprehensive OSINT investigation tools including:
- Scammer database search (Semak Mule)
- Email registration checker (Holehe)
- Username availability checker (Mr.Holmes)
- Data breach checker (HaveIBeenPwned)

### Report Incidents
Submit cybercrime incidents with evidence. The platform automatically analyzes uploaded media for deepfake content.

## API Endpoints

### Status Check
```
GET /api/status.php
```

### Scammer Search
```
GET /api/scammer-search.php?action=search&q=[query]&type=[phone|website|all]
```

### Statistics
```
GET /api/scammer-search.php?action=stats
```

## Security & Compliance

- **PDPA Compliant**: Follows Malaysia's Personal Data Protection Act
- **Data Encryption**: All sensitive data transmissions are encrypted
- **CSRF Protection**: Built-in CSRF token validation
- **Input Sanitization**: Comprehensive input validation and sanitization
- **Rate Limiting**: API rate limiting to prevent abuse

## Browser Extension

The platform includes a Chrome extension for quick access to scammer checking and deepfake detection directly from your browser.

## Contributing

This is a cybersecurity project for educational and public safety purposes. Contributions are welcome.

## Escalation Contacts

For serious cybercrime incidents, please escalate to:
- **Cyber999**: Malaysia's National Cyber Security Agency
- **PDRM e-Reporting**: Royal Malaysia Police online reporting

## License

© 2025 SecureTech. All rights reserved.

## Disclaimer

This platform is designed for educational and public safety purposes. Always report serious cybercrimes to official law enforcement agencies.

## Support

For questions or issues, please open an issue on the GitHub repository.

## Acknowledgments

- Royal Malaysian Police CCID Portal for scammer data
- HaveIBeenPwned for breach data
- Sightengine for deepfake detection technology
- Malaysian cybersecurity community

