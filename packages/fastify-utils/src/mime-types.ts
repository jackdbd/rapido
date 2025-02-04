export const AUDIO = [
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/flac',
  'audio/aac',
  'audio/webm',
  'audio/mp4',
  'audio/x-wav',
  'audio/3gpp',
  'audio/3gpp2',
  'audio/x-matroska',
  'audio/x-aiff',
  'audio/midi',
  'audio/x-midi',
  'audio/amr',
  'audio/basic'
]

export const VIDEO = [
  'video/mp4', // MP4 video
  'video/webm', // WebM video
  'video/ogg', // Ogg video
  'video/mpeg', // MPEG video
  'video/3gpp', // 3GPP video
  'video/3gpp2', // 3GPP2 video
  'video/x-msvideo', // AVI video
  'video/x-matroska', // Matroska video (MKV)
  'video/x-flv', // Flash Video (FLV)
  'video/quicktime', // QuickTime video
  'video/x-ms-wmv', // Windows Media Video (WMV)
  'video/avi', // AVI (alternative older type)
  'video/x-f4v', // Flash Video (F4V)
  'video/x-ms-asf', // Advanced Systems Format (ASF)
  'video/x-ogm', // OGM video
  'application/vnd.rn-realmedia' // RealMedia
]

export const AUDIO_SET = new Set(AUDIO)
export const isAudio = (str: string) => AUDIO_SET.has(str)

export const VIDEO_SET = new Set(VIDEO)
export const isVideo = (str: string) => VIDEO_SET.has(str)
