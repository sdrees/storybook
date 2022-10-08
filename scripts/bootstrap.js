#!/usr/bin/env node

/* eslint-disable global-require */

const { spawnSync } = require('child_process');
const path = require('path');
const { join } = require('path');
const { maxConcurrentTasks } = require('./utils/concurrency');

const spawn = (command, options = {}) => {
  return spawnSync(`${command}`, {
    shell: true,
    stdio: 'inherit',
    ...options,
  });
};

function run() {
  const prompts = require('prompts');
  const program = require('commander');
  const chalk = require('chalk');
  const log = require('npmlog');

  log.heading = 'storybook';
  const prefix = 'bootstrap';
  log.addLevel('aborted', 3001, { fg: 'red', bold: true });

  const main = program
    .version('5.0.0')
    .option('--all', `Bootstrap everything ${chalk.gray('(all)')}`);

  const createTask = ({
    defaultValue,
    option,
    name,
    check = () => true,
    command,
    pre = [],
    order,
  }) => ({
    value: false,
    defaultValue: defaultValue || false,
    option: option || undefined,
    name: name || 'unnamed task',
    check: check || (() => true),
    order,
    command: () => {
      // run all pre tasks
      pre
        .map((key) => tasks[key])
        .forEach((task) => {
          if (task.check()) {
            task.command();
          }
        });

      log.info(prefix, name);
      return command();
    },
  });

  const tasks = {
    core: createTask({
      name: `Core & Examples ${chalk.gray('(core)')}`,
      defaultValue: false,
      option: '--core',
      command: () => {
        log.info(prefix, 'yarn workspace');
      },
      pre: ['install', 'build'],
      order: 1,
    }),
    prep: createTask({
      name: `Prep for development ${chalk.gray('(prep)')}`,
      defaultValue: true,
      option: '--prep',
      command: () => {
        log.info(prefix, 'prep');
        return spawn(
          `nx run-many --target="prep" --all --parallel --exclude=@storybook/addon-storyshots,@storybook/addon-storyshots-puppeteer -- --reset`
        );
      },
      order: 2,
    }),
    retry: createTask({
      name: `Core & Examples but only build previously failed ${chalk.gray('(core)')}`,
      defaultValue: true,
      option: '--retry',
      command: () => {
        log.info(prefix, 'prep');
        return spawn(
          `nx run-many --target="prep" --all --parallel --only-failed ${
            process.env.CI ? `--max-parallel=${maxConcurrentTasks}` : ''
          }`
        );
      },
      order: 1,
    }),
    reset: createTask({
      name: `Clean repository ${chalk.red('(reset)')}`,
      defaultValue: false,
      option: '--reset',
      command: () => {
        log.info(prefix, 'git clean');
        return spawn(`node -r esm ${join(__dirname, 'reset.js')}`);
      },
      order: 0,
    }),
    install: createTask({
      name: `Install dependencies ${chalk.gray('(install)')}`,
      defaultValue: false,
      option: '--install',
      command: () => {
        const command = process.env.CI ? `yarn install --immutable` : `yarn install`;
        return spawn(command);
      },
      pre: ['installScripts'],
      order: 1,
    }),
    build: createTask({
      name: `Build packages ${chalk.gray('(build)')}`,
      defaultValue: false,
      option: '--build',
      command: () => {
        log.info(prefix, 'build');
        return spawn(
          `nx run-many --target="prep" --all --parallel=8 ${
            process.env.CI ? `--max-parallel=${maxConcurrentTasks}` : ''
          } -- --reset --optimized`
        );
      },
      order: 2,
    }),
    registry: createTask({
      name: `Run local registry ${chalk.gray('(reg)')}`,
      defaultValue: false,
      option: '--reg',
      command: () => {
        return spawn('yarn local-registry --publish --open --port 6001');
      },
      order: 11,
    }),
    dev: createTask({
      name: `Run build in watch mode ${chalk.gray('(dev)')}`,
      defaultValue: false,
      option: '--dev',
      command: () => {
        return spawn('yarn build');
      },
      order: 9,
    }),
    installScripts: createTask({
      name: `Install dependencies on scripts directory ${chalk.gray('(dev)')}`,
      defaultValue: false,
      option: '--installScripts',
      command: () => {
        const command = process.env.CI ? `yarn install --immutable` : `yarn install`;
        return spawn(command, { cwd: path.join('..', 'scripts') });
      },
      order: 10,
    }),
  };

  const groups = {
    main: ['prep', 'core'],
    buildtasks: ['install', 'build'],
    devtasks: ['dev', 'registry', 'reset'],
  };

  Object.keys(tasks)
    .reduce((acc, key) => acc.option(tasks[key].option, tasks[key].name), main)
    .parse(process.argv);

  Object.keys(tasks).forEach((key) => {
    tasks[key].value = program[tasks[key].option.replace('--', '')] || program.all;
  });

  const createSeparator = (input) => ({
    title: `- ${input}${' ---------'.substr(0, 12)}`,
    disabled: true,
  });

  const choices = Object.values(groups)
    .map((l) =>
      l.map((key) => ({
        value: tasks[key].name,
        title: tasks[key].name,
        selected: tasks[key].defaultValue,
      }))
    )
    .reduce((acc, i, k) => acc.concat(createSeparator(Object.keys(groups)[k])).concat(i), []);

  let selection;
  if (
    !Object.keys(tasks)
      .map((key) => tasks[key].value)
      .filter(Boolean).length
  ) {
    selection = prompts(
      [
        {
          type: 'multiselect',
          message: 'Select the bootstrap activities',
          name: 'todo',
          warn: ' ',
          pageSize: Object.keys(tasks).length + Object.keys(groups).length,
          choices,
        },
      ],
      {
        onCancel: () => process.exit(0),
      }
    )
      .then(({ todo }) =>
        todo.map((name) => tasks[Object.keys(tasks).find((i) => tasks[i].name === name)])
      )
      .then((list) => {
        if (list.find((i) => i === tasks.reset)) {
          return prompts([
            {
              type: 'confirm',
              message: `${chalk.red(
                'DESTRUCTIVE'
              )} deletes node_modules, files not present in git ${chalk.underline(
                'will get trashed'
              )}, except for .idea and .vscode, ${chalk.cyan('Continue?')}`,
              name: 'sure',
            },
          ]).then(({ sure }) => {
            if (sure) {
              return list;
            }
            throw new Error('Cleanup canceled');
          });
        }
        return list;
      });
  } else {
    selection = Promise.resolve(
      Object.keys(tasks)
        .map((key) => tasks[key])
        .filter((item) => item.value === true)
    );
  }

  selection
    .then((list) => {
      if (list.length === 0) {
        log.warn(prefix, 'Nothing to bootstrap');
      } else {
        list
          .sort((a, b) => a.order - b.order)
          .forEach((key) => {
            const result = key.command();
            if (result && 'status' in result && result.status !== 0) {
              process.exit(result.status);
            }
          });
        process.stdout.write('\x07');
      }
    })
    .catch((e) => {
      log.aborted(prefix, chalk.red(e.message));
      log.silly(prefix, e);
      process.exit(1);
    });
}

run();
