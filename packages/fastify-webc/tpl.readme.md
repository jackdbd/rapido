# {{pkg.name}}

{{badges}}

{{pkg.description}}

<!-- toc -->

{{pkg.installation}}

## Configuration

Register this plugin by telling it where to find your WebC components and templates.

This plugin decorates `FastifyReply` with a `render` method. This method takes two arguments: a WebC template and an optional data object.

```ts
import webc from '@jackdbd/fastify-webc'

fastify.register(webc, {
  components: ['src/components/**/*.webc'],
  templates: [path.join(__dirname, 'templates')]
})

fastify.get('/demo', function (request, reply) {
  const data = { foo: 'bar' }
  return reply.render('demo.webc', data)
})
```

## TypeScript

To ensure TypeScript recognizes the `render` method as part of the `FastifyReply` object, you must use [declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html) to extend the `FastifyReply` interface.

```ts
declare module 'fastify' {
  interface FastifyReply {
    render(template: string, data?: Record<string, any>): Promise<void>
  }
}
```

## Tips

You can access the WebC instance from your WebC template/component using `this.webc`.

```html
<code>this.webc</code>
<pre @text="JSON.stringify(this.webc, null, 2)"></pre>
```

You can access the data available to the WebC template/component using `this.$data`.

```html
<code>this.$data</code>
<pre @text="JSON.stringify(this.$data, null, 2)"></pre>
```

{{pkg.deps}}

{{pkg.peerDependencies}}

## References

- [eleventy-plugin-webc](https://github.com/11ty/eleventy-plugin-webc/)
- [eleventy-plugin-bundle](https://github.com/11ty/eleventy-plugin-bundle/)
- [express-webc](https://github.com/NickColley/express-webc)
- [koa-webc](https://github.com/sombriks/koa-webc/)

{{pkg.license}}
