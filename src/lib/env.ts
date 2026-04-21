function pickFirstEnv(...values: Array<string | undefined>) {
  return values.map((value) => value?.trim() ?? "").find((value) => value.length > 0) ?? "";
}

const supabaseUrl = pickFirstEnv(import.meta.env.VITE_SUPABASE_URL);
const supabaseKey = pickFirstEnv(
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const runtimeConfig = {
  supabaseUrl,
  supabaseKey
};

export const isSupabaseConfigured =
  runtimeConfig.supabaseUrl.length > 0 && runtimeConfig.supabaseKey.length > 0;
