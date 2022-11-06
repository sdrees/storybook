## 7.0.0-alpha.47 (November 1, 2022)

#### Features

-   CSF-tools: Turn story comments into docs descriptions [#19684](https://github.com/storybooks/storybook/pull/19684)
-   CLI: Migrate CLI templates to CSF3 [#19665](https://github.com/storybooks/storybook/pull/19665)
-   Vite: Set default `base` for subfolder deployments [#19383](https://github.com/storybooks/storybook/pull/19383)

#### Bug Fixes

-   Disable keyboard shortcuts during (docs) play functions and add tests [#19668](https://github.com/storybooks/storybook/pull/19668)

#### Maintenance

-   Addon-docs: Replace source-loader with csf-plugin [#19680](https://github.com/storybooks/storybook/pull/19680)
-   CLI: Move all templates out of cli into renderers [#19664](https://github.com/storybooks/storybook/pull/19664)
-   Addon-docs: Remove mdx-compiler-plugin [#19681](https://github.com/storybooks/storybook/pull/19681)

## 7.0.0-alpha.46 (October 28, 2022)

#### Features

- Addon-docs: Don't show docspage unless the user opts in [#19627](https://github.com/storybooks/storybook/pull/19627)
- Core: Allow setting tags in storiesOf via parameters. [#19642](https://github.com/storybooks/storybook/pull/19642)

#### Bug Fixes

- Addon-docs: Fix React Profiler in source snippets [#19004](https://github.com/storybooks/storybook/pull/19004)

#### Maintenance

- Telemetry: Measure version update check [#19660](https://github.com/storybooks/storybook/pull/19660)
- Build: Bundle lib/preview-web with ts-up [#19655](https://github.com/storybooks/storybook/pull/19655)
- CSF-tools: Make ESM node compatible [#19661](https://github.com/storybooks/storybook/pull/19661)
- Telemetry: Measure docs usage [#19648](https://github.com/storybooks/storybook/pull/19648)
- Go back to `csf@next` [#19657](https://github.com/storybooks/storybook/pull/19657)

#### Build

- Build: Reduce parallelism in check task [#19662](https://github.com/storybooks/storybook/pull/19662)

## 7.0.0-alpha.45 (October 28, 2022)

#### Bug Fixes

- Svelte: Fix regression causing all stories to error [#19653](https://github.com/storybooks/storybook/pull/19653)
- CSF: Fix `StoryObj<typeof Cmp>` to work the same as old ComponentStoryObj [#19651](https://github.com/storybooks/storybook/pull/19651)

#### Maintenance

- Core: Misc dead code removal [#19654](https://github.com/storybooks/storybook/pull/19654)
- Addon-actions: Move decorator to its own entrypoint [#19650](https://github.com/storybooks/storybook/pull/19650)

#### Build

- Build: Reduce resource classes [#19652](https://github.com/storybooks/storybook/pull/19652)

## 7.0.0-alpha.44 (October 27, 2022)

#### Features

- Add tags to story and index [#19625](https://github.com/storybooks/storybook/pull/19625)
- CSF tools: Add tags support [#19626](https://github.com/storybooks/storybook/pull/19626)
- Vue2: Improve CSF3 types [#19603](https://github.com/storybooks/storybook/pull/19603)
- Vue3: Improve CSF3 types [#19602](https://github.com/storybooks/storybook/pull/19602)

#### Bug Fixes

- Core: Fix v6 store when no explicit renderer [#19624](https://github.com/storybooks/storybook/pull/19624)
- CLI/React native: Fix addons template to import register instead of manager [#19620](https://github.com/storybooks/storybook/pull/19620)

#### Maintenance

- Build-storybook: Only copy .mjs files for manager build [#19647](https://github.com/storybooks/storybook/pull/19647)
- Rename storybook/ui to storybook/manager [#19635](https://github.com/storybooks/storybook/pull/19635)
- Addons: Support SSR by not using global.window to store hooks context [#19631](https://github.com/storybooks/storybook/pull/19631)
- Breaking: Final few deprecations removal in a batch [#19553](https://github.com/storybooks/storybook/pull/19553)
- TypeScript: Misc types improvements [#19633](https://github.com/storybooks/storybook/pull/19633)
- TypeScript: Restructure storybook types [#19580](https://github.com/storybooks/storybook/pull/19580)
- TypeScript: cleanup types [#19621](https://github.com/storybooks/storybook/pull/19621)

#### Build

- Build: Reduce CI usage by 60% [#19644](https://github.com/storybooks/storybook/pull/19644)
- Remove `netlify.toml` [#19645](https://github.com/storybooks/storybook/pull/19645)
- Small fixes for `check` task [#19643](https://github.com/storybooks/storybook/pull/19643)
- Storybook for `@storybook/blocks` only [#19630](https://github.com/storybooks/storybook/pull/19630)
- Fix broken stories in UI Storybook [#19632](https://github.com/storybooks/storybook/pull/19632)
- Ugrade eslint [#19601](https://github.com/storybooks/storybook/pull/19601)
- Integrate standalone Storybook with Chromatic [#19619](https://github.com/storybooks/storybook/pull/19619)

## 7.0.0-alpha.43 (October 25, 2022)

#### Bug Fixes

- Core: Add `renderer` field to frameworks, and use to drive v6 store entrypoints [#19595](https://github.com/storybooks/storybook/pull/19595)
- Core: Add new SET_INDEX event [#19590](https://github.com/storybooks/storybook/pull/19590)
- CLI: Don't run MDX2 automigration on node_modules [#19611](https://github.com/storybooks/storybook/pull/19611)
- Core: Ensure preview annotations are resolved relative to the cwd [#19594](https://github.com/storybooks/storybook/pull/19594)
- Core: Fix addon URLs on Windows [#19589](https://github.com/storybooks/storybook/pull/19589)

#### Maintenance

- Vite: Tidy up mdx-plugin [#19563](https://github.com/storybooks/storybook/pull/19563)
- Web-components/Vite: remove unused dependencies [#19583](https://github.com/storybooks/storybook/pull/19583)

#### Build

- Remove DocBlocks example Storybook [#19616](https://github.com/storybooks/storybook/pull/19616)
- Move and include `@storybook/blocks` in standalone Storybook [#19615](https://github.com/storybooks/storybook/pull/19615)
- Move and include `@storybook/components` in standalone Storybook [#19598](https://github.com/storybooks/storybook/pull/19598)
- Move examples -> test-storybooks [#19599](https://github.com/storybooks/storybook/pull/19599)
- MDX iframe stories [#19586](https://github.com/storybooks/storybook/pull/19586)

#### Dependency Upgrades

- Upgrade mdx2-csf to next [#19600](https://github.com/storybooks/storybook/pull/19600)

## 7.0.0-alpha.42 (October 24, 2022)

#### Features

- Svelte: Improve CSF3 types [#19512](https://github.com/storybooks/storybook/pull/19512)

#### Maintenance

- Telemetry: Use a wrapper around all CLI commands to send boot and error events [#19566](https://github.com/storybooks/storybook/pull/19566)

#### Build

- Add ability to run tasks from code dir [#19588](https://github.com/storybooks/storybook/pull/19588)
- Make the reporter dynamic [#19587](https://github.com/storybooks/storybook/pull/19587)
- Add vite-react benchmark [#19558](https://github.com/storybooks/storybook/pull/19558)

#### Dependency Upgrades

- Fix test-runner version conflicts [#19581](https://github.com/storybooks/storybook/pull/19581)

## 7.0.0-alpha.41 (October 21, 2022)

#### Features

- Add `@storybook/nextjs` framework [#19382](https://github.com/storybooks/storybook/pull/19382)
- CLI: Enable `@storybook/nextjs` framework [#19478](https://github.com/storybooks/storybook/pull/19478)
- CLI: Automigrate from MDX1 to MDX2 [#19568](https://github.com/storybooks/storybook/pull/19568)

#### Maintenance

- Remove warning of removed feature in lib/client-api [#19544](https://github.com/storybooks/storybook/pull/19544)
- Remove vite-plugin-svelte-kit when detected [#19522](https://github.com/storybooks/storybook/pull/19522)

#### Build

- Delete Svelte example [#19549](https://github.com/storybooks/storybook/pull/19549)
- Fix circle test results [#19552](https://github.com/storybooks/storybook/pull/19552)

#### Dependency Upgrades

- Update the version of the "update-notifier" package [#19569](https://github.com/storybooks/storybook/pull/19569)

## 7.0.0-alpha.40 (October 20, 2022)

#### Breaking Changes

- Addon-docs: Upgrade to MDXv2 [#19495](https://github.com/storybooks/storybook/pull/19495)

#### Bug Fixes

- Addon-docs: Don't generate docs page entries for CSF files with no stories [#19529](https://github.com/storybooks/storybook/pull/19529)

#### Maintenance

- Remove deprecate features from preview-web [#19540](https://github.com/storybooks/storybook/pull/19540)
- Remove deprecated features in lib/api [#19539](https://github.com/storybooks/storybook/pull/19539)
- Remove default selection in docblocks [#19537](https://github.com/storybooks/storybook/pull/19537)

#### Build

- Remove .git folder when generating repros [#19535](https://github.com/storybooks/storybook/pull/19535)
- Some task runner tweaks + move test-runner into sandbox task. [#19505](https://github.com/storybooks/storybook/pull/19505)
- Build builder-webpack5 with ts-up [#19435](https://github.com/storybooks/storybook/pull/19435)

## 7.0.0-alpha.39 (October 19, 2022)

#### Breaking Changes

- Addons: Remove deprecations [#19524](https://github.com/storybooks/storybook/pull/19524)

#### Features

- Core: Throw an error if renderer is used as framework [#19452](https://github.com/storybooks/storybook/pull/19452)
- CLI: Add pnpm support [#19425](https://github.com/storybooks/storybook/pull/19425)
- CLI: support .json in eslint-plugin migration [#19511](https://github.com/storybooks/storybook/pull/19511)

#### Bug Fixes

- Vite/React: Align with webpack react docgen [#19399](https://github.com/storybooks/storybook/pull/19399)
- Core: Direct logs to stdout [#19434](https://github.com/storybooks/storybook/pull/19434)
- Telemetry: Send start/build events even when there is no generator [#19507](https://github.com/storybooks/storybook/pull/19507)
- Core: Fix inconsistent telemetry debug [#19509](https://github.com/storybooks/storybook/pull/19509)

#### Maintenance

- Addon-docs: Define children for DocsContainer [#19437](https://github.com/storybooks/storybook/pull/19437)
- Convert issue templates to forms [#19370](https://github.com/storybooks/storybook/pull/19370)
- Change once.warn to deprecate when that is the actual intent [#19521](https://github.com/storybooks/storybook/pull/19521)
- Cleanup framework angular dependencies [#19389](https://github.com/storybooks/storybook/pull/19389)
- Frameworks: Don't re-export renderer types from frameworks [#19510](https://github.com/storybooks/storybook/pull/19510)
- Core: Remove storyStore.getSelection [#19491](https://github.com/storybooks/storybook/pull/19491)
- CLI: rename "latest" to "v13" app name in angular v13 repro template [#19498](https://github.com/storybooks/storybook/pull/19498)

#### Build

- Improve misc build parts [#19520](https://github.com/storybooks/storybook/pull/19520)
- Build: Bundle addons/storysource with ts-up [#19482](https://github.com/storybooks/storybook/pull/19482)
- Build: Bundle lib/docs-tools & lib/instrumenter with ts-up [#19206](https://github.com/storybooks/storybook/pull/19206)
- Actions: update actions/setup-node to v3 [#19444](https://github.com/storybooks/storybook/pull/19444)
- Actions: update actions/checkout to v3 [#19441](https://github.com/storybooks/storybook/pull/19441)
- Build: Bundle lib/codemod with ts-up [#19398](https://github.com/storybooks/storybook/pull/19398)
- Build: Bundle addons/highlight with ts-up [#19483](https://github.com/storybooks/storybook/pull/19483)
- Enable preact templates and remove `preact-kitchen-sink` [#19454](https://github.com/storybooks/storybook/pull/19454)

#### Dependency Upgrades

- Addon-docs: Make babel-loader an optional peer dependency [#19385](https://github.com/storybooks/storybook/pull/19385)
- Add missing addons/docs dependency for fs-extra [#19493](https://github.com/storybooks/storybook/pull/19493)

## 7.0.0-alpha.38 (October 15, 2022)

#### Bug Fixes

- Vite: Fix bail not being defined for vite builder [#19405](https://github.com/storybooks/storybook/pull/19405)

#### Maintenance

- Breaking: Remove onBeforeRender [#19489](https://github.com/storybooks/storybook/pull/19489)
- Breaking: Upgrade to use node 16 everywhere [#19458](https://github.com/storybooks/storybook/pull/19458)
- Breaking: Remove the old showRoots config option [#19440](https://github.com/storybooks/storybook/pull/19440)
- CLI: Make the button component accept a label prop, (not children) [#19461](https://github.com/storybooks/storybook/pull/19461)
- Remove `angular-cli` example [#19202](https://github.com/storybooks/storybook/pull/19202)
- Breakimg: Remove the html entrypoint of lib/components [#19487](https://github.com/storybooks/storybook/pull/19487)
- Vite: Add partial SvelteKit support [#19338](https://github.com/storybooks/storybook/pull/19338)

#### Build

- Angular: Add angular 14 sandbox template [#19181](https://github.com/storybooks/storybook/pull/19181)
- Storybook for Storybook - step 1: `ui/manager` [#19465](https://github.com/storybooks/storybook/pull/19465)
- Don't pass the full path to repro generators [#19480](https://github.com/storybooks/storybook/pull/19480)
- Bundle lib/channel-postmessage with ts-up [#19388](https://github.com/storybooks/storybook/pull/19388)
- Disable smoke test [#19475](https://github.com/storybooks/storybook/pull/19475)
- Remove angular example from monorepo [#19467](https://github.com/storybooks/storybook/pull/19467)
- Add angular 13 repro template [#19428](https://github.com/storybooks/storybook/pull/19428)
- Add a TypeScript check task and configure ci to run it [#19471](https://github.com/storybooks/storybook/pull/19471)
- Add Preact/Webpack templates and update renderer/preset (2) [#19451](https://github.com/storybooks/storybook/pull/19451)
- Disable another smoke test [#19466](https://github.com/storybooks/storybook/pull/19466)

#### Dependency Upgrades

- Ipgrade chromatic [#19468](https://github.com/storybooks/storybook/pull/19468)

## 7.0.0-alpha.37 (October 13, 2022)

#### Features

- React: Sound arg types for CSF3 [#19238](https://github.com/storybooks/storybook/pull/19238)
- Vite: Add web-components/lit framework support [#19164](https://github.com/storybooks/storybook/pull/19164)
- UI: Update colors for 7.0 [#19023](https://github.com/storybooks/storybook/pull/19023)

#### Bug Fixes

- Server: Ensure consistent route handling by always starting `managerBuilder` before `previewBuilder` [#19406](https://github.com/storybooks/storybook/pull/19406)
- UI: Fix addon URL escaping in manager [#19375](https://github.com/storybooks/storybook/pull/19375)
- CLI: remove `npx` usage from storybook scripts [#19366](https://github.com/storybooks/storybook/pull/19366)
- Webpack5: Fix lazy compilation/fscache builderOptions when base config is disabled [#19387](https://github.com/storybooks/storybook/pull/19387)

#### Maintenance

- Breaking: remove the deprecated Preview component [#19445](https://github.com/storybooks/storybook/pull/19445)
- Breaking: remove deprecated channel apis [#19443](https://github.com/storybooks/storybook/pull/19443)
- Breaking: remove framework angulars storymodule story-component handling [#19442](https://github.com/storybooks/storybook/pull/19442)
- Breaking: remove deprecated glob fixing [#19438](https://github.com/storybooks/storybook/pull/19438)
- Refactor bootstrap+sandbox into "task" framework [#19275](https://github.com/storybooks/storybook/pull/19275)
- CI: Fix test-runner build step [#19255](https://github.com/storybooks/storybook/pull/19255)
- Angular: Drop support for angular < 13 [#19368](https://github.com/storybooks/storybook/pull/19368)
- Build: Add installScripts step in bootstrap command [#19270](https://github.com/storybooks/storybook/pull/19270)
- Vite: Move default cache dir to node_modules/.cache [#19384](https://github.com/storybooks/storybook/pull/19384)

#### Build

- Addon-docs: Refactor MDX examples to sandboxes [#19301](https://github.com/storybooks/storybook/pull/19301)
- Undo accidental push of tom/sb-557-typescript-2 [#19450](https://github.com/storybooks/storybook/pull/19450)
- Ensure we kill all controllers before exiting [#19449](https://github.com/storybooks/storybook/pull/19449)
- Examples: Remove official-storybook [#19343](https://github.com/storybooks/storybook/pull/19343)
- Build: Improve template stories [#19402](https://github.com/storybooks/storybook/pull/19402)
- Vue: Delete vue-cli/vue-kitchen-sink examples [#19429](https://github.com/storybooks/storybook/pull/19429)
- React: Remove react-ts example [#19424](https://github.com/storybooks/storybook/pull/19424)
- Web-components: Port template stories and delete web-components-kitchen-sink [#19430](https://github.com/storybooks/storybook/pull/19430)
- remove html-kitchen-sink example [#19360](https://github.com/storybooks/storybook/pull/19360)
- add template for html-webpack5 [#19377](https://github.com/storybooks/storybook/pull/19377)
- use a single version of yarn [#19417](https://github.com/storybooks/storybook/pull/19417)
- fix build command for netlify [#19418](https://github.com/storybooks/storybook/pull/19418)
- Re-enable `svelte-vite/default-ts` template [#19369](https://github.com/storybooks/storybook/pull/19369)
- Only persist the (single) built sandbox [#19372](https://github.com/storybooks/storybook/pull/19372)

#### Dependency Upgrades

- Replace @storybook/semver with semver [#19292](https://github.com/storybooks/storybook/pull/19292)
- Upgrade playwright [#19416](https://github.com/storybooks/storybook/pull/19416)

## 7.0.0-alpha.36 (October 13, 2022)

Bad publish

## 7.0.0-alpha.35 (October 5, 2022)

#### Features

- Angular: Disable ngcc when not needed [#19307](https://github.com/storybooks/storybook/pull/19307)
- Vite: Add vue-vite framework for Vue2 [#19230](https://github.com/storybooks/storybook/pull/19230)
- Storyshots-puppeteer: Add browserLaunchOptions to CommonConfig [#18927](https://github.com/storybooks/storybook/pull/18927)

#### Bug Fixes

- Vite: Fix svelte docgen and svelte-native stories [#19339](https://github.com/storybooks/storybook/pull/19339)
- CLI: Exclude @storybook/testing-react from outdated check [#19272](https://github.com/storybooks/storybook/pull/19272)
- Interactions: Fix path to checkActionsLoaded [#19334](https://github.com/storybooks/storybook/pull/19334)
- Webpack: Fix resolution of webpack config relating to resolve fallbacks (assert) [#19358](https://github.com/storybooks/storybook/pull/19358)
- Vite: Add vite framework plugin if not found [#19259](https://github.com/storybooks/storybook/pull/19259)
- Vue2: Fix play function `within` & args updating in decorators [#19207](https://github.com/storybooks/storybook/pull/19207)

#### Maintenance

- Addon-docs: Remove STORYBOOK_REACT_CLASSES and global/globals.ts [#19300](https://github.com/storybooks/storybook/pull/19300)
- Cleanup premature merge [#19332](https://github.com/storybooks/storybook/pull/19332)
- CLI: Update sb add for main.js [#19312](https://github.com/storybooks/storybook/pull/19312)
- React: Move argType stories to template/stories folder [#19265](https://github.com/storybooks/storybook/pull/19265)

#### Build

- Build: Add react17 + webpack5 template [#19342](https://github.com/storybooks/storybook/pull/19342)
- Build: Add react18 + webpack5 template [#19341](https://github.com/storybooks/storybook/pull/19341)
- Build: Forward parameters in nx command execution [#19283](https://github.com/storybooks/storybook/pull/19283)
- Build: cleanup after moving to tsup [#19268](https://github.com/storybooks/storybook/pull/19268)
- Build: change the vue e2e test to use webpack5, since we stopped supporting webpack4 in 7.0 [#19257](https://github.com/storybooks/storybook/pull/19257)
- Build: Add vue-cli/vue2 repro template [#19314](https://github.com/storybooks/storybook/pull/19314)
- Build: Bundle addons-actions with ts-up [#18775](https://github.com/storybooks/storybook/pull/18775)
- Build: Bundle lib/addons with ts-up [#18805](https://github.com/storybooks/storybook/pull/18805)
- Build: improve the tsconfig [#19346](https://github.com/storybooks/storybook/pull/19346)
- Build: Bundle lib/telemetry with ts-up [#19317](https://github.com/storybooks/storybook/pull/19317)
- Build: Bundle lib/store with tsup [#19308](https://github.com/storybooks/storybook/pull/19308)
- Build: Bundle lib/source-loader with ts-up [#19313](https://github.com/storybooks/storybook/pull/19313)
- Build: Bundle lib/csf-tools with ts-up [#18914](https://github.com/storybooks/storybook/pull/18914)
- Build: Bundle lib/core-client with ts-up [#19276](https://github.com/storybooks/storybook/pull/19276)
- Build: Bundle lib/client-api with ts-up [#19271](https://github.com/storybooks/storybook/pull/19271)
- Build: Bundle lib/postinstall with ts-up [#19327](https://github.com/storybooks/storybook/pull/19327)
- Build: Add react18 + webpack5 template [#19341](https://github.com/storybooks/storybook/pull/19341)
- Build: Remove cypress from monorepo [#19303](https://github.com/storybooks/storybook/pull/19303)
- Build: Disable smoke test on cra/default-ts [#19352](https://github.com/storybooks/storybook/pull/19352)
- Build: Fix prepare bundle on Windows [#19243](https://github.com/storybooks/storybook/pull/19243)
- Build: Bundle addons/essentials with ts-up [#19322](https://github.com/storybooks/storybook/pull/19322)

## 7.0.0-alpha.34 (September 27, 2022)

#### Features

- Vite: Export storybook utilities from frameworks for better pnpm support [#19216](https://github.com/storybooks/storybook/pull/19216)

#### Bug Fixes

- Vite: Do not add Webpack loaders when using Vite builder [#19263](https://github.com/storybooks/storybook/pull/19263)
- Source-loader: Fix invalid call to CSF sanitize [#18930](https://github.com/storybooks/storybook/pull/18930)
- Svelte: generate preview file with js extension always [#19253](https://github.com/storybooks/storybook/pull/19253)
- UI: Fix react runtime for addons in manager [#19226](https://github.com/storybooks/storybook/pull/19226)
- Svelte: Fix button component not accepting the onClick handler [#19249](https://github.com/storybooks/storybook/pull/19249)
- Vite: Support runStep in Vite builder SSv6 [#19235](https://github.com/storybooks/storybook/pull/19235)
- Angular: Alias decorateStory as applyDecorators [#19189](https://github.com/storybooks/storybook/pull/19189)
- UI: Recalculate height of ZoomElement when child element updates [#15472](https://github.com/storybooks/storybook/pull/15472)
- UI: Fix copy button copying outdated snippet [#18888](https://github.com/storybooks/storybook/pull/18888)
- UI: Fix clipboard issue [#18999](https://github.com/storybooks/storybook/pull/18999)
- CLI: Do not remove framework dependency in automigration [#19129](https://github.com/storybooks/storybook/pull/19129)
- TS: Type `storyIdToEntry` explicitly [#19123](https://github.com/storybooks/storybook/pull/19123)

#### Maintenance

- Vue3: Add generic renderer stories & delete vue3 example [#19219](https://github.com/storybooks/storybook/pull/19219)
- Build: Remove unused angular_modern_inline_rendering [#19254](https://github.com/storybooks/storybook/pull/19254)
- Build: bundle csf-tools with tsup [#19141](https://github.com/storybooks/storybook/pull/19141)
- Build: Enforce @ts-expect-error via eslint [#19198](https://github.com/storybooks/storybook/pull/19198)
- Vue: Add repro template for vue-cli [#19165](https://github.com/storybooks/storybook/pull/19165)
- Build: Link renderer-specific stories inside the sandbox's real stories dir [#19185](https://github.com/storybooks/storybook/pull/19185)
- Build: Remove `cra-kitchen-sink` example [#19179](https://github.com/storybooks/storybook/pull/19179)
- Build: Fix the check script [#19184](https://github.com/storybooks/storybook/pull/19184)
- Build: Build lib/node-logger with ts-up [#19173](https://github.com/storybooks/storybook/pull/19173)
- Build: Fix sandbox running multiple versions of react [#19156](https://github.com/storybooks/storybook/pull/19156)
- Build: fix playwright version again [#19250](https://github.com/storybooks/storybook/pull/19250)
- Build: upgrade playwright version (and lock it) [#19227](https://github.com/storybooks/storybook/pull/19227)

#### Dependency Upgrades

- Remove @nicolo-ribaudo/chokidar-2 [#19244](https://github.com/storybooks/storybook/pull/19244)

## 7.0.0-alpha.33 (September 13, 2022)

#### Features

- Core: Add a new `throwPlayFunctionExceptions` parameter [#19143](https://github.com/storybooks/storybook/pull/19143)

#### Bug Fixes

- Fix issue in instrumenter with `waitFor` [#19145](https://github.com/storybooks/storybook/pull/19145)
- Core: Fix static dirs targeting same destination [#19064](https://github.com/storybooks/storybook/pull/19064)
- React: Fix issue with react 18 implementation [#19125](https://github.com/storybooks/storybook/pull/19125)
- CLI: Fix spawning child processes on windows [#19019](https://github.com/storybooks/storybook/pull/19019)
- Vite: Ensure we set `DOCS_OPTIONS` in the vite builder [#19127](https://github.com/storybooks/storybook/pull/19127)

#### Maintenance

- Build: Bundle @storybook/cli with tsup [#19138](https://github.com/storybooks/storybook/pull/19138)
- Examples: Remove `cra-ts-essentials` [#19170](https://github.com/storybooks/storybook/pull/19170)
- Added some basic interactions stories [#19153](https://github.com/storybooks/storybook/pull/19153)
- Presets: Replace `config` with `previewAnnotations`, remove `previewEntries` [#19152](https://github.com/storybooks/storybook/pull/19152)
- Addon-links: Move stories into addon [#19124](https://github.com/storybooks/storybook/pull/19124)
- Addon-a11y: Move stories into addon [#19114](https://github.com/storybooks/storybook/pull/19114)
- Toolbars: Generic example stories [#19166](https://github.com/storybooks/storybook/pull/19166)
- TypeScript: Revert a few @ts-expect-errors [#19168](https://github.com/storybooks/storybook/pull/19168)
- Addon-docs: Generic stories for DocsPage [#19162](https://github.com/storybooks/storybook/pull/19162)
- Controls: Generic stories for sorting [#19161](https://github.com/storybooks/storybook/pull/19161)
- Build: Generic stories for addon-controls [#19149](https://github.com/storybooks/storybook/pull/19149)
- remove node12 from the matrix [#19147](https://github.com/storybooks/storybook/pull/19147)
- Build libs/router with ts-up [#19140](https://github.com/storybooks/storybook/pull/19140)
- Build: Bundle addon-interactions with tsup [#19139](https://github.com/storybooks/storybook/pull/19139)
- Generic stories for remaining core features [#19118](https://github.com/storybooks/storybook/pull/19118)
- Add parameter, loader and decorator stories to `lib/store` [#19105](https://github.com/storybooks/storybook/pull/19105)
- Convert @ts-ignore to @ts-expect-error [#19122](https://github.com/storybooks/storybook/pull/19122)

#### Dependency Upgrades

- Upgrade emotion deps again [#19054](https://github.com/storybooks/storybook/pull/19054)

## 7.0.0-alpha.31 (September 7, 2022)

#### Maintenance

- Doc blocks: Update ArgTable Reset button to use IconButton [#19052](https://github.com/storybooks/storybook/pull/19052)
- UI: Update a handful of icons [#19084](https://github.com/storybooks/storybook/pull/19084)
- Build: Update to latest nx [#19078](https://github.com/storybooks/storybook/pull/19078)
- Vite: Fix plugin types [#19095](https://github.com/storybooks/storybook/pull/19095)

#### Dependency Upgrades

- Chore: Remove unused dependencies in /lib [#19100](https://github.com/storybooks/storybook/pull/19100)

## 7.0.0-alpha.30 (September 6, 2022)

#### Bug Fixes

- CLI: Fix include rendererAssets in npm bundle [#19115](https://github.com/storybooks/storybook/pull/19115)

#### Maintenance

- CLI: remove outdated comment in Angular starter [#19097](https://github.com/storybooks/storybook/pull/19097)

#### Dependency Upgrades

- Remove deprecated `stable` dependency [#19103](https://github.com/storybooks/storybook/pull/19103)
- Svelte: Update sveltedoc dependencies [#19111](https://github.com/storybooks/storybook/pull/19111)
- Deps: Remove core-js from most packages [#19098](https://github.com/storybooks/storybook/pull/19098)
- Deps: Upgrade react-element-to-jsx-string and react-inspector for React 18 [#19104](https://github.com/storybooks/storybook/pull/19104)

## 7.0.0-alpha.29 (September 2, 2022)

#### Bug Fixes

- CLI/Vite: Don't add babel dependencies during init [#19088](https://github.com/storybooks/storybook/pull/19088)
- CLI: Fix sb init to use renderer assets instead of frameworks [#19091](https://github.com/storybooks/storybook/pull/19091)
- Core: Ensure if a docs render is torndown during preparation, it throws [#19071](https://github.com/storybooks/storybook/pull/19071)

#### Maintenance

- Addon-viewport: Move stories into addon [#19086](https://github.com/storybooks/storybook/pull/19086)
- Addon-backgrounds: Move stories into addon [#19085](https://github.com/storybooks/storybook/pull/19085)
- Addon-actions: Move stories into addon [#19082](https://github.com/storybooks/storybook/pull/19082)
- Build: Exit yarn bootstrap with nonzero code if failed [#19089](https://github.com/storybooks/storybook/pull/19089)
- Vite: cleanup custom plugins [#19087](https://github.com/storybooks/storybook/pull/19087)
- Build: Prefix generic addon stories in sandbox storybooks [#19092](https://github.com/storybooks/storybook/pull/19092)

## 7.0.0-alpha.28 (September 2, 2022)

#### Features

- Vite: Automatically use vite.config.js [#19026](https://github.com/storybooks/storybook/pull/19026)

#### Bug Fixes

- CLI: Fix race condition in sb init [#19083](https://github.com/storybooks/storybook/pull/19083)
- Vite: Fix framework option checks, and SSv6 [#19062](https://github.com/storybooks/storybook/pull/19062)
- Core: Fix WebProjectAnnotations export in preview-web for back-compat [#19048](https://github.com/storybooks/storybook/pull/19048)

#### Maintenance

- Update to new TS reference format (?) [#19072](https://github.com/storybooks/storybook/pull/19072)
- Build: Conditionally force vite rebuilds in sandbox [#19063](https://github.com/storybooks/storybook/pull/19063)
- Build: Fix CRA bench [#19066](https://github.com/storybooks/storybook/pull/19066)

## 7.0.0-alpha.27 (August 31, 2022)

#### Features

- Vite: Set `resolve.preserveSymlinks` based on env vars [#19039](https://github.com/storybooks/storybook/pull/19039)

#### Bug Fixes

- Core: Restore `/preview` etc package exports; return unresolved path from presets. [#19045](https://github.com/storybooks/storybook/pull/19045)

#### Maintenance

- Core: Add previewHead and previewBody to StorybookConfig interface [#19047](https://github.com/storybooks/storybook/pull/19047)
- Build: Fix the sb-bench CI step [#19029](https://github.com/storybooks/storybook/pull/19029)
- Remove sandbox from `.ignore` [#19040](https://github.com/storybooks/storybook/pull/19040)
- Build: Use new test runner with builtin junit [#19028](https://github.com/storybooks/storybook/pull/19028)

#### Dependency Upgrades

- Vite: Clean up framework dependencies / unused files [#19035](https://github.com/storybooks/storybook/pull/19035)

## 7.0.0-alpha.26 (August 26, 2022)

#### Features

- CLI: Add react, vue3, and svelte vite to new-frameworks automigration [#19016](https://github.com/storybooks/storybook/pull/19016)
- Svelte: Add svelte-vite framework [#18978](https://github.com/storybooks/storybook/pull/18978)

#### Bug Fixes

- Core: Fix default story glob [#19018](https://github.com/storybooks/storybook/pull/19018)

#### Dependency Upgrades

- React-vite: update/cleanup dependencies [#19025](https://github.com/storybooks/storybook/pull/19025)
- Remove babel-loader from core-common [#19022](https://github.com/storybooks/storybook/pull/19022)

## 7.0.0-alpha.25 (August 25, 2022)

#### Features

- Vite: Add builder-vite, react-vite, and vue3-vite [#19007](https://github.com/storybooks/storybook/pull/19007)

#### Maintenance

- CI: use runner with playwright installed for cra_bench [#18951](https://github.com/storybooks/storybook/pull/18951)
- Replace rollup-plugin-node-polyfills to analogs [#18975](https://github.com/storybooks/storybook/pull/18975)

## 7.0.0-alpha.24 (August 24, 2022)

#### Breaking changes

- Preview: Rename Storybook DOM root IDs [#10638](https://github.com/storybooks/storybook/pull/10638)

#### Features

- Interactions: Add `step` function and support multiple levels of nesting [#18555](https://github.com/storybooks/storybook/pull/18555)

#### Bug Fixes

- Addon-docs: Fix canvas support expand code for non-story [#18808](https://github.com/storybooks/storybook/pull/18808)
- Components: Avoid including line numbers when copying the code [#18725](https://github.com/storybooks/storybook/pull/18725)
- Vue: Fix enum check in extractArgTypes [#18959](https://github.com/storybooks/storybook/pull/18959)
- Core: Fix frameworkOptions preset [#18979](https://github.com/storybooks/storybook/pull/18979)

#### Maintenance

- Addon-a11y: Remove achromatomaly color filter [#18852](https://github.com/storybooks/storybook/pull/18852)
- Build: Use ts-up to build core-webpack [#18912](https://github.com/storybooks/storybook/pull/18912)
- Build: Use ts-up to build addon-viewport [#18943](https://github.com/storybooks/storybook/pull/18943)
- Build: Improve generate-repros-next [#19001](https://github.com/storybooks/storybook/pull/19001)
- Examples: Remove refs in angular example [#18986](https://github.com/storybooks/storybook/pull/18986)
- Build: Use ts-up to build client-logger [#18893](https://github.com/storybooks/storybook/pull/18893)
- Generate-repros: Run local registry on `--local-registry` option [#18997](https://github.com/storybooks/storybook/pull/18997)
- Build: Remove unused bootstrap --cleanup [#18981](https://github.com/storybooks/storybook/pull/18981)
- CLI: Fix local repro publishing [#18977](https://github.com/storybooks/storybook/pull/18977)
- Build: Run verdaccio on 6001 to enable web UI [#18983](https://github.com/storybooks/storybook/pull/18983)
- CLI: determine whether to add interactive stories from `renderer` rather than `framework` [#18968](https://github.com/storybooks/storybook/pull/18968)
- CLI: Auto-accept migrations when running `generate-repros-next` [#18969](https://github.com/storybooks/storybook/pull/18969)

## 7.0.0-alpha.23 (August 18, 2022)

#### Features

- UI: Polish canvas and sidebar for 7.0 [#18894](https://github.com/storybooks/storybook/pull/18894)

#### Maintenance

- Sandbox: Add ability to run from local repro [#18950](https://github.com/storybooks/storybook/pull/18950)
- Repros: Add ability to generate repros using local registry [#18948](https://github.com/storybooks/storybook/pull/18948)
- CLI: Move write/read package json into JsPackageManager [#18942](https://github.com/storybooks/storybook/pull/18942)

## 7.0.0-alpha.22 (August 18, 2022)

Failed publish to npm

## 7.0.0-alpha.21 (August 17, 2022)

#### Maintenance

- UI: Update every icon for v7 design [#18809](https://github.com/storybooks/storybook/pull/18809)

## 7.0.0-alpha.20 (August 16, 2022)

#### Features

- CLI: Automigration for new frameworks [#18919](https://github.com/storybooks/storybook/pull/18919)

#### Bug Fixes

- UI: Fix the order of addons appearing in prebuilt manager [#18918](https://github.com/storybooks/storybook/pull/18918)

#### Maintenance

- Exit sandbox gracefully on cancel [#18936](https://github.com/storybooks/storybook/pull/18936)
- Disable telemetry in monorepo and CI [#18935](https://github.com/storybooks/storybook/pull/18935)
- Convert cypress e2e tests to playwright [#18932](https://github.com/storybooks/storybook/pull/18932)
- CI: Refactor to use tasks [#18922](https://github.com/storybooks/storybook/pull/18922)
- Angular: Add renderer components / stories [#18934](https://github.com/storybooks/storybook/pull/18934)
- Examples: Add angular repro template and refactor [#18931](https://github.com/storybooks/storybook/pull/18931)

## 7.0.0-alpha.19 (August 12, 2022)

#### Features

- CLI: add "storybook scripts 7.0" automigrate command [#18769](https://github.com/storybooks/storybook/pull/18769)
- Interactions: Run conditionally based on query param [#18706](https://github.com/storybooks/storybook/pull/18706)

#### Bug Fixes

- API: Return defaultValue in useParameter if story is not prepared [#18887](https://github.com/storybooks/storybook/pull/18887)
- Store: always call composeConfigs in setProjectAnnotations [#18916](https://github.com/storybooks/storybook/pull/18916)
- CLI: install the same version as the user in sb-scripts automigration [#18917](https://github.com/storybooks/storybook/pull/18917)
- Theming: Add `create` export for lib/theming [#18906](https://github.com/storybooks/storybook/pull/18906)
- Telemetry: Improve addon extraction logic [#18868](https://github.com/storybooks/storybook/pull/18868)
- UI: Add image support to builder-manager [#18857](https://github.com/storybooks/storybook/pull/18857)
- ArgTypes: Fix check for undefined before [#18710](https://github.com/storybooks/storybook/pull/18710)

#### Maintenance

- Build: use ts-up to build addon-toolbars [#18847](https://github.com/storybooks/storybook/pull/18847)
- Build: Use ts-up to build channels [#18882](https://github.com/storybooks/storybook/pull/18882)
- Build: Use ts-up to build addon-links [#18908](https://github.com/storybooks/storybook/pull/18908)
- CLI: Fix remove dependencies logic [#18905](https://github.com/storybooks/storybook/pull/18905)
- CLI: Add uninstall deps to jsPackageManager [#18900](https://github.com/storybooks/storybook/pull/18900)
- Examples: Improve sandbox command error handling and debugging [#18869](https://github.com/storybooks/storybook/pull/18869)
- Examples: Change to self-hosted placeholder images [#18878](https://github.com/storybooks/storybook/pull/18878)
- CLI: add --no-init to repro-next command [#18866](https://github.com/storybooks/storybook/pull/18866)
- Build: Got verdaccio working, borrowing heavily from the old repro command [#18844](https://github.com/storybooks/storybook/pull/18844)
- Core-server: Move webpack to be a devDependency [#18856](https://github.com/storybooks/storybook/pull/18856)

## 7.0.0-alpha.18 (August 2, 2022)

#### Features

- CLI: Add temporary sb repro-next command that only degits repros [#18834](https://github.com/storybooks/storybook/pull/18834)
- Interactions: Add step function to play context [#18673](https://github.com/storybooks/storybook/pull/18673)
- UI: Add preloading to stories highlighted in the sidebar [#17964](https://github.com/storybooks/storybook/pull/17964)

#### Bug Fixes

- UI: Fix refs with authentication being broken if the fetch for `iframe.html` succeeds (but with a request to authenticate) [#18160](https://github.com/storybooks/storybook/pull/18160)
- HTML: Fix missing ability to set `docs.extractArgTypes` [#18831](https://github.com/storybooks/storybook/pull/18831)
- React: Fix callback behavior in `react@18` [#18737](https://github.com/storybooks/storybook/pull/18737)
- CLI: Throw error on failure in sb init [#18816](https://github.com/storybooks/storybook/pull/18816)
- CLI: Fix package.json version detection [#18806](https://github.com/storybooks/storybook/pull/18806)

#### Maintenance

- Build: Use ts-up to build `addon-outline` [#18842](https://github.com/storybooks/storybook/pull/18842)
- Core: Fix default framework options handling [#18676](https://github.com/storybooks/storybook/pull/18676)
- Build: Use tsup to build `addon-measure` and fix related imports in `examples/official-storybook` [#18837](https://github.com/storybooks/storybook/pull/18837)
- Build: Use tsup to build addon-jest [#18836](https://github.com/storybooks/storybook/pull/18836)
- Examples: Use `repro-next` in the example script! [#18839](https://github.com/storybooks/storybook/pull/18839)
- Examples: Rename `example` => `sandbox` [#18838](https://github.com/storybooks/storybook/pull/18838)
- Examples: Use a set of test components in addon stories [#18825](https://github.com/storybooks/storybook/pull/18825)
- Examples: Copy example stories over from renderer + addons [#18824](https://github.com/storybooks/storybook/pull/18824)
- Examples: Set `resolve.symlinks` based on node option [#18827](https://github.com/storybooks/storybook/pull/18827)
- Examples: Add command to publish repros + GH action [#18800](https://github.com/storybooks/storybook/pull/18800)
- Examples: Create a new `yarn example` command [#18781](https://github.com/storybooks/storybook/pull/18781)
- Build: Fix yarn build command [#18817](https://github.com/storybooks/storybook/pull/18817)
- Build: Use tsup to build core-event [#18798](https://github.com/storybooks/storybook/pull/18798)

## 7.0.0-alpha.17 (July 27, 2022)

#### Features

- Addon-docs: Support DocsPage in v6 store [#18763](https://github.com/storybooks/storybook/pull/18763)

#### Bug Fixes

- Preact: Typescript pragma fix [#15564](https://github.com/storybooks/storybook/pull/15564)
- Core: Clear addon cache directory before starting the manager [#18731](https://github.com/storybooks/storybook/pull/18731)
- UI: Pass full docs options to manager [#18762](https://github.com/storybooks/storybook/pull/18762)
- Preview: Fix standalone MDX files not HMR-ing [#18747](https://github.com/storybooks/storybook/pull/18747)

#### Maintenance

- CLI: Add next-repro command [#18787](https://github.com/storybooks/storybook/pull/18787)
- Build: Remove old scripts that are no longer used [#18790](https://github.com/storybooks/storybook/pull/18790)
- Build: Addon-backgrounds with ts-up [#18784](https://github.com/storybooks/storybook/pull/18784)
- Build: Addon-controls with tsup [#18786](https://github.com/storybooks/storybook/pull/18786)
- Build: Use updated circleci node images [#18785](https://github.com/storybooks/storybook/pull/18785)
- Build: Move all code into a `code` directory [#18759](https://github.com/storybooks/storybook/pull/18759)
- Build: Lint css, html, json, md, mdx, yml files [#18735](https://github.com/storybooks/storybook/pull/18735)

## 7.0.0-alpha.16 (July 25, 2022)

#### Bug Fixes

- Addon docs: Pass remarks plugins to mdx loader [#18740](https://github.com/storybooks/storybook/pull/18740)
- Preview: Ensure docs container re-renders when globals change [#18711](https://github.com/storybooks/storybook/pull/18711)
- Core: Set other manager-side constants in build [#18728](https://github.com/storybooks/storybook/pull/18728)
- CLI: Fix detection of type: module when initializing storybook [#18714](https://github.com/storybooks/storybook/pull/18714)
- UI: Include full URL in the "Copy Canvas Link" button [#17498](https://github.com/storybooks/storybook/pull/17498)
- Toolbars: Fallback to name if title and icon are unspecified [#17430](https://github.com/storybooks/storybook/pull/17430)
- CLI: Fix addons register in RN template [#18693](https://github.com/storybooks/storybook/pull/18693)
- Index: Support `{ csfData as default }` CSF exports [#18588](https://github.com/storybooks/storybook/pull/18588)
- Svelte: Always create main with cjs extension [#18648](https://github.com/storybooks/storybook/pull/18648)

#### Maintenance

- Build addons/a11y with ts-up [#18772](https://github.com/storybooks/storybook/pull/18772)
- Typescript: Drop Emotion 10 types in lib/theming [#18598](https://github.com/storybooks/storybook/pull/18598)
- Tests: Don't run the docs e2e in `react@18` [#18736](https://github.com/storybooks/storybook/pull/18736)
- Addon-docs: Localize channel to docs context [#18730](https://github.com/storybooks/storybook/pull/18730)
- Addon-docs: Move DocsRenderer back to addon-docs [#18708](https://github.com/storybooks/storybook/pull/18708)
- Addon-docs: Remove `AddContext` from mdx packages [#18709](https://github.com/storybooks/storybook/pull/18709)
- Preview: Simplify docsMode [#18729](https://github.com/storybooks/storybook/pull/18729)
- Examples: Upgrade @storybook/jest in examples [#18582](https://github.com/storybooks/storybook/pull/18582)
- Svelte: Make `svelte-loader` optional dependency [#18645](https://github.com/storybooks/storybook/pull/18645)
- Build: Fix dts-localize script for windows [#18664](https://github.com/storybooks/storybook/pull/18664)

#### Dependency Upgrades

- Storyshots: Allow react-test-renderer 18 [#18296](https://github.com/storybooks/storybook/pull/18296)
- Core: Remove unnecessary webpack dependency [#18651](https://github.com/storybooks/storybook/pull/18651)

## 7.0.0-alpha.15 (July 25, 2022)

Failed publish

## 7.0.0-alpha.14 (July 25, 2022)

Failed publish

## 7.0.0-alpha.13 (July 11, 2022)

### Features

- UI: Remove docs tab ([#18677](https://github.com/storybookjs/storybook/pull/18677))

### Bug Fixes

- Index: Don't prepend `titlePrefix` to a docs entry that references a CSF file's title ([#18634](https://github.com/storybookjs/storybook/pull/18634))

### Maintenance

- Addon-dcos: Refactor DocsRender/Context ([#18635](https://github.com/storybookjs/storybook/pull/18635))
- Instrumenter: `SyncPayload` type for `sync` event ([#18674](https://github.com/storybookjs/storybook/pull/18674))

## 7.0.0-alpha.12 (July 7, 2022)

### Features

- Addon-docs: Produce docs page entries in the index ([#18574](https://github.com/storybookjs/storybook/pull/18574))
- Svelte: Supports action auto configuration ([#18174](https://github.com/storybookjs/storybook/pull/18174))
- Addon-docs: Add docs index configuration via main.js ([#18573](https://github.com/storybookjs/storybook/pull/18573))
- Preview: Handle new docs-page index entries ([#18595](https://github.com/storybookjs/storybook/pull/18595))

### Bug Fixes

- CLI: Remove addon-actions install from `sb init` ([#18255](https://github.com/storybookjs/storybook/pull/18255))
- Angular: Fix compodoc with spaces in workspace root ([#18140](https://github.com/storybookjs/storybook/pull/18140))
- Core: Add type guard for globalWindow ([#18251](https://github.com/storybookjs/storybook/pull/18251))
- Core: Fix builder stats typings to be optional ([#18377](https://github.com/storybookjs/storybook/pull/18377))

### Maintenance

- Core: Async load presets, replace interpret with esbuild-register ([#18619](https://github.com/storybookjs/storybook/pull/18619))
- Build: Improve linting a bit ([#18642](https://github.com/storybookjs/storybook/pull/18642))

### Dependency Upgrades

- Deps: Use `dequal` for equality checks ([#18608](https://github.com/storybookjs/storybook/pull/18608))

## 7.0.0-alpha.11 (July 6, 2022)

### Features

- Interactions: Show exceptions by non-instrumented code in panel ([#16592](https://github.com/storybookjs/storybook/pull/16592))

### Maintenance

- Build: Add linter for ejs ([#18637](https://github.com/storybookjs/storybook/pull/18637))
- Core: Improve interopRequireDefault ([#18638](https://github.com/storybookjs/storybook/pull/18638))
- Core: Pre-built manager using esbuild ([#18550](https://github.com/storybookjs/storybook/pull/18550))
- Build: Add check-packages script plus misc improvements ([#18633](https://github.com/storybookjs/storybook/pull/18633))
- Core: Typing useArgs ([#17735](https://github.com/storybookjs/storybook/pull/17735))
- Build: Add a check script to each package ([#18603](https://github.com/storybookjs/storybook/pull/18603))
- Build: Use playwright in benchmark ([#18606](https://github.com/storybookjs/storybook/pull/18606))

## 7.0.0-alpha.10 (July 2, 2022)

### Features

- Addon-docs: Include Vue methods in ArgsTable ([#18609](https://github.com/storybookjs/storybook/pull/18609))
- UI: Fix default theme according to preferred color scheme ([#17311](https://github.com/storybookjs/storybook/pull/17311))
- Storyshots: Add SnapshotsWithOptionsArgType ([#15712](https://github.com/storybookjs/storybook/pull/15712))
- Controls: Add max length config to text control ([#14396](https://github.com/storybookjs/storybook/pull/14396))

### Bug Fixes

- CLI/HTML: Improve HTML typescript stories ([#18618](https://github.com/storybookjs/storybook/pull/18618))
- Controls: Throttle color controls and make `updateArgs` and `resetArgs` stable ([#18335](https://github.com/storybookjs/storybook/pull/18335))
- Controls: Silence unexpected control type enum for color matchers ([#16334](https://github.com/storybookjs/storybook/pull/16334))
- UI: Stop add-on Draggable from overlapping the vertical scrollbar when stories overflow ([#17663](https://github.com/storybookjs/storybook/pull/17663))
- React: Fix source snippet decorator for story functions with suspense ([#17915](https://github.com/storybookjs/storybook/pull/17915))
- Core: Avoid logging an object on compilation errors ([#15885](https://github.com/storybookjs/storybook/pull/15885))
- UI: Fix router handling of URLs containing "settings" ([#16245](https://github.com/storybookjs/storybook/pull/16245))
- UI: Fix viewMode handling on navigation ([#16912](https://github.com/storybookjs/storybook/pull/16912))
- UI: Fix loading title ([#17935](https://github.com/storybookjs/storybook/pull/17935))

### Maintenance

- Examples/Vue: Fix missing a vue-template-compiler dependency ([#17485](https://github.com/storybookjs/storybook/pull/17485))
- Fix homepage core-server ([#18121](https://github.com/storybookjs/storybook/pull/18121))
- UI: Replace references to `themes.normal` with `themes.light` ([#17034](https://github.com/storybookjs/storybook/pull/17034))

### Dependency Upgrades

- Upgrade file-system-cache to 2.0.0 and remove custom types ([#18253](https://github.com/storybookjs/storybook/pull/18253))
- Security: Update x-default-browser and fix issue with package. ([#18277](https://github.com/storybookjs/storybook/pull/18277))
- Update puppeteer dependencies version ([#15163](https://github.com/storybookjs/storybook/pull/15163))
- Upgrade react-syntax-highlighter to v15.5.0 ([#18009](https://github.com/storybookjs/storybook/pull/18009))

## 7.0.0-alpha.9 (July 2, 2022)

Failed publish

## 7.0.0-alpha.8 (June 29, 2022)

### Features

- Webpack: Support .cjs extension ([#18502](https://github.com/storybookjs/storybook/pull/18502))

### Maintenance

- Docs2: Extract doc blocks into a separate package ([#18587](https://github.com/storybookjs/storybook/pull/18587))

## 7.0.0-alpha.7 (June 29, 2022)

### Features

- TypeScript: Re-structure types for frameworks and presets ([#18504](https://github.com/storybookjs/storybook/pull/18504))
- UI: Add parent wildcard sortOrder ([#18243](https://github.com/storybookjs/storybook/pull/18243))

### Bug Fixes

- UI: Fix typo in CSS pseudo selector ([#17708](https://github.com/storybookjs/storybook/pull/17708))
- UI: Fix sidebar a11y by moving aria-expanded attribute to button ([#18354](https://github.com/storybookjs/storybook/pull/18354))
- CLI: Hook up the npm7 migration ([#18522](https://github.com/storybookjs/storybook/pull/18522))

### Maintenance

- Build: Use TSUP to compile `core-common` ([#18546](https://github.com/storybookjs/storybook/pull/18546))
- Build: Use TSUP to compile the presets ([#18544](https://github.com/storybookjs/storybook/pull/18544))
- Build: Use TSUP to compile the frameworks ([#18543](https://github.com/storybookjs/storybook/pull/18543))
- Build: Use TSUP to compile the renderers ([#18534](https://github.com/storybookjs/storybook/pull/18534))
- Essentials: Add highlight addon ([#17800](https://github.com/storybookjs/storybook/pull/17800))
- Core: Replace `cpy` with `fs-extra` copy/copyFile ([#18497](https://github.com/storybookjs/storybook/pull/18497))
- Build: Enable Template.bind({}) TS support in our repo ([#18540](https://github.com/storybookjs/storybook/pull/18540))
- Turn on strict types in store + preview-web ([#18536](https://github.com/storybookjs/storybook/pull/18536))
- Addon-highlight: Convert to simplified addon style ([#17991](https://github.com/storybookjs/storybook/pull/17991))

### Dependency Upgrades

- Upgrade @storybook/testing-library to `0.0.14-next.0` ([#18539](https://github.com/storybookjs/storybook/pull/18539))

## 7.0.0-alpha.6 (June 21, 2022)

### Bug Fixes

- Interactions: Reset instrumenter state on HMR ([#18516](https://github.com/storybookjs/storybook/pull/18516))
- Interactions: Prevent showing child exception while parent is still playing ([#18518](https://github.com/storybookjs/storybook/pull/18518))

### Maintenance

- Docs2 core: Fetch `index.json` for composition ([#18521](https://github.com/storybookjs/storybook/pull/18521))
- Addon-docs: Switch Meta block to receive all module exports ([#18514](https://github.com/storybookjs/storybook/pull/18514))
- Re-add deprecated fields to lib/api ([#18488](https://github.com/storybookjs/storybook/pull/18488))
- Core: Handle v3 index in composition ([#18498](https://github.com/storybookjs/storybook/pull/18498))
- Story index: Ensure that `extract` script works and SBs can be composed into v6 storybooks ([#18409](https://github.com/storybookjs/storybook/pull/18409))
- Docs2: Handle new docs entries in the preview ([#18099](https://github.com/storybookjs/storybook/pull/18099))
- Docs2: Refactor manager to use new index data ([#18023](https://github.com/storybookjs/storybook/pull/18023))

## 7.0.0-alpha.5 (June 20, 2022)

### Bug Fixes

- Core: Allow a teardown function to be returned from `renderToDOM` ([#18457](https://github.com/storybookjs/storybook/pull/18457))
- CLI: Add npm7 migration for legacy peer deps ([#18510](https://github.com/storybookjs/storybook/pull/18510))
- Interactions: Fix broken UI on nested interactions ([#18499](https://github.com/storybookjs/storybook/pull/18499))

### Maintenance

- Build: Upgrade yarn to 3.2.1 ([#18511](https://github.com/storybookjs/storybook/pull/18511))

## 7.0.0-alpha.4 (June 19, 2022)

### Breaking Changes

- Core: Remove standalone node APIs ([#18089](https://github.com/storybookjs/storybook/pull/18089))

### Maintenance

- Build: Add logFilters to yarn config ([#18500](https://github.com/storybookjs/storybook/pull/18500))
- Build: Set typescript strict-mode ([#18493](https://github.com/storybookjs/storybook/pull/18493))

## 7.0.0-alpha.3 (June 17, 2022)

### Features

- Interactions: Collapse child interactions ([#18484](https://github.com/storybookjs/storybook/pull/18484))

### Bug Fixes

- Interactions: Fix `waitFor` behavior while debugging ([#18460](https://github.com/storybookjs/storybook/pull/18460))
- UI: Fix display skip to sidebar button ([#18479](https://github.com/storybookjs/storybook/pull/18479))

### Maintenance

- CLI: Use `storybook` instead of `sb` ([#18430](https://github.com/storybookjs/storybook/pull/18430))
- Components: Re-bundle the syntax highlighter ([#18425](https://github.com/storybookjs/storybook/pull/18425))

## 7.0.0-alpha.2 (June 15, 2022)

### Features

- UI: Update manager to respect `parameters.docsOnly` in `stories.json` ([#18433](https://github.com/storybookjs/storybook/pull/18433))
- CLI: Add additional files api to sb repro ([#18389](https://github.com/storybookjs/storybook/pull/18389))

### Bug Fixes

- Core: Fix process is not defined when using components ([#18469](https://github.com/storybookjs/storybook/pull/18469))
- Story index: Warn on `storyName` in CSF3 exports ([#18464](https://github.com/storybookjs/storybook/pull/18464))
- Telemetry: Strip out preset from addon name ([#18442](https://github.com/storybookjs/storybook/pull/18442))

### Maintenance

- CLI: Improve to be more async & cleanup ([#18475](https://github.com/storybookjs/storybook/pull/18475))
- 7.0.0 pnp support ([#18461](https://github.com/storybookjs/storybook/pull/18461))
- Build: Use playright version of sb-bench ([#18458](https://github.com/storybookjs/storybook/pull/18458))
- Angular: Support Angular 14 standalone components ([#18272](https://github.com/storybookjs/storybook/pull/18272))
- Build: Fix prebundle script on Windows ([#18365](https://github.com/storybookjs/storybook/pull/18365))
- Scripts: Clean verdaccio cache when running locally ([#18359](https://github.com/storybookjs/storybook/pull/18359))
- Core: fix PnP compatibility for @storybook/ui and @storybook/router packages ([#18412](https://github.com/storybookjs/storybook/pull/18412))

## 7.0.0-alpha.1 (June 7, 2022)

### Bug Fixes

- CLI: Fix `init` to install correct version of sb/storybook ([#18417](https://github.com/storybookjs/storybook/pull/18417))

## 7.0.0-alpha.0 (June 7, 2022)

### Breaking Changes

- Build chain upgrades: TS4, Webpack5, modern ESM, TSUP ([#18205](https://github.com/storybookjs/storybook/pull/18205))
- Create frameworks & rename renderers ([#18201](https://github.com/storybookjs/storybook/pull/18201))
- Core-webpack: Factor out webpack dependencies ([#18114](https://github.com/storybookjs/storybook/pull/18114))
- Core: Remove start-/build-storybook from all frameworks ([#17899](https://github.com/storybookjs/storybook/pull/17899))

### Features

- Core: Add pluggable indexers ([#18355](https://github.com/storybookjs/storybook/pull/18355))
- CLI: Add dev/build commands ([#17898](https://github.com/storybookjs/storybook/pull/17898))
- CLI: Add support for angular/cli v14 ([#18334](https://github.com/storybookjs/storybook/pull/18334))

### Bug Fixes

- Vue/Vue3: Fix decorators in StoryStoreV7 ([#18375](https://github.com/storybookjs/storybook/pull/18375))
- Preview: Default select to `viewMode` story ([#18370](https://github.com/storybookjs/storybook/pull/18370))

### Maintenance

- Core: Split webpack presets out of frameworks ([#18018](https://github.com/storybookjs/storybook/pull/18018))
- Core: Renderer refactor ([#17982](https://github.com/storybookjs/storybook/pull/17982))
- Core: Allow builders to be set in presets ([#18182](https://github.com/storybookjs/storybook/pull/18182))
- Core: Minimize webpack deps ([#18024](https://github.com/storybookjs/storybook/pull/18024))
- Core: Make renderers presets ([#18004](https://github.com/storybookjs/storybook/pull/18004))
- Examples: Simplify sb usage in package.json scripts ([#18065](https://github.com/storybookjs/storybook/pull/18065))

# Older versions

For older versions of the changelog, see [CHANGELOG.v6.md](./CHANGELOG.v6.md), [CHANGELOG.v1-5.md](./CHANGELOG.v1-5.md)
