import type { Options } from '@storybook/types';
import { getFrameworkName, getProjectRoot } from '@storybook/core-common';
import path from 'node:path';
import fs from 'node:fs';
import { getTypeScriptTemplateForNewStoryFile } from './new-story-templates/typescript';
import { getJavaScriptTemplateForNewStoryFile } from './new-story-templates/javascript';

export interface NewStoryData {
  // The filepath of the component for which the Story should be generated for (relative to the project root)
  componentFilePath: string;
  // The name of the exported component
  componentExportName: string;
  // is default export
  componentIsDefaultExport: boolean;
}

export async function getNewStoryFile(
  { componentFilePath, componentExportName, componentIsDefaultExport }: NewStoryData,
  options: Options
) {
  const isTypescript = /\.(ts|tsx|mts|cts)$/.test(componentFilePath);
  const cwd = getProjectRoot();

  const frameworkPackageName = await getFrameworkName(options);

  const basename = path.basename(componentFilePath);
  const extension = path.extname(componentFilePath);
  const basenameWithoutExtension = basename.replace(extension, '');
  const dirname = path.dirname(componentFilePath);

  const storyFileExtension = isTypescript ? 'tsx' : 'jsx';
  const storyFileName = `${basenameWithoutExtension}.stories.${storyFileExtension}`;
  const alternativeStoryFileName = `${basenameWithoutExtension}.${componentExportName}.stories.${storyFileExtension}`;

  const exportedStoryName = 'Default';

  const storyFileContent = isTypescript
    ? await getTypeScriptTemplateForNewStoryFile({
        basenameWithoutExtension,
        componentExportName,
        componentIsDefaultExport,
        frameworkPackageName,
        exportedStoryName,
      })
    : await getJavaScriptTemplateForNewStoryFile({
        basenameWithoutExtension,
        componentExportName,
        componentIsDefaultExport,
        exportedStoryName,
      });

  const doesStoryFileExist = fs.existsSync(path.join(cwd, componentFilePath));

  const storyFilePath = doesStoryFileExist
    ? path.join(cwd, dirname, alternativeStoryFileName)
    : path.join(cwd, dirname, storyFileName);

  return { storyFilePath, exportedStoryName, storyFileContent };
}
