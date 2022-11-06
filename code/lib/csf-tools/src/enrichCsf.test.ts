/// <reference types="@types/jest" />;
/* eslint-disable no-underscore-dangle */

import { dedent } from 'ts-dedent';
import { loadCsf, formatCsf } from './CsfFile';
import { enrichCsf, extractSource } from './enrichCsf';
import type { EnrichCsfOptions } from './enrichCsf';

expect.addSnapshotSerializer({
  print: (val: any) => val,
  test: (val) => true,
});

const enrich = (code: string, options?: EnrichCsfOptions) => {
  // we don't actually care about the title

  const csf = loadCsf(code, { makeTitle: (userTitle) => userTitle || 'default' }).parse();
  enrichCsf(csf, options);
  return formatCsf(csf);
};

describe('enrichCsf', () => {
  describe('source', () => {
    it('csf1', () => {
      expect(
        enrich(dedent`
          export default {
           title: 'Button',
          }
          export const Basic = () => <Button />
        `)
      ).toMatchInlineSnapshot(`
        export default {
          title: 'Button'
        };
        export const Basic = () => <Button />;
        Basic.parameters = {
          ...Basic.parameters,
          storySource: {
            source: "() => <Button />",
            ...Basic.parameters?.storySource
          }
        };
      `);
    });
    it('csf2', () => {
      expect(
        enrich(dedent`
          export default {
            title: 'Button',
          }
          const Template = (args) => <Button {...args} />
          export const Basic = Template.bind({});
          Basic.parameters = { foo: 'bar' }
        `)
      ).toMatchInlineSnapshot(`
        export default {
          title: 'Button'
        };
        const Template = args => <Button {...args} />;
        export const Basic = Template.bind({});
        Basic.parameters = {
          foo: 'bar'
        };
        Basic.parameters = {
          ...Basic.parameters,
          storySource: {
            source: "args => <Button {...args} />",
            ...Basic.parameters?.storySource
          }
        };
      `);
    });
    it('csf3', () => {
      expect(
        enrich(dedent`
          export default {
            title: 'Button',
          }
          export const Basic = {
            parameters: { foo: 'bar' }
          }
        `)
      ).toMatchInlineSnapshot(`
        export default {
          title: 'Button'
        };
        export const Basic = {
          parameters: {
            foo: 'bar'
          }
        };
        Basic.parameters = {
          ...Basic.parameters,
          storySource: {
            source: "{\\n  parameters: {\\n    foo: 'bar'\\n  }\\n}",
            ...Basic.parameters?.storySource
          }
        };
      `);
    });
    it('multiple stories', () => {
      expect(
        enrich(dedent`
          export default {
            title: 'Button',
          }
          export const A = {}
          export const B = {}
        `)
      ).toMatchInlineSnapshot(`
        export default {
          title: 'Button'
        };
        export const A = {};
        export const B = {};
        A.parameters = {
          ...A.parameters,
          storySource: {
            source: "{}",
            ...A.parameters?.storySource
          }
        };
        B.parameters = {
          ...B.parameters,
          storySource: {
            source: "{}",
            ...B.parameters?.storySource
          }
        };
      `);
    });
  });

  describe('descriptions', () => {
    it('skips inline comments', () => {
      expect(
        enrich(dedent`
          export default {
           title: 'Button',
          }
          // The most basic button
          export const Basic = () => <Button />
        `)
      ).toMatchInlineSnapshot(`
        export default {
          title: 'Button'
        };
        // The most basic button
        export const Basic = () => <Button />;
        Basic.parameters = {
          ...Basic.parameters,
          storySource: {
            source: "() => <Button />",
            ...Basic.parameters?.storySource
          }
        };
      `);
    });

    it('skips blocks without jsdoc', () => {
      expect(
        enrich(dedent`
          export default {
           title: 'Button',
          }
          /* The most basic button */
          export const Basic = () => <Button />
        `)
      ).toMatchInlineSnapshot(`
        export default {
          title: 'Button'
        };
        /* The most basic button */
        export const Basic = () => <Button />;
        Basic.parameters = {
          ...Basic.parameters,
          storySource: {
            source: "() => <Button />",
            ...Basic.parameters?.storySource
          }
        };
      `);
    });

    it('JSDoc single-line', () => {
      expect(
        enrich(dedent`
          export default {
           title: 'Button',
          }
          /** The most basic button */
          export const Basic = () => <Button />
        `)
      ).toMatchInlineSnapshot(`
        export default {
          title: 'Button'
        };
        /** The most basic button */
        export const Basic = () => <Button />;
        Basic.parameters = {
          ...Basic.parameters,
          storySource: {
            source: "() => <Button />",
            ...Basic.parameters?.storySource
          },
          docs: {
            ...Basic.parameters?.docs,
            description: {
              story: "The most basic button",
              ...Basic.parameters?.docs?.description
            }
          }
        };
      `);
    });

    it('JSDoc multi-line', () => {
      expect(
        enrich(dedent`
          export default {
           title: 'Button',
          }
          /**
           * The most basic button
           * 
           * In a block!
           */
          export const Basic = () => <Button />
        `)
      ).toMatchInlineSnapshot(`
        export default {
          title: 'Button'
        };
        /**
         * The most basic button
         * 
         * In a block!
         */
        export const Basic = () => <Button />;
        Basic.parameters = {
          ...Basic.parameters,
          storySource: {
            source: "() => <Button />",
            ...Basic.parameters?.storySource
          },
          docs: {
            ...Basic.parameters?.docs,
            description: {
              story: "The most basic button\\n\\nIn a block!",
              ...Basic.parameters?.docs?.description
            }
          }
        };
      `);
    });

    it('preserves indentation', () => {
      expect(
        enrich(dedent`
          export default {
           title: 'Button',
          }
          /**
           * - A bullet list
           *   - A sub-bullet
           * - A second bullet
           */
          export const Basic = () => <Button />
        `)
      ).toMatchInlineSnapshot(`
        export default {
          title: 'Button'
        };
        /**
         * - A bullet list
         *   - A sub-bullet
         * - A second bullet
         */
        export const Basic = () => <Button />;
        Basic.parameters = {
          ...Basic.parameters,
          storySource: {
            source: "() => <Button />",
            ...Basic.parameters?.storySource
          },
          docs: {
            ...Basic.parameters?.docs,
            description: {
              story: "- A bullet list\\n  - A sub-bullet\\n- A second bullet",
              ...Basic.parameters?.docs?.description
            }
          }
        };
      `);
    });
  });

  describe('options', () => {
    it('disableSource', () => {
      expect(
        enrich(
          dedent`
          export default {
           title: 'Button',
          }
          /** The most basic button */
          export const Basic = () => <Button />
        `,
          { disableSource: true }
        )
      ).toMatchInlineSnapshot(`
        export default {
          title: 'Button'
        };
        /** The most basic button */
        export const Basic = () => <Button />;
        Basic.parameters = {
          ...Basic.parameters,
          docs: {
            ...Basic.parameters?.docs,
            description: {
              story: "The most basic button",
              ...Basic.parameters?.docs?.description
            }
          }
        };
      `);
    });

    it('disableDescription', () => {
      expect(
        enrich(
          dedent`
          export default {
           title: 'Button',
          }
          /** The most basic button */
          export const Basic = () => <Button />
        `,
          { disableDescription: true }
        )
      ).toMatchInlineSnapshot(`
        export default {
          title: 'Button'
        };
        /** The most basic button */
        export const Basic = () => <Button />;
        Basic.parameters = {
          ...Basic.parameters,
          storySource: {
            source: "() => <Button />",
            ...Basic.parameters?.storySource
          }
        };
      `);
    });

    it('disable all', () => {
      expect(
        enrich(
          dedent`
          export default {
           title: 'Button',
          }
          /** The most basic button */
          export const Basic = () => <Button />
        `,
          { disableSource: true, disableDescription: true }
        )
      ).toMatchInlineSnapshot(`
        export default {
          title: 'Button'
        };
        /** The most basic button */
        export const Basic = () => <Button />;
      `);
    });
  });
});

const source = (csfExport: string) => {
  const code = dedent`
    export default { title: 'Button' }
    ${csfExport}
  `;
  const csf = loadCsf(code, { makeTitle: (userTitle) => userTitle }).parse();
  const exportNode = Object.values(csf._storyExports)[0];
  return extractSource(exportNode);
};

describe('extractSource', () => {
  it('csf1', () => {
    expect(
      source(dedent`
        export const Basic = () => <Button />
      `)
    ).toMatchInlineSnapshot(`() => <Button />`);
  });
  it('csf2', () => {
    expect(
      source(dedent`
        export const Basic =  (args) => <Button {...args} />;
      `)
    ).toMatchInlineSnapshot(`args => <Button {...args} />`);
  });
  it('csf3', () => {
    expect(
      source(dedent`
        export const Basic = {
          parameters: { foo: 'bar' }
        }
      `)
    ).toMatchInlineSnapshot(`
      {
        parameters: {
          foo: 'bar'
        }
      }
    `);
  });
});
