/* eslint-disable import/no-mutable-exports */
type FontOptions = {
  fontFamily: string;
  weights: string[];
  styles: string[];
  display: string;
  preload: boolean;
  selectedVariableAxes?: string[];
  fallback?: string[];
  adjustFontFallback: boolean;
  variable?: string;
  subsets: string[];
};

let validateData: (functionName: string, fontData: any, config: any) => FontOptions;

let getUrl: (
  fontFamily: string,
  axes: {
    wght?: string[];
    ital?: string[];
    variableAxes?: [string, string][];
  },
  display: string
) => string;

let getFontAxes: (
  fontFamily: string,
  weights: string[],
  styles: string[],
  selectedVariableAxes?: string[]
) => {
  wght?: string[];
  ital?: string[];
  variableAxes?: [string, string][];
};

let fetchCSSFromGoogleFonts: (url: string, fontFamily: string) => Promise<any>;

try {
  const fontUtils = require('@next/font/dist/google/utils');
  validateData = fontUtils.validateData;
  getUrl = fontUtils.getUrl;
  getFontAxes = fontUtils.getFontAxes;
  fetchCSSFromGoogleFonts = fontUtils.fetchCSSFromGoogleFonts;
} catch (e) {
  const fontUtils = require('next/dist/compiled/@next/font/dist/google/utils');
  validateData = fontUtils.validateData;
  getUrl = fontUtils.getUrl;
  getFontAxes = fontUtils.getFontAxes;
  fetchCSSFromGoogleFonts = fontUtils.fetchCSSFromGoogleFonts;
}

export { validateData, getUrl, getFontAxes, fetchCSSFromGoogleFonts };
