/// <reference types="@types/jest" />;

import { dedent } from 'ts-dedent';
import { fixMdxScript } from './mdx-1-to-2';

describe('fix', () => {
  it('fixes badly-formatted style blocks', () => {
    expect(
      fixMdxScript(dedent`
        <style>{\`
          .foo {}
        
          .bar {}
        \`}</style>
      `)
    ).toEqual(dedent`
      <style>
        {\`
        .foo {}

        .bar {}
        \`}
      </style>
    `);
  });

  it('fixes multiple style blocks', () => {
    expect(
      fixMdxScript(dedent`
        <style>{\`
          .foo {}
        \`}</style>
        <style>{\`
          .bar {}
        \`}</style>
      `)
    ).toMatchInlineSnapshot(`
      <style>
        {\`
        .foo {}
        \`}
      </style>
      <style>
        {\`
        .bar {}
        \`}
      </style>
    `);
  });
});
