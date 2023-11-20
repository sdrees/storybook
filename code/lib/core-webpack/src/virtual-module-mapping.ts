import type { Options, PreviewAnnotation } from '@storybook/types';
import { isAbsolute, join, resolve } from 'path';
import {
  getBuilderOptions,
  getRendererName,
  handlebars,
  interpolate,
  loadPreviewOrConfigFile,
  normalizeStories,
  readTemplate,
} from '@storybook/core-common';
import slash from 'slash';
import type { BuilderOptions } from './types';
import { toImportFn } from './to-importFn';
import { toRequireContextString } from './to-require-context';

export const getVirtualModuleMapping = async (options: Options) => {
  const virtualModuleMapping: Record<string, string> = {};
  const builderOptions = await getBuilderOptions<BuilderOptions>(options);
  const workingDir = process.cwd();
  const isProd = options.configType === 'PRODUCTION';
  const nonNormalizedStories = await options.presets.apply('stories', []);

  const stories = normalizeStories(nonNormalizedStories, {
    configDir: options.configDir,
    workingDir,
  });

  const previewAnnotations = [
    ...(await options.presets.apply<PreviewAnnotation[]>('previewAnnotations', [], options)).map(
      (entry) => {
        // If entry is an object, use the absolute import specifier.
        // This is to maintain back-compat with community addons that bundle other addons
        // and package managers that "hide" sub dependencies (e.g. pnpm / yarn pnp)
        // The vite builder uses the bare import specifier.
        if (typeof entry === 'object') {
          return entry.absolute;
        }

        // TODO: Remove as soon as we drop support for disabled StoryStoreV7
        if (isAbsolute(entry)) {
          return entry;
        }

        return slash(entry);
      }
    ),
    loadPreviewOrConfigFile(options),
  ].filter(Boolean);

  if (options.features?.storyStoreV7) {
    const storiesFilename = 'storybook-stories.js';
    const storiesPath = resolve(join(workingDir, storiesFilename));

    const needPipelinedImport = !!builderOptions.lazyCompilation && !isProd;
    virtualModuleMapping[storiesPath] = toImportFn(stories, { needPipelinedImport });
    const configEntryPath = resolve(join(workingDir, 'storybook-config-entry.js'));
    virtualModuleMapping[configEntryPath] = handlebars(
      await readTemplate(
        require.resolve(
          '@storybook/builder-webpack5/templates/virtualModuleModernEntry.js.handlebars'
        )
      ),
      {
        storiesFilename,
        previewAnnotations,
      }
      // We need to double escape `\` for webpack. We may have some in windows paths
    ).replace(/\\/g, '\\\\');
  } else {
    const rendererName = await getRendererName(options);

    const rendererInitEntry = resolve(join(workingDir, 'storybook-init-renderer-entry.js'));
    virtualModuleMapping[rendererInitEntry] = `import '${slash(rendererName)}';`;

    const entryTemplate = await readTemplate(
      join(__dirname, '..', 'templates', 'virtualModuleEntry.template.js')
    );

    previewAnnotations.forEach((previewAnnotationFilename: string | undefined) => {
      if (!previewAnnotationFilename) return;

      // Ensure that relative paths end up mapped to a filename in the cwd, so a later import
      // of the `previewAnnotationFilename` in the template works.
      const entryFilename = previewAnnotationFilename.startsWith('.')
        ? `${previewAnnotationFilename.replace(/(\w)(\/|\\)/g, '$1-')}-generated-config-entry.js`
        : `${previewAnnotationFilename}-generated-config-entry.js`;
      // NOTE: although this file is also from the `dist/cjs` directory, it is actually a ESM
      // file, see https://github.com/storybookjs/storybook/pull/16727#issuecomment-986485173
      virtualModuleMapping[entryFilename] = interpolate(entryTemplate, {
        previewAnnotationFilename,
      });
    });
    if (stories.length > 0) {
      const storyTemplate = await readTemplate(
        join(__dirname, '..', 'templates', 'virtualModuleStory.template.js')
      );
      // NOTE: this file has a `.cjs` extension as it is a CJS file (from `dist/cjs`) and runs
      // in the user's webpack mode, which may be strict about the use of require/import.
      // See https://github.com/storybookjs/storybook/issues/14877
      const storiesFilename = resolve(join(workingDir, `generated-stories-entry.cjs`));
      virtualModuleMapping[storiesFilename] = interpolate(storyTemplate, {
        rendererName,
      })
        // Make sure we also replace quotes for this one
        .replace("'{{stories}}'", stories.map(toRequireContextString).join(','));
    }
  }

  return virtualModuleMapping;
};
