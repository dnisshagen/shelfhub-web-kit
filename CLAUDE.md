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
  with the apps/sites that actually exist (known drift: `fragrance` missing).
