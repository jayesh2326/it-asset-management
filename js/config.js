const CONFIG = {
SUPABASE_URL: "https://YOUR_PROJECT_ID.supabase.co",
SUPABASE_KEY: "YOUR_PUBLIC_ANON_KEY"
};

// Initialize Supabase
const supabaseClient = supabase.createClient(
CONFIG.SUPABASE_URL,
CONFIG.SUPABASE_KEY
);