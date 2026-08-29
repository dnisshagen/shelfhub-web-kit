'use client';

import React from 'react';

const ShelfKitContext = React.createContext(null);

/**
 * Everything the kit needs to know about the app consuming it.
 *
 * The split is deliberate: this object is entirely identity and content, and
 * the kit's components are entirely behaviour and structure. If you find
 * yourself wanting to add a behaviour flag here, that behaviour probably wants
 * to be the same across the family and belongs in the component instead.
 *
 * {
 *   appName:   'My Coffee Shelf',
 *   siteUrl:   'https://mycoffeeshelf.com',
 *   tokens:    { bg, surface, ink, body, muted, faint, amber, ... },
 *   fonts:     { display, body, mono },
 *   appId:     'coffee_shelf' | 'bar_shelf' | 'whiskey_shelf' | 'cigar_shelf' |
 *              'wine_shelf' | 'beer_shelf' | 'supply_shelf'
 *              REQUIRED for account deletion. Without it the delete button
 *              fails closed rather than deleting another app's data — see the
 *              comment on deleteAccount in Account.jsx.
 *   nav:       [{ href, label }],
 *   footer:    [{ title, items: [{ label, href }] }],
 *   family:    [{ name, url, tagline, live }],
 *   org:       { name, orgNr, city, email },
 *   auth:      { redirectPath: '/shelf' },
 * }
 */
export function ShelfKitProvider({ config, children }) {
  // Frozen so a component cannot quietly mutate another component's config;
  // this object is read from a dozen places and a stray assignment would be
  // miserable to find.
  const value = React.useMemo(() => Object.freeze({ ...config }), [config]);
  return <ShelfKitContext.Provider value={value}>{children}</ShelfKitContext.Provider>;
}

export function useShelfKit() {
  const ctx = React.useContext(ShelfKitContext);
  if (!ctx) {
    throw new Error(
      'useShelfKit called outside ShelfKitProvider. Wrap the app in ' +
      '<ShelfKitProvider config={...}> — usually in components/Providers.jsx.'
    );
  }
  return ctx;
}

// Convenience readers, so call sites do not repeat the optional chaining.
export const useTokens = () => useShelfKit().tokens;
export const useFonts = () => useShelfKit().fonts;
