'use client';

import React from 'react';
import { useShelfKit } from './config.jsx';
import { useTheme } from './theme.jsx';

const AccountContext = React.createContext(null);
export function useAccount() {
  return React.useContext(AccountContext);
}

// The auth row carries far more than any screen renders. Flatten it once.
function shapeUser(u) {
  if (!u) return null;
  const meta = u.user_metadata || {};
  const appMeta = u.app_metadata || {};
  const providers =
    Array.isArray(appMeta.providers) && appMeta.providers.length
      ? appMeta.providers
      : appMeta.provider
        ? [appMeta.provider]
        : ['email'];
  return {
    id: u.id,
    email: u.email,
    name: meta.full_name || meta.name || (u.email || '').split('@')[0],
    since: u.created_at ? new Date(u.created_at).getFullYear().toString() : '',
    providers,
  };
}

export function AccountProvider({ children }) {
  const { supabase, auth, appId } = useShelfKit();
  const redirectPath = auth?.redirectPath || '/';
  const [user, setUser] = React.useState(null);
  const [authReady, setAuthReady] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState('signin');

  React.useEffect(() => {
    let cancelled = false;
    let unsub;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      setUser(shapeUser(data.session?.user));
      setAuthReady(true);
      const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
        setUser(shapeUser(session?.user));
      });
      unsub = sub.subscription;
    })();
    return () => { cancelled = true; if (unsub) unsub.unsubscribe(); };
  }, [supabase]);

  const signInWithPassword = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUpWithPassword = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: name ? { full_name: name } : undefined },
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setOpen(false);
  };

  const sendPasswordReset = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    });
    if (error) throw error;
  };

  const sendMagicLink = async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}${redirectPath}` },
    });
    if (error) throw error;
  };

  const signInWithOAuth = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}${redirectPath}`,
        // Without this Google silently reuses whichever account the browser is
        // already signed into and never shows a chooser. Anyone with a personal
        // and a work Google lands in the wrong shelf with no visible way to
        // correct it. Apple's flow has its own picker and takes no equivalent.
        ...(provider === 'google' ? { queryParams: { prompt: 'select_account' } } : {}),
      },
    });
    if (error) throw error;
  };

  // Deletion goes through an edge function because it has to remove rows the
  // user can read but not delete, and the auth row itself.
  //
  // THE BODY IS NOT OPTIONAL. delete-account resolves the caller as
  // `body.app_id ?? (body.confirm === true ? 'coffee_shelf' : 'shelf')`, and
  // that empty-body default is deliberate: legacy bar and whiskey APP builds
  // POST with no body and can never be updated, so they fall to the shelf
  // group on purpose. A website that sends no body impersonates one of them.
  //
  // Until 2026-08-29 this function did exactly that, so "Delete account" on
  // coffee's and wine's live sites erased the user's BAR and WHISKEY inventory
  // and left the data they were trying to delete untouched. Sending app_id is
  // what makes the call mean what the button says.
  //
  // Fail closed when the site has not declared an appId: refusing to delete is
  // recoverable, deleting the wrong app's shelf is not.
  const deleteAccount = async () => {
    if (!appId) {
      throw new Error(
        'This site cannot delete accounts yet: no appId in its shelf config. ' +
        'Email us and we will do it by hand.',
      );
    }
    const { data, error } = await supabase.functions.invoke('delete-account', {
      method: 'POST',
      body: { app_id: appId, confirm: true },
    });
    if (error) throw error;
    // Fail closed: an empty or malformed response is not a success. The old
    // check (data.success === false) treated a missing body as deleted.
    if (!data?.success) throw new Error(data?.error || 'Delete failed');
    await supabase.auth.signOut();
    setOpen(false);
  };

  const openModal = (initial = 'signin') => {
    setTab(user ? 'account' : initial);
    setOpen(true);
  };

  const value = {
    user, authReady, open, tab, setTab,
    signInWithPassword, signUpWithPassword, signOut,
    sendPasswordReset, sendMagicLink, deleteAccount,
    signInWithApple: () => signInWithOAuth('apple'),
    signInWithGoogle: () => signInWithOAuth('google'),
    openModal,
    close: () => setOpen(false),
  };

  return (
    <AccountContext.Provider value={value}>
      {children}
      <AccountModal />
    </AccountContext.Provider>
  );
}

function Field({ label, children }) {
  const t = useTheme();
  return (
    <label style={{ display: 'block', marginBottom: 16 }}>
      <div style={{
        fontSize: 10, fontWeight: 600, letterSpacing: '.19em', textTransform: 'uppercase',
        color: t.amber, marginBottom: 7,
      }}>{label}</div>
      {children}
    </label>
  );
}

function fieldStyle(t) {
  return {
    width: '100%', background: t.bg, border: `1px solid ${t.amberLine}`,
    borderRadius: 4, padding: '13px 14px', lineHeight: 1.6,
    // 16px or iOS Safari zooms the whole page when the field takes focus.
    fontSize: 16, color: t.ink, outline: 'none',
  };
}

const DANGER = '#C0563F';

// app_metadata carries raw provider ids; the chips wear display names.
const providerLabel = (p) => ({ email: 'Email', google: 'Google', apple: 'Apple' }[p] || p);

function AccountModal() {
  const t = useTheme();
  const { appName, fonts } = useShelfKit();
  const acc = useAccount();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState(null);
  const [note, setNote] = React.useState(null);
  // Deletion arms on the first tap and reverts on its own; see onDelete.
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const confirmTimer = React.useRef(null);

  React.useEffect(() => {
    if (!acc?.open) {
      setErr(null); setNote(null); setBusy(false);
      setConfirmDelete(false); clearTimeout(confirmTimer.current);
    }
  }, [acc?.open]);

  React.useEffect(() => () => clearTimeout(confirmTimer.current), []);

  // Escape closes it, same as the nav sheet. Backdrop click alone strands
  // anyone on a keyboard. Bar shipped this first; the kit lagged.
  React.useEffect(() => {
    if (!acc?.open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') acc.close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [acc?.open]);

  React.useEffect(() => {
    if (acc?.user && acc?.open && acc?.tab !== 'account') acc.close();
  }, [acc]);

  if (!acc?.open) return null;

  const run = async (fn, successNote) => {
    setBusy(true); setErr(null); setNote(null);
    try { await fn(); if (successNote) setNote(successNote); }
    catch (e) { setErr(e?.message || 'That did not work.'); }
    finally { setBusy(false); }
  };

  const submit = (e) => {
    e.preventDefault();
    if (acc.tab === 'signup') {
      run(() => acc.signUpWithPassword(email, password, name), 'Check your email to confirm the account.');
    } else {
      run(() => acc.signInWithPassword(email, password));
    }
  };

  const isAccount = acc.tab === 'account' && acc.user;
  const displayFont = fonts?.display || 'Georgia, serif';

  // Two taps with a six second revert, ported from My Bar Shelf. A native
  // confirm() is jarring on iOS Safari, unstylable, and invisible to the DOM,
  // so nothing could verify it; the armed state lives inside the modal.
  const onDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      confirmTimer.current = setTimeout(() => setConfirmDelete(false), 6000);
      return;
    }
    clearTimeout(confirmTimer.current);
    setConfirmDelete(false);
    run(() => acc.deleteAccount());
  };

  return (
    <div
      role="dialog" aria-modal="true" onClick={acc.close}
      style={{
        position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(20,14,10,.55)',
        display: 'grid', placeItems: 'center', padding: 16,
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxWidth: 400, background: t.surface,
        border: `1px solid ${t.amberLine}`, borderRadius: 14, padding: 40,
      }}>
        <div style={{
          fontSize: 11.5, fontWeight: 600, letterSpacing: '.19em',
          textTransform: 'uppercase', color: t.amber, marginBottom: 10,
        }}>{appName}</div>

        {isAccount ? (
          <>
            <div style={{ fontFamily: displayFont, fontSize: 26, fontWeight: 700, color: t.ink }}>
              {acc.user.name}
            </div>
            <div style={{ fontSize: 12.5, color: t.muted, margin: '6px 0 0' }}>
              {acc.user.email} · since {acc.user.since}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '10px 0 26px' }}>
              {acc.user.providers.map((p) => (
                <span key={p} style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase',
                  color: t.muted, border: `1px solid ${t.amberLine}`, borderRadius: 999,
                  padding: '3px 9px',
                }}>{providerLabel(p)}</span>
              ))}
            </div>
            <button onClick={acc.signOut} style={ghost(t)}>Sign out</button>
            <button
              onClick={onDelete}
              disabled={busy}
              style={{
                ...ghost(t), marginTop: 8,
                borderColor: confirmDelete ? DANGER : 'transparent',
                color: confirmDelete ? DANGER : t.muted,
              }}
            >
              {confirmDelete ? 'Tap again to confirm' : 'Delete account'}
            </button>
            {err && <div style={{ fontSize: 12.5, color: DANGER, marginTop: 12 }}>{err}</div>}
          </>
        ) : (
          <>
            <div style={{ fontFamily: displayFont, fontSize: 28, fontWeight: 700, color: t.ink, marginBottom: 24 }}>
              {acc.tab === 'signup' ? 'Create an account' : 'Sign in'}
            </div>

            <form onSubmit={submit}>
              {acc.tab === 'signup' && (
                <Field label="Name">
                  <input style={fieldStyle(t)} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                </Field>
              )}
              <Field label="Email">
                <input style={fieldStyle(t)} type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </Field>
              <Field label="Password">
                <input style={fieldStyle(t)} type="password" required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={acc.tab === 'signup' ? 'new-password' : 'current-password'} />
              </Field>

              {err && <div style={{ fontSize: 12.5, color: DANGER, marginBottom: 12 }}>{err}</div>}
              {note && <div style={{ fontSize: 12.5, color: t.amberDeep, marginBottom: 12 }}>{note}</div>}

              <button type="submit" disabled={busy} style={solid(t, busy)}>
                {busy ? 'One moment…' : acc.tab === 'signup' ? 'Create account' : 'Sign in'}
              </button>
            </form>

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={acc.signInWithGoogle} style={ghost(t)}>Google</button>
              <button onClick={acc.signInWithApple} style={ghost(t)}>Apple</button>
            </div>

            <div style={{ display: 'flex', gap: 14, marginTop: 14, flexWrap: 'wrap' }}>
              <button
                onClick={() => email
                  ? run(() => acc.sendMagicLink(email), 'Link sent. Check your email.')
                  : setErr('Enter your email first.')}
                style={link(t)}
              >Email me a link instead</button>
              <button
                onClick={() => email
                  ? run(() => acc.sendPasswordReset(email), 'Reset link sent.')
                  : setErr('Enter your email first.')}
                style={link(t)}
              >Forgot password</button>
            </div>

            <div style={{ marginTop: 24, fontSize: 12.5, color: t.muted }}>
              {acc.tab === 'signup'
                ? <>Already have one? <button onClick={() => acc.setTab('signin')} style={link(t)}>Sign in</button></>
                : <>No account yet? <button onClick={() => acc.setTab('signup')} style={link(t)}>Create one</button></>}
            </div>
            <div style={{ marginTop: 8, fontSize: 12.5, color: t.faint }}>
              One account works across every shelf app.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const solid = (t, busy) => ({
  width: '100%', padding: '13px 16px', background: busy ? t.amberDeep : t.amber,
  color: t.onAmber, border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 600,
  cursor: busy ? 'default' : 'pointer',
});
const ghost = (t) => ({
  flex: 1, width: '100%', padding: '11px 16px', background: 'transparent', color: t.ink,
  border: `1px solid ${t.amberLine}`, borderRadius: 4, fontSize: 14, fontWeight: 600, cursor: 'pointer',
});
const link = (t) => ({
  background: 'none', border: 'none', padding: 0, color: t.amber,
  fontSize: 12.5, cursor: 'pointer', textDecoration: 'underline',
});
