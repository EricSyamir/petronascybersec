# SemakMule API Client - Clean Project Structure

## 📁 Project Files

### 🔧 Core API Clients (Essential)
- **`api-client.php`** - PHP API client for backend/server-side use
- **`api-client.js`** - JavaScript API client for frontend/browser use

### 📖 Documentation
- **`API_DOCUMENTATION.md`** - Complete API documentation and usage guide
- **`PROJECT_STRUCTURE.md`** - Project structure and file organization

### 🧪 Test Scripts
- **`test-api.php`** - Quick test script for bank account search
- **`test-phone.php`** - Test script for phone number search
- **`test-api-enhanced.php`** - Enhanced test with detailed debugging output

### 💡 Example Usage
- **`example-usage.php`** - Complete web interface example (PHP)
- **`example-usage.html`** - Complete web interface example (JavaScript)

---

## 📋 Quick Start

### PHP Backend
```php
require_once 'api-client.php';
$client = new SemakMuleAPIClient();
$result = $client->checkBankAccount('512802774281');
```

### JavaScript Frontend
```javascript
const client = new SemakMuleAPIClient();
const result = await client.checkPhoneNumber('01161051865');
```

---

## ✅ Clean Project Structure

```
SemakMule/
├── api-client.php              ⭐ Core PHP client
├── api-client.js               ⭐ Core JavaScript client
├── API_DOCUMENTATION.md        📖 Full documentation
├── PROJECT_STRUCTURE.md        📋 Project structure guide
├── test-api.php                🧪 Bank account test
├── test-phone.php              🧪 Phone number test
├── test-api-enhanced.php       🧪 Enhanced test
├── example-usage.php           💡 PHP example
└── example-usage.html          💡 JavaScript example
```

---

## 🎯 Project Purpose

API clients to connect to Royal Malaysian Police CCID Portal scammer database:
- ✅ Check bank accounts
- ✅ Check phone numbers  
- ✅ Check company names
- ✅ Get search results with report counts

---

**Clean Solution Ready!** ✨

