import { unixTimestampInSeconds } from '@jackdbd/oauth2-tokens'

export const isExpired = (
  exp: number,
  now: number = unixTimestampInSeconds()
) => {
  return now > exp
}
