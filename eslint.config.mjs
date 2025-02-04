import eslint from '@eslint/js'
import repoPrettierConfig from '@repo/prettier-config'
import prettierConfig from 'eslint-config-prettier'
import onlyWarnPlugin from 'eslint-plugin-only-warn'
import prettierPlugin from 'eslint-plugin-prettier'
import turboPlugin from 'eslint-plugin-turbo'
import globals from 'globals'
import tseslint from 'typescript-eslint'

// https://typescript-eslint.io/users/what-about-formatting/#suggested-usage---prettier
// https://github.com/vercel/turborepo/blob/main/packages/eslint-plugin-turbo/README.md
// https://github.com/prettier/eslint-config-prettier
// https://github.com/bfanger/eslint-plugin-only-warn

const config = [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  // configuration for eslint-plugin-turbo
  {
    plugins: {
      turbo: turboPlugin
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'warn'
    }
  },
  // configuration for eslint-plugin-prettier
  {
    plugins: {
      prettier: prettierPlugin
    },
    rules: {
      'prettier/prettier': [
        'error',
        { ...prettierConfig, ...repoPrettierConfig }
      ] // enforce Prettier rules
    }
  },
  // configuration for eslint-plugin-only-warn
  {
    plugins: {
      onlyWarn: onlyWarnPlugin
    }
  },
  {
    ignores: ['dist/**'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  }
]

export default config
