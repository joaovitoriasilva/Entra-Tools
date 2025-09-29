// Microsoft Entra Authentication Logic using MSAL.js

class EntraAuth {
    constructor() {
        this.msalInstance = new msal.PublicClientApplication(msalConfig);
        this.account = null;
        this.checkConfiguration();
        this.initializeAuth();
    }

    checkConfiguration() {
        const configWarning = document.getElementById('config-warning');
        const configSuccess = document.getElementById('config-success');
        
        if (typeof window.credentials === 'undefined' || 
            window.credentials.clientId === "YOUR_CLIENT_ID_HERE" ||
            window.credentials.tenantId === "YOUR_TENANT_ID_HERE") {
            
            configWarning.classList.remove('hidden');
            configSuccess.classList.add('hidden');
            
            // Disable authentication if configuration is missing
            const loginButton = document.getElementById('login-button');
            if (loginButton) {
                loginButton.disabled = true;
                loginButton.textContent = 'Configuration Required';
            }
            return false;
        } else {
            configWarning.classList.add('hidden');
            configSuccess.classList.remove('hidden');
            return true;
        }
    }

    async initializeAuth() {
        // Don't initialize if configuration is missing
        if (!this.checkConfiguration()) {
            return;
        }

        try {
            // Handle redirect response
            const response = await this.msalInstance.handleRedirectPromise();
            if (response) {
                this.account = response.account;
                this.updateUI();
                await this.getTokenAndClaims();
            } else {
                // Check if user is already logged in
                const accounts = this.msalInstance.getAllAccounts();
                if (accounts.length > 0) {
                    this.account = accounts[0];
                    this.updateUI();
                    await this.getTokenAndClaims();
                }
            }
        } catch (error) {
            console.error('Authentication initialization error:', error);
            this.showError(error.message);
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login button
        document.getElementById('login-button').addEventListener('click', () => {
            this.signIn();
        });

        // Logout button
        document.getElementById('logout-button').addEventListener('click', () => {
            this.signOut();
        });
    }

    async signIn() {
        // Check configuration before attempting login
        if (!this.checkConfiguration()) {
            this.showError('Please configure your credentials first by creating credentials.js from credentials.example.js');
            return;
        }

        try {
            this.hideError();
            
            const loginRequest = {
                ...tokenRequest,
                prompt: "select_account"
            };

            // Use redirect for login
            await this.msalInstance.loginRedirect(loginRequest);
        } catch (error) {
            console.error('Login error:', error);
            this.showError(error.message);
        }
    }

    async signOut() {
        try {
            const logoutRequest = {
                account: this.account,
                postLogoutRedirectUri: msalConfig.auth.postLogoutRedirectUri
            };

            await this.msalInstance.logoutRedirect(logoutRequest);
        } catch (error) {
            console.error('Logout error:', error);
            this.showError(error.message);
        }
    }

    async getTokenAndClaims() {
        try {
            // Get access token silently
            const tokenResponse = await this.msalInstance.acquireTokenSilent({
                ...tokenRequest,
                account: this.account
            });

            // Display access token
            this.displayAccessToken(tokenResponse.accessToken);

            // Display ID token claims
            this.displayClaims(tokenResponse.idTokenClaims);

        } catch (error) {
            console.error('Token acquisition error:', error);
            
            // If silent token acquisition fails, try interactive
            if (error instanceof msal.InteractionRequiredAuthError) {
                try {
                    const tokenResponse = await this.msalInstance.acquireTokenRedirect(tokenRequest);
                } catch (interactiveError) {
                    console.error('Interactive token acquisition error:', interactiveError);
                    this.showError(interactiveError.message);
                }
            } else {
                this.showError(error.message);
            }
        }
    }

    displayClaims(claims) {
        const claimsContainer = document.getElementById('claims-container');
        const claimsSection = document.getElementById('claims-section');
        
        if (!claims) {
            claimsContainer.innerHTML = '<p>No claims available</p>';
            return;
        }

        // Create a formatted display of claims
        let claimsHtml = '<div class="claims-grid">';
        
        Object.entries(claims).forEach(([key, value]) => {
            claimsHtml += `
                <div class="claim-item">
                    <div class="claim-key">${key}</div>
                    <div class="claim-value">${this.formatClaimValue(value)}</div>
                </div>
            `;
        });
        
        claimsHtml += '</div>';
        claimsContainer.innerHTML = claimsHtml;
        claimsSection.classList.remove('hidden');
    }

    displayAccessToken(accessToken) {
        const tokenTextarea = document.getElementById('access-token');
        const tokenSection = document.getElementById('token-section');
        
        tokenTextarea.value = accessToken;
        tokenSection.classList.remove('hidden');
    }

    formatClaimValue(value) {
        if (typeof value === 'object') {
            return JSON.stringify(value, null, 2);
        }
        if (typeof value === 'number' && value > 1000000000) {
            // Likely a timestamp, convert to readable date
            const date = new Date(value * 1000);
            return `${value} (${date.toLocaleString()})`;
        }
        return value;
    }

    updateUI() {
        const loginView = document.getElementById('login-view');
        const authenticatedView = document.getElementById('authenticated-view');
        const userNameElement = document.getElementById('user-name');
        const userEmailElement = document.getElementById('user-email');

        if (this.account) {
            // Show authenticated view
            loginView.classList.add('hidden');
            authenticatedView.classList.remove('hidden');
            
            // Update user info
            userNameElement.textContent = this.account.name || 'Unknown User';
            userEmailElement.textContent = this.account.username || 'Unknown Email';
        } else {
            // Show login view
            loginView.classList.remove('hidden');
            authenticatedView.classList.add('hidden');
            
            // Hide token sections
            document.getElementById('claims-section').classList.add('hidden');
            document.getElementById('token-section').classList.add('hidden');
        }
    }

    showError(message) {
        const errorSection = document.getElementById('error-section');
        const errorMessage = document.getElementById('error-message');
        
        errorMessage.textContent = message;
        errorSection.classList.remove('hidden');
    }

    hideError() {
        const errorSection = document.getElementById('error-section');
        errorSection.classList.add('hidden');
    }
}

// Initialize the authentication when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new EntraAuth();
});