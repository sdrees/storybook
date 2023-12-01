import dedent from 'ts-dedent';

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

const trials = [
  {
    module: '@next/font/dist/local/utils',
    exportName: 'validateData',
    description: 'Support @next/font prior to v13.2.5',
  },
  {
    module: '@next/font/dist/local/validate-local-font-function-call',
    exportName: 'validateLocalFontFunctionCall',
    description: 'Support @next/font since v13.2.5',
  },
  {
    module: 'next/dist/compiled/@next/font/dist/local/utils',
    exportName: 'validateData',
    description: 'Support next/font prior to v13.2.4',
  },
  {
    module: 'next/dist/compiled/@next/font/dist/local/validate-local-font-function-call',
    exportName: 'validateLocalFontFunctionCall',
    description: 'Support next/font since v13.2.4',
  },
];

const validateData: (functionName: string, fontData: any) => FontOptions = (() => {
  // eslint-disable-next-line no-restricted-syntax
  for (const { module, exportName } of trials) {
    try {
      const loadedModule = require(module);
      if (exportName in loadedModule) {
        return loadedModule[exportName];
      }
    } catch {
      // Continue to the next trial
    }
  }

  // Generate the dynamic error message
  const errorDetails = trials
    .map(
      (trial) =>
        `- ${trial.description}: tries to import '${trial.exportName}' from '${trial.module}'`
    )
    .join('\n');

  throw new Error(dedent`
    We were unable to load the helper functions to use next/font/local. The code attempted the following scenarios:
    ${errorDetails}
      
    Please check your Next.js version and the module paths. If you resolve this issue for a version or setup not covered, consider contributing by updating the 'trials' array and making a pull request.
  `);
})();

export { validateData };
