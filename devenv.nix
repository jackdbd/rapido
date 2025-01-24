{
  config,
  inputs,
  lib,
  pkgs,
  ...
}: let
  cloudflare_r2 = builtins.fromJSON (builtins.readFile /run/secrets/cloudflare/r2);
  semantic_release_bot_github_token = builtins.readFile /run/secrets/github-tokens/semantic_release_bot;
  telegram = builtins.fromJSON (builtins.readFile /run/secrets/telegram/jackdbd_github_bot);
  telegram_token_splits = builtins.split ":" telegram.token;
  turso = builtins.fromJSON (builtins.readFile /run/secrets/turso/micropub);
in {
  enterShell = ''
    versions
  '';

  enterTest = ''
    echo "Running tests"
    git --version | grep --color=auto "${pkgs.git.version}"
  '';

  env = {
    BASE_URL = "http://localhost:${config.env.PORT}";
    GITHUB_TOKEN = semantic_release_bot_github_token;
    # GITHUB_TOKEN = builtins.readFile /run/secrets/github-tokens/crud_contents_api;
    JWKS = builtins.readFile /home/jack/repos/micropub/secrets/jwks.txt;
    NODE_ENV = "development";
    NPM_TOKEN = builtins.readFile /run/secrets/npm-tokens/semantic_release_bot;
    PINO_LOG_LEVEL = "debug";
    PORT = "3001";
    # The github token used by @semantic-release/github must allow to push to this GitHub repository
    SEMANTIC_RELEASE_BOT_GITHUB_TOKEN = semantic_release_bot_github_token;
    # SKIP_VALIDATION = 1;
    TELEGRAM_CHAT_ID = telegram.chat_id;
    TELEGRAM_TOKEN = telegram.token;
    # semantic-release-telegram requires these environment variables that are
    # the Telegram bot token split at `:`.
    TELEGRAM_BOT_ID = builtins.head telegram_token_splits;
    TELEGRAM_BOT_TOKEN = builtins.elemAt telegram_token_splits 2; # weirdly, the first element is an empty string
    TURSO_DATABASE_TOKEN = turso.database_token;
    TURSO_DATABASE_URL = "libsql://micropub-jackdbd.turso.io";
  };

  languages = {
    nix.enable = true;
  };

  packages = with pkgs; [
    entr # run arbitrary commands when files change
    git
    nodejs
    yarn # monopub uses yarn
  ];

  pre-commit.hooks = {
    alejandra.enable = true;
    # deadnix.enable = true;
    hadolint.enable = true;
    # prettier.enable = true;
    statix.enable = true;
  };

  scripts = {
    monopub.exec = ''
      ./monopub/bin/monopub
    '';
    monopub-changelog.exec = ''
      ./monopub/bin/monopub changelog \
      --repo-path . --repo-url https://github.com/jackdbd/rapido \
      --root packages --scope @jackdbd \
      --since 2025-01-15
    '';
    monopub-changelog-dry-run.exec = ''
      ./monopub/bin/monopub changelog \
      --repo-path . --repo-url https://github.com/jackdbd/rapido \
      --root packages --scope @jackdbd \
      --since 2025-01-15 \
      --dry-run
    '';
    monopub-release.exec = ''
      ./monopub/bin/monopub release \
      --publish-script pub \
      --repo-path . --repo-url https://github.com/jackdbd/rapido \
      --root packages --scope @jackdbd \
      --release-branch canary \
      --since 2025-01-15 \
      --throttle 1500
    '';
    monopub-version.exec = ''
      ./monopub/bin/monopub version \
      --repo-path . --repo-url https://github.com/jackdbd/rapido \
      --root packages --scope @jackdbd
    '';
    monopub-version-dry-run.exec = ''
      ./monopub/bin/monopub version \
      --repo-path . --repo-url https://github.com/jackdbd/rapido \
      --root packages --scope @jackdbd \
      --dry-run
    '';
    versions.exec = ''
      echo "=== Versions ==="
      git --version
      echo "Node.js $(node --version)"
      echo "=== === ==="
    '';
  };
}
