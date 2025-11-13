# OSINT Monitor Setup Guide

## Quick Start

### 1. Open Setup Page
Navigate to: `http://localhost/petronas-cybercrime-platform/setup-osint.php`

### 2. Initialize System
Click the buttons in order:
1. **Initialize Database** - Creates all required tables
2. **Load Sample Data** - Populates with 15+ sample threats
3. **Check APIs** - Verifies all endpoints are working

### 3. Access OSINT Monitor
Once setup is complete, click "Open OSINT Monitor" or navigate to:
`http://localhost/petronas-cybercrime-platform/osint-monitor.php`

## Features Available

### Public Access (No Login Required)
- ✅ **Threat Monitoring Dashboard** - View recent threats on map and charts
- ✅ **Semak Mule** - Check bank accounts, phone numbers, companies against scammer database
- ✅ **Email Checker** - Check if email exists on platforms (basic mode without Python)
- ✅ **Username Checker** - Check username across social media (basic mode without Python)
- ✅ **Breach Checker** - Check if email was compromised using HaveIBeenPwned API

### Investigator/Admin Only (Login Required)
- 🔐 **Investigation Cases** - Create and manage investigation cases
- 🔐 **Evidence Collection** - Attach evidence to cases
- 🔐 **Notes & Timeline** - Track investigation progress
- 🔐 **Collect New Threats** - Manually trigger threat collection
- 🔐 **Save Queries** - Save OSINT searches for later reference

## Database Structure

The following tables are created:
- `users` - User accounts and authentication
- `osint_data` - Threat intelligence data
- `investigation_cases` - Investigation case management
- `investigation_evidence` - Evidence attached to cases
- `investigation_notes` - Case notes
- `investigation_timeline` - Case activity timeline
- `investigation_queries` - Saved OSINT queries
- `scammer_database` - Scammer information
- `reports` - Incident reports
- `deepfake_detections` - Deepfake scan results
- `audit_logs` - System audit trail

## Default Accounts

**Admin Account:**
- Username: `admin`
- Password: `admin123`
- Email: `admin@petronas.com.my`

**Investigator Account:**
- Username: `investigator`
- Password: `investigator123`
- Email: `investigator@petronas.com.my`

⚠️ **Important:** Change these passwords in production!

## Optional: Python OSINT Tools

For enhanced functionality, install these Python tools:

### Holehe (Email Checker)
```bash
pip install holehe
```

### Mr.Holmes (Username Checker)
```bash
git clone https://github.com/Lucksi/Mr.Holmes
cd Mr.Holmes
pip install -r requirements.txt
```

**Note:** The system works without these tools using basic fallback methods.

## Sample Data

The initialization loads 15+ sample threats including:
- **Critical:** Ransomware alerts, deepfake warnings
- **High:** Phishing campaigns, job scams, ATM skimming
- **Medium:** IoT security advisories, fake promotions
- **Low:** General security reminders

## API Endpoints

### Public APIs (No Auth Required)
- `POST /api/osint-collector.php?action=search_threats` - Search threats
- `POST /api/osint-collector.php?action=get_stats` - Get statistics
- `POST /api/osint-collector.php?action=get_trending` - Get trending keywords
- `POST /api/osint-tools.php?action=check_email` - Email checker
- `POST /api/osint-tools.php?action=check_username` - Username checker
- `POST /api/osint-tools.php?action=check_breach` - Breach checker
- `POST /api/osint-tools.php?action=check_bank_account` - Semak Mule bank check
- `POST /api/osint-tools.php?action=check_phone` - Semak Mule phone check
- `POST /api/osint-tools.php?action=check_company` - Semak Mule company check

### Protected APIs (Auth Required)
- `POST /api/osint-collector.php?action=collect_threats` - Trigger collection
- `POST /api/investigation.php?action=create_case` - Create investigation
- `POST /api/investigation.php?action=add_evidence` - Add evidence
- `POST /api/investigation.php?action=add_note` - Add note

## Troubleshooting

### Database Connection Error
1. Ensure MySQL/MariaDB is running
2. Create database: `CREATE DATABASE petronas_cybercrime;`
3. Check credentials in `config/database.php`

### No Threats Showing
1. Run the initialization: Visit `api/init-osint-data.php?init=osint_data`
2. Verify data: Check `osint_data` table in database

### API Errors
1. Check PHP error logs
2. Ensure `allow_url_fopen` is enabled in php.ini
3. Check that cURL extension is installed

### Map Not Loading
1. Ensure Leaflet CDN is accessible
2. Check browser console for JavaScript errors
3. Verify internet connection (Leaflet uses online tiles)

## Features Overview

### 1. Threat Monitoring Tab
- **Real-time Statistics**: Critical, high, medium, low threat counts
- **Interactive Map**: Threats plotted on Malaysia map with color-coded markers
- **Threat Timeline Chart**: Visual representation of threat trends
- **Trending Keywords**: Most frequently mentioned keywords
- **Recent Threats Feed**: Scrollable list of latest threats
- **Source Monitor**: Status of data collection sources
- **Filters**: Search by keywords, threat level, timeframe

### 2. Semak Mule Tab
- Check **bank account numbers** against PDRM scammer database
- Check **phone numbers** for scam reports
- Check **company names** for fraudulent businesses
- Real-time verification with Royal Malaysian Police API

### 3. Email Checker Tab
- Check if email exists on multiple platforms
- Shows found/not found status
- Platforms checked: Facebook, Instagram, Twitter, LinkedIn, GitHub, etc.
- Uses Holehe (if installed) or basic fallback

### 4. Username Checker Tab
- Check username availability across social platforms
- Direct links to profile pages
- Platforms: Facebook, Instagram, Twitter, TikTok, YouTube, Reddit, etc.
- Uses Mr.Holmes (if installed) or basic fallback

### 5. Breach Checker Tab
- Check if email was compromised in data breaches
- Uses HaveIBeenPwned API (no API key needed for basic use)
- Shows breach names, dates, and compromised data types

## Next Steps

1. ✅ Complete setup using setup-osint.php
2. 🔍 Explore the OSINT Monitor interface
3. 🧪 Test each tool with sample data
4. 👤 Login as investigator to access case management
5. 📊 Try creating an investigation case
6. 🔧 (Optional) Install Python tools for enhanced functionality

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review PHP error logs
3. Check browser console for JavaScript errors
4. Verify database connectivity

---

**Status:** Ready to use! 🚀
**Last Updated:** 2024
**Version:** 1.0.0

