'use client';

import React from 'react';
import { useTokens } from './config.jsx';

/**
 * The kit does not define a palette. Each app passes its own tokens through
 * ShelfKitProvider and this exposes them under stable semantic names, so a
 * component can say `t.ink` without knowing whether it is rendering on bar's
 * near-black or coffee's cream.
 *
 * Required token keys: bg, surface, surfaceAlt, ink, body, muted, faint,
 * amber, amberDeep, amberLift, amberLine, line, lineSoft, onAmber.
 */
const REQUIRED = [
  'bg', 'surface', 'surfaceAlt', 'ink', 'body', 'muted', 'faint',
  'amber', 'amberDeep', 'amberLift', 'amberLine', 'line', 'lineSoft', 'onAmber',
];

export function useTheme() {
  const tokens = useTokens();
  if (process.env.NODE_ENV !== 'production') {
    const missing = REQUIRED.filter((k) => tokens?.[k] === undefined);
    if (missing.length) {
      // Loud in development, silent in production: a missing token renders as
      // `undefined` in a style object, which CSS ignores, so the failure is
      // otherwise invisible until someone notices the text is the wrong colour.
      console.warn(`[web-kit] tokens missing: ${missing.join(', ')}`);
    }
  }
  return tokens;
}
