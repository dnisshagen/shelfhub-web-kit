import { createClient } from '@supabase/supabase-js';

/**
 * One Supabase project backs the whole family, but each app's tables live in
 * its own schema (coffee.*, and public.* for bar). Passing the schema here
 * means no call site has to remember: getting it wrong returns an empty result
 * rather than an error, which is the kind of bug that costs an afternoon.
 *
 * Auth is unaffected by the schema setting — auth.users is shared, which is
 * why one account works across every shelf app.
 */
export function createShelfClient({ url, anonKey, schema }) {
  if (!url || !anonKey) {
    throw new Error(
      'createShelfClient needs url and anonKey. In Next these come from ' +
      'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.'
    );
  }
  return createClient(url, anonKey, schema ? { db: { schema } } : undefined);
}
