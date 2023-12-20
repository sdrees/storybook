/* eslint-disable no-underscore-dangle */
import { dedent } from 'ts-dedent';
import { describe, it, expect, vi } from 'vitest';
import yaml from 'js-yaml';
import { loadCsf } from './CsfFile';

expect.addSnapshotSerializer({
  print: (val: any) => yaml.dump(typeof val === 'string' ? val : val.toString()).trimEnd(),
  test: (val) => typeof val !== 'string',
});

const makeTitle = (userTitle?: string) => {
  return userTitle || 'Default Title';
};

const parse = (code: string, includeParameters?: boolean) => {
  const { stories, meta } = loadCsf(code, { makeTitle }).parse();
  const filtered = includeParameters ? stories : stories.map(({ parameters, ...rest }) => rest);
  return { meta, stories: filtered };
};

//

describe('CsfFile', () => {
  describe('basic', () => {
    it('args stories', () => {
      expect(
        parse(
          dedent`
          export default { title: 'foo/bar' };
          export const A = () => {};
          export const B = (args) => {};
        `,
          true
        )
      ).toMatchInlineSnapshot(`'[object Object]'`);
    });

    it('exported const stories', () => {
      expect(
        parse(
          dedent`
          export default { title: 'foo/bar' };
          const A = () => {};
          const B = (args) => {};
          export { A, B };
        `,
          true
        )
      ).toMatchInlineSnapshot(`'[object Object]'`);
    });

    it('underscores', () => {
      expect(
        parse(
          dedent`
          export default { title: 'foo/bar' };
          export const __Basic__ = () => {};
        `,
          true
        )
      ).toMatchInlineSnapshot(`'[object Object]'`);
    });

    it('exclude stories', () => {
      expect(
        parse(
          dedent`
          export default { title: 'foo/bar', excludeStories: ['B', 'C'] };
          export const A = () => {};
          export const B = (args) => {};
          export const C = () => {};
        `
        )
      ).toMatchInlineSnapshot(`'[object Object]'`);
    });

    it('include stories', () => {
      expect(
        parse(
          dedent`
          export default { title: 'foo/bar', includeStories: ['IncludeA'] };
          export const SomeHelper = () => {};
          export const IncludeA = () => {};
        `
        )
      ).toMatchInlineSnapshot(`'[object Object]'`);
    });

    it('storyName annotation', () => {
      expect(
        parse(
          dedent`
          export default { title: 'foo/bar' };
          export const A = () => {};
          A.storyName = 'Some story';
      `
        )
      ).toMatchInlineSnapshot(`'[object Object]'`);
    });

    it('no title', () => {
      expect(
        parse(
          dedent`
          export default { component: 'foo' }
          export const A = () => {};
          export const B = () => {};
      `
        )
      ).toMatchInlineSnapshot(`'[object Object]'`);
    });

    it('custom component id', () => {
      expect(
        parse(
          dedent`
          export default { title: 'foo/bar', id: 'custom-id' };
          export const A = () => {};
          export const B = () => {};
      `
        )
      ).toMatchInlineSnapshot(`'[object Object]'`);
    });

    it('custom parameters.__id', () => {
      expect(
        parse(
          dedent`
          export default { title: 'foo/bar', id: 'custom-meta-id' };
          export const JustCustomMetaId = {};
          export const CustomParemetersId = { parameters: { __id: 'custom-id' } };
      `
        )
      ).toMatchInlineSnapshot(`'[object Object]'`);
    });

    it('typescript', () => {
      expect(
        parse(
          dedent`
          import type { Meta, StoryFn } from '@storybook/react';
          type PropTypes = {};
          export default { title: 'foo/bar/baz' } as Meta<PropTypes>;
          export const A: StoryFn<PropTypes> = () => <>A</>;
          export const B: StoryFn<PropTypes> = () => <>B</>;
        `
        )
      ).toMatchInlineSnapshot(`'[object Object]'`);
    });

    it('typescript satisfies', () => {
      expect(
        parse(
          dedent`
          import type { Meta, StoryFn, StoryObj } from '@storybook/react';
          type PropTypes = {};
          export default { title: 'foo/bar' } satisfies Meta<PropTypes>;
          export const A = { name: 'AA' } satisfies StoryObj<PropTypes>;
          export const B = ((args) => {}) satisfies StoryFn<PropTypes>;
        `,
          true
        )
      ).toMatchInlineSnapshot(`'[object Object]'`);
    });

    it('typescript as', () => {
      expect(
        parse(
          dedent`
          import type { Meta, StoryFn, StoryObj } from '@storybook/react';
          type PropTypes = {};
          export default { title: 'foo/bar' } as Meta<PropTypes>;
          export const A = { name: 'AA' } as StoryObj<PropTypes>;
          export const B = ((args) => {}) as StoryFn<PropTypes>;
        `,
          true
        )
      ).toMatchInlineSnapshot(`'[object Object]'`);
    });

    it('typescript meta var', () => {
      expect(
        parse(
          dedent`
          import type { Meta, StoryFn } from '@storybook/react';
          type PropTypes = {};
          const meta = { title: 'foo/bar/baz' } as Meta<PropTypes>;
          export default meta;
          export const A: StoryFn<PropTypes> = () => <>A</>;
          export const B: StoryFn<PropTypes> = () => <>B</>;
        `
        )
      ).toMatchInlineSnapshot(`'[object Object]'`);
    });

    it('typescript satisfies meta var', () => {
      expect(
        parse(
          dedent`
          import type { Meta, StoryFn } from '@storybook/react';
          type PropTypes = {};
          const meta = { title: 'foo/bar/baz' } satisfies Meta<PropTypes>;
          export default meta;
          export const A: StoryFn<PropTypes> = () => <>A</>;
          export const B: StoryFn<PropTypes> = () => <>B</>;
        `
        )
      ).toMatchInlineSnapshot(`'[object Object]'`);
    });

    it('component object', () => {
      expect(
        parse(
          dedent`
          export default { component: {} }
          export const A = () => {};
          export const B = () => {};
      `
        )
      ).toMatchInlineSnapshot(`'[object Object]'`);
    });

    it('template bind', () => {
      expect(
        parse(
          dedent`
          export default { title: 'foo/bar' };
          const Template = (args) => { };
          export const A = Template.bind({});
          A.args = { x: 1 };
        `,
          true
        )
      ).toMatchInlineSnapshot(`'[object Object]'`);
    });

    it('meta variable', () => {
      expect(
        parse(
          dedent`
          const meta = { title: 'foo/bar' };
          export default meta;
          export const A = () => {}
        `,
          true
        )
      ).toMatchInlineSnapshot(`'[object Object]'`);
    });

    it('docs-only story', () => {
      expect(
        parse(
          dedent`
          export default { title: 'foo/bar' };
          export const __page = () => {};
          __page.parameters = { docsOnly: true };
        `,
          true
        )
      ).toMatchInlineSnapshot(`'[object Object]'`);
    });

    it('docs-only story with local vars', () => {
      expect(
        parse(
          dedent`
            export const TestControl = () => _jsx("p", {
              children: "Hello"
            });
            export default { title: 'foo/bar', tags: ['stories-mdx'], includeStories: ["__page"] };
            export const __page = () => {};
            __page.parameters = { docsOnly: true };
          `,
          true
        )
      ).toMatchInlineSnapshot(`'[object Object]'`);
    });

    it('title variable', () => {
      expect(
        parse(
          dedent`
            const title = 'foo/bar';
            export default { title };
            export const A = () => {};
            export const B = (args) => {};
        `,
          true
        )
      ).toMatchInlineSnapshot(`'[object Object]'`);
    });

    it('re-exported stories', () => {
      expect(
        parse(
          dedent`
          export default { title: 'foo/bar' };
          export { default as A } from './A';
          export { B } from './B';
        `
        )
      ).toMatchInlineSnapshot(`'[object Object]'`);
    });

    it('named exports order', () => {
      expect(
        parse(
          dedent`
          export default { title: 'foo/bar' };
          export const A = () => {};
          export const B = (args) => {};
          export const __namedExportsOrder = ['B', 'A'];
        `,
          true
        )
      ).toMatchInlineSnapshot(`'[object Object]'`);
    });

    it('as default export', () => {
      expect(
        parse(
          dedent`
          const meta = { title: 'foo/bar' };
          export const A = () => {};
          export {
            meta as default,
            A
          };
        `,
          true
        )
      ).toMatchInlineSnapshot(`'[object Object]'`);
    });

    it('support for parameter decorators', () => {
      expect(
        parse(dedent`
        import { Component, Input, Output, EventEmitter, Inject, HostBinding } from '@angular/core';
        import { CHIP_COLOR } from './chip-color.token';

        @Component({
          selector: 'storybook-chip',
        })
        export class ChipComponent {
          // The error occurs on the Inject decorator used on a parameter
          constructor(@Inject(CHIP_COLOR) chipColor: string) {
            this.backgroundColor = chipColor;
          }
        }

        export default {
          title: 'Chip',
        }
      `)
      ).toMatchInlineSnapshot(`'[object Object]'`);
    });
  });

  describe('error handling', () => {
    it('no meta', () => {
      expect(() =>
        parse(
          dedent`
          export const A = () => {};
          export const B = () => {};
      `
        )
      ).toThrow('CSF: missing default export');
    });

    it('bad meta', () => {
      expect(() =>
        parse(
          dedent`
          const foo = bar();
          export default foo;
          export const A = () => {};
          export const B = () => {};
      `
        )
      ).toThrow('CSF: default export must be an object');
    });

    it('no metadata', () => {
      expect(() =>
        parse(
          dedent`
          export default { foo: '5' };
          export const A = () => {};
          export const B = () => {};
      `
        )
      ).toThrow('CSF: missing title/component');
    });

    it('dynamic titles', () => {
      expect(() =>
        parse(
          dedent`
            export default { title: 'foo' + 'bar' };
            export const A = () => {};
        `,
          true
        )
      ).toThrow('CSF: unexpected dynamic title');
    });

    it('storiesOf calls', () => {
      expect(() =>
        parse(
          dedent`
            import { storiesOf } from '@storybook/react';
            export default { title: 'foo/bar' };
            export const A = () => {};
            storiesOf('foo').add('bar', () => <baz />);
        `,
          true
        )
      ).toThrow('Unexpected `storiesOf` usage:');
    });

    it('function exports', () => {
      expect(
        parse(
          dedent`
          export default { title: 'foo/bar' };
          export function A() {}
          export function B() {}
      `
        )
      ).toMatchInlineSnapshot(`'[object Object]'`);
    });
  });

  // NOTE: this does not have a public API, but we can still test it
  describe('indexed annotations', () => {
    it('meta annotations', () => {
      const input = dedent`
        export default { title: 'foo/bar', x: 1, y: 2 };
      `;
      const csf = loadCsf(input, { makeTitle }).parse();
      expect(Object.keys(csf._metaAnnotations)).toEqual(['title', 'x', 'y']);
    });

    it('story annotations', () => {
      const input = dedent`
        export default { title: 'foo/bar' };
        export const A = () => {};
        A.x = 1;
        A.y = 2;
        export const B = () => {};
        B.z = 3;
    `;
      const csf = loadCsf(input, { makeTitle }).parse();
      expect(Object.keys(csf._storyAnnotations.A)).toEqual(['x', 'y']);
      expect(Object.keys(csf._storyAnnotations.B)).toEqual(['z']);
    });

    it('v1-style story annotations', () => {
      const input = dedent`
        export default { title: 'foo/bar' };
        export const A = () => {};
        A.story = {
          x: 1,
          y: 2,
        }
        export const B = () => {};
        B.story = {
          z: 3,
        }
    `;
      const csf = loadCsf(input, { makeTitle }).parse();
      expect(Object.keys(csf._storyAnnotations.A)).toEqual(['x', 'y']);
      expect(Object.keys(csf._storyAnnotations.B)).toEqual(['z']);
    });
  });

  describe('CSF3', () => {
    it('Object export with no-args render', () => {
      expect(
        parse(
          dedent`
          export default { title: 'foo/bar' };
          export const A = {
            render: () => {}
          }
        `,
          true
        )
      ).toMatchInlineSnapshot(`'[object Object]'`);
    });

    it('Object export with args render', () => {
      expect(
        parse(
          dedent`
          export default { title: 'foo/bar' };
          export const A = {
            render: (args) => {}
          }
        `,
          true
        )
      ).toMatchInlineSnapshot(`'[object Object]'`);
    });

    it('Object export with default render', () => {
      expect(
        parse(
          dedent`
          export default { title: 'foo/bar' };
          export const A = {}
        `,
          true
        )
      ).toMatchInlineSnapshot(`'[object Object]'`);
    });

    it('Object export with name', () => {
      expect(
        parse(
          dedent`
          export default { title: 'foo/bar' };
          export const A = {
            name: 'Apple'
          }
        `,
          true
        )
      ).toMatchInlineSnapshot(`'[object Object]'`);
    });

    it('Object export with storyName', () => {
      const consoleWarnMock = vi.spyOn(console, 'warn').mockImplementation(() => {});

      parse(
        dedent`
        export default { title: 'foo/bar' };
        export const A = {
          storyName: 'Apple'
        }
      `,
        true
      );

      expect(consoleWarnMock).toHaveBeenCalledWith(
        'Unexpected usage of "storyName" in "A". Please use "name" instead.'
      );
      consoleWarnMock.mockRestore();
    });
  });

  describe('import handling', () => {
    it('imports', () => {
      const input = dedent`
        import Button from './Button';
        import { Check } from './Check';
        export default { title: 'foo/bar', x: 1, y: 2 };
      `;
      const csf = loadCsf(input, { makeTitle }).parse();
      expect(csf.imports).toMatchInlineSnapshot(`./Button,./Check`);
    });
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('dynamic imports', () => {
      const input = dedent`
        const Button = await import('./Button');
        export default { title: 'foo/bar', x: 1, y: 2 };
      `;
      const csf = loadCsf(input, { makeTitle }).parse();
      expect(csf.imports).toMatchInlineSnapshot();
    });
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('requires', () => {
      const input = dedent`
        const Button = require('./Button');
        export default { title: 'foo/bar', x: 1, y: 2 };
      `;
      const csf = loadCsf(input, { makeTitle }).parse();
      expect(csf.imports).toMatchInlineSnapshot();
    });
  });

  describe('tags', () => {
    it('csf2', () => {
      expect(
        parse(
          dedent`
          export default { title: 'foo/bar', tags: ['X'] };
          export const A = () => {};
          A.tags = ['Y'];
        `
        )
      ).toMatchInlineSnapshot(`'[object Object]'`);
    });

    it('csf3', () => {
      expect(
        parse(
          dedent`
          export default { title: 'foo/bar', tags: ['X'] };
          export const A = {
            render: () => {},
            tags: ['Y'],
          };
        `
        )
      ).toMatchInlineSnapshot(`'[object Object]'`);
    });

    it('variables', () => {
      expect(
        parse(
          dedent`
          const x = ['X'];
          const y = ['Y'];
          export default { title: 'foo/bar', tags: x };
          export const A = {
            render: () => {},
            tags: y,
          };
        `
        )
      ).toMatchInlineSnapshot(`'[object Object]'`);
    });

    it('array error', () => {
      expect(() =>
        parse(
          dedent`
            export default { title: 'foo/bar', tags: 'X' };
            export const A = {
              render: () => {},
            };
          `
        )
      ).toThrow('CSF: Expected tags array');
    });

    it('array element handling', () => {
      expect(() =>
        parse(
          dedent`
            export default { title: 'foo/bar', tags: [10] };
            export const A = {
              render: () => {},
            };
          `
        )
      ).toThrow('CSF: Expected tag to be string literal');
    });
  });

  describe('play functions', () => {
    it('story csf2', () => {
      expect(
        parse(
          dedent`
          export default { title: 'foo/bar', tags: ['X'] };
          export const A = () => {};
          A.play = () => {};
          A.tags = ['Y'];
        `
        )
      ).toMatchInlineSnapshot(`'[object Object]'`);
    });

    it('story csf3', () => {
      expect(
        parse(
          dedent`
          export default { title: 'foo/bar', tags: ['X'] };
          export const A = {
            render: () => {},
            play: () => {},
            tags: ['Y'],
          };
        `
        )
      ).toMatchInlineSnapshot(`'[object Object]'`);
    });

    it('meta csf2', () => {
      expect(
        parse(
          dedent`
          export default { title: 'foo/bar', play: () => {}, tags: ['X'] };
          export const A = {
            render: () => {},
            tags: ['Y'],
          };
        `
        )
      ).toMatchInlineSnapshot(`'[object Object]'`);
    });

    it('meta csf3', () => {
      expect(
        parse(
          dedent`
          export default { title: 'foo/bar', play: () => {}, tags: ['X'] };
          export const A = () => {};
          A.tags = ['Y'];
        `
        )
      ).toMatchInlineSnapshot(`'[object Object]'`);
    });
  });

  describe('index inputs', () => {
    it('generates index inputs', () => {
      const { indexInputs } = loadCsf(
        dedent`
      export default {
        id: 'component-id',
        title: 'custom foo title',
        tags: ['component-tag']
      };

      export const A = {
        play: () => {},
        tags: ['story-tag'],
      };

      export const B = {
        play: () => {},
        tags: ['story-tag'],
      };
    `,
        { makeTitle, fileName: 'foo/bar.stories.js' }
      ).parse();

      expect(indexInputs).toMatchInlineSnapshot(`'[object Object],[object Object]'`);
    });

    it('supports custom parameters.__id', () => {
      const { indexInputs } = loadCsf(
        dedent`
      export default {
        id: 'component-id',
        title: 'custom foo title',
        tags: ['component-tag']
      };

      export const A = {
        parameters: { __id: 'custom-story-id' }
      };
    `,
        { makeTitle, fileName: 'foo/bar.stories.js' }
      ).parse();

      expect(indexInputs).toMatchInlineSnapshot(`'[object Object]'`);
    });

    it('removes duplicate tags', () => {
      const { indexInputs } = loadCsf(
        dedent`
      export default {
        title: 'custom foo title',
        tags: ['component-tag', 'component-tag-dup', 'component-tag-dup', 'inherit-tag-dup']
      };

      export const A = {
        tags: ['story-tag', 'story-tag-dup', 'story-tag-dup', 'inherit-tag-dup']
      };
    `,
        { makeTitle, fileName: 'foo/bar.stories.js' }
      ).parse();

      expect(indexInputs).toMatchInlineSnapshot(`'[object Object]'`);
    });

    it('throws if getting indexInputs without filename option', () => {
      const csf = loadCsf(
        dedent`
      export default {
        title: 'custom foo title',
        tags: ['component-tag', 'component-tag-dup', 'component-tag-dup', 'inherit-tag-dup']
      };

      export const A = {
        tags: ['story-tag', 'story-tag-dup', 'story-tag-dup', 'inherit-tag-dup']
      };
    `,
        { makeTitle }
      ).parse();

      expect(() => csf.indexInputs).toThrowErrorMatchingInlineSnapshot(`
        >-
  Error: Cannot automatically create index inputs with CsfFile.indexInputs
  because the CsfFile instance was created without a the fileName option.

  Either add the fileName option when creating the CsfFile instance, or create
  the index inputs manually.
`);
    });
  });
});
