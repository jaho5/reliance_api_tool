# Reliance API Tool

A client-side web application for interacting with the Reliance API, allowing you to perform document operations such as retrieving, creating, updating, and routing documents.

## Features

- **Authentication**: Test API credentials before performing operations
- **Document Operations**: 
  - Get Documents
  - Create Document
  - Update Document
  - Route Document
- **JSON Editor**: Edit document data with a synchronized form interface
- **Multi-Document Support**: Create and manage multiple documents in a single request
- **Response Viewer**: View formatted API responses

## Project Structure

```
reliance_api_tool/
├── css/
│   └── style.css              # Custom styling
├── js/
│   ├── api.js                 # Core API functionality
│   ├── app.js                 # Main application initialization
│   ├── documents.js           # Document operations
│   ├── ui.js                  # UI interactions
│   ├── multi-document.js      # Multi-document handling
│   ├── multi-document-ui.js   # Multi-document UI components
│   └── multi-document-integration.js # Integration with existing code
└── index.html                 # Main application page
```

## Setup and Usage

### Requirements

- Modern web browser
- CORS proxy server (for development)

### Running the Application

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/reliance_api_tool.git
   cd reliance_api_tool
   ```

2. Open `index.html` in your browser:
   - The UI will load, but API calls will fail without a CORS proxy

3. **Important**: Set up a CORS proxy for development:
   ```
   git clone https://github.com/Rob--W/cors-anywhere.git
   cd cors-anywhere
   npm install
   npm start
   ```
   
   This will start a proxy server at `http://localhost:8080/`


## License

[MIT License](LICENSE)
