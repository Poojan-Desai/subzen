// ======================================================
// SubZen – Supabase Client
// ======================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ----------------------------------------------
// ✨ Replace these with YOUR real project keys:
// ----------------------------------------------
const SUPABASE_URL = "https://egkqwemmbisfblawkiky.supabase.co";
const SUPABASE_ANON_KEY = "SUPABASE_ANON_KEY=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%";

// ----------------------------------------------
// Initialize Supabase Client
// ----------------------------------------------
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ----------------------------------------------
// Helper: Redirect user if not logged in
// ----------------------------------------------
export async function requireAuth() {
  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    window.location.href = "auth.html";
  }
}