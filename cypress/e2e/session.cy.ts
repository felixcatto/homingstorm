import cookie from 'cookie';
import usersFixture from '../../__tests__/fixtures/users.js';
import { getApiUrl } from '../support/utils';

describe('session', () => {
  const [admin] = usersFixture;

  it('should allow SignIn', () => {
    cy.visitHomePage();
    cy.intercept('post', getApiUrl('session')).as('signInRequest');
    cy.getByTestId('signInLink').click();
    cy.getByTestId('email').clear().type(admin.email);
    cy.getByTestId('password').clear().type(admin.password);
    cy.location('pathname');
    cy.getByTestId('signInFormSubmit').click();

    cy.location('pathname').should('eq', '/');
    cy.getByTestId('userName').should('text', admin.name);
    cy.wait('@signInRequest')
      .its('response.headers.set-cookie')
      .should('an', 'array')
      .and('lengthOf', 1);
  });

  it('should allow SignOut', () => {
    cy.signin(admin);
    cy.intercept('delete', getApiUrl('session')).as('signOutRequest');
    cy.getByTestId('signOutLink').click();

    cy.getByTestId('userName').should('not.exist');
    cy.wait('@signOutRequest')
      .its('response.headers.set-cookie')
      .should('an', 'array')
      .and('lengthOf', 1)
      .and(cookies => {
        const parsedCookie = cookie.parse(cookies[0]);
        expect(parsedCookie['session']).to.eq('');
        expect(parsedCookie['Max-Age']).to.eq('0');
      });
  });
});
