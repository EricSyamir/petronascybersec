# OSINT Tools Integration Guide

This document explains how to set up and use the integrated OSINT tools in the PETRONAS Cybercrime Platform.

## Integrated Tools

1. **Semak Mule** - Scammer Database (Already integrated)
2. **Holehe** - Email Checker
3. **Mr.Holmes** - Username Checker
4. **HaveIBeenPwned** - Breach Checker

## Setup Instructions

### 1. Semak Mule (Already Configured)
The Semak Mule API client is already integrated and ready to use. No additional setup required.

### 2. Holehe (Email Checker)

**Installation:**
```bash
pip install holehe
```

**Usage:**
- Navigate to the "Email Checker" tab
- Enter an email address
- Click "Check Email"
- Results will show which platforms the email is registered on

**Note:** If Holehe is not installed, the system will use a basic email checker that provides limited functionality.

### 3. Mr.Holmes (Username Checker)

**Installation:**
```bash
# Clone the repository
git clone https://github.com/Lucksi/Mr.Holmes.git
cd Mr.Holmes

# Install dependencies
pip install -r requirements.txt

# Make sure the script is executable
chmod +x mr-holmes.py
```

**Alternative Installation:**
```bash
pip install mr-holmes
```

**Usage:**
- Navigate to the "Username Checker" tab
- Enter a username
- Click "Check Username"
- Results will show which platforms the username exists on

**Note:** If Mr.Holmes is not installed, the system will provide basic platform URLs for manual checking.

### 4. HaveIBeenPwned (Breach Checker)

**Setup:**
- No installation required - uses public API
- Optional: Set `HIBP_API_KEY` environment variable for higher rate limits
- Get API key from: https://haveibeenpwned.com/API/Key

**Usage:**
- Navigate to the "Breach Checker" tab
- Enter an email address
- Click "Check Breaches"
- Results will show if the email has been compromised in any known data breaches

## API Endpoints

All OSINT tools are accessible through the unified API endpoint:

**Endpoint:** `api/osint-tools.php`

**Available Actions:**
- `check_email` - Check email with Holehe
- `check_username` - Check username with Mr.Holmes
- `check_breach` - Check breaches with HaveIBeenPwned
- `check_bank_account` - Check bank account with Semak Mule
- `check_phone` - Check phone number with Semak Mule
- `check_company` - Check company name with Semak Mule

## Python Scripts Location

Python helper scripts are located in:
- `scripts/holehe_check.py` - Holehe wrapper
- `scripts/mrholmes_check.py` - Mr.Holmes wrapper

## Troubleshooting

### Python Scripts Not Working

1. **Check Python Installation:**
   ```bash
   python --version
   ```

2. **Check Script Permissions:**
   ```bash
   chmod +x scripts/holehe_check.py
   chmod +x scripts/mrholmes_check.py
   ```

3. **Test Scripts Manually:**
   ```bash
   python scripts/holehe_check.py test@example.com
   python scripts/mrholmes_check.py testusername
   ```

### API Errors

- **Rate Limiting:** HaveIBeenPwned has rate limits. Consider using an API key.
- **Connection Errors:** Check internet connectivity and firewall settings.
- **Permission Errors:** Ensure PHP has permission to execute Python scripts.

### Tool Not Found Errors

If you see "Tool not installed" errors:
1. Install the required Python package
2. Verify the installation: `pip list | grep holehe` or `pip list | grep mr-holmes`
3. Check that Python is in your system PATH

## Security Notes

- All OSINT tools query publicly available information
- No sensitive data is stored from these checks
- API keys should be stored securely (use environment variables)
- Rate limiting is implemented to prevent abuse

## Support

For issues with:
- **Holehe:** https://github.com/megadose/holehe
- **Mr.Holmes:** https://github.com/Lucksi/Mr.Holmes
- **HaveIBeenPwned:** https://haveibeenpwned.com/API/v3
- **Semak Mule:** https://semakmule.rmp.gov.my

