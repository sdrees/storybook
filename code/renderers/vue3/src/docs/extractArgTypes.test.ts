import { extractComponentProps, hasDocgen } from '@storybook/docs-tools';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi, vitest } from 'vitest';
import { extractArgTypes } from './extractArgTypes';
import {
  mockExtractComponentEventsReturn,
  mockExtractComponentPropsReturn,
  mockExtractComponentSlotsReturn,
  referenceTypeEvents,
  referenceTypeProps,
  templateSlots,
} from './tests-meta-components/meta-components';

vitest.mock('@storybook/docs-tools');

describe('extractArgTypes', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return null if component does not contain docs', () => {
    (hasDocgen as Mock).mockReturnValueOnce(false);
    (extractComponentProps as Mock).mockReturnValueOnce([] as any);

    expect(extractArgTypes({} as any)).toBeNull();
  });

  it('should extract arg types for component', () => {
    const component = referenceTypeProps;
    (hasDocgen as Mock).mockReturnValueOnce(true);
    (extractComponentProps as Mock).mockReturnValue(mockExtractComponentPropsReturn);

    const argTypes = extractArgTypes(component);

    expect(argTypes).toMatchInlineSnapshot(`
      {
        "array": {
          "control": {
            "disabled": false,
          },
          "defaultValue": {
            "summary": undefined,
          },
          "description": "description required array object",
          "name": "array",
          "table": {
            "category": "props",
            "defaultValue": {
              "summary": undefined,
            },
            "jsDocTags": [],
            "type": {
              "summary": "MyNestedProps[]",
            },
          },
          "type": {
            "name": "array",
            "required": true,
            "value": {
              "name": "object",
              "required": false,
              "value": {
                "nestedProp": {
                  "name": "string",
                  "required": true,
                },
              },
            },
          },
        },
        "arrayOptional": {
          "control": {
            "disabled": false,
          },
          "defaultValue": {
            "summary": undefined,
          },
          "description": "description optional array object",
          "name": "arrayOptional",
          "table": {
            "category": "props",
            "defaultValue": {
              "summary": undefined,
            },
            "jsDocTags": [],
            "type": {
              "summary": "MyNestedProps[]",
            },
          },
          "type": {
            "name": "array",
            "required": false,
            "value": {
              "name": "object",
              "required": false,
              "value": {
                "nestedProp": {
                  "name": "string",
                  "required": true,
                },
              },
            },
          },
        },
        "bar": {
          "control": {
            "disabled": false,
          },
          "defaultValue": {
            "summary": "1",
          },
          "description": "description bar is optional number",
          "name": "bar",
          "table": {
            "category": "props",
            "defaultValue": {
              "summary": "1",
            },
            "jsDocTags": [],
            "type": {
              "summary": "number",
            },
          },
          "type": {
            "name": "number",
            "required": false,
          },
        },
        "baz": {
          "control": {
            "disabled": false,
          },
          "defaultValue": {
            "summary": undefined,
          },
          "description": "description baz is required boolean",
          "name": "baz",
          "table": {
            "category": "props",
            "defaultValue": {
              "summary": undefined,
            },
            "jsDocTags": [],
            "type": {
              "summary": "boolean",
            },
          },
          "type": {
            "name": "boolean",
            "required": true,
          },
        },
        "enumValue": {
          "control": {
            "disabled": false,
          },
          "defaultValue": {
            "summary": undefined,
          },
          "description": "description enum value",
          "name": "enumValue",
          "table": {
            "category": "props",
            "defaultValue": {
              "summary": undefined,
            },
            "jsDocTags": [],
            "type": {
              "summary": "MyEnum",
            },
          },
          "type": {
            "name": "enum",
            "required": true,
            "value": [
              "MyEnum.Small",
              "MyEnum.Medium",
              "MyEnum.Large",
            ],
          },
        },
        "foo": {
          "control": {
            "disabled": false,
          },
          "defaultValue": {
            "summary": undefined,
          },
          "description": "@default: "rounded"<br>@since: v1.0.0<br>@see: https://vuejs.org/<br>@deprecated: v1.1.0<br><br>string foo",
          "name": "foo",
          "table": {
            "category": "props",
            "defaultValue": {
              "summary": undefined,
            },
            "jsDocTags": [
              {
                "name": "default",
                "text": ""rounded"",
              },
              {
                "name": "since",
                "text": "v1.0.0",
              },
              {
                "name": "see",
                "text": "https://vuejs.org/",
              },
              {
                "name": "deprecated",
                "text": "v1.1.0",
              },
            ],
            "type": {
              "summary": "string",
            },
          },
          "type": {
            "name": "string",
            "required": true,
          },
        },
        "inlined": {
          "control": {
            "disabled": false,
          },
          "defaultValue": {
            "summary": undefined,
          },
          "description": "",
          "name": "inlined",
          "table": {
            "category": "props",
            "defaultValue": {
              "summary": undefined,
            },
            "jsDocTags": [],
            "type": {
              "summary": "{ foo: string; }",
            },
          },
          "type": {
            "name": "object",
            "required": true,
            "value": {
              "foo": {
                "name": "string",
                "required": true,
              },
            },
          },
        },
        "literalFromContext": {
          "control": {
            "disabled": false,
          },
          "defaultValue": {
            "summary": undefined,
          },
          "description": "description literal type alias that require context",
          "name": "literalFromContext",
          "table": {
            "category": "props",
            "defaultValue": {
              "summary": undefined,
            },
            "jsDocTags": [],
            "type": {
              "summary": ""Uncategorized" | "Content" | "Interaction" | "Display" | "Forms" | "Addons"",
            },
          },
          "type": {
            "name": "enum",
            "required": true,
            "value": [
              "Uncategorized",
              "Content",
              "Interaction",
              "Display",
              "Forms",
              "Addons",
            ],
          },
        },
        "nested": {
          "control": {
            "disabled": false,
          },
          "defaultValue": {
            "summary": undefined,
          },
          "description": "description nested is required nested object",
          "name": "nested",
          "table": {
            "category": "props",
            "defaultValue": {
              "summary": undefined,
            },
            "jsDocTags": [],
            "type": {
              "summary": "MyNestedProps",
            },
          },
          "type": {
            "name": "object",
            "required": true,
            "value": {
              "nestedProp": {
                "name": "string",
                "required": true,
              },
            },
          },
        },
        "nestedIntersection": {
          "control": {
            "disabled": false,
          },
          "defaultValue": {
            "summary": undefined,
          },
          "description": "description required nested object with intersection",
          "name": "nestedIntersection",
          "table": {
            "category": "props",
            "defaultValue": {
              "summary": undefined,
            },
            "jsDocTags": [],
            "type": {
              "summary": "MyNestedProps & { additionalProp: string; }",
            },
          },
          "type": {
            "name": "object",
            "required": true,
            "value": {
              "additionalProp": {
                "name": "string",
                "required": true,
              },
              "nestedProp": {
                "name": "string",
                "required": true,
              },
            },
          },
        },
        "nestedOptional": {
          "control": {
            "disabled": false,
          },
          "defaultValue": {
            "summary": undefined,
          },
          "description": "description optional nested object",
          "name": "nestedOptional",
          "table": {
            "category": "props",
            "defaultValue": {
              "summary": undefined,
            },
            "jsDocTags": [],
            "type": {
              "summary": "MyNestedProps | MyIgnoredNestedProps",
            },
          },
          "type": {
            "name": {
              "kind": "enum",
              "schema": [
                "undefined",
                {
                  "kind": "object",
                  "schema": {
                    "nestedProp": {
                      "declarations": [],
                      "description": "nested prop documentation",
                      "global": false,
                      "name": "nestedProp",
                      "required": true,
                      "schema": "string",
                      "tags": [],
                      "type": "string",
                    },
                  },
                  "type": "MyNestedProps",
                },
                {
                  "kind": "object",
                  "schema": {
                    "nestedProp": {
                      "declarations": [],
                      "description": "",
                      "global": false,
                      "name": "nestedProp",
                      "required": true,
                      "schema": "string",
                      "tags": [],
                      "type": "string",
                    },
                  },
                  "type": "MyIgnoredNestedProps",
                },
              ],
              "type": "MyNestedProps | MyIgnoredNestedProps | undefined",
            },
            "required": false,
          },
        },
        "recursive": {
          "control": {
            "disabled": false,
          },
          "defaultValue": {
            "summary": undefined,
          },
          "description": "",
          "name": "recursive",
          "table": {
            "category": "props",
            "defaultValue": {
              "summary": undefined,
            },
            "jsDocTags": [],
            "type": {
              "summary": "MyNestedRecursiveProps",
            },
          },
          "type": {
            "name": "object",
            "required": false,
            "value": {
              "recursive": {
                "name": "MyNestedRecursiveProps",
                "required": true,
              },
            },
          },
        },
        "stringArray": {
          "control": {
            "disabled": false,
          },
          "defaultValue": {
            "summary": "["foo", "bar"]",
          },
          "description": "description stringArray is string array",
          "name": "stringArray",
          "table": {
            "category": "props",
            "defaultValue": {
              "summary": "["foo", "bar"]",
            },
            "jsDocTags": [],
            "type": {
              "summary": "string[]",
            },
          },
          "type": {
            "name": "array",
            "required": false,
            "value": {
              "name": "string",
              "required": false,
            },
          },
        },
        "union": {
          "control": {
            "disabled": false,
          },
          "defaultValue": {
            "summary": undefined,
          },
          "description": "description union is required union type",
          "name": "union",
          "table": {
            "category": "props",
            "defaultValue": {
              "summary": undefined,
            },
            "jsDocTags": [],
            "type": {
              "summary": "string | number",
            },
          },
          "type": {
            "name": "string",
            "required": true,
          },
        },
        "unionOptional": {
          "control": {
            "disabled": false,
          },
          "defaultValue": {
            "summary": undefined,
          },
          "description": "description unionOptional is optional union type",
          "name": "unionOptional",
          "table": {
            "category": "props",
            "defaultValue": {
              "summary": undefined,
            },
            "jsDocTags": [],
            "type": {
              "summary": "string | number | boolean",
            },
          },
          "type": {
            "name": "string",
            "required": false,
          },
        },
      }
    `);
  });

  it('should extract events for Vue component', () => {
    const component = referenceTypeEvents;
    (hasDocgen as Mock).mockReturnValueOnce(true);
    (extractComponentProps as Mock).mockReturnValue(mockExtractComponentEventsReturn);

    const argTypes = extractArgTypes(component);

    expect(argTypes).toMatchSnapshot();
  });

  it('should extract slots type for Vue component', () => {
    const component = templateSlots;
    (hasDocgen as Mock).mockReturnValueOnce(true);
    (extractComponentProps as Mock).mockReturnValue(mockExtractComponentSlotsReturn);

    const argTypes = extractArgTypes(component);

    expect(argTypes).toMatchSnapshot();
  });
});
