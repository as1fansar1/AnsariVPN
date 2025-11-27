import { servers } from './servers.js';

// Initialize state
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({
        isConnected: false,
        selectedCountry: null,
        connectionStartTime: null
    });
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'CONNECT') {
        connectToProxy(request.country)
            .then(() => sendResponse({ success: true }))
            .catch((error) => sendResponse({ success: false, error: error.message }));
        return true; // Keep channel open for async response
    } else if (request.action === 'DISCONNECT') {
        disconnectProxy()
            .then(() => sendResponse({ success: true }))
            .catch((error) => sendResponse({ success: false, error: error.message }));
        return true;
    }
});

async function connectToProxy(countryCode) {
    const server = servers.find(s => s.code === countryCode);

    if (!server) {
        throw new Error('Server not found');
    }

    // Configure proxy settings
    // Note: In a real scenario, this would use the actual server IP and port
    // For this demo, we are setting a fixed configuration or using the mock data
    // Chrome requires a valid proxy config. 

    const config = {
        mode: "fixed_servers",
        rules: {
            singleProxy: {
                scheme: "http",
                host: server.ip,
                port: parseInt(server.port)
            },
            bypassList: ["localhost", "127.0.0.1"]
        }
    };

    // Apply settings
    await new Promise((resolve, reject) => {
        chrome.proxy.settings.set(
            { value: config, scope: 'regular' },
            () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            }
        );
    });

    // Update state
    await chrome.storage.local.set({
        isConnected: true,
        selectedCountry: countryCode,
        connectionStartTime: Date.now()
    });

    // Set icon badge
    chrome.action.setBadgeText({ text: 'ON' });
    chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
}

async function disconnectProxy() {
    // Clear proxy settings (revert to direct connection or system settings)
    const config = {
        mode: "system"
    };

    await new Promise((resolve, reject) => {
        chrome.proxy.settings.set(
            { value: config, scope: 'regular' },
            () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            }
        );
    });

    // Update state
    await chrome.storage.local.set({
        isConnected: false,
        connectionStartTime: null
    });

    // Clear icon badge
    chrome.action.setBadgeText({ text: '' });
}

// Handle Proxy Authentication
// Handle Proxy Authentication
chrome.webRequest.onAuthRequired.addListener(
    (details) => {
        return {
            authCredentials: {
                username: 'sjcbuyzi',
                password: 'in1f5byabjv1'
            }
        };
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);
