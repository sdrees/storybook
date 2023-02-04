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
    language === SupportedLanguage.TYPESCRIPT || language === SupportedLanguage.TYPESCRIPT_LEGACY;

  const mainConfigTemplate = dedent`<<import>>const config<<type>> = <<mainContents>>;
  export default config;`;

  const mainJsContents = mainConfigTemplate
    .replace(
      '<<import>>',
      isTypescript
        ? `import type { StorybookConfig } from '${custom.framework.name}';\n\n`
        : `/** @type { import('${custom.framework.name}').StorybookConfig } */\n`
    )
    .replace('<<type>>', isTypescript ? ': StorybookConfig' : '')
    .replace('<<mainContents>>', JSON.stringify(config, null, 2));

  await fse.writeFile(
    `./${storybookConfigFolder}/main.${isTypescript ? 'ts' : 'js'}`,
    dedent(mainJsContents),
    { encoding: 'utf8' }
  );
}

export async function configurePreview(options: ConfigurePreviewOptions) {
  const { prefix = '' } = options.frameworkPreviewParts || {};
  const isTypescript =
    options.language === SupportedLanguage.TYPESCRIPT ||
    options.language === SupportedLanguage.TYPESCRIPT_LEGACY;

  const previewPath = `./${options.storybookConfigFolder}/preview.${isTypescript ? 'ts' : 'js'}`;

  // If the framework template included a preview then we have nothing to do
  if (await fse.pathExists(previewPath)) {
    return;
  }

  const preview = dedent`
    ${prefix}
    export const parameters = {
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
