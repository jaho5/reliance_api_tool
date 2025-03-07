/**
 * Reliance API Client - Multi-Document UI Extensions
 * Handles UI interactions for multi-document feature
 */

const MultiDocumentUI = {
  /**
   * Initialize multi-document UI controls
   * @param {Object} ui - Reference to the main UI module
   */
  init(ui) {
    this.ui = ui;
    this.addMultiDocumentControls();
  },
  
  /**
   * Add multi-document controls to the JSON editor section
   */
  addMultiDocumentControls() {
    // Create controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'multiDocumentControls';
    controlsContainer.className = 'mb-3 d-flex align-items-center';
    
    // Create toggle switch for multi-document mode
    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'form-check form-switch me-3';
    
    const toggleInput = document.createElement('input');
    toggleInput.className = 'form-check-input';
    toggleInput.type = 'checkbox';
    toggleInput.id = 'multiDocumentToggle';
    toggleInput.role = 'switch';
    
    const toggleLabel = document.createElement('label');
    toggleLabel.className = 'form-check-label';
    toggleLabel.htmlFor = 'multiDocumentToggle';
    toggleLabel.textContent = 'Multi-Document Mode';
    
    toggleContainer.appendChild(toggleInput);
    toggleContainer.appendChild(toggleLabel);
    
    // Create add document button
    const addButton = document.createElement('button');
    addButton.className = 'btn btn-outline-secondary btn-sm me-2';
    addButton.id = 'addDocumentBtn';
    addButton.textContent = 'Add Document';
    addButton.disabled = true;
    
    // Add elements to container
    controlsContainer.appendChild(toggleContainer);
    controlsContainer.appendChild(addButton);
    
    // Insert controls at the top of the JSON editor section
    const jsonEditorSection = document.getElementById('jsonEditorSection');
    const labelElement = jsonEditorSection.querySelector('label');
    jsonEditorSection.insertBefore(controlsContainer, labelElement);
    
    // Set up event listeners
    this.setupEventListeners();
  },
  
  /**
   * Set up event listeners for multi-document controls
   */
  setupEventListeners() {
    const toggle = document.getElementById('multiDocumentToggle');
    const addBtn = document.getElementById('addDocumentBtn');
    
    // Toggle multi-document mode
    toggle.addEventListener('change', (e) => {
      const isMultiDoc = e.target.checked;
      addBtn.disabled = !isMultiDoc;
      
      if (isMultiDoc) {
        this.enableMultiDocumentMode();
      } else {
        this.disableMultiDocumentMode();
      }
    });
    
    // Add document button
    addBtn.addEventListener('click', () => {
      this.addDocument();
    });
  },
  
  /**
   * Enable multi-document mode
   */
  enableMultiDocumentMode() {
    try {
      const documentJson = document.getElementById('documentJson');
      const currentJson = JSON.parse(documentJson.value);
      
      // If already multi-document, keep it, otherwise convert
      if (!MultiDocumentHandler.isMultiDocument(currentJson)) {
        const multiJson = MultiDocumentHandler.convertToMultiDocument(currentJson);
        documentJson.value = JSON.stringify(multiJson, null, 2);
      }
      
      // Update form
      this.ui.updateFormFromJson();
      
      // Show document count badge
      this.updateDocumentCountBadge();
    } catch (e) {
      console.error('Error enabling multi-document mode:', e);
    }
  },
  
  /**
   * Disable multi-document mode
   */
  disableMultiDocumentMode() {
    try {
      const documentJson = document.getElementById('documentJson');
      const currentJson = JSON.parse(documentJson.value);
      
      // If it's a multi-document, convert to single document
      if (MultiDocumentHandler.isMultiDocument(currentJson)) {
        // Take only the first document
        const singleJson = { "Document": currentJson.Document[0]};
        documentJson.value = JSON.stringify(singleJson, null, 2);
      }
      
      // Update form
      this.ui.updateFormFromJson();
      
      // Hide document count badge
      this.updateDocumentCountBadge(0);
    } catch (e) {
      console.error('Error disabling multi-document mode:', e);
    }
  },
  
  /**
   * Add a new document to the multi-document JSON
   */
  addDocument() {
    try {
      const documentJson = document.getElementById('documentJson');
      const currentJson = JSON.parse(documentJson.value);
      
      const updatedJson = MultiDocumentHandler.addDocument(currentJson);
      documentJson.value = JSON.stringify(updatedJson, null, 2);
      
      // Update form
      this.ui.updateFormFromJson();
      
      // Update document count badge
      this.updateDocumentCountBadge();
    } catch (e) {
      console.error('Error adding document:', e);
    }
  },
  
  /**
   * Remove the last document from the multi-document JSON
   */
  removeDocument() {
    try {
      const documentJson = document.getElementById('documentJson');
      const currentJson = JSON.parse(documentJson.value);
      
      if (MultiDocumentHandler.isMultiDocument(currentJson)) {
        const docCount = currentJson.Documents.length;
        
        if (docCount <= 1) {
          // If only one document is left, don't remove it
          return;
        }
        
        const updatedJson = MultiDocumentHandler.removeDocument(currentJson, docCount - 1);
        documentJson.value = JSON.stringify(updatedJson, null, 2);
        
        // Update form
        this.ui.updateFormFromJson();
        
        // Update document count badge
        this.updateDocumentCountBadge();
      }
    } catch (e) {
      console.error('Error removing document:', e);
    }
  },
  
  /**
   * Update the document count badge
   * @param {number} [count] - Optional count override, otherwise calculated
   */
  updateDocumentCountBadge(count) {
    // Get document count if not provided
    if (count === undefined) {
      try {
        const documentJson = document.getElementById('documentJson');
        const currentJson = JSON.parse(documentJson.value);
        
        if (MultiDocumentHandler.isMultiDocument(currentJson)) {
          count = currentJson.Document.length;
        } else {
          count = 0;
        }
      } catch (e) {
        count = 0;
      }
    }
    
    // Find or create badge
    let badge = document.getElementById('documentCountBadge');
    
    if (!badge && count > 0) {
      const label = document.querySelector('label[for="documentJson"]');
      
      badge = document.createElement('span');
      badge.id = 'documentCountBadge';
      badge.className = 'badge bg-primary ms-2';
      
      label.appendChild(badge);
    }
    
    // Update or remove badge
    if (badge) {
      if (count > 0) {
        badge.textContent = `${count} documents`;
        badge.style.display = 'inline';
      } else {
        badge.style.display = 'none';
      }
    }
  }
};
