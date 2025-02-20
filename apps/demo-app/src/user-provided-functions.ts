import {
  defDefaultPublication,
  defJf2ToLocation,
  defRetrieveContent,
  defUpdate,
  defUrlToLocation
} from '@jackdbd/github-content-store'
import { unixTimestampInSeconds } from '@jackdbd/indieauth'
import type {
  IsAccessTokenRevoked,
  IsRefreshTokenRevoked,
  OnIssuedTokens,
  OnAuthorizationCodeVerified,
  OnUserApprovedRequest,
  RetrieveAccessToken,
  RetrieveAuthorizationCode,
  RetrieveRefreshToken,
  RetrieveUserProfile,
  RevokeAccessToken,
  RevokeRefreshToken
} from '@jackdbd/indieauth/schemas/index'
import type {
  CreatePost,
  DeletePost,
  JF2ToLocation,
  RetrievePost,
  UndeletePost,
  UpdatePost,
  UploadMedia,
  WebsiteUrlToStoreLocation
} from '@jackdbd/micropub/schemas/index'
import { codeChallenge } from '@jackdbd/pkce'
import { nanoid } from 'nanoid'
import {
  PROFILE_EMAIL,
  PROFILE_NAME,
  PROFILE_PHOTO,
  PROFILE_URL,
  SCOPE
} from '../../../packages/stdlib/lib/test-utils.js'
import { defConfig } from './config.js'
import { isMpUrlencodedRequestBody, MP_Post_Type } from '@jackdbd/micropub'

export const store_name = 'Fake GitHub repository'
const domain = 'giacomodebidda.com'
const subdomain = 'www'
export const publication = defDefaultPublication({ domain, subdomain })
const owner = 'jackdbd' // github username
const committer = {
  name: 'Giacomo Debidda',
  email: 'giacomo@giacomodebidda.com'
}
const repo = 'giacomodebidda-content' // github repository that I use as my content store
// const repo = 'nonexistent-repository'

const logPrefix = 'user-fx ' // user-provided side effect
const { client_id, me, issuer, redirect_uri } = defConfig(3001)

export const jf2ToLocation = defJf2ToLocation({
  log: console,
  name: store_name,
  publication
})

export const retrievePost = defRetrieveContent({
  log: console,
  name: store_name,
  owner,
  repo,
  // token: 'wrong-token'
  token: process.env.CONTENTS_API_GITHUB_TOKEN
})

export const urlToLocation = defUrlToLocation({
  log: console,
  name: store_name,
  publication
})

export const updatePost = defUpdate({
  committer,
  log: console,
  owner,
  repo,
  // token: 'wrong-token',
  token: process.env.CONTENTS_API_GITHUB_TOKEN,
  urlToLocation
})

export const createPost: CreatePost = async (input) => {
  console.log(`[${logPrefix}create] input`)
  console.log(JSON.stringify(input, null, 2))

  let post_type: MP_Post_Type
  if (isMpUrlencodedRequestBody(input)) {
    post_type = input.h || 'entry'
  } else {
    post_type = input.type || 'entry'
  }

  // throw new Error(`Simulate runtime exception in createPost.`)
  return { summary: `Fake created post of type ${post_type}` }
}

export const deletePost: DeletePost = async (url) => {
  console.log(`[${logPrefix}deletePost] ${url} => location`)
  const loc = urlToLocation(url)
  console.log(JSON.stringify(loc, null, 2))
  // throw new Error(`Simulate runtime exception in deletePost.`)
  return { summary: `Deleted ${url}` }
}

export const deleteMedia: DeletePost = async (url) => {
  console.log(`[${logPrefix}deleteMedia] ${url} => location`)
  const loc = urlToLocation(url)
  console.log(JSON.stringify(loc, null, 2))
  // throw new Error(`Simulate runtime exception in deleteMedia.`)
  return { summary: `Deleted ${url}` }
}

export const isAccessTokenRevoked: IsAccessTokenRevoked = async (jti) => {
  console.log(
    `[${logPrefix}isAccessTokenRevoked] checking whether access token jti=${jti} is revoked`
  )
  // throw new Error(`Simulate runtime exception in isAccessTokenRevoked.`);
  return false
  // return true;
}

export const isRefreshTokenRevoked: IsRefreshTokenRevoked = async (
  refresh_token
) => {
  console.log(
    `[${logPrefix}isRefreshTokenRevoked] checking whether refresh token ${refresh_token} is revoked`
  )
  // throw new Error(`Simulate runtime exception in isRefreshTokenRevoked.`);
  return false
  // return true;
}

export const onAuthorizationCodeVerified: OnAuthorizationCodeVerified = async (
  code
) => {
  console.log(`[${logPrefix}onAuthorizationCodeVerified] code: ${code}`)
  // throw new Error(`Simulate runtime exception in onAuthorizationCodeVerified.`)
}

export const onIssuedTokens: OnIssuedTokens = async (info) => {
  console.log(`[${logPrefix}onIssuedTokens] info`, info)
}

export const onUserApprovedRequest: OnUserApprovedRequest = async (props) => {
  console.log(`[${logPrefix}OnUserApprovedRequest] props`, props)
  throw new Error(`Simulate runtime exception in onUserApprovedRequest.`)
}

export const retrieveAccessToken: RetrieveAccessToken = async (jti) => {
  console.log(
    `[${logPrefix}retrieveAccessToken] retrieving access token jti=${jti}`
  )
  return { client_id, created_at: 456, id: nanoid(), jti, redirect_uri }
}

export const retrieveAuthorizationCode: RetrieveAuthorizationCode = async (
  authorization_code: string
) => {
  console.log(
    `[${logPrefix}retrieveAuthorizationCode] retrieving authorization code: ${authorization_code}`
  )

  // throw new Error(`Simulate runtime exception in retrieveAuthorizationCode.`)

  const code_verifier = process.env.CODE_VERIFIER!
  if (!code_verifier) {
    throw new Error(
      'environment variable CODE_VERIFIER not set. Use the same value used in Bruno.'
    )
  }

  const code_challenge_method = 'S256'

  const code_challenge = codeChallenge({
    code_verifier,
    method: code_challenge_method
  })

  const code_no_media_scope = process.env.CODE_NO_MEDIA_SCOPE!
  if (!code_no_media_scope) {
    throw new Error(
      'environment variable CODE_NO_MEDIA_SCOPE not set. Use the same value used in Bruno.'
    )
  }

  const code_no_profile_scope = process.env.CODE_NO_PROFILE_SCOPE!
  if (!code_no_profile_scope) {
    throw new Error(
      'environment variable CODE_NO_PROFILE_SCOPE not set. Use the same value used in Bruno.'
    )
  }

  let code
  let scope
  switch (authorization_code) {
    case code_no_media_scope: {
      code = code_no_media_scope
      scope = 'create update profile email delete undelete'
      break
    }
    case code_no_profile_scope: {
      code = code_no_profile_scope
      scope = 'create update delete undelete media'
      break
    }
    default: {
      code = authorization_code
      scope = 'create update profile email delete undelete media'
    }
  }

  return {
    client_id,
    code,
    code_challenge,
    code_challenge_method,
    created_at: unixTimestampInSeconds(),
    exp: unixTimestampInSeconds() + 300,
    id: nanoid(),
    iss: issuer,
    me,
    redirect_uri,
    scope
  }
}

export const retrievePostAlternative: RetrievePost = async (loc) => {
  console.log(`[${logPrefix}retrievePost] location`, loc)
  throw new Error(`Simulate runtime exception in retrievePost.`)
  return {
    summary: `Fake retrieved post done.`,
    jf2: { type: 'entry', content: 'Hello world' },
    metadata: {
      sha: '123abc'
    }
  }
}

export const retrieveRefreshToken: RetrieveRefreshToken = async (
  refresh_token
) => {
  console.log(
    `[${logPrefix}retrieveRefreshToken] retrieving refresh token ${refresh_token}`
  )
  return {
    client_id,
    code: '',
    code_challenge: '',
    code_challenge_method: '',
    created_at: 456,
    // exp: 1, // i.e., expired
    exp: unixTimestampInSeconds() + 100, // i.e., not expired
    id: nanoid(),
    iss: issuer,
    jti: 'some-jwt-id',
    me,
    redirect_uri,
    refresh_token,
    scope: SCOPE
  }
}

export const retrieveUserProfile: RetrieveUserProfile = async (me) => {
  console.log(`[${logPrefix}retrieveUserProfile] retrieving user profile ${me}`)
  return {
    created_at: 456,
    email: PROFILE_EMAIL,
    id: nanoid(),
    name: PROFILE_NAME,
    photo: PROFILE_PHOTO,
    url: PROFILE_URL
  }
}

export const revokeAccessToken: RevokeAccessToken = async (props) => {
  console.log(`[${logPrefix}revokeAccessToken] props`)
  console.log(JSON.stringify(props, null, 2))
  throw new Error(`Simulate runtime exception in revokeAccessToken.`)
}

export const revokeRefreshToken: RevokeRefreshToken = async (props) => {
  console.log(`[${logPrefix}revokeRefreshToken] props`)
  console.log(JSON.stringify(props, null, 2))
  // throw new Error(`Simulate runtime exception in revokeRefreshToken.`)
}

export const websiteUrlToStoreLocationAlternative: WebsiteUrlToStoreLocation = (
  url
) => {
  console.log(`[${logPrefix}websiteUrlToStoreLocationAlternative] url: ${url}`)
  // throw new Error(`Simulate runtime exception in websiteUrlToStoreLocation.`)

  const str = 'default'
  const slug = nanoid().toLocaleLowerCase().replaceAll('-', '')

  return {
    store: `${str}/${slug}.md`,
    store_deleted: `deleted/${str}/${slug}.md`,
    website: `https://${subdomain}.${domain}/${str}/${slug}/`
  }
}

export const jf2ToLocationAlternative: JF2ToLocation = (input) => {
  console.log(`[${logPrefix}jf2ToLocation] input`, input)
  // throw new Error(`Simulate runtime exception in jf2ToWebsiteUrl2.`)

  let post_type: MP_Post_Type
  if (isMpUrlencodedRequestBody(input)) {
    post_type = input.h || 'entry'
  } else {
    post_type = input.type || 'entry'
  }

  let str = ''
  switch (post_type) {
    case 'card': {
      str = 'cards'
      break
    }
    case 'cite': {
      str = 'cites'
      break
    }
    case 'entry': {
      str = 'entries'
      break
    }
    case 'event': {
      str = 'events'
      break
    }
    default: {
      throw new Error(`Unsupported type: ${post_type}`)
    }
  }

  const slug = nanoid().toLocaleLowerCase().replaceAll('-', '')

  return {
    store: `${str}/${slug}.md`,
    store_deleted: `deleted/${str}/${slug}.md`,
    website: `https://${subdomain}.${domain}/${str}/${slug}/`
  }
}

export const undeletePost: UndeletePost = async (url) => {
  console.log(`[${logPrefix}undeletePost] ${url} => location`)
  const loc = urlToLocation(url)
  console.log(JSON.stringify(loc, null, 2))
  // throw new Error(`Simulate runtime exception in undeletePost.`)
  return { summary: `Undeleted ${url}` }
}

export const updatePostAlternative: UpdatePost = async (url, patch) => {
  console.log(`[${logPrefix}updatePost] apply this update patch to ${url}`)
  console.log(JSON.stringify(patch, null, 2))
  // throw new Error(`Simulate runtime exception in updatePost.`)
  return { summary: `Fake update post done.` }
}

export const uploadMedia: UploadMedia = async (props) => {
  const { contentType, filename } = props
  const url = `https://${subdomain}.${domain}/media/${nanoid()}/`
  console.log(
    `[${logPrefix}uploadMedia] uploading ${filename} (content-type: ${contentType}) to ${url}`
  )
  // const loc = websiteUrlToStoreLocation(url)
  // throw new Error(`Simulate runtime exception in uploadMedia.`)
  return { summary: `File ${filename} is now hosted at ${url}`, url }
}
