/**
 * Reliance API Client - UI Module
 * Handles UI interactions and form generation
 */

const UI = {
  // Element references
  elements: {
    endpoint: null,
    username: null,
    password: null,
    testAuth: null,
    operation: null,
    parametersSection: null,
    jsonEditorSection: null,
    documentJson: null,
    documentOptions: null,
    executeOperation: null,
    responseStatus: null,
    responseData: null,
    clearResponse: null
  },
  
  // Current state
  state: {
    currentOperation: null,
    currentParameters: {},
    currentJson: null,
    formFields: []
  },
  
  /**
   * Initialize UI
   */
  init() {
    // Get elements
    this.elements.endpoint = document.getElementById('endpoint');
    this.elements.username = document.getElementById('username');
    this.elements.password = document.getElementById('password');
    this.elements.testAuth = document.getElementById('testAuth');
    this.elements.operation = document.getElementById('operation');
    this.elements.parametersSection = document.getElementById('parametersSection');
    this.elements.jsonEditorSection = document.getElementById('jsonEditorSection');
    this.elements.documentJson = document.getElementById('documentJson');
    this.elements.documentOptions = document.getElementById('documentOptions').querySelector('.card-body');
    this.elements.executeOperation = document.getElementById('executeOperation');
    this.elements.responseStatus = document.getElementById('responseStatus');
    this.elements.responseData = document.getElementById('responseData');
    this.elements.clearResponse = document.getElementById('clearResponse');
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize with first operation
    this.selectOperation(this.elements.operation.value);
  },
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Test authentication
    this.elements.testAuth.addEventListener('click', () => {
      this.testAuthentication();
    });
    
    // Operation change
    this.elements.operation.addEventListener('change', (e) => {
      this.selectOperation(e.target.value);
    });
    
    // Execute operation
    this.elements.executeOperation.addEventListener('click', () => {
      this.executeCurrentOperation();
    });
    
    // Clear response
    this.elements.clearResponse.addEventListener('click', () => {
      this.clearResponse();
    });
    
    // JSON editor change
    this.elements.documentJson.addEventListener('input', () => {
      this.updateFormFromJson();
    });
  },
  
  /**
   * Test API authentication
   */
  async testAuthentication() {
    const button = this.elements.testAuth;
    button.classList.add('loading');
    button.disabled = true;
    
    // Initialize API client
    ApiClient.init(
      this.elements.endpoint.value,
      this.elements.username.value,
      this.elements.password.value
    );
    
    // Test authentication
    const result = await ApiClient.testAuth();
    
    // Update UI
    button.classList.remove('loading');
    button.disabled = false;
    
    this.showResponseStatus(result.message, result.success);
  },
  
  /**
   * Select an operation and update the UI
   * @param {string} operationName - Name of operation to select
   */
  selectOperation(operationName) {
    this.state.currentOperation = operationName;
    this.state.currentParameters = {};
    
    const operation = DocumentOperations.getOperation(operationName);
    if (!operation) return;
    
    // Generate parameters form
    this.generateParametersForm(operation);
    
    // Show/hide JSON editor
    if (operation.needsJsonEditor) {
      this.elements.jsonEditorSection.classList.remove('d-none');
      // Set default JSON
      this.elements.documentJson.value = DocumentOperations.getSampleJson(operationName);
      this.updateFormFromJson();
    } else {
      this.elements.jsonEditorSection.classList.add('d-none');
    }
  },
  
  /**
   * Generate form fields for operation parameters
   * @param {Object} operation - Operation definition
   */
  generateParametersForm(operation) {
    const container = this.elements.parametersSection;
    container.innerHTML = '';
    
    if (!operation.parameters || operation.parameters.length === 0) {
      container.innerHTML = '<p>No parameters required for this operation.</p>';
      return;
    }
    
    // Group parameters for better layout
    const row = document.createElement('div');
    row.className = 'row';
    
    operation.parameters.forEach(param => {
      const col = document.createElement('div');
      col.className = 'col-md-6 mb-3';
      
      const formGroup = document.createElement('div');
      formGroup.className = 'form-group';
      
      // Label
      const label = document.createElement('label');
      label.className = 'form-label';
      label.htmlFor = `param-${param.name}`;
      label.textContent = param.label;
      if (param.required) {
        const required = document.createElement('span');
        required.className = 'text-danger ms-1';
        required.textContent = '*';
        label.appendChild(required);
      }
      formGroup.appendChild(label);
      
      // Input field
      let input;
      
      switch (param.type) {
        case 'checkbox':
          input = document.createElement('div');
          input.className = 'form-check';
          
          const checkbox = document.createElement('input');
          checkbox.className = 'form-check-input';
          checkbox.type = 'checkbox';
          checkbox.id = `param-${param.name}`;
          checkbox.name = param.name;
          checkbox.checked = false;
          
          const checkboxLabel = document.createElement('label');
          checkboxLabel.className = 'form-check-label';
          checkboxLabel.htmlFor = `param-${param.name}`;
          checkboxLabel.textContent = param.description || 'Enable';
          
          input.appendChild(checkbox);
          input.appendChild(checkboxLabel);
          
          checkbox.addEventListener('change', (e) => {
            this.state.currentParameters[param.name] = e.target.checked;
          });
          break;
        
        case 'select':
          input = document.createElement('select');
          input.className = 'form-select';
          input.id = `param-${param.name}`;
          input.name = param.name;
          
          if (param.options && Array.isArray(param.options)) {
            param.options.forEach(option => {
              const optionEl = document.createElement('option');
              optionEl.value = option.value;
              optionEl.textContent = option.label;
              input.appendChild(optionEl);
            });
          }
          
          input.addEventListener('change', (e) => {
            this.state.currentParameters[param.name] = e.target.value;
          });
          break;
        
        default: // text, password, etc.
          input = document.createElement('input');
          input.className = 'form-control';
          input.type = param.type || 'text';
          input.id = `param-${param.name}`;
          input.name = param.name;
          if (param.placeholder) input.placeholder = param.placeholder;
          
          input.addEventListener('input', (e) => {
            this.state.currentParameters[param.name] = e.target.value;
          });
          break;
      }
      
      formGroup.appendChild(input);
      
      // Help text
      if (param.description && param.type !== 'checkbox') {
        const helpText = document.createElement('small');
        helpText.className = 'form-text text-muted';
        helpText.textContent = param.description;
        formGroup.appendChild(helpText);
      }
      
      col.appendChild(formGroup);
      row.appendChild(col);
    });
    
    container.appendChild(row);
  },
  
  /**
   * Update form from JSON editor
   */
  updateFormFromJson() {
    try {
      const jsonText = this.elements.documentJson.value;
      if (!jsonText.trim()) {
        this.elements.documentOptions.innerHTML = '<div class="alert alert-info">No JSON data provided</div>';
        return;
      }
      
      if (!ApiClient.isValidJson(jsonText)) {
        this.elements.documentOptions.innerHTML = '<div class="alert alert-danger">Invalid JSON format</div>';
        return;
      }
      
      const json = JSON.parse(jsonText);
      this.state.currentJson = json;
      
      // Generate form fields from JSON
      this.state.formFields = DocumentOperations.getFormFieldsFromJson(json);
      this.renderJsonForm();
    } catch (e) {
      console.error('Error updating form from JSON:', e);
      this.elements.documentOptions.innerHTML = `<div class="alert alert-danger">Error: ${e.message}</div>`;
    }
  },
  
  /**
   * Render form based on JSON structure
   */
  renderJsonForm() {
    const container = this.elements.documentOptions;
    container.innerHTML = '';
    
    if (!this.state.formFields.length) {
      container.innerHTML = '<div class="alert alert-info">No fields found in JSON</div>';
      return;
    }
    
    // Create form elements
    this.state.formFields.forEach(field => {
      const formGroup = document.createElement('div');
      formGroup.className = 'mb-3';
      
      // Label
      const label = document.createElement('label');
      label.className = 'form-label';
      label.htmlFor = `json-${field.name}`;
      label.textContent = field.label;
      formGroup.appendChild(label);
      
      // Input
      const input = document.createElement('input');
      input.className = 'form-control';
      input.type = field.type;
      input.id = `json-${field.name}`;
      input.value = field.value;
      input.dataset.path = field.path;
      
      input.addEventListener('input', (e) => {
        this.updateJsonFromForm(e.target.dataset.path, e.target.value);
      });
      
      formGroup.appendChild(input);
      container.appendChild(formGroup);
    });
  },
  
  /**
   * Update JSON when form field changes
   * @param {string} path - JSON path to update
   * @param {string} value - New value
   */
  updateJsonFromForm(path, value) {
    if (!this.state.currentJson) return;
    
    // Update JSON object
    this.state.currentJson = DocumentOperations.updateJsonFromPath(
      this.state.currentJson,
      path,
      value
    );
    
    // Update JSON editor
    this.elements.documentJson.value = ApiClient.formatJson(this.state.currentJson);
  },
  
  /**
   * Execute current operation
   */
  async executeCurrentOperation() {
    const operationName = this.state.currentOperation;
    const operation = DocumentOperations.getOperation(operationName);
    
    if (!operation) {
      this.showResponseStatus('Invalid operation', false);
      return;
    }
    
    // Validate required parameters
    let missingRequired = false;
    operation.parameters.forEach(param => {
      if (param.required && (!this.state.currentParameters[param.name] || this.state.currentParameters[param.name].trim() === '')) {
        missingRequired = true;
        const inputEl = document.getElementById(`param-${param.name}`);
        if (inputEl) inputEl.classList.add('is-invalid');
      }
    });
    
    if (missingRequired) {
      this.showResponseStatus('Please fill in all required fields', false);
      return;
    }
    
    // Prepare data for request
    let data = null;
    if (operation.needsJsonEditor) {
      data = this.elements.documentJson.value;
    }
    
    // Execute
    this.elements.executeOperation.classList.add('loading');
    this.elements.executeOperation.disabled = true;
    
    try {
      const result = await DocumentOperations.executeOperation(
        operationName,
        this.state.currentParameters,
        data
      );
      
      // Display response
      if (result.success) {
        this.showResponseStatus('Operation executed successfully', true);
      } else {
        this.showResponseStatus(`Error: ${result.message || 'Unknown error'}`, false);
      }
      
      this.elements.responseData.value = ApiClient.formatJson(result.data);
    } catch (e) {
      console.error('Error executing operation:', e);
      this.showResponseStatus(`Error: ${e.message}`, false);
    } finally {
      this.elements.executeOperation.classList.remove('loading');
      this.elements.executeOperation.disabled = false;
    }
  },
  
  /**
   * Show status message
   * @param {string} message - Message to display
   * @param {boolean} success - Is success or error
   */
  showResponseStatus(message, success) {
    const statusEl = this.elements.responseStatus;
    statusEl.textContent = message;
    statusEl.classList.remove('d-none', 'alert-success', 'alert-danger');
    statusEl.classList.add(success ? 'alert-success' : 'alert-danger');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      statusEl.classList.add('d-none');
    }, 5000);
  },
  
  /**
   * Clear response area
   */
  clearResponse() {
    this.elements.responseStatus.classList.add('d-none');
    this.elements.responseData.value = '';
  }
};