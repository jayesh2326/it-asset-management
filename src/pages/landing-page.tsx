import {
  ArrowRight,
  Blocks,
  Boxes,
  Database,
  Gauge,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "../components/common/card";
import { ThemeToggle } from "../components/common/theme-toggle";
import { useAuth } from "../hooks/use-auth";
import { cn } from "../lib/utils";

const stackItems = [
  {
    icon: Blocks,
    label: "Frontend",
    title: "React + Vite + Tailwind CSS",
    description:
      "A fast single-page app with protected routes, component-driven UI, and analytics-ready pages."
  },
  {
    icon: Gauge,
    label: "Data Layer",
    title: "React Query + React Hook Form + Zod",
    description:
      "Predictable caching, optimistic updates, resilient forms, and schema-backed validation."
  },
  {
    icon: Database,
    label: "Backend",
    title: "Supabase + PostgreSQL",
    description:
      "Managed relational data, generated APIs, file storage, auth, and realtime collaboration signals."
  },
  {
    icon: ShieldCheck,
    label: "Delivery",
    title: "Vercel + Supabase Cloud",
    description:
      "Frontend deployment on the edge with a managed database and role-aware access policies."
  }
] as const;

const architectureNodes = [
  {
    title: "React SPA Frontend",
    caption: "Dashboard, forms, search, charts, routing, and workflow screens"
  },
  {
    title: "Supabase APIs",
    caption: "PostgREST, typed client access, storage actions, and edge functions"
  },
  {
    title: "GoTrue + Realtime",
    caption: "Authentication, sessions, role context, and live state events"
  },
  {
    title: "PostgreSQL Database",
    caption: "Assets, users, assignments, categories, and maintenance history"
  }
] as const;

const schemaCards = [
  {
    name: "profiles",
    relation: "Maps authenticated Supabase users to application roles",
    fields: ["id uuid PK", "email unique", "full_name", "role", "created_at"]
  },
  {
    name: "assets",
    relation: "Tracks each hardware item across its operational lifecycle",
    fields: [
      "id uuid PK",
      "asset_tag unique",
      "name",
      "category",
      "serial_number unique",
      "purchase_date",
      "location",
      "status",
      "current_employee_id FK"
    ]
  },
  {
    name: "employees",
    relation: "Represents the people who can receive company assets",
    fields: [
      "id uuid PK",
      "employee_code unique",
      "full_name",
      "email unique",
      "department",
      "status"
    ]
  },
  {
    name: "asset_assignments",
    relation: "Tracks every issue and return event",
    fields: [
      "id uuid PK",
      "asset_id FK",
      "employee_id FK",
      "assigned_at",
      "returned_at",
      "notes"
    ]
  },
  {
    name: "maintenance_records",
    relation: "Captures repair work and status",
    fields: [
      "id uuid PK",
      "asset_id FK",
      "issue_type",
      "cost",
      "opened_at",
      "status"
    ]
  }
] as const;

const endpointCards = [
  {
    method: "GET",
    endpoint: "/rest/v1/assets?status=eq.in_stock",
    summary: "List assets ready for assignment."
  },
  {
    method: "GET",
    endpoint: "/rest/v1/asset_assignments?select=*,asset:assets(*),employee:employees(*)",
    summary: "Fetch assignment history with related asset and employee data."
  },
  {
    method: "POST",
    endpoint: "/rest/v1/assets",
    summary: "Create a new asset record."
  },
  {
    method: "POST",
    endpoint: "/rest/v1/rpc/assign_asset",
    summary: "Assign an in-stock asset through a database function."
  },
  {
    method: "POST",
    endpoint: "/rest/v1/rpc/open_maintenance",
    summary: "Open a maintenance workflow and update the asset state."
  },
  {
    method: "GET",
    endpoint: "/rest/v1/profiles",
    summary: "Admin-only access directory surfaced through RLS."
  }
] as const;

const accessRules = [
  "Authenticated team members can work with asset, employee, assignment, and maintenance data.",
  "Admin-only policies protect profile visibility, role changes, and invite flows.",
  "Row Level Security keeps authorization in the database instead of the client."
] as const;

const roadmap = [
  {
    phase: "Phase 1",
    days: "Days 1-2",
    title: "Setup and authentication",
    copy: "Initialize the frontend, connect Supabase auth, and protect the workspace routes."
  },
  {
    phase: "Phase 2",
    days: "Days 3-4",
    title: "Schema and RLS",
    copy: "Apply tables, seed data, and lock access down with role-aware policies."
  },
  {
    phase: "Phase 3",
    days: "Days 5-7",
    title: "Asset core module",
    copy: "Ship listing, filtering, pagination, details, and create or edit workflows."
  },
  {
    phase: "Phase 4",
    days: "Days 8-10",
    title: "Assignments and employees",
    copy: "Add the employee directory, assignment lifecycle, and history visibility."
  },
  {
    phase: "Phase 5",
    days: "Days 11-13",
    title: "Maintenance and dashboard",
    copy: "Deliver repair tracking, operational metrics, and category or value charts."
  },
  {
    phase: "Phase 6",
    days: "Days 14-15",
    title: "Polish and deployment",
    copy: "Refine UX, harden security, and publish the application to production."
  }
] as const;

const folderStructure = String.raw`src/
+-- app/                  # App initialization, providers, router config
+-- components/           # Shared UI building blocks
+-- hooks/                # Custom React hooks
+-- lib/                  # Supabase client, utilities, helpers
+-- pages/                # Dashboard, Assets, Employees, Settings
+-- types/                # Database and domain types
\-- styles.css            # Global tokens and Tailwind layers`;

const supabaseSnippet = String.raw`import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database.types";

const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);`;

const querySnippet = String.raw`export function useAssets() {
  return useQuery({
    queryKey: ["assets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data;
    }
  });
}`;

function SectionHeading({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="arch-kicker">{eyebrow}</p>
      <h2 className="arch-display mt-4 text-4xl font-semibold leading-tight text-[var(--text-primary)] md:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-[var(--text-secondary)] md:text-lg">
        {description}
      </p>
    </div>
  );
}

function MethodBadge({ method }: { method: string }) {
  const tone =
    method === "GET"
      ? "bg-[var(--status-info-bg)] text-[var(--status-info-text)]"
      : method === "POST"
        ? "bg-[var(--status-success-bg)] text-[var(--status-success-text)]"
        : "bg-[var(--status-warning-bg)] text-[var(--status-warning-text)]";

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
        tone
      )}
    >
      {method}
    </span>
  );
}

export function LandingPage() {
  const { profile } = useAuth();
  const primaryHref = profile ? "/dashboard" : "/login";
  const primaryLabel = profile ? "Open Workspace" : "Launch Console";

  return (
    <div className="arch-shell min-h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="arch-grid pointer-events-none absolute inset-0" aria-hidden="true" />

      <header className="relative z-10 px-4 pb-6 pt-5 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-5 py-3 shadow-[var(--shadow-soft)] backdrop-blur">
          <Link to="/landing" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--surface-emphasis)] text-[var(--text-on-emphasis)] shadow-[var(--shadow-soft)]">
              <Boxes className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">
                Architecture-led build
              </span>
              <span className="arch-display block text-2xl font-semibold">IT Asset Manager</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-5 text-sm font-medium text-[var(--text-secondary)] lg:flex">
            <a href="#architecture" className="transition hover:text-[var(--text-primary)]">
              Architecture
            </a>
            <a href="#schema" className="transition hover:text-[var(--text-primary)]">
              Data Model
            </a>
            <a href="#delivery" className="transition hover:text-[var(--text-primary)]">
              Delivery Plan
            </a>
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={primaryHref}
              className="inline-flex items-center justify-center rounded-full bg-[var(--surface-emphasis)] px-5 py-2.5 text-sm font-semibold text-[var(--text-on-emphasis)] shadow-[var(--shadow-soft)] transition hover:opacity-95"
            >
              {primaryLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <ThemeToggle compact />
          </div>
        </div>
      </header>

      <main className="relative z-10 px-4 pb-20 md:px-8">
        <section className="mx-auto grid max-w-7xl gap-10 pb-20 pt-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="arch-reveal space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-4 py-2 text-sm text-[var(--text-secondary)] shadow-[var(--shadow-soft)] backdrop-blur">
              <Sparkles className="h-4 w-4 text-[var(--text-link)]" />
              Scalable architecture for assets, assignments, maintenance, and access control
            </div>

            <div>
              <p className="arch-kicker">Operational control tower</p>
              <h1 className="arch-display mt-4 max-w-4xl text-5xl font-semibold leading-[0.96] text-[var(--text-primary)] md:text-7xl">
                Build one asset platform that your IT team can actually run every day.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">
                This website translates your architecture brief into a clear product surface:
                a React application, Supabase backend, role-aware data model, and a phased
                plan for delivery without losing maintainability.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to={primaryHref}
                className="inline-flex items-center justify-center rounded-full bg-[var(--surface-emphasis)] px-6 py-3 text-sm font-semibold text-[var(--text-on-emphasis)] shadow-[var(--shadow-soft)] transition hover:opacity-95"
              >
                {primaryLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <a
                href="#architecture"
                className="inline-flex items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-6 py-3 text-sm font-semibold text-[var(--text-primary)] shadow-[var(--shadow-soft)] transition hover:bg-[var(--surface-hover)]"
              >
                Explore Blueprint
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Delivery phases", value: "6", detail: "From auth setup to production" },
                { label: "Core tables", value: "7", detail: "Profiles, assets, staff, logs" },
                { label: "Deployment target", value: "15 days", detail: "Structured rollout plan" }
              ].map((item) => (
                <Card key={item.label} className="arch-reveal-delay rounded-[1.75rem] p-5">
                  <p className="text-sm uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    {item.label}
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    {item.detail}
                  </p>
                </Card>
              ))}
            </div>

          </div>

          <div className="arch-reveal arch-reveal-delay-2">
            <div className="arch-panel rounded-[2rem] border border-[var(--border-subtle)] p-6 shadow-panel">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="arch-kicker">Conceptual flow</p>
                  <h2 className="mt-2 text-2xl font-semibold">System architecture overview</h2>
                </div>
                <span className="rounded-full bg-[var(--surface-primary)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                  HTTPS + Auth + Realtime
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {architectureNodes.map((node, index) => (
                  <div key={node.title}>
                    <div className="arch-node rounded-[1.6rem] p-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
                        Layer {index + 1}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold">{node.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                        {node.caption}
                      </p>
                    </div>
                    {index < architectureNodes.length - 1 ? (
                      <div className="flex items-center gap-3 px-4 py-2">
                        <div className="arch-connector h-8 w-px" />
                        <span className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                          {index === 0
                            ? "HTTPS requests"
                            : index === 1
                              ? "Auth + policies"
                              : "Secure SQL access"}
                        </span>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    icon: Users,
                    title: "Role-aware access",
                    copy: "Admins, managers, and employees see the right surface."
                  },
                  {
                    icon: Wrench,
                    title: "Lifecycle workflows",
                    copy: "Assignment, return, maintenance, and retirement states."
                  },
                  {
                    icon: LockKeyhole,
                    title: "Policy-first security",
                    copy: "Database rules enforce access instead of trusting only the UI."
                  }
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4"
                  >
                    <item.icon className="h-5 w-5 text-[var(--text-link)]" />
                    <p className="mt-3 text-sm font-semibold text-[var(--text-primary)]">
                      {item.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                      {item.copy}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="architecture" className="mx-auto max-w-7xl space-y-8 py-8">
          <SectionHeading
            eyebrow="Platform stack"
            title="Modern tooling with a clear separation of concerns."
            description="The frontend handles interaction, the data layer manages server state, and Supabase provides the managed backend surface. The result is a system that is fast to iterate on and still production-oriented."
          />

          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
            {stackItems.map((item) => (
              <Card key={item.title} className="rounded-[1.9rem] p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-secondary)] text-[var(--text-link)]">
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="mt-5 text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  {item.label}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-[var(--text-primary)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </section>

        <section id="schema" className="mx-auto max-w-7xl space-y-8 py-10">
          <SectionHeading
            eyebrow="Relational schema"
            title="A database model that matches real-world asset operations."
            description="The schema centers on assets and the people responsible for them, with assignment history, maintenance tracking, and category structure kept as first-class records."
          />

          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {schemaCards.map((table) => (
              <Card key={table.name} className="rounded-[1.9rem] p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
                      Table
                    </p>
                    <h3 className="arch-display mt-2 text-3xl font-semibold lowercase text-[var(--text-primary)]">
                      {table.name}
                    </h3>
                  </div>
                  <span className="rounded-full bg-[var(--surface-secondary)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                    PostgreSQL
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
                  {table.relation}
                </p>
                <div className="mt-5 space-y-2">
                  {table.fields.map((field) => (
                    <div
                      key={field}
                      className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-4 py-3 text-sm text-[var(--text-secondary)]"
                    >
                      {field}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 py-10 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="rounded-[2rem] p-7">
            <p className="arch-kicker">API design</p>
            <h2 className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">
              Generated REST endpoints keep the backend surface thin.
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
              Supabase exposes table operations immediately, while the client uses typed access
              patterns. That keeps development fast and leaves the database in control of
              authorization.
            </p>

            <div className="mt-6 grid gap-4">
              {endpointCards.map((item) => (
                <div
                  key={item.endpoint}
                  className="rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-5 py-4"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <MethodBadge method={item.method} />
                    <code className="arch-code text-sm text-[var(--text-primary)]">
                      {item.endpoint}
                    </code>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                    {item.summary}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-[2rem] p-7">
            <p className="arch-kicker">Security model</p>
            <h2 className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">
              Role-based access lives in Row Level Security.
            </h2>
            <div className="mt-6 space-y-4">
              {accessRules.map((rule) => (
                <div
                  key={rule}
                  className="rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-5 py-4"
                >
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--text-link)]" />
                    <p className="text-sm leading-6 text-[var(--text-secondary)]">{rule}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="mx-auto max-w-7xl space-y-8 py-10">
          <SectionHeading
            eyebrow="Frontend blueprint"
            title="A folder structure that scales with the product."
            description="The application is split by responsibility: app bootstrapping, reusable components, hooks, data helpers, routes, and types. That gives the codebase room to grow without making navigation painful."
          />

          <div className="grid gap-6 xl:grid-cols-3">
            <Card className="rounded-[2rem] p-0 xl:col-span-1">
              <div className="border-b border-[var(--border-subtle)] px-6 py-5">
                <p className="arch-kicker">Project structure</p>
                <h3 className="mt-2 text-2xl font-semibold">Source layout</h3>
              </div>
              <pre className="arch-code overflow-x-auto px-6 py-6 text-sm leading-7 text-[var(--text-secondary)]">
                {folderStructure}
              </pre>
            </Card>

            <Card className="rounded-[2rem] p-0 xl:col-span-1">
              <div className="border-b border-[var(--border-subtle)] px-6 py-5">
                <p className="arch-kicker">Supabase client</p>
                <h3 className="mt-2 text-2xl font-semibold">Typed backend setup</h3>
              </div>
              <pre className="arch-code overflow-x-auto px-6 py-6 text-sm leading-7 text-[var(--text-secondary)]">
                {supabaseSnippet}
              </pre>
            </Card>

            <Card className="rounded-[2rem] p-0 xl:col-span-1">
              <div className="border-b border-[var(--border-subtle)] px-6 py-5">
                <p className="arch-kicker">React Query hook</p>
                <h3 className="mt-2 text-2xl font-semibold">Asset fetching pattern</h3>
              </div>
              <pre className="arch-code overflow-x-auto px-6 py-6 text-sm leading-7 text-[var(--text-secondary)]">
                {querySnippet}
              </pre>
            </Card>
          </div>
        </section>

        <section id="delivery" className="mx-auto max-w-7xl space-y-8 py-10">
          <SectionHeading
            eyebrow="Implementation roadmap"
            title="A phased plan from setup to deployment."
            description="The plan keeps dependencies clear: authentication and schema first, then core asset workflows, then maintenance analytics, then launch hardening."
          />

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {roadmap.map((step) => (
              <Card key={step.phase} className="rounded-[1.9rem] p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="arch-kicker">{step.phase}</span>
                  <span className="rounded-full bg-[var(--surface-secondary)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                    {step.days}
                  </span>
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-[var(--text-primary)]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                  {step.copy}
                </p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl py-10">
          <div className="arch-panel rounded-[2.25rem] border border-[var(--border-subtle)] px-6 py-8 shadow-panel md:px-10 md:py-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="arch-kicker">Ready to build</p>
                <h2 className="arch-display mt-4 text-4xl font-semibold leading-tight md:text-5xl">
                  The website now tells the product story. The workspace still handles the
                  operations.
                </h2>
                <p className="mt-4 text-base leading-7 text-[var(--text-secondary)] md:text-lg">
                  Use the homepage to explain the platform, then jump into the authenticated
                  console to manage assets, employees, assignments, and maintenance.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to={primaryHref}
                  className="inline-flex items-center justify-center rounded-full bg-[var(--surface-emphasis)] px-6 py-3 text-sm font-semibold text-[var(--text-on-emphasis)] shadow-[var(--shadow-soft)] transition hover:opacity-95"
                >
                  {primaryLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <a
                  href="#schema"
                  className="inline-flex items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-6 py-3 text-sm font-semibold text-[var(--text-primary)] shadow-[var(--shadow-soft)] transition hover:bg-[var(--surface-hover)]"
                >
                  Review Data Model
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
