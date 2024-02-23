import type { SBType, StrictArgTypes } from '@storybook/types';

import {
  extractComponentProps,
  convert as genericConvert,
  hasDocgen,
  type ArgTypesExtractor,
  type DocgenInfo,
} from '@storybook/docs-tools';

type Schema = { kind: string; schema: [] | object; type?: string } | string;
type MetaDocgenInfo = DocgenInfo & {
  type: string | { name: string; value: string[] };
  default: string;
  global: boolean;
  name: string;
  schema?: Schema;
  tags?: { name: string; text: string }[];
};

// "exposed" is used by the vue-component-meta plugin while "expose" is used by vue-docgen-api
const ARG_TYPE_SECTIONS = ['props', 'events', 'slots', 'exposed', 'expose'] as const;

export const extractArgTypes: ArgTypesExtractor = (component) => {
  if (!hasDocgen(component)) {
    return null;
  }

  const argTypes: StrictArgTypes = {};

  ARG_TYPE_SECTIONS.forEach((section) => {
    const props = extractComponentProps(component, section);

    props.forEach((extractedProp) => {
      const docgenInfo = extractedProp.docgenInfo as MetaDocgenInfo;

      if (argTypes[docgenInfo.name] || docgenInfo.global) {
        return; // skip duplicate and global props
      }

      const type =
        typeof docgenInfo.type === 'string' ? docgenInfo.type : docgenInfo.type?.name ?? '';
      const sbType = section === 'props' ? convertPropType(docgenInfo) : ({ name: type } as SBType);

      const defaultValue = { summary: docgenInfo.default };

      argTypes[docgenInfo.name] = {
        name: docgenInfo.name,
        description: formatDescriptionWithTags(docgenInfo.description, docgenInfo.tags),
        defaultValue,
        type: sbType,
        table: {
          type: { summary: type.replace(' | undefined', '') },
          jsDocTags: docgenInfo.tags ?? [],
          defaultValue,
          category: section,
        },
        control: { disabled: !['props', 'slots'].includes(section) },
      };
    });
  });

  return argTypes;
};

/**
 * Converts the given prop type into a SBType so it can be correctly displayed in the UI (controls etc.).
 */
export const convertPropType = (propInfo: MetaDocgenInfo): SBType => {
  const schema = propInfo.schema;
  const required = propInfo.required ?? false;
  const fallbackSbType = { name: schema, required } as SBType;

  if (!schema) return genericConvert(propInfo) ?? fallbackSbType;
  if (typeof schema === 'string') return fallbackSbType;

  // convert enum schemas (e.g. union or enum type to corresponding SBType)
  //  so the enum values can be selected via radio/dropdown in the UI
  if (schema.kind === 'enum' && Array.isArray(schema.schema)) {
    // filter out empty or "undefined" for optional props
    const definedValues = schema.schema.filter((item) => item != null && item !== 'undefined');

    if (definedValues.length === 1 && typeof definedValues[0] === 'object') {
      return convertPropType({ schema: definedValues[0] } as MetaDocgenInfo);
    }

    const values = definedValues
      .filter((item: Schema) => typeof item === 'string')
      .map((item: Schema) => (typeof item !== 'string' ? item.schema.toString() : item))
      .map((item: string) => item.replace(/'/g, '"'));

    if (values.length === 0) return fallbackSbType;

    const isBoolean = values.length === 2 && values.includes('true') && values.includes('false');
    if (isBoolean) return { name: 'boolean', required };

    const isLateralUnion =
      values.length > 1 && values.every((item) => item.startsWith('"') && item.endsWith('"'));
    const isEnum =
      !isLateralUnion &&
      values.length > 1 &&
      values.every((item) => typeof item === 'string' && item.includes('.'));

    if (isLateralUnion || isEnum) {
      const valuesWithoutQuotes = values.map((item: string) => item.replace(/"/g, ''));
      return { name: 'enum', value: valuesWithoutQuotes, required };
    }

    return { name: values[0], required } as SBType;
  }

  // recursively convert object properties to SBType
  if (schema.kind === 'object' && typeof schema.schema === 'object') {
    const schemaObject = schema.schema as Record<string, MetaDocgenInfo>;

    return {
      name: 'object',
      required,
      value: Object.entries(schemaObject).reduce<Record<string, SBType>>((obj, [key, value]) => {
        obj[key] = convertPropType(value);
        return obj;
      }, {}),
    };
  }

  if (schema.kind === 'array' && Array.isArray(schema.schema)) {
    return {
      name: 'array',
      value: convertPropType({ schema: schema.schema[0] } as MetaDocgenInfo),
      required,
    };
  }

  return fallbackSbType;
};

/**
 * Adds the descriptions for the given tags if available.
 */
const formatDescriptionWithTags = (description: string, tags: MetaDocgenInfo['tags']): string => {
  if (!tags?.length || !description) return description ?? '';
  const tagDescriptions = tags.map((tag) => `@${tag.name}: ${tag.text}`).join('<br>');
  return `${tagDescriptions}<br><br>${description}`;
};
