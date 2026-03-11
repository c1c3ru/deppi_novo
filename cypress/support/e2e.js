import './commands';

// Add custom commands here
Cypress.Commands.add('login', (registration, password) => {
  cy.visit('/boletins/login');
  cy.get('[data-cy="registration-input"]').type(registration);
  cy.get('[data-cy="password-input"]').type(password);
  cy.get('[data-cy="submit-button"]').click();
});
