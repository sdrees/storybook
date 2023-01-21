# Storybook for Angular

- [Storybook for Angular](#storybook-for-angular)
  - [Getting Started](#getting-started)
    - [Setup Compodoc](#setup-compodoc)
  - [Support for multi-project workspace](#support-for-multi-project-workspace)
  - [Run Storybook](#run-storybook)

Storybook for Angular is a UI development environment for your Angular components.
With it, you can visualize different states of your UI components and develop them interactively.

![Storybook Screenshot](https://github.com/storybookjs/storybook/blob/main/media/storybook-intro.gif)

Storybook runs outside of your app.
So you can develop UI components in isolation without worrying about app specific dependencies and requirements.

## Getting Started

```sh
cd my-angular-app
npx storybook init
```

### Setup Compodoc

When installing, you will be given the option to set up Compodoc, which is a tool for creating documentation for Angular projects.

You can include JSDoc comments above components, directives, and other parts of your Angular code to include documentation for those elements. Compodoc uses these comments to generate documentation for your application. In Storybook, it is useful to add explanatory comments above @Inputs and @Outputs, since these are the main elements that Storybook displays in its user interface. The @Inputs and @Outputs are the elements that you can interact with in Storybook, such as controls.

## Support for multi-project workspace

Storybook supports Angular multi-project workspace. You can setup Storybook for each project in the workspace. When running `npx storybook init` you will be asked for which project Storybook should be set up. Essentially, during initialization, the `angular.json` will be edited to add the Storybook configuration for the selected project. The configuration looks approximately like this:

```json
// angular.json
{
  ...
  "projects": {
    ...
    "your-project": {
      ...
      "architect": {
        ...
        "storybook": {
          "builder": "@storybook/angular:start-storybook",
          "options": {
            "configDir": ".storybook",
            "browserTarget": "your-project:build",
            "compodoc": false,
            "port": 6006
          }
        },
        "build-storybook": {
          "builder": "@storybook/angular:build-storybook",
          "options": {
            "configDir": ".storybook",
            "browserTarget": "your-project:build",
            "compodoc": false,
            "outputDir": "dist/storybook/your-project"
          }
        }
      }
    }
  }
}
```

## Run Storybook

To run Storybook for a particular project, please run:

```sh
ng run your-project:storybook
```

To build Storybook, run:

```sh
ng run your-project:build-storybook
```

You will find the output in `dist/storybook/your-project`.

For more information visit: [storybook.js.org](https://storybook.js.org)

---

Storybook also comes with a lot of [addons](https://storybook.js.org/addons) and a great API to customize as you wish.
You can also build a [static version](https://storybook.js.org/docs/angular/sharing/publish-storybook) of your Storybook and deploy it anywhere you want.
