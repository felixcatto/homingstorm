import { getApiUrl } from './utils';

Cypress.Commands.add('getByTestId', { prevSubject: 'optional' }, (subject, testId) => {
  return subject
    ? cy.wrap(subject).find(`[data-test='${testId}']`)
    : cy.get(`[data-test='${testId}']`);
});

Cypress.Commands.add('visitHomePage', { prevSubject: 'optional' }, () => {
  cy.intercept({ url: '/_next/**' }, { log: false });
  return cy.visit('/').wait(100);
});

Cypress.Commands.add('signin', user => {
  cy.session(user.name, () => {
    console.log(`signin as ${user.name}`);
    cy.visit('/');
    cy.request('post', getApiUrl('session'), user);
  });
  cy.visitHomePage();
});

declare global {
  namespace Cypress {
    interface Chainable {
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
      visitHomePage(): Chainable<any>;
      signin(user): Chainable<any>;

      task(event: 'seed', arg, options?: Partial<Loggable & Timeoutable>): any;
    }
  }
}

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }
