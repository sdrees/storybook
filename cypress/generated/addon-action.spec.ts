import { visit, clickAddon } from '../helper';

describe('addon-action', () => {
  before(() => {
    visit();
    cy.get('#button').click();
  });

  it('should trigger an action', () => {
    // click on the button
    cy.get('#button--text-with-action').click();

    // assert url changes
    cy.url().should('include', 'path=/story/button--text-with-action');

    // check for selected element
    cy.get('#button--text-with-action').should('have.class', 'selected');

    // check for content
    cy.getStoryElement().contains('Trigger Action').click();

    // click on addon
    clickAddon('Actions');

    // TODO @yannbf improve tab identifier on addons
    // get the logs
    cy.get('#storybook-panel-root')
      .contains(/This was clicked/)
      .should('be.visible');
  });
});
