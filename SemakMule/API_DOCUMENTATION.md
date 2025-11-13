# SemakMule API Client Documentation

## Overview
This API client allows you to connect to the Royal Malaysian Police CCID Portal scammer database. The database contains information about bank accounts, phone numbers, and company names used in commercial crime cases.

## API Endpoints

### Main API Endpoint
```
https://mule.the-oaks.my/api/p/
```

### Mule API Endpoint
```
https://semakmule.rmp.gov.my/api/mule/
```

## Installation

### PHP (Backend)
1. Copy `api-client.php` to your project directory
2. Include it in your PHP file:
```php
require_once 'api-client.php';
```

### JavaScript (Frontend)
1. Copy `api-client.js` to your project directory
2. Include it in your HTML:
```html
<script src="api-client.js"></script>
```

## Usage Examples

### PHP Usage

#### Initialize the Client
```php
require_once 'api-client.php';
$client = new SemakMuleAPIClient();
```

#### Check Bank Account
```php
$result = $client->checkBankAccount('1234567890');
if ($result['success']) {
    print_r($result['data']);
} else {
    echo "Error: " . $result['error'];
}
```

#### Check Phone Number
```php
$result = $client->checkPhoneNumber('0123456789');
print_r($result);
```

#### Check Company Name
```php
$result = $client->checkCompany('Company Name Sdn Bhd');
print_r($result);
```

#### Get Statistics
```php
$stats = $client->getStats();
print_r($stats);
```

#### Custom Search
```php
$searchResult = $client->search([
    'account' => '1234567890',
    'phone' => '0123456789',
    'company' => 'Company Name'
]);
print_r($searchResult);
```

#### Direct API Calls
```php
// GET request
$result = $client->get('endpoint/path', ['param' => 'value']);

// POST request
$result = $client->post('endpoint/path', ['data' => 'value']);

// Use Mule endpoint
$result = $client->get('endpoint/path', [], true);
```

### JavaScript Usage

#### Initialize the Client
```javascript
const client = new SemakMuleAPIClient();
```

#### Check Bank Account (Async/Await)
```javascript
try {
    const result = await client.checkBankAccount('1234567890');
    if (result.success) {
        console.log(result.data);
    } else {
        console.error('Error:', result.error);
    }
} catch (error) {
    console.error('Exception:', error);
}
```

#### Check Phone Number (Promise)
```javascript
client.checkPhoneNumber('0123456789')
    .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.error(error);
    });
```

#### Check Company Name
```javascript
const result = await client.checkCompany('Company Name Sdn Bhd');
console.log(result);
```

#### Get Statistics
```javascript
const stats = await client.getStats();
console.log(stats);
```

#### Custom Search
```javascript
const searchResult = await client.search({
    account: '1234567890',
    phone: '0123456789',
    company: 'Company Name'
});
console.log(searchResult);
```

#### Direct API Calls
```javascript
// GET request
const result = await client.get('endpoint/path', { param: 'value' });

// POST request
const result = await client.post('endpoint/path', { data: 'value' });

// Use Mule endpoint
const result = await client.get('endpoint/path', {}, true);
```

## Response Format

All API methods return a response object with the following structure:

```javascript
{
    success: boolean,        // true if request was successful
    http_code: number,      // HTTP status code
    data: object,          // Parsed JSON response (if available)
    raw_response: string,  // Raw response text (if JSON parsing failed)
    error: string          // Error message (if request failed)
}
```

## Available Methods

### PHP Methods

| Method | Description | Parameters |
|--------|-------------|------------|
| `checkBankAccount($accountNumber)` | Check if a bank account is in the scammer database | `$accountNumber` (string) |
| `checkPhoneNumber($phoneNumber)` | Check if a phone number is in the scammer database | `$phoneNumber` (string) |
| `checkCompany($companyName)` | Check if a company name is in the scammer database | `$companyName` (string) |
| `getStats()` | Get database statistics | None |
| `search($searchParams)` | Perform a custom search | `$searchParams` (array) |
| `get($endpoint, $params, $useMuleEndpoint)` | Make a GET request | `$endpoint` (string), `$params` (array), `$useMuleEndpoint` (bool) |
| `post($endpoint, $data, $useMuleEndpoint)` | Make a POST request | `$endpoint` (string), `$data` (array), `$useMuleEndpoint` (bool) |

### JavaScript Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `checkBankAccount(accountNumber)` | Check if a bank account is in the scammer database | `accountNumber` (string) | Promise\<object\> |
| `checkPhoneNumber(phoneNumber)` | Check if a phone number is in the scammer database | `phoneNumber` (string) | Promise\<object\> |
| `checkCompany(companyName)` | Check if a company name is in the scammer database | `companyName` (string) | Promise\<object\> |
| `getStats()` | Get database statistics | None | Promise\<object\> |
| `search(searchParams)` | Perform a custom search | `searchParams` (object) | Promise\<object\> |
| `get(endpoint, params, useMuleEndpoint)` | Make a GET request | `endpoint` (string), `params` (object), `useMuleEndpoint` (bool) | Promise\<object\> |
| `post(endpoint, data, useMuleEndpoint)` | Make a POST request | `endpoint` (string), `data` (object), `useMuleEndpoint` (bool) | Promise\<object\> |

## Error Handling

### PHP
```php
$result = $client->checkBankAccount('1234567890');

if (!$result['success']) {
    // Handle error
    if (isset($result['error'])) {
        echo "Error: " . $result['error'];
    }
    echo "HTTP Code: " . $result['http_code'];
}
```

### JavaScript
```javascript
try {
    const result = await client.checkBankAccount('1234567890');
    if (!result.success) {
        // Handle error
        console.error('Error:', result.error);
        console.error('HTTP Code:', result.http_code);
    }
} catch (error) {
    // Handle exception
    console.error('Exception:', error);
}
```

## Configuration

### PHP Configuration
You can modify the API endpoints and timeout in the constructor:

```php
class SemakMuleAPIClient {
    private $apiEndPoint = "https://mule.the-oaks.my/api/p/";
    private $apiEndPointMule = "https://semakmule.rmp.gov.my/api/mule/";
    private $timeout = 30; // seconds
}
```

### JavaScript Configuration
You can modify the API endpoints and timeout in the constructor:

```javascript
class SemakMuleAPIClient {
    constructor() {
        this.apiEndPoint = "https://mule.the-oaks.my/api/p/";
        this.apiEndPointMule = "https://semakmule.rmp.gov.my/api/mule/";
        this.timeout = 30000; // milliseconds
    }
}
```

## CORS and Security Notes

⚠️ **Important**: When using the JavaScript client in a browser, you may encounter CORS (Cross-Origin Resource Sharing) issues if the API server doesn't allow requests from your domain. In such cases:

1. **Use a backend proxy**: Make API calls from your PHP backend instead
2. **Contact API administrators**: Request CORS headers to be added to the API server
3. **Use a server-side solution**: Use the PHP client instead of JavaScript

## Testing

### Test PHP Client
1. Open `example-usage.php` in your browser
2. Enter test data and click "Check Database"

### Test JavaScript Client
1. Open `example-usage.html` in your browser
2. Enter test data and click "Check Database"

## Troubleshooting

### Common Issues

1. **CORS Errors (JavaScript)**
   - Solution: Use PHP backend or contact API administrators

2. **SSL Certificate Errors**
   - Solution: Ensure your server has valid SSL certificates

3. **Timeout Errors**
   - Solution: Increase timeout value in the client configuration

4. **Connection Refused**
   - Solution: Check if API endpoints are accessible and not blocked by firewall

## Notes

- The actual API endpoint structure may differ from the examples provided
- You may need to adjust endpoint paths based on the actual API documentation
- Some endpoints may require authentication (API keys, tokens, etc.)
- The API response format may vary depending on the endpoint

## Support

For issues with the API itself, contact:
- Royal Malaysian Police CCID Portal: https://semakmule.rmp.gov.my
- API Provider: mule.the-oaks.my

