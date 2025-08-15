const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 60000,
    retries: { runMode: 2, openMode: 0 },
  video: false,
  // Ensure mobile quick action button is visible in CI
  viewportWidth: 900,
  viewportHeight: 700
  }
});
