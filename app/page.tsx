"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  FileText,
  FolderLock,
  GitBranch,
  LayoutDashboard,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";

const navItems = [
  {
    name: "Explore",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Data Room",
    href: "/data-room",
    icon: FolderLock,
  },
  {
    name: "AI Compliance Chat",
    href: "/chat",
    icon: MessageSquareText,
  },
  {
    name: "Admin Panel",
    href: "/admin",
    icon: Users,
  },
  {
    name: "Tree Editor",
    href: "/tree-editor",
    icon: GitBranch,
  },
];

const modules = [
  {
    title: "Virtual Data Room",
    description:
      "Securely organize, review and manage compliance documents, permissions and audit activity.",
    icon: FolderLock,
    stats: "Documents & Compliance",
    action: "Open Data Room",
    href: "/data-room",
    accent: "blue",
  },
  {
    title: "AI Compliance Chat",
    description:
      "Ask compliance questions, analyze documents and explore AI responses with supporting citations.",
    icon: MessageSquareText,
    stats: "AI-powered Analysis",
    action: "Start Conversation",
    href: "/chat",
    accent: "violet",
  },
  {
    title: "Enterprise Admin",
    description:
      "Manage users, permissions, compliance rules, system health, audit logs and feature controls.",
    icon: BarChart3,
    stats: "Management & Analytics",
    action: "Open Admin Panel",
    href: "/admin",
    accent: "emerald",
  },
  {
    title: "Compliance Tree Editor",
    description:
      "Build visual compliance workflows by connecting rules, conditions and actions.",
    icon: Workflow,
    stats: "Visual Workflow Builder",
    action: "Open Tree Editor",
    href: "/tree-editor",
    accent: "amber",
  },
];

const workflow = [
  {
    number: "01",
    title: "Manage",
    description: "Organize and review compliance documents.",
    icon: FolderLock,
  },
  {
    number: "02",
    title: "Analyze",
    description: "Use AI to investigate documents and questions.",
    icon: Sparkles,
  },
  {
    number: "03",
    title: "Build",
    description: "Create rules and visual compliance workflows.",
    icon: GitBranch,
  },
  {
    number: "04",
    title: "Monitor",
    description: "Track users, rules, activity and system health.",
    icon: ShieldCheck,
  },
];

const activities = [
  {
    title: "Compliance document reviewed",
    description: "FINRA regulatory document",
    time: "2 min ago",
    icon: FileText,
  },
  {
    title: "AI compliance analysis completed",
    description: "Compliance Chat",
    time: "15 min ago",
    icon: Sparkles,
  },
  {
    title: "Compliance rule updated",
    description: "FINRA-2210",
    time: "32 min ago",
    icon: ShieldCheck,
  },
  {
    title: "Workflow configuration changed",
    description: "Compliance Tree Editor",
    time: "1 hr ago",
    icon: GitBranch,
  },
];

function accentClasses(accent: string) {
  switch (accent) {
    case "violet":
      return {
        icon: "bg-violet-500/10 text-violet-400",
        hover: "group-hover:border-violet-500/40",
        action: "text-violet-400",
      };
    case "emerald":
      return {
        icon: "bg-emerald-500/10 text-emerald-400",
        hover: "group-hover:border-emerald-500/40",
        action: "text-emerald-400",
      };
    case "amber":
      return {
        icon: "bg-amber-500/10 text-amber-400",
        hover: "group-hover:border-amber-500/40",
        action: "text-amber-400",
      };
    default:
      return {
        icon: "bg-blue-500/10 text-blue-400",
        hover: "group-hover:border-blue-500/40",
        action: "text-blue-400",
      };
  }
}

export default function Home() {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-800/80 bg-[#0b101c]">
        {/* BRAND */}
        <div className="flex h-20 items-center border-b border-slate-800/80 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
            <span className="text-lg font-bold">G</span>
          </div>

          <div className="ml-3">
            <h1 className="text-lg font-bold tracking-tight">GLYNAC</h1>
            <p className="text-[11px] text-slate-500">
              Wealth & Compliance
            </p>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-3 py-6">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
            Workspace
          </p>

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all ${
                    active
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/15"
                      : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
                  }`}
                >
                  <Icon
                    size={18}
                    strokeWidth={active ? 2.4 : 1.9}
                    className={
                      active
                        ? "text-white"
                        : "text-slate-500 group-hover:text-slate-300"
                    }
                  />
                  <span>{item.name}</span>

                  {active && (
                    <ChevronRight
                      size={15}
                      className="ml-auto text-blue-200"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* HELP */}
          <div className="mt-8">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              Support
            </p>

            <button className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-400 transition hover:bg-slate-800/70 hover:text-white">
              <CircleHelp size={18} />
              Help & Guidance
            </button>
          </div>
        </nav>

        {/* PROFILE */}
        <div className="border-t border-slate-800/80 p-4">
          <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold">
              H
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Heema</p>
              <p className="truncate text-xs text-slate-500">
                Frontend Intern
              </p>
            </div>

            <div className="ml-auto h-2 w-2 rounded-full bg-emerald-400" />
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="ml-64 min-h-screen">
        {/* TOP BAR */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-800/80 bg-[#070b14]/90 px-8 backdrop-blur-xl">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Workspace
            </p>
            <h2 className="mt-1 text-sm font-semibold text-slate-200">
              Compliance Operations
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button
              aria-label="Notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
            >
              <Bell size={18} />

              <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-blue-500" />
            </button>

            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-200">
                Heema
              </p>
              <p className="text-[11px] text-slate-500">
                Frontend Intern
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-500/20 bg-blue-600/90 text-sm font-semibold">
              H
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="mx-auto max-w-[1500px] px-6 py-8 lg:px-8">
          {/* HERO */}
          <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-[#0d1422] to-[#0a101c] p-7 lg:p-9">
            {/* Decorative glow */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-violet-600/5 blur-3xl" />

            <div className="relative max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                Compliance workspace ready
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Welcome back,
                <span className="ml-2">👋</span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Manage documents, investigate compliance questions, build
                workflows and monitor your enterprise environment — all from
                one workspace.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/data-room"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
                >
                  Open Data Room
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href="/chat"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
                >
                  Start AI Chat
                  <Sparkles size={16} />
                </Link>
              </div>
            </div>
          </section>

          {/* QUICK ORIENTATION */}
          <section className="mt-8">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-white">
                Explore the platform
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Choose a workspace below to get started.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {modules.map((module) => {
                const Icon = module.icon;
                const styles = accentClasses(module.accent);

                return (
                  <Link
                    key={module.href}
                    href={module.href}
                    className={`group relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0c121f] p-5 transition-all duration-200 hover:-translate-y-1 hover:bg-[#101827] ${styles.hover}`}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${styles.icon}`}
                      >
                        <Icon size={21} strokeWidth={1.9} />
                      </div>

                      <ArrowRight
                        size={17}
                        className="text-slate-700 transition-all group-hover:translate-x-1 group-hover:text-slate-300"
                      />
                    </div>

                    <h3 className="mt-5 text-base font-semibold text-white">
                      {module.title}
                    </h3>

                    <p className="mt-2 min-h-[72px] text-sm leading-6 text-slate-500">
                      {module.description}
                    </p>

                    <div className="mt-4 border-t border-slate-800 pt-4">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-600">
                        {module.stats}
                      </p>

                      <p
                        className={`mt-2 text-sm font-semibold ${styles.action}`}
                      >
                        {module.action} →
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* HOW GLYNAC WORKS */}
          <section className="mt-8 rounded-2xl border border-slate-800 bg-[#0c121f] p-6 lg:p-7">
            <div className="mb-7">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-400">
                Getting started
              </p>

              <h2 className="mt-2 text-xl font-semibold text-white">
                How Glynac works
              </h2>

              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                A simple workflow for managing and monitoring compliance
                operations.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {workflow.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div key={step.number} className="relative">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300">
                        <Icon size={19} />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold tracking-wider text-blue-400">
                            {step.number}
                          </span>

                          <h3 className="text-sm font-semibold text-white">
                            {step.title}
                          </h3>
                        </div>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {index < workflow.length - 1 && (
                      <div className="absolute left-[54px] top-[45px] hidden h-px w-10 bg-slate-800 xl:block" />
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* LOWER GRID */}
          <div className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            {/* RECENT ACTIVITY */}
            <section className="rounded-2xl border border-slate-800 bg-[#0c121f]">
              <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
                <div>
                  <h2 className="text-base font-semibold text-white">
                    Recent activity
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Latest activity across your workspace
                  </p>
                </div>

                <span className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Live
                </span>
              </div>

              <div className="divide-y divide-slate-800/70">
                {activities.map((activity) => {
                  const Icon = activity.icon;

                  return (
                    <div
                      key={activity.title}
                      className="flex items-center gap-4 px-6 py-4 transition hover:bg-slate-900/50"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-slate-400">
                        <Icon size={16} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-200">
                          {activity.title}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-slate-600">
                          {activity.description}
                        </p>
                      </div>

                      <span className="shrink-0 text-[11px] text-slate-600">
                        {activity.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* WORKSPACE STATUS */}
            <section className="rounded-2xl border border-slate-800 bg-[#0c121f] p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 size={20} />
                </div>

                <div>
                  <h2 className="text-base font-semibold text-white">
                    Workspace status
                  </h2>
                  <p className="text-xs text-slate-500">
                    Core platform services
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    Data Room
                  </span>

                  <span className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Operational
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    AI Compliance
                  </span>

                  <span className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Operational
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    Admin Services
                  </span>

                  <span className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Operational
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    Workflow Engine
                  </span>

                  <span className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Operational
                  </span>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-800 pt-5">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 transition hover:text-blue-300"
                >
                  View system health
                  <ArrowRight size={14} />
                </Link>
              </div>
            </section>
          </div>

          {/* FOOTER */}
          <footer className="mt-10 flex flex-col gap-2 border-t border-slate-800/70 py-6 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p>Glynac Wealth Management & Compliance Platform</p>

            <p>Frontend Engineering Platform</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
