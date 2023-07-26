Closes #

<!-- Thank you for contributing to Storybook! If your PR is related to an issue, provide the number(s) above; if it resolves multiple issues, be sure to break them up (e.g. "closes #1000, closes #1001"). -->

## What I did

<!-- Briefly describe what your PR does -->

## How to test

<!-- Please include the steps to test your changes here. For example:

1. Run a sandbox for template, e.g. `yarn task --task sandbox --start-from auto --template react-vite/default-ts`
2. Open Storybook in your browser
3. Access X story

-->

## Checklist

<!-- Please check (put an "x" inside the "[ ]") the applicable items below to make sure your PR is ready to be reviewed. -->

- [ ] Make sure your changes are tested (stories and/or unit, integration, or end-to-end tests)
- [ ] Make sure to add/update documentation regarding your changes
- [ ] If you are deprecating/removing a feature, make sure to update
      [MIGRATION.MD](https://github.com/storybookjs/storybook/blob/next/MIGRATION.md)

#### Maintainers

- [ ] When this PR is ready for testing, make sure to add `ci:normal`, `ci:merged` or `ci:daily` GH label to it to run a specific set of sandboxes. The particular set of sandboxes can be found in `code/lib/cli/src/sandbox-templates.ts`
- [ ] Make sure this PR contains **one** of the labels below.

`["cleanup", "BREAKING CHANGE", "feature request", "bug", "build", "documentation", "maintenance", "dependencies", "other"]`

<!--

Everybody: Please submit all PRs to the `next` branch unless they are specific to the current release. Storybook maintainers cherry-pick bug and documentation fixes into the `main` branch as part of the release process, so you shouldn't need to worry about this. For additional guidance: https://storybook.js.org/docs/react/contribute/how-to-contribute

-->

### 🦋 Canary release

<!-- CANARY_RELEASE_SECTION -->

This PR does not have a canary release associated. You can request a canary release of this pull request by mentioning the `@storybookjs/core` team here.

_core team members can create a canary release [here](https://github.com/storybookjs/storybook/actions/workflows/canary-release-pr.yml) or locally with `gh workflow run --repo storybookjs/storybook canary-release-pr.yml --field pr=<PR_NUMBER>`_

<!-- CANARY_RELEASE_SECTION -->
