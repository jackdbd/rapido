// https://github.com/semantic-release/changelog
const changelog = [
  "@semantic-release/changelog",
  {
    changelogFile: "CHANGELOG.md",
    changelogTitle: "# CHANGELOG",
  },
];

// https://github.com/semantic-release/github
const github = [
  "@semantic-release/github",
  {
    // An array of files to upload to the release.
    // https://github.com/semantic-release/github#assets
    assets: [
      { path: "CHANGELOG.md" },
      { path: "LICENSE" },
      { path: "README.md" },
    ],
  },
];

// https://github.com/semantic-release/npm
// Do NOT set npmPublish here. Instead, set "private": true or "private": false
// in the package.json of each monorepo package.
// See alse the release-to-npmjs.yaml GitHub workflow.
const npm = ["@semantic-release/npm", { pkgRoot: "." }];

/**
 * Additional conventional-commits-parser options that will extend the ones
 * loaded by preset or config.
 *
 * @see [conventional-commits-parser](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-commits-parser#conventionalcommitsparseroptions)
 */
const parserOpts = {
  // Example of a commit containing breaking changes (triggers a MAJOR release)
  //
  // feat(ngMessages): provide support for dynamic message resolution
  //
  // Prior to this fix it was impossible to apply a binding to a the ngMessage
  // directive to represent the name of the error.
  //
  // BREAKING CHANGE: The `ngMessagesInclude` attribute is now its own directive and that must be placed as a **child**
  // element within the element with the ngMessages directive.
  //
  // Closes #10036
  // Closes #9338
  noteKeywords: ["BREAKING CHANGE", "BREAKING CHANGES"],
};

/**
 * `config` will be overwritten by the values of `preset`. You should use
 * EITHER `preset` or `config`, but NOT BOTH.
 */
const preset = "conventionalcommits";

/**
 * For presets that expects a configuration object, such as conventionalcommits,
 * the presetConfig option MUST be set.
 *
 * @see [Conventional Changelog Configuration Spec (v2.0.0)](https://github.com/conventional-changelog/conventional-changelog-config-spec/blob/master/versions/2.0.0/README.md)
 */
const presetConfig = {
  types: [
    { type: "chore", hidden: true },
    { type: "docs", hidden: true },
    { type: "feat", section: "Features" },
    { type: "fix", section: "Bug Fixes" },
    { type: "perf", hidden: true },
    { type: "refactor", hidden: true },
    { type: "style", hidden: true },
    { type: "test", hidden: true },
  ],
};

// https://github.com/semantic-release/commit-analyzer
const commit_analyzer = [
  "@semantic-release/commit-analyzer",
  {
    parserOpts,
    preset,
    presetConfig,

    // https://github.com/semantic-release/commit-analyzer#releaserules
    releaseRules: [
      // Updating the documentation of the monorepo itself should not trigger a
      // release, but updating the documentation of a library of this monorepo
      // certainly should.
      { type: "docs", scope: "fastify-*", release: "patch" },
      // Maybe a refactor should trigger a release. I am not 100% convinced though.
      { type: "refactor", release: "patch" },
      { scope: "no-release", release: false },
    ],
  },
];

const exec = [
  "@semantic-release/exec",
  {
    verifyConditionsCmd: "npx publint run .",
  },
];

// https://github.com/semantic-release/release-notes-generator
const release_notes_generator = [
  "@semantic-release/release-notes-generator",
  {
    parserOpts,
    preset,
    presetConfig,

    // Additional conventional-commits-writer options that will extend the ones
    // loaded by preset or config.
    // https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-writer#options
    // See here for customizations:
    // https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-writer#customization-guide
    writerOpts: {},
  },
];

// https://github.com/pustovitDmytro/semantic-release-telegram
const telegram = [
  "semantic-release-telegram",
  {
    chats: [process.env.TELEGRAM_CHAT_ID],
  },
];

module.exports = {
  changelog,
  commit_analyzer,
  exec,
  github,
  npm,
  release_notes_generator,
  telegram,
};
