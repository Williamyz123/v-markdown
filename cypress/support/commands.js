// cypress/support/commands.js
/* eslint-disable no-undef */
Cypress.Commands.add('typeMarkdown', (content) => {
  cy.get('.edit-area textarea').type(content)
})
