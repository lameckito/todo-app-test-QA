// cypress/support/e2e.js

// ✅ Import all custom commands (defined in commands.js)
import './commands';

// ✅ Global exception handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing tests on unexpected app exceptions
  console.error('Uncaught exception:', err);
  return false;
});
