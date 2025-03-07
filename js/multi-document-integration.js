/**
 * Reliance API Client - Multi-Document Integration
 * Integrates multi-document functionality with existing code
 */

/**
 * Initialize multi-document integration
 * This function is called after the main UI is initialized
 */
function initMultiDocumentFeature() {
  // Initialize UI extensions
  MultiDocumentUI.init(UI);
  
  // Extend UI.updateFormFromJson to handle multi-document JSON
  const originalUpdateFormFromJson = UI.updateFormFromJson;
  UI.updateFormFromJson = function() {
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
      
      // Check if multi-document format
      if (MultiDocumentHandler.isMultiDocument(json)) {
        // Update multi-document toggle switch state
        const toggle = document.getElementById('multiDocumentToggle');
        if (toggle && !toggle.checked) {
          toggle.checked = true;
          
          // Enable add button
          document.getElementById('addDocumentBtn').disabled = false;
        }
        
        // Generate form fields for multi-document JSON
        this.state.formFields = MultiDocumentHandler.getFormFieldsFromMultiJson(json);
        this.renderJsonForm();
        
        // Update document count badge
        MultiDocumentUI.updateDocumentCountBadge();
        return;
      }
      
      // If not multi-document, use original logic
      this.state.formFields = DocumentOperations.getFormFieldsFromJson(json);
      this.renderJsonForm();
    } catch (e) {
      console.error('Error updating form from JSON:', e);
      this.elements.documentOptions.innerHTML = `<div class="alert alert-danger">Error: ${e.message}</div>`;
    }
  };
  
  // Extend UI.renderJsonForm to handle section headers for multi-document
  const originalRenderJsonForm = UI.renderJsonForm;
  UI.renderJsonForm = function() {
    const container = this.elements.documentOptions;
    container.innerHTML = '';
    
    if (!this.state.formFields.length) {
      container.innerHTML = '<div class="alert alert-info">No fields found in JSON</div>';
      return;
    }
    
    // Create form elements
    this.state.formFields.forEach(field => {
      // Special handling for section headers
      if (field.type === 'section' && field.isHeader) {
        const header = document.createElement('h5');
        header.className = 'mt-3 mb-2 border-bottom pb-2';
        header.textContent = field.label;
        container.appendChild(header);
        return;
      }
      
      // Regular field rendering
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
  };
  
  // Extend UI.executeCurrentOperation to handle multi-document operations
  const originalExecuteOperation = UI.executeCurrentOperation;
  UI.executeCurrentOperation = async function() {
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
      
      // Check if it's multi-document
      try {
        const jsonData = JSON.parse(data);
        
        if (MultiDocumentHandler.isMultiDocument(jsonData)) {
          // Execute multi-document operation
          this.elements.executeOperation.classList.add('loading');
          this.elements.executeOperation.disabled = true;
          
          try {
            const result = await MultiDocumentHandler.executeMultiDocumentOperation(
              jsonData,
              async (singleDocJson) => {
                return await DocumentOperations.executeOperation(
                  operationName,
                  this.state.currentParameters,
                  singleDocJson
                );
              }
            );
            
            // Display response
            if (result.success) {
              this.showResponseStatus('Multi-document operation completed', true);
            } else {
              this.showResponseStatus('Multi-document operation failed', false);
            }
            
            this.elements.responseData.value = ApiClient.formatJson(result);
          } catch (e) {
            console.error('Error executing multi-document operation:', e);
            this.showResponseStatus(`Error: ${e.message}`, false);
          } finally {
            this.elements.executeOperation.classList.remove('loading');
            this.elements.executeOperation.disabled = false;
          }
          
          return; // Skip the regular execution
        }
      } catch (e) {
        console.error('Error parsing JSON for multi-document check:', e);
      }
    }
    
    // Fall back to original implementation for single document
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
  };
  
  // Extend DocumentOperations.getSampleJson to include multi-document option
  const originalGetSampleJson = DocumentOperations.getSampleJson;
  DocumentOperations.getSampleJson = function(operationName) {
    // Add multi-document sample for create document operation
    if (operationName === 'createDocument') {
      // Check if multi-document mode is enabled
      const toggle = document.getElementById('multiDocumentToggle');
      if (toggle && toggle.checked) {
        return MultiDocumentHandler.getSampleMultiDocumentJson();
      }
    }
    
    // Use original implementation for other cases
    return originalGetSampleJson.call(this, operationName);
  };
  
  console.log('Multi-document feature initialized');
}
