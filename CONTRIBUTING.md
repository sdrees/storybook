# Getting started

- Ensure you have node version 14 installed (suggestion: v14.18.1).
- Ensure if you are using Windows to use the Windows Subsystem for Linux (WSL).
- Run `./bootstrap.sh` to install the dependencies, and get the repo ready to be developed on.
- Run `yarn start` inside of the `code` directory to start the development server.

# Generating reproductions

The monorepo has a script that generates Storybook reproductions based on configurations set in the `scripts/next-repro-generators/repro-config.yml` file. This makes it possible to quickly bootstrap examples with and without Storybook, for given configurations (e.g. CRA, Angular, Vue, etc.)

To do so:
- Check the `scripts/next-repro-generators/repro-config.yml` if you want to see what will be generated
- Run `./generate-repros.sh`
- Check the result in the `repros` directory

# Contributing to Storybook

For further advice on how to contribute, please refer to our [NEW contributing guide on the Storybook website](https://storybook.js.org/docs/react/contribute/how-to-contribute).
