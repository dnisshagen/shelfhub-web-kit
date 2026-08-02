'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useShelfKit } from './config.jsx';
import { useTheme } from './theme.jsx';
import { useAccount } from './Account.jsx';

export function Eyebrow({ children, style }) {
  const t = useTheme();
  return (
    <div style={{
      fontSize: 11.5, fontWeight: 600, letterSpacing: '.19em',
      textTransform: 'uppercase', color: t.amber, ...style,
    }}>{children}</div>
  );
}

export function Rule({ width = 76, style }) {
  const t = useTheme();
  return <div style={{ width, height: 2, background: t.amber, ...style }} />;
}

/** One place to change the measure, rather than a maxWidth literal per route. */
export function Page({ children, wide = false, style }) {
  return (
    <main style={{
      maxWidth: wide ? 1120 : 820, margin: '0 auto',
      padding: 'clamp(36px, 6vw, 76px) 24px 64px', ...style,
    }}>{children}</main>
  );
}

export function SiteNav() {
  const t = useTheme();
  const { appName, nav = [], fonts } = useShelfKit();
  const acc = useAccount();
  const pathname = usePathname() || '/';

  return (
    <nav style={{
      position: 'relative', zIndex: 10, maxWidth: 1120, margin: '0 auto',
      padding: '24px 24px 0', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
    }}>
      <Link href="/" style={{
        fontFamily: fonts?.display || 'Georgia, serif', fontSize: 18, fontWeight: 500,
        color: t.amber, textDecoration: 'none',
      }}>{appName}</Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        {nav.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href} style={{
              fontSize: 11.5, fontWeight: 600, letterSpacing: '.19em', textTransform: 'uppercase',
              color: active ? t.ink : t.muted, textDecoration: 'none',
              borderBottom: `1px solid ${active ? t.amber : 'transparent'}`, paddingBottom: 3,
            }}>{label}</Link>
          );
        })}
        <button
          onClick={() => acc?.openModal(acc?.user ? 'account' : 'signin')}
          style={{
            fontSize: 12.5, fontWeight: 600, background: 'transparent', color: t.ink,
            border: `1px solid ${t.amberLine}`, borderRadius: 999,
            padding: '7px 15px', cursor: 'pointer',
          }}
        >{acc?.user ? acc.user.name : 'Sign in'}</button>
      </div>
    </nav>
  );
}

/**
 * The family strip. Every shelf site carries the same one, which is the whole
 * point: someone who finds the coffee site should discover the bar app without
 * either site having to be redesigned to say so.
 *
 * `live: false` entries render as plain text rather than links. Naming an app
 * that does not exist yet as though it does is the same overclaim problem the
 * paywalls have, and a dead link is worse than a quiet one.
 */
function ShelfFamily() {
  const t = useTheme();
  const { family = [], appName, fonts } = useShelfKit();
  const others = family.filter((f) => f.name !== appName);
  if (!others.length) return null;

  return (
    <div style={{
      borderTop: `1px solid ${t.lineSoft}`, marginTop: 40, paddingTop: 32,
    }}>
      <Eyebrow>The shelf family</Eyebrow>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: 20, marginTop: 18, textAlign: 'left',
      }}>
        {others.map((f) => {
          const body = (
            <>
              <div style={{
                fontFamily: fonts?.display || 'Georgia, serif', fontSize: 15.5,
                color: f.live ? t.ink : t.muted,
              }}>
                {f.name}
                {!f.live && (
                  <span style={{
                    fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase',
                    color: t.faint, marginLeft: 8, fontFamily: 'inherit',
                  }}>soon</span>
                )}
              </div>
              {f.tagline && (
                <div style={{ fontSize: 12.5, color: t.muted, marginTop: 3, lineHeight: 1.5 }}>
                  {f.tagline}
                </div>
              )}
            </>
          );
          return f.live && f.url
            ? <a key={f.name} href={f.url} style={{ textDecoration: 'none' }}>{body}</a>
            : <div key={f.name}>{body}</div>;
        })}
      </div>
    </div>
  );
}

export function SiteFooter() {
  const t = useTheme();
  const { footer = [], org = {} } = useShelfKit();

  return (
    <footer style={{
      borderTop: `1px solid ${t.line}`, marginTop: 64, padding: '40px 24px 64px',
    }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        {footer.length > 0 && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 28, textAlign: 'left',
          }}>
            {footer.map((col) => (
              <div key={col.title}>
                <Eyebrow style={{ fontSize: 10.5 }}>{col.title}</Eyebrow>
                <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0 0',
                  display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {col.items.map((it) => (
                    <li key={it.label}>
                      <a href={it.href} style={{
                        fontSize: 13.5, color: t.body, textDecoration: 'none',
                      }}>{it.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <ShelfFamily />

        <div style={{
          fontSize: 12, color: t.faint, lineHeight: 2, marginTop: 34,
          paddingTop: 20, borderTop: `1px solid ${t.lineSoft}`, textAlign: 'center',
        }}>
          © {new Date().getFullYear()} {org.name}
          {org.orgNr ? ` · Org.nr ${org.orgNr}` : ''}
          {org.city ? ` · ${org.city}` : ''}
          {org.email ? <> · <a href={`mailto:${org.email}`} style={{ color: t.faint }}>{org.email}</a></> : null}
        </div>
      </div>
    </footer>
  );
}
