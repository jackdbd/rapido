---
"@jackdbd/micropub": minor
---

Several important changes:

- Add schema and type for function `jf2ToWebsiteUrl`.
- Give precedence to `content.text` over `content.html` when creating a slug with `jf2ToSlug`.
- Add type guards to distinguish between MF2, MF2 JSON, JF2, urlencoded requests.
- Define return types for functions: `deletePost`, `undeletePost`, `deleteMedia`, `uploadMedia`.
- Add several tests.
