import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

/** Public, read-only catalog client; administration lives in a separate project. */
export function createClient() {
  const { url, publishableKey } = getSupabaseEnv();

  return createSupabaseClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
