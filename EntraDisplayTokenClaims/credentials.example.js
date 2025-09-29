// Example credentials file
// Copy this file to 'credentials.js' and update with your actual values
// DO NOT commit the actual credentials.js file to version control

const credentials = {
    // Replace with your Application (client) ID from Azure App Registration
    clientId: "12345678-1234-1234-1234-123456789abc",
    
    // Replace with your Directory (tenant) ID from Azure App Registration
    // You can also use "common" for multi-tenant applications
    tenantId: "87654321-4321-4321-4321-abcdef123456"
};

// Export for use in config.js
window.credentials = credentials;