# SemakMule API Client - Project Structure

## 📁 Essential Files & Directories

### 🔧 Core API Client Files (REQUIRED)

#### PHP Backend Client
- **`api-client.php`** ⭐ **ESSENTIAL**
  - Main PHP API client class
  - Connects to SemakMule scammer database API
  - Methods: `checkBankAccount()`, `checkPhoneNumber()`, `checkCompany()`, `search()`

#### JavaScript Frontend Client
- **`api-client.js`** ⭐ **ESSENTIAL**
  - JavaScript API client for browser/frontend use
  - Same functionality as PHP client
  - Uses Fetch API

---

### 📖 Documentation

- **`API_DOCUMENTATION.md`** ⭐ **RECOMMENDED**
  - Complete API documentation
  - Usage examples for PHP and JavaScript
  - Method reference
  - Troubleshooting guide

---

### 🧪 Test & Example Files

#### Test Scripts
- **`test-api.php`** - Quick test script for bank account search
- **`test-phone.php`** - Test script for phone number search
- **`test-api-enhanced.php`** - Enhanced test with detailed debugging
- **`debug-api.php`** - Debug script to test different payload formats

#### Example Usage
- **`example-usage.php`** ⭐ **RECOMMENDED**
  - Web interface example
  - Shows how to use the API client
  - Includes form for testing searches
  - Displays results in formatted table

- **`example-usage.html`** - JavaScript version of example usage

#### Utility Scripts
- **`api-discovery.php`** - Tool to discover API endpoints
- **`api-client-debug.php`** - Debug version of API client with logging
- **`download-ca-cert.php`** - Script to download SSL CA certificates (optional)

---

### 📂 Mirrored Website Files (Reference Only)

#### Original Website Mirror
- **`semakmule.rmp.gov.my/`** - Mirrored website files
  - `config.js` - Original API endpoint configuration
  - `index.html` - Original website HTML
  - `static/` - CSS, JS, and media files
    - `css/main.6a312a84.css` - Stylesheets
    - `js/main.8427595b.js` - Original JavaScript (minified)
    - `media/` - Fonts and images

#### HTTrack Cache Files (Can be deleted)
- **`hts-cache/`** - HTTrack website copier cache
  - `doit.log`, `new.lst`, `new.txt`, `new.zip`, `readme.txt`, `winprofile.ini`
- **`hts-log.txt`** - HTTrack log file
- **`index.html`** - HTTrack index page
- **`backblue.gif`**, **`fade.gif`** - HTTrack images

---

## 📋 Project Structure Summary

```
SemakMule/
│
├── 🔧 CORE FILES (Essential)
│   ├── api-client.php          ⭐ Main PHP API client
│   ├── api-client.js            ⭐ Main JavaScript API client
│   └── API_DOCUMENTATION.md     📖 Documentation
│
├── 🧪 TEST & EXAMPLES (Recommended)
│   ├── test-api.php             Quick test script
│   ├── test-phone.php           Phone number test
│   ├── test-api-enhanced.php    Enhanced test with debugging
│   ├── example-usage.php        ⭐ Web interface example
│   └── example-usage.html       JavaScript example
│
├── 🔍 DEBUG & UTILITY (Optional)
│   ├── debug-api.php            Debug script
│   ├── api-discovery.php         Endpoint discovery tool
│   ├── api-client-debug.php      Debug version of client
│   └── download-ca-cert.php     SSL certificate downloader
│
└── 📦 REFERENCE FILES (Can be deleted)
    ├── semakmule.rmp.gov.my/    Mirrored website files
    ├── hts-cache/                HTTrack cache (can delete)
    ├── hts-log.txt               HTTrack log (can delete)
    └── index.html                HTTrack index (can delete)
```

---

## ✅ Minimum Required Files for Production

For a production deployment, you only need:

1. **`api-client.php`** - PHP backend client
2. **`api-client.js`** - JavaScript frontend client (if using frontend)
3. **`API_DOCUMENTATION.md`** - Documentation (optional but recommended)

---

## 🗑️ Files You Can Delete

These files are from the website mirroring process and are not needed:

- `hts-cache/` directory (entire folder)
- `hts-log.txt`
- `index.html` (HTTrack index)
- `backblue.gif`, `fade.gif`
- `semakmule.rmp.gov.my/` directory (if you don't need the reference files)

---

## 📝 Quick Start Files

To get started quickly, use these files:

1. **For PHP Backend:**
   - `api-client.php` - Include this in your project
   - `example-usage.php` - See how to use it

2. **For JavaScript Frontend:**
   - `api-client.js` - Include this in your HTML
   - `example-usage.html` - See how to use it

3. **For Testing:**
   - `test-api.php` - Test bank account search
   - `test-phone.php` - Test phone number search

---

## 🔑 Key Configuration

The API client uses these endpoints (configured in `api-client.php` and `api-client.js`):

- **Main API:** `https://mule.the-oaks.my/api/p/`
- **Mule API:** `https://semakmule.rmp.gov.my/api/mule/get_search_data.php`
- **API Key:** `j3j389#nklala2` (hardcoded in client)

---

## 📚 Usage Examples

### PHP Usage
```php
require_once 'api-client.php';
$client = new SemakMuleAPIClient();
$result = $client->checkBankAccount('512802774281');
```

### JavaScript Usage
```javascript
const client = new SemakMuleAPIClient();
const result = await client.checkBankAccount('512802774281');
```

---

## 🎯 Project Purpose

This project provides API clients to connect to the Royal Malaysian Police CCID Portal scammer database, allowing you to:
- Check if bank accounts are in the scammer database
- Check if phone numbers are in the scammer database  
- Check if company names are in the scammer database
- Get search results with report counts

---

**Last Updated:** Based on actual API implementation from semakmule.rmp.gov.my

