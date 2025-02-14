# {{pkg.name}}

{{pkg.description}}

Compile a script, then launch it. For example:

```sh
npm run build -w @repo/scripts

node packages/scripts/dist/indieauth-client-metadata.js --client-id https://indiebookclub.biz/id
```

If you don't want to compile a TypeScript first, you can launch it using [tsm](https://github.com/lukeed/tsm). For example:

```sh
npx tsm packages/scripts/src/indieauth-client-metadata.ts --client-id https://indiebookclub.biz/id
```

{{pkg.private}}

{{pkg.deps}}

{{pkg.peerDependencies}}

{{pkg.license}}
