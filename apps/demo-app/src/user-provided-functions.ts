import { unixTimestampInSeconds } from '@jackdbd/indieauth'
import type {
  IsAccessTokenRevoked,
  OnIssuedTokens,
  OnAuthorizationCodeVerified,
  OnUserApprovedRequest,
  RetrieveAccessToken,
  RetrieveAuthorizationCode,
  RetrieveRefreshToken,
  RetrieveUserProfile,
  RevokeAccessToken,
  RevokeRefreshToken
} from '@jackdbd/indieauth/schemas/user-provided-functions'
import type {
  CreatePost,
  DeletePost,
  UndeletePost,
  UpdatePost
} from '@jackdbd/micropub/schemas/user-provided-functions'
import { nanoid } from 'nanoid'
import {
  PROFILE_EMAIL,
  PROFILE_NAME,
  PROFILE_PHOTO,
  PROFILE_URL,
  SCOPE
} from '../../../packages/stdlib/lib/test-utils.js'
import { defConfig } from './config.js'

const logPrefix = 'user-fx ' // user-provided side effect
const { client_id, me, issuer, redirect_uri } = defConfig(3001)

export const create: CreatePost = async (jf2) => {
  console.log(`[${logPrefix}create] jf2`, jf2)
  // throw new Error(`simulate runtime exception in create`);
  return { message: 'post created' }
}

export const deleteContentOrMedia: DeletePost = async (url) => {
  console.log(`[${logPrefix}deleteContentOrMedia] url: ${url}`)
  // return { error: new Error("Not implemented") };
  // throw new Error(`simulate runtime exception in deleteContentOrMedia`);
  return { message: `deleted post at url ${url} ` }
}

export const isAccessTokenRevoked: IsAccessTokenRevoked = async (jti) => {
  console.log(
    `[${logPrefix}isAccessTokenRevoked] checking whether access token jti=${jti} is revoked`
  )
  // throw new Error(`simulate runtime exception in isAccessTokenRevoked`);
  return false
  // return true;
}

export const onAuthorizationCodeVerified: OnAuthorizationCodeVerified = async (
  code
) => {
  console.log(`[${logPrefix}onAuthorizationCodeVerified] code: ${code}`)
  throw new Error(`simulate runtime exception in onAuthorizationCodeVerified`)
}

export const onIssuedTokens: OnIssuedTokens = async (info) => {
  console.log(`[${logPrefix}onIssuedTokens] info`, info)
}

export const onUserApprovedRequest: OnUserApprovedRequest = async (props) => {
  console.log(`[${logPrefix}OnUserApprovedRequest] props`, props)
  throw new Error(`simulate runtime exception in onUserApprovedRequest`)
}

export const retrieveAccessToken: RetrieveAccessToken = async (jti) => {
  console.log(
    `[${logPrefix}retrieveAccessToken] retrieving access token jti=${jti}`
  )
  return { client_id, created_at: 456, id: nanoid(), jti, redirect_uri }
}

export const retrieveAuthorizationCode: RetrieveAuthorizationCode = async (
  code: string
) => {
  console.log(
    `[${logPrefix}retrieveAuthorizationCode] retrieving authorization code: ${code}`
  )
  throw new Error(`simulate runtime exception in retrieveAuthorizationCode`)
  // client_id: https://micropub.fly.dev/id
  return {
    client_id,
    code,
    code_challenge: '',
    code_challenge_method: '',
    created_at: 456,
    exp: 123,
    id: nanoid(),
    iss: issuer,
    me,
    redirect_uri,
    scope: SCOPE
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
  console.log('=== revokeAccessToken props ===', props)
}

export const revokeRefreshToken: RevokeRefreshToken = async (props) => {
  console.log('=== revokeRefreshToken props ===', props)
}

export const undelete: UndeletePost = async (url) => {
  console.log(`[${logPrefix}undelete] url: ${url}`)
  // return { error: new Error("Not implemented") };
  // throw new Error(`simulate runtime exception in undelete`);
  return { message: `undeleted post at url ${url} ` }
}

export const update: UpdatePost = async (url, patch) => {
  console.log(`[${logPrefix}update] url: ${url}`, patch)
  // throw new Error(`simulate runtime exception in update`);
  return { message: `updated post at url ${url} ` }
}
