export const referenceTypeProps = {
  __name: 'component',
  __docgenInfo: {
    exportName: 'default',
    displayName: 'component',
    type: 1,
    props: [
      {
        name: 'bar',
        global: false,
        description: 'description bar is optional number',
        tags: [],
        required: false,
        type: 'number | undefined',
        declarations: [],
        schema: {
          kind: 'enum',
          type: 'number | undefined',
          schema: ['undefined', 'number'],
        },
        default: '1',
      },
      {
        name: 'stringArray',
        global: false,
        description: 'description stringArray is string array',
        tags: [],
        required: false,
        type: 'string[] | undefined',
        declarations: [],
        schema: {
          kind: 'enum',
          type: 'string[] | undefined',
          schema: [
            'undefined',
            {
              kind: 'array',
              type: 'string[]',
              schema: ['string'],
            },
          ],
        },
        default: '["foo", "bar"]',
      },
      {
        name: 'key',
        global: true,
        description: '',
        tags: [],
        required: false,
        type: 'string | number | symbol | undefined',
        declarations: [],
        schema: {
          kind: 'enum',
          type: 'string | number | symbol | undefined',
          schema: ['undefined', 'string', 'number', 'symbol'],
        },
      },
      {
        name: 'ref',
        global: true,
        description: '',
        tags: [],
        required: false,
        type: 'VNodeRef | undefined',
        declarations: [],
        schema: {
          kind: 'enum',
          type: 'VNodeRef | undefined',
          schema: [
            'undefined',
            'string',
            'Ref<any>',
            {
              kind: 'event',
              type: '(ref: Element | ComponentPublicInstance<{}, {}, {}, {}, {}, {}, {}, {}, false, ComponentOptionsBase<any, any, any, any, any, any, any, any, any, {}, {}, string, {}>, {}, {}> | null, refs: Record<...>): void',
              schema: [],
            },
          ],
        },
      },
      {
        name: 'ref_for',
        global: true,
        description: '',
        tags: [],
        required: false,
        type: 'boolean | undefined',
        declarations: [],
        schema: {
          kind: 'enum',
          type: 'boolean | undefined',
          schema: ['undefined', 'false', 'true'],
        },
      },
      {
        name: 'ref_key',
        global: true,
        description: '',
        tags: [],
        required: false,
        type: 'string | undefined',
        declarations: [],
        schema: {
          kind: 'enum',
          type: 'string | undefined',
          schema: ['undefined', 'string'],
        },
      },
      {
        name: 'class',
        global: true,
        description: '',
        tags: [],
        required: false,
        type: 'unknown',
        declarations: [],
        schema: 'unknown',
      },
      {
        name: 'style',
        global: true,
        description: '',
        tags: [],
        required: false,
        type: 'unknown',
        declarations: [],
        schema: 'unknown',
      },
      {
        name: 'foo',
        global: false,
        description: 'string foo',
        tags: [
          {
            name: 'default',
            text: '"rounded"',
          },
          {
            name: 'since',
            text: 'v1.0.0',
          },
          {
            name: 'see',
            text: 'https://vuejs.org/',
          },
          {
            name: 'deprecated',
            text: 'v1.1.0',
          },
        ],
        required: true,
        type: 'string',
        declarations: [],
        schema: 'string',
      },
      {
        name: 'baz',
        global: false,
        description: 'description baz is required boolean',
        tags: [],
        required: true,
        type: 'boolean',
        declarations: [],
        schema: {
          kind: 'enum',
          type: 'boolean',
          schema: ['false', 'true'],
        },
      },
      {
        name: 'union',
        global: false,
        description: 'description union is required union type',
        tags: [],
        required: true,
        type: 'string | number',
        declarations: [],
        schema: {
          kind: 'enum',
          type: 'string | number',
          schema: ['string', 'number'],
        },
      },
      {
        name: 'unionOptional',
        global: false,
        description: 'description unionOptional is optional union type',
        tags: [],
        required: false,
        type: 'string | number | boolean | undefined',
        declarations: [],
        schema: {
          kind: 'enum',
          type: 'string | number | boolean | undefined',
          schema: ['undefined', 'string', 'number', 'false', 'true'],
        },
      },
      {
        name: 'nested',
        global: false,
        description: 'description nested is required nested object',
        tags: [],
        required: true,
        type: 'MyNestedProps',
        declarations: [],
        schema: {
          kind: 'object',
          type: 'MyNestedProps',
          schema: {
            nestedProp: {
              name: 'nestedProp',
              global: false,
              description: 'nested prop documentation',
              tags: [],
              required: true,
              type: 'string',
              declarations: [],
              schema: 'string',
            },
          },
        },
      },
      {
        name: 'nestedIntersection',
        global: false,
        description: 'description required nested object with intersection',
        tags: [],
        required: true,
        type: 'MyNestedProps & { additionalProp: string; }',
        declarations: [],
        schema: {
          kind: 'object',
          type: 'MyNestedProps & { additionalProp: string; }',
          schema: {
            nestedProp: {
              name: 'nestedProp',
              global: false,
              description: 'nested prop documentation',
              tags: [],
              required: true,
              type: 'string',
              declarations: [],
              schema: 'string',
            },
            additionalProp: {
              name: 'additionalProp',
              global: false,
              description: 'description required additional property',
              tags: [],
              required: true,
              type: 'string',
              declarations: [],
              schema: 'string',
            },
          },
        },
      },
      {
        name: 'nestedOptional',
        global: false,
        description: 'description optional nested object',
        tags: [],
        required: false,
        type: 'MyNestedProps | MyIgnoredNestedProps | undefined',
        declarations: [],
        schema: {
          kind: 'enum',
          type: 'MyNestedProps | MyIgnoredNestedProps | undefined',
          schema: [
            'undefined',
            {
              kind: 'object',
              type: 'MyNestedProps',
              schema: {
                nestedProp: {
                  name: 'nestedProp',
                  global: false,
                  description: 'nested prop documentation',
                  tags: [],
                  required: true,
                  type: 'string',
                  declarations: [],
                  schema: 'string',
                },
              },
            },
            {
              kind: 'object',
              type: 'MyIgnoredNestedProps',
              schema: {
                nestedProp: {
                  name: 'nestedProp',
                  global: false,
                  description: '',
                  tags: [],
                  required: true,
                  type: 'string',
                  declarations: [],
                  schema: 'string',
                },
              },
            },
          ],
        },
      },
      {
        name: 'array',
        global: false,
        description: 'description required array object',
        tags: [],
        required: true,
        type: 'MyNestedProps[]',
        declarations: [],
        schema: {
          kind: 'array',
          type: 'MyNestedProps[]',
          schema: [
            {
              kind: 'object',
              type: 'MyNestedProps',
              schema: {
                nestedProp: {
                  name: 'nestedProp',
                  global: false,
                  description: 'nested prop documentation',
                  tags: [],
                  required: true,
                  type: 'string',
                  declarations: [],
                  schema: 'string',
                },
              },
            },
          ],
        },
      },
      {
        name: 'arrayOptional',
        global: false,
        description: 'description optional array object',
        tags: [],
        required: false,
        type: 'MyNestedProps[] | undefined',
        declarations: [],
        schema: {
          kind: 'enum',
          type: 'MyNestedProps[] | undefined',
          schema: [
            'undefined',
            {
              kind: 'array',
              type: 'MyNestedProps[]',
              schema: [
                {
                  kind: 'object',
                  type: 'MyNestedProps',
                  schema: {
                    nestedProp: {
                      name: 'nestedProp',
                      global: false,
                      description: 'nested prop documentation',
                      tags: [],
                      required: true,
                      type: 'string',
                      declarations: [],
                      schema: 'string',
                    },
                  },
                },
              ],
            },
          ],
        },
      },
      {
        name: 'enumValue',
        global: false,
        description: 'description enum value',
        tags: [],
        required: true,
        type: 'MyEnum',
        declarations: [],
        schema: {
          kind: 'enum',
          type: 'MyEnum',
          schema: ['MyEnum.Small', 'MyEnum.Medium', 'MyEnum.Large'],
        },
      },
      {
        name: 'literalFromContext',
        global: false,
        description: 'description literal type alias that require context',
        tags: [],
        required: true,
        type: '"Uncategorized" | "Content" | "Interaction" | "Display" | "Forms" | "Addons"',
        declarations: [],
        schema: {
          kind: 'enum',
          type: '"Uncategorized" | "Content" | "Interaction" | "Display" | "Forms" | "Addons"',
          schema: [
            '"Uncategorized"',
            '"Content"',
            '"Interaction"',
            '"Display"',
            '"Forms"',
            '"Addons"',
          ],
        },
      },
      {
        name: 'inlined',
        global: false,
        description: '',
        tags: [],
        required: true,
        type: '{ foo: string; }',
        declarations: [],
        schema: {
          kind: 'object',
          type: '{ foo: string; }',
          schema: {
            foo: {
              name: 'foo',
              global: false,
              description: '',
              tags: [],
              required: true,
              type: 'string',
              declarations: [],
              schema: 'string',
            },
          },
        },
      },
      {
        name: 'recursive',
        global: false,
        description: '',
        tags: [],
        required: false,
        type: 'MyNestedRecursiveProps | undefined',
        declarations: [],
        schema: {
          kind: 'enum',
          type: 'MyNestedRecursiveProps | undefined',
          schema: [
            'undefined',
            {
              kind: 'object',
              type: 'MyNestedRecursiveProps',
              schema: {
                recursive: {
                  name: 'recursive',
                  global: false,
                  description: '',
                  tags: [],
                  required: true,
                  type: 'MyNestedRecursiveProps',
                  declarations: [],
                  schema: 'MyNestedRecursiveProps',
                },
              },
            },
          ],
        },
      },
    ],
    events: [],
    slots: [],
    exposed: [
      {
        name: 'foo',
        type: 'string',
        description: 'string foo',
        declarations: [],
        schema: 'string',
      },
      {
        name: 'bar',
        type: 'number',
        description: 'description bar is optional number',
        declarations: [],
        schema: 'number',
      },
      {
        name: 'baz',
        type: 'boolean',
        description: 'description baz is required boolean',
        declarations: [],
        schema: {
          kind: 'enum',
          type: 'boolean',
          schema: ['false', 'true'],
        },
      },
      {
        name: 'stringArray',
        type: 'string[]',
        description: 'description stringArray is string array',
        declarations: [],
        schema: {
          kind: 'array',
          type: 'string[]',
          schema: ['string'],
        },
      },
      {
        name: 'union',
        type: 'string | number',
        description: 'description union is required union type',
        declarations: [],
        schema: {
          kind: 'enum',
          type: 'string | number',
          schema: ['string', 'number'],
        },
      },
      {
        name: 'unionOptional',
        type: 'string | number | boolean | undefined',
        description: 'description unionOptional is optional union type',
        declarations: [],
        schema: {
          kind: 'enum',
          type: 'string | number | boolean | undefined',
          schema: ['undefined', 'string', 'number', 'false', 'true'],
        },
      },
      {
        name: 'nested',
        type: 'MyNestedProps',
        description: 'description nested is required nested object',
        declarations: [],
        schema: {
          kind: 'object',
          type: 'MyNestedProps',
          schema: {
            nestedProp: {
              name: 'nestedProp',
              global: false,
              description: 'nested prop documentation',
              tags: [],
              required: true,
              type: 'string',
              declarations: [],
              schema: 'string',
            },
          },
        },
      },
      {
        name: 'nestedIntersection',
        type: 'MyNestedProps & { additionalProp: string; }',
        description: 'description required nested object with intersection',
        declarations: [],
        schema: {
          kind: 'object',
          type: 'MyNestedProps & { additionalProp: string; }',
          schema: {
            nestedProp: {
              name: 'nestedProp',
              global: false,
              description: 'nested prop documentation',
              tags: [],
              required: true,
              type: 'string',
              declarations: [],
              schema: 'string',
            },
            additionalProp: {
              name: 'additionalProp',
              global: false,
              description: 'description required additional property',
              tags: [],
              required: true,
              type: 'string',
              declarations: [],
              schema: 'string',
            },
          },
        },
      },
      {
        name: 'nestedOptional',
        type: 'MyNestedProps | MyIgnoredNestedProps | undefined',
        description: 'description optional nested object',
        declarations: [],
        schema: {
          kind: 'enum',
          type: 'MyNestedProps | MyIgnoredNestedProps | undefined',
          schema: [
            'undefined',
            {
              kind: 'object',
              type: 'MyNestedProps',
              schema: {
                nestedProp: {
                  name: 'nestedProp',
                  global: false,
                  description: 'nested prop documentation',
                  tags: [],
                  required: true,
                  type: 'string',
                  declarations: [],
                  schema: 'string',
                },
              },
            },
            {
              kind: 'object',
              type: 'MyIgnoredNestedProps',
              schema: {
                nestedProp: {
                  name: 'nestedProp',
                  global: false,
                  description: '',
                  tags: [],
                  required: true,
                  type: 'string',
                  declarations: [],
                  schema: 'string',
                },
              },
            },
          ],
        },
      },
      {
        name: 'array',
        type: 'MyNestedProps[]',
        description: 'description required array object',
        declarations: [],
        schema: {
          kind: 'array',
          type: 'MyNestedProps[]',
          schema: [
            {
              kind: 'object',
              type: 'MyNestedProps',
              schema: {
                nestedProp: {
                  name: 'nestedProp',
                  global: false,
                  description: 'nested prop documentation',
                  tags: [],
                  required: true,
                  type: 'string',
                  declarations: [],
                  schema: 'string',
                },
              },
            },
          ],
        },
      },
      {
        name: 'arrayOptional',
        type: 'MyNestedProps[] | undefined',
        description: 'description optional array object',
        declarations: [],
        schema: {
          kind: 'enum',
          type: 'MyNestedProps[] | undefined',
          schema: [
            'undefined',
            {
              kind: 'array',
              type: 'MyNestedProps[]',
              schema: [
                {
                  kind: 'object',
                  type: 'MyNestedProps',
                  schema: {
                    nestedProp: {
                      name: 'nestedProp',
                      global: false,
                      description: 'nested prop documentation',
                      tags: [],
                      required: true,
                      type: 'string',
                      declarations: [],
                      schema: 'string',
                    },
                  },
                },
              ],
            },
          ],
        },
      },
      {
        name: 'enumValue',
        type: 'MyEnum',
        description: 'description enum value',
        declarations: [],
        schema: {
          kind: 'enum',
          type: 'MyEnum',
          schema: ['MyEnum.Small', 'MyEnum.Medium', 'MyEnum.Large'],
        },
      },
      {
        name: 'literalFromContext',
        type: '"Uncategorized" | "Content" | "Interaction" | "Display" | "Forms" | "Addons"',
        description: 'description literal type alias that require context',
        declarations: [],
        schema: {
          kind: 'enum',
          type: '"Uncategorized" | "Content" | "Interaction" | "Display" | "Forms" | "Addons"',
          schema: [
            '"Uncategorized"',
            '"Content"',
            '"Interaction"',
            '"Display"',
            '"Forms"',
            '"Addons"',
          ],
        },
      },
      {
        name: 'inlined',
        type: '{ foo: string; }',
        description: '',
        declarations: [],
        schema: {
          kind: 'object',
          type: '{ foo: string; }',
          schema: {
            foo: {
              name: 'foo',
              global: false,
              description: '',
              tags: [],
              required: true,
              type: 'string',
              declarations: [],
              schema: 'string',
            },
          },
        },
      },
      {
        name: 'recursive',
        type: 'MyNestedRecursiveProps | undefined',
        description: '',
        declarations: [],
        schema: {
          kind: 'enum',
          type: 'MyNestedRecursiveProps | undefined',
          schema: [
            'undefined',
            {
              kind: 'object',
              type: 'MyNestedRecursiveProps',
              schema: {
                recursive: {
                  name: 'recursive',
                  global: false,
                  description: '',
                  tags: [],
                  required: true,
                  type: 'MyNestedRecursiveProps',
                  declarations: [],
                  schema: 'MyNestedRecursiveProps',
                },
              },
            },
          ],
        },
      },
    ],
    sourceFiles:
      '/storybook/sandbox/vue3-vite-default-ts/src/stories/renderers/vue3_vue3-vite-default-ts/component-meta/reference-type-props/component.vue',
  },
};

export const mockExtractComponentPropsReturn = [
  {
    propDef: {
      name: 'bar',
      type: {},
      required: false,
      description: 'description bar is optional number',
      defaultValue: null,
      sbType: {
        name: 'other',
      },
    },
    docgenInfo: {
      name: 'bar',
      global: false,
      description: 'description bar is optional number',
      tags: [],
      required: false,
      type: 'number | undefined',
      declarations: [],
      schema: {
        kind: 'enum',
        type: 'number | undefined',
        schema: ['undefined', 'number'],
      },
      default: '1',
    },
    typeSystem: 'JavaScript',
  },
  {
    propDef: {
      name: 'stringArray',
      type: {},
      required: false,
      description: 'description stringArray is string array',
      defaultValue: null,
      sbType: {
        name: 'other',
      },
    },
    docgenInfo: {
      name: 'stringArray',
      global: false,
      description: 'description stringArray is string array',
      tags: [],
      required: false,
      type: 'string[] | undefined',
      declarations: [],
      schema: {
        kind: 'enum',
        type: 'string[] | undefined',
        schema: [
          'undefined',
          {
            kind: 'array',
            type: 'string[]',
            schema: ['string'],
          },
        ],
      },
      default: '["foo", "bar"]',
    },
    typeSystem: 'JavaScript',
  },
  {
    propDef: {
      name: 'key',
      type: {},
      required: false,
      description: '',
      defaultValue: null,
      sbType: {
        name: 'other',
      },
    },
    docgenInfo: {
      name: 'key',
      global: true,
      description: '',
      tags: [],
      required: false,
      type: 'string | number | symbol | undefined',
      declarations: [],
      schema: {
        kind: 'enum',
        type: 'string | number | symbol | undefined',
        schema: ['undefined', 'string', 'number', 'symbol'],
      },
    },
    typeSystem: 'JavaScript',
  },
  {
    propDef: {
      name: 'ref',
      type: {},
      required: false,
      description: '',
      defaultValue: null,
      sbType: {
        name: 'other',
      },
    },
    docgenInfo: {
      name: 'ref',
      global: true,
      description: '',
      tags: [],
      required: false,
      type: 'VNodeRef | undefined',
      declarations: [],
      schema: {
        kind: 'enum',
        type: 'VNodeRef | undefined',
        schema: [
          'undefined',
          'string',
          'Ref<any>',
          {
            kind: 'event',
            type: '(ref: Element | ComponentPublicInstance<{}, {}, {}, {}, {}, {}, {}, {}, false, ComponentOptionsBase<any, any, any, any, any, any, any, any, any, {}, {}, string, {}>, {}, {}> | null, refs: Record<...>): void',
            schema: [],
          },
        ],
      },
    },
    typeSystem: 'JavaScript',
  },
  {
    propDef: {
      name: 'ref_for',
      type: {},
      required: false,
      description: '',
      defaultValue: null,
      sbType: {
        name: 'other',
      },
    },
    docgenInfo: {
      name: 'ref_for',
      global: true,
      description: '',
      tags: [],
      required: false,
      type: 'boolean | undefined',
      declarations: [],
      schema: {
        kind: 'enum',
        type: 'boolean | undefined',
        schema: ['undefined', 'false', 'true'],
      },
    },
    typeSystem: 'JavaScript',
  },
  {
    propDef: {
      name: 'ref_key',
      type: {},
      required: false,
      description: '',
      defaultValue: null,
      sbType: {
        name: 'other',
      },
    },
    docgenInfo: {
      name: 'ref_key',
      global: true,
      description: '',
      tags: [],
      required: false,
      type: 'string | undefined',
      declarations: [],
      schema: {
        kind: 'enum',
        type: 'string | undefined',
        schema: ['undefined', 'string'],
      },
    },
    typeSystem: 'JavaScript',
  },
  {
    propDef: {
      name: 'class',
      type: {},
      required: false,
      description: '',
      defaultValue: null,
      sbType: {
        name: 'other',
      },
    },
    docgenInfo: {
      name: 'class',
      global: true,
      description: '',
      tags: [],
      required: false,
      type: 'unknown',
      declarations: [],
      schema: 'unknown',
    },
    typeSystem: 'JavaScript',
  },
  {
    propDef: {
      name: 'style',
      type: {},
      required: false,
      description: '',
      defaultValue: null,
      sbType: {
        name: 'other',
      },
    },
    docgenInfo: {
      name: 'style',
      global: true,
      description: '',
      tags: [],
      required: false,
      type: 'unknown',
      declarations: [],
      schema: 'unknown',
    },
    typeSystem: 'JavaScript',
  },
  {
    propDef: {
      name: 'foo',
      type: {},
      required: true,
      description: 'string foo',
      defaultValue: null,
      sbType: {
        name: 'other',
      },
    },
    docgenInfo: {
      name: 'foo',
      global: false,
      description: 'string foo',
      tags: [
        {
          name: 'default',
          text: '"rounded"',
        },
        {
          name: 'since',
          text: 'v1.0.0',
        },
        {
          name: 'see',
          text: 'https://vuejs.org/',
        },
        {
          name: 'deprecated',
          text: 'v1.1.0',
        },
      ],
      required: true,
      type: 'string',
      declarations: [],
      schema: 'string',
    },
    typeSystem: 'JavaScript',
  },
  {
    propDef: {
      name: 'baz',
      type: {},
      required: true,
      description: 'description baz is required boolean',
      defaultValue: null,
      sbType: {
        name: 'other',
      },
    },
    docgenInfo: {
      name: 'baz',
      global: false,
      description: 'description baz is required boolean',
      tags: [],
      required: true,
      type: 'boolean',
      declarations: [],
      schema: {
        kind: 'enum',
        type: 'boolean',
        schema: ['false', 'true'],
      },
    },
    typeSystem: 'JavaScript',
  },
  {
    propDef: {
      name: 'union',
      type: {},
      required: true,
      description: 'description union is required union type',
      defaultValue: null,
      sbType: {
        name: 'other',
      },
    },
    docgenInfo: {
      name: 'union',
      global: false,
      description: 'description union is required union type',
      tags: [],
      required: true,
      type: 'string | number',
      declarations: [],
      schema: {
        kind: 'enum',
        type: 'string | number',
        schema: ['string', 'number'],
      },
    },
    typeSystem: 'JavaScript',
  },
  {
    propDef: {
      name: 'unionOptional',
      type: {},
      required: false,
      description: 'description unionOptional is optional union type',
      defaultValue: null,
      sbType: {
        name: 'other',
      },
    },
    docgenInfo: {
      name: 'unionOptional',
      global: false,
      description: 'description unionOptional is optional union type',
      tags: [],
      required: false,
      type: 'string | number | boolean | undefined',
      declarations: [],
      schema: {
        kind: 'enum',
        type: 'string | number | boolean | undefined',
        schema: ['undefined', 'string', 'number', 'false', 'true'],
      },
    },
    typeSystem: 'JavaScript',
  },
  {
    propDef: {
      name: 'nested',
      type: {},
      required: true,
      description: 'description nested is required nested object',
      defaultValue: null,
      sbType: {
        name: 'other',
      },
    },
    docgenInfo: {
      name: 'nested',
      global: false,
      description: 'description nested is required nested object',
      tags: [],
      required: true,
      type: 'MyNestedProps',
      declarations: [],
      schema: {
        kind: 'object',
        type: 'MyNestedProps',
        schema: {
          nestedProp: {
            name: 'nestedProp',
            global: false,
            description: 'nested prop documentation',
            tags: [],
            required: true,
            type: 'string',
            declarations: [],
            schema: 'string',
          },
        },
      },
    },
    typeSystem: 'JavaScript',
  },
  {
    propDef: {
      name: 'nestedIntersection',
      type: {},
      required: true,
      description: 'description required nested object with intersection',
      defaultValue: null,
      sbType: {
        name: 'other',
      },
    },
    docgenInfo: {
      name: 'nestedIntersection',
      global: false,
      description: 'description required nested object with intersection',
      tags: [],
      required: true,
      type: 'MyNestedProps & { additionalProp: string; }',
      declarations: [],
      schema: {
        kind: 'object',
        type: 'MyNestedProps & { additionalProp: string; }',
        schema: {
          nestedProp: {
            name: 'nestedProp',
            global: false,
            description: 'nested prop documentation',
            tags: [],
            required: true,
            type: 'string',
            declarations: [],
            schema: 'string',
          },
          additionalProp: {
            name: 'additionalProp',
            global: false,
            description: 'description required additional property',
            tags: [],
            required: true,
            type: 'string',
            declarations: [],
            schema: 'string',
          },
        },
      },
    },
    typeSystem: 'JavaScript',
  },
  {
    propDef: {
      name: 'nestedOptional',
      type: {},
      required: false,
      description: 'description optional nested object',
      defaultValue: null,
      sbType: {
        name: 'other',
      },
    },
    docgenInfo: {
      name: 'nestedOptional',
      global: false,
      description: 'description optional nested object',
      tags: [],
      required: false,
      type: 'MyNestedProps | MyIgnoredNestedProps | undefined',
      declarations: [],
      schema: {
        kind: 'enum',
        type: 'MyNestedProps | MyIgnoredNestedProps | undefined',
        schema: [
          'undefined',
          {
            kind: 'object',
            type: 'MyNestedProps',
            schema: {
              nestedProp: {
                name: 'nestedProp',
                global: false,
                description: 'nested prop documentation',
                tags: [],
                required: true,
                type: 'string',
                declarations: [],
                schema: 'string',
              },
            },
          },
          {
            kind: 'object',
            type: 'MyIgnoredNestedProps',
            schema: {
              nestedProp: {
                name: 'nestedProp',
                global: false,
                description: '',
                tags: [],
                required: true,
                type: 'string',
                declarations: [],
                schema: 'string',
              },
            },
          },
        ],
      },
    },
    typeSystem: 'JavaScript',
  },
  {
    propDef: {
      name: 'array',
      type: {},
      required: true,
      description: 'description required array object',
      defaultValue: null,
      sbType: {
        name: 'other',
      },
    },
    docgenInfo: {
      name: 'array',
      global: false,
      description: 'description required array object',
      tags: [],
      required: true,
      type: 'MyNestedProps[]',
      declarations: [],
      schema: {
        kind: 'array',
        type: 'MyNestedProps[]',
        schema: [
          {
            kind: 'object',
            type: 'MyNestedProps',
            schema: {
              nestedProp: {
                name: 'nestedProp',
                global: false,
                description: 'nested prop documentation',
                tags: [],
                required: true,
                type: 'string',
                declarations: [],
                schema: 'string',
              },
            },
          },
        ],
      },
    },
    typeSystem: 'JavaScript',
  },
  {
    propDef: {
      name: 'arrayOptional',
      type: {},
      required: false,
      description: 'description optional array object',
      defaultValue: null,
      sbType: {
        name: 'other',
      },
    },
    docgenInfo: {
      name: 'arrayOptional',
      global: false,
      description: 'description optional array object',
      tags: [],
      required: false,
      type: 'MyNestedProps[] | undefined',
      declarations: [],
      schema: {
        kind: 'enum',
        type: 'MyNestedProps[] | undefined',
        schema: [
          'undefined',
          {
            kind: 'array',
            type: 'MyNestedProps[]',
            schema: [
              {
                kind: 'object',
                type: 'MyNestedProps',
                schema: {
                  nestedProp: {
                    name: 'nestedProp',
                    global: false,
                    description: 'nested prop documentation',
                    tags: [],
                    required: true,
                    type: 'string',
                    declarations: [],
                    schema: 'string',
                  },
                },
              },
            ],
          },
        ],
      },
    },
    typeSystem: 'JavaScript',
  },
  {
    propDef: {
      name: 'enumValue',
      type: {},
      required: true,
      description: 'description enum value',
      defaultValue: null,
      sbType: {
        name: 'other',
      },
    },
    docgenInfo: {
      name: 'enumValue',
      global: false,
      description: 'description enum value',
      tags: [],
      required: true,
      type: 'MyEnum',
      declarations: [],
      schema: {
        kind: 'enum',
        type: 'MyEnum',
        schema: ['MyEnum.Small', 'MyEnum.Medium', 'MyEnum.Large'],
      },
    },
    typeSystem: 'JavaScript',
  },
  {
    propDef: {
      name: 'literalFromContext',
      type: {},
      required: true,
      description: 'description literal type alias that require context',
      defaultValue: null,
      sbType: {
        name: 'other',
      },
    },
    docgenInfo: {
      name: 'literalFromContext',
      global: false,
      description: 'description literal type alias that require context',
      tags: [],
      required: true,
      type: '"Uncategorized" | "Content" | "Interaction" | "Display" | "Forms" | "Addons"',
      declarations: [],
      schema: {
        kind: 'enum',
        type: '"Uncategorized" | "Content" | "Interaction" | "Display" | "Forms" | "Addons"',
        schema: [
          '"Uncategorized"',
          '"Content"',
          '"Interaction"',
          '"Display"',
          '"Forms"',
          '"Addons"',
        ],
      },
    },
    typeSystem: 'JavaScript',
  },
  {
    propDef: {
      name: 'inlined',
      type: {},
      required: true,
      description: '',
      defaultValue: null,
      sbType: {
        name: 'other',
      },
    },
    docgenInfo: {
      name: 'inlined',
      global: false,
      description: '',
      tags: [],
      required: true,
      type: '{ foo: string; }',
      declarations: [],
      schema: {
        kind: 'object',
        type: '{ foo: string; }',
        schema: {
          foo: {
            name: 'foo',
            global: false,
            description: '',
            tags: [],
            required: true,
            type: 'string',
            declarations: [],
            schema: 'string',
          },
        },
      },
    },
    typeSystem: 'JavaScript',
  },
  {
    propDef: {
      name: 'recursive',
      type: {},
      required: false,
      description: '',
      defaultValue: null,
      sbType: {
        name: 'other',
      },
    },
    docgenInfo: {
      name: 'recursive',
      global: false,
      description: '',
      tags: [],
      required: false,
      type: 'MyNestedRecursiveProps | undefined',
      declarations: [],
      schema: {
        kind: 'enum',
        type: 'MyNestedRecursiveProps | undefined',
        schema: [
          'undefined',
          {
            kind: 'object',
            type: 'MyNestedRecursiveProps',
            schema: {
              recursive: {
                name: 'recursive',
                global: false,
                description: '',
                tags: [],
                required: true,
                type: 'MyNestedRecursiveProps',
                declarations: [],
                schema: 'MyNestedRecursiveProps',
              },
            },
          },
        ],
      },
    },
    typeSystem: 'JavaScript',
  },
];

export const referenceTypeEvents = {
  __name: 'component',
  emits: ['foo', 'bar', 'baz'],
  __hmrId: '3a8b03b5',
  __file:
    '/storybook/sandbox/vue3-vite-default-ts/src/stories/renderers/vue3/component-meta/reference-type-events/component.vue',
  __docgenInfo: {
    exportName: 'default',
    displayName: 'component',
    props: [
      {
        name: 'key',
        global: true,
        description: '',
        tags: [],
        required: false,
        type: 'string | number | symbol | undefined',
        declarations: [
          {
            file: '/storybook/sandbox/vue3-vite-default-ts/node_modules/@vue/runtime-core/dist/runtime-core.d.ts',
            range: [47082, 47113],
          },
        ],
        schema: {
          kind: 'enum',
          type: 'string | number | symbol | undefined',
          schema: ['undefined', 'string', 'number', 'symbol'],
        },
      },
      {
        name: 'ref',
        global: true,
        description: '',
        tags: [],
        required: false,
        type: 'VNodeRef | undefined',
        declarations: [
          {
            file: '/storybook/sandbox/vue3-vite-default-ts/node_modules/@vue/runtime-core/dist/runtime-core.d.ts',
            range: [47118, 47133],
          },
        ],
        schema: {
          kind: 'enum',
          type: 'VNodeRef | undefined',
          schema: [
            'undefined',
            'string',
            'Ref<any>',
            {
              kind: 'event',
              type: '(ref: Element | ComponentPublicInstance<{}, {}, {}, {}, {}, {}, {}, {}, false, ComponentOptionsBase<any, any, any, any, any, any, any, any, any, {}, {}, string, {}>, {}, {}> | null, refs: Record<...>): void',
              schema: [],
            },
          ],
        },
      },
      {
        name: 'ref_for',
        global: true,
        description: '',
        tags: [],
        required: false,
        type: 'boolean | undefined',
        declarations: [
          {
            file: '/storybook/sandbox/vue3-vite-default-ts/node_modules/@vue/runtime-core/dist/runtime-core.d.ts',
            range: [47138, 47156],
          },
        ],
        schema: {
          kind: 'enum',
          type: 'boolean | undefined',
          schema: ['undefined', 'false', 'true'],
        },
      },
      {
        name: 'ref_key',
        global: true,
        description: '',
        tags: [],
        required: false,
        type: 'string | undefined',
        declarations: [
          {
            file: '/storybook/sandbox/vue3-vite-default-ts/node_modules/@vue/runtime-core/dist/runtime-core.d.ts',
            range: [47161, 47178],
          },
        ],
        schema: {
          kind: 'enum',
          type: 'string | undefined',
          schema: ['undefined', 'string'],
        },
      },
      {
        name: 'class',
        global: true,
        description: '',
        tags: [],
        required: false,
        type: 'unknown',
        declarations: [
          {
            file: '/storybook/sandbox/vue3-vite-default-ts/node_modules/@vue/runtime-core/dist/runtime-core.d.ts',
            range: [52888, 52904],
          },
        ],
        schema: 'unknown',
      },
      {
        name: 'style',
        global: true,
        description: '',
        tags: [],
        required: false,
        type: 'unknown',
        declarations: [
          {
            file: '/storybook/sandbox/vue3-vite-default-ts/node_modules/@vue/runtime-core/dist/runtime-core.d.ts',
            range: [52909, 52925],
          },
        ],
        schema: 'unknown',
      },
    ],
    events: [
      {
        name: 'foo',
        type: '[data?: { foo: string; } | undefined]',
        signature: '(event: "foo", data?: { foo: string; } | undefined): void',
        declarations: [
          {
            file: '/storybook/sandbox/vue3-vite-default-ts/node_modules/@vue/runtime-core/dist/runtime-core.d.ts',
            range: [4468, 4503],
          },
        ],
        schema: [
          {
            kind: 'enum',
            type: '{ foo: string; } | undefined',
            schema: [
              'undefined',
              {
                kind: 'object',
                type: '{ foo: string; }',
                schema: {
                  foo: {
                    name: 'foo',
                    global: false,
                    description: '',
                    tags: [],
                    required: true,
                    type: 'string',
                    declarations: [
                      {
                        file: '/storybook/sandbox/vue3-vite-default-ts/src/stories/renderers/vue3/component-meta/reference-type-events/component.vue',
                        range: [207, 218],
                      },
                    ],
                    schema: 'string',
                  },
                },
              },
            ],
          },
        ],
      },
      {
        name: 'bar',
        type: '[value: { year: number; title?: any; }]',
        signature: '(event: "bar", value: { year: number; title?: any; }): void',
        declarations: [
          {
            file: '/storybook/sandbox/vue3-vite-default-ts/node_modules/@vue/runtime-core/dist/runtime-core.d.ts',
            range: [4468, 4503],
          },
        ],
        schema: [
          {
            kind: 'object',
            type: '{ year: number; title?: any; }',
            schema: {
              year: {
                name: 'year',
                global: false,
                description: '',
                tags: [],
                required: true,
                type: 'number',
                declarations: [
                  {
                    file: '/storybook/sandbox/vue3-vite-default-ts/src/stories/renderers/vue3/component-meta/reference-type-events/component.vue',
                    range: [255, 268],
                  },
                ],
                schema: 'number',
              },
              title: {
                name: 'title',
                global: false,
                description: '',
                tags: [],
                required: false,
                type: 'any',
                declarations: [
                  {
                    file: '/storybook/sandbox/vue3-vite-default-ts/src/stories/renderers/vue3/component-meta/reference-type-events/component.vue',
                    range: [269, 280],
                  },
                ],
                schema: 'any',
              },
            },
          },
        ],
      },
      {
        name: 'baz',
        type: '[]',
        signature: '(event: "baz"): void',
        declarations: [
          {
            file: '/storybook/sandbox/vue3-vite-default-ts/node_modules/@vue/runtime-core/dist/runtime-core.d.ts',
            range: [4468, 4503],
          },
        ],
        schema: [],
      },
    ],
    slots: [],
    exposed: [
      {
        name: 'onFoo',
        type: '((data?: { foo: string; } | undefined) => any) | undefined',
        description: '',
        declarations: [],
        schema: {
          kind: 'enum',
          type: '((data?: { foo: string; } | undefined) => any) | undefined',
          schema: [
            'undefined',
            {
              kind: 'event',
              type: '(data?: { foo: string; } | undefined): any',
              schema: [
                {
                  kind: 'enum',
                  type: '{ foo: string; } | undefined',
                  schema: [
                    'undefined',
                    {
                      kind: 'object',
                      type: '{ foo: string; }',
                      schema: {
                        foo: {
                          name: 'foo',
                          global: false,
                          description: '',
                          tags: [],
                          required: true,
                          type: 'string',
                          declarations: [
                            {
                              file: '/storybook/sandbox/vue3-vite-default-ts/src/stories/renderers/vue3/component-meta/reference-type-events/component.vue',
                              range: [207, 218],
                            },
                          ],
                          schema: 'string',
                        },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
      {
        name: 'onBar',
        type: '((value: { year: number; title?: any; }) => any) | undefined',
        description: '',
        declarations: [],
        schema: {
          kind: 'enum',
          type: '((value: { year: number; title?: any; }) => any) | undefined',
          schema: [
            'undefined',
            {
              kind: 'event',
              type: '(value: { year: number; title?: any; }): any',
              schema: [
                {
                  kind: 'object',
                  type: '{ year: number; title?: any; }',
                  schema: {
                    year: {
                      name: 'year',
                      global: false,
                      description: '',
                      tags: [],
                      required: true,
                      type: 'number',
                      declarations: [
                        {
                          file: '/storybook/sandbox/vue3-vite-default-ts/src/stories/renderers/vue3/component-meta/reference-type-events/component.vue',
                          range: [255, 268],
                        },
                      ],
                      schema: 'number',
                    },
                    title: {
                      name: 'title',
                      global: false,
                      description: '',
                      tags: [],
                      required: false,
                      type: 'any',
                      declarations: [
                        {
                          file: '/storybook/sandbox/vue3-vite-default-ts/src/stories/renderers/vue3/component-meta/reference-type-events/component.vue',
                          range: [269, 280],
                        },
                      ],
                      schema: 'any',
                    },
                  },
                },
              ],
            },
          ],
        },
      },
      {
        name: 'onBaz',
        type: '(() => any) | undefined',
        description: '',
        declarations: [],
        schema: {
          kind: 'enum',
          type: '(() => any) | undefined',
          schema: [
            'undefined',
            {
              kind: 'event',
              type: '(): any',
              schema: [],
            },
          ],
        },
      },
    ],
    sourceFiles:
      '/storybook/sandbox/vue3-vite-default-ts/src/stories/renderers/vue3/component-meta/reference-type-events/component.vue',
  },
};

export const mockExtractComponentEventsReturn = [
  {
    propDef: {
      name: 'foo',
      type: {},
      defaultValue: null,
      sbType: {
        name: 'other',
      },
    },
    docgenInfo: {
      name: 'foo',
      type: '[data?: { foo: string; } | undefined]',
      signature: '(event: "foo", data?: { foo: string; } | undefined): void',
      declarations: [
        {
          file: '/storybook/sandbox/vue3-vite-default-ts/node_modules/@vue/runtime-core/dist/runtime-core.d.ts',
          range: [4468, 4503],
        },
      ],
      schema: [
        {
          kind: 'enum',
          type: '{ foo: string; } | undefined',
          schema: [
            'undefined',
            {
              kind: 'object',
              type: '{ foo: string; }',
              schema: {
                foo: {
                  name: 'foo',
                  global: false,
                  description: '',
                  tags: [],
                  required: true,
                  type: 'string',
                  declarations: [
                    {
                      file: '/storybook/sandbox/vue3-vite-default-ts/src/stories/renderers/vue3/component-meta/reference-type-events/component.vue',
                      range: [207, 218],
                    },
                  ],
                  schema: 'string',
                },
              },
            },
          ],
        },
      ],
    },
    typeSystem: 'JavaScript',
  },
  {
    propDef: {
      name: 'bar',
      type: {},
      defaultValue: null,
      sbType: {
        name: 'other',
      },
    },
    docgenInfo: {
      name: 'bar',
      type: '[value: { year: number; title?: any; }]',
      signature: '(event: "bar", value: { year: number; title?: any; }): void',
      declarations: [
        {
          file: '/storybook/sandbox/vue3-vite-default-ts/node_modules/@vue/runtime-core/dist/runtime-core.d.ts',
          range: [4468, 4503],
        },
      ],
      schema: [
        {
          kind: 'object',
          type: '{ year: number; title?: any; }',
          schema: {
            year: {
              name: 'year',
              global: false,
              description: '',
              tags: [],
              required: true,
              type: 'number',
              declarations: [
                {
                  file: '/storybook/sandbox/vue3-vite-default-ts/src/stories/renderers/vue3/component-meta/reference-type-events/component.vue',
                  range: [255, 268],
                },
              ],
              schema: 'number',
            },
            title: {
              name: 'title',
              global: false,
              description: '',
              tags: [],
              required: false,
              type: 'any',
              declarations: [
                {
                  file: '/storybook/sandbox/vue3-vite-default-ts/src/stories/renderers/vue3/component-meta/reference-type-events/component.vue',
                  range: [269, 280],
                },
              ],
              schema: 'any',
            },
          },
        },
      ],
    },
    typeSystem: 'JavaScript',
  },
  {
    propDef: {
      name: 'baz',
      type: {},
      defaultValue: null,
      sbType: {
        name: 'other',
      },
    },
    docgenInfo: {
      name: 'baz',
      type: '[]',
      signature: '(event: "baz"): void',
      declarations: [
        {
          file: '/storybook/sandbox/vue3-vite-default-ts/node_modules/@vue/runtime-core/dist/runtime-core.d.ts',
          range: [4468, 4503],
        },
      ],
      schema: [],
    },
    typeSystem: 'JavaScript',
  },
];

export const templateSlots = {
  __hmrId: 'c8033161',
  __file:
    '/storybook/sandbox/vue3-vite-default-ts/src/stories/renderers/vue3/component-meta/template-slots/component.vue',
  __docgenInfo: {
    exportName: 'default',
    displayName: 'component',
    props: [
      {
        name: 'key',
        global: true,
        description: '',
        tags: [],
        required: false,
        type: 'string | number | symbol | undefined',
        declarations: [
          {
            file: '/storybook/sandbox/vue3-vite-default-ts/node_modules/@vue/runtime-core/dist/runtime-core.d.ts',
            range: [47082, 47113],
          },
        ],
        schema: {
          kind: 'enum',
          type: 'string | number | symbol | undefined',
          schema: ['undefined', 'string', 'number', 'symbol'],
        },
      },
      {
        name: 'ref',
        global: true,
        description: '',
        tags: [],
        required: false,
        type: 'VNodeRef | undefined',
        declarations: [
          {
            file: '/storybook/sandbox/vue3-vite-default-ts/node_modules/@vue/runtime-core/dist/runtime-core.d.ts',
            range: [47118, 47133],
          },
        ],
        schema: {
          kind: 'enum',
          type: 'VNodeRef | undefined',
          schema: [
            'undefined',
            'string',
            'Ref<any>',
            {
              kind: 'event',
              type: '(ref: Element | ComponentPublicInstance<{}, {}, {}, {}, {}, {}, {}, {}, false, ComponentOptionsBase<any, any, any, any, any, any, any, any, any, {}, {}, string, {}>, {}, {}> | null, refs: Record<...>): void',
              schema: [],
            },
          ],
        },
      },
      {
        name: 'ref_for',
        global: true,
        description: '',
        tags: [],
        required: false,
        type: 'boolean | undefined',
        declarations: [
          {
            file: '/storybook/sandbox/vue3-vite-default-ts/node_modules/@vue/runtime-core/dist/runtime-core.d.ts',
            range: [47138, 47156],
          },
        ],
        schema: {
          kind: 'enum',
          type: 'boolean | undefined',
          schema: ['undefined', 'false', 'true'],
        },
      },
      {
        name: 'ref_key',
        global: true,
        description: '',
        tags: [],
        required: false,
        type: 'string | undefined',
        declarations: [
          {
            file: '/storybook/sandbox/vue3-vite-default-ts/node_modules/@vue/runtime-core/dist/runtime-core.d.ts',
            range: [47161, 47178],
          },
        ],
        schema: {
          kind: 'enum',
          type: 'string | undefined',
          schema: ['undefined', 'string'],
        },
      },
      {
        name: 'class',
        global: true,
        description: '',
        tags: [],
        required: false,
        type: 'unknown',
        declarations: [
          {
            file: '/storybook/sandbox/vue3-vite-default-ts/node_modules/@vue/runtime-core/dist/runtime-core.d.ts',
            range: [52888, 52904],
          },
        ],
        schema: 'unknown',
      },
      {
        name: 'style',
        global: true,
        description: '',
        tags: [],
        required: false,
        type: 'unknown',
        declarations: [
          {
            file: '/storybook/sandbox/vue3-vite-default-ts/node_modules/@vue/runtime-core/dist/runtime-core.d.ts',
            range: [52909, 52925],
          },
        ],
        schema: 'unknown',
      },
    ],
    events: [],
    slots: [
      {
        name: 'no-bind',
        type: '{}',
        description: '',
        declarations: [],
        schema: {
          kind: 'object',
          type: '{}',
          schema: {},
        },
      },
      {
        name: 'default',
        type: '{ num: number; }',
        description: '',
        declarations: [],
        schema: {
          kind: 'object',
          type: '{ num: number; }',
          schema: {
            num: {
              name: 'num',
              global: false,
              description: '',
              tags: [],
              required: true,
              type: 'number',
              declarations: [],
              schema: 'number',
            },
          },
        },
      },
      {
        name: 'named',
        type: '{ str: string; }',
        description: '',
        declarations: [],
        schema: {
          kind: 'object',
          type: '{ str: string; }',
          schema: {
            str: {
              name: 'str',
              global: false,
              description: '',
              tags: [],
              required: true,
              type: 'string',
              declarations: [],
              schema: 'string',
            },
          },
        },
      },
      {
        name: 'vbind',
        type: '{ num: number; str: string; }',
        description: '',
        declarations: [],
        schema: {
          kind: 'object',
          type: '{ num: number; str: string; }',
          schema: {
            num: {
              name: 'num',
              global: false,
              description: '',
              tags: [],
              required: true,
              type: 'number',
              declarations: [
                {
                  file: '/storybook/sandbox/vue3-vite-default-ts/src/stories/renderers/vue3/component-meta/template-slots/component.vue',
                  range: [153, 161],
                },
              ],
              schema: 'number',
            },
            str: {
              name: 'str',
              global: false,
              description: '',
              tags: [],
              required: true,
              type: 'string',
              declarations: [
                {
                  file: '/storybook/sandbox/vue3-vite-default-ts/src/stories/renderers/vue3/component-meta/template-slots/component.vue',
                  range: [163, 173],
                },
              ],
              schema: 'string',
            },
          },
        },
      },
    ],
    exposed: [
      {
        name: '$slots',
        type: 'Readonly<InternalSlots> & { "no-bind"?(_: {}): any; default?(_: { num: number; }): any; named?(_: { str: string; }): any; vbind?(_: { num: number; str: string; }): any; }',
        description: '',
        declarations: [
          {
            file: '/storybook/sandbox/vue3-vite-default-ts/node_modules/@vue/runtime-core/dist/runtime-core.d.ts',
            range: [8406, 8433],
          },
        ],
        schema: {
          kind: 'object',
          type: 'Readonly<InternalSlots> & { "no-bind"?(_: {}): any; default?(_: { num: number; }): any; named?(_: { str: string; }): any; vbind?(_: { num: number; str: string; }): any; }',
          schema: {
            'no-bind': {
              name: 'no-bind',
              global: false,
              description: '',
              tags: [],
              required: false,
              type: '((_: {}) => any) | undefined',
              declarations: [],
              schema: {
                kind: 'enum',
                type: '((_: {}) => any) | undefined',
                schema: [
                  'undefined',
                  {
                    kind: 'event',
                    type: '(_: {}): any',
                    schema: [],
                  },
                ],
              },
            },
            default: {
              name: 'default',
              global: false,
              description: '',
              tags: [],
              required: false,
              type: '((_: { num: number; }) => any) | undefined',
              declarations: [],
              schema: {
                kind: 'enum',
                type: '((_: { num: number; }) => any) | undefined',
                schema: [
                  'undefined',
                  {
                    kind: 'event',
                    type: '(_: { num: number; }): any',
                    schema: [],
                  },
                ],
              },
            },
            named: {
              name: 'named',
              global: false,
              description: '',
              tags: [],
              required: false,
              type: '((_: { str: string; }) => any) | undefined',
              declarations: [],
              schema: {
                kind: 'enum',
                type: '((_: { str: string; }) => any) | undefined',
                schema: [
                  'undefined',
                  {
                    kind: 'event',
                    type: '(_: { str: string; }): any',
                    schema: [],
                  },
                ],
              },
            },
            vbind: {
              name: 'vbind',
              global: false,
              description: '',
              tags: [],
              required: false,
              type: '((_: { num: number; str: string; }) => any) | undefined',
              declarations: [],
              schema: {
                kind: 'enum',
                type: '((_: { num: number; str: string; }) => any) | undefined',
                schema: [
                  'undefined',
                  {
                    kind: 'event',
                    type: '(_: { num: number; str: string; }): any',
                    schema: [],
                  },
                ],
              },
            },
          },
        },
      },
    ],
    sourceFiles:
      '/storybook/sandbox/vue3-vite-default-ts/src/stories/renderers/vue3/component-meta/template-slots/component.vue',
  },
};

export const mockExtractComponentSlotsReturn = [
  {
    propDef: {
      name: 'no-bind',
      type: {},
      description: '',
      defaultValue: null,
      sbType: {
        name: 'other',
      },
    },
    docgenInfo: {
      name: 'no-bind',
      type: '{}',
      description: '',
      declarations: [],
      schema: {
        kind: 'object',
        type: '{}',
        schema: {},
      },
    },
    typeSystem: 'JavaScript',
  },
  {
    propDef: {
      name: 'default',
      type: {},
      description: '',
      defaultValue: null,
      sbType: {
        name: 'other',
      },
    },
    docgenInfo: {
      name: 'default',
      type: '{ num: number; }',
      description: '',
      declarations: [],
      schema: {
        kind: 'object',
        type: '{ num: number; }',
        schema: {
          num: {
            name: 'num',
            global: false,
            description: '',
            tags: [],
            required: true,
            type: 'number',
            declarations: [],
            schema: 'number',
          },
        },
      },
    },
    typeSystem: 'JavaScript',
  },
  {
    propDef: {
      name: 'named',
      type: {},
      description: '',
      defaultValue: null,
      sbType: {
        name: 'other',
      },
    },
    docgenInfo: {
      name: 'named',
      type: '{ str: string; }',
      description: '',
      declarations: [],
      schema: {
        kind: 'object',
        type: '{ str: string; }',
        schema: {
          str: {
            name: 'str',
            global: false,
            description: '',
            tags: [],
            required: true,
            type: 'string',
            declarations: [],
            schema: 'string',
          },
        },
      },
    },
    typeSystem: 'JavaScript',
  },
  {
    propDef: {
      name: 'vbind',
      type: {},
      description: '',
      defaultValue: null,
      sbType: {
        name: 'other',
      },
    },
    docgenInfo: {
      name: 'vbind',
      type: '{ num: number; str: string; }',
      description: '',
      declarations: [],
      schema: {
        kind: 'object',
        type: '{ num: number; str: string; }',
        schema: {
          num: {
            name: 'num',
            global: false,
            description: '',
            tags: [],
            required: true,
            type: 'number',
            declarations: [
              {
                file: '/storybook/sandbox/vue3-vite-default-ts/src/stories/renderers/vue3/component-meta/template-slots/component.vue',
                range: [153, 161],
              },
            ],
            schema: 'number',
          },
          str: {
            name: 'str',
            global: false,
            description: '',
            tags: [],
            required: true,
            type: 'string',
            declarations: [
              {
                file: '/storybook/sandbox/vue3-vite-default-ts/src/stories/renderers/vue3/component-meta/template-slots/component.vue',
                range: [163, 173],
              },
            ],
            schema: 'string',
          },
        },
      },
    },
    typeSystem: 'JavaScript',
  },
];
