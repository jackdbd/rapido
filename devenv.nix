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
  telegram_personal = builtins.fromJSON (builtins.readFile /run/secrets/telegram/personal_bot);
  telegram_token_splits = builtins.split ":" telegram.token;
  turso = builtins.fromJSON (builtins.readFile /run/secrets/turso/micropub);
in {
  enterShell = ''
    echo "=== [BEGIN] enterShell ==="
    echo "=== versions of the tools used in this repository ==="
    versions
    echo "=== Files tracked by git LFS ==="
    git lfs track
    echo "=== repository size ==="
    git count-objects --human-readable --verbose
    echo "=== [END] enterShell ==="
  '';

  enterTest = ''
    echo "Running tests"
    git --version | grep --color=auto "${pkgs.git.version}"
  '';

  env = {
    BASE_URL = "http://localhost:${config.env.PORT}";
    # These authorization codes are used in demo-app. KEEP THEM SECRET.
    CODE_NO_MEDIA_SCOPE = builtins.readFile /run/secrets/codecov/token;
    CODE_NO_PROFILE_SCOPE = builtins.readFile /run/secrets/ngrok/auth_token;
    # This is used in demo-app to verify an authorization code. It must be at
    # least 43 characters long. Use the same value used in Bruno and KEEP THIS
    # SECRET, otherwise anyone knowing the authorization code and this code
    # verifier will be able to exchange the authorization code for an access token.
    CODE_VERIFIER = builtins.readFile /run/secrets/github-tokens/crud_contents_api;
    CODECOV_TOKEN = builtins.readFile /run/secrets/codecov/token;
    CONTENTS_API_GITHUB_TOKEN = builtins.readFile /run/secrets/github-tokens/crud_contents_api;
    JWKS = builtins.readFile /home/jack/repos/micropub/secrets/jwks.txt;
    NODE_ENV = "development";
    # NPM_TOKEN = builtins.readFile /run/secrets/npm-tokens/semantic_release_bot;
    PINO_LOG_LEVEL = "debug";
    PORT = "3001";
    # PROGRAM_TO_DEBUG = "packages/scripts/dist/syndicate.js --jf2 rsvp --target telegram-chat --target telegram-chat-personal";
    # PROGRAM_TO_DEBUG = "packages/scripts/dist/syndicate.js --html note --all";
    PROGRAM_TO_DEBUG = "packages/scripts/dist/syndicate.js --url article --all";
    # PROGRAM_TO_DEBUG = "packages/scripts/dist/syndicate.js --jf2 rsvp --all";
    TELEGRAM_CHAT_ID = telegram.chat_id;
    TELEGRAM_CHAT_ID_PERSONAL = telegram_personal.chat_id;
    TELEGRAM_TOKEN = telegram.token;
    TEST_FILE_TO_DEBUG = "packages/micropub/test/jf2-predicates.js";
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
    nodejs_23
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
    "debug:program".exec = ''
      echo "debug $PROGRAM_TO_DEBUG"
      echo "Don't forget to set some breakpoints and attach to the Node.js process using the configuration that has \"request\": \"attach\" in launch.json"
      NODE_ENV=development NODE_OPTIONS='--inspect-brk' PINO_LOG_LEVEL=debug node $PROGRAM_TO_DEBUG
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
    search.exec = ''
      # search nixpkgs for packages (e.g. nix search nixpkgs nodejs)
      nix search nixpkgs $1
    '';
    serve.exec = ''
      echo "serve directory $1"
      npx http-server $1 --port 8090
    '';
    syndicate.exec = ''
      npm run syndicate -w packages/scripts -- "$@"
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
      git --version
      echo "Node.js $(node --version)"
    '';
  };
}
