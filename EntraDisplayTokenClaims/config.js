// Configuration for Microsoft Entra Authentication
// Credentials are loaded from credentials.js (not committed to git)

// Function to get credentials with fallback values
function getCredentials() {
    if (typeof window.credentials !== 'undefined') {
        return window.credentials;
    } else {
        console.warn('credentials.js not found. Using placeholder values. Please create credentials.js from credentials.example.js');
        return {
            clientId: "YOUR_CLIENT_ID_HERE",
            tenantId: "YOUR_TENANT_ID_HERE"
        };
    }
}

const creds = getCredentials();

const msalConfig = {
    auth: {
        // Application (client) ID from credentials.js
        clientId: creds.clientId,
        
        // Tenant ID from credentials.js or use "common" for multi-tenant
        authority: `https://login.microsoftonline.com/${creds.tenantId}`,
        
        // Must match the redirect URI configured in your Entra app registration
        redirectUri: window.location.origin,
        
        // Optional: Use this for single-page applications
        postLogoutRedirectUri: window.location.origin
    },
    cache: {
        cacheLocation: "sessionStorage", // or "localStorage"
        storeAuthStateInCookie: false
    }
};

// Scopes for the access token request
const tokenRequest = {
    scopes: ["User.Read", "openid", "profile", "email"]
};

// Graph API endpoint for getting user information
const graphConfig = {
    graphMeEndpoint: "https://graph.microsoft.com/v1.0/me"
};