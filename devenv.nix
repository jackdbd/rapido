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
    CONTENTS_API_GITHUB_TOKEN = builtins.readFile /run/secrets/github-tokens/crud_contents_api;
    JWKS = builtins.readFile /home/jack/repos/micropub/secrets/jwks.txt;
    NODE_ENV = "development";
    # NPM_TOKEN = builtins.readFile /run/secrets/npm-tokens/semantic_release_bot;
    PINO_LOG_LEVEL = "debug";
    PORT = "3001";
    TELEGRAM_CHAT_ID = telegram.chat_id;
    TELEGRAM_TOKEN = telegram.token;
    TEST_FILE_TO_DEBUG = "packages/fastify-token-endpoint/test/route-token-post.js";
    TURSO_DATABASE_TOKEN = turso.database_token;
    TURSO_DATABASE_URL = "libsql://micropub-jackdbd.turso.io";
  };

  languages = {
    nix.enable = true;
  };

  packages = with pkgs; [
    entr # run arbitrary commands when files change
    git
    gnused
    nodejs
    rsync
    sd # sed replacement
  ];

  pre-commit.hooks = {
    alejandra.enable = true;
    # deadnix.enable = true;
    hadolint.enable = true;
    prettier.enable = false;
    statix.enable = true;
  };

  scripts = {
    build.exec = ''
      echo "build package $1"
      npm run build -w @repo/stdlib -w @repo/scripts -w ./packages/$1
      npm run publint -w ./packages/$1 --if-present
      # npm run size -w ./packages/$1 --if-present
    '';
    "build:ts".exec = ''
      npm run build:ts
    '';
    changeset-add.exec = ''
      npx changeset add
    '';
    changeset-reset-canary.exec = ''
      rm -f .changeset/pre.json
      find .changeset -type f -name "*.md" ! -name "README.md" -delete
      npx changeset pre enter canary
    '';
    "debug:app".exec = ''
      npm run build:ts
      npm run vendor
      npm run copy:webc
      NODE_ENV=development NODE_OPTIONS='--inspect' PINO_LOG_LEVEL=debug node apps/demo-app/dist/server.js --port 3001 --print-plugins --print-routes | npx pino-pretty
    '';
    "debug:test".exec = ''
      echo "debug test file $TEST_FILE_TO_DEBUG"
      echo "Don't forget to set some breakpoints and attach to the Node.js process using the configuration that has \"request\": \"attach\" in launch.json"
      NODE_ENV=test node --inspect-brk --test $TEST_FILE_TO_DEBUG
    '';
    "debug:tests".exec = ''
      echo "debug all tests"
      echo "Don't forget to set some breakpoints and attach to the Node.js process using the configuration that has \"request\": \"attach\" in launch.json"
      NODE_ENV=test node --inspect-brk test-runner.mjs
      # NODE_ENV=test node --inspect-brk --test packages/fastify-authorization-endpoint/test/$1.js
    '';
    dev.exec = ''
      echo "develop package $1"
      # npm run dev -w @repo/stdlib -w @repo/scripts -w @jackdbd/$1
      npx turbo dev -F @repo/stdlib -F @repo/scripts -F ./packages/$1
    '';
    "dev:app".exec = ''
      npm run build:ts
      # npm run vendor
      npm run copy:webc
      npm run dev -w @repo/demo-app
    '';
    serve.exec = ''
      echo "serve directory $1"
      npx http-server $1 --port 8090
    '';
    "test:ci".exec = ''
      echo "test package $1"
      npm run build:ts -w @jackdbd/$1
      npm run test:ci -w @jackdbd/$1
    '';
    "test:watch".exec = ''
      echo "watch tests of package $1"
      npm run test:watch -w @jackdbd/$1
    '';
    versions.exec = ''
      echo "=== Versions ==="
      git --version
      echo "Node.js $(node --version)"
      echo "=== === ==="
    '';
  };
}
