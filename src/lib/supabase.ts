import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, runtimeConfig } from "./env";

export const supabase = isSupabaseConfigured
  ? createClient(runtimeConfig.supabaseUrl, runtimeConfig.supabaseKey)
  : null;
