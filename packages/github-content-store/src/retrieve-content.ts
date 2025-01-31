import type { RetrieveContent } from "@jackdbd/fastify-micropub-endpoint";
import { get, BASE_URL, GITHUB_TOKEN, REF } from "@jackdbd/github-contents-api";
import { base64ToUtf8 } from "./encoding.js";
import { markdownToJf2 } from "./markdown-to-jf2.js";

export interface Options {
  base_url?: string;
  owner?: string;
  ref?: string;
  repo?: string;
  token?: string;
}

const defaults: Partial<Options> = {
  base_url: BASE_URL,
  ref: REF,
  token: GITHUB_TOKEN,
};

export const defRetrieveContent = (options?: Options) => {
  const config = Object.assign(defaults, options) as Required<Options>;

  const { base_url, owner, ref, repo, token } = config;

  const retrieveContent: RetrieveContent = async (loc) => {
    const result = await get({
      base_url,
      owner,
      path: loc.store,
      ref,
      repo,
      token,
    });

    if (result.error) {
      throw new Error(result.error.error_description);
    } else {
      const { content: base64, sha } = result.value.body;
      const jf2 = markdownToJf2(base64ToUtf8(base64));
      return { jf2, sha };
    }
  };

  return retrieveContent;
};
