import { supabase, supabaseClient } from "./supabaseClient";
import { missingSupabaseEnvMessage } from "./env";

export { supabase, supabaseClient };

export function requireSupabase() {
  if (!supabaseClient) {
    throw new Error(missingSupabaseEnvMessage);
  }

  return supabaseClient;
}
