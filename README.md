# @shelfhub/web-kit

Shared web layer for the My Shelf family: My Bar Shelf, My Coffee Shelf, and the
whiskey, cigar, wine and beer sites that follow.

**The kit owns behaviour. Each app owns its identity.**

Auth, session handling, nav and footer structure, and the Supabase client live
here, so a fix lands once and every site inherits it. Palette, typography, nav
items and content stay in the app, so bar can be dark and evening while coffee
is cream and daylight without either knowing about the other.

This exists because the same bug got fixed in one site and not the other:
Google's OAuth silently reused whichever account the browser was signed into,
with no chooser. `prompt=select_account` fixed it in coffee on 2026-08-02 and
bar still had it an hour later. That is the drift this package is for.

## Consuming it

Not published to a registry. Installed straight from git, per the 2026-04-17
decision to use separate repos with shared npm packages rather than a monorepo.

```json
"dependencies": {
  "@shelfhub/web-kit": "github:dnisshagen/shelfhub-web-kit#v0.1.0"
}
```

The package ships untranspiled JSX, so the consuming Next app needs:

```js
// next.config.mjs
const nextConfig = { transpilePackages: ['@shelfhub/web-kit'] };
```

Pin the tag. An unpinned `#main` means a change to the kit silently redeploys
five sites the next time any one of them builds.
