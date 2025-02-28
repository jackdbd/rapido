import path from 'node:path'
import { JF2 } from '@jackdbd/micropub'
import { defAtom } from '@thi.ng/atom'
import yargs from 'yargs/yargs'
import {
  ASSETS_ROOT,
  exitZero,
  exitOne,
  LINK_BUGS,
  log,
  SAMPLE_HTML,
  SAMPLE_JF2,
  SAMPLE_URL,
  SAMPLE_FEED_URL
} from '@repo/stdlib'
import {
  defTelegramChat,
  defFilesystem,
  SyndicationTarget
} from '@repo/syndication/syndication-targets/index'
import { syndicate } from '@repo/syndication'

const USAGE = `Syndicate a single URL, all entries of a feed, an HTML string or a JF2 to the specified syndication targets`

// syndication target UID
const uid_telegram = 'telegram-chat'
const uid_telegram_personal = 'telegram-chat-personal'
const uid_fs_syndication = 'fs-syndication'

const FAKE_CANONICAL_URL = new URL('https://example.com/')

const state = defAtom({} as Record<string, any>)

const telegram_chat = defTelegramChat({
  chat_id: process.env.TELEGRAM_CHAT_ID!,
  bot_token: process.env.TELEGRAM_TOKEN!,
  retrieveSyndicateResponse: async (idempotencyKey) => {
    return state.deref()[idempotencyKey]
  },
  storeSyndicateResponse: async (response) => {
    const { idempotencyKey } = response
    state.swap((m) => {
      return { ...m, [idempotencyKey]: response }
    })
  },
  uid: uid_telegram
})

const SYNDICATION_TARGET = {
  [uid_telegram]: telegram_chat,
  [uid_telegram_personal]: defTelegramChat({
    chat_id: process.env.TELEGRAM_CHAT_ID_PERSONAL!,
    bot_token: process.env.TELEGRAM_TOKEN!,
    uid: uid_telegram_personal
  }),
  [uid_fs_syndication]: defFilesystem({
    uid: uid_fs_syndication,
    root_path: path.join(ASSETS_ROOT, 'syndication')
  })
}

const available_html_samples = Object.keys(SAMPLE_HTML)
const available_jf2_samples = Object.keys(SAMPLE_JF2)
// const available_url_samples = Object.keys(SAMPLE_URL)
// const available_feed_url_samples = Object.keys(SAMPLE_FEED_URL)
const available_syndication_targets = Object.keys(SYNDICATION_TARGET)

const run = async () => {
  const argv = await yargs(process.argv.slice(2))
    .usage(`./$0 - ${USAGE}`)
    .option('feed', {
      describe:
        'URL that hosts a feed (supported feeds: RSS, JSON). Each feed entry should contain a canonical URL. All canonical URLs found in the feed will be syndicated to the syndication targets you specified.',
      type: 'string',
      demandOption: false
    })
    .option('all', {
      describe: `If true, syndicate to all available syndication targets (${available_syndication_targets.join(', ')})`,
      type: 'boolean',
      default: false
    })
    .option('html', {
      describe:
        'If specified, this script does not fetch a URL. Instead, it uses a sample HTML string and syndicate that HTML instead (useful for testing/troubleshooting).',
      type: 'string',
      choices: available_html_samples,
      demandOption: false
    })
    .option('jf2', {
      describe:
        'If specified, this script does not fetch a URL. Instead, it uses a sample JF2 object and syndicate that JF2 instead (useful for testing/troubleshooting).',
      type: 'string',
      choices: available_jf2_samples,
      demandOption: false
    })
    .option('max-redirects', {
      describe:
        'Maximum number of redirects to follow when fetching the URL you are trying to syndicate.',
      type: 'number',
      default: 20
    })
    .option('target', {
      alias: 't',
      describe: 'Syndication target (repeat this option for multiple targets)',
      type: 'string',
      choices: available_syndication_targets,
      array: true
    })
    .option('url', {
      describe:
        'Canonical URL you want to syndicate to all of the syndication targets you specified.',
      type: 'string',
      demandOption: false
    })
    .option('verbose', {
      describe: 'Verbose output.',
      type: 'boolean',
      default: false
    })
    .example(
      `$0 --jf2 rsvp --target telegram-chat`,
      `syndicate a sample rsvp JF2 to Telegram chat`
    )
    .example(
      `$0 --html card --all`,
      `syndicate a sample microformats2 card (HTML) to all syndication targets`
    )
    .example(
      `$0 --url ${SAMPLE_URL.note} --target telegram-chat`,
      `syndicate ${SAMPLE_URL.note} to Telegram chat`
    )
    .example(
      `$0 --url note -t telegram-chat`,
      `syndicate a sample note to Telegram chat`
    )
    .example(
      `$0 --url ${SAMPLE_URL.redirect} -t telegram-chat -t telegram-chat-personal -t fail`,
      `syndicate ${SAMPLE_URL.redirect} (it's an article found after 1 redirect) to two Telegram chats, and a fake syndication target that always fails`
    )
    .example(
      `$0 --feed notes -t telegram-chat`,
      `syndicate a sample feed (it's my feed of notes) to Telegram chat`
    )
    .help('help')
    .wrap(120)
    .epilogue([`Bugs:\n  ${LINK_BUGS}`].join('\n\n')).argv

  const { maxRedirects, verbose } = argv

  // Step 1: establish WHAT to syndicate
  let n_choices = 0
  if (argv.feed) n_choices++
  if (argv.html) n_choices++
  if (argv.jf2) n_choices++
  if (argv.url) n_choices++
  if (n_choices !== 1) {
    throw new Error(`pick exactly one of: --feed, --html, --jf2, --url`)
  }

  let jf2: JF2 | undefined
  if (argv.jf2) {
    jf2 = SAMPLE_JF2[argv.jf2 as keyof typeof SAMPLE_JF2]
    if (!jf2) {
      throw new Error(
        `JF2 sample not found: ${argv.jf2}; JF2 samples available: ${available_jf2_samples.join(', ')}`
      )
    }
    if (verbose) {
      log.debug(jf2, `will syndicate this JF2 sample: ${argv.jf2}`)
    } else {
      log.debug(`will syndicate this JF2 sample: ${argv.jf2}`)
    }
  }

  let html: string | undefined
  if (argv.html) {
    html = SAMPLE_HTML[argv.html as keyof typeof SAMPLE_HTML]
    if (!html) {
      throw new Error(
        `HTML sample not found: ${argv.html}; HTML samples available: ${available_html_samples.join(', ')}`
      )
    }
    if (verbose) {
      log.debug(html, `will syndicate this HTML sample: ${argv.html}`)
    } else {
      log.debug(`will syndicate this HTML sample: ${argv.html}`)
    }
  }

  let url: URL | undefined
  if (argv.url) {
    let href: string | undefined
    if (SAMPLE_URL[argv.url as keyof typeof SAMPLE_URL]) {
      href = SAMPLE_URL[argv.url as keyof typeof SAMPLE_URL]
    } else {
      href = argv.url
    }
    try {
      url = new URL(href)
      log.debug(`will syndicate URL ${url}`)
    } catch (ex: any) {
      throw new Error(`Cannot create URL from ${href} (${ex.message})`)
    }
  }

  if (argv.feed) {
    let href: string | undefined
    if (SAMPLE_FEED_URL[argv.feed as keyof typeof SAMPLE_FEED_URL]) {
      href = SAMPLE_FEED_URL[argv.feed as keyof typeof SAMPLE_FEED_URL]
    } else {
      href = argv.feed
    }
    try {
      url = new URL(href)
      log.debug(`will syndicate Feed URL ${url}`)
    } catch (ex: any) {
      throw new Error(`Cannot create Feed URL from ${href} (${ex.message})`)
    }
  }

  // Step 2: establish WHERE TO syndicate it
  let syndication_targets: string[] = []
  if (argv.all) {
    syndication_targets = available_syndication_targets
  } else {
    if (argv.target) {
      argv.target.forEach((t) => syndication_targets.push(t))
    }
  }

  if (syndication_targets.length === 0) {
    const details = [
      `Use --all to syndicate to all available syndication targets (${available_syndication_targets.join(', ')}).`,
      `Use -t or --target to syndicate to individual targets (e.g. -t ${available_syndication_targets[0]} --target ${available_syndication_targets[1]}).`
    ]
    throw new Error(`No syndication target specified. ${details.join(' ')}`)
  }

  const targets: SyndicationTarget[] = syndication_targets
    .map((uid) => {
      const target = SYNDICATION_TARGET[uid as keyof typeof SYNDICATION_TARGET]

      if (target) {
        return target
      } else {
        log.warn(
          `ignore unavailable syndication target ${uid} (available targets: ${available_syndication_targets.join(', ')})`
        )
        return undefined
      }
    })
    .filter((target) => target !== undefined)

  // Step 3: syndicate (i.e. run side effects and actually publish to the
  // specified syndication targets)
  const syndication = await syndicate({
    jf2,
    html,
    log,
    maxRedirects,
    targets,
    // The syndication process ALWAYS require a canonical URL. But here we want
    // to quickly test syndication from JF2 and HTML and we might not have a
    // canonical URL associated to those.
    url: url || FAKE_CANONICAL_URL
  })

  // Step 4: recap of the syndication against all syndication targets
  // const { summary, update_patch } = syndication
  return syndication
}

run().then(exitZero).catch(exitOne)
