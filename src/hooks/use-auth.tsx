import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import {
  getDemoSessionProfile,
  signInDemo,
  signOutDemo,
  signUpDemo
} from "../lib/demo-db";
import { appMode } from "../lib/env";
import { supabase } from "../lib/supabase";
import type { AppMode, LoginInput, Profile } from "../types/app";

interface SignupInput extends LoginInput {
  full_name: string;
}

interface SignUpResult {
  requiresEmailConfirmation: boolean;
}

interface AuthContextValue {
  mode: AppMode;
  initialized: boolean;
  profile: Profile | null;
  signIn: (input: LoginInput) => Promise<void>;
  signUp: (input: SignupInput) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchSupabaseProfile() {
  if (!supabase) {
    return null;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (data ?? null) as Profile | null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      if (appMode === "demo") {
        if (isMounted) {
          setProfile(getDemoSessionProfile());
          setInitialized(true);
        }
        return;
      }

      if (!supabase) {
        setInitialized(true);
        return;
      }

      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (session && isMounted) {
        setProfile(await fetchSupabaseProfile());
      }

      if (isMounted) {
        setInitialized(true);
      }
    }

    bootstrap();

    if (appMode === "demo") {
      return () => {
        isMounted = false;
      };
    }

    const subscription = supabase?.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) {
        return;
      }

      if (session) {
        setProfile(await fetchSupabaseProfile());
      } else {
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      mode: appMode,
      initialized,
      profile,
      signIn: async (input) => {
        if (appMode === "demo") {
          const nextProfile = await signInDemo(input);
          setProfile(nextProfile);
          return;
        }

        if (!supabase) {
          throw new Error("Supabase is not configured.");
        }

        const { error } = await supabase.auth.signInWithPassword(input);
        if (error) {
          throw error;
        }

        setProfile(await fetchSupabaseProfile());
      },
      signUp: async (input) => {
        if (appMode === "demo") {
          const nextProfile = await signUpDemo(input);
          setProfile(nextProfile);
          return {
            requiresEmailConfirmation: false
          };
        }

        if (!supabase) {
          throw new Error("Supabase is not configured.");
        }

        const { data, error } = await supabase.auth.signUp({
          email: input.email,
          password: input.password,
          options: {
            data: {
              full_name: input.full_name
            }
          }
        });

        if (error) {
          throw error;
        }

        if (data.session) {
          setProfile(await fetchSupabaseProfile());
        }

        return {
          requiresEmailConfirmation: !data.session
        };
      },
      signOut: async () => {
        if (appMode === "demo") {
          await signOutDemo();
          setProfile(null);
          return;
        }

        if (!supabase) {
          throw new Error("Supabase is not configured.");
        }

        await supabase.auth.signOut();
        setProfile(null);
      },
      refreshProfile: async () => {
        if (appMode === "demo") {
          setProfile(getDemoSessionProfile());
          return;
        }

        setProfile(await fetchSupabaseProfile());
      }
    }),
    [initialized, profile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
