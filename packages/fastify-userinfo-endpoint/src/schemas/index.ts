export { options, type Options } from "./plugin-options.js";

export { userinfo_get_config } from "./route-userinfo-get.js";
export type { UserinfoGetConfig } from "./route-userinfo-get.js";

export {
  user_profile_immutable_record,
  user_profile_mutable_record,
  user_profile_props,
} from "./user-profile.js";
export type {
  UserProfileImmutableRecord,
  UserProfileMutableRecord,
  UserProfileProps,
} from "./user-profile.js";

export {
  isAccessTokenRevoked,
  retrieveUserProfile,
} from "./user-provided-functions.js";
export type {
  IsAccessTokenRevoked,
  RetrieveUserProfile,
} from "./user-provided-functions.js";
