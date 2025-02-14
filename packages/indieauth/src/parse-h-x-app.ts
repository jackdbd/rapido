import { parser, type Content, type Node } from 'posthtml-parser'
import type { ClientMetadata } from './schemas/client-metadata.js'

interface Options {
  debug?: boolean
  requireMicroformatApp?: boolean
  url?: string
}

const defaults: Partial<Options> = {
  debug: false,
  requireMicroformatApp: false
}

interface Info {
  has_app?: boolean
}

const microformat = {
  app: 'h-x-app', // https://indieweb.org/h-x-app
  client_name: 'p-name',
  client_uri: 'u-url',
  logo_uri: 'u-logo'
}

function isAbsoluteUrl(str: string) {
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}

const traverseNode = (
  node: Node,
  metadata: ClientMetadata,
  info: Info,
  options?: Options
) => {
  const opt = Object.assign({}, defaults, options)
  if (typeof node === 'number') {
    return
  }

  if (typeof node === 'string') {
    return
  }

  if (node.tag === 'input' && node.attrs) {
    if (
      node.attrs.name === 'client_id' &&
      typeof node.attrs.value === 'string'
    ) {
      metadata.client_id = node.attrs.value
    }

    if (
      node.attrs.name === 'client_uri' &&
      typeof node.attrs.value === 'string'
    ) {
      metadata.client_uri = node.attrs.value
    }

    if (
      node.attrs.name === 'redirect_uri' &&
      typeof node.attrs.value === 'string'
    ) {
      if (metadata.redirect_uris) {
        metadata.redirect_uris.push(node.attrs.value)
      } else {
        metadata.redirect_uris = [node.attrs.value]
      }
    }
  }

  if (node.attrs && node.attrs.class) {
    const splits = node.attrs.class.toString().split(' ')

    const has_app = splits.find((s) => s === microformat.app) !== undefined

    const has_client_name =
      splits.find((s) => s === microformat.client_name) !== undefined

    const has_client_uri =
      splits.find((s) => s === microformat.client_uri) !== undefined

    const has_logo_uri =
      splits.find((s) => s === microformat.logo_uri) !== undefined

    if (has_client_name) {
      if (node.attrs.alt && typeof node.attrs.alt === 'string') {
        metadata.client_name = node.attrs.alt
      }
    }

    if (has_client_uri && !metadata.client_uri) {
      if (node.attrs.href && typeof node.attrs.href === 'string') {
        metadata.client_uri = node.attrs.href
      }
    }

    if (has_logo_uri) {
      if (node.attrs.src && typeof node.attrs.src === 'string') {
        metadata.logo_uri = node.attrs.src
      }
    }

    if (has_app) {
      info.has_app = true
    }

    if (opt.debug) {
      console.log({
        node,
        has_app,
        has_client_name,
        has_client_uri,
        has_logo_uri
      })
    }
  }

  if (node.content) {
    traverseContent(node.content, metadata, info, opt)
  }
}

const traverseContent = (
  content: Content,
  metadata: ClientMetadata,
  info: Info,
  options?: Options
) => {
  const opt = Object.assign({}, defaults, options)
  if (typeof content === 'number') {
    return
  }
  if (typeof content === 'string') {
    return
  }

  for (const nc of content) {
    const nn = Array.isArray(nc) ? nc : [nc]
    for (const n of nn) {
      traverseNode(n, metadata, info, opt)
    }
  }
}

export const htmlToClientMetadata = (html: string, options?: Options) => {
  const opt = Object.assign({}, defaults, options)
  const debug = opt.debug

  let nodes: Node[] = []
  try {
    nodes = parser(html)
  } catch (ex: any) {
    return { error: new Error(`Failed to parse HTML: ${ex.message}`) }
  }

  const metadata: ClientMetadata = { client_id: '', client_uri: '' }

  const info: Info = { has_app: false }

  for (const node of nodes) {
    traverseNode(node, metadata, info, options)
  }

  if (debug) {
    console.log('metadata retrieved after traversing HTML nodes', metadata)
    console.log('info retrieved after traversing HTML nodes', info)
  }

  if (!info.has_app) {
    const msg = `Microformat class ${microformat.app} not found in HTML`
    if (opt.debug) {
      console.log(`Microformat class ${microformat.app} not found in HTML`)
    }

    if (opt.requireMicroformatApp) {
      return { error: new Error(msg) }
    }
  }

  if (!metadata.client_id) {
    if (opt.url) {
      const client_id =
        opt.url[opt.url.length - 1] === '/'
          ? opt.url.slice(0, opt.url.length - 1)
          : opt.url

      if (debug) {
        console.log(
          `failed to retrieve client_id from HTML; setting client_id=${client_id}`
        )
      }

      metadata.client_id = client_id
    } else {
      return { error: new Error(`Failed to retrieve client_id from HTML`) }
    }
  }

  if (!metadata.client_uri) {
    metadata.client_uri = metadata.client_id
  }

  if (!metadata.redirect_uris) {
    return { error: new Error(`Failed to retrieve redirect_uri from HTML`) }
  }

  if (metadata.redirect_uris && metadata.redirect_uris.length > 1) {
    if (opt.debug) {
      console.log(
        `HTML has ${metadata.redirect_uris.length} redirect_uris: ${metadata.redirect_uris.join(', ')}`
      )
    }
  }

  if (metadata.logo_uri) {
    metadata.logo_uri = isAbsoluteUrl(metadata.logo_uri)
      ? metadata.logo_uri
      : `${metadata.client_id}${metadata.logo_uri}`
  }

  return { value: metadata }
}
