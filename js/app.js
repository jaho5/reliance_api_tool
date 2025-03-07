/**
 * Reliance API Client - Main Application
 * Initializes the app when the page loads
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI
  UI.init();
  
  // Initialize multi-document feature
  initMultiDocumentFeature();
  
  // Add sample usage info to help users get started
  const showSampleUsage = () => {
    const sampleJson = {
      "Document": {
        "applicationName": "Training",
        "formName": "Certification",
        "Fields": [
          {
            "fieldName": "CERTIFICATION_TYPE",
            "Values": ["Internal"]
          },
          {
            "fieldName": "CERTIFICATION_NAME",
            "Values": ["API Integration"]
          },
          {
            "fieldName": "CERTIFICATION_DESC",
            "Values": ["Learn how to use Reliance API"]
          }
        ]
      }
    };
    
    // Display sample for testing
    document.getElementById('documentJson').value = JSON.stringify(sampleJson, null, 2);
    UI.updateFormFromJson();
  };
  
  // Add multi-document sample button
  const showMultiDocumentSample = () => {
    const toggle = document.getElementById('multiDocumentToggle');
    if (toggle) {
      toggle.checked = true;
      
      // Enable add button
      document.getElementById('addDocumentBtn').disabled = false;
    }
    
    // Get and display multi-document sample
    document.getElementById('documentJson').value = MultiDocumentHandler.getSampleMultiDocumentJson();
    UI.updateFormFromJson();
  };
  
  // Add example buttons
  const addExampleButtons = () => {
    const container = document.querySelector('#jsonEditorSection .row');
    if (!container) return;
    
    const col = document.createElement('div');
    col.className = 'col-12 mb-2';
    
    const button = document.createElement('button');
    button.className = 'btn btn-outline-secondary btn-sm me-2';
    button.textContent = 'Load Sample Data';
    button.onclick = showSampleUsage;
    
    const multiButton = document.createElement('button');
    multiButton.className = 'btn btn-outline-secondary btn-sm';
    multiButton.textContent = 'Load Multi-Document Sample';
    multiButton.onclick = showMultiDocumentSample;
    
    col.appendChild(button);
    col.appendChild(multiButton);
    container.prepend(col);
  };
  
  // Add the example buttons after a short delay to ensure UI is ready
  setTimeout(addExampleButtons, 500);
  
  // Console log for debugging
  console.log('Reliance API Client initialized!');
});
