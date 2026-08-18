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

/**
 * The site nav, and on a phone a burger sheet rather than a wrapped pile.
 *
 * Ported from My Bar Shelf, which solved this first and whose version is the
 * one that has actually been used. Bar's own component could not be copied:
 * it is welded to bar's client-side router (hrefFor, navTo, route.page) and
 * this one navigates with next/link and usePathname. What transfers is the
 * pattern and the two icons.
 *
 * It lives in the KIT rather than in a consumer because a mobile nav is
 * behaviour, and WEB.md draws the line there: the kit owns behaviour, the app
 * owns identity. Whiskey and coffee both wrapped their links onto two or three
 * lines before this, and fixing it in one of them would have forked the nav.
 *
 * The desktop links stay in the DOM at every width and are hidden with CSS, so
 * a crawler still sees every internal link on a phone-shaped viewport. That is
 * bar's rule and it is the reason this is not a conditional render.
 */
export function SiteNav() {
  const t = useTheme();
  const { appName, nav = [], fonts } = useShelfKit();
  const acc = useAccount();
  const pathname = usePathname() || '/';
  const [menuOpen, setMenuOpen] = React.useState(false);

  // A sheet that survives navigation would cover the page it just opened.
  React.useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Escape closes it. A sheet with no keyboard exit is a trap for anyone not
  // using a touchscreen, and this renders at desktop widths too if the window
  // is narrow.
  React.useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const isActive = (href) => pathname === href || pathname.startsWith(href + '/');

  return (
    <nav style={{
      position: 'relative', zIndex: 10, maxWidth: 1120, margin: '0 auto',
      padding: '24px 24px 0', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
    }}>
      <style>{`
        .shk-nav-burger { display: none; }
        @media (max-width: 760px) {
          /* One row: wordmark and burger. The links keep their DOM node and
             lose only their box, so nothing disappears from the crawl. */
          .shk-nav-links { display: none !important; }
          .shk-nav-burger {
            display: flex; align-items: center; justify-content: center;
            width: 44px; height: 44px; flex-shrink: 0;
            background: none; border: none; cursor: pointer; padding: 0;
          }
        }
      `}</style>

      <Link href="/" style={{
        fontFamily: fonts?.display || 'Georgia, serif', fontSize: 18, fontWeight: 500,
        color: t.amber, textDecoration: 'none',
      }}>{appName}</Link>

      <div className="shk-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        {nav.map(({ href, label }) => (
          <Link key={href} href={href} style={{
            fontSize: 11.5, fontWeight: 600, letterSpacing: '.19em', textTransform: 'uppercase',
            color: isActive(href) ? t.ink : t.muted, textDecoration: 'none',
            borderBottom: `1px solid ${isActive(href) ? t.amber : 'transparent'}`, paddingBottom: 3,
          }}>{label}</Link>
        ))}
        <button
          onClick={() => acc?.openModal(acc?.user ? 'account' : 'signin')}
          style={{
            fontSize: 12.5, fontWeight: 600, background: 'transparent', color: t.ink,
            border: `1px solid ${t.amberLine}`, borderRadius: 999,
            padding: '7px 15px', cursor: 'pointer',
          }}
        >{acc?.user ? acc.user.name : 'Sign in'}</button>
      </div>

      <button
        className="shk-nav-burger"
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((o) => !o)}
      >
        {menuOpen ? (
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M4 4 L16 16 M16 4 L4 16" stroke={t.amber} strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="22" height="16" viewBox="0 0 22 16" aria-hidden="true">
            <path d="M1 1.5 H21 M1 8 H21 M1 14.5 H21" stroke={t.amber} strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        )}
      </button>

      {menuOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 60,
          background: t.bg, borderBottom: `1px solid ${t.line}`,
          boxShadow: '0 28px 56px rgba(0,0,0,0.6)',
          padding: '4px 24px 22px', display: 'flex', flexDirection: 'column',
          maxHeight: 'calc(100vh - 80px)', overflowY: 'auto',
        }}>
          {nav.map(({ href, label }) => (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              // 52px, not the 44px minimum. This is the one control a thumb uses
              // on every page, and the rows sit directly under each other.
              minHeight: 52, padding: '8px 2px', textDecoration: 'none',
              fontFamily: fonts?.display || 'Georgia, serif',
              fontSize: 21, fontWeight: 500,
              color: isActive(href) ? t.amber : t.ink,
              borderBottom: `1px solid ${t.lineSoft}`,
            }}>
              {label}
              {isActive(href) ? <span aria-hidden="true" style={{ color: t.amber, fontSize: 11 }}>&#9670;</span> : null}
            </Link>
          ))}
          <button
            onClick={() => { setMenuOpen(false); acc?.openModal(acc?.user ? 'account' : 'signin'); }}
            style={{
              marginTop: 18, alignSelf: 'flex-start',
              fontSize: 12.5, fontWeight: 600, background: 'transparent', color: t.ink,
              border: `1px solid ${t.amberLine}`, borderRadius: 999,
              padding: '11px 20px', minHeight: 44, cursor: 'pointer',
            }}
          >{acc?.user ? acc.user.name : 'Sign in'}</button>
        </div>
      )}
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
          // A live landing page earns a link even before the app ships; the
          // "soon" chip (on !f.live) still marks app status. No url = no link.
          return f.url
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
                      {/* 28px hit box on a 29px row pitch (16px visible), no
                          layout change; 6px vertical keeps boxes from
                          overlapping the next row. */}
                      <a href={it.href} style={{
                        fontSize: 13.5, color: t.body, textDecoration: 'none',
                        display: 'inline-block', padding: '6px 10px', margin: '-6px -10px',
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
