"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Download,
  Eye,
  File,
  FileCode2,
  FileImage,
  FileJson,
  FileText,
  Folder,
  FolderOpen,
  Grid2X2,
  History,
  LayoutList,
  Lock,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings2,
  Shield,
  SlidersHorizontal,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";

import {
  mockDocuments,
  mockFolders,
  type DocumentItem,
  type FolderItem,
  type SecurityLevel,
} from "@/data/mockDocs";

import { useMemo, useState } from "react";

type Role =
  | "Admin"
  | "Compliance Officer"
  | "Advisor"
  | "Auditor";

type Permission = "view" | "edit" | "share";

type PermissionState = Record<Role, Record<Permission, boolean>>;

type SortOption =
  | "name"
  | "date"
  | "type"
  | "security";

type AuditAction =
  | "Uploaded"
  | "Viewed"
  | "Downloaded"
  | "Flagged"
  | "Permission Changed";

type AuditLog = {
  id: string;
  action: AuditAction;
  document: string;
  user: string;
  timestamp: string;
};

const roles: Role[] = [
  "Admin",
  "Compliance Officer",
  "Advisor",
  "Auditor",
];

const securityLevels: SecurityLevel[] = [
  "Confidential",
  "Public",
  "Internal Only",
  "Restricted",
];

const defaultPermissions: PermissionState = {
  Admin: {
    view: true,
    edit: true,
    share: true,
  },
  "Compliance Officer": {
    view: true,
    edit: true,
    share: true,
  },
  Advisor: {
    view: true,
    edit: false,
    share: false,
  },
  Auditor: {
    view: true,
    edit: false,
    share: false,
  },
};

const initialAuditLogs: AuditLog[] = [
  {
    id: "audit-1",
    action: "Uploaded",
    document: "Q4 Financial Report.pdf",
    user: "Sarah Wilson",
    timestamp: "Sep 18, 2026 • 09:42 AM",
  },
  {
    id: "audit-2",
    action: "Viewed",
    document: "Compliance Guidelines.md",
    user: "Heema",
    timestamp: "Sep 18, 2026 • 10:15 AM",
  },
  {
    id: "audit-3",
    action: "Permission Changed",
    document: "Investment Policy.txt",
    user: "Heema",
    timestamp: "Sep 18, 2026 • 11:03 AM",
  },
  {
    id: "audit-4",
    action: "Downloaded",
    document: "Client Overview.json",
    user: "James Carter",
    timestamp: "Sep 18, 2026 • 11:27 AM",
  },
];

const securityStyles: Record<
  SecurityLevel,
  {
    badge: string;
    icon: string;
    dot: string;
  }
> = {
  Confidential: {
    badge: "border-red-500/20 bg-red-500/10 text-red-400",
    icon: "text-red-400",
    dot: "bg-red-400",
  },
  Public: {
    badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    icon: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  "Internal Only": {
    badge: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    icon: "text-blue-400",
    dot: "bg-blue-400",
  },
  Restricted: {
    badge: "border-purple-500/20 bg-purple-500/10 text-purple-400",
    icon: "text-purple-400",
    dot: "bg-purple-400",
  },
};

function clonePermissions(
  permissions: PermissionState
): PermissionState {
  return JSON.parse(JSON.stringify(permissions));
}

function getInitialPermissions(): PermissionState {
  return clonePermissions(defaultPermissions);
}

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileType(fileName: string): DocumentItem["type"] {
  const extension = fileName
    .split(".")
    .pop()
    ?.toLowerCase();

  switch (extension) {
    case "pdf":
      return "PDF";
    case "txt":
      return "TXT";
    case "md":
    case "markdown":
      return "MD";
    case "json":
      return "JSON";
    case "png":
    case "jpg":
    case "jpeg":
    case "webp":
      return "Image";
    default:
      return "TXT";
  }
}

function getFileIcon(type: DocumentItem["type"]) {
  switch (type) {
    case "PDF":
      return FileText;
    case "TXT":
      return File;
    case "MD":
      return FileCode2;
    case "JSON":
      return FileJson;
    case "Image":
      return FileImage;
    default:
      return File;
  }
}

function getSecurityIcon(level: SecurityLevel) {
  switch (level) {
    case "Public":
      return Shield;
    case "Internal Only":
      return Lock;
    case "Restricted":
      return Lock;
    case "Confidential":
      return Shield;
    default:
      return Shield;
  }
}

function getAuditIcon(action: AuditAction) {
  switch (action) {
    case "Uploaded":
      return Upload;
    case "Viewed":
      return Eye;
    case "Downloaded":
      return Download;
    case "Flagged":
      return AlertTriangle;
    case "Permission Changed":
      return Settings2;
    default:
      return History;
  }
}

function securityLabel(level: SecurityLevel) {
  return level;
}

export default function DataRoomPage() {
  const [documents, setDocuments] =
    useState<DocumentItem[]>(mockDocuments);

  const [folders, setFolders] =
    useState<FolderItem[]>(mockFolders);

  const [currentFolder, setCurrentFolder] =
    useState("root");

  const [search, setSearch] = useState("");

  const [sortBy, setSortBy] =
    useState<SortOption>("name");

  const [fileType, setFileType] =
    useState<"all" | DocumentItem["type"]>("all");

  const [securityFilter, setSecurityFilter] =
    useState<"all" | SecurityLevel>("all");

  const [selectedDocument, setSelectedDocument] =
    useState<DocumentItem | null>(null);

  const [selectedDocumentIds, setSelectedDocumentIds] =
    useState<string[]>([]);

  const [showUploadModal, setShowUploadModal] =
    useState(false);

  const [showFolderModal, setShowFolderModal] =
    useState(false);

  const [showPermissionModal, setShowPermissionModal] =
    useState(false);

  const [showAuditDrawer, setShowAuditDrawer] =
    useState(false);

  const [showFilters, setShowFilters] =
    useState(false);

  const [showDownloadMenu, setShowDownloadMenu] =
    useState(false);

  const [newFolderName, setNewFolderName] =
    useState("");

  const [folderAction, setFolderAction] =
    useState<"create" | "rename">("create");

  const [folderToRename, setFolderToRename] =
    useState<string | null>(null);

  const [permissionDocument, setPermissionDocument] =
    useState<DocumentItem | null>(null);

  const [permissionsState, setPermissionsState] =
    useState<PermissionState>(
      getInitialPermissions()
    );

  const [savedPermissions, setSavedPermissions] =
    useState<Record<string, PermissionState>>({});

  const [securityForPermission, setSecurityForPermission] =
    useState<SecurityLevel>("Internal Only");

  const [viewMode, setViewMode] =
    useState<"grid" | "list">("grid");

  const [isDragging, setIsDragging] =
    useState(false);

  const [auditLogs, setAuditLogs] =
    useState<AuditLog[]>(initialAuditLogs);

  const currentFolderData = folders.find(
    (folder) => folder.id === currentFolder
  );

  const childFolders = folders.filter(
    (folder) => folder.parentId === currentFolder
  );

  const breadcrumbFolders = useMemo(() => {
    const result: FolderItem[] = [];

    let current =
      folders.find((folder) => folder.id === currentFolder);

    while (current) {
      result.unshift(current);

      if (!current.parentId) {
        break;
      }

      current = folders.find(
        (folder) => folder.id === current?.parentId
      );
    }

    return result;
  }, [folders, currentFolder]);

  const visibleDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = documents.filter((document) => {
      const matchesFolder =
        document.folderId === currentFolder;

      const matchesSearch =
        !query ||
        document.name.toLowerCase().includes(query) ||
        document.owner.toLowerCase().includes(query) ||
        document.type.toLowerCase().includes(query);

      const matchesType =
        fileType === "all" ||
        document.type === fileType;

      const matchesSecurity =
        securityFilter === "all" ||
        document.security === securityFilter;

      return (
        matchesFolder &&
        matchesSearch &&
        matchesType &&
        matchesSecurity
      );
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "date":
          return (
            new Date(b.modified).getTime() -
            new Date(a.modified).getTime()
          );

        case "type":
          return a.type.localeCompare(b.type);

        case "security":
          return a.security.localeCompare(b.security);

        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [
    documents,
    currentFolder,
    search,
    fileType,
    securityFilter,
    sortBy,
  ]);

  const totalDocuments = documents.length;

  const restrictedCount = documents.filter(
    (document) =>
      document.security === "Restricted" ||
      document.security === "Confidential"
  ).length;

  const flaggedCount = documents.filter(
    (document) => document.flagged
  ).length;

  const totalFolders = folders.length - 1;

  function addAuditLog(
    action: AuditAction,
    documentName: string
  ) {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random()}`,
      action,
      document: documentName,
      user: "Heema",
      timestamp: new Date().toLocaleString(
        "en-US",
        {
          month: "short",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      ),
    };

    setAuditLogs((current) => [
      newLog,
      ...current,
    ]);
  }

  function toggleDocumentSelection(
    documentId: string
  ) {
    setSelectedDocumentIds((current) =>
      current.includes(documentId)
        ? current.filter((id) => id !== documentId)
        : [...current, documentId]
    );
  }

  function toggleSelectAll() {
    const visibleIds = visibleDocuments.map(
      (document) => document.id
    );

    const allSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) =>
        selectedDocumentIds.includes(id)
      );

    if (allSelected) {
      setSelectedDocumentIds((current) =>
        current.filter(
          (id) => !visibleIds.includes(id)
        )
      );
    } else {
      setSelectedDocumentIds((current) => [
        ...new Set([
          ...current,
          ...visibleIds,
        ]),
      ]);
    }
  }

  function openDocument(document: DocumentItem) {
    setSelectedDocument(document);

    addAuditLog(
      "Viewed",
      document.name
    );
  }

  function downloadDocument(document: DocumentItem) {
    addAuditLog(
      "Downloaded",
      document.name
    );

    const blob = new Blob(
      [document.content],
      {
        type: "text/plain",
      }
    );

    const url = URL.createObjectURL(blob);

    const link =
      window.document.createElement("a");

    link.href = url;
    link.download = document.name;

    window.document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
  }

  function downloadSelectedDocuments() {
    const selected = documents.filter(
      (document) =>
        selectedDocumentIds.includes(document.id)
    );

    selected.forEach((document) => {
      addAuditLog(
        "Downloaded",
        document.name
      );
    });

    setShowDownloadMenu(false);
  }

  function flagDocument(documentId: string) {
    const document = documents.find(
      (item) => item.id === documentId
    );

    if (!document) {
      return;
    }

    setDocuments((current) =>
      current.map((item) =>
        item.id === documentId
          ? {
              ...item,
              flagged: !item.flagged,
            }
          : item
      )
    );

    if (!document.flagged) {
      addAuditLog(
        "Flagged",
        document.name
      );
    }
  }

  function createFolder() {
    const name = newFolderName.trim();

    if (!name) {
      return;
    }

    if (folderAction === "create") {
      const newFolder: FolderItem = {
        id: `folder-${Date.now()}`,
        name,
        parentId: currentFolder,
      };

      setFolders((current) => [
        ...current,
        newFolder,
      ]);
    } else if (folderToRename) {
      setFolders((current) =>
        current.map((folder) =>
          folder.id === folderToRename
            ? {
                ...folder,
                name,
              }
            : folder
        )
      );
    }

    setNewFolderName("");
    setFolderToRename(null);
    setShowFolderModal(false);
  }

  function openCreateFolder() {
    setFolderAction("create");
    setFolderToRename(null);
    setNewFolderName("");
    setShowFolderModal(true);
  }

  function openRenameFolder(folder: FolderItem) {
    setFolderAction("rename");
    setFolderToRename(folder.id);
    setNewFolderName(folder.name);
    setShowFolderModal(true);
  }

  function deleteFolder(folderId: string) {
    const hasChildren = folders.some(
      (folder) =>
        folder.parentId === folderId
    );

    const hasDocuments = documents.some(
      (document) =>
        document.folderId === folderId
    );

    if (hasChildren || hasDocuments) {
      alert(
        "This folder is not empty. Move or remove its contents first."
      );

      return;
    }

    setFolders((current) =>
      current.filter(
        (folder) => folder.id !== folderId
      )
    );
  }

  function handleFiles(
    fileList: FileList | null
  ) {
    if (!fileList || fileList.length === 0) {
      return;
    }

    const newDocuments: DocumentItem[] = [];

    Array.from(fileList).forEach(
      (file, index) => {
        const type = getFileType(file.name);

        const newDocument: DocumentItem = {
          id: `uploaded-${Date.now()}-${index}`,
          name: file.name,
          type,
          size: formatBytes(file.size),
          modified: new Date().toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "2-digit",
              year: "numeric",
            }
          ),
          owner: "Heema",
          security: "Internal Only",
          folderId:
            currentFolder === "root"
              ? "root"
              : currentFolder,
          content:
            `Uploaded document: ${file.name}\n\n` +
            `This is a mock preview generated for the Glynac Virtual Data Room.`,
        };

        newDocuments.push(newDocument);

        addAuditLog(
          "Uploaded",
          file.name
        );
      }
    );

    setDocuments((current) => [
      ...current,
      ...newDocuments,
    ]);

    setShowUploadModal(false);
    setIsDragging(false);
  }

  function openPermissionModal(
    document: DocumentItem
  ) {
    const existing =
      savedPermissions[document.id];

    setPermissionDocument(document);

    setPermissionsState(
      existing
        ? clonePermissions(existing)
        : getInitialPermissions()
    );

    setSecurityForPermission(
      document.security
    );

    setShowPermissionModal(true);
  }

  function togglePermission(
    role: Role,
    permission: Permission
  ) {
    setPermissionsState((current) => ({
      ...current,
      [role]: {
        ...current[role],
        [permission]:
          !current[role][permission],
      },
    }));
  }

  function savePermissions() {
    if (!permissionDocument) {
      return;
    }

    const documentId =
      permissionDocument.id;

    setSavedPermissions((current) => ({
      ...current,
      [documentId]:
        clonePermissions(permissionsState),
    }));

    setDocuments((current) =>
      current.map((document) =>
        document.id === documentId
          ? {
              ...document,
              security:
                securityForPermission,
            }
          : document
      )
    );

    if (
      selectedDocument?.id === documentId
    ) {
      setSelectedDocument((current) =>
        current
          ? {
              ...current,
              security:
                securityForPermission,
            }
          : current
      );
    }

    addAuditLog(
      "Permission Changed",
      permissionDocument.name
    );

    setShowPermissionModal(false);
  }

  function resetPermissions() {
    setPermissionsState(
      getInitialPermissions()
    );
  }

  function renderHighlightedText(
    content: string
  ) {
    const lines = content.split("\n");

    return (
      <div className="space-y-2">
        {lines.map((line, index) => {
          const lower = line.toLowerCase();

          const flagged =
            lower.includes("confidential") ||
            lower.includes("flagged") ||
            lower.includes(
              "regulatory disclosure"
            ) ||
            lower.includes("compliance");

          return (
            <div
              key={`${line}-${index}`}
              className={
                flagged
                  ? "rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-amber-100"
                  : "text-slate-300"
              }
            >
              {flagged && (
                <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                  <AlertTriangle
                    size={12}
                  />
                  Compliance marker
                </div>
              )}

              <span>
                {line || "\u00A0"}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  function renderPreview(
    document: DocumentItem
  ) {
    if (document.type === "PDF") {
      return (
        <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-8 text-slate-900 shadow-2xl">
          <div className="mb-8 flex items-start justify-between border-b border-slate-200 pb-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Glynac Compliance
              </div>

              <h2 className="mt-2 text-2xl font-bold">
                {document.name}
              </h2>
            </div>

            <div className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
              PDF
            </div>
          </div>

          <div className="space-y-4 text-sm leading-7">
            {renderHighlightedText(
              document.content
            )}
          </div>

          <div className="mt-10 border-t border-slate-200 pt-4 text-xs text-slate-400">
            Mock PDF renderer • Secure
            preview
          </div>
        </div>
      );
    }

    if (document.type === "JSON") {
      return (
        <div className="rounded-xl border border-slate-700 bg-slate-950 p-6">
          <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <FileJson size={15} />
            JSON Document
          </div>

          <pre className="overflow-x-auto whitespace-pre-wrap text-sm leading-7 text-emerald-300">
            {document.content}
          </pre>
        </div>
      );
    }

    if (document.type === "Image") {
      return (
        <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950">
          <div className="text-center">
            <FileImage
              size={52}
              className="mx-auto mb-4 text-slate-600"
            />

            <p className="font-medium text-slate-300">
              Image Preview
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Mock image renderer
            </p>
          </div>
        </div>
      );
    }

    if (document.type === "MD") {
      return (
        <div className="rounded-xl border border-slate-700 bg-slate-950 p-7">
          <div className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400">
            <FileCode2 size={15} />
            Markdown Preview
          </div>

          <div className="space-y-4 text-sm leading-7">
            {renderHighlightedText(
              document.content
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-slate-700 bg-slate-950 p-7">
        <div className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <FileText size={15} />
          Text Preview
        </div>

        <div className="text-sm leading-7">
          {renderHighlightedText(
            document.content
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#070b14]/95 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-5 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
                <Shield
                  size={18}
                  strokeWidth={2.5}
                />
              </div>

              <div>
                <div className="text-sm font-bold tracking-wide">
                  GLYNAC
                </div>

                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Wealth & Compliance
                </div>
              </div>
            </div>

            <div className="hidden h-7 w-px bg-white/[0.08] md:block" />

            <div className="hidden md:block">
              <div className="text-sm font-semibold">
                Virtual Data Room
              </div>

              <div className="text-xs text-slate-500">
                Secure document workspace
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Secure Workspace
            </div>

            <button className="relative rounded-xl p-2.5 text-slate-400 transition hover:bg-white/[0.05] hover:text-white">
              <Bell size={18} />

              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-blue-400" />
            </button>

            <div className="hidden items-center gap-2 border-l border-white/[0.08] pl-3 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-xs font-bold">
                H
              </div>

              <div className="hidden lg:block">
                <div className="text-xs font-semibold">
                  Heema
                </div>

                <div className="text-[10px] text-slate-500">
                  Frontend Intern
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        {/* TITLE */}
        <div className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
              <span>Workspace</span>
              <ChevronRight size={13} />
              <span>Data Room</span>
              <ChevronRight size={13} />
              <span className="text-slate-300">
                {currentFolderData?.name}
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Secure Data Room
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Organize, review and control access
              to sensitive documents.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() =>
                setShowAuditDrawer(true)
              }
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-white"
            >
              <History size={16} />
              Audit Log
            </button>

            <button
              onClick={openCreateFolder}
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              <FolderOpen size={16} />
              New Folder
            </button>

            <button
              onClick={() =>
                setShowUploadModal(true)
              }
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
            >
              <Upload size={16} />
              Upload Files
            </button>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            {
              label: "Total Documents",
              value: totalDocuments,
              icon: FileText,
              description: "Across all folders",
            },
            {
              label: "Secure Documents",
              value: restrictedCount,
              icon: Lock,
              description: "Restricted or confidential",
            },
            {
              label: "Flagged",
              value: flaggedCount,
              icon: AlertTriangle,
              description: "Needs compliance review",
            },
            {
              label: "Folders",
              value: totalFolders,
              icon: Folder,
              description: "Organized workspace",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition hover:border-white/[0.12] hover:bg-white/[0.04]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <Icon size={18} />
                  </div>

                  <MoreHorizontal
                    size={17}
                    className="text-slate-700 transition group-hover:text-slate-500"
                  />
                </div>

                <div className="mt-4 text-2xl font-bold">
                  {item.value}
                </div>

                <div className="mt-0.5 text-xs font-medium text-slate-300">
                  {item.label}
                </div>

                <div className="mt-1 text-[11px] text-slate-600">
                  {item.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* SEARCH */}
        <div className="mb-5 flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search documents, owners or file types..."
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.025] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-white/[0.04]"
            />
          </div>

          <button
            onClick={() =>
              setShowFilters((current) => !current)
            }
            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${
              showFilters
                ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                : "border-white/[0.08] bg-white/[0.025] text-slate-400 hover:bg-white/[0.05] hover:text-white"
            }`}
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </div>

        {/* FILTERS */}
        {showFilters && (
          <div className="mb-5 grid gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-500">
                File Type
              </label>

              <select
                value={fileType}
                onChange={(event) =>
                  setFileType(
                    event.target.value as
                      | "all"
                      | DocumentItem["type"]
                  )
                }
                className="w-full rounded-lg border border-white/[0.08] bg-[#0c1220] px-3 py-2.5 text-sm text-slate-300 outline-none"
              >
                <option value="all">
                  All Types
                </option>
                <option value="PDF">PDF</option>
                <option value="TXT">TXT</option>
                <option value="MD">Markdown</option>
                <option value="JSON">JSON</option>
                <option value="Image">Image</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-slate-500">
                Security
              </label>

              <select
                value={securityFilter}
                onChange={(event) =>
                  setSecurityFilter(
                    event.target.value as
                      | "all"
                      | SecurityLevel
                  )
                }
                className="w-full rounded-lg border border-white/[0.08] bg-[#0c1220] px-3 py-2.5 text-sm text-slate-300 outline-none"
              >
                <option value="all">
                  All Security Levels
                </option>

                {securityLevels.map(
                  (level) => (
                    <option
                      key={level}
                      value={level}
                    >
                      {level}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-slate-500">
                Sort By
              </label>

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(
                    event.target.value as SortOption
                  )
                }
                className="w-full rounded-lg border border-white/[0.08] bg-[#0c1220] px-3 py-2.5 text-sm text-slate-300 outline-none"
              >
                <option value="name">
                  Name
                </option>
                <option value="date">
                  Date
                </option>
                <option value="type">
                  File Type
                </option>
                <option value="security">
                  Sensitivity
                </option>
              </select>
            </div>
          </div>
        )}

        {/* BREADCRUMBS */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-1 overflow-x-auto text-sm">
            {breadcrumbFolders.map(
              (folder, index) => (
                <div
                  key={folder.id}
                  className="flex shrink-0 items-center gap-1"
                >
                  {index > 0 && (
                    <ChevronRight
                      size={14}
                      className="text-slate-700"
                    />
                  )}

                  <button
                    onClick={() =>
                      setCurrentFolder(folder.id)
                    }
                    className={`rounded-lg px-2 py-1 transition ${
                      folder.id === currentFolder
                        ? "font-semibold text-white"
                        : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"
                    }`}
                  >
                    {folder.name}
                  </button>
                </div>
              )
            )}
          </div>

          <div className="hidden items-center gap-1 rounded-lg border border-white/[0.07] bg-white/[0.025] p-1 sm:flex">
            <button
              onClick={() =>
                setViewMode("grid")
              }
              className={`rounded-md p-1.5 ${
                viewMode === "grid"
                  ? "bg-white/[0.08] text-white"
                  : "text-slate-600"
              }`}
            >
              <Grid2X2 size={15} />
            </button>

            <button
              onClick={() =>
                setViewMode("list")
              }
              className={`rounded-md p-1.5 ${
                viewMode === "list"
                  ? "bg-white/[0.08] text-white"
                  : "text-slate-600"
              }`}
            >
              <LayoutList size={15} />
            </button>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded border ${
                  visibleDocuments.length > 0 &&
                  visibleDocuments.every(
                    (document) =>
                      selectedDocumentIds.includes(
                        document.id
                      )
                  )
                    ? "border-blue-500 bg-blue-600"
                    : "border-slate-600 bg-transparent"
                }`}
              >
                {visibleDocuments.length > 0 &&
                  visibleDocuments.every(
                    (document) =>
                      selectedDocumentIds.includes(
                        document.id
                      )
                  ) && (
                    <Check
                      size={11}
                      strokeWidth={3}
                    />
                  )}
              </span>

              Select all
            </button>

            {selectedDocumentIds.length >
              0 && (
              <>
                <span className="text-xs text-slate-600">
                  {selectedDocumentIds.length}{" "}
                  selected
                </span>

                <div className="relative">
                  <button
                    onClick={() =>
                      setShowDownloadMenu(
                        (current) => !current
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.07] px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/[0.05]"
                  >
                    <Download size={13} />
                    Download
                  </button>

                  {showDownloadMenu && (
                    <div className="absolute left-0 top-9 z-20 w-48 rounded-xl border border-white/[0.08] bg-[#101725] p-1.5 shadow-2xl">
                      <button
                        onClick={
                          downloadSelectedDocuments
                        }
                        className="w-full rounded-lg px-3 py-2 text-left text-xs text-slate-300 hover:bg-white/[0.06] hover:text-white"
                      >
                        Download selected
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="text-xs text-slate-600">
            {visibleDocuments.length} documents
          </div>
        </div>

        {/* FOLDERS */}
        {childFolders.length > 0 && (
          <section className="mb-7">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Folders
              </h2>

              <span className="text-xs text-slate-700">
                {childFolders.length} folders
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {childFolders.map(
                (folder) => (
                  <div
                    key={folder.id}
                    className="group relative rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition hover:border-blue-500/20 hover:bg-white/[0.04]"
                  >
                    <button
                      onClick={() =>
                        setCurrentFolder(
                          folder.id
                        )
                      }
                      className="flex w-full items-center gap-3 text-left"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                        <Folder size={19} />
                      </div>

                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-200">
                          {folder.name}
                        </div>

                        <div className="mt-0.5 text-[11px] text-slate-600">
                          {
                            documents.filter(
                              (document) =>
                                document.folderId ===
                                folder.id
                            ).length
                          }{" "}
                          documents
                        </div>
                      </div>
                    </button>

                    <div className="absolute right-3 top-3 hidden gap-1 group-hover:flex">
                      <button
                        onClick={() =>
                          openRenameFolder(
                            folder
                          )
                        }
                        className="rounded-lg p-1.5 text-slate-600 hover:bg-white/[0.06] hover:text-white"
                        title="Rename"
                      >
                        <Pencil size={13} />
                      </button>

                      <button
                        onClick={() =>
                          deleteFolder(
                            folder.id
                          )
                        }
                        className="rounded-lg p-1.5 text-slate-600 hover:bg-red-500/10 hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        )}

        {/* DOCUMENTS */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Documents
            </h2>

            <span className="text-xs text-slate-600">
              {currentFolderData?.name}
            </span>
          </div>

          {visibleDocuments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/[0.09] bg-white/[0.015] py-20 text-center">
              <FileText
                size={38}
                className="mx-auto mb-4 text-slate-700"
              />

              <h3 className="text-sm font-semibold text-slate-300">
                No documents found
              </h3>

              <p className="mt-1 text-xs text-slate-600">
                Try another search or upload a
                document.
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {visibleDocuments.map(
                (document) => {
                  const Icon =
                    getFileIcon(
                      document.type
                    );

                  const SecurityIcon =
                    getSecurityIcon(
                      document.security
                    );

                  const securityStyle =
                    securityStyles[
                      document.security
                    ];

                  const selected =
                    selectedDocumentIds.includes(
                      document.id
                    );

                  return (
                    <div
                      key={document.id}
                      className={`group relative overflow-hidden rounded-2xl border bg-white/[0.025] transition hover:-translate-y-0.5 hover:bg-white/[0.04] ${
                        selected
                          ? "border-blue-500/40"
                          : "border-white/[0.07] hover:border-white/[0.13]"
                      }`}
                    >
                      <div className="flex items-start justify-between p-4">
                        <button
                          onClick={() =>
                            toggleDocumentSelection(
                              document.id
                            )
                          }
                          className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                            selected
                              ? "border-blue-500 bg-blue-600"
                              : "border-slate-700 bg-transparent"
                          }`}
                        >
                          {selected && (
                            <Check
                              size={12}
                              strokeWidth={3}
                            />
                          )}
                        </button>

                        <div className="flex items-center gap-1">
                          {document.flagged && (
                            <button
                              onClick={() =>
                                flagDocument(
                                  document.id
                                )
                              }
                              className="rounded-lg p-1.5 text-amber-400 hover:bg-amber-500/10"
                              title="Flagged"
                            >
                              <AlertTriangle
                                size={15}
                              />
                            </button>
                          )}

                          <button className="rounded-lg p-1.5 text-slate-600 hover:bg-white/[0.06] hover:text-white">
                            <MoreHorizontal
                              size={16}
                            />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          openDocument(
                            document
                          )
                        }
                        className="block w-full px-4 pb-4 text-left"
                      >
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 text-blue-400 ring-1 ring-white/[0.04]">
                          <Icon size={23} />
                        </div>

                        <div className="truncate text-sm font-semibold text-slate-200">
                          {document.name}
                        </div>

                        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-600">
                          <span>
                            {document.type}
                          </span>
                          <span>•</span>
                          <span>
                            {document.size}
                          </span>
                        </div>
                      </button>

                      <div className="border-t border-white/[0.05] px-4 py-3">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-semibold ${securityStyle.badge}`}
                          >
                            <SecurityIcon
                              size={11}
                            />
                            {securityLabel(
                              document.security
                            )}
                          </span>

                          <span className="truncate text-[10px] text-slate-600">
                            {document.modified}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex min-w-0 items-center gap-2">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[9px] font-bold text-slate-400">
                              {document.owner
                                .charAt(0)}
                            </div>

                            <span className="truncate text-[11px] text-slate-500">
                              {document.owner}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                openPermissionModal(
                                  document
                                )
                              }
                              className="rounded-lg p-1.5 text-slate-600 transition hover:bg-blue-500/10 hover:text-blue-400"
                              title="Permissions"
                            >
                              <Users
                                size={14}
                              />
                            </button>

                            <button
                              onClick={() =>
                                downloadDocument(
                                  document
                                )
                              }
                              className="rounded-lg p-1.5 text-slate-600 transition hover:bg-white/[0.06] hover:text-white"
                              title="Download"
                            >
                              <Download
                                size={14}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02]">
              <div className="hidden grid-cols-[40px_1fr_100px_150px_130px_100px] gap-4 border-b border-white/[0.06] px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-600 md:grid">
                <div />
                <div>Name</div>
                <div>Type</div>
                <div>Owner</div>
                <div>Security</div>
                <div>Actions</div>
              </div>

              {visibleDocuments.map(
                (document) => {
                  const Icon =
                    getFileIcon(
                      document.type
                    );

                  const selected =
                    selectedDocumentIds.includes(
                      document.id
                    );

                  const securityStyle =
                    securityStyles[
                      document.security
                    ];

                  return (
                    <div
                      key={document.id}
                      className="grid gap-3 border-b border-white/[0.05] px-4 py-4 last:border-b-0 md:grid-cols-[40px_1fr_100px_150px_130px_100px] md:items-center md:gap-4"
                    >
                      <button
                        onClick={() =>
                          toggleDocumentSelection(
                            document.id
                          )
                        }
                        className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                          selected
                            ? "border-blue-500 bg-blue-600"
                            : "border-slate-700"
                        }`}
                      >
                        {selected && (
                          <Check size={12} />
                        )}
                      </button>

                      <button
                        onClick={() =>
                          openDocument(
                            document
                          )
                        }
                        className="flex min-w-0 items-center gap-3 text-left"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                          <Icon size={17} />
                        </div>

                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-slate-200">
                            {document.name}
                          </div>

                          <div className="mt-0.5 text-[10px] text-slate-600">
                            {document.modified}
                          </div>
                        </div>
                      </button>

                      <div className="text-xs text-slate-500">
                        {document.type}
                      </div>

                      <div className="text-xs text-slate-500">
                        {document.owner}
                      </div>

                      <div>
                        <span
                          className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold ${securityStyle.badge}`}
                        >
                          {document.security}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            openPermissionModal(
                              document
                            )
                          }
                          className="rounded-lg p-2 text-slate-600 hover:bg-blue-500/10 hover:text-blue-400"
                        >
                          <Users size={14} />
                        </button>

                        <button
                          onClick={() =>
                            downloadDocument(
                              document
                            )
                          }
                          className="rounded-lg p-2 text-slate-600 hover:bg-white/[0.06] hover:text-white"
                        >
                          <Download
                            size={14}
                          />
                        </button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>

        {/* SECURITY FOOTER */}
        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-gradient-to-r from-blue-500/[0.05] to-purple-500/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <Shield size={17} />
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-300">
                Secure Document Environment
              </div>

              <div className="mt-0.5 text-[10px] text-slate-600">
                Permission changes and document
                activity are tracked locally.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-600">
            <CheckCircle2
              size={13}
              className="text-emerald-500"
            />
            Audit monitoring active
          </div>
        </div>
      </main>

      {/* PREVIEW MODAL */}
      {selectedDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-6">
          <div className="flex h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0f1b] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  onClick={() =>
                    setSelectedDocument(null)
                  }
                  className="rounded-lg p-2 text-slate-500 hover:bg-white/[0.05] hover:text-white"
                >
                  <ArrowLeft
                    size={18}
                  />
                </button>

                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">
                    {selectedDocument.name}
                  </div>

                  <div className="mt-0.5 text-[10px] text-slate-600">
                    Document Preview
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    openPermissionModal(
                      selectedDocument
                    )
                  }
                  className="hidden items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/[0.05] sm:flex"
                >
                  <Users size={14} />
                  Permissions
                </button>

                <button
                  onClick={() =>
                    downloadDocument(
                      selectedDocument
                    )
                  }
                  className="hidden items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/[0.05] sm:flex"
                >
                  <Download size={14} />
                  Download
                </button>

                <button
                  onClick={() =>
                    setSelectedDocument(null)
                  }
                  className="rounded-lg p-2 text-slate-500 hover:bg-white/[0.05] hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
              {/* SIDEBAR */}
              <aside className="w-full shrink-0 overflow-y-auto border-b border-white/[0.07] bg-white/[0.015] p-5 lg:w-72 lg:border-b-0 lg:border-r">
                <div className="mb-6">
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                    Security
                  </div>

                  <span
                    className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${
                      securityStyles[
                        selectedDocument.security
                      ].badge
                    }`}
                  >
                    {
                      selectedDocument.security
                    }
                  </span>
                </div>

                <div className="space-y-5">
                  <div>
                    <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-600">
                      File Type
                    </div>

                    <div className="text-xs text-slate-300">
                      {selectedDocument.type}
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-600">
                      Size
                    </div>

                    <div className="text-xs text-slate-300">
                      {selectedDocument.size}
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-600">
                      Owner
                    </div>

                    <div className="text-xs text-slate-300">
                      {selectedDocument.owner}
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-600">
                      Modified
                    </div>

                    <div className="text-xs text-slate-300">
                      {selectedDocument.modified}
                    </div>
                  </div>

                  <div className="border-t border-white/[0.06] pt-5">
                    <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                      <Clock3 size={12} />
                      Activity
                    </div>

                    <button
                      onClick={() =>
                        setShowAuditDrawer(true)
                      }
                      className="text-xs font-medium text-blue-400 hover:text-blue-300"
                    >
                      View audit history →
                    </button>
                  </div>

                  {selectedDocument.flagged && (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                        <AlertTriangle
                          size={14}
                        />
                        Compliance Flag
                      </div>

                      <p className="mt-1 text-[10px] leading-5 text-amber-400/60">
                        This document contains
                        content requiring review.
                      </p>
                    </div>
                  )}
                </div>
              </aside>

              {/* PREVIEW */}
              <div className="min-h-0 flex-1 overflow-y-auto bg-[#111827] p-4 sm:p-7">
                {renderPreview(
                  selectedDocument
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0c1220] p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  Upload Documents
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Upload files to{" "}
                  <span className="text-slate-300">
                    {currentFolderData?.name}
                  </span>
                </p>
              </div>

              <button
                onClick={() =>
                  setShowUploadModal(false)
                }
                className="rounded-lg p-2 text-slate-500 hover:bg-white/[0.05] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <label
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() =>
                setIsDragging(false)
              }
              onDrop={(event) => {
                event.preventDefault();
                handleFiles(
                  event.dataTransfer.files
                );
              }}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-14 text-center transition ${
                isDragging
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-slate-700 bg-white/[0.015] hover:border-blue-500/40 hover:bg-white/[0.025]"
              }`}
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                <Upload size={25} />
              </div>

              <div className="text-sm font-semibold text-slate-200">
                Drop files here
              </div>

              <div className="mt-1 text-xs text-slate-600">
                or click to browse from your computer
              </div>

              <div className="mt-4 rounded-lg bg-white/[0.04] px-3 py-1.5 text-[10px] text-slate-500">
                Multiple files supported
              </div>

              <input
                type="file"
                multiple
                className="hidden"
                onChange={(event) =>
                  handleFiles(
                    event.target.files
                  )
                }
              />
            </label>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() =>
                  setShowUploadModal(false)
                }
                className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-slate-400 hover:bg-white/[0.05] hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOLDER MODAL */}
      {showFolderModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0c1220] p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  {folderAction === "create"
                    ? "Create New Folder"
                    : "Rename Folder"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Keep your data room organized.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowFolderModal(false)
                }
                className="rounded-lg p-2 text-slate-500 hover:bg-white/[0.05] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <label className="mb-2 block text-xs font-medium text-slate-500">
              Folder Name
            </label>

            <input
              autoFocus
              value={newFolderName}
              onChange={(event) =>
                setNewFolderName(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  createFolder();
                }
              }}
              placeholder="e.g. Regulatory Documents"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-700 focus:border-blue-500/50"
            />

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() =>
                  setShowFolderModal(false)
                }
                className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-slate-400 hover:bg-white/[0.05] hover:text-white"
              >
                Cancel
              </button>

              <button
                onClick={createFolder}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
              >
                {folderAction === "create"
                  ? "Create Folder"
                  : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PERMISSION MODAL */}
      {showPermissionModal &&
        permissionDocument && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0c1220] shadow-2xl">
              <div className="sticky top-0 z-10 flex items-start justify-between border-b border-white/[0.07] bg-[#0c1220]/95 px-6 py-5 backdrop-blur-xl">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                      <Users size={17} />
                    </div>

                    <div>
                      <h2 className="text-base font-bold">
                        Permissions & Security
                      </h2>

                      <p className="mt-0.5 max-w-md truncate text-xs text-slate-600">
                        {permissionDocument.name}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setShowPermissionModal(
                      false
                    )
                  }
                  className="rounded-lg p-2 text-slate-500 hover:bg-white/[0.05] hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6">
                {/* SECURITY TAG */}
                <div className="mb-7 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-200">
                        Security Classification
                      </div>

                      <div className="mt-1 text-xs text-slate-600">
                        This security tag is updated on
                        the document when you save.
                      </div>
                    </div>

                    <Shield
                      size={18}
                      className="text-blue-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {securityLevels.map(
                      (level) => {
                        const active =
                          securityForPermission ===
                          level;

                        return (
                          <button
                            key={level}
                            onClick={() =>
                              setSecurityForPermission(
                                level
                              )
                            }
                            className={`rounded-xl border px-3 py-3 text-left transition ${
                              active
                                ? securityStyles[
                                    level
                                  ].badge +
                                  " ring-1 ring-current/20"
                                : "border-white/[0.07] bg-white/[0.02] text-slate-500 hover:bg-white/[0.04]"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold">
                                {level}
                              </span>

                              {active && (
                                <Check
                                  size={14}
                                />
                              )}
                            </div>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* ROLE PERMISSIONS */}
                <div>
                  <div className="mb-3">
                    <div className="text-sm font-semibold text-slate-200">
                      Role Permissions
                    </div>

                    <div className="mt-1 text-xs text-slate-600">
                      Assign View, Edit and Share rights
                      to each role.
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-white/[0.07]">
                    <div className="grid grid-cols-[1fr_80px_80px_80px] border-b border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                      <div>Role</div>
                      <div className="text-center">
                        View
                      </div>
                      <div className="text-center">
                        Edit
                      </div>
                      <div className="text-center">
                        Share
                      </div>
                    </div>

                    {roles.map((role) => (
                      <div
                        key={role}
                        className="grid grid-cols-[1fr_80px_80px_80px] items-center border-b border-white/[0.05] px-4 py-4 last:border-b-0"
                      >
                        <div>
                          <div className="text-xs font-medium text-slate-300">
                            {role}
                          </div>

                          <div className="mt-0.5 text-[10px] text-slate-700">
                            Access role
                          </div>
                        </div>

                        {(
                          [
                            "view",
                            "edit",
                            "share",
                          ] as Permission[]
                        ).map(
                          (permission) => {
                            const enabled =
                              permissionsState[
                                role
                              ][permission];

                            return (
                              <div
                                key={permission}
                                className="flex justify-center"
                              >
                                <button
                                  onClick={() =>
                                    togglePermission(
                                      role,
                                      permission
                                    )
                                  }
                                  className={`flex h-6 w-6 items-center justify-center rounded-md border transition ${
                                    enabled
                                      ? "border-blue-500 bg-blue-600 text-white"
                                      : "border-slate-700 bg-transparent text-transparent hover:border-slate-500"
                                  }`}
                                  aria-label={`${role} ${permission}`}
                                >
                                  <Check
                                    size={13}
                                    strokeWidth={3}
                                  />
                                </button>
                              </div>
                            );
                          }
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* INFO */}
                <div className="mt-5 flex gap-3 rounded-xl border border-blue-500/10 bg-blue-500/5 p-4">
                  <Shield
                    size={17}
                    className="mt-0.5 shrink-0 text-blue-400"
                  />

                  <div className="text-xs leading-5 text-slate-500">
                    Saving these settings updates the
                    document's security classification and
                    records a{" "}
                    <span className="font-medium text-blue-400">
                      Permission Changed
                    </span>{" "}
                    event in the audit timeline.
                  </div>
                </div>

                {/* BUTTONS */}
                <div className="mt-6 flex flex-col-reverse justify-between gap-3 sm:flex-row sm:items-center">
                  <button
                    onClick={resetPermissions}
                    className="text-xs font-medium text-slate-600 hover:text-slate-300"
                  >
                    Reset Defaults
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setShowPermissionModal(
                          false
                        )
                      }
                      className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-slate-400 hover:bg-white/[0.05] hover:text-white"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={savePermissions}
                      className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500"
                    >
                      Save Permissions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* AUDIT DRAWER */}
      {showAuditDrawer && (
        <div className="fixed inset-0 z-[80]">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() =>
              setShowAuditDrawer(false)
            }
          />

          <aside className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-white/[0.08] bg-[#0b111e] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.07] bg-[#0b111e]/95 px-5 py-4 backdrop-blur-xl">
              <div>
                <div className="flex items-center gap-2">
                  <History
                    size={17}
                    className="text-blue-400"
                  />

                  <h2 className="text-sm font-bold">
                    Activity Audit Log
                  </h2>
                </div>

                <p className="mt-1 text-[10px] text-slate-600">
                  Chronological document activity
                </p>
              </div>

              <button
                onClick={() =>
                  setShowAuditDrawer(false)
                }
                className="rounded-lg p-2 text-slate-500 hover:bg-white/[0.05] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <div className="relative">
                <div className="absolute bottom-0 left-[15px] top-0 w-px bg-white/[0.07]" />

                <div className="space-y-6">
                  {auditLogs.map(
                    (log) => {
                      const Icon =
                        getAuditIcon(
                          log.action
                        );

                      return (
                        <div
                          key={log.id}
                          className="relative flex gap-4"
                        >
                          <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-[#0b111e] text-blue-400">
                            <Icon size={14} />
                          </div>

                          <div className="min-w-0 pt-0.5">
                            <div className="text-xs font-semibold text-slate-200">
                              {log.action}
                            </div>

                            <div className="mt-1 break-words text-xs text-slate-500">
                              {log.document}
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-700">
                              <span className="flex items-center gap-1">
                                <CircleUserRound
                                  size={11}
                                />
                                {log.user}
                              </span>

                              <span>•</span>

                              <span>
                                {log.timestamp}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {auditLogs.length === 0 && (
                <div className="py-20 text-center">
                  <History
                    size={35}
                    className="mx-auto mb-3 text-slate-700"
                  />

                  <p className="text-xs text-slate-600">
                    No audit activity yet.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}