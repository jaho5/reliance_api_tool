/**
 * Reliance API Client - Multi-Document Support Module
 * Handles creating and processing multiple documents in a single request
 */

const MultiDocumentHandler = {
  /**
   * Check if JSON contains multiple documents
   * @param {Object|string} jsonData - Document JSON data
   * @returns {boolean} True if contains multiple documents
   */
  isMultiDocument(jsonData) {
    try {
      const json = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      // Check for Document as an array
      return json && json.Document && Array.isArray(json.Document) && json.Document.length > 0;
    } catch (e) {
      console.error('Error checking multi-document:', e);
      return false;
    }
  },
  
  /**
   * Format multi-document JSON for display in the editor
   * @returns {string} Sample multi-document JSON
   */
  getSampleMultiDocumentJson() {
    const sample = {
      "Document": [
        {
          "applicationName": "Training",
          "formName": "Certification",
          "Fields": [
            {
              "fieldName": "CERTIFICATION_TYPE",
              "Values": ["Internal"]
            },
            {
              "fieldName": "CERTIFICATION_NAME",
              "Values": ["API Integration 1"]
            }
          ]
        },
        {
          "applicationName": "Training",
          "formName": "Certification",
          "Fields": [
            {
              "fieldName": "CERTIFICATION_TYPE",
              "Values": ["External"]
            },
            {
              "fieldName": "CERTIFICATION_NAME",
              "Values": ["API Integration 2"]
            }
          ]
        }
      ]
    };
    
    return JSON.stringify(sample, null, 2);
  },
  
  /**
   * Convert standard document JSON to multi-document format
   * @param {Object} documentJson - Single document JSON
   * @returns {Object} Multi-document JSON with the original document
   */
  convertToMultiDocument(documentJson) {
    if (this.isMultiDocument(documentJson)) {
      return documentJson;
    }
    
    return {
      "Document": [
        documentJson.Document
      ]
    };
  },
  
  /**
   * Generate form fields from multi-document JSON
   * @param {Object} json - Document JSON
   * @returns {Array} Form fields definition grouped by document
   */
  getFormFieldsFromMultiJson(json) {
    const allFields = [];
    
    if (!json || typeof json !== 'object' || !json.Document || !Array.isArray(json.Document)) {
      return allFields;
    }
    
    json.Document.forEach((doc, docIndex) => {
      if (!doc) return;
      
      // Add document section header
      allFields.push({
        type: 'section',
        name: `Document_${docIndex}_Header`,
        label: `Document ${docIndex + 1}`,
        isHeader: true
      });
      
      // Handle main document properties
      allFields.push({
        name: `Document_${docIndex}_applicationName`,
        label: 'Application Name',
        type: 'text',
        value: doc.applicationName || '',
        path: `Document[${docIndex}].applicationName`
      });
      
      allFields.push({
        name: `Document_${docIndex}_formName`,
        label: 'Form Name',
        type: 'text',
        value: doc.formName || '',
        path: `Document[${docIndex}].formName`
      });
      
      if (doc.DocumentID) {
        allFields.push({
          name: `Document_${docIndex}_DocumentID`,
          label: 'Document ID',
          type: 'text',
          value: doc.DocumentID || '',
          path: `Document[${docIndex}].DocumentID`
        });
      }
      
      // Handle document fields
      if (doc.Fields && Array.isArray(doc.Fields)) {
        doc.Fields.forEach((field, fieldIndex) => {
          allFields.push({
            name: `Document_${docIndex}_Field_${fieldIndex}_Name`,
            label: `Field ${fieldIndex + 1} Name`,
            type: 'text',
            value: field.fieldName || '',
            path: `Document[${docIndex}].Fields[${fieldIndex}].fieldName`
          });
          
          if (field.Values && Array.isArray(field.Values)) {
            field.Values.forEach((value, valueIndex) => {
              allFields.push({
                name: `Document_${docIndex}_Field_${fieldIndex}_Value_${valueIndex}`,
                label: `Field ${fieldIndex + 1} Value ${valueIndex + 1}`,
                type: 'text',
                value: value || '',
                path: `Document[${docIndex}].Fields[${fieldIndex}].Values[${valueIndex}]`
              });
            });
          }
        });
      }
    });
    
    return allFields;
  },
  
  /**
   * Add a new document to the multi-document JSON
   * @param {Object} json - Current multi-document JSON
   * @returns {Object} Updated multi-document JSON with a new document
   */
  addDocument(json) {
    let multiJson;
    
    // Convert to multi-document format if not already
    if (!this.isMultiDocument(json)) {
      multiJson = this.convertToMultiDocument(json);
    } else {
      multiJson = JSON.parse(JSON.stringify(json)); // Deep clone
    }
    
    // Add a new empty document
    const emptyDocument = {
      "applicationName": "",
      "formName": "",
      "Fields": [
        {
          "fieldName": "",
          "Values": [""]
        }
      ]
    };
    
    multiJson.Document.push(emptyDocument);
    
    return multiJson;
  },
  

  
  /**
   * Execute multi-document operation
   * @param {Object} json - Multi-document JSON
   * @param {Function} apiCallback - Callback function to execute API operation
   * @returns {Promise} Operation results for all documents
   */
  async executeMultiDocumentOperation(json, apiCallback) {
    if (!this.isMultiDocument(json)) {
      // If not multi-document, just execute normally
      return await apiCallback(json);
    }
    
    const results = [];
    const documents = json.Document;
    
    // Process documents sequentially
    for (let i = 0; i < documents.length; i++) {
      const docJson = { "Document": documents[i] };
      try {
        const result = await apiCallback(docJson);
        results.push({
          index: i,
          success: result.success,
          data: result.data,
          message: result.message
        });
      } catch (e) {
        results.push({
          index: i,
          success: false,
          message: e.message
        });
      }
    }
    
    return {
      success: results.some(r => r.success),
      multiDocument: true,
      results: results,
      data: results
    };
  }
};
