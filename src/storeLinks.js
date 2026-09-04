// Store links + install attribution, generalized from bar's
// src/lib/store-links.js (the reference implementation, 2026-08-11).
//
// The question this answers: does anyone actually install the app from the
// site? Bare store anchors cannot say. Two independent signals, each covering
// the other's blind spot:
//
// 1. Play install referrer (durable, store-side). Google parses the
//    `referrer` param off the Play URL and surfaces the utm_* values in Play
//    Console's acquisition reports. It must be a single percent-encoded
//    string, not separate query params.
// 2. A `store_click` custom event in Vercel Analytics, fired by the site's
//    badge onClick, which catches the click even when the visitor never
//    completes the install. Sites wrap track() once (see bar's
//    lib/track-store-click.js) so the event name and property shape never
//    fork.
//
// Deliberately NO Apple campaign params. Apple's campaign links need the
// account's provider token (`pt`) alongside `ct`, and `ct` on its own is
// ignored: a made-up value would look like attribution while measuring
// nothing. iOS is covered instead by App Store Connect's automatic
// "Web Referrer" source plus the click event above. If per-placement iOS
// attribution is ever wanted, get `pt` from App Store Connect's App Analytics
// and thread it through appStoreUrl here.

export const STORE_CLICK_EVENT = 'store_click';

/** https://apps.apple.com/app/id{appleId} */
export function appStoreUrl(appleId) {
  return `https://apps.apple.com/app/id${appleId}`;
}

/**
 * Play listing URL with the install referrer attached.
 *
 * @param packageName e.g. 'com.mybarshelf.app'
 * @param source      utm_source, one per site, e.g. 'mybarshelf_web'
 * @param placement   WHERE on the site the click came from ('footer_badge',
 *                    'home_hero', 'get_app_redirect'), so surfaces stay
 *                    distinguishable in Play Console's acquisition reports.
 */
export function playStoreUrl(packageName, source, placement) {
  const referrer = new URLSearchParams({
    utm_source: source,
    utm_medium: 'website',
    utm_campaign: 'site_install',
    utm_content: placement,
  }).toString();
  // URLSearchParams would double-encode if `referrer` were appended through
  // it, so encode the payload once and concatenate.
  return (
    `https://play.google.com/store/apps/details?id=${packageName}` +
    `&referrer=${encodeURIComponent(referrer)}`
  );
}
