---
"@jackdbd/fastify-token-endpoint": minor
---

Require `client_id` to be present in the request body of refresh requests (requests to refresh an access token). [OAuth 2.0 does not mention it](https://datatracker.ietf.org/doc/html/rfc6749#section-6), but [IndieAuth does require it](https://indieauth.spec.indieweb.org/#refreshing-an-access-token).
