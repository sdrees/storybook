import { describe, expect, it } from 'vitest';

import {
  mapAttributesAndDirectives,
  generateAttributesSource,
  attributeSource,
  htmlEventAttributeToVueEventAttribute as htmlEventToVueEvent,
} from './sourceDecorator';

expect.addSnapshotSerializer({
  print: (val: any) => val,
  test: (val: unknown) => typeof val === 'string',
});

describe('Vue3: sourceDecorator->mapAttributesAndDirective()', () => {
  it('camelCase boolean Arg', () => {
    expect(mapAttributesAndDirectives({ camelCaseBooleanArg: true })).toMatchInlineSnapshot(`
      [
        {
          arg: {
            content: camel-case-boolean-arg,
            loc: {
              source: camel-case-boolean-arg,
            },
          },
          exp: {
            isStatic: false,
            loc: {
              source: true,
            },
          },
          loc: {
            source: :camel-case-boolean-arg="true",
          },
          modifiers: [
            ,
          ],
          name: bind,
          type: 6,
        },
      ]
    `);
  });
  it('camelCase string Arg', () => {
    expect(mapAttributesAndDirectives({ camelCaseStringArg: 'foo' })).toMatchInlineSnapshot(`
      [
        {
          arg: {
            content: camel-case-string-arg,
            loc: {
              source: camel-case-string-arg,
            },
          },
          exp: {
            isStatic: false,
            loc: {
              source: foo,
            },
          },
          loc: {
            source: camel-case-string-arg="foo",
          },
          modifiers: [
            ,
          ],
          name: bind,
          type: 6,
        },
      ]
    `);
  });
  it('boolean arg', () => {
    expect(mapAttributesAndDirectives({ booleanarg: true })).toMatchInlineSnapshot(`
      [
        {
          arg: {
            content: booleanarg,
            loc: {
              source: booleanarg,
            },
          },
          exp: {
            isStatic: false,
            loc: {
              source: true,
            },
          },
          loc: {
            source: :booleanarg="true",
          },
          modifiers: [
            ,
          ],
          name: bind,
          type: 6,
        },
      ]
    `);
  });
  it('string arg', () => {
    expect(mapAttributesAndDirectives({ stringarg: 'bar' })).toMatchInlineSnapshot(`
      [
        {
          arg: {
            content: stringarg,
            loc: {
              source: stringarg,
            },
          },
          exp: {
            isStatic: false,
            loc: {
              source: bar,
            },
          },
          loc: {
            source: stringarg="bar",
          },
          modifiers: [
            ,
          ],
          name: bind,
          type: 6,
        },
      ]
    `);
  });
  it('number arg', () => {
    expect(mapAttributesAndDirectives({ numberarg: 2023 })).toMatchInlineSnapshot(`
      [
        {
          arg: {
            content: numberarg,
            loc: {
              source: numberarg,
            },
          },
          exp: {
            isStatic: false,
            loc: {
              source: 2023,
            },
          },
          loc: {
            source: :numberarg="2023",
          },
          modifiers: [
            ,
          ],
          name: bind,
          type: 6,
        },
      ]
    `);
  });
  it('camelCase boolean, string, and number Args', () => {
    expect(
      mapAttributesAndDirectives({
        camelCaseBooleanArg: true,
        camelCaseStringArg: 'foo',
        cameCaseNumberArg: 2023,
      })
    ).toMatchInlineSnapshot(`
      [
        {
          arg: {
            content: camel-case-boolean-arg,
            loc: {
              source: camel-case-boolean-arg,
            },
          },
          exp: {
            isStatic: false,
            loc: {
              source: true,
            },
          },
          loc: {
            source: :camel-case-boolean-arg="true",
          },
          modifiers: [
            ,
          ],
          name: bind,
          type: 6,
        },
        {
          arg: {
            content: camel-case-string-arg,
            loc: {
              source: camel-case-string-arg,
            },
          },
          exp: {
            isStatic: false,
            loc: {
              source: foo,
            },
          },
          loc: {
            source: camel-case-string-arg="foo",
          },
          modifiers: [
            ,
          ],
          name: bind,
          type: 6,
        },
        {
          arg: {
            content: came-case-number-arg,
            loc: {
              source: came-case-number-arg,
            },
          },
          exp: {
            isStatic: false,
            loc: {
              source: 2023,
            },
          },
          loc: {
            source: :came-case-number-arg="2023",
          },
          modifiers: [
            ,
          ],
          name: bind,
          type: 6,
        },
      ]
    `);
  });
});

describe('Vue3: sourceDecorator->generateAttributesSource()', () => {
  it('camelCase boolean Arg', () => {
    expect(
      generateAttributesSource(
        mapAttributesAndDirectives({ camelCaseBooleanArg: true }),
        { camelCaseBooleanArg: true },
        [{ camelCaseBooleanArg: { type: 'boolean' } }] as any
      )
    ).toMatchInlineSnapshot(`:camel-case-boolean-arg="true"`);
  });
  it('camelCase string Arg', () => {
    expect(
      generateAttributesSource(
        mapAttributesAndDirectives({ camelCaseStringArg: 'foo' }),
        { camelCaseStringArg: 'foo' },
        [{ camelCaseStringArg: { type: 'string' } }] as any
      )
    ).toMatchInlineSnapshot(`camel-case-string-arg="foo"`);
  });

  it('camelCase boolean, string, and number Args', () => {
    expect(
      generateAttributesSource(
        mapAttributesAndDirectives({
          camelCaseBooleanArg: true,
          camelCaseStringArg: 'foo',
          cameCaseNumberArg: 2023,
        }),
        {
          camelCaseBooleanArg: true,
          camelCaseStringArg: 'foo',
          cameCaseNumberArg: 2023,
        },
        [] as any
      )
    ).toMatchInlineSnapshot(
      `:camel-case-boolean-arg="true" camel-case-string-arg="foo" :came-case-number-arg="2023"`
    );
  });
});

describe('Vue3: sourceDecorator->attributeSoure()', () => {
  it('camelCase boolean Arg', () => {
    expect(attributeSource('stringArg', 'foo')).toMatchInlineSnapshot(`stringArg="foo"`);
  });

  it('html event attribute should convert to vue event directive', () => {
    expect(attributeSource('onClick', () => {})).toMatchInlineSnapshot(`v-on:click='()=>({})'`);
    expect(attributeSource('onclick', () => {})).toMatchInlineSnapshot(`v-on:click='()=>({})'`);
  });
  it('normal html attribute should not convert to vue event directive', () => {
    expect(attributeSource('on-click', () => {})).toMatchInlineSnapshot(`on-click='()=>({})'`);
  });
  it('htmlEventAttributeToVueEventAttribute  onEv => v-on:', () => {
    const htmlEventAttributeToVueEventAttribute = (attribute: string) => {
      return htmlEventToVueEvent(attribute);
    };
    expect(/^on[A-Za-z]/.test('onClick')).toBeTruthy();
    expect(htmlEventAttributeToVueEventAttribute('onclick')).toMatchInlineSnapshot(`v-on:click`);
    expect(htmlEventAttributeToVueEventAttribute('onClick')).toMatchInlineSnapshot(`v-on:click`);
    expect(htmlEventAttributeToVueEventAttribute('onChange')).toMatchInlineSnapshot(`v-on:change`);
    expect(htmlEventAttributeToVueEventAttribute('onFocus')).toMatchInlineSnapshot(`v-on:focus`);
    expect(htmlEventAttributeToVueEventAttribute('on-focus')).toMatchInlineSnapshot(`on-focus`);
  });
});
