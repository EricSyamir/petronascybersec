/**
 * SemakMule API Client (JavaScript)
 * Connects to the Royal Malaysian Police CCID Portal scammer database
 */

class SemakMuleAPIClient {
    constructor() {
        this.apiEndPoint = "https://mule.the-oaks.my/api/p/";
        this.apiEndPointMule = "https://semakmule.rmp.gov.my/api/mule/get_search_data.php";
        this.timeout = 30000; // milliseconds
    }
    
    /**
     * Make a GET request to the API
     * @param {string} endpoint - API endpoint path
     * @param {object} params - Query parameters
     * @param {boolean} useMuleEndpoint - Use mule endpoint instead of main endpoint
     * @returns {Promise<object>} - Response data
     */
    async get(endpoint, params = {}, useMuleEndpoint = false) {
        const baseUrl = useMuleEndpoint ? this.apiEndPointMule : this.apiEndPoint;
        let url = baseUrl.replace(/\/$/, '') + '/' + endpoint.replace(/^\//, '');
        
        if (Object.keys(params).length > 0) {
            const queryString = new URLSearchParams(params).toString();
            url += '?' + queryString;
        }
        
        return this.makeRequest(url, 'GET');
    }
    
    /**
     * Make a POST request to the API
     * @param {string} endpoint - API endpoint path
     * @param {object} data - POST data
     * @param {boolean} useMuleEndpoint - Use mule endpoint instead of main endpoint
     * @returns {Promise<object>} - Response data
     */
    async post(endpoint, data = {}, useMuleEndpoint = false) {
        let url;
        if (useMuleEndpoint && !endpoint) {
            // Use the full mule endpoint URL directly
            url = this.apiEndPointMule;
        } else {
            const baseUrl = useMuleEndpoint ? this.apiEndPointMule : this.apiEndPoint;
            url = baseUrl.replace(/\/$/, '') + '/' + endpoint.replace(/^\//, '');
        }
        
        return this.makeRequest(url, 'POST', data);
    }
    
    /**
     * Check a bank account number
     * @param {string} accountNumber - Bank account number to check
     * @param {string} captcha - Captcha value (optional)
     * @returns {Promise<object>} - Check result
     */
    async checkBankAccount(accountNumber, captcha = '') {
        const payload = {
            data: {
                category: 'bank',
                bankAccount: accountNumber,
                telNo: '',
                companyName: '',
                captcha: captcha
            }
        };
        return this.post('', payload, true);
    }
    
    /**
     * Check a phone number
     * @param {string} phoneNumber - Phone number to check
     * @param {string} captcha - Captcha value (optional)
     * @returns {Promise<object>} - Check result
     */
    async checkPhoneNumber(phoneNumber, captcha = '') {
        const payload = {
            data: {
                category: 'telefon',
                bankAccount: phoneNumber,
                telNo: phoneNumber,
                companyName: '',
                captcha: captcha
            }
        };
        return this.post('', payload, true);
    }
    
    /**
     * Check a company name
     * @param {string} companyName - Company name to check
     * @param {string} captcha - Captcha value (optional)
     * @returns {Promise<object>} - Check result
     */
    async checkCompany(companyName, captcha = '') {
        const payload = {
            data: {
                category: 'company',
                bankAccount: '',
                telNo: '',
                companyName: companyName,
                captcha: captcha
            }
        };
        return this.post('', payload, true);
    }
    
    /**
     * Search for scammers with custom parameters
     * @param {object} searchParams - Search parameters with keys: category, bankAccount, telNo, companyName, captcha
     * @returns {Promise<object>} - Search results
     */
    async search(searchParams) {
        // Map category names to API format
        const categoryMap = {
            'bank': 'bank',
            'phone': 'telefon',
            'telefon': 'telefon',
            'company': 'company'
        };
        
        let category = searchParams.category || 'bank';
        category = categoryMap[category] || category;
        
        const payload = {
            data: {
                category: category,
                bankAccount: searchParams.bankAccount || '',
                telNo: searchParams.telNo || '',
                companyName: searchParams.companyName || '',
                captcha: searchParams.captcha || ''
            }
        };
        
        // For telefon category, set both bankAccount and telNo to the phone number
        if (category === 'telefon' && searchParams.telNo) {
            payload.data.bankAccount = searchParams.telNo;
        }
        
        return this.post('', payload, true);
    }
    
    /**
     * Make HTTP request using Fetch API
     * @param {string} url - Full URL
     * @param {string} method - HTTP method (GET, POST, etc.)
     * @param {object} data - POST data (if POST request)
     * @returns {Promise<object>} - Response data
     */
    async makeRequest(url, method = 'GET', data = null) {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            signal: AbortSignal.timeout(this.timeout)
        };
        
        if (method === 'POST' && data) {
            // Use URLSearchParams for form-urlencoded data
            const formData = new URLSearchParams();
            for (const key in data) {
                formData.append(key, data[key]);
            }
            options.body = formData.toString();
        }
        
        try {
            const response = await fetch(url, options);
            const responseData = await response.json().catch(() => response.text());
            
            return {
                success: response.ok,
                http_code: response.status,
                data: responseData,
                headers: Object.fromEntries(response.headers.entries())
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                http_code: 0
            };
        }
    }
}

// Example usage:
/*
const client = new SemakMuleAPIClient();

// Check a bank account
client.checkBankAccount('1234567890')
    .then(result => {
        console.log('Bank Account Check:', result);
    })
    .catch(error => {
        console.error('Error:', error);
    });

// Check a phone number
client.checkPhoneNumber('0123456789')
    .then(result => {
        console.log('Phone Check:', result);
    });

// Get statistics
client.getStats()
    .then(stats => {
        console.log('Statistics:', stats);
    });

// Custom search
client.search({
    account: '1234567890',
    phone: '0123456789'
})
    .then(results => {
        console.log('Search Results:', results);
    });
*/

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SemakMuleAPIClient;
}

