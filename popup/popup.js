import { servers } from '../background/servers.js';

document.addEventListener('DOMContentLoaded', async () => {
    const powerBtn = document.getElementById('power-btn');
    const statusBadge = document.getElementById('status-badge');
    const statusText = statusBadge.querySelector('.text');
    const connectionStatus = document.getElementById('connection-status');
    const connectionDisplay = document.querySelector('.connection-display');
    const timerElement = document.getElementById('timer');
    const ipAddressElement = document.getElementById('ip-address');
    const countrySelect = document.getElementById('country-select');
    const settingsLink = document.querySelector('.settings-link');

    let timerInterval;
    let startTime;

    // Load servers and populate dropdown
    // Imported from servers.js

    servers.forEach(server => {
        const option = document.createElement('option');
        option.value = server.code;
        option.textContent = `${server.name}`;
        countrySelect.appendChild(option);
    });

    // Load initial state
    const { isConnected, selectedCountry, connectionStartTime } = await chrome.storage.local.get(['isConnected', 'selectedCountry', 'connectionStartTime']);

    if (selectedCountry) {
        countrySelect.value = selectedCountry;
    }

    if (isConnected) {
        setConnectedState(true);
        if (connectionStartTime) {
            startTimer(connectionStartTime);
        }
    } else {
        setConnectedState(false);
    }

    // Event Listeners
    powerBtn.addEventListener('click', async () => {
        const { isConnected } = await chrome.storage.local.get(['isConnected']);

        if (isConnected) {
            disconnect();
        } else {
            if (!countrySelect.value) {
                alert('Please select a location first.');
                return;
            }
            connect();
        }
    });

    countrySelect.addEventListener('change', () => {
        chrome.storage.local.set({ selectedCountry: countrySelect.value });
    });

    settingsLink.addEventListener('click', (e) => {
        e.preventDefault();
        chrome.runtime.openOptionsPage();
    });

    function connect() {
        const country = countrySelect.value;
        chrome.runtime.sendMessage({ action: 'CONNECT', country }, (response) => {
            if (response && response.success) {
                setConnectedState(true);
                startTimer(Date.now());
            } else {
                alert('Connection failed: ' + (response ? response.error : 'Unknown error'));
            }
        });
    }

    function disconnect() {
        chrome.runtime.sendMessage({ action: 'DISCONNECT' }, (response) => {
            if (response && response.success) {
                setConnectedState(false);
                stopTimer();
            }
        });
    }

    function setConnectedState(connected) {
        if (connected) {
            powerBtn.classList.add('active');
            statusBadge.classList.add('connected');
            statusText.textContent = 'Protected';
            connectionStatus.textContent = 'Connected';
            connectionStatus.style.color = 'var(--success-color)';
            connectionDisplay.classList.add('visible');

            // Mock IP update
            const country = countrySelect.value;
            const server = servers.find(s => s.code === country);
            ipAddressElement.textContent = server ? `IP: ${server.ip}` : 'IP: Hidden';
        } else {
            powerBtn.classList.remove('active');
            statusBadge.classList.remove('connected');
            statusText.textContent = 'Unprotected';
            connectionStatus.textContent = 'Disconnected';
            connectionStatus.style.color = 'var(--text-muted)';
            connectionDisplay.classList.remove('visible');
        }
    }

    function startTimer(start) {
        startTime = start;
        updateTimer();
        timerInterval = setInterval(updateTimer, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
        timerElement.textContent = '00:00:00';
    }

    function updateTimer() {
        const now = Date.now();
        const diff = now - startTime;

        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        timerElement.textContent =
            `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

    function pad(num) {
        return num.toString().padStart(2, '0');
    }
});
