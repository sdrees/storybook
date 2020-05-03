import updateNotifier from 'update-notifier';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { detect, isStorybookInstalled, detectLanguage } from './detect';
import { hasYarn } from './has_yarn';
import {
  installableProjectTypes,
  PROJECT_TYPES,
  STORY_FORMAT,
  SUPPORTED_LANGUAGES,
} from './project_types';
import {
  commandLog,
  codeLog,
  paddedLog,
  installDepsFromPackageJson,
  getPackageJson,
} from './helpers';
import angularGenerator from './generators/ANGULAR';
import emberGenerator from './generators/EMBER';
import meteorGenerator from './generators/METEOR';
import reactGenerator from './generators/REACT';
import reactNativeGenerator from './generators/REACT_NATIVE';
import reactScriptsGenerator from './generators/REACT_SCRIPTS';
import sfcVueGenerator from './generators/SFC_VUE';
import updateOrganisationsGenerator from './generators/UPDATE_PACKAGE_ORGANIZATIONS';
import vueGenerator from './generators/VUE';
import webpackReactGenerator from './generators/WEBPACK_REACT';
import mithrilGenerator from './generators/MITHRIL';
import marionetteGenerator from './generators/MARIONETTE';
import markoGenerator from './generators/MARKO';
import htmlGenerator from './generators/HTML';
import webComponentsGenerator from './generators/WEB-COMPONENTS';
import riotGenerator from './generators/RIOT';
import preactGenerator from './generators/PREACT';
import svelteGenerator from './generators/SVELTE';
import raxGenerator from './generators/RAX';

const logger = console;

const installStorybook = (projectType, options) => {
  const useYarn = Boolean(options.useNpm !== true) && hasYarn();

  const npmOptions = {
    useYarn,
    installAsDevDependencies: true,
    skipInstall: options.skipInstall,
  };

  const defaultStoryFormat =
    detectLanguage() === SUPPORTED_LANGUAGES.TYPESCRIPT
      ? STORY_FORMAT.CSF_TYPESCRIPT
      : STORY_FORMAT.CSF;

  const generatorOptions = {
    storyFormat: options.storyFormat || defaultStoryFormat,
  };

  const runStorybookCommand = useYarn ? 'yarn storybook' : 'npm run storybook';

  const end = () => {
    if (!options.skipInstall) {
      installDepsFromPackageJson(npmOptions);
    }

    logger.log('\nTo run your storybook, type:\n');
    codeLog([runStorybookCommand]);
    logger.log('\nFor more information visit:', chalk.cyan('https://storybook.js.org'));

    // Add a new line for the clear visibility.
    logger.log();
  };

  const REACT_NATIVE_DISCUSSION =
    'https://github.com/storybookjs/storybook/blob/master/app/react-native/docs/manual-setup.md';

  const runGenerator = () => {
    switch (projectType) {
      case PROJECT_TYPES.ALREADY_HAS_STORYBOOK:
        logger.log();
        paddedLog('There seems to be a storybook already available in this project.');
        paddedLog('Apply following command to force:\n');
        codeLog(['sb init [options] -f']);

        // Add a new line for the clear visibility.
        logger.log();
        return Promise.resolve();

      case PROJECT_TYPES.UPDATE_PACKAGE_ORGANIZATIONS:
        return updateOrganisationsGenerator(options.parser, npmOptions)
          .then(() => null) // commmandLog doesn't like to see output
          .then(commandLog('Upgrading your project to the new storybook packages.'))
          .then(end);

      case PROJECT_TYPES.REACT_SCRIPTS:
        return reactScriptsGenerator(npmOptions, generatorOptions)
          .then(commandLog('Adding storybook support to your "Create React App" based project'))
          .then(end);

      case PROJECT_TYPES.REACT:
        return reactGenerator(npmOptions, generatorOptions)
          .then(commandLog('Adding storybook support to your "React" app'))
          .then(end);

      case PROJECT_TYPES.REACT_NATIVE: {
        return (options.yes
          ? Promise.resolve({ server: true })
          : inquirer.prompt([
              {
                type: 'confirm',
                name: 'server',
                message:
                  'Do you want to install dependencies necessary to run storybook server? You can manually do it later by install @storybook/react-native-server',
                default: false,
              },
            ])
        )
          .then(({ server }) => reactNativeGenerator(npmOptions, server, generatorOptions))
          .then(commandLog('Adding storybook support to your "React Native" app'))
          .then(end)
          .then(() => {
            logger.log(chalk.red('NOTE: installation is not 100% automated.'));
            logger.log(`To quickly run storybook, replace contents of your app entry with:\n`);
            codeLog(["export default from './storybook';"]);
            logger.log('\n For more in depth setup instructions, see:\n');
            logger.log(chalk.cyan(REACT_NATIVE_DISCUSSION));
            logger.log();
          });
      }

      case PROJECT_TYPES.METEOR:
        return meteorGenerator(npmOptions, generatorOptions)
          .then(commandLog('Adding storybook support to your "Meteor" app'))
          .then(end);

      case PROJECT_TYPES.WEBPACK_REACT:
        return webpackReactGenerator(npmOptions, generatorOptions)
          .then(commandLog('Adding storybook support to your "Webpack React" app'))
          .then(end);

      case PROJECT_TYPES.REACT_PROJECT:
        return reactGenerator(npmOptions, generatorOptions)
          .then(commandLog('Adding storybook support to your "React" library'))
          .then(end);

      case PROJECT_TYPES.SFC_VUE:
        return sfcVueGenerator(npmOptions, generatorOptions)
          .then(commandLog('Adding storybook support to your "Single File Components Vue" app'))
          .then(end);

      case PROJECT_TYPES.VUE:
        return vueGenerator(npmOptions, generatorOptions)
          .then(commandLog('Adding storybook support to your "Vue" app'))
          .then(end);

      case PROJECT_TYPES.ANGULAR:
        return angularGenerator(npmOptions, generatorOptions)
          .then(commandLog('Adding storybook support to your "Angular" app'))
          .then(end);

      case PROJECT_TYPES.EMBER:
        return emberGenerator(npmOptions, generatorOptions)
          .then(commandLog('Adding storybook support to your "Ember" app'))
          .then(end);

      case PROJECT_TYPES.MITHRIL:
        return mithrilGenerator(npmOptions, generatorOptions)
          .then(commandLog('Adding storybook support to your "Mithril" app'))
          .then(end);

      case PROJECT_TYPES.MARIONETTE:
        return marionetteGenerator(npmOptions)
          .then(commandLog('Adding storybook support to your "Marionette.js" app'))
          .then(end);

      case PROJECT_TYPES.MARKO:
        return markoGenerator(npmOptions, generatorOptions)
          .then(commandLog('Adding storybook support to your "Marko" app'))
          .then(end);

      case PROJECT_TYPES.HTML:
        return htmlGenerator(npmOptions, generatorOptions)
          .then(commandLog('Adding storybook support to your "HTML" app'))
          .then(end);

      case PROJECT_TYPES.WEB_COMPONENTS:
        return webComponentsGenerator(npmOptions, generatorOptions)
          .then(commandLog('Adding storybook support to your "web components" app'))
          .then(end);

      case PROJECT_TYPES.RIOT:
        return riotGenerator(npmOptions, generatorOptions)
          .then(commandLog('Adding storybook support to your "riot.js" app'))
          .then(end);

      case PROJECT_TYPES.PREACT:
        return preactGenerator(npmOptions, generatorOptions)
          .then(commandLog('Adding storybook support to your "Preact" app'))
          .then(end);

      case PROJECT_TYPES.SVELTE:
        return svelteGenerator(npmOptions, generatorOptions)
          .then(commandLog('Adding storybook support to your "Svelte" app'))
          .then(end);

      case PROJECT_TYPES.RAX:
        return raxGenerator(npmOptions, generatorOptions)
          .then(commandLog('Adding storybook support to your "Rax" app'))
          .then(end);

      default:
        paddedLog(`We couldn't detect your project type. (code: ${projectType})`);
        paddedLog(
          'You can specify a project type explicitly via `sb init --type <type>` or follow some of the slow start guides: https://storybook.js.org/basics/slow-start-guide/'
        );

        // Add a new line for the clear visibility.
        logger.log();

        return projectTypeInquirer(options);
    }
  };

  return runGenerator().catch((ex) => {
    logger.error(`\n     ${chalk.red(ex.stack)}`);
    process.exit(1);
  });
};

const projectTypeInquirer = async (options) => {
  const manualAnswer = options.yes
    ? true
    : await inquirer.prompt([
        {
          type: 'confirm',
          name: 'manual',
          message: 'Do you want to manually choose a Storybook project type to install?',
          default: false,
        },
      ]);

  if (manualAnswer.manual) {
    const frameworkAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'manualFramework',
        message: 'Please choose a project type from the following list:',
        choices: installableProjectTypes.map((type) => type.toUpperCase()),
      },
    ]);
    return installStorybook(frameworkAnswer.manualFramework, options);
  }
  return Promise.resolve();
};

export default function (options, pkg) {
  const welcomeMessage = 'sb init - the simplest way to add a storybook to your project.';
  logger.log(chalk.inverse(`\n ${welcomeMessage} \n`));

  // Update notify code.
  updateNotifier({
    pkg,
    updateCheckInterval: 1000 * 60 * 60, // every hour (we could increase this later on.)
  }).notify();

  let projectType;
  const projectTypeProvided = options.type;
  const infoText = projectTypeProvided
    ? 'Installing Storybook for user specified project type'
    : 'Detecting project type';
  const done = commandLog(infoText);

  try {
    if (projectTypeProvided) {
      if (installableProjectTypes.includes(options.type)) {
        const storybookInstalled = isStorybookInstalled(getPackageJson(), options.force);
        projectType = storybookInstalled
          ? PROJECT_TYPES.ALREADY_HAS_STORYBOOK
          : options.type.toUpperCase();
      } else {
        done(`The provided project type was not recognized by Storybook.`);
        logger.log(`\nThe project types currently supported by Storybook are:\n`);
        installableProjectTypes.sort().forEach((framework) => paddedLog(`- ${framework}`));
        logger.log();
        process.exit(1);
      }
    } else {
      projectType = detect(options);
    }
  } catch (ex) {
    done(ex.message);
    process.exit(1);
  }
  done();

  return installStorybook(projectType, options);
}
