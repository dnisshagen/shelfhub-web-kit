// Amazon Associates links (amazon.se), generalized from bar's
// src/lib/gear-links.js (the reference implementation, 2026-09-05).
//
// Legal reasoning, in two parts:
//
// 1. Ad labeling is mandatory. Marknadsforingslagen (2008:486) 9 par.
//    requires marketing to be identifiable as marketing, and the IAB
//    Sverige affiliate recommendation applies that to affiliate links
//    specifically. So every affiliate anchor renders a visible
//    'Annons' / 'Ad' label adjacent to the link text, the same rule
//    supply's app chips follow. The label is part of the component,
//    not something call sites may forget.
// 2. rel="sponsored" is search honesty. Google asks paid and affiliate
//    links to carry rel="sponsored"; nofollow rides along for older
//    crawlers that never learned the sponsored hint, and noopener
//    guards the opener window on target="_blank".
//
// The tag-gating contract: sites read the Associates tag from
// NEXT_PUBLIC_ASSOCIATES_TAG and pass it in. When the tag is falsy
// (the program not approved yet, or the var unset in an environment),
// AffiliateLink renders null and the URL builders are never reached.
// The whole link layer therefore deploys dark and lights up with one
// env var and a redeploy, with no code change.
//
// Division of labor: per-site data files (bar's src/lib/gear-links.js
// and its siblings) own WHICH products are worth linking, as curated
// {query, asin, label} entries. This module owns HOW links render:
// URL shape, rel attributes, ad label, tag gating. Neither reaches
// into the other's half.

import React from 'react';

/** Amazon.se search results for a query, carrying the Associates tag. */
export function amazonSearchUrl(query, tag) {
  return `https://www.amazon.se/s?${new URLSearchParams({ k: query, tag })}`;
}

/** Amazon.se product page for a curated ASIN, carrying the Associates tag. */
export function amazonProductUrl(asin, tag) {
  return `https://www.amazon.se/dp/${asin}?${new URLSearchParams({ tag })}`;
}

/**
 * Affiliate anchor with the mandatory ad label. Renders null when `tag`
 * is falsy, so call sites can wire links unconditionally and let the
 * env var decide whether commerce exists.
 *
 * React.createElement rather than JSX so the file stays .js beside
 * storeLinks.js and needs no JSX transform to consume.
 *
 * @param tag        the Associates tag; falsy means render nothing
 * @param href       prebuilt via amazonSearchUrl/amazonProductUrl
 * @param label      the ad marker text: 'Annons' on Swedish surfaces
 *                   (the legal default), 'Ad' on English ones
 * @param style      anchor style overrides
 * @param labelStyle ad-marker style overrides
 */
export function AffiliateLink({
  tag,
  href,
  label = 'Annons',
  style,
  labelStyle,
  children,
  ...rest
}) {
  if (!tag) return null;
  return React.createElement(
    'a',
    {
      href,
      target: '_blank',
      rel: 'sponsored nofollow noopener',
      style,
      ...rest,
    },
    children,
    React.createElement(
      'span',
      {
        style: {
          fontSize: '0.68em',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          opacity: 0.7,
          marginLeft: '0.6em',
          ...labelStyle,
        },
      },
      label,
    ),
  );
}
