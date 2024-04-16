import { describe, it, expect } from 'vitest';
import { UnknownArgTypesError } from './preview-errors';

describe('UnknownFlowArgTypesError', () => {
  it('should correctly handle error with convertSig', () => {
    const type = {
      name: 'signature',
      raw: "SomeType['someProperty']",
    };

    const message = `"There was a failure when generating ArgTypes in Typescript for {"name":"signature","raw":"SomeType['someProperty']"}
    This type is either not supported or it is a bug in Storybook.
    If you think this is a bug, please open an issue in Github."`;

    const typeError = new UnknownArgTypesError({ type, language: 'Typescript' });
    expect(typeError.message).toMatchInlineSnapshot(message);
  });
});
