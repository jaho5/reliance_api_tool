/**
 * Reliance API Client - Document Operations Module
 * Handles specific document-related API operations
 */

const DocumentOperations = {
  // Operation definitions with their parameters
  operations: {
    getDocuments: {
      name: 'Get Documents',
      method: 'GET',
      path: '/documents/{applicationName}/{formName}/{documentIds}',
      description: 'Gets a document, or more, based on provided IDs, parent form and parent module.',
      parameters: [
        { name: 'applicationName', label: 'Application Name', type: 'text', required: true, placeholder: 'Parent module design name' },
        { name: 'formName', label: 'Form Name', type: 'text', required: true, placeholder: 'Parent form design name' },
        { name: 'documentIds', label: 'Document ID(s)', type: 'text', required: true, placeholder: 'Comma-separated IDs' },
        { name: 'allsystemfields', label: 'Include System Fields', type: 'checkbox', description: 'Include all system fields' },
        { name: 'fieldstoinclude', label: 'Fields to Include', type: 'text', placeholder: 'Comma-separated field names' },
        { name: 'fieldstoexclude', label: 'Fields to Exclude', type: 'text', placeholder: 'Comma-separated field names' },
        { name: 'allnormalsubforms', label: 'Include Normal Subforms', type: 'checkbox', description: 'Include all normal subforms' },
        { name: 'allsystemsubforms', label: 'Include System Subforms', type: 'checkbox', description: 'Include all system subforms' },
        { name: 'requestedsubforms', label: 'Requested Subforms', type: 'text', placeholder: 'Comma-separated subform names' }
      ],
      needsJsonEditor: false
    },
    createDocument: {
      name: 'Create Document',
      method: 'POST',
      path: '/documents',
      description: 'Create a document based on provided attributes.',
      parameters: [
        { name: 'assignedusers', label: 'Assigned Users', type: 'text', placeholder: 'Comma-separated usernames' },
        { name: 'notifiedusers', label: 'Notified Users', type: 'text', placeholder: 'Comma-separated usernames' },
        { name: 'parentapplicationname', label: 'Parent Application Name', type: 'text', placeholder: 'For child documents' },
        { name: 'parentformname', label: 'Parent Form Name', type: 'text', placeholder: 'For child documents' },
        { name: 'parentdocumentid', label: 'Parent Document ID', type: 'text', placeholder: 'For child documents' },
        { name: 'parentlinkfieldname', label: 'Parent Link Field Name', type: 'text', placeholder: 'For child documents' },
        { name: 'parentsubformname', label: 'Parent Subform Name', type: 'text', placeholder: 'For child documents' },
        { name: 'parentrecordid', label: 'Parent Record ID', type: 'text', placeholder: 'For child documents' }
      ],
      needsJsonEditor: true,
      defaultJson: {
        "Document": {
          "ApplicationName": "",
          "FormName": "",
          "Fields": [
            {
              "fieldName": "",
              "Values": [""]
            }
          ]
        }
      }
    },
    updateDocument: {
      name: 'Update Document',
      method: 'PUT',
      path: '/documents',
      description: 'Update a document based on provided attributes.',
      parameters: [
        { name: 'contentType', label: 'Content Type', type: 'select', options: [
          { value: 'application/json', label: 'JSON' },
          { value: 'application/xml', label: 'XML' }
        ]}
      ],
      needsJsonEditor: true,
      defaultJson: {
        "Document": {
          "ApplicationName": "",
          "FormName": "",
          "DocumentID": "",
          "Fields": [
            {
              "fieldName": "",
              "Values": [""]
            }
          ]
        }
      }
    },
    routeDocument: {
      name: 'Route Document',
      method: 'PUT',
      path: '/documents/{applicationName}/{formName}/{documentIds}/route/{phaseName}',
      description: 'Routes a document to a different phase.',
      parameters: [
        { name: 'applicationName', label: 'Application Name', type: 'text', required: true, placeholder: 'Parent module design name' },
        { name: 'formName', label: 'Form Name', type: 'text', required: true, placeholder: 'Parent form design name' },
        { name: 'documentIds', label: 'Document ID(s)', type: 'text', required: true, placeholder: 'Comma-separated IDs' },
        { name: 'phaseName', label: 'Phase Name', type: 'text', required: true, placeholder: 'Target routing phase' },
        { name: 'assignedusers', label: 'Assigned Users', type: 'text', placeholder: 'Comma-separated usernames' },
        { name: 'notifiedusers', label: 'Notified Users', type: 'text', placeholder: 'Comma-separated usernames' },
        { name: 'comment', label: 'Comment', type: 'text', placeholder: 'Routing comment' },
        { name: 'dateformat', label: 'Date Format', type: 'text', placeholder: 'e.g. yyyy-MM-dd' },
        { name: 'duedate', label: 'Due Date', type: 'text', placeholder: 'e.g. 2023-12-31' }
      ],
      needsJsonEditor: false
    }
  },
  
  /**
   * Get operation schema by name
   * @param {string} operationName - Name of the operation
   * @returns {Object} Operation schema
   */
  getOperation(operationName) {
    return this.operations[operationName] || null;
  },
  
  /**
   * Build API path with path parameters replaced
   * @param {string} path - API path template
   * @param {Object} params - Path parameters
   * @returns {string} Completed API path
   */
  buildPath(path, params) {
    let result = path;
    for (const [key, value] of Object.entries(params)) {
      result = result.replace(`{${key}}`, value);
    }
    return result;
  },
  
  /**
   * Execute document operation
   * @param {string} operationName - Name of operation to execute
   * @param {Object} params - Operation parameters
   * @param {Object|string} data - Request body data (for POST/PUT)
   * @returns {Promise} Operation result
   */
  async executeOperation(operationName, params, data = null) {
    const operation = this.getOperation(operationName);
    if (!operation) {
      return { success: false, message: 'Invalid operation' };
    }
    
    // Extract path parameters to build the URL
    const pathParams = {};
    const queryParams = {};
    
    for (const param of operation.parameters) {
      if (params[param.name] !== undefined && params[param.name] !== '') {
        if (operation.path.includes(`{${param.name}}`)) {
          pathParams[param.name] = params[param.name];
        } else {
          // If it's a checkbox, only add if true
          if (param.type === 'checkbox') {
            if (params[param.name] === true) {
              queryParams[param.name] = true;
            }
          } else {
            queryParams[param.name] = params[param.name];
          }
        }
      }
    }
    
    const path = this.buildPath(operation.path, pathParams);
    
    // Convert string data to object if needed
    let requestData = data;
    if (typeof data === 'string' && operation.needsJsonEditor) {
      try {
        requestData = JSON.parse(data);
      } catch (e) {
        return { success: false, message: 'Invalid JSON data' };
      }
    }
    
    return await ApiClient.request(operation.method, path, requestData, queryParams);
  },
  
  /**
   * Generate a sample document JSON based on operation type
   * @param {string} operationName - Name of operation
   * @returns {string} Sample JSON
   */
  getSampleJson(operationName) {
    const operation = this.getOperation(operationName);
    if (!operation || !operation.defaultJson) {
      return '{}';
    }
    return JSON.stringify(operation.defaultJson, null, 2);
  },
  
  /**
   * Generate form fields from document JSON
   * @param {Object} json - Document JSON
   * @returns {Array} Form fields definition
   */
  getFormFieldsFromJson(json) {
    const fields = [];
    
    if (!json || typeof json !== 'object') {
      return fields;
    }
    
    // Handle main document properties
    if (json.Document) {
      fields.push({
        name: 'ApplicationName',
        label: 'Application Name',
        type: 'text',
        value: json.Document.ApplicationName || '',
        path: 'Document.ApplicationName'
      });
      
      fields.push({
        name: 'FormName',
        label: 'Form Name',
        type: 'text',
        value: json.Document.FormName || '',
        path: 'Document.FormName'
      });
      
      if (json.Document.DocumentID) {
        fields.push({
          name: 'DocumentID',
          label: 'Document ID',
          type: 'text',
          value: json.Document.DocumentID || '',
          path: 'Document.DocumentID'
        });
      }
      
      // Handle document fields
      if (json.Document.Fields && Array.isArray(json.Document.Fields)) {
        json.Document.Fields.forEach((field, index) => {
          fields.push({
            name: `Field_${index}_Name`,
            label: `Field ${index+1} Name`,
            type: 'text',
            value: field.fieldName || '',
            path: `Document.Fields[${index}].fieldName`
          });
          
          if (field.Values && Array.isArray(field.Values)) {
            field.Values.forEach((value, valueIndex) => {
              fields.push({
                name: `Field_${index}_Value_${valueIndex}`,
                label: `Field ${index+1} Value ${valueIndex+1}`,
                type: 'text',
                value: value || '',
                path: `Document.Fields[${index}].Values[${valueIndex}]`
              });
            });
          }
        });
      }
    }
    
    return fields;
  },
  
  /**
   * Update JSON object based on form field changes
   * @param {Object} json - Original JSON object
   * @param {string} path - Path to update (dot notation)
   * @param {any} value - New value to set
   * @returns {Object} Updated JSON object
   */
  updateJsonFromPath(json, path, value) {
    const result = JSON.parse(JSON.stringify(json)); // Deep clone
    const parts = path.split('.');
    
    let current = result;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      // Handle array access, e.g., Fields[0]
      if (part.includes('[') && part.includes(']')) {
        const name = part.substring(0, part.indexOf('['));
        const index = parseInt(part.substring(part.indexOf('[') + 1, part.indexOf(']')));
        
        if (i === parts.length - 1) {
          // Last part, set the value
          current[name][index] = value;
        } else {
          // Navigate deeper
          current = current[name][index];
        }
      } else {
        if (i === parts.length - 1) {
          // Last part, set the value
          current[part] = value;
        } else {
          // Navigate deeper
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
      }
    }
    
    return result;
  }
};