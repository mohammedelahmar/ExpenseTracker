// Critical E2E: register -> login -> dashboard -> add expense -> submit -> verify on dashboard

function uid() {
  return Math.random().toString(36).slice(2, 8);
}

describe('Expense end-to-end flow', () => {
  it('registers, logs in, adds an expense, and verifies it appears', () => {
    const u = uid();
    const email = `user_${u}@test.com`;
    const username = `user_${u}`;
    const password = 'Password123!';
    const desc = `E2E expense ${u}`;

  // Ensure mobile layout so quick action is visible in CI; fallback handled below regardless
  cy.viewport(900, 700);

    // Visit landing and go to register
    cy.visit('/');
    cy.url().should('match', /\/?($|\?)/);
    cy.get('[data-testid="welcome-register"]', { timeout: 20000 })
      .should('exist').and('be.visible')
      .click();

    // Register form
    cy.url().should('include', '/register');
    cy.get('input[name="username"]', { timeout: 20000 }).should('exist').and('be.visible').type(username);
    cy.get('input[name="email"]', { timeout: 20000 }).should('exist').and('be.visible').type(email);
    cy.get('input[name="password"]', { timeout: 20000 }).should('exist').and('be.visible').type(password);
    cy.get('input[name="confirmPassword"]', { timeout: 20000 }).should('exist').and('be.visible').type(password);
    cy.get('[data-testid="register-submit"]', { timeout: 20000 }).should('be.visible').click();

    // Dashboard load
    cy.url({ timeout: 20000 }).should('include', '/dashboard');

    // Navigate to Add Expense: try mobile quick action if visible; otherwise go directly
    cy.get('body').then(($body) => {
      const $btn = $body.find('[data-testid="quick-add-expense"]:visible');
      if ($btn.length) {
        cy.get('[data-testid="quick-add-expense"]').click();
      } else {
        cy.visit('/expenses/add');
      }
    });
    cy.url({ timeout: 20000 }).should('include', '/expenses/add');

    // Fill expense form
    cy.intercept('GET', '**/api/categories').as('getCategories');
    cy.wait('@getCategories', { timeout: 20000 });
    cy.intercept('POST', '**/api/expenses').as('createExpense');
    cy.get('[data-testid="expense-amount"]', { timeout: 20000 }).should('exist').and('be.visible').type('19.99');
    cy.get('[data-testid="expense-description"]', { timeout: 20000 }).should('exist').and('be.visible').type(desc);
    cy.get('[data-testid="expense-category"]', { timeout: 20000 }).should('exist').and('be.visible').then(($sel) => {
      const options = $sel.find('option');
      const value = options.length > 1 ? options.eq(1).val() : 'Other';
      cy.wrap($sel).select(value, { force: true });
    });
    cy.get('[data-testid="expense-submit"]', { timeout: 20000 }).should('be.visible').click();
    cy.wait('@createExpense', { timeout: 20000 }).its('response.statusCode').should('be.oneOf', [200, 201]);

    // Verify presence in dashboard recent expenses (navigate if form does not auto-redirect)
    cy.visit('/dashboard');
    cy.get('[data-testid="recent-expenses"]', { timeout: 20000 }).should('exist').and('be.visible');
    cy.contains(desc, { timeout: 20000 }).should('be.visible');
  });
});
