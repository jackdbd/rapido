export interface CalloutConfig {
  // https://github.com/ikatyang/emoji-cheat-sheet
  emoji: string
  title: string
  message: string
}

export const calloutEmoji = (cfg: CalloutConfig) => {
  const paragraphs = cfg.message.split('\n\n')
  const body = paragraphs.map((p) => `> ${p}`).join('\n>\n')
  const lines = [`> ${cfg.emoji} **${cfg.title}**`, '\n', `>`, '\n', body]
  return lines.join('')
}

// https://github.com/orgs/community/discussions/16925
export const calloutCaution = (paragraphs: string[]) => {
  const body = paragraphs.map((p) => `> ${p}`).join('\n>\n')
  return `> [!CAUTION]\n${body}`
}

export const calloutImportant = (paragraphs: string[]) => {
  const body = paragraphs.map((p) => `> ${p}`).join('\n>\n')
  return `> [!IMPORTANT]\n${body}`
}

export const calloutNote = (paragraphs: string[]) => {
  const body = paragraphs.map((p) => `> ${p}`).join('\n>\n')
  return `> [!NOTE]\n${body}`
}

export const calloutTip = (paragraphs: string[]) => {
  const body = paragraphs.map((p) => `> ${p}`).join('\n>\n')
  return `> [!TIP]\n${body}`
}

export const calloutWarning = (paragraphs: string[]) => {
  const body = paragraphs.map((p) => `> ${p}`).join('\n>\n')
  return `> [!WARNING]\n${body}`
}
