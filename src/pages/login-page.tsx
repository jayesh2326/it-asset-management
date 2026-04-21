import { MonitorSmartphone } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../lib/validations";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
import { Button } from "../components/common/button";
import { Card } from "../components/common/card";
import { Field, Input } from "../components/common/fields";
import { LoadingScreen } from "../components/common/loading-screen";
import { ThemeToggle } from "../components/common/theme-toggle";

type LoginValues = {
  email: string;
  password: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const { initialized, profile, signIn } = useAuth();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
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
            to="/landing"
            className="inline-flex items-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] shadow-[var(--shadow-soft)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
          >
            Back to overview
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
            Run your entire IT asset lifecycle from one operational cockpit.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-[var(--nav-text-secondary)]">
            Track devices, employee ownership, returns, maintenance, and access control
            without jumping between spreadsheets and inboxes.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["Assets", "Create, assign, return, archive, and export inventory."],
              ["People", "Keep employee records in sync with assigned equipment."],
              ["History", "Every action writes to a timeline for audit confidence."]
            ].map(([title, copy]) => (
              <div
                key={title}
                className="rounded-3xl border border-[var(--nav-border)] bg-[var(--nav-surface-elevated)] p-5"
              >
                <h2 className="text-lg font-semibold">{title}</h2>
                <p className="mt-2 text-sm text-[var(--nav-text-secondary)]">{copy}</p>
              </div>
            ))}
          </div>
        </div>

        <Card className="self-center rounded-[2rem] border-[var(--border-subtle)] bg-[var(--surface-primary)] px-6 py-8 text-[var(--text-primary)] md:px-8">
          <p className="text-sm uppercase tracking-[0.22em] text-[var(--text-muted)]">Sign in</p>
          <h2 className="mt-3 text-3xl font-semibold">Welcome back</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Use your IT operations credentials to access the management console.
          </p>

          <div className="mt-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-emphasis)] p-4 text-sm text-[var(--text-secondary)]">
            <p className="font-semibold">No demo mode</p>
            <p className="mt-2">
              Sign in with your Supabase account, or <Link className="font-semibold underline" to="/signup">create an account</Link>.
            </p>
          </div>

          <form
            className="mt-8 space-y-4"
            onSubmit={handleSubmit(async (values) => {
              try {
                await signIn(values);
                toast.success("Signed in", "Your workspace is ready.");
                navigate("/dashboard", { replace: true });
              } catch (error) {
                toast.error(
                  "Unable to sign in",
                  error instanceof Error ? error.message : "Please try again."
                );
              }
            })}
          >
            <Field label="Email" error={errors.email?.message}>
              <Input type="email" {...register("email")} placeholder="admin@company.com" />
            </Field>
            <Field label="Password" error={errors.password?.message}>
              <Input type="password" {...register("password")} placeholder="Password" />
            </Field>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
