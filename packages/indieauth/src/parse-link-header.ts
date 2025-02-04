export const linkHeaderToLinkHref = (link: string) => {
  const splits = link.split(',').filter((s) => s.includes('indieauth-metadata'))

  if (splits.length < 1) {
    return { error: new Error(`Link has no rel="indieauth-metadata"`) }
  }

  if (splits.length > 1) {
    return {
      error: new Error(`Link has more than one rel="indieauth-metadata"`)
    }
  }

  // TypeScript says splits[0] can be undefined. I am not sure how that's
  // possible, given the previous two returns.
  const str = splits[0]
  if (!str) {
    return { error: new Error(`Link is invalid`) }
  }
  const [uri_reference, ..._rest] = str.split(';')

  if (!uri_reference) {
    return {
      error: new Error(`Link has rel="indieauth-metadata" but no URI reference`)
    }
  }

  const href = uri_reference.replace('<', '').replace('>', '').trim()

  return { value: href }
}
