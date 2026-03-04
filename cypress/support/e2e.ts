import './commands';

// Add custom commands here
declare global {
  namespace Cypress {
    interface Chainable {
      login(registration: string, password: string): void;
    }
  }
}

Cypress.Commands.add('login', (registration: string, password: string) => {
  cy.visit('/boletins/login');
  cy.get('[data-cy="registration-input"]').type(registration);
  cy.get('[data-cy="password-input"]').type(password);
  cy.get('[data-cy="submit-button"]').click();
});
