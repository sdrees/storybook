## 7.1.0-alpha.36

- CLI: Fix "Invalid version null" issues by improved version detection - [#22642](https://github.com/storybookjs/storybook/pull/22642), thanks [@valentinpalkovic](https://github.com/valentinpalkovic)!
- CLI: Prebundle boxen to resolve a ESM/CJS incompatibility - [#23080](https://github.com/storybookjs/storybook/pull/23080), thanks [@ndelangen](https://github.com/ndelangen)!
- Telemetry: Count onboarding stories - [#23092](https://github.com/storybookjs/storybook/pull/23092), thanks [@shilman](https://github.com/shilman)!

## 7.1.0-alpha.35

- CLI: Skip builder selection for react native - [#23042](https://github.com/storybookjs/storybook/pull/23042), thanks [@dannyhw](https://github.com/dannyhw)!
- Core: Fix core-common to use node-fetch - [#23077](https://github.com/storybookjs/storybook/pull/23077), thanks [@ndelangen](https://github.com/ndelangen)!

## 7.1.0-alpha.34

- Angular: Fix ivy preset - [#23070](https://github.com/storybookjs/storybook/pull/23070), thanks [@ndelangen](https://github.com/ndelangen)!
- CLI: Change Button stories layout for React starter templates - [#22951](https://github.com/storybookjs/storybook/pull/22951), thanks [@yannbf](https://github.com/yannbf)!

## 7.1.0-alpha.33

- Bug: Fix for angular 16.1 compatibility - [#23064](https://github.com/storybookjs/storybook/pull/23064), thanks [@ndelangen](https://github.com/ndelangen)!
- Builder-vite: Fix lib/channels dependency - [#23049](https://github.com/storybookjs/storybook/pull/23049), thanks [@ndelangen](https://github.com/ndelangen)!
- CLI: Improve steps in storybook init - [#22502](https://github.com/storybookjs/storybook/pull/22502), thanks [@yannbf](https://github.com/yannbf)!
- CLI: Run `storybook dev` as part of `storybook init` - [#22928](https://github.com/storybookjs/storybook/pull/22928), thanks [@yannbf](https://github.com/yannbf)!
- Core: Merge channels into a single package - [#23032](https://github.com/storybookjs/storybook/pull/23032), thanks [@ndelangen](https://github.com/ndelangen)!
- Core: Unify cache location configurability - [#22079](https://github.com/storybookjs/storybook/pull/22079), thanks [@kubijo](https://github.com/kubijo)!

## 7.1.0-alpha.32

- Build: Remove `babel-core` & upgrade `esbuild` - [#23017](https://github.com/storybookjs/storybook/pull/23017), thanks [@ndelangen](https://github.com/ndelangen)!
- Core: Disable esbuild on files imported from `node_modules` - [#23018](https://github.com/storybookjs/storybook/pull/23018), thanks [@tmeasday](https://github.com/tmeasday)!
- Core: Integrate serverChannel into channel - [#22940](https://github.com/storybookjs/storybook/pull/22940), thanks [@ndelangen](https://github.com/ndelangen)!
- React: Lazy import `react-docgen-typescript-plugin` - [#23019](https://github.com/storybookjs/storybook/pull/23019), thanks [@tmeasday](https://github.com/tmeasday)!

## 7.1.0-alpha.31

- Dependencies: Set vue-component-type-helpers to latest - [#23015](https://github.com/storybookjs/storybook/pull/23015), thanks [@ndelangen](https://github.com/ndelangen)!
- Dependencies: Upgrade `nanoid`, prebundle it, upgrade `remark`, cleanup some `.md` files for warnings - [#23005](https://github.com/storybookjs/storybook/pull/23005), thanks [@ndelangen](https://github.com/ndelangen)!
- Dependencies: Use `latest` version of `vue-tsc` & sync versions of `angular` - [#23011](https://github.com/storybookjs/storybook/pull/23011), thanks [@ndelangen](https://github.com/ndelangen)!

## 7.1.0-alpha.30

- Web-components: Fix custom-elements order of property application - [#19183](https://github.com/storybookjs/storybook/pull/19183), thanks [@sonntag-philipp](https://github.com/sonntag-philipp)!
- Dependencies: Remove `shelljs` use - [#22995](https://github.com/storybookjs/storybook/pull/22995), thanks [@ndelangen](https://github.com/ndelangen)!
- Dependencies: Upgrade Jest related packages - [#22979](https://github.com/storybookjs/storybook/pull/22979), thanks [@ndelangen](https://github.com/ndelangen)!
- Core: Fix `builder-manager` adding multiple dashes to relative path - [#22974](https://github.com/storybookjs/storybook/pull/22974), thanks [@MarioCadenas](https://github.com/MarioCadenas)!
- Core: Add JSDoc comments to `preview-api` APIs - [#22975](https://github.com/storybookjs/storybook/pull/22975), thanks [@ndelangen](https://github.com/ndelangen)!
- Vue3: Fix source decorator to generate correct story code  - [#22518](https://github.com/storybookjs/storybook/pull/22518), thanks [@chakAs3](https://github.com/chakAs3)!
- Core: Add JSDoc comments to `manager-api` APIs - [#22968](https://github.com/storybookjs/storybook/pull/22968), thanks [@ndelangen](https://github.com/ndelangen)!
- Core: Improve `of={...}` DocBlock error in story index - [#22782](https://github.com/storybookjs/storybook/pull/22782), thanks [@shilman](https://github.com/shilman)!
- UI: Simplify `overlayscrollbars` component - [#22963](https://github.com/storybookjs/storybook/pull/22963), thanks [@ndelangen](https://github.com/ndelangen)!
- Angular: Add `--open`/`--no-open` flag to `dev` command - [#22964](https://github.com/storybookjs/storybook/pull/22964), thanks [@yannbf](https://github.com/yannbf)!
- Angular: Silence compodoc when running storybook with --quiet - [#22957](https://github.com/storybookjs/storybook/pull/22957), thanks [@yannbf](https://github.com/yannbf)!
- React: Fix decorators to conditionally render children - [#22336](https://github.com/storybookjs/storybook/pull/22336), thanks [@redbugz](https://github.com/redbugz)!
- Addon-measure: Migrate to strict TS - [#22402](https://github.com/storybookjs/storybook/pull/22402), thanks [@efrenaragon96](https://github.com/efrenaragon96)!
- Feature: Add experimental status API - [#22890](https://github.com/storybookjs/storybook/pull/22890), thanks [@ndelangen](https://github.com/ndelangen)!

