document.addEventListener('DOMContentLoaded', async () => {
    const autoConnectCheckbox = document.getElementById('auto-connect');
    const showNotificationsCheckbox = document.getElementById('show-notifications');
    const statusMessage = document.getElementById('status-message');

    // Load saved settings
    const { settings } = await chrome.storage.local.get(['settings']);

    if (settings) {
        autoConnectCheckbox.checked = settings.autoConnect || false;
        showNotificationsCheckbox.checked = settings.showNotifications || false;
    }

    // Save settings on change
    function saveSettings() {
        const newSettings = {
            autoConnect: autoConnectCheckbox.checked,
            showNotifications: showNotificationsCheckbox.checked
        };

        chrome.storage.local.set({ settings: newSettings }, () => {
            showStatus('Settings saved');
        });
    }

    autoConnectCheckbox.addEventListener('change', saveSettings);
    showNotificationsCheckbox.addEventListener('change', saveSettings);

    function showStatus(message) {
        statusMessage.textContent = message;
        statusMessage.classList.add('visible');
        setTimeout(() => {
            statusMessage.classList.remove('visible');
        }, 2000);
    }
});
