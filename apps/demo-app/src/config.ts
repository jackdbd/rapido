import type { SyndicateToItem } from '@jackdbd/fastify-micropub-endpoint/schemas'

export interface Config {
  authorization_endpoint: string
  client_id: string
  host: string
  includeErrorDescription: boolean
  issuer: string
  log_level: string
  me: string
  media_endpoint: string
  micropub_endpoint: string
  port: number
  redirect_uri: string
  reportAllAjvErrors: boolean
  revocation_endpoint: string
  syndicate_to: SyndicateToItem[]
  token_endpoint: string
  userinfo_endpoint: string
}

export const defConfig = (port: number): Config => {
  const base_url = process.env.BASE_URL || `http://localhost:${port}`

  // TODO: read syndication_to from a JSON file?
  const syndicate_to: SyndicateToItem[] = [
    {
      uid: 'https://fosstodon.org/@jackdbd',
      name: 'jackdbd on Mastodon',
      service: {
        name: 'Mastodon',
        url: 'https://fosstodon.org/',
        photo:
          'https://cdn.fosstodon.org/accounts/avatars/000/028/400/original/324cba4cb379bd4e.png'
      },
      user: {
        name: 'jackdbd',
        url: 'https://fosstodon.org/@jackdbd',
        photo:
          'https://cdn.fosstodon.org/accounts/avatars/109/632/759/548/530/989/original/7662659b2847db84.jpeg'
      }
    },
    // TODO: https://news.indieweb.org/how-to-submit-a-post
    {
      uid: 'https://news.indieweb.org/en',
      name: 'giacomodebidda.com on IndieNews',
      service: {
        name: 'IndieNews',
        url: 'https://news.indieweb.org/en',
        photo:
          'https://indieweb.org/images/thumb/6/67/indiewebcamp-logo-lockup-color%403x.png/800px-indiewebcamp-logo-lockup-color%403x.png'
      }
    },
    {
      uid: 'https://t.me/+rQSrJsu5RtgzNjM0',
      name: 'Telegram GitHub Group'
    }
  ]

  return {
    authorization_endpoint: `${base_url}/auth`,
    client_id: 'https://micropub.fly.dev/id',
    host: process.env.HOST || '0.0.0.0',
    includeErrorDescription: true,
    issuer: base_url,
    log_level: process.env.PINO_LOG_LEVEL || 'info',
    me: 'https://giacomodebidda.com/',
    media_endpoint: `${base_url}/media`,
    micropub_endpoint: `${base_url}/micropub`,
    port,
    redirect_uri: `${base_url}/auth/callback`,
    reportAllAjvErrors: true,
    revocation_endpoint: `${base_url}/revoke`,
    syndicate_to,
    token_endpoint: `${base_url}/token`,
    userinfo_endpoint: `${base_url}/userinfo`
  }
}
