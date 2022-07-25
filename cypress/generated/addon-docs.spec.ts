import { skipOn } from '@cypress/skip-test';

describe('addon-docs', () => {
  beforeEach(() => {
    cy.visitStorybook();
    cy.navigateToStory('example-button', 'docs');
  });

  skipOn('vue3', () => {
    skipOn('html', () => {
      skipOn('react', () => {
        skipOn('cra', () => {
          skipOn('react_legacy_root_api', () => {
            it('should provide source snippet', () => {
              cy.getDocsElement()
                .find('.docblock-code-toggle')
                .each(($div) => {
                  cy.wrap($div)
                    .should('contain.text', 'Show code')
                    // use force click so cypress does not automatically scroll, making the source block visible on this step
                    .click({ force: true });
                });

              cy.getDocsElement()
                .find('pre.prismjs')
                .each(($div) => {
                  const text = $div.text();
                  expect(text).not.match(/^\(args\) => /);
                });
            });
          });
        });
      });
    });
  });
});
