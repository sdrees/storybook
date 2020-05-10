import { ArgType } from '../blocks';

/* eslint-disable @typescript-eslint/no-empty-interface */
export interface ControlProps<T> {
  name: string;
  value: T;
  defaultValue?: T;
  argType?: ArgType;
  onChange: (name: string, value: T) => T | void;
}

export type ArrayValue = string[] | readonly string[];
export interface ArrayConfig {
  separator?: string;
}

export type BooleanValue = boolean;
export interface BooleanConfig {}

export type ColorValue = string;
export interface ColorConfig {}

export type DateValue = Date | number;
export interface DateConfig {}

export type NumberValue = number;
export interface NumberConfig {
  min?: number;
  max?: number;
  step?: number;
}

export type RangeConfig = NumberConfig;

export type ObjectValue = any;
export interface ObjectConfig {}

export type OptionsSingleSelection = any;
export type OptionsMultiSelection = any[];
export type OptionsSelection = OptionsSingleSelection | OptionsMultiSelection;
export type OptionsArray = any[];
export type OptionsObject = Record<string, any>;
export type Options = OptionsArray | OptionsObject;
export type OptionsControlType =
  | 'radio'
  | 'inline-radio'
  | 'check'
  | 'inline-check'
  | 'select'
  | 'multi-select';

export interface OptionsConfig {
  options: Options;
  controlType: OptionsControlType;
}

export interface NormalizedOptionsConfig {
  options: OptionsObject;
  controlType: OptionsControlType;
}

export type TextValue = string;
export interface TextConfig {}

export type ControlType =
  | 'array'
  | 'boolean'
  | 'color'
  | 'date'
  | 'number'
  | 'range'
  | 'object'
  | OptionsControlType
  | 'text';

export type Control =
  | ArrayConfig
  | BooleanConfig
  | ColorConfig
  | DateConfig
  | NumberConfig
  | ObjectConfig
  | OptionsConfig
  | RangeConfig
  | TextConfig;

export type Controls = Record<string, Control>;
