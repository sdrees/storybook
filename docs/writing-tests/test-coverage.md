---
title: 'Test coverage'
---

<YouTubeCallout id="wEa6W8uUGSA" title="These tests use NO CODE | component testing in Storybook" />

Test coverage is the practice of measuring whether existing tests fully cover your code. That means surfacing areas which aren't currently being tested, such as: conditions, logic branches, functions and variables.

Coverage tests examine the instrumented code against a set of industry-accepted best practices. They act as the last line of QA to improve the quality of your test suite.

<video autoPlay muted playsInline loop>
  <source
    src="component-test-coverage-whitebg.mp4"
    type="video/mp4"
  />
</video>

## Code instrumentation with the coverage addon

Storybook provides an official [test coverage addon](https://storybook.js.org/addons/@storybook/addon-coverage). Powered by [Istanbul](https://istanbul.js.org/), which allows out-of-the-box code instrumentation for the most commonly used frameworks and builders in the JavaScript ecosystem.

### Set up the coverage addon

Engineered to work alongside modern testing tools (e.g., [Playwright](https://playwright.dev/)), the coverage addon automatically instruments your code and generates code coverage data. For an optimal experience, we recommend using the [test runner](./test-runner.md) alongside the coverage addon to run your tests.

Run the following command to install the addon.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-coverage-addon-install.yarn.js.mdx',
    'common/storybook-coverage-addon-install.npm.js.mdx',
    'common/storybook-coverage-addon-install.pnpm.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

Update your Storybook configuration (in `.storybook/main.js|ts`) to include the coverage addon.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-coverage-addon-registration.js.mdx',
    'common/storybook-coverage-addon-registration.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

Start your Storybook with:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-run-dev.yarn.js.mdx',
    'common/storybook-run-dev.npm.js.mdx',
    'common/storybook-run-dev.pnpm.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

Finally, open a new terminal window and run the test-runner with:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/test-runner-coverage.yarn.js.mdx',
    'common/test-runner-coverage.npm.js.mdx',
    'common/test-runner-coverage.pnpm.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

![Coverage test output](./test-runner-coverage-result.png)

### Configure

By default, the [`@storybook/addon-coverage`](https://storybook.js.org/addons/@storybook/addon-coverage) offers zero-config support for Storybook and instruments your code via [`istanbul-lib-instrument`](https://www.npmjs.com/package/istanbul-lib-instrument) for [Webpack](https://webpack.js.org/), or [`vite-plugin-istanbul`](https://github.com/iFaxity/vite-plugin-istanbul) for [Vite](https://vitejs.dev/). However, you can extend your Storybook configuration file (i.e., `.storybook/main.js|ts`) and provide additional options to the addon. Listed below are the available options and examples of how to use them.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-coverage-addon-config-options.js.mdx',
    'common/storybook-coverage-addon-config-options.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

**The available options if your project uses Webpack5 are as follows:**

| Option name            | Description                                                                                                    | Type            | Default                                                                                      |
| ---------------------- | -------------------------------------------------------------------------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------- |
| `cwd`                  | Set the working directory                                                                                      | `String`        | `process.cwd()`                                                                              |
| `nycrcPath`            | Path to specific nyc config to use instead of automatically searching for a nycconfig.                         | `string`        | -                                                                                            |
| `include`              | Glob pattern to include files. It has precedence over the include definition from your nyc config              | `Array<String>` | -                                                                                            |
| `exclude`              | Glob pattern to exclude files. It has precedence over the exclude definition from your nyc config              | `Array<String>` | `defaultExclude` in https://github.com/storybookjs/addon-coverage/blob/main/src/constants.ts |
| `extension`            | List of supported extensions. It has precedence over the extension definition from your nyc config             | `Array<String>` | `['.js', '.cjs', '.mjs', '.ts', '.tsx', '.jsx', '.vue', '.svelte]`                           |
| `coverageVariable`     | The global variable name that Istanbul will use to store coverage results.                                     | `string`        | -                                                                                            |
| `preserveComments`     | Indicates whether comments in the code should be preserved during the instrumentation process.                 | `boolean`       | `true`                                                                                       |
| `compact`              | Controls whether the output of instrumented code is compacted. Useful for debugging when set to `false`.       | `boolean`       | `false`                                                                                      |
| `esModules`            | Determines whether the code to be instrumented uses ES Module syntax.                                          | `boolean`       | `true`                                                                                       |
| `autoWrap`             | When set to `true`, wraps program code in a function to enable top-level return statements.                    | `boolean`       | `true`                                                                                       |
| `produceSourceMap`     | If `true`, instructs Istanbul to produce a source map for the instrumented code.                               | `boolean`       | `true`                                                                                       |
| `sourceMapUrlCallback` | A callback function that gets invoked with the filename and the source map URL when a source map is generated. | `function`      | -                                                                                            |
| `debug`                | Enables the debug mode, providing additional logging information during the instrumentation process.           | `boolean`       | -                                                                                            |

> **Note:**
> If you're using TypeScript, you can import the type for the options like so:
>
> ```ts
> import type { AddonOptionsWebpack } from '@storybook/addon-coverage';
> ```

**The available options if your project uses Vite are as follows:**

| Option name             | Description                                                                                                                                                                                                                                                                                                 | Type                        | Default                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | -------------------------------------------------------------------------------- |
| `cwd`                   | Set the working directory                                                                                                                                                                                                                                                                                   | `String`                    | `process.cwd()`                                                                  |
| `include`               | See [here](https://github.com/istanbuljs/nyc#selecting-files-for-coverage) for more info                                                                                                                                                                                                                    | `Array<String>` or `string` | `['**']`                                                                         |
| `exclude`               | See [here](https://github.com/istanbuljs/nyc#selecting-files-for-coverage) for more info                                                                                                                                                                                                                    | `Array<String>` or `string` | [list](https://github.com/storybookjs/addon-coverage/blob/main/src/constants.ts) |
| `extension`             | List of extensions that nyc should attempt to handle in addition to `.js`                                                                                                                                                                                                                                   | `Array<String>` or `string` | `['.js', '.cjs', '.mjs', '.ts', '.tsx', '.jsx', '.vue', '.svelte]`               |
| `requireEnv `           | Optional boolean to require the environment variable (defaults to VITE_COVERAGE) to equal true in order to instrument the code. Otherwise it will instrument even if env variable is not set. However if requireEnv is not set the instrumentation will stop if the environment variable is equal to false. | `boolean`                   | `-`                                                                              |
| `cypress `              | Optional boolean to change the environment variable to CYPRESS_COVERAGE instead of VITE_COVERAGE. For ease of use with `@cypress/code-coverage` coverage                                                                                                                                                    | `boolean`                   | `-`                                                                              |
| `checkProd `            | Optional boolean to enforce the plugin to skip instrumentation for production environments. Looks at Vite's isProduction key from the ResolvedConfig.                                                                                                                                                       | `boolean`                   | `-`                                                                              |
| `forceBuildInstrument ` | Optional boolean to enforce the plugin to add instrumentation in build mode.                                                                                                                                                                                                                                | `boolean`                   | `false`                                                                          |
| `nycrcPath `            | Path to specific nyc config to use instead of automatically searching for a nycconfig. This parameter is just passed down to @istanbuljs/load-nyc-config.                                                                                                                                                   | `string`                    | `-`                                                                              |

> **Note:**
> If you're using TypeScript, you can import the type for the options like so:
>
> ```ts
> import type { AddonOptionsVite } from '@storybook/addon-coverage';
> ```

## What about other coverage reporting tools?

Out of the box, code coverage tests work seamlessly with Storybook's test-runner and the [`@storybook/addon-coverage`](https://storybook.js.org/addons/@storybook/addon-coverage). However, that doesn't mean you can't use additional reporting tools (e.g., [Codecov](https://about.codecov.io/)). For instance, if you're working with [LCOV](https://wiki.documentfoundation.org/Development/Lcov), you can use the generated output (in `coverage/storybook/coverage-storybook.json`) and create your own report with:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-coverage-report-lcov.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

---

## Troubleshooting

### Run test coverage in other frameworks

If you intend on running coverage tests in frameworks with special files like Vue 3 or Svelte, you'll need to adjust your configuration and enable the required file extensions. For example, if you're using Vue, you'll need to add the following to your nyc configuration file (i.e., `.nycrc.json` or `nyc.config.js`):

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-coverage-report-vue.json.mdx',
    'common/storybook-coverage-report-vue.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

### The coverage addon doesn't support optimized builds

If you generated a production build optimized for performance with the [`--test`](../sharing/publish-storybook.md#customizing-the-build-for-performance) flag, and you're using the coverage addon to run tests against your Storybook, you may run into a situation where the coverage addon doesn't instrument your code. This is due to how the flag works, as it removes addons that have an impact on performance (e.g., [`Docs`](../writing-docs/index.md), [coverage addon](https://storybook.js.org/addons/@storybook/addon-coverage)). To resolve this issue, you'll need to adjust your Storybook configuration file (i.e., `.storybook/main.js|ts`) and include the [`disabledAddons`](../api/main-config-build.md#testdisabledaddons) option to allow the addon to run tests at the expense of a slower build.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-coverage-addon-optimized-config.js.mdx',
    'common/storybook-coverage-addon-optimized-config.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

### The coverage addon doesn't support instrumented code

As the [coverage addon](https://storybook.js.org/addons/@storybook/addon-coverage) is based on Webpack5 loaders and Vite plugins for code instrumentation, frameworks that don't rely upon these libraries (e.g., Angular configured with Webpack), will require additional configuration to enable code instrumentation. In that case, you can refer to the following [repository](https://github.com/yannbf/storybook-coverage-recipes) for more information.

**Learn about other UI tests**

- [Test runner](./test-runner.md) to automate test execution
- [Visual tests](./visual-testing.md) for appearance
- [Accessibility tests](./accessibility-testing.md) for accessibility
- [Interaction tests](./interaction-testing.md) for user behavior simulation
- Coverage tests for measuring code coverage
- [Snapshot tests](./snapshot-testing.md) for rendering errors and warnings
- [End-to-end tests](./stories-in-end-to-end-tests.md) for simulating real user scenarios
- [Unit tests](./stories-in-unit-tests.md) for functionality
