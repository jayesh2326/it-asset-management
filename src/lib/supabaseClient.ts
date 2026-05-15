import { createClient } from "@supabase/supabase-js";
import {
  isSupabaseConfigured,
  missingSupabaseEnvMessage,
  runtimeConfig
} from "./env";

export const supabaseClient = isSupabaseConfigured
  ? createClient(runtimeConfig.supabaseUrl, runtimeConfig.supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
        storageKey: "it-asset-manager-auth"
      }
    })
  : null;

export const supabase = supabaseClient;

export function requireSupabaseClient() {
  if (!supabaseClient) {
    throw new Error(missingSupabaseEnvMessage);
  }

  return supabaseClient;
}
