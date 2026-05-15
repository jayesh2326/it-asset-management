import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { isSupabaseConfigured, missingSupabaseEnvMessage } from "../lib/env";
import { requireSupabase } from "../lib/supabase";
import type { LoginInput, Profile } from "../types/app";

interface SignupInput extends LoginInput {
  full_name: string;
}

interface SignUpResult {
  requiresEmailConfirmation: boolean;
}

interface AuthContextValue {
  initialized: boolean;
  profile: Profile | null;
  signIn: (input: LoginInput) => Promise<void>;
  signUp: (input: SignupInput) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getFallbackFullName(user: User) {
  const fullName = user.user_metadata?.full_name;
  if (typeof fullName === "string" && fullName.trim().length > 0) {
    return fullName.trim();
  }

  return user.email?.split("@")[0] ?? "User";
}

async function fetchSupabaseProfile(user?: User | null) {
  if (!isSupabaseConfigured) {
    return null;
  }

  const client = requireSupabase();
  let currentUser = user ?? null;

  if (!currentUser) {
    const {
      data: { user: sessionUser },
      error
    } = await client.auth.getUser();

    if (error) {
      throw error;
    }

    currentUser = sessionUser;
  }

  if (!currentUser) {
    return null;
  }

  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", currentUser.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data) {
    return data as Profile;
  }

  const { error: insertError } = await client.from("profiles").insert({
    id: currentUser.id,
    email: currentUser.email ?? "",
    full_name: getFallbackFullName(currentUser),
    role: "it_staff",
    active: true
  });

  if (insertError) {
    throw insertError;
  }

  const { data: createdProfile, error: createdProfileError } = await client
    .from("profiles")
    .select("*")
    .eq("id", currentUser.id)
    .single();

  if (createdProfileError || !createdProfile) {
    throw createdProfileError ?? new Error("Unable to load the signed-in profile.");
  }

  return createdProfile as Profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [initialized, setInitialized] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      if (!isSupabaseConfigured) {
        setInitialized(true);
        return;
      }

      const client = requireSupabase();

      try {
        const {
          data: { session },
          error
        } = await client.auth.getSession();

        if (error) {
          throw error;
        }

        if (session && isMounted) {
          setProfile(await fetchSupabaseProfile(session.user));
        }
      } catch (error) {
        console.error("Unable to initialize the Supabase session.", error);
        if (isMounted) {
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setInitialized(true);
        }
      }
    }

    void bootstrap();

    if (!isSupabaseConfigured) {
      return () => {
        isMounted = false;
      };
    }

    const client = requireSupabase();
    const subscription = client.auth.onAuthStateChange((_event, session) => {
      void (async () => {
        if (!isMounted) {
          return;
        }

        try {
          if (session) {
            setProfile(await fetchSupabaseProfile(session.user));
            return;
          }

          queryClient.clear();
          setProfile(null);
        } catch (error) {
          console.error("Unable to refresh the Supabase session.", error);
          queryClient.clear();
          setProfile(null);
        }
      })();
    });

    return () => {
      isMounted = false;
      subscription.data.subscription.unsubscribe();
    };
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      initialized,
      profile,
      signIn: async (input) => {
        if (!isSupabaseConfigured) {
          throw new Error(missingSupabaseEnvMessage);
        }

        const client = requireSupabase();

        const { data, error } = await client.auth.signInWithPassword(input);
        if (error) {
          throw error;
        }

        queryClient.clear();
        setProfile(await fetchSupabaseProfile(data.user));
      },
      signUp: async (input) => {
        if (!isSupabaseConfigured) {
          throw new Error(missingSupabaseEnvMessage);
        }

        const client = requireSupabase();

        const { data, error } = await client.auth.signUp({
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

        if (data.session && data.user) {
          queryClient.clear();
          setProfile(await fetchSupabaseProfile(data.user));
        }

        return {
          requiresEmailConfirmation: !data.session
        };
      },
      signOut: async () => {
        if (!isSupabaseConfigured) {
          throw new Error(missingSupabaseEnvMessage);
        }

        const client = requireSupabase();
        const { error } = await client.auth.signOut();
        if (error) {
          throw error;
        }

        queryClient.clear();
        setProfile(null);
      },
      refreshProfile: async () => {
        if (!isSupabaseConfigured) {
          setProfile(null);
          return;
        }

        setProfile(await fetchSupabaseProfile());
      }
    }),
    [initialized, profile, queryClient]
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
