"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    name: "Data Room",
    href: "/data-room",
    icon: "📁",
  },
  {
    name: "AI Compliance Chat",
    href: "/chat",
    icon: "💬",
  },
  {
    name: "Admin Panel",
    href: "/admin",
    icon: "⚙️",
  },
  {
    name: "Tree Editor",
    href: "/tree-editor",
    icon: "🌳",
  },
];

export default function Home() {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      
      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-900">
        
        {/* Logo */}
        <div className="flex h-20 items-center border-b border-slate-800 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold">
            G
          </div>

          <div className="ml-3">
            <h1 className="text-lg font-bold">GLYNAC</h1>
            <p className="text-xs text-slate-400">
              Wealth & Compliance
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 px-4 py-6">
          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Platform
          </p>

          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-800/60 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold">
              H
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                Heema
              </p>
              <p className="truncate text-xs text-slate-400">
                Frontend Intern
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="ml-64 flex min-h-screen flex-1 flex-col">
        
        {/* TOP BAR */}
        <header className="flex h-20 items-center justify-between border-b border-slate-800 bg-slate-900/80 px-8 backdrop-blur">
          <div>
            <h2 className="text-xl font-semibold">
              Glynac Compliance Platform
            </h2>
            <p className="text-sm text-slate-400">
              Enterprise workspace
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">
              🔔
            </button>

            <div className="text-right">
              <p className="text-sm font-medium">Heema</p>
              <p className="text-xs text-slate-500">
                Frontend Intern
              </p>
            </div>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <section className="flex-1 p-8">
          <div className="mb-8">
            <p className="mb-2 text-sm font-medium text-blue-400">
              Welcome back
            </p>

            <h1 className="text-3xl font-bold">
              Glynac Platform
            </h1>

            <p className="mt-2 max-w-2xl text-slate-400">
              Enterprise-grade wealth management and compliance
              workspace.
            </p>
          </div>

          {/* MODULE CARDS */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            
            <Link
              href="/data-room"
              className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-blue-500"
            >
              <div className="mb-5 text-3xl">📁</div>

              <h3 className="text-lg font-semibold">
                Virtual Data Room
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Manage secure documents, permissions and audit
                trails.
              </p>

              <p className="mt-5 text-sm font-medium text-blue-400">
                Open Data Room →
              </p>
            </Link>

            <Link
              href="/chat"
              className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-blue-500"
            >
              <div className="mb-5 text-3xl">💬</div>

              <h3 className="text-lg font-semibold">
                AI Compliance Chat
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Chat with the compliance assistant and explore
                document citations.
              </p>

              <p className="mt-5 text-sm font-medium text-blue-400">
                Open Chat →
              </p>
            </Link>

            <Link
              href="/admin"
              className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-blue-500"
            >
              <div className="mb-5 text-3xl">⚙️</div>

              <h3 className="text-lg font-semibold">
                Admin Panel
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Manage users, RBAC, compliance rules and
                analytics.
              </p>

              <p className="mt-5 text-sm font-medium text-blue-400">
                Open Admin →
              </p>
            </Link>

            <Link
              href="/tree-editor"
              className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-blue-500"
            >
              <div className="mb-5 text-3xl">🌳</div>

              <h3 className="text-lg font-semibold">
                Tree Editor
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Build and manage interactive compliance
                workflows.
              </p>

              <p className="mt-5 text-sm font-medium text-blue-400">
                Open Tree Editor →
              </p>
            </Link>

          </div>
        </section>
      </main>
    </div>
  );
}