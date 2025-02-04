import eslint from '@eslint/js'
import repoPrettierConfig from '@repo/prettier-config'
import prettierConfig from 'eslint-config-prettier'
import onlyWarn from 'eslint-plugin-only-warn'
import prettier from 'eslint-plugin-prettier'
import turbo from 'eslint-plugin-turbo'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const config = [
  // https://github.com/eslint-recommended/eslint-config
  eslint.configs.recommended,
  // https://typescript-eslint.io/getting-started
  ...tseslint.configs.recommended,
  {
    ignores: ['dist/**'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    },
    plugins: {
      // https://github.com/bfanger/eslint-plugin-only-warn
      onlyWarn,
      // https://github.com/prettier/eslint-plugin-prettier
      prettier,
      // https://github.com/vercel/turborepo/blob/main/packages/eslint-plugin-turbo/README.md
      turbo
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],
      'prettier/prettier': [
        'error',
        { ...prettierConfig, ...repoPrettierConfig }
      ],
      'turbo/no-undeclared-env-vars': 'warn'
    }
  }
]

export default config
