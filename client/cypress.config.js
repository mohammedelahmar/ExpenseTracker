const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
  defaultCommandTimeout: 15000,
  pageLoadTimeout: 90000,
  requestTimeout: 20000,
  responseTimeout: 20000,
  retries: { runMode: 2, openMode: 0 },
  chromeWebSecurity: false,
  video: false,
  // Ensure mobile quick action button is visible in CI
  viewportWidth: 900,
  viewportHeight: 700
  }
});
