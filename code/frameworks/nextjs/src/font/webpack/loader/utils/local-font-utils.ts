/* eslint-disable import/no-mutable-exports */
type FontOptions = {
  src: Array<{
    path: string;
    weight?: string;
    style?: string;
    ext: string;
    format: string;
  }>;
  display: string;
  weight?: string;
  style?: string;
  fallback?: string[];
  preload: boolean;
  variable?: string;
  adjustFontFallback?: string | false;
  declarations?: Array<{
    prop: string;
    value: string;
  }>;
};

let validateData: (functionName: string, fontData: any) => FontOptions;

try {
  const fontUtils = require('@next/font/dist/local/utils');
  validateData = fontUtils.validateData;
} catch (e) {
  const fontUtils = require('next/dist/compiled/@next/font/dist/local/utils');
  validateData = fontUtils.validateData;
}

export { validateData };
