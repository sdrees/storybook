import fse from 'fs-extra';
import { dedent } from 'ts-dedent';
import { SupportedLanguage } from '../project_types';

interface ConfigureMainOptions {
  addons: string[];
  extensions?: string[];
  staticDirs?: string[];
  storybookConfigFolder: string;
  language: SupportedLanguage;
  /**
   * Extra values for main.js
   *
   * In order to provide non-serializable data like functions, you can use
   * { value: '%%yourFunctionCall()%%' }
   *
   * '%% and %%' will be replaced.
   *
   */
  [key: string]: any;
}

export interface FrameworkPreviewParts {
  prefix: string;
}

interface ConfigurePreviewOptions {
  frameworkPreviewParts?: FrameworkPreviewParts;
  storybookConfigFolder: string;
  language: SupportedLanguage;
}

const logger = console;

/**
 * We need to clean up the paths in case of pnp
 * input: "path.dirname(require.resolve(path.join('@storybook/react-webpack5', 'package.json')))"
 * output: "@storybook/react-webpack5"
 * */
const sanitizeFramework = (framework: string) => {
  // extract either @storybook/<framework> or storybook-<framework>
  const matches = framework.match(/(@storybook\/\w+(?:-\w+)*)|(storybook-(\w+(?:-\w+)*))/g);
  if (!matches) {
    return undefined;
  }

  return matches[0];
};

export async function configureMain({
  addons,
  extensions = ['js', 'jsx', 'ts', 'tsx'],
  storybookConfigFolder,
  language,
  ...custom
}: ConfigureMainOptions) {
  const prefix = (await fse.pathExists('./src')) ? '../src' : '../stories';
  const config = {
    stories: [`${prefix}/**/*.mdx`, `${prefix}/**/*.stories.@(${extensions.join('|')})`],
    addons,
    ...custom,
  };

  const isTypescript =
    language === SupportedLanguage.TYPESCRIPT_4_9 || language === SupportedLanguage.TYPESCRIPT_3_8;

  let mainConfigTemplate = dedent`<<import>>const config<<type>> = <<mainContents>>;
    export default config;`;

  const frameworkPackage = sanitizeFramework(custom.framework?.name);

  if (!frameworkPackage) {
    mainConfigTemplate = mainConfigTemplate.replace('<<import>>', '').replace('<<type>>', '');
    logger.warn('Could not find framework package name');
  }

  const mainContents = JSON.stringify(config, null, 2)
    .replace(/['"]%%/g, '')
    .replace(/%%['"]/g, '');

  const imports = [];

  if (custom.framework?.name.includes('path.dirname(')) {
    imports.push(`import path from 'path';`);
  }

  if (isTypescript) {
    imports.push(`import type { StorybookConfig } from '${frameworkPackage}';`);
  } else {
    imports.push(`/** @type { import('${frameworkPackage}').StorybookConfig } */`);
  }

  const mainJsContents = mainConfigTemplate
    .replace('<<import>>', `${imports.join('\n\n')}\n`)
    .replace('<<type>>', isTypescript ? ': StorybookConfig' : '')
    .replace('<<mainContents>>', mainContents);
  await fse.writeFile(
    `./${storybookConfigFolder}/main.${isTypescript ? 'ts' : 'js'}`,
    dedent(mainJsContents),
    { encoding: 'utf8' }
  );
}

export async function configurePreview(options: ConfigurePreviewOptions) {
  const { prefix = '' } = options.frameworkPreviewParts || {};
  const isTypescript =
    options.language === SupportedLanguage.TYPESCRIPT_4_9 ||
    options.language === SupportedLanguage.TYPESCRIPT_3_8;

  const previewPath = `./${options.storybookConfigFolder}/preview.${isTypescript ? 'ts' : 'js'}`;

  // If the framework template included a preview then we have nothing to do
  if (await fse.pathExists(previewPath)) {
    return;
  }

  const preview = dedent`
    ${prefix}
    export const parameters = {
      backgrounds: {
        default: 'light',
      },
      actions: { argTypesRegex: "^on[A-Z].*" },
      controls: {
        matchers: {
          color: /(background|color)$/i,
          date: /Date$/,
        },
      },
    }`
    .replace('  \n', '')
    .trim();

  await fse.writeFile(previewPath, preview, { encoding: 'utf8' });
}
