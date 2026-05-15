function pickFirstEnv(...values: Array<string | undefined>) {
  return values.map((value) => value?.trim() ?? "").find((value) => value.length > 0) ?? "";
}

const supabaseUrl = pickFirstEnv(import.meta.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = pickFirstEnv(import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const runtimeConfig = {
  supabaseUrl,
  supabaseAnonKey
};

export const isSupabaseConfigured =
  runtimeConfig.supabaseUrl.length > 0 && runtimeConfig.supabaseAnonKey.length > 0;

export const missingSupabaseEnvMessage =
  "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.";
