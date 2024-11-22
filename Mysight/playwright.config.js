const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    workers: 1, // Set the parallelism to 1 so tests are executed sequentially
    projects: [
        {
            name: 'Chrome',
            use: {
                browserName: 'chromium',      // Use Chromium browser
                channel: 'chrome',            // Use the Chrome channel
                headless: false,              // Run in visible mode
                viewport: null,               // Disable fixed viewport size
                launchOptions: {
                    args: ['--start-maximized'], // Launch browser maximized
                },
                actionTimeout: 5000,          // Set the timeout for each action to 5 seconds
            },
        },
    ],
    retries: 0, // Maximum number of retries for failures
});
