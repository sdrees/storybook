import { describe, expect, test } from '@jest/globals';

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
  test('camelCase boolean Arg', () => {
    expect(mapAttributesAndDirectives({ camelCaseBooleanArg: true })).toMatchInlineSnapshot(`
      Array [
        Object {
          arg: Object {
            content: camel-case-boolean-arg,
            loc: Object {
              source: camel-case-boolean-arg,
            },
          },
          exp: Object {
            isStatic: false,
            loc: Object {
              source: true,
            },
          },
          loc: Object {
            source: :camel-case-boolean-arg="true",
          },
          modifiers: Array [
            ,
          ],
          name: bind,
          type: 6,
        },
      ]
    `);
  });
  test('camelCase string Arg', () => {
    expect(mapAttributesAndDirectives({ camelCaseStringArg: 'foo' })).toMatchInlineSnapshot(`
      Array [
        Object {
          arg: Object {
            content: camel-case-string-arg,
            loc: Object {
              source: camel-case-string-arg,
            },
          },
          exp: Object {
            isStatic: false,
            loc: Object {
              source: foo,
            },
          },
          loc: Object {
            source: camel-case-string-arg="foo",
          },
          modifiers: Array [
            ,
          ],
          name: bind,
          type: 6,
        },
      ]
    `);
  });
  test('boolean arg', () => {
    expect(mapAttributesAndDirectives({ booleanarg: true })).toMatchInlineSnapshot(`
      Array [
        Object {
          arg: Object {
            content: booleanarg,
            loc: Object {
              source: booleanarg,
            },
          },
          exp: Object {
            isStatic: false,
            loc: Object {
              source: true,
            },
          },
          loc: Object {
            source: :booleanarg="true",
          },
          modifiers: Array [
            ,
          ],
          name: bind,
          type: 6,
        },
      ]
    `);
  });
  test('string arg', () => {
    expect(mapAttributesAndDirectives({ stringarg: 'bar' })).toMatchInlineSnapshot(`
      Array [
        Object {
          arg: Object {
            content: stringarg,
            loc: Object {
              source: stringarg,
            },
          },
          exp: Object {
            isStatic: false,
            loc: Object {
              source: bar,
            },
          },
          loc: Object {
            source: stringarg="bar",
          },
          modifiers: Array [
            ,
          ],
          name: bind,
          type: 6,
        },
      ]
    `);
  });
  test('number arg', () => {
    expect(mapAttributesAndDirectives({ numberarg: 2023 })).toMatchInlineSnapshot(`
      Array [
        Object {
          arg: Object {
            content: numberarg,
            loc: Object {
              source: numberarg,
            },
          },
          exp: Object {
            isStatic: false,
            loc: Object {
              source: 2023,
            },
          },
          loc: Object {
            source: :numberarg="2023",
          },
          modifiers: Array [
            ,
          ],
          name: bind,
          type: 6,
        },
      ]
    `);
  });
  test('camelCase boolean, string, and number Args', () => {
    expect(
      mapAttributesAndDirectives({
        camelCaseBooleanArg: true,
        camelCaseStringArg: 'foo',
        cameCaseNumberArg: 2023,
      })
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          arg: Object {
            content: camel-case-boolean-arg,
            loc: Object {
              source: camel-case-boolean-arg,
            },
          },
          exp: Object {
            isStatic: false,
            loc: Object {
              source: true,
            },
          },
          loc: Object {
            source: :camel-case-boolean-arg="true",
          },
          modifiers: Array [
            ,
          ],
          name: bind,
          type: 6,
        },
        Object {
          arg: Object {
            content: camel-case-string-arg,
            loc: Object {
              source: camel-case-string-arg,
            },
          },
          exp: Object {
            isStatic: false,
            loc: Object {
              source: foo,
            },
          },
          loc: Object {
            source: camel-case-string-arg="foo",
          },
          modifiers: Array [
            ,
          ],
          name: bind,
          type: 6,
        },
        Object {
          arg: Object {
            content: came-case-number-arg,
            loc: Object {
              source: came-case-number-arg,
            },
          },
          exp: Object {
            isStatic: false,
            loc: Object {
              source: 2023,
            },
          },
          loc: Object {
            source: :came-case-number-arg="2023",
          },
          modifiers: Array [
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
  test('camelCase boolean Arg', () => {
    expect(
      generateAttributesSource(
        mapAttributesAndDirectives({ camelCaseBooleanArg: true }),
        { camelCaseBooleanArg: true },
        [{ camelCaseBooleanArg: { type: 'boolean' } }] as any
      )
    ).toMatchInlineSnapshot(`:camel-case-boolean-arg="true"`);
  });
  test('camelCase string Arg', () => {
    expect(
      generateAttributesSource(
        mapAttributesAndDirectives({ camelCaseStringArg: 'foo' }),
        { camelCaseStringArg: 'foo' },
        [{ camelCaseStringArg: { type: 'string' } }] as any
      )
    ).toMatchInlineSnapshot(`camel-case-string-arg="foo"`);
  });

  test('camelCase boolean, string, and number Args', () => {
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
  test('camelCase boolean Arg', () => {
    expect(attributeSource('stringArg', 'foo')).toMatchInlineSnapshot(`stringArg="foo"`);
  });

  test('html event attribute should convert to vue event directive', () => {
    expect(attributeSource('onClick', () => {})).toMatchInlineSnapshot(`v-on:click='()=>({})'`);
    expect(attributeSource('onclick', () => {})).toMatchInlineSnapshot(`v-on:click='()=>({})'`);
  });
  test('normal html attribute should not convert to vue event directive', () => {
    expect(attributeSource('on-click', () => {})).toMatchInlineSnapshot(`on-click='()=>({})'`);
  });
  test('htmlEventAttributeToVueEventAttribute  onEv => v-on:', () => {
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
