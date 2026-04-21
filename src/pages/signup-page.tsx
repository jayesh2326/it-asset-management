import { MonitorSmartphone } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "../lib/validations";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
import { Button } from "../components/common/button";
import { Card } from "../components/common/card";
import { Field, Input } from "../components/common/fields";
import { LoadingScreen } from "../components/common/loading-screen";
import { ThemeToggle } from "../components/common/theme-toggle";

type SignupValues = {
  full_name: string;
  email: string;
  password: string;
};

export function SignupPage() {
  const navigate = useNavigate();
  const { initialized, profile, signUp } = useAuth();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: ""
    }
  });

  useEffect(() => {
    if (profile) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, profile]);

  if (!initialized) {
    return <LoadingScreen label="Checking session..." />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] px-4 py-10 text-[var(--text-primary)]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            to="/login"
            className="inline-flex items-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] shadow-[var(--shadow-soft)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
          >
            Back to sign in
          </Link>
          <ThemeToggle />
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-[var(--nav-border)] bg-[var(--surface-emphasis)] p-8 text-[var(--text-on-emphasis)] shadow-panel">
          <div className="inline-flex rounded-3xl bg-brand-500/20 p-4 text-brand-100">
            <MonitorSmartphone className="h-8 w-8" />
          </div>
          <h1 className="mt-8 max-w-xl text-5xl font-semibold leading-tight">
            Create a secure account to manage IT asset workflows.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-[var(--nav-text-secondary)]">
            Register your team and keep inventory, assignments, maintenance, and access control
            connected in one secure workspace.
          </p>
        </div>

        <Card className="self-center rounded-[2rem] border-[var(--border-subtle)] bg-[var(--surface-primary)] px-6 py-8 text-[var(--text-primary)] md:px-8">
          <p className="text-sm uppercase tracking-[0.22em] text-[var(--text-muted)]">Create account</p>
          <h2 className="mt-3 text-3xl font-semibold">Join the IT asset manager</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Use a real Supabase account to get started. Password must be at least 6 characters.
          </p>

          <form
            className="mt-8 space-y-4"
            onSubmit={handleSubmit(async (values) => {
              try {
                const result = await signUp(values);

                if (result.requiresEmailConfirmation) {
                  toast.success(
                    "Check your inbox",
                    "Confirm your email, then sign in to finish setting up your account."
                  );
                  navigate("/login", { replace: true });
                  return;
                }

                toast.success("Account created", "Your account is ready.");
                navigate("/dashboard", { replace: true });
              } catch (error) {
                toast.error(
                  "Unable to create account",
                  error instanceof Error ? error.message : "Please try again."
                );
              }
            })}
          >
            <Field label="Full name" error={errors.full_name?.message}>
              <Input type="text" {...register("full_name")} placeholder="Alicia Fernandez" />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <Input type="email" {...register("email")} placeholder="admin@company.com" />
            </Field>
            <Field label="Password" error={errors.password?.message}>
              <Input type="password" {...register("password")} placeholder="Create a password" />
            </Field>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
