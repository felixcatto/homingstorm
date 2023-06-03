import messagesFixture from '../../__tests__/fixtures/messages.js';
import usersFixture from '../../__tests__/fixtures/users.js';

describe('messages', () => {
  const [admin] = usersFixture;

  it('should select friend, send some messages, edit them and delete them', () => {
    cy.task('seed', ['messages', messagesFixture]);
    cy.signin(admin);
    cy.getByTestId('messagesNavLink').click();
    cy.getByTestId('messagesUserSelect').click();
    cy.getByTestId('messagesUserSelectPopup').getByTestId('option').eq(2).click();
    cy.getByTestId('messagesInput').as('input').should('exist');

    const message1 = 'hello bro!';
    const message2 = 'how are you?';
    const message2Index = 0;
    cy.get('@input').type(message1).type('{enter}');
    cy.get('@input').type(message2).type('{enter}');
    cy.getByTestId('messagesMessage').as('message').should('have.length', 2);

    cy.get('@message').eq(message2Index).getByTestId('messagesEditMessage').click();
    cy.get('@input').should('have.text', message2);

    const message2EditText = ` (edited)`;
    const message2Edited = `${message2}${message2EditText}`;
    cy.get('@input').type(message2EditText, { force: true }).type('{enter}');
    cy.get('@input').should('have.text', '');
    cy.get('@message')
      .eq(message2Index)
      .getByTestId('messagesMessageText')
      .should('have.text', message2Edited);

    cy.get('@message').eq(1).getByTestId('messagesDeleteMessage').click();
    cy.get('@message').should('have.length', 1);
    cy.get('@message').contains(message1).should('not.exist');
  });
});
