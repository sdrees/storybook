/* eslint-disable no-restricted-syntax, no-await-in-loop */
import path from 'path';
import {
  remove,
  pathExists,
  readJSON,
  writeJSON,
  ensureSymlink,
  ensureDir,
  existsSync,
  copy,
} from 'fs-extra';
import prompts from 'prompts';
import type { AbortController } from 'node-abort-controller';
import command from 'execa';

import { createOptions, getOptionsOrPrompt, OptionValues } from './utils/options';
import { executeCLIStep } from './utils/cli-step';
import { installYarn2, configureYarn2ForVerdaccio, addPackageResolutions } from './utils/yarn';
import { exec } from './utils/exec';
import { getInterpretedFile } from '../code/lib/core-common';
import { ConfigFile, readConfig, writeConfig } from '../code/lib/csf-tools';
import { babelParse } from '../code/lib/csf-tools/src/babelParse';
import TEMPLATES from '../code/lib/cli/src/repro-templates';
import { detectLanguage } from '../code/lib/cli/src/detect';
import { SupportedLanguage } from '../code/lib/cli/src/project_types';
import { servePackages } from './utils/serve-packages';
import { filterExistsInCodeDir, codeDir } from './utils/filterExistsInCodeDir';
import { JsPackageManagerFactory } from '../code/lib/cli/src/js-package-manager';

type Template = keyof typeof TEMPLATES;
const templates: Template[] = Object.keys(TEMPLATES) as any;
const addons = ['a11y', 'storysource'];
const defaultAddons = [
  'a11y',
  'actions',
  'backgrounds',
  'controls',
  'docs',
  'highlight',
  'interactions',
  'links',
  'measure',
  'outline',
  'toolbars',
  'viewport',
];
const sandboxDir = path.resolve(__dirname, '../sandbox');
const reprosDir = path.resolve(__dirname, '../repros');

export const options = createOptions({
  template: {
    type: 'string',
    description: 'Which template would you like to use?',
    values: templates,
    required: true as const,
  },
  addon: {
    type: 'string[]',
    description: 'Which extra addons (beyond the CLI defaults) would you like installed?',
    values: addons,
  },
  includeStories: {
    type: 'boolean',
    description: "Include Storybook's own stories?",
    promptType: (_, { template }) => template === 'react',
  },
  fromLocalRepro: {
    type: 'boolean',
    description: 'Create the template from a local repro (rather than degitting it)?',
  },
  forceDelete: {
    type: 'boolean',
    description: 'Always delete an existing sandbox, even if it has the same configuration?',
    promptType: false,
  },
  forceReuse: {
    type: 'boolean',
    description: 'Always reuse an existing sandbox, even if it has a different configuration?',
    promptType: false,
  },
  link: {
    type: 'boolean',
    description: 'Link the storybook to the local code?',
    inverse: true,
  },
  publish: {
    type: 'boolean',
    description: 'Publish local code to verdaccio and start before installing?',
    inverse: true,
    promptType: (_, { link }) => !link,
  },
  startVerdaccio: {
    type: 'boolean',
    description: 'Start Verdaccio before installing?',
    inverse: true,
    promptType: (_, { publish }) => !publish,
  },
  start: {
    type: 'boolean',
    description: 'Start the Storybook?',
    inverse: true,
  },
  build: {
    type: 'boolean',
    description: 'Build the Storybook?',
    promptType: (_, { start }) => !start,
  },
  watch: {
    type: 'boolean',
    description: 'Start building used packages in watch mode as well as the Storybook?',
    promptType: (_, { start }) => start,
  },
  dryRun: {
    type: 'boolean',
    description: "Don't execute commands, just list them (dry run)?",
    promptType: false,
  },
  debug: {
    type: 'boolean',
    description: 'Print all the logs to the console',
    promptType: false,
  },
});

async function getOptions() {
  return getOptionsOrPrompt('yarn sandbox', options);
}

const steps = {
  repro: {
    command: 'repro-next',
    description: 'Bootstrapping Template',
    icon: '👷',
    hasArgument: true,
    options: createOptions({
      output: { type: 'string' },
      // TODO allow default values for strings
      branch: { type: 'string', values: ['next'] },
    }),
  },
  add: {
    command: 'add',
    description: 'Adding addon',
    icon: '+',
    hasArgument: true,
    options: createOptions({}),
  },
  link: {
    command: 'link',
    description: 'Linking packages',
    icon: '🔗',
    hasArgument: true,
    options: createOptions({
      local: { type: 'boolean' },
      start: { type: 'boolean', inverse: true },
    }),
  },
  build: {
    command: 'build',
    description: 'Building Storybook',
    icon: '🔨',
    options: createOptions({}),
  },
  dev: {
    command: 'dev',
    description: 'Starting Storybook',
    icon: '🖥 ',
    options: createOptions({}),
  },
};

const logger = console;

async function findFirstPath(paths: string[], { cwd }: { cwd: string }) {
  for (const filePath of paths) {
    if (await pathExists(path.join(cwd, filePath))) return filePath;
  }
  return null;
}

async function addPackageScripts({
  cwd,
  scripts,
}: {
  cwd: string;
  scripts: Record<string, string>;
}) {
  logger.info(`🔢 Adding package scripts:`);
  const packageJsonPath = path.join(cwd, 'package.json');
  const packageJson = await readJSON(packageJsonPath);
  packageJson.scripts = {
    ...packageJson.scripts,
    ...scripts,
  };
  await writeJSON(packageJsonPath, packageJson, { spaces: 2 });
}

async function readMainConfig({ cwd }: { cwd: string }) {
  const configDir = path.join(cwd, '.storybook');
  if (!existsSync(configDir)) {
    throw new Error(
      `Unable to find the Storybook folder in "${configDir}". Are you sure it exists? Or maybe this folder uses a custom Storybook config directory?`
    );
  }

  const mainConfigPath = getInterpretedFile(path.resolve(configDir, 'main'));
  return readConfig(mainConfigPath);
}

// Ensure that sandboxes can refer to story files defined in `code/`.
// Most WP-based build systems will not compile files outside of the project root or 'src/` or
// similar. Plus they aren't guaranteed to handle TS files. So we need to patch in esbuild
// loader for such files. NOTE this isn't necessary for Vite, as far as we know.
function addEsbuildLoaderToStories(mainConfig: ConfigFile) {
  // NOTE: the test regexp here will apply whether the path is symlink-preserved or otherwise
  const loaderPath = require.resolve('../code/node_modules/esbuild-loader');
  const webpackFinalCode = `
  (config) => ({
    ...config,
    module: {
      ...config.modules,
      rules: [
        // Ensure esbuild-loader applies to all files in ./template-stories
        {
          test: [/\\/template-stories\\//],
          loader: '${loaderPath}',
          options: {
            loader: 'tsx',
            target: 'es2015',
          },
        },
        // Ensure no other loaders from the framework apply
        ...config.module.rules.map(rule => ({
          ...rule,
          exclude: [/\\/template-stories\\//].concat(rule.exclude || []),
        })),
      ],
    },
  })`;
  mainConfig.setFieldNode(
    ['webpackFinal'],
    // @ts-expect-error (not sure why TS complains here, it does exist)
    babelParse(webpackFinalCode).program.body[0].expression
  );
}

// Recompile optimized deps on each startup, so you can change @storybook/* packages and not
// have to clear caches.
function forceViteRebuilds(mainConfig: ConfigFile) {
  const viteFinalCode = `
  (config) => ({
    ...config,
    optimizeDeps: {
      ...config.optimizeDeps,
      force: true,
    },
  })`;
  mainConfig.setFieldNode(
    ['viteFinal'],
    // @ts-expect-error (not sure why TS complains here, it does exist)
    babelParse(viteFinalCode).program.body[0].expression
  );
}

function addPreviewAnnotations(mainConfig: ConfigFile, paths: string[]) {
  const config = mainConfig.getFieldValue(['previewAnnotations']) as string[];
  mainConfig.setFieldValue(['previewAnnotations'], [...(config || []), ...paths]);
}

// packageDir is eg 'renderers/react', 'addons/actions'
async function linkPackageStories(
  packageDir: string,
  { mainConfig, cwd, linkInDir }: { mainConfig: ConfigFile; cwd: string; linkInDir?: string }
) {
  const source = path.join(codeDir, packageDir, 'template', 'stories');
  // By default we link `stories` directories
  //   e.g '../../../code/lib/store/template/stories' to 'template-stories/lib/store'
  // if the directory <code>/lib/store/template/stories exists
  //
  // The files must be linked in the cwd, in order to ensure that any dependencies they
  // reference are resolved in the cwd. In particular 'react' resolved by MDX files.
  const target = linkInDir
    ? path.resolve(linkInDir, packageDir)
    : path.resolve(cwd, 'template-stories', packageDir);
  await ensureSymlink(source, target);

  // Add `previewAnnotation` entries of the form
  //   './template-stories/lib/store/preview.ts'
  // if the file <code>/lib/store/template/stories/preview.ts exists

  await Promise.all(
    ['js', 'ts'].map(async (ext) => {
      const previewFile = `preview.${ext}`;
      const previewPath = path.join(codeDir, packageDir, 'template', 'stories', previewFile);
      if (await pathExists(previewPath)) {
        addPreviewAnnotations(mainConfig, [
          `./${path.join(linkInDir ? 'src/stories' : 'template-stories', packageDir, previewFile)}`,
        ]);
      }
    })
  );
}

// Update the stories field to ensure that:
//  a) no TS files that are linked from the renderer are picked up in non-TS projects
//  b) files in ./template-stories are not matched by the default glob
async function updateStoriesField(mainConfig: ConfigFile, isJs: boolean) {
  const stories = mainConfig.getFieldValue(['stories']) as string[];

  // If the project is a JS project, let's make sure any linked in TS stories from the
  // renderer inside src|stories are simply ignored.
  const updatedStories = isJs
    ? stories.map((specifier) => specifier.replace('js|jsx|ts|tsx', 'js|jsx'))
    : stories;

  // FIXME: '*.@(mdx|stories.mdx|stories.tsx|stories.ts|stories.jsx|stories.js'
  const linkedStories = path.join('..', 'template-stories', '**', '*.stories.@(js|jsx|ts|tsx|mdx)');

  mainConfig.setFieldValue(['stories'], [...updatedStories, linkedStories]);
}

type Workspace = { name: string; location: string };

async function getWorkspaces() {
  const { stdout } = await command('yarn workspaces list --json', {
    cwd: process.cwd(),
    shell: true,
  });
  return JSON.parse(`[${stdout.split('\n').join(',')}]`) as Workspace[];
}

function workspacePath(type: string, packageName: string, workspaces: Workspace[]) {
  const workspace = workspaces.find((w) => w.name === packageName);
  if (!workspace) {
    throw new Error(`Unknown ${type} '${packageName}', not in yarn workspace!`);
  }
  return workspace.location;
}

function addExtraDependencies({
  cwd,
  dryRun,
  debug,
}: {
  cwd: string;
  dryRun: boolean;
  debug: boolean;
}) {
  const extraDeps = ['@storybook/jest'];
  if (debug) console.log('🎁 Adding extra deps', extraDeps);
  if (!dryRun) {
    const packageManager = JsPackageManagerFactory.getPackageManager(false, cwd);
    packageManager.addDependencies({ installAsDevDependencies: true }, extraDeps);
  }
}

export async function sandbox(optionValues: OptionValues<typeof options>) {
  const { template, forceDelete, forceReuse, dryRun, debug, fromLocalRepro } = optionValues;

  await ensureDir(sandboxDir);
  let publishController: AbortController;

  const cwd = path.join(sandboxDir, template.replace('/', '-'));

  const exists = await pathExists(cwd);
  let shouldDelete = exists && !forceReuse;
  if (exists && !forceDelete && !forceReuse) {
    if (process.env.CI)
      throw new Error(`yarn sandbox needed to prompt for options, this is not possible in CI!`);

    const relativePath = path.relative(process.cwd(), cwd);
    ({ shouldDelete } = await prompts({
      type: 'toggle',
      message: `${relativePath} already exists, should delete it and create a new one?`,
      name: 'shouldDelete',
      initial: false,
      active: 'yes',
      inactive: 'no',
    }));
  }

  if (exists && shouldDelete && !dryRun) await remove(cwd);

  if (!exists || shouldDelete) {
    if (fromLocalRepro) {
      const srcDir = path.join(reprosDir, template, 'after-storybook');
      if (!existsSync(srcDir)) {
        throw new Error(dedent`
          Missing repro directory '${srcDir}'!

          To run sandbox against a local repro, you must have already generated
          the repro template in the /repros directory using:

          yarn generate-repros-next --template ${template}
        `);
      }
      const destDir = cwd;
      await copy(srcDir, destDir);
    } else {
      await executeCLIStep(steps.repro, {
        argument: template,
        optionValues: { output: cwd, branch: 'next' },
        cwd: sandboxDir,
        dryRun,
        debug,
      });
    }

    const mainConfig = await readMainConfig({ cwd });

    const templateConfig = TEMPLATES[template as Template];
    const { renderer, builder } = templateConfig.expected;
    const storiesPath = await findFirstPath([path.join('src', 'stories'), 'stories'], { cwd });

    const workspaces = await getWorkspaces();
    // Link in the template/components/index.js from store, the renderer and the addons
    const rendererPath = workspacePath('renderer', renderer, workspaces);
    await ensureSymlink(
      path.join(codeDir, rendererPath, 'template', 'components'),
      path.resolve(cwd, storiesPath, 'components')
    );
    addPreviewAnnotations(mainConfig, [`.${path.sep}${path.join(storiesPath, 'components')}`]);

    // Add stories for the renderer. NOTE: these *do* need to be processed by the framework build system
    await linkPackageStories(rendererPath, {
      mainConfig,
      cwd,
      linkInDir: path.resolve(cwd, storiesPath),
    });

    // Add stories for lib/store (and addons below). NOTE: these stories will be in the
    // template-stories folder and *not* processed by the framework build config (instead by esbuild-loader)
    await linkPackageStories(workspacePath('core package', '@storybook/store', workspaces), {
      mainConfig,
      cwd,
    });

    // TODO -- sb add <addon> doesn't actually work properly:
    //   - installs in `deps` not `devDeps`
    //   - does a `workspace:^` install (what does that mean?)
    //   - doesn't add to `main.js`

    for (const addon of optionValues.addon) {
      const addonName = `@storybook/addon-${addon}`;
      await executeCLIStep(steps.add, { argument: addonName, cwd, dryRun, debug });
    }

    const addonDirs = [...defaultAddons, ...optionValues.addon].map((addon) =>
      workspacePath('addon', `@storybook/addon-${addon}`, workspaces)
    );
    const existingStories = await filterExistsInCodeDir(
      addonDirs,
      path.join('template', 'stories')
    );
    await Promise.all(
      existingStories.map(async (packageDir) => linkPackageStories(packageDir, { mainConfig, cwd }))
    );

    // Ensure that we match stories from the template-stories dir
    const packageJson = await import(path.join(cwd, 'package.json'));
    await updateStoriesField(
      mainConfig,
      detectLanguage(packageJson) === SupportedLanguage.JAVASCRIPT
    );

    // Add some extra settings (see above for what these do)
    mainConfig.setFieldValue(['core', 'disableTelemetry'], true);
    if (builder === '@storybook/builder-webpack5') addEsbuildLoaderToStories(mainConfig);
    if (builder === '@storybook/builder-vite') forceViteRebuilds(mainConfig);

    await writeConfig(mainConfig);

    await installYarn2({ cwd, dryRun, debug });

    const { link, publish, startVerdaccio } = optionValues;
    if (link) {
      await executeCLIStep(steps.link, {
        argument: cwd,
        cwd: codeDir,
        dryRun,
        optionValues: { local: true, start: false },
        debug,
      });
    } else {
      if (publish) {
        await exec('yarn local-registry --publish', { cwd: codeDir }, { dryRun, debug });
      }

      if (publish || startVerdaccio) {
        publishController = await servePackages({ dryRun, debug });
      }

      // We need to add package resolutions to ensure that we only ever install the latest version
      // of any storybook packages as verdaccio is not able to both proxy to npm and publish over
      // the top. In theory this could mask issues where different versions cause problems.
      await addPackageResolutions({ cwd, dryRun, debug });
      await configureYarn2ForVerdaccio({ cwd, dryRun, debug });

      await exec(
        'yarn install',
        { cwd },
        {
          dryRun,
          startMessage: `⬇️ Installing local dependencies`,
          errorMessage: `🚨 Installing local dependencies failed`,
        }
      );
    }

    // Some addon stories require extra dependencies
    addExtraDependencies({ cwd, dryRun, debug });

    await addPackageScripts({
      cwd,
      scripts: {
        storybook:
          'NODE_OPTIONS="--preserve-symlinks --preserve-symlinks-main" storybook dev -p 6006',
        'build-storybook':
          'NODE_OPTIONS="--preserve-symlinks --preserve-symlinks-main" storybook build',
      },
    });
  }

  const { start, build } = optionValues;
  if (start) {
    await exec(
      'yarn storybook',
      { cwd },
      {
        dryRun,
        startMessage: `⬆️  Starting Storybook`,
        errorMessage: `🚨 Starting Storybook failed`,
        debug: true,
      }
    );
  } else if (build) {
    await executeCLIStep(steps.build, { cwd, dryRun, debug });
    // TODO serve
  }

  // TODO start dev

  // Cleanup
  publishController?.abort();
}

async function main() {
  const optionValues = await getOptions();
  return sandbox(optionValues);
}

if (require.main === module) {
  main().catch((err) => {
    logger.error('🚨 An error occurred when executing "sandbox":');

    logger.error(err);
    process.exit(1);
  });
}
