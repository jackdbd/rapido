import type { Profile } from '@jackdbd/indieauth'
import { errorResponseFromJSONResponse } from '@jackdbd/oauth2'
import { ServerError } from '@jackdbd/oauth2-error-responses'

export interface Config {
  access_token: string
  userinfo_endpoint: string
}

export const retrieveUserProfile = async (config: Config) => {
  const { access_token, userinfo_endpoint } = config

  let response: Response
  try {
    response = await fetch(userinfo_endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${access_token}`
      }
    })
  } catch (ex: any) {
    const error_description = `Failed to fetch ${userinfo_endpoint}: ${ex.message}`
    const error_uri = undefined
    return { error: new ServerError({ error_description, error_uri }) }
  }

  if (!response.ok) {
    const error = await errorResponseFromJSONResponse(response)
    return { error }
  }

  let profile: Profile
  try {
    profile = await response.json()
  } catch (ex: any) {
    const error_description = `Failed to parse JSON response received from ${userinfo_endpoint}: ${ex.message}`
    const error_uri = undefined
    return { error: new ServerError({ error_description, error_uri }) }
  }

  return { value: profile }
}
