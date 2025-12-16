// ======================================================
// SubZen – Supabase Client
// ======================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ----------------------------------------------
// ✨ Replace these with YOUR real project keys:
// ----------------------------------------------
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

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