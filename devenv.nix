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
    # GITHUB_TOKEN = semantic_release_bot_github_token;
    # GITHUB_TOKEN = builtins.readFile /run/secrets/github-tokens/crud_contents_api;
    JWKS = builtins.readFile /home/jack/repos/micropub/secrets/jwks.txt;
    NODE_ENV = "development";
    NPM_TOKEN = builtins.readFile /run/secrets/npm-tokens/semantic_release_bot;
    PINO_LOG_LEVEL = "debug";
    PORT = "3001";
    # The github token used by @semantic-release/github must allow to push to this GitHub repository
    # SEMANTIC_RELEASE_BOT_GITHUB_TOKEN = semantic_release_bot_github_token;
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
  ];

  pre-commit.hooks = {
    alejandra.enable = true;
    # deadnix.enable = true;
    hadolint.enable = true;
    # prettier.enable = true;
    statix.enable = true;
  };

  scripts = {
    build.exec = ''
      echo "build package $1"
      npm run build -w @repo/stdlib -w @repo/scripts -w @jackdbd/$1
      # npx turbo build -F @repo/stdlib -F @repo/scripts -F ./packages/$1
    '';
    changeset.exec = ''
      npx changeset add
    '';
    dev.exec = ''
      echo "develop package $1"
      # npm run dev -w @repo/stdlib -w @repo/scripts -w @jackdbd/$1
      npx turbo dev -F @repo/stdlib -F @repo/scripts -F ./packages/$1
    '';
    versions.exec = ''
      echo "=== Versions ==="
      git --version
      echo "Node.js $(node --version)"
      echo "=== === ==="
    '';
  };
}
