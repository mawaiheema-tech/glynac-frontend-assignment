"use client";

import {
  Activity,
  AlertCircle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Database,
  Edit3,
  FileCheck2,
  Filter,
  Flag,
  Gauge,
  Globe2,
  LayoutDashboard,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  TrendingUp,
  UserCheck,
  UserCog,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";

/* =========================================================
   TYPES
========================================================= */

type UserStatus = "Active" | "Pending" | "Suspended";
type Severity = "Low" | "Medium" | "High" | "Critical";
type Permission = "Read" | "Write" | "Approve" | "Admin";

type UserRecord = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: UserStatus;
  lastActive: string;
  department: string;
};

type RuleRecord = {
  id: number;
  ruleId: string;
  name: string;
  description: string;
  severity: Severity;
  active: boolean;
  updated: string;
};

type AuditRecord = {
  id: number;
  user: string;
  action: string;
  target: string;
  type: string;
  time: string;
};

type FeatureFlag = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
};

/* =========================================================
   MOCK DATA
========================================================= */

const initialUsers: UserRecord[] = [
  {
    id: 1,
    name: "Sarah Mitchell",
    email: "sarah.mitchell@glynac.com",
    role: "Compliance Officer",
    status: "Active",
    lastActive: "2 min ago",
    department: "Compliance",
  },
  {
    id: 2,
    name: "Daniel Brooks",
    email: "daniel.brooks@glynac.com",
    role: "Risk Director",
    status: "Active",
    lastActive: "8 min ago",
    department: "Risk",
  },
  {
    id: 3,
    name: "Emily Carter",
    email: "emily.carter@glynac.com",
    role: "Advisor",
    status: "Active",
    lastActive: "14 min ago",
    department: "Advisory",
  },
  {
    id: 4,
    name: "Michael Chen",
    email: "michael.chen@glynac.com",
    role: "Auditor",
    status: "Pending",
    lastActive: "1 hour ago",
    department: "Audit",
  },
  {
    id: 5,
    name: "Olivia Wilson",
    email: "olivia.wilson@glynac.com",
    role: "Compliance Officer",
    status: "Active",
    lastActive: "2 hours ago",
    department: "Compliance",
  },
  {
    id: 6,
    name: "James Anderson",
    email: "james.anderson@glynac.com",
    role: "Advisor",
    status: "Suspended",
    lastActive: "Yesterday",
    department: "Advisory",
  },
  {
    id: 7,
    name: "Sophia Taylor",
    email: "sophia.taylor@glynac.com",
    role: "System Administrator",
    status: "Active",
    lastActive: "Yesterday",
    department: "IT",
  },
  {
    id: 8,
    name: "William Davis",
    email: "william.davis@glynac.com",
    role: "Auditor",
    status: "Active",
    lastActive: "Yesterday",
    department: "Audit",
  },
  {
    id: 9,
    name: "Ava Martinez",
    email: "ava.martinez@glynac.com",
    role: "Risk Analyst",
    status: "Pending",
    lastActive: "2 days ago",
    department: "Risk",
  },
  {
    id: 10,
    name: "Ethan Thomas",
    email: "ethan.thomas@glynac.com",
    role: "Advisor",
    status: "Active",
    lastActive: "2 days ago",
    department: "Advisory",
  },
  {
    id: 11,
    name: "Mia Robinson",
    email: "mia.robinson@glynac.com",
    role: "Compliance Officer",
    status: "Active",
    lastActive: "3 days ago",
    department: "Compliance",
  },
  {
    id: 12,
    name: "Noah Clark",
    email: "noah.clark@glynac.com",
    role: "Auditor",
    status: "Suspended",
    lastActive: "4 days ago",
    department: "Audit",
  },
];

const initialRules: RuleRecord[] = [
  {
    id: 1,
    ruleId: "FINRA-2210",
    name: "Communications with the Public",
    description:
      "Controls review requirements for retail communications and promotional material.",
    severity: "High",
    active: true,
    updated: "Today, 09:42",
  },
  {
    id: 2,
    ruleId: "SEC-17a-4",
    name: "Electronic Records Retention",
    description:
      "Defines electronic record retention and preservation requirements.",
    severity: "Critical",
    active: true,
    updated: "Yesterday, 16:18",
  },
  {
    id: 3,
    ruleId: "DISC-09",
    name: "Disclosure Completeness",
    description:
      "Validates required disclosures across investment and client-facing documents.",
    severity: "Medium",
    active: true,
    updated: "Yesterday, 13:27",
  },
  {
    id: 4,
    ruleId: "AML-204",
    name: "Transaction Monitoring",
    description:
      "Monitors transactions against configured compliance thresholds.",
    severity: "High",
    active: true,
    updated: "2 days ago",
  },
  {
    id: 5,
    ruleId: "KYC-112",
    name: "Client Verification",
    description:
      "Checks required identity verification fields before account activation.",
    severity: "Medium",
    active: false,
    updated: "4 days ago",
  },
];

const initialAuditLogs: AuditRecord[] = [
  {
    id: 1,
    user: "Sarah Mitchell",
    action: "Updated rule severity",
    target: "FINRA-2210",
    type: "Policy",
    time: "2 min ago",
  },
  {
    id: 2,
    user: "Daniel Brooks",
    action: "Changed user role",
    target: "Emily Carter",
    type: "RBAC",
    time: "8 min ago",
  },
  {
    id: 3,
    user: "Sophia Taylor",
    action: "Enabled feature flag",
    target: "Presidio PII Masking",
    type: "Configuration",
    time: "16 min ago",
  },
  {
    id: 4,
    user: "Olivia Wilson",
    action: "Reviewed compliance document",
    target: "Investment_Agreement_2026.pdf",
    type: "Review",
    time: "24 min ago",
  },
  {
    id: 5,
    user: "Michael Chen",
    action: "Downloaded report",
    target: "Q3 Compliance Report",
    type: "Document",
    time: "41 min ago",
  },
  {
    id: 6,
    user: "Sarah Mitchell",
    action: "Created custom rule",
    target: "DISC-10",
    type: "Policy",
    time: "1 hour ago",
  },
  {
    id: 7,
    user: "Sophia Taylor",
    action: "Updated system configuration",
    target: "API Gateway",
    type: "Configuration",
    time: "2 hours ago",
  },
  {
    id: 8,
    user: "Daniel Brooks",
    action: "Suspended user",
    target: "James Anderson",
    type: "RBAC",
    time: "3 hours ago",
  },
];

const initialFlags: FeatureFlag[] = [
  {
    id: "substring",
    name: "Enable AI Substring Validation",
    description:
      "Automatically validates sensitive phrases and compliance substrings in AI responses.",
    enabled: true,
  },
  {
    id: "presidio",
    name: "Enable Presidio PII Masking",
    description:
      "Masks personally identifiable information before sensitive content is processed.",
    enabled: true,
  },
  {
    id: "precedent",
    name: "Enable Precedent Lookup",
    description:
      "Allows the assistant to search historical compliance precedents.",
    enabled: false,
  },
];

/* =========================================================
   HELPERS
========================================================= */

const severityClasses: Record<Severity, string> = {
  Low: "bg-slate-500/10 text-slate-300 border-slate-500/20",
  Medium: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  High: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  Critical: "bg-red-500/10 text-red-300 border-red-500/20",
};

const statusClasses: Record<UserStatus, string> = {
  Active: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  Pending: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  Suspended: "bg-red-500/10 text-red-300 border-red-500/20",
};

const permissionModules = [
  "Data Room",
  "AI Compliance Chat",
  "Admin Panel",
  "Tree Editor",
];

const permissionTypes: Permission[] = [
  "Read",
  "Write",
  "Approve",
  "Admin",
];

const defaultPermissions: Record<
  string,
  Record<string, Permission[]>
> = {
  "System Administrator": {
    "Data Room": ["Read", "Write", "Approve", "Admin"],
    "AI Compliance Chat": ["Read", "Write", "Approve", "Admin"],
    "Admin Panel": ["Read", "Write", "Approve", "Admin"],
    "Tree Editor": ["Read", "Write", "Approve", "Admin"],
  },
  "Compliance Officer": {
    "Data Room": ["Read", "Write", "Approve"],
    "AI Compliance Chat": ["Read", "Write"],
    "Admin Panel": ["Read"],
    "Tree Editor": ["Read", "Write"],
  },
  Advisor: {
    "Data Room": ["Read"],
    "AI Compliance Chat": ["Read", "Write"],
    "Admin Panel": [],
    "Tree Editor": ["Read"],
  },
  Auditor: {
    "Data Room": ["Read"],
    "AI Compliance Chat": ["Read"],
    "Admin Panel": ["Read"],
    "Tree Editor": ["Read"],
  },
};

/* =========================================================
   SMALL UI COMPONENTS
========================================================= */

function SectionHeader({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-blue-300">
          {icon}
        </div>

        <div>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>
      </div>

      {action}
    </div>
  );
}

function StatusBadge({ status }: { status: UserStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusClasses[status]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "Active"
            ? "bg-emerald-400"
            : status === "Pending"
              ? "bg-amber-400"
              : "bg-red-400"
        }`}
      />
      {status}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${severityClasses[severity]}`}
    >
      {severity}
    </span>
  );
}

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full border transition ${
        enabled
          ? "border-blue-400/30 bg-blue-500"
          : "border-white/10 bg-white/10"
      }`}
      aria-label={enabled ? "Disable" : "Enable"}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
          enabled ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function AdminPage() {
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);
  const [rules, setRules] = useState<RuleRecord[]>(initialRules);
  const [auditLogs, setAuditLogs] =
    useState<AuditRecord[]>(initialAuditLogs);
  const [flags, setFlags] = useState<FeatureFlag[]>(initialFlags);

  const [userSearch, setUserSearch] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState<
    "All" | UserStatus
  >("All");
  const [userSort, setUserSort] = useState<"name" | "role" | "status">(
    "name",
  );
  const [sortAscending, setSortAscending] = useState(true);
  const [userPage, setUserPage] = useState(1);

  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(
    null,
  );

  const [permissions, setPermissions] = useState<
    Record<string, Record<string, Permission[]>>
  >(defaultPermissions);

  const [ruleSearch, setRuleSearch] = useState("");
  const [ruleSeverityFilter, setRuleSeverityFilter] = useState<
    "All" | Severity
  >("All");

  const [auditFilter, setAuditFilter] = useState("All");

  const [showAddRule, setShowAddRule] = useState(false);
  const [newRuleId, setNewRuleId] = useState("");
  const [newRuleName, setNewRuleName] = useState("");
  const [newRuleDescription, setNewRuleDescription] = useState("");
  const [newRuleSeverity, setNewRuleSeverity] =
    useState<Severity>("Medium");

  const [notification, setNotification] = useState("");

  const usersPerPage = 5;

  /* =======================================================
     NOTIFICATION
  ======================================================= */

  const notify = (message: string) => {
    setNotification(message);

    window.setTimeout(() => {
      setNotification("");
    }, 2500);
  };

  /* =======================================================
     USER MANAGEMENT
  ======================================================= */

  const filteredUsers = useMemo(() => {
    const query = userSearch.toLowerCase().trim();

    const filtered = users.filter((user) => {
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query) ||
        user.department.toLowerCase().includes(query);

      const matchesStatus =
        userStatusFilter === "All" ||
        user.status === userStatusFilter;

      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      const first = a[userSort].toLowerCase();
      const second = b[userSort].toLowerCase();

      return sortAscending
        ? first.localeCompare(second)
        : second.localeCompare(first);
    });

    return filtered;
  }, [
    users,
    userSearch,
    userStatusFilter,
    userSort,
    sortAscending,
  ]);

  const totalUserPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / usersPerPage),
  );

  const visibleUsers = filteredUsers.slice(
    (userPage - 1) * usersPerPage,
    userPage * usersPerPage,
  );

  const changeUserRole = (role: string) => {
    if (!selectedUser) return;

    setUsers((current) =>
      current.map((user) =>
        user.id === selectedUser.id ? { ...user, role } : user,
      ),
    );

    setSelectedUser((current) =>
      current ? { ...current, role } : current,
    );

    notify(`Role updated to ${role}`);
  };

  const togglePermission = (
    moduleName: string,
    permission: Permission,
  ) => {
    if (!selectedUser) return;

    const role = selectedUser.role;

    setPermissions((current) => {
      const currentRole = current[role] || {};
      const currentModule = currentRole[moduleName] || [];

      const hasPermission = currentModule.includes(permission);

      return {
        ...current,
        [role]: {
          ...currentRole,
          [moduleName]: hasPermission
            ? currentModule.filter((item) => item !== permission)
            : [...currentModule, permission],
        },
      };
    });
  };

  /* =======================================================
     RULE MANAGEMENT
  ======================================================= */

  const filteredRules = rules.filter((rule) => {
    const query = ruleSearch.toLowerCase().trim();

    const matchesSearch =
      !query ||
      rule.ruleId.toLowerCase().includes(query) ||
      rule.name.toLowerCase().includes(query) ||
      rule.description.toLowerCase().includes(query);

    const matchesSeverity =
      ruleSeverityFilter === "All" ||
      rule.severity === ruleSeverityFilter;

    return matchesSearch && matchesSeverity;
  });

  const updateRuleSeverity = (
    ruleId: number,
    severity: Severity,
  ) => {
    setRules((current) =>
      current.map((rule) =>
        rule.id === ruleId ? { ...rule, severity } : rule,
      ),
    );

    notify("Rule severity updated");
  };

  const toggleRule = (ruleId: number) => {
    setRules((current) =>
      current.map((rule) =>
        rule.id === ruleId
          ? { ...rule, active: !rule.active }
          : rule,
      ),
    );

    notify("Rule status updated");
  };

  const deleteRule = (ruleId: number) => {
    setRules((current) =>
      current.filter((rule) => rule.id !== ruleId),
    );

    notify("Custom rule removed");
  };

  const addRule = () => {
    if (!newRuleId.trim() || !newRuleName.trim()) {
      notify("Rule ID and name are required");
      return;
    }

    const newRule: RuleRecord = {
      id: Date.now(),
      ruleId: newRuleId.trim().toUpperCase(),
      name: newRuleName.trim(),
      description:
        newRuleDescription.trim() ||
        "Custom compliance rule definition.",
      severity: newRuleSeverity,
      active: true,
      updated: "Just now",
    };

    setRules((current) => [newRule, ...current]);

    setNewRuleId("");
    setNewRuleName("");
    setNewRuleDescription("");
    setNewRuleSeverity("Medium");
    setShowAddRule(false);

    notify("Custom compliance rule created");
  };

  /* =======================================================
     FEATURE FLAGS
  ======================================================= */

  const toggleFlag = (id: string) => {
    setFlags((current) =>
      current.map((flag) =>
        flag.id === id
          ? { ...flag, enabled: !flag.enabled }
          : flag,
      ),
    );

    const flag = flags.find((item) => item.id === id);

    if (flag) {
      notify(
        `${flag.name} ${flag.enabled ? "disabled" : "enabled"}`,
      );
    }
  };

  /* =======================================================
     AUDIT LOGS
  ======================================================= */

  const auditTypes = [
    "All",
    "RBAC",
    "Policy",
    "Configuration",
    "Review",
    "Document",
  ];

  const filteredAuditLogs =
    auditFilter === "All"
      ? auditLogs
      : auditLogs.filter((log) => log.type === auditFilter);

  /* =======================================================
     CHART DATA
  ======================================================= */

  const reviewData = [
    { month: "Apr", value: 420 },
    { month: "May", value: 510 },
    { month: "Jun", value: 470 },
    { month: "Jul", value: 650 },
    { month: "Aug", value: 720 },
    { month: "Sep", value: 840 },
  ];

  const violations = [
    { label: "FINRA-2210", value: 38 },
    { label: "SEC-17a-4", value: 24 },
    { label: "DISC-09", value: 19 },
    { label: "AML-204", value: 12 },
    { label: "Other", value: 7 },
  ];

  const maxReview = Math.max(
    ...reviewData.map((item) => item.value),
  );

  const totalViolations = violations.reduce(
    (sum, item) => sum + item.value,
    0,
  );

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      {/* TOP HEADER */}

      <div className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#070b14]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10">
              <ShieldCheck className="h-5 w-5 text-blue-300" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">
                  Enterprise Admin
                </h1>

                <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-blue-300">
                  Control Center
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Governance, compliance and platform operations
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/5 px-3 py-1.5 text-xs text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              All systems operational
            </div>

            <button
              onClick={() => notify("Dashboard refreshed")}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:bg-white/[0.07] hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] space-y-7 px-4 py-6 sm:px-6 lg:px-8">
        {/* =================================================
            PAGE INTRO
        ================================================= */}

        <section>
          <div className="mb-1 flex items-center gap-2 text-xs text-blue-300">
            <LayoutDashboard className="h-3.5 w-3.5" />
            Administration
          </div>

          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Platform Overview
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Monitor compliance operations, manage access policies,
            review system activity and control platform configuration
            from one centralized workspace.
          </p>
        </section>

        {/* =================================================
            METRIC CARDS
        ================================================= */}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Total Documents Reviewed",
              value: "12,846",
              change: "+12.8%",
              icon: FileCheck2,
              note: "vs previous period",
            },
            {
              title: "Compliance Violations",
              value: "1,284",
              change: "-8.4%",
              icon: AlertCircle,
              note: "vs previous period",
            },
            {
              title: "Pass Rate",
              value: "94.7%",
              change: "+2.1%",
              icon: CheckCircle2,
              note: "review accuracy",
            },
            {
              title: "Average Review Time",
              value: "4m 32s",
              change: "-14.6%",
              icon: Clock3,
              note: "per document",
            },
          ].map((metric) => {
            const Icon = metric.icon;

            return (
              <div
                key={metric.title}
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition hover:border-white/[0.14] hover:bg-white/[0.04]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-blue-300">
                    <Icon className="h-5 w-5" />
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-300">
                    <TrendingUp className="h-3 w-3" />
                    {metric.change}
                  </span>
                </div>

                <p className="mt-5 text-xs text-slate-500">
                  {metric.title}
                </p>

                <div className="mt-1 flex items-end justify-between gap-3">
                  <p className="text-2xl font-semibold tracking-tight">
                    {metric.value}
                  </p>

                  <span className="text-[10px] text-slate-600">
                    {metric.note}
                  </span>
                </div>
              </div>
            );
          })}
        </section>

        {/* =================================================
            ANALYTICS
        ================================================= */}

        <section className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
          {/* REVIEW TREND */}

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
            <SectionHeader
              icon={<BarChart3 className="h-4 w-4" />}
              title="Review Trends"
              description="Documents reviewed across the last six months."
              action={
                <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-300">
                  Last 6 months
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              }
            />

            <div className="relative h-[270px]">
              <div className="absolute inset-0 flex flex-col justify-between">
                {[1000, 750, 500, 250, 0].map((value) => (
                  <div
                    key={value}
                    className="flex items-center gap-3"
                  >
                    <span className="w-8 text-right text-[10px] text-slate-600">
                      {value}
                    </span>
                    <div className="h-px flex-1 bg-white/[0.05]" />
                  </div>
                ))}
              </div>

              <svg
                viewBox="0 0 700 240"
                preserveAspectRatio="none"
                className="absolute left-11 right-0 top-2 h-[225px] w-[calc(100%-44px)] overflow-visible"
              >
                <defs>
                  <linearGradient
                    id="reviewGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="currentColor"
                      stopOpacity="0.22"
                    />
                    <stop
                      offset="100%"
                      stopColor="currentColor"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>

                <path
                  d={reviewData
                    .map((item, index) => {
                      const x =
                        (index / (reviewData.length - 1)) * 700;

                      const y =
                        225 -
                        (item.value / 1000) * 205;

                      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-blue-400"
                />

                <path
                  d={`${reviewData
                    .map((item, index) => {
                      const x =
                        (index / (reviewData.length - 1)) * 700;

                      const y =
                        225 -
                        (item.value / 1000) * 205;

                      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
                    })
                    .join(
                      " ",
                    )} L 700 225 L 0 225 Z`}
                  fill="url(#reviewGradient)"
                  className="text-blue-400"
                />

                {reviewData.map((item, index) => {
                  const x =
                    (index / (reviewData.length - 1)) * 700;

                  const y =
                    225 -
                    (item.value / 1000) * 205;

                  return (
                    <g key={item.month}>
                      <circle
                        cx={x}
                        cy={y}
                        r="5"
                        fill="#0b1020"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-blue-400"
                      />
                    </g>
                  );
                })}
              </svg>

              <div className="absolute bottom-0 left-11 right-0 flex justify-between">
                {reviewData.map((item) => (
                  <span
                    key={item.month}
                    className="text-[10px] text-slate-600"
                  >
                    {item.month}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              Documents reviewed
              <span className="ml-auto font-medium text-white">
                {reviewData[reviewData.length - 1].value} this month
              </span>
            </div>
          </div>

          {/* VIOLATION DISTRIBUTION */}

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
            <SectionHeader
              icon={<AlertCircle className="h-4 w-4" />}
              title="Rule Violations"
              description="Distribution by compliance rule."
            />

            <div className="flex items-center justify-center py-4">
              <div
                className="relative flex h-44 w-44 items-center justify-center rounded-full"
                style={{
                  background:
                    "conic-gradient(#60a5fa 0deg 137deg, #818cf8 137deg 223deg, #34d399 223deg 291deg, #fbbf24 291deg 334deg, #f87171 334deg 360deg)",
                }}
              >
                <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-[#0b1020]">
                  <span className="text-2xl font-semibold">
                    {totalViolations}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    total flags
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {violations.map((item, index) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3"
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      [
                        "bg-blue-400",
                        "bg-indigo-400",
                        "bg-emerald-400",
                        "bg-amber-400",
                        "bg-red-400",
                      ][index]
                    }`}
                  />

                  <span className="flex-1 text-xs text-slate-400">
                    {item.label}
                  </span>

                  <span className="text-xs font-medium text-white">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =================================================
            USER MANAGEMENT
        ================================================= */}

        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
          <SectionHeader
            icon={<Users className="h-4 w-4" />}
            title="User & RBAC Management"
            description="Manage employee access, roles and account status."
            action={
              <button
                onClick={() => notify("Invite flow opened")}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-400"
              >
                <Plus className="h-3.5 w-3.5" />
                Invite User
              </button>
            }
          />

          <div className="mb-5 flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

              <input
                value={userSearch}
                onChange={(event) => {
                  setUserSearch(event.target.value);
                  setUserPage(1);
                }}
                placeholder="Search by name, email, role or department..."
                className="h-10 w-full rounded-lg border border-white/10 bg-black/10 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-600 focus:border-blue-400/40"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />

              <select
                value={userStatusFilter}
                onChange={(event) => {
                  setUserStatusFilter(
                    event.target.value as "All" | UserStatus,
                  );
                  setUserPage(1);
                }}
                className="h-10 min-w-[145px] appearance-none rounded-lg border border-white/10 bg-[#0b1020] pl-9 pr-8 text-xs text-slate-300 outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-white/[0.06] text-left">
                  {[
                    ["name", "User"],
                    ["role", "Role"],
                    ["status", "Status"],
                  ].map(([key, label]) => (
                    <th
                      key={key}
                      className="pb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-600"
                    >
                      <button
                        onClick={() => {
                          if (userSort === key) {
                            setSortAscending((current) => !current);
                          } else {
                            setUserSort(
                              key as "name" | "role" | "status",
                            );
                            setSortAscending(true);
                          }
                        }}
                        className="flex items-center gap-1.5"
                      >
                        {label}

                        {userSort === key &&
                          (sortAscending ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          ))}
                      </button>
                    </th>
                  ))}

                  <th className="pb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                    Department
                  </th>

                  <th className="pb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                    Last Active
                  </th>

                  <th className="pb-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {visibleUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-white/[0.05] last:border-0"
                  >
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-[10px] font-semibold text-blue-300">
                          {user.name
                            .split(" ")
                            .map((part) => part[0])
                            .join("")}
                        </div>

                        <div>
                          <p className="text-xs font-medium text-white">
                            {user.name}
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-600">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 text-xs text-slate-300">
                      {user.role}
                    </td>

                    <td className="py-4">
                      <StatusBadge status={user.status} />
                    </td>

                    <td className="py-4 text-xs text-slate-400">
                      {user.department}
                    </td>

                    <td className="py-4 text-xs text-slate-500">
                      {user.lastActive}
                    </td>

                    <td className="py-4 text-right">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
                      >
                        <UserCog className="h-3.5 w-3.5" />
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}

                {visibleUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-sm text-slate-500"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
            <p className="text-[11px] text-slate-600">
              Showing{" "}
              <span className="text-slate-400">
                {visibleUsers.length}
              </span>{" "}
              of{" "}
              <span className="text-slate-400">
                {filteredUsers.length}
              </span>{" "}
              users
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={userPage === 1}
                onClick={() =>
                  setUserPage((current) => Math.max(1, current - 1))
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="text-xs text-slate-400">
                {userPage} / {totalUserPages}
              </span>

              <button
                disabled={userPage === totalUserPages}
                onClick={() =>
                  setUserPage((current) =>
                    Math.min(totalUserPages, current + 1),
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* =================================================
            COMPLIANCE RULES
        ================================================= */}

        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
          <SectionHeader
            icon={<Shield className="h-4 w-4" />}
            title="Compliance Rule Policy Manager"
            description="Configure active SEC, FINRA and internal compliance policies."
            action={
              <button
                onClick={() => setShowAddRule(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-white transition hover:bg-white/[0.08]"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Rule
              </button>
            }
          />

          <div className="mb-5 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

              <input
                value={ruleSearch}
                onChange={(event) =>
                  setRuleSearch(event.target.value)
                }
                placeholder="Search rule ID or definition..."
                className="h-10 w-full rounded-lg border border-white/10 bg-black/10 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-600 focus:border-blue-400/40"
              />
            </div>

            <div className="relative">
              <select
                value={ruleSeverityFilter}
                onChange={(event) =>
                  setRuleSeverityFilter(
                    event.target.value as "All" | Severity,
                  )
                }
                className="h-10 min-w-[145px] appearance-none rounded-lg border border-white/10 bg-[#0b1020] px-3 pr-8 text-xs text-slate-300 outline-none"
              >
                <option value="All">All Severity</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
            </div>
          </div>

          <div className="space-y-2">
            {filteredRules.map((rule) => (
              <div
                key={rule.id}
                className="group flex flex-col gap-4 rounded-xl border border-white/[0.06] bg-black/10 p-4 transition hover:border-white/[0.11] lg:flex-row lg:items-center"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
                    <Shield className="h-4 w-4 text-blue-300" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-blue-300">
                        {rule.ruleId}
                      </span>

                      <SeverityBadge severity={rule.severity} />

                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
                          rule.active
                            ? "bg-emerald-500/10 text-emerald-300"
                            : "bg-slate-500/10 text-slate-500"
                        }`}
                      >
                        {rule.active ? "Active" : "Disabled"}
                      </span>
                    </div>

                    <h3 className="mt-1 text-sm font-medium text-white">
                      {rule.name}
                    </h3>

                    <p className="mt-1 max-w-2xl text-[11px] leading-5 text-slate-500">
                      {rule.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <select
                      value={rule.severity}
                      onChange={(event) =>
                        updateRuleSeverity(
                          rule.id,
                          event.target.value as Severity,
                        )
                      }
                      className="h-9 appearance-none rounded-lg border border-white/10 bg-[#0b1020] px-3 pr-8 text-[11px] text-slate-300 outline-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-600" />
                  </div>

                  <Toggle
                    enabled={rule.active}
                    onChange={() => toggleRule(rule.id)}
                  />

                  <span className="hidden text-[10px] text-slate-600 xl:inline">
                    {rule.updated}
                  </span>

                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-500 transition hover:border-red-400/20 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {filteredRules.length === 0 && (
              <div className="py-10 text-center text-sm text-slate-500">
                No compliance rules found.
              </div>
            )}
          </div>
        </section>

        {/* =================================================
            SYSTEM HEALTH
        ================================================= */}

        <section>
          <SectionHeader
            icon={<Activity className="h-4 w-4" />}
            title="System Health"
            description="Live operational indicators for critical platform services."
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-300">
                  <Gauge className="h-4 w-4" />
                </div>

                <span className="text-[10px] text-emerald-300">
                  Healthy
                </span>
              </div>

              <p className="mt-5 text-xs text-slate-500">
                API Latency
              </p>

              <div className="mt-1 flex items-end gap-2">
                <span className="text-2xl font-semibold">128</span>
                <span className="mb-1 text-xs text-slate-500">
                  ms
                </span>
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full w-[26%] rounded-full bg-emerald-400" />
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300">
                  <Database className="h-4 w-4" />
                </div>

                <span className="flex items-center gap-1.5 text-[10px] text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Connected
                </span>
              </div>

              <p className="mt-5 text-xs text-slate-500">
                Database Connection
              </p>

              <div className="mt-1 text-2xl font-semibold">
                Operational
              </div>

              <p className="mt-2 text-[10px] text-slate-600">
                Last checked less than 1 minute ago
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-300">
                  <Zap className="h-4 w-4" />
                </div>

                <span className="text-[10px] text-emerald-300">
                  Within target
                </span>
              </div>

              <p className="mt-5 text-xs text-slate-500">
                Error Rate
              </p>

              <div className="mt-1 flex items-end gap-2">
                <span className="text-2xl font-semibold">
                  0.18%
                </span>
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full w-[9%] rounded-full bg-emerald-400" />
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            AUDIT + FEATURE FLAGS
        ================================================= */}

        <section className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
          {/* AUDIT LOG */}

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
            <SectionHeader
              icon={<Activity className="h-4 w-4" />}
              title="Audit Activity"
              description="Recent administrative and compliance actions."
              action={
                <div className="relative">
                  <select
                    value={auditFilter}
                    onChange={(event) =>
                      setAuditFilter(event.target.value)
                    }
                    className="h-9 appearance-none rounded-lg border border-white/10 bg-[#0b1020] px-3 pr-8 text-[11px] text-slate-300 outline-none"
                  >
                    {auditTypes.map((type) => (
                      <option key={type} value={type}>
                        {type === "All" ? "All activity" : type}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-600" />
                </div>
              }
            />

            <div className="space-y-1">
              {filteredAuditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center gap-3 rounded-xl px-2 py-3 transition hover:bg-white/[0.025]"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                    <Activity className="h-3.5 w-3.5 text-blue-300" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-slate-300">
                      <span className="font-medium text-white">
                        {log.user}
                      </span>{" "}
                      {log.action}
                    </p>

                    <p className="mt-0.5 truncate text-[10px] text-slate-600">
                      {log.target}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="rounded-full border border-white/[0.06] px-2 py-0.5 text-[9px] text-slate-500">
                      {log.type}
                    </span>

                    <p className="mt-1 text-[10px] text-slate-600">
                      {log.time}
                    </p>
                  </div>
                </div>
              ))}

              {filteredAuditLogs.length === 0 && (
                <div className="py-10 text-center text-sm text-slate-500">
                  No activity found.
                </div>
              )}
            </div>
          </div>

          {/* FEATURE FLAGS */}

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
            <SectionHeader
              icon={<Flag className="h-4 w-4" />}
              title="Feature Flags"
              description="Control system-wide experimental and security features."
            />

            <div className="space-y-3">
              {flags.map((flag) => (
                <div
                  key={flag.id}
                  className="rounded-xl border border-white/[0.06] bg-black/10 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          flag.enabled
                            ? "bg-blue-500/10 text-blue-300"
                            : "bg-white/[0.04] text-slate-500"
                        }`}
                      >
                        <Settings2 className="h-3.5 w-3.5" />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-white">
                          {flag.name}
                        </p>

                        <p className="mt-1 text-[10px] leading-5 text-slate-600">
                          {flag.description}
                        </p>
                      </div>
                    </div>

                    <Toggle
                      enabled={flag.enabled}
                      onChange={() => toggleFlag(flag.id)}
                    />
                  </div>

                  <div className="mt-3 flex items-center gap-2 border-t border-white/[0.05] pt-3">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        flag.enabled
                          ? "bg-emerald-400"
                          : "bg-slate-600"
                      }`}
                    />

                    <span
                      className={`text-[10px] ${
                        flag.enabled
                          ? "text-emerald-300"
                          : "text-slate-600"
                      }`}
                    >
                      {flag.enabled ? "Enabled" : "Disabled"}
                    </span>

                    <span className="ml-auto text-[9px] text-slate-700">
                      Instant state update
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="flex flex-col gap-2 border-t border-white/[0.06] py-5 text-[10px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Glynac Enterprise Administration • Local mock state
          </span>

          <span className="flex items-center gap-2">
            <Globe2 className="h-3 w-3" />
            Production workspace simulation
          </span>
        </div>
      </div>

      {/* ===================================================
          RBAC MODAL
      =================================================== */}

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1020] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.08] bg-[#0b1020]/95 px-5 py-4 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-sm font-semibold text-blue-300">
                  {selectedUser.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Role & Permission Editor
                  </h3>

                  <p className="mt-0.5 text-[10px] text-slate-500">
                    {selectedUser.name} • {selectedUser.email}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/[0.06] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-6 p-5">
              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                  Assigned Role
                </label>

                <div className="relative max-w-sm">
                  <select
                    value={selectedUser.role}
                    onChange={(event) =>
                      changeUserRole(event.target.value)
                    }
                    className="h-10 w-full appearance-none rounded-lg border border-white/10 bg-black/20 px-3 pr-8 text-xs text-white outline-none focus:border-blue-400/40"
                  >
                    <option value="System Administrator">
                      System Administrator
                    </option>
                    <option value="Compliance Officer">
                      Compliance Officer
                    </option>
                    <option value="Risk Director">
                      Risk Director
                    </option>
                    <option value="Risk Analyst">Risk Analyst</option>
                    <option value="Advisor">Advisor</option>
                    <option value="Auditor">Auditor</option>
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
                </div>
              </div>

              <div>
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-white">
                    Granular Permissions
                  </h4>

                  <p className="mt-1 text-[11px] text-slate-500">
                    Configure Read, Write, Approve and Admin access
                    for each platform module.
                  </p>
                </div>

                <div className="overflow-x-auto rounded-xl border border-white/[0.07]">
                  <table className="w-full min-w-[650px]">
                    <thead>
                      <tr className="border-b border-white/[0.07] bg-white/[0.02]">
                        <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-slate-600">
                          Module
                        </th>

                        {permissionTypes.map((permission) => (
                          <th
                            key={permission}
                            className="px-4 py-3 text-center text-[10px] uppercase tracking-wider text-slate-600"
                          >
                            {permission}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {permissionModules.map((moduleName) => {
                        const rolePermissions =
                          permissions[selectedUser.role] || {};

                        const modulePermissions =
                          rolePermissions[moduleName] || [];

                        return (
                          <tr
                            key={moduleName}
                            className="border-b border-white/[0.05] last:border-0"
                          >
                            <td className="px-4 py-4 text-xs font-medium text-white">
                              {moduleName}
                            </td>

                            {permissionTypes.map((permission) => {
                              const checked =
                                modulePermissions.includes(
                                  permission,
                                );

                              return (
                                <td
                                  key={permission}
                                  className="px-4 py-4 text-center"
                                >
                                  <button
                                    onClick={() =>
                                      togglePermission(
                                        moduleName,
                                        permission,
                                      )
                                    }
                                    className={`mx-auto flex h-7 w-7 items-center justify-center rounded-lg border transition ${
                                      checked
                                        ? "border-blue-400/30 bg-blue-500/15 text-blue-300"
                                        : "border-white/10 bg-white/[0.02] text-slate-700 hover:text-slate-400"
                                    }`}
                                  >
                                    {checked && (
                                      <Check className="h-3.5 w-3.5" />
                                    )}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-blue-400/10 bg-blue-500/[0.04] p-4">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" />

                  <div>
                    <p className="text-xs font-medium text-blue-200">
                      Local permission state
                    </p>

                    <p className="mt-1 text-[10px] leading-5 text-slate-500">
                      Changes are reflected immediately in this
                      frontend simulation.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedUser(null)}
                  className="rounded-lg bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-400"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          ADD RULE MODAL
      =================================================== */}

      {showAddRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0b1020] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Add Custom Compliance Rule
                </h3>

                <p className="mt-1 text-[10px] text-slate-500">
                  Create a local rule definition for the platform.
                </p>
              </div>

              <button
                onClick={() => setShowAddRule(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white/[0.06] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                  Rule ID
                </label>

                <input
                  value={newRuleId}
                  onChange={(event) =>
                    setNewRuleId(event.target.value)
                  }
                  placeholder="e.g. DISC-10"
                  className="h-10 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-xs text-white outline-none placeholder:text-slate-700 focus:border-blue-400/40"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                  Rule Name
                </label>

                <input
                  value={newRuleName}
                  onChange={(event) =>
                    setNewRuleName(event.target.value)
                  }
                  placeholder="Rule definition name"
                  className="h-10 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-xs text-white outline-none placeholder:text-slate-700 focus:border-blue-400/40"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                  Description
                </label>

                <textarea
                  value={newRuleDescription}
                  onChange={(event) =>
                    setNewRuleDescription(event.target.value)
                  }
                  placeholder="Describe what this rule validates..."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-xs text-white outline-none placeholder:text-slate-700 focus:border-blue-400/40"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                  Severity
                </label>

                <div className="relative">
                  <select
                    value={newRuleSeverity}
                    onChange={(event) =>
                      setNewRuleSeverity(
                        event.target.value as Severity,
                      )
                    }
                    className="h-10 w-full appearance-none rounded-lg border border-white/10 bg-black/20 px-3 pr-8 text-xs text-white outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-white/[0.06] pt-4">
                <button
                  onClick={() => setShowAddRule(false)}
                  className="rounded-lg border border-white/10 px-4 py-2 text-xs text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
                >
                  Cancel
                </button>

                <button
                  onClick={addRule}
                  className="rounded-lg bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-400"
                >
                  Create Rule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          NOTIFICATION
      =================================================== */}

      {notification && (
        <div className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-[#0d1720] px-4 py-3 shadow-2xl">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />

          <span className="text-xs text-slate-200">
            {notification}
          </span>
        </div>
      )}
    </main>
  );
}