import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Env var NEXT_PUBLIC_SUPABASE_URL belum diset di server ini.");
}
if (!serviceRoleKey) {
  throw new Error("Env var SUPABASE_SERVICE_ROLE_KEY belum diset di server ini.");
}

// Service role key bypasses RLS - never import this file from client components.
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});
