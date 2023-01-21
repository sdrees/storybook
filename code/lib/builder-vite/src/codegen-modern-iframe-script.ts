import { loadPreviewOrConfigFile, getFrameworkName } from '@storybook/core-common';
import type { Options, PreviewAnnotation } from '@storybook/types';
import { virtualStoriesFile, virtualAddonSetupFile } from './virtual-file-names';
import { processPreviewAnnotation } from './utils/process-preview-annotation';

export async function generateModernIframeScriptCode(options: Options) {
  const { presets, configDir } = options;
  const frameworkName = await getFrameworkName(options);

  const previewOrConfigFile = loadPreviewOrConfigFile({ configDir });
  const previewAnnotations = await presets.apply<PreviewAnnotation[]>(
    'previewAnnotations',
    [],
    options
  );
  const relativePreviewAnnotations = [...previewAnnotations, previewOrConfigFile]
    .filter(Boolean)
    .map(processPreviewAnnotation);

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const generateHMRHandler = (frameworkName: string): string => {
    // Web components are not compatible with HMR, so disable HMR, reload page instead.
    if (frameworkName === '@storybook/web-components-vite') {
      return `
      if (import.meta.hot) {
        import.meta.hot.decline();
      }`.trim();
    }

    return `
    if (import.meta.hot) {
      import.meta.hot.accept('${virtualStoriesFile}', (newModule) => {
      // importFn has changed so we need to patch the new one in
      window.__STORYBOOK_PREVIEW__.onStoriesChanged({ importFn: newModule.importFn });
      });

    import.meta.hot.accept(${JSON.stringify(
      relativePreviewAnnotations
    )}, ([...newConfigEntries]) => {
      const newGetProjectAnnotations =  () => composeConfigs(newConfigEntries);

      // getProjectAnnotations has changed so we need to patch the new one in
      window.__STORYBOOK_PREVIEW__.onGetProjectAnnotationsChanged({ getProjectAnnotations: newGetProjectAnnotations });
    });
  }`.trim();
  };

  /**
   * This code is largely taken from https://github.com/storybookjs/storybook/blob/d1195cbd0c61687f1720fefdb772e2f490a46584/lib/builder-webpack4/src/preview/virtualModuleModernEntry.js.handlebars
   * Some small tweaks were made to `getProjectAnnotations` (since `import()` needs to be resolved asynchronously)
   * and the HMR implementation has been tweaked to work with Vite.
   * @todo Inline variable and remove `noinspection`
   */
  const code = `
  import { composeConfigs, PreviewWeb, ClientApi } from '@storybook/preview-api';
  import '${virtualAddonSetupFile}';
  import { importFn } from '${virtualStoriesFile}';
  
    const getProjectAnnotations = async () => {
      const configs = await Promise.all([${relativePreviewAnnotations
        .map((previewAnnotation) => `import('${previewAnnotation}')`)
        .join(',\n')}])
      return composeConfigs(configs);
    }


    window.__STORYBOOK_PREVIEW__ = window.__STORYBOOK_PREVIEW__ || new PreviewWeb();
    
    window.__STORYBOOK_STORY_STORE__ = window.__STORYBOOK_STORY_STORE__ || window.__STORYBOOK_PREVIEW__.storyStore;
    window.__STORYBOOK_CLIENT_API__ = window.__STORYBOOK_CLIENT_API__ || new ClientApi({ storyStore: window.__STORYBOOK_PREVIEW__.storyStore });
    window.__STORYBOOK_PREVIEW__.initialize({ importFn, getProjectAnnotations });
    
    ${generateHMRHandler(frameworkName)};
    `.trim();
  return code;
}
