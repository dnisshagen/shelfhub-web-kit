'use client';
import React from 'react';
import { useTheme } from './theme.jsx';
import { Eyebrow } from './SiteShell.jsx';

// THE APP SECTION: a phone showing the app, beside the reason to install it.
//
// David, 2026-09-01, pointing at My Bar Shelf's version: "I want one of these on
// every website. I like this a lot."
//
// Bar built it first, in page-home-below.jsx as AppCta, and this is that layout
// generalised. It lives in the kit rather than being copied six times because
// the STRUCTURE is the thing David liked and the structure is identical
// everywhere. What differs per site is identity: the palette, the fonts, the
// headline, and which screenshot goes in the frame. That split is the kit's
// standing contract, so nothing here reads a site's name or hardcodes a colour.
//
// THE FRAME IS 280 x 560, WHICH IS NOT A PHONE'S ASPECT RATIO, and bar chose it
// deliberately. 280/560 is exactly 1:2. A modern iPhone screenshot is about
// 1:2.17, so `cover` trims a little from the top and bottom rather than letter
// boxing the sides. Trimming the status bar and the home indicator is the right
// crop: those are the two bands of a screenshot that carry no product.
const FRAME_W = 280;
const FRAME_H = 560;

/**
 * @param eyebrow    Short label above the headline. Optional.
 * @param title      The headline. Pass a string, or {prefix, em, suffix} to get
 *                   bar's treatment where one word is set in the accent colour.
 * @param body       One paragraph. Say what the app does, not what it is.
 * @param footnote   Small italic line under the CTA. Optional.
 * @param cta        { label, href } The primary button. Optional.
 * @param stores     { appStore, googlePlay } Store URLs. Badges render only for
 *                   the ones passed, so a pre-release app can show one or none.
 * @param screenshot { src, alt } REQUIRED. `alt` is not decorative here: the
 *                   picture carries the whole argument for installing, so a
 *                   screen reader needs to be told what the app is showing.
 * @param reverse    Put the phone on the left. For a site whose page rhythm
 *                   wants the alternation.
 */
export function AppSection({
  eyebrow,
  title,
  body,
  footnote,
  cta,
  stores = {},
  screenshot,
  reverse = false,
  style,
}) {
  const t = useTheme();

  // No screenshot means no section. An empty phone frame is worse than nothing:
  // it reads as a broken image on the one surface whose job is to look finished.
  // This is why a site can adopt the component before its screenshot exists.
  if (!screenshot?.src) return null;

  const heading =
    typeof title === 'string' ? (
      title
    ) : (
      <>
        {title?.prefix}
        <em style={{ color: t.amber, fontStyle: 'italic', fontWeight: 400 }}>{title?.em}</em>
        {title?.suffix}
      </>
    );

  const phone = (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          width: FRAME_W,
          maxWidth: '100%',
          height: FRAME_H,
          background: '#000',
          borderRadius: 36,
          border: '8px solid #1a1a1a',
          // Two shadows doing different jobs: a soft drop to lift the phone off
          // the panel, and a hairline in the accent so the frame still reads as
          // an edge on a very dark ground where the drop shadow disappears.
          boxShadow: `0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px ${t.lineSoft || t.amber}`,
          padding: 8,
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* Plain img, not next/image. The kit is framework-agnostic source
            consumed by each site, so it cannot depend on next/image being
            present. These are one small asset per site, served from the site's
            own public directory, already at publication size. */}
        <img
          src={screenshot.src}
          alt={screenshot.alt || ''}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 28,
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>
    </div>
  );

  const words = (
    <div>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2
        style={{
          color: t.ink,
          fontFamily: t.fontDisplay,
          fontSize: 'clamp(30px, 5vw, 56px)',
          lineHeight: 1.02,
          letterSpacing: '-0.01em',
          margin: eyebrow ? '16px 0 0' : 0,
          textWrap: 'balance',
        }}
      >
        {heading}
      </h2>
      {body ? (
        <p style={{ color: t.body, fontSize: 17, lineHeight: 1.6, margin: '20px 0 0', maxWidth: '54ch' }}>
          {body}
        </p>
      ) : null}

      {cta?.href ? (
        <p style={{ margin: '30px 0 0' }}>
          <a
            href={cta.href}
            style={{
              display: 'inline-block',
              background: t.amber,
              color: t.onAmber || '#111',
              textDecoration: 'none',
              padding: '13px 26px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '.12em',
              textTransform: 'uppercase',
            }}
          >
            {cta.label}
          </a>
        </p>
      ) : null}

      {footnote ? (
        <div style={{ color: t.muted, fontSize: 13, fontStyle: 'italic', marginTop: 14 }}>{footnote}</div>
      ) : null}

      {(stores.appStore || stores.googlePlay) ? (
        <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          {stores.appStore ? <StoreBadge href={stores.appStore} kind="apple" t={t} /> : null}
          {stores.googlePlay ? <StoreBadge href={stores.googlePlay} kind="google" t={t} /> : null}
        </div>
      ) : null}
    </div>
  );

  return (
    <section style={{ padding: 'clamp(56px, 8vw, 110px) 0 0', ...style }}>
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: t.surfaceAlt || t.surface,
          border: `1px solid ${t.lineSoft}`,
          borderRadius: 14,
          padding: 'clamp(32px, 5vw, 88px) clamp(24px, 4vw, 56px)',
          display: 'grid',
          // INTRINSIC, NOT A MEDIA QUERY. These sites carry no breakpoints by
          // convention: auto-fit with a min() track collapses to one column on a
          // phone by itself. The phone frame is 280 wide, so the minimum has to
          // clear it or the frame overflows its own column.
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
          gap: 'clamp(32px, 5vw, 56px)',
          alignItems: 'center',
        }}
      >
        {reverse ? phone : words}
        {reverse ? words : phone}
      </div>
    </section>
  );
}

// The store badges, drawn rather than shipped as images.
//
// Apple and Google both publish badge artwork under marketing guidelines that
// govern size, clear space and wording. Drawing a plain wordmark button in the
// site's own palette sidesteps the guideline question entirely and, on these
// very dark grounds, reads better than a white PNG box.
function StoreBadge({ href, kind, t }) {
  const label = kind === 'apple' ? 'App Store' : 'Google Play';
  const lead = kind === 'apple' ? 'Download on the' : 'Get it on';
  return (
    <a
      href={href}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        textDecoration: 'none',
        border: `1px solid ${t.lineSoft}`,
        borderRadius: 8,
        padding: '8px 16px',
        color: t.ink,
        background: t.surface,
      }}
    >
      <span style={{ fontSize: 9.5, letterSpacing: '.08em', textTransform: 'uppercase', color: t.muted }}>
        {lead}
      </span>
      <span style={{ fontSize: 15, fontWeight: 600 }}>{label}</span>
    </a>
  );
}

export default AppSection;
