/**
 * Reliance API Client - Core API Module
 * Handles authentication and base API requests
 */

const ApiClient = {
  // API Configuration
  config: {
    endpoint: '',
    username: '',
    password: '',
    authenticated: false
  },

  /**
   * Initialize API client with user credentials
   * @param {string} endpoint - API endpoint URL
   * @param {string} username - Username for authentication
   * @param {string} password - Password for authentication
   */
  init(endpoint, username, password) {
    // Use provided values or fall back to config defaults
    this.config.endpoint = endpoint || Config.api.endpoint || '';
    if (this.config.endpoint.endsWith('/')) {
      this.config.endpoint = this.config.endpoint.slice(0, -1);
    }
    
    this.config.username = username || Config.api.username || '';
    this.config.password = password || Config.api.password || '';
  },

  // Rest of the original code remains unchanged...
  getHeaders(contentType = 'application/json') {
    const headers = new Headers();
    headers.append('Content-Type', contentType);
    headers.append('origin', 'http://localhost');    

    // Add Basic authentication
    if (this.config.username && this.config.password) {
      const auth = btoa(`${this.config.username}:${this.config.password}`);
      headers.append('Authorization', `Basic ${auth}`);
    }
    
    return headers;
  },

  async testAuth() {
    try {
      // We'll test auth by trying to access a minimal endpoint
      // For this example, let's use a lightweight call
      const response = await fetch(`http://localhost:8080/${this.config.endpoint}/documents`, {
        method: 'OPTIONS',
        headers: this.getHeaders()
      });
      
      this.config.authenticated = response.ok;
      return {
        success: response.ok,
        status: response.status,
        message: response.ok ? 'Authentication successful' : 'Authentication failed'
      };
    } catch (error) {
      console.error('Authentication error:', error);
      this.config.authenticated = false;
      return {
        success: false,
        status: 0,
        message: `Error: ${error.message}`
      };
    }
  },

  async request(method, path, data = null, params = {}) {
    try {
      // Prepare URL with query parameters if provided
      let url = `${this.config.endpoint}${path}`;
      
      if (Object.keys(params).length > 0) {
        const queryString = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
          if (value !== null && value !== undefined && value !== '') {
            queryString.append(key, value);
          }
        }
        url = `${url}?${queryString.toString()}`;
      }
      
      // Prepare request options
      const options = {
        method,
        headers: this.getHeaders()
      };
      
      // Add body for POST/PUT requests
      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = typeof data === 'string' ? data : JSON.stringify(data);
      }
      
      // Make the request
      const response = await fetch(`http://localhost:8080/${url}`, options);
      
      // Parse response based on content type
      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
      
      return {
        success: response.ok,
        status: response.status,
        data: responseData
      };
    } catch (error) {
      console.error('API request error:', error);
      return {
        success: false,
        status: 0,
        message: `Error: ${error.message}`,
        data: null
      };
    }
  },
  
  formatJson(json) {
    try {
      const obj = typeof json === 'string' ? JSON.parse(json) : json;
      return JSON.stringify(obj, null, 2);
    } catch (e) {
      console.error('Error formatting JSON:', e);
      return typeof json === 'string' ? json : JSON.stringify(json);
    }
  },
  
  isValidJson(jsonString) {
    try {
      JSON.parse(jsonString);
      return true;
    } catch (e) {
      return false;
    }
  }
};
