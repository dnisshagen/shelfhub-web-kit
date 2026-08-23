# CLAUDE.md — @shelfhub/web-kit

The canonical web behaviour layer for every "My X Shelf" site. Consumers pin a git tag
(`github:dnisshagen/shelfhub-web-kit#vX.Y.Z`) — never `#main`.

## Portfolio conventions — mandatory

Read `~/Projects/shelfhub` (start with `CONVENTIONS.md`, then `WEB.md`) before changing
anything here. Cloud sandbox: `gh repo clone dnisshagen/shelfhub /tmp/shelfhub`.

Rules that bind this repo:

- **The kit owns behaviour; each app owns identity.** No behaviour flags in config — if
  behaviour should vary per site, it should actually be uniform and live in the component.
- Every change ships as a new git tag; consumers bump deliberately, one PR per site.
- `src/family.js` `SHELF_FAMILY` is the portfolio roster for cross-links — keep it in sync
  with the apps/sites that actually exist (fragrance drift closed 2026-08-23, MYBAR-298).

## Tagging

**Bump `version` in `package.json` in the SAME commit as the tag.** It was missed
through v0.1.3: at tag `v0.1.3` the manifest still read `0.1.2`, so
`require('@shelfhub/web-kit/package.json').version` reported the wrong number on a
correct install. That is worse than having no version field, because it is the
check someone reaches for first and it answers confidently.

Until a consumer is on v0.1.4 or later, verify a bump by the **resolved commit in
`package-lock.json`**, or by grepping `node_modules` for the feature. Not by the
version field.

Also: editing the ref in a consumer's `package.json` and running `npm install` does
NOT move a git dependency. The lockfile pins the resolved commit and npm treats the
tree as satisfied: the build compiles, the diff looks right, and the new code is
simply absent. Install the ref explicitly:

    npm install "github:dnisshagen/shelfhub-web-kit#v0.1.4"

Then confirm the lockfile's `resolved` hash actually changed. Both coffee and
whiskey hit this on the v0.1.3 bump.
