import { describe, expect, test } from '@jest/globals';
import type { Args } from '@storybook/types';
import { generateSource } from './sourceDecorator';

expect.addSnapshotSerializer({
  print: (val: any) => val,
  test: (val: unknown) => typeof val === 'string',
});
function generateArgTypes(args: Args, slotProps: string[] | undefined) {
  return Object.keys(args).reduce((acc, prop) => {
    acc[prop] = { table: { category: slotProps?.includes(prop) ? 'slots' : 'props' } };
    return acc;
  }, {} as Record<string, any>);
}
function generateForArgs(args: Args, slotProps: string[] | undefined = undefined) {
  return generateSource({ name: 'Component' }, args, generateArgTypes(args, slotProps), true);
}
function generateMultiComponentForArgs(args: Args, slotProps: string[] | undefined = undefined) {
  return generateSource(
    [{ name: 'Component' }, { name: 'Component' }],
    args,
    generateArgTypes(args, slotProps),
    true
  );
}

describe('generateSource Vue3', () => {
  test('boolean true', () => {
    expect(generateForArgs({ booleanProp: true })).toMatchInlineSnapshot(
      `<Component :boolean-prop='booleanProp'/>`
    );
  });
  test('boolean false', () => {
    expect(generateForArgs({ booleanProp: false })).toMatchInlineSnapshot(
      `<Component :boolean-prop='booleanProp'/>`
    );
  });
  test('null property', () => {
    expect(generateForArgs({ nullProp: null })).toMatchInlineSnapshot(
      `<Component :null-prop='nullProp'/>`
    );
  });
  test('string property', () => {
    expect(generateForArgs({ stringProp: 'mystr' })).toMatchInlineSnapshot(
      `<Component :string-prop='stringProp'/>`
    );
  });
  test('number property', () => {
    expect(generateForArgs({ numberProp: 42 })).toMatchInlineSnapshot(
      `<Component :number-prop='numberProp'/>`
    );
  });
  test('object property', () => {
    expect(generateForArgs({ objProp: { x: true } })).toMatchInlineSnapshot(
      `<Component :obj-prop='objProp'/>`
    );
  });
  test('multiple properties', () => {
    expect(generateForArgs({ a: 1, b: 2 })).toMatchInlineSnapshot(`<Component :a='a' :b='b'/>`);
  });
  test('1 slot property', () => {
    expect(generateForArgs({ content: 'xyz', myProp: 'abc' }, ['content'])).toMatchInlineSnapshot(`
      <Component :my-prop='myProp'>
        {{ content }}
      </Component>
    `);
  });
  test('multiple slot property with second slot value not set', () => {
    expect(generateForArgs({ content: 'xyz', myProp: 'abc' }, ['content', 'footer']))
      .toMatchInlineSnapshot(`
      <Component :my-prop='myProp'>
        {{ content }}
      </Component>
    `);
  });
  test('multiple slot property with second slot value is set', () => {
    expect(generateForArgs({ content: 'xyz', footer: 'foo', myProp: 'abc' }, ['content', 'footer']))
      .toMatchInlineSnapshot(`
      <Component :my-prop='myProp'>
        <template #content>{{ content }}</template>
        <template #footer>{{ footer }}</template>
      </Component>
    `);
  });
  // test mutil components
  test('multi component with boolean true', () => {
    expect(generateMultiComponentForArgs({ booleanProp: true })).toMatchInlineSnapshot(`
      <Component :boolean-prop='booleanProp'/>
      <Component :boolean-prop='booleanProp'/>
    `);
  });
  test('component is not set', () => {
    expect(generateSource(null, {}, {})).toBeNull();
  });
});
