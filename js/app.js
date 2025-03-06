/**
 * Reliance API Client - Main Application
 * Initializes the app when the page loads
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI
  UI.init();
  
  // Add sample usage info to help users get started
  const showSampleUsage = () => {
    const sampleJson = {
      "Document": {
        "ApplicationName": "Training",
        "FormName": "Certification",
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
  
  // Add example button
  const addExampleButton = () => {
    const container = document.querySelector('#jsonEditorSection .row');
    if (!container) return;
    
    const col = document.createElement('div');
    col.className = 'col-12 mb-2';
    
    const button = document.createElement('button');
    button.className = 'btn btn-outline-secondary btn-sm';
    button.textContent = 'Load Sample Data';
    button.onclick = showSampleUsage;
    
    col.appendChild(button);
    container.prepend(col);
  };
  
  // Add the example button after a short delay to ensure UI is ready
  setTimeout(addExampleButton, 500);
  
  // Console log for debugging
  console.log('Reliance API Client initialized!');
});