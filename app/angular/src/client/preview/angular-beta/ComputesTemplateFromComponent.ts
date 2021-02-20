import { Type } from '@angular/core';
import { ArgType, ArgTypes } from '@storybook/api';
import { ICollection } from '../types';
import {
  ComponentInputsOutputs,
  getComponentDecoratorMetadata,
  getComponentInputsOutputs,
} from './utils/NgComponentAnalyzer';

const separateInputsOutputsAttributes = (
  ngComponentInputsOutputs: ComponentInputsOutputs,
  props: ICollection = {}
) => {
  const inputs = ngComponentInputsOutputs.inputs
    .filter((i) => i.templateName in props)
    .map((i) => i.templateName);
  const outputs = ngComponentInputsOutputs.outputs
    .filter((o) => o.templateName in props)
    .map((o) => o.templateName);

  return {
    inputs,
    outputs,
    otherProps: Object.keys(props).filter((k) => ![...inputs, ...outputs].includes(k)),
  };
};

/**
 * Converts a component into a template with inputs/outputs present in initial props
 * @param component
 * @param initialProps
 * @param innerTemplate
 */
export const computesTemplateFromComponent = (
  component: Type<unknown>,
  initialProps?: ICollection,
  innerTemplate = ''
) => {
  const ngComponentMetadata = getComponentDecoratorMetadata(component);
  const ngComponentInputsOutputs = getComponentInputsOutputs(component);

  if (!ngComponentMetadata.selector) {
    // Allow to add renderer component when NgComponent selector is undefined
    return `<ng-container *ngComponentOutlet="storyComponent"></ng-container>`;
  }

  const { inputs: initialInputs, outputs: initialOutputs } = separateInputsOutputsAttributes(
    ngComponentInputsOutputs,
    initialProps
  );

  const templateInputs =
    initialInputs.length > 0 ? ` ${initialInputs.map((i) => `[${i}]="${i}"`).join(' ')}` : '';
  const templateOutputs =
    initialOutputs.length > 0
      ? ` ${initialOutputs.map((i) => `(${i})="${i}($event)"`).join(' ')}`
      : '';

  return `<${ngComponentMetadata.selector}${templateInputs}${templateOutputs}>${innerTemplate}</${ngComponentMetadata.selector}>`;
};

const createAngularInputProperty = ({
  propertyName,
  value,
  argType,
}: {
  propertyName: string;
  value: any;
  argType?: ArgType;
}) => {
  const { name: type = null, summary = null } = argType?.type || {};
  let templateValue = type === 'enum' && !!summary ? `${summary}.${value}` : value;

  const actualType = type === 'enum' && summary ? 'enum' : typeof value;
  const requiresBrackets = ['object', 'any', 'boolean', 'enum', 'number'].includes(actualType);

  if (typeof value === 'object') {
    templateValue = propertyName;
  }

  return `${requiresBrackets ? '[' : ''}${propertyName}${
    requiresBrackets ? ']' : ''
  }="${templateValue}"`;
};

/**
 * Converts a component into a template with inputs/outputs present in initial props
 * @param component
 * @param initialProps
 * @param innerTemplate
 */
export const computesTemplateSourceFromComponent = (
  component: Type<unknown>,
  initialProps?: ICollection,
  argTypes?: ArgTypes
) => {
  const ngComponentMetadata = getComponentDecoratorMetadata(component);
  if (!ngComponentMetadata) {
    return null;
  }

  if (!ngComponentMetadata.selector) {
    // Allow to add renderer component when NgComponent selector is undefined
    return `<ng-container *ngComponentOutlet="${component.name}"></ng-container>`;
  }

  const ngComponentInputsOutputs = getComponentInputsOutputs(component);
  const { inputs: initialInputs, outputs: initialOutputs } = separateInputsOutputsAttributes(
    ngComponentInputsOutputs,
    initialProps
  );

  const templateInputs =
    initialInputs.length > 0
      ? ` ${initialInputs
          .map((propertyName) =>
            createAngularInputProperty({
              propertyName,
              value: initialProps[propertyName],
              argType: argTypes?.[propertyName],
            })
          )
          .join(' ')}`
      : '';
  const templateOutputs =
    initialOutputs.length > 0
      ? ` ${initialOutputs.map((i) => `(${i})="${i}($event)"`).join(' ')}`
      : '';

  return `<${ngComponentMetadata.selector}${templateInputs}${templateOutputs}></${ngComponentMetadata.selector}>`;
};
