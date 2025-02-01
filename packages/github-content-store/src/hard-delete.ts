import type {
  AuthorOrCommitter,
  //   GetResponseBody,
} from "@jackdbd/github-contents-api";
import {
  hardDelete,
  BASE_URL,
  GITHUB_TOKEN,
  REF,
} from "@jackdbd/github-contents-api";
import type { DeleteContentOrMedia } from "@jackdbd/fastify-micropub-endpoint";
import type { Publication } from "@jackdbd/micropub";
import type { Log } from "./log.js";
import { defRetrieveContent } from "./retrieve-content.js";
import { defWebsiteUrlToStoreLocation } from "./website-url-to-store-location.js";

export interface Options {
  base_url?: string;
  branch?: string;
  committer: AuthorOrCommitter;
  log?: Log;
  owner?: string;
  publication: Publication;
  repo?: string;
  token?: string;
}

const defaults: Partial<Options> = {
  base_url: BASE_URL,
  branch: REF,
  token: GITHUB_TOKEN,
};

export const defHardDelete = (options?: Options) => {
  const config = Object.assign({}, defaults, options) as Required<Options>;

  const { base_url, branch, committer, log, owner, publication, repo, token } =
    config;

  const websiteUrlToStoreLocation = defWebsiteUrlToStoreLocation({
    log,
    publication,
  });

  const retrieveContent = defRetrieveContent({
    base_url,
    owner,
    ref: branch,
    repo,
    token,
  });

  const hardDeleteContent: DeleteContentOrMedia = async (url) => {
    const loc = websiteUrlToStoreLocation(url);

    let sha: string | undefined;
    try {
      const value = await retrieveContent(loc); // as GetResponseBody
      sha = value.sha;
    } catch (ex: any) {
      // In this case the original error message from the GitHub Contents API is
      // not that useful.
      // const { error_description: original } = result_get.error
      const tip = `Please make sure the post exists in the repository.`;
      const error_description = `Cannot delete post published at ${loc.website} because it could not be retrieved from location ${loc.store} in repository ${owner}/${repo} (branch ${branch}). ${tip}`;
      throw new Error(error_description);
    }

    if (!sha) {
      throw new Error(
        `Content retrieved from ${loc.store} in repository ${owner}/${repo} (branch ${branch}) does not have a sha.`
      );
    }

    const result = await hardDelete({
      base_url,
      committer,
      owner,
      path: loc.store,
      repo,
      sha,
      token,
    });

    if (result.error) {
      // The original error message from the GitHub Contents API is not that useful.
      const summary = `Cannot delete post published at ${loc.website} because it could not be deleted from location ${loc.store} in repository ${owner}/${repo} (branch ${branch}).`;
      const suggestions = [
        `Make sure you have the permissions to delete files from the respository.`,
      ];
      log.error(`${summary}. ${suggestions.join(" ")}`);
      throw new Error(`${summary}. ${suggestions.join(" ")}`);
    } else {
      const summary = `Deleted ${loc.store} in repository ${owner}/${repo} (branch ${branch}). That post was published at ${loc.website}.`;
      log.debug(summary);
      return loc;
    }
  };

  return hardDeleteContent;
};
