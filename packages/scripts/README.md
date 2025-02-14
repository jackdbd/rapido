# @repo/scripts

Scripts for managing the project.

Compile a script, then launch it. For example:

```sh
npm run build -w @repo/scripts

node packages/scripts/dist/indieauth-client-metadata.js --client-id https://indiebookclub.biz/id
```

If you don't want to compile a TypeScript first, you can launch it using [tsm](https://github.com/lukeed/tsm). For example:

```sh
npx tsm packages/scripts/src/indieauth-client-metadata.ts --client-id https://indiebookclub.biz/id
```

> [!WARNING]
> This is an [internal package](https://turbo.build/repo/docs/core-concepts/internal-packages).
>
> An internal package should have `private: true` in its `package.json` because it's not meant to be published to npm.js.

## Dependencies

| Package | Version |
|---|---|
| [@apideck/better-ajv-errors](https://www.npmjs.com/package/@apideck/better-ajv-errors) | `^0.3.6` |
| [@sinclair/typebox](https://www.npmjs.com/package/@sinclair/typebox) | `^0.34.14` |
| [@thi.ng/transclude](https://www.npmjs.com/package/@thi.ng/transclude) | `^1.1.1` |
| [ajv](https://www.npmjs.com/package/ajv) | `^8.17.1` |
| [ajv-formats](https://www.npmjs.com/package/ajv-formats) | `^3.0.1` |

## License

&copy; 2024 - 2025 [Giacomo Debidda](https://www.giacomodebidda.com/) // [MIT License](https://spdx.org/licenses/MIT.html)
