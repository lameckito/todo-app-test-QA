
// Login command with error handling
Cypress.Commands.add('loginWithErrorHandling', (username, password, shouldSucceed = true) => {
  cy.visit('/');
  cy.get('[data-testid="username-input"]').clear().type(username);
  cy.get('[data-testid="password-input"]').clear().type(password);
  cy.get('[data-testid="login-button"]').click();
  
  if (shouldSucceed) {
    cy.contains(`Welcome, ${username}!`).should('be.visible');
    cy.url().should('eq', Cypress.config('baseUrl') + '/');
  } else {
    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.get('[data-testid="login-form"]').should('be.visible');
  }
});

// Advanced todo management commands
Cypress.Commands.add('createTodoWithValidation', (title, shouldSucceed = true) => {
  const todoCountBefore = Cypress.$('[data-testid^="todo-item-"]').length;
  
  cy.get('[data-testid="new-todo-input"]').clear().type(title);
  cy.get('[data-testid="add-todo-button"]').click();
  
  if (shouldSucceed) {
    cy.contains(title).should('be.visible');
    cy.get('[data-testid^="todo-item-"]').should('have.length', todoCountBefore + 1);
    cy.get('[data-testid="new-todo-input"]').should('have.value', '');
  } else {
    cy.get('[data-testid="error-message"]').should('be.visible');
  }
});

Cypress.Commands.add('editTodoWithValidation', (oldTitle, newTitle, shouldSucceed = true) => {
  cy.contains(oldTitle).parents('[data-testid^="todo-item-"]').within(() => {
    cy.get('[data-testid^="edit-button-"]').click();
    cy.get('[data-testid^="edit-todo-input-"]').should('be.visible').clear().type(newTitle);
    
    if (shouldSucceed) {
      cy.get('[data-testid^="save-edit-button-"]').click();
      cy.get('[data-testid^="todo-title-"]').should('contain', newTitle);
      cy.get('[data-testid^="edit-todo-input-"]').should('not.exist');
    } else {
      cy.get('[data-testid^="save-edit-button-"]').click();
      cy.get('[data-testid="error-message"]').should('be.visible');
    }
  });
});

Cypress.Commands.add('deleteTodoWithConfirmation', (title, confirm = true) => {
  // Stub the window.confirm method
  cy.window().then((win) => {
    cy.stub(win, 'confirm').returns(confirm);
  });
  
  cy.contains(title).parents('[data-testid^="todo-item-"]').within(() => {
    cy.get('[data-testid^="delete-button-"]').click();
  });
  
  if (confirm) {
    cy.contains(title).should('not.exist');
  } else {
    cy.contains(title).should('exist');
  }
});

// Batch operations
Cypress.Commands.add('createMultipleTodos', (titles) => {
  titles.forEach((title) => {
    cy.createTodo(title);
  });
});

Cypress.Commands.add('deleteAllTestTodos', () => {
  cy.get('[data-testid^="todo-item-"]').each(($todo) => {
    const title = $todo.find('[data-testid^="todo-title-"]').text();
    if (title.includes('Test') || title.includes('Cypress') || title.includes('E2E')) {
      cy.wrap($todo).within(() => {
        // Stub confirm for cleanup
        cy.window().then((win) => {
          cy.stub(win, 'confirm').returns(true);
        });
        cy.get('[data-testid^="delete-button-"]').click();
      });
    }
  });
});

// State verification commands
Cypress.Commands.add('verifyTodoState', (title, shouldBeCompleted) => {
  cy.contains(title).parents('[data-testid^="todo-item-"]').within(() => {
    if (shouldBeCompleted) {
      cy.get('[data-testid^="todo-checkbox-"]').should('be.checked');
      cy.get('[data-testid^="todo-title-"]').should('have.class', 'line-through');
    } else {
      cy.get('[data-testid^="todo-checkbox-"]').should('not.be.checked');
      cy.get('[data-testid^="todo-title-"]').should('not.have.class', 'line-through');
    }
  });
});

Cypress.Commands.add('verifyTodoCount', (expectedCount) => {
  cy.get('[data-testid^="todo-item-"]').should('have.length', expectedCount);
});

Cypress.Commands.add('verifyNoTodos', () => {
  cy.get('[data-testid="no-todos-message"]').should('be.visible');
  cy.get('[data-testid^="todo-item-"]').should('not.exist');
});

// Authentication state commands
Cypress.Commands.add('verifyLoggedIn', (username) => {
  cy.contains(`Welcome, ${username}!`).should('be.visible');
  cy.get('[data-testid="logout-button"]').should('be.visible');
  cy.get('[data-testid="login-form"]').should('not.exist');
});

Cypress.Commands.add('verifyLoggedOut', () => {
  cy.get('[data-testid="login-form"]').should('be.visible');
  cy.contains('Todo App Login').should('be.visible');
  cy.get('[data-testid="logout-button"]').should('not.exist');
});

// API interaction commands
Cypress.Commands.add('interceptLogin', (fixture = null, statusCode = 200) => {
  const response = fixture ? { fixture } : { 
    statusCode,
    body: statusCode === 200 ? {
      token: 'fake-jwt-token',
      user: { id: 1, username: 'admin' },
      message: 'Login successful'
    } : { error: 'Invalid credentials' }
  };
  
  cy.intercept('POST', '**/api/login', response).as('loginRequest');
});

Cypress.Commands.add('interceptTodos', (fixture = null, statusCode = 200) => {
  const response = fixture ? { fixture } : {
    statusCode,
    body: statusCode === 200 ? [] : { error: 'Failed to fetch todos' }
  };
  
  cy.intercept('GET', '**/api/items', response).as('getTodos');
});

Cypress.Commands.add('interceptCreateTodo', (statusCode = 201) => {
  const response = {
    statusCode,
    body: statusCode === 201 ? {
      id: Date.now(),
      title: 'New Todo',
      completed: false,
      userId: 1
    } : { error: 'Failed to create todo' }
  };
  
  cy.intercept('POST', '**/api/items', response).as('createTodo');
});

// Form interaction helpers
Cypress.Commands.add('fillLoginForm', (username, password) => {
  cy.get('[data-testid="username-input"]').clear().type(username);
  cy.get('[data-testid="password-input"]').clear().type(password);
});

Cypress.Commands.add('submitLoginForm', () => {
  cy.get('[data-testid="login-button"]').click();
});

Cypress.Commands.add('fillTodoForm', (title) => {
  cy.get('[data-testid="new-todo-input"]').clear().type(title);
});

Cypress.Commands.add('submitTodoForm', () => {
  cy.get('[data-testid="add-todo-button"]').click();
});

// Keyboard interaction commands
Cypress.Commands.add('submitWithEnter', (selector) => {
  cy.get(selector).type('{enter}');
});

Cypress.Commands.add('cancelWithEscape', (selector) => {
  cy.get(selector).type('{escape}');
});

// Accessibility commands (requires cypress-axe)
Cypress.Commands.add('checkAccessibility', (context = null, options = null) => {
  cy.injectAxe();
  cy.checkA11y(context, options, (violations) => {
    if (violations.length > 0) {
      cy.log(`Found ${violations.length} accessibility violations:`);
      violations.forEach((violation, index) => {
        cy.log(`${index + 1}. ${violation.description}`);
        cy.log(`   Impact: ${violation.impact}`);
        cy.log(`   Tags: ${violation.tags.join(', ')}`);
      });
    }
  });
});

// Mobile-specific commands
Cypress.Commands.add('swipeLeft', (selector) => {
  cy.get(selector)
    .trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
    .trigger('touchmove', { touches: [{ clientX: 50, clientY: 100 }] })
    .trigger('touchend');
});

Cypress.Commands.add('swipeRight', (selector) => {
  cy.get(selector)
    .trigger('touchstart', { touches: [{ clientX: 50, clientY: 100 }] })
    .trigger('touchmove', { touches: [{ clientX: 100, clientY: 100 }] })
    .trigger('touchend');
});

// Loading state verification
Cypress.Commands.add('verifyLoadingState', (buttonSelector, loadingText) => {
  cy.get(buttonSelector).should('contain', loadingText);
  cy.get(buttonSelector).should('be.disabled');
});

Cypress.Commands.add('waitForLoadingToComplete', (buttonSelector, originalText) => {
  cy.get(buttonSelector).should('not.contain', 'Loading');
  cy.get(buttonSelector).should('contain', originalText);
  cy.get(buttonSelector).should('not.be.disabled');
});

// Error handling commands
Cypress.Commands.add('verifyErrorMessage', (expectedMessage) => {
  cy.get('[data-testid="error-message"]').should('be.visible');
  cy.get('[data-testid="error-message"]').should('contain', expectedMessage);
});

Cypress.Commands.add('clearErrorMessage', () => {
  cy.get('[data-testid="error-message"]').should('not.exist');
});

// Session management
Cypress.Commands.add('preserveSession', (username, password) => {
  cy.session([username, password], () => {
    cy.visit('/');
    cy.fillLoginForm(username, password);
    cy.submitLoginForm();
    cy.verifyLoggedIn(username);
  });
});

// Database/API cleanup (for test isolation)
Cypress.Commands.add('resetUserData', (username = 'admin') => {
  cy.apiLogin(username, 'password').then((token) => {
    // Get all todos for the user
    cy.request({
      method: 'GET',
      url: 'http://localhost:5000/api/items',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then((response) => {
      // Delete all test-related todos
      response.body.forEach((todo) => {
        if (todo.title.includes('Test') || todo.title.includes('Cypress') || todo.title.includes('E2E')) {
          cy.request({
            method: 'DELETE',
            url: `http://localhost:5000/api/items/${todo.id}`,
            headers: { 'Authorization': `Bearer ${token}` },
            failOnStatusCode: false
          });
        }
      });
    });
  });
});

// Performance monitoring
Cypress.Commands.add('measureLoadTime', () => {
  cy.window().then((win) => {
    const loadTime = win.performance.timing.loadEventEnd - win.performance.timing.navigationStart;
    cy.log(`Page load time: ${loadTime}ms`);
    expect(loadTime).to.be.lessThan(5000); // Assert load time is under 5 seconds
  });
});

// Custom wait commands
Cypress.Commands.add('waitForApiCall', (alias, timeout = 10000) => {
  cy.wait(alias, { timeout });
});

Cypress.Commands.add('waitForCondition', (conditionFn, timeout = 10000) => {
  cy.waitUntil(conditionFn, {
    timeout,
    interval: 100,
    errorMsg: 'Condition was not met within timeout'
  });
});

// Screenshot and reporting helpers
Cypress.Commands.add('takeScreenshotOnFailure', (testName) => {
  cy.screenshot(`failure-${testName}-${Date.now()}`);
});

Cypress.Commands.add('addTestContext', (context) => {
  cy.log(`Test Context: ${JSON.stringify(context)}`);
});