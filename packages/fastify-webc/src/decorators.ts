import fs from 'node:fs'
import path from 'node:path'
import type { Readable } from 'node:stream'
import { WebC } from '@11ty/webc'
import type { TransformCallback } from '@11ty/webc'
import type { FastifyReply } from 'fastify'

export type Helpers = Record<string, { fn: Function; isScoped?: boolean }>
export type Transforms = Record<string, { fn: TransformCallback }>

interface Config {
  components: string | string[] | Record<string, string>
  helpers: Helpers
  logPrefix: string
  templates: string[]
  transforms: Transforms
  useBundlerMode: boolean
}

export const defRender = (config: Config) => {
  const {
    components,
    helpers,
    logPrefix,
    templates,
    transforms,
    useBundlerMode
  } = config
  return async function render(
    this: FastifyReply,
    pageName: string,
    data: Record<string, any>
  ) {
    let file: string | undefined
    for (const dir of templates) {
      const pagePath = path.join(dir, pageName)
      if (fs.existsSync(pagePath)) {
        file = pagePath
        break
      }
    }

    if (!file) {
      throw new Error(`template ${pageName} not found in ${templates}`)
    }

    // It seems I cannot reuse a single WebC instance across pages. Every page
    // needs its own WebC instance.
    // That's how eleventy-plugin-webc does it in this Eleventy transform.
    // https://github.com/11ty/eleventy-plugin-webc/blob/b5d39d55b330990280a9fea34dbf4fcd3d3d25a6/src/eleventyWebcTransform.js#L20
    // That's also how this koa middleware does it.
    // https://github.com/sombriks/koa-webc/blob/main/src/main.js
    const page = new WebC({ file })

    page.defineComponents(components)

    if (useBundlerMode) {
      page.setBundlerMode(true)
    }

    Object.entries(helpers).forEach(([key, { fn, isScoped }]) => {
      page.setHelper(key, fn, isScoped)
      this.log.debug(`${logPrefix}added helper '${key}' (scoped: ${isScoped})`)
    })

    Object.entries(transforms).forEach(([key, { fn }]) => {
      page.setTransform(key, fn)
      this.log.debug(`${logPrefix}added transform '${key}'`)
    })

    // const m = WebC.getComponentsMap(['**/*.webc'])
    // console.log('=== ComponentsMap ===', m)

    this.log.debug(data, `${logPrefix}compiling ${file}`)
    // const { html, css, js } = await page.compile({ data })
    const { html } = await page.compile({ data })

    // const mode = page.getRenderingMode(html)
    // this.log.debug(`rendering mode: ${mode}`)

    // TODO: streaming mode works for the template authorize.webc, but not for
    // the template error.webc. The template is rendered and all dynamic
    // attributes are correctly passed (e.g. :foo="1+2"), BUT no webc RESERVED
    // PROP reaches the template (e.g. if we write <p @text="error_uri"></p> we
    // get an empty <p></p>).
    // this.log.debug(data, `${logPrefix}streaming ${file}`)
    // const { html } = await page.stream({ data })

    // Fastify supports sending Node.js Readable streams as responses. So we can
    // just call reply.send(string | Readable stream)
    let payload: string | Readable
    if (page.bundlerMode) {
      payload = html
    } else {
      payload = html
    }

    this.header('Content-Type', 'text/html; charset=utf-8')
    return this.code(200).send(payload)
  }
}
