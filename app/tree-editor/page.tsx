"use client";

import { useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Copy,
  Download,
  FileJson,
  GitBranch,
  Grid3X3,
  Hand,
  LayoutDashboard,
  Link2,
  Maximize2,
  Minus,
  Move,
  Plus,
  Redo2,
  RotateCcw,
  Search,
  Settings2,
  Trash2,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

type NodeType = "Root" | "Rule" | "Condition" | "Action";
type Severity = "Low" | "Medium" | "High" | "Critical";

type TreeNode = {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  label: string;
  ruleId: string;
  description: string;
  severity: Severity;
  parameters: string;
  metadata: string;
};

type TreeEdge = {
  id: string;
  source: string;
  target: string;
};

const NODE_WIDTH = 210;
const NODE_HEIGHT = 112;
const CANVAS_WIDTH = 1600;
const CANVAS_HEIGHT = 1000;

const initialNodes: TreeNode[] = [
  {
    id: "root-1",
    type: "Root",
    x: 670,
    y: 80,
    label: "Compliance Policy",
    ruleId: "ROOT-001",
    description: "Root compliance policy for the wealth platform.",
    severity: "High",
    parameters: '{"scope":"global"}',
    metadata: '{"owner":"Compliance"}',
  },
  {
    id: "rule-1",
    type: "Rule",
    x: 390,
    y: 280,
    label: "FINRA 2210",
    ruleId: "FINRA-2210",
    description: "Communications with the public.",
    severity: "High",
    parameters: '{"review":"pre-approval"}',
    metadata: '{"source":"FINRA"}',
  },
  {
    id: "rule-2",
    type: "Rule",
    x: 950,
    y: 280,
    label: "SEC Recordkeeping",
    ruleId: "SEC-17a-4",
    description: "Electronic record retention requirements.",
    severity: "Critical",
    parameters: '{"retention":"7 years"}',
    metadata: '{"source":"SEC"}',
  },
  {
    id: "condition-1",
    type: "Condition",
    x: 390,
    y: 500,
    label: "Communication Contains Claim",
    ruleId: "COND-001",
    description: "Checks whether communication contains a performance claim.",
    severity: "Medium",
    parameters: '{"scan":"claims"}',
    metadata: '{"engine":"AI"}',
  },
  {
    id: "action-1",
    type: "Action",
    x: 390,
    y: 710,
    label: "Require Approval",
    ruleId: "ACT-001",
    description: "Routes communication for compliance approval.",
    severity: "High",
    parameters: '{"approval":"compliance"}',
    metadata: '{"workflow":"approval"}',
  },
  {
    id: "condition-2",
    type: "Condition",
    x: 950,
    y: 500,
    label: "Record Exists",
    ruleId: "COND-002",
    description: "Checks whether a compliant record exists.",
    severity: "Low",
    parameters: '{"lookup":"record"}',
    metadata: '{"system":"archive"}',
  },
];

const initialEdges: TreeEdge[] = [
  { id: "edge-1", source: "root-1", target: "rule-1" },
  { id: "edge-2", source: "root-1", target: "rule-2" },
  { id: "edge-3", source: "rule-1", target: "condition-1" },
  { id: "edge-4", source: "condition-1", target: "action-1" },
  { id: "edge-5", source: "rule-2", target: "condition-2" },
];

const typeStyles: Record<NodeType, string> = {
  Root: "border-violet-400/40 bg-violet-500/10",
  Rule: "border-blue-400/40 bg-blue-500/10",
  Condition: "border-amber-400/40 bg-amber-500/10",
  Action: "border-emerald-400/40 bg-emerald-500/10",
};

const typeAccent: Record<NodeType, string> = {
  Root: "bg-violet-400",
  Rule: "bg-blue-400",
  Condition: "bg-amber-400",
  Action: "bg-emerald-400",
};

const typeText: Record<NodeType, string> = {
  Root: "text-violet-300",
  Rule: "text-blue-300",
  Condition: "text-amber-300",
  Action: "text-emerald-300",
};

const severityStyles: Record<Severity, string> = {
  Low: "bg-slate-500/15 text-slate-300 border-slate-400/20",
  Medium: "bg-amber-500/15 text-amber-300 border-amber-400/20",
  High: "bg-orange-500/15 text-orange-300 border-orange-400/20",
  Critical: "bg-red-500/15 text-red-300 border-red-400/20",
};

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function TreeEditorPage() {
  const [nodes, setNodes] = useState<TreeNode[]>(initialNodes);
  const [edges, setEdges] = useState<TreeEdge[]>(initialEdges);

  const [selectedId, setSelectedId] = useState<string>("root-1");
  const [search, setSearch] = useState("");
  const [zoom, setZoom] = useState(0.8);

  const [showGrid, setShowGrid] = useState(true);
  const [showMinimap, setShowMinimap] = useState(true);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);

  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [validation, setValidation] = useState<{
    valid: boolean;
    messages: string[];
  } | null>(null);

  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });

  const selectedNode = nodes.find((node) => node.id === selectedId);

  const filteredNodes = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return nodes;

    return nodes.filter(
      (node) =>
        node.label.toLowerCase().includes(term) ||
        node.ruleId.toLowerCase().includes(term) ||
        node.type.toLowerCase().includes(term)
    );
  }, [nodes, search]);

  const updateNode = (id: string, updates: Partial<TreeNode>) => {
    setNodes((current) =>
      current.map((node) =>
        node.id === id ? { ...node, ...updates } : node
      )
    );
    setValidation(null);
  };

  const addNode = (type: NodeType, x = 680, y = 180) => {
    const id = makeId(type.toLowerCase());

    const newNode: TreeNode = {
      id,
      type,
      x,
      y,
      label: `New ${type}`,
      ruleId: `${type.toUpperCase().slice(0, 4)}-${nodes.length + 1}`,
      description: `New ${type.toLowerCase()} node.`,
      severity: "Medium",
      parameters: "{}",
      metadata: "{}",
    };

    setNodes((current) => [...current, newNode]);
    setSelectedId(id);
    setValidation(null);
  };

  const addChild = () => {
    if (!selectedNode) return;

    const childType: NodeType =
      selectedNode.type === "Root"
        ? "Rule"
        : selectedNode.type === "Rule"
          ? "Condition"
          : selectedNode.type === "Condition"
            ? "Action"
            : "Action";

    const childId = makeId(childType.toLowerCase());

    const newNode: TreeNode = {
      id: childId,
      type: childType,
      x: selectedNode.x,
      y: selectedNode.y + 180,
      label: `New ${childType}`,
      ruleId: `${childType.toUpperCase().slice(0, 4)}-${nodes.length + 1}`,
      description: `New ${childType.toLowerCase()} node.`,
      severity: "Medium",
      parameters: "{}",
      metadata: "{}",
    };

    setNodes((current) => [...current, newNode]);
    setEdges((current) => [
      ...current,
      {
        id: makeId("edge"),
        source: selectedNode.id,
        target: childId,
      },
    ]);
    setSelectedId(childId);
    setValidation(null);
  };

  const duplicateNode = () => {
    if (!selectedNode) return;

    const id = makeId("copy");

    const copy: TreeNode = {
      ...selectedNode,
      id,
      x: selectedNode.x + 50,
      y: selectedNode.y + 50,
      label: `${selectedNode.label} Copy`,
    };

    setNodes((current) => [...current, copy]);
    setSelectedId(id);
    setValidation(null);
  };

  const deleteNode = () => {
    if (!selectedNode) return;

    if (selectedNode.type === "Root") {
      alert("The Root node cannot be deleted.");
      return;
    }

    setNodes((current) =>
      current.filter((node) => node.id !== selectedNode.id)
    );

    setEdges((current) =>
      current.filter(
        (edge) =>
          edge.source !== selectedNode.id &&
          edge.target !== selectedNode.id
      )
    );

    setSelectedId(nodes.find((node) => node.type === "Root")?.id || "");
    setValidation(null);
  };

  const startConnection = (nodeId: string) => {
    if (connectingFrom === nodeId) {
      setConnectingFrom(null);
      return;
    }

    setConnectingFrom(nodeId);
  };

  const finishConnection = (targetId: string) => {
    if (!connectingFrom || connectingFrom === targetId) {
      setConnectingFrom(null);
      return;
    }

    const exists = edges.some(
      (edge) => edge.source === connectingFrom && edge.target === targetId
    );

    if (!exists) {
      setEdges((current) => [
        ...current,
        {
          id: makeId("edge"),
          source: connectingFrom,
          target: targetId,
        },
      ]);
    }

    setConnectingFrom(null);
    setValidation(null);
  };

  const deleteEdge = (edgeId: string) => {
    setEdges((current) => current.filter((edge) => edge.id !== edgeId));
    setValidation(null);
  };

  const resetView = () => {
    setZoom(0.8);
    setPan({ x: 0, y: 0 });
  };

  const autoLayout = () => {
    const levels = new Map<string, number>();
    const root = nodes.find((node) => node.type === "Root");

    if (!root) return;

    levels.set(root.id, 0);

    let changed = true;

    while (changed) {
      changed = false;

      edges.forEach((edge) => {
        const sourceLevel = levels.get(edge.source);

        if (sourceLevel !== undefined && !levels.has(edge.target)) {
          levels.set(edge.target, sourceLevel + 1);
          changed = true;
        }
      });
    }

    const counters: Record<number, number> = {};

    setNodes((current) =>
      current.map((node) => {
        const level = levels.get(node.id) ?? 0;
        const index = counters[level] ?? 0;

        counters[level] = index + 1;

        return {
          ...node,
          x: 170 + index * 270,
          y: 80 + level * 190,
        };
      })
    );

    setValidation(null);
  };

  const validateTree = () => {
    const messages: string[] = [];

    const rootNodes = nodes.filter((node) => node.type === "Root");

    if (rootNodes.length !== 1) {
      messages.push("Tree must contain exactly one Root node.");
    }

    const incoming = new Map<string, number>();

    nodes.forEach((node) => incoming.set(node.id, 0));

    edges.forEach((edge) => {
      incoming.set(edge.target, (incoming.get(edge.target) || 0) + 1);

      if (!nodes.some((node) => node.id === edge.source)) {
        messages.push(`Missing source node for edge ${edge.id}.`);
      }

      if (!nodes.some((node) => node.id === edge.target)) {
        messages.push(`Missing target node for edge ${edge.id}.`);
      }
    });

    const rootId = rootNodes[0]?.id;

    nodes.forEach((node) => {
      if (node.id !== rootId && (incoming.get(node.id) || 0) === 0) {
        messages.push(`Orphan node detected: ${node.label}.`);
      }
    });

    const visiting = new Set<string>();
    const visited = new Set<string>();

    const visit = (id: string): boolean => {
      if (visiting.has(id)) return true;
      if (visited.has(id)) return false;

      visiting.add(id);

      const children = edges
        .filter((edge) => edge.source === id)
        .map((edge) => edge.target);

      for (const child of children) {
        if (visit(child)) return true;
      }

      visiting.delete(id);
      visited.add(id);

      return false;
    };

    for (const node of nodes) {
      if (visit(node.id)) {
        messages.push("Circular reference detected in the tree.");
        break;
      }
    }

    setValidation({
      valid: messages.length === 0,
      messages:
        messages.length === 0
          ? ["Tree structure is valid. No orphan or circular references found."]
          : messages,
    });
  };

  const exportJSON = () => {
    const payload = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      nodes,
      edges,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "glynac-compliance-tree.json";
    link.click();

    URL.revokeObjectURL(url);
  };

  const importJSON = () => {
    try {
      const parsed = JSON.parse(importText);

      if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
        throw new Error("JSON must contain nodes and edges arrays.");
      }

      setNodes(parsed.nodes);
      setEdges(parsed.edges);
      setSelectedId(parsed.nodes[0]?.id || "");
      setImportOpen(false);
      setImportText("");
      setValidation(null);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Invalid JSON file."
      );
    }
  };

  const handleNodeMouseDown = (
    event: React.MouseEvent,
    nodeId: string
  ) => {
    event.stopPropagation();

    if (connectingFrom) {
      finishConnection(nodeId);
      return;
    }

    setSelectedId(nodeId);
    setDraggingNode(nodeId);

    const node = nodes.find((item) => item.id === nodeId);
    if (!node) return;

    const startX = event.clientX;
    const startY = event.clientY;
    const originalX = node.x;
    const originalY = node.y;

    const move = (moveEvent: MouseEvent) => {
      const dx = (moveEvent.clientX - startX) / zoom;
      const dy = (moveEvent.clientY - startY) / zoom;

      updateNode(nodeId, {
        x: Math.max(0, originalX + dx),
        y: Math.max(0, originalY + dy),
      });
    };

    const up = () => {
      setDraggingNode(null);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const handleCanvasMouseDown = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (event.button !== 0) return;

    if ((event.target as HTMLElement).closest("[data-node]")) {
      return;
    }

    setIsPanning(true);

    panStart.current = {
      x: event.clientX - pan.x,
      y: event.clientY - pan.y,
    };

    const move = (moveEvent: MouseEvent) => {
      setPan({
        x: moveEvent.clientX - panStart.current.x,
        y: moveEvent.clientY - panStart.current.y,
      });
    };

    const up = () => {
      setIsPanning(false);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const createPaletteNode = (
    event: React.DragEvent,
    type: NodeType
  ) => {
    event.dataTransfer.setData("node-type", type);
  };

  const dropPaletteNode = (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();

    const type = event.dataTransfer.getData("node-type") as NodeType;

    if (!type) return;

    const rect = event.currentTarget.getBoundingClientRect();

    const x =
      (event.clientX - rect.left - pan.x) / zoom - NODE_WIDTH / 2;

    const y =
      (event.clientY - rect.top - pan.y) / zoom - NODE_HEIGHT / 2;

    addNode(type, Math.max(0, x), Math.max(0, y));
  };

  const edgeElements = edges.map((edge) => {
    const source = nodes.find((node) => node.id === edge.source);
    const target = nodes.find((node) => node.id === edge.target);

    if (!source || !target) return null;

    const x1 = source.x + NODE_WIDTH / 2;
    const y1 = source.y + NODE_HEIGHT;
    const x2 = target.x + NODE_WIDTH / 2;
    const y2 = target.y;

    const curve = Math.max(50, Math.abs(y2 - y1) / 2);

    const path = `M ${x1} ${y1} C ${x1} ${
      y1 + curve
    }, ${x2} ${y2 - curve}, ${x2} ${y2}`;

    return (
      <g key={edge.id}>
        <path
          d={path}
          fill="none"
          stroke="rgba(148,163,184,0.35)"
          strokeWidth="2"
          markerEnd="url(#arrow)"
        />

        <path
          d={path}
          fill="none"
          stroke="transparent"
          strokeWidth="14"
          className="cursor-pointer"
          onDoubleClick={() => deleteEdge(edge.id)}
        />
      </g>
    );
  });

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100">
      {/* HEADER */}
      <header className="flex h-16 items-center justify-between border-b border-white/10 bg-[#0b111b] px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
            <GitBranch size={19} />
          </div>

          <div>
            <h1 className="text-sm font-semibold">
              Compliance Tree Editor
            </h1>
            <p className="text-[11px] text-slate-500">
              Interactive policy workflow builder
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={validateTree}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/[0.08]"
          >
            <Check size={15} />
            Validate
          </button>

          <button
            onClick={() => setImportOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/[0.08]"
          >
            <Upload size={15} />
            Import
          </button>

          <button
            onClick={exportJSON}
            className="flex items-center gap-2 rounded-lg bg-violet-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-400"
          >
            <Download size={15} />
            Export JSON
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)]">
        {/* LEFT PALETTE */}
        <aside className="w-[245px] shrink-0 border-r border-white/10 bg-[#0a1019] p-4">
          <div className="mb-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Node Palette
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Drag a node onto the canvas.
            </p>
          </div>

          <div className="space-y-2">
            {(["Root", "Rule", "Condition", "Action"] as NodeType[]).map(
              (type) => (
                <div
                  key={type}
                  draggable
                  onDragStart={(event) =>
                    createPaletteNode(event, type)
                  }
                  className={`group cursor-grab rounded-xl border p-3 transition hover:bg-white/[0.05] active:cursor-grabbing ${typeStyles[type]}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.05] ${typeText[type]}`}
                    >
                      {type === "Root" && <GitBranch size={17} />}
                      {type === "Rule" && <FileJson size={17} />}
                      {type === "Condition" && (
                        <CircleHelp size={17} />
                      )}
                      {type === "Action" && (
                        <Activity size={17} />
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-semibold">
                        {type}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {type === "Root"
                          ? "Policy root"
                          : type === "Rule"
                            ? "Compliance rule"
                            : type === "Condition"
                              ? "Decision condition"
                              : "Workflow action"}
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="my-5 border-t border-white/10" />

          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Actions
          </p>

          <div className="space-y-2">
            <button
              onClick={addChild}
              disabled={!selectedNode}
              className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs text-slate-300 hover:bg-white/[0.07] disabled:opacity-40"
            >
              <Plus size={15} />
              Add Child
            </button>

            <button
              onClick={duplicateNode}
              disabled={!selectedNode}
              className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs text-slate-300 hover:bg-white/[0.07] disabled:opacity-40"
            >
              <Copy size={15} />
              Duplicate
            </button>

            <button
              onClick={autoLayout}
              className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs text-slate-300 hover:bg-white/[0.07]"
            >
              <LayoutDashboard size={15} />
              Auto Layout
            </button>

            <button
              onClick={() =>
                selectedNode && startConnection(selectedNode.id)
              }
              disabled={!selectedNode}
              className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-xs disabled:opacity-40 ${
                connectingFrom
                  ? "border-violet-400/30 bg-violet-500/10 text-violet-300"
                  : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07]"
              }`}
            >
              <Link2 size={15} />
              {connectingFrom ? "Select Target" : "Connect Node"}
            </button>
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <div className="flex items-start gap-2">
              <CircleHelp
                size={14}
                className="mt-0.5 shrink-0 text-slate-500"
              />
              <p className="text-[10px] leading-4 text-slate-500">
                Double-click an edge to remove it. Click
                &quot;Connect Node&quot; and then select another node
                to create a parent-child relationship.
              </p>
            </div>
          </div>
        </aside>

        {/* CANVAS */}
        <main className="relative min-w-0 flex-1 overflow-hidden bg-[#080d15]">
          {/* TOOLBAR */}
          <div className="absolute left-4 right-4 top-4 z-30 flex items-center justify-between">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0c131e]/95 p-1.5 shadow-xl backdrop-blur">
              <div className="flex items-center gap-1 border-r border-white/10 pr-1.5">
                <button
                  onClick={() =>
                    setZoom((value) => Math.min(1.5, value + 0.1))
                  }
                  className="rounded-lg p-2 text-slate-400 hover:bg-white/[0.06] hover:text-white"
                  title="Zoom in"
                >
                  <ZoomIn size={16} />
                </button>

                <button
                  onClick={() =>
                    setZoom((value) => Math.max(0.35, value - 0.1))
                  }
                  className="rounded-lg p-2 text-slate-400 hover:bg-white/[0.06] hover:text-white"
                  title="Zoom out"
                >
                  <ZoomOut size={16} />
                </button>

                <span className="min-w-[45px] text-center text-[10px] font-medium text-slate-500">
                  {Math.round(zoom * 100)}%
                </span>
              </div>

              <button
                onClick={() => setShowGrid((value) => !value)}
                className={`rounded-lg p-2 ${
                  showGrid
                    ? "bg-white/[0.08] text-white"
                    : "text-slate-500"
                }`}
                title="Toggle grid"
              >
                <Grid3X3 size={16} />
              </button>

              <button
                onClick={resetView}
                className="rounded-lg p-2 text-slate-500 hover:bg-white/[0.06] hover:text-white"
                title="Reset view"
              >
                <RotateCcw size={16} />
              </button>

              <button
                onClick={() => setShowMinimap((value) => !value)}
                className={`rounded-lg p-2 ${
                  showMinimap
                    ? "bg-white/[0.08] text-white"
                    : "text-slate-500"
                }`}
                title="Toggle minimap"
              >
                <Maximize2 size={16} />
              </button>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0c131e]/95 px-3 py-2 shadow-xl backdrop-blur">
              <Search size={14} className="text-slate-500" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search nodes..."
                className="w-36 bg-transparent text-xs text-white outline-none placeholder:text-slate-600"
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-slate-500 hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* CONNECT MODE */}
          {connectingFrom && (
            <div className="absolute left-1/2 top-20 z-40 -translate-x-1/2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-xs text-violet-300 shadow-xl backdrop-blur">
              Select a target node to create a connection
            </div>
          )}

          {/* CANVAS AREA */}
          <div
            className={`h-full w-full ${
              isPanning ? "cursor-grabbing" : "cursor-grab"
            }`}
            onMouseDown={handleCanvasMouseDown}
            onDragOver={(event) => event.preventDefault()}
            onDrop={dropPaletteNode}
          >
            <div
              className="absolute left-0 top-0 origin-top-left"
              style={{
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                backgroundImage: showGrid
                  ? `
                    linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)
                  `
                  : "none",
                backgroundSize: "28px 28px",
              }}
            >
              {/* SVG EDGES */}
              <svg
                className="pointer-events-none absolute left-0 top-0"
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                style={{ overflow: "visible" }}
              >
                <defs>
                  <marker
                    id="arrow"
                    markerWidth="8"
                    markerHeight="8"
                    refX="7"
                    refY="4"
                    orient="auto"
                  >
                    <path
                      d="M 0 0 L 8 4 L 0 8 z"
                      fill="rgba(148,163,184,0.55)"
                    />
                  </marker>
                </defs>

                {edgeElements}
              </svg>

              {/* NODES */}
              {nodes.map((node) => {
                const visible =
                  filteredNodes.some(
                    (item) => item.id === node.id
                  );

                if (!visible) return null;

                const selected = selectedId === node.id;
                const connecting = connectingFrom === node.id;

                return (
                  <div
                    key={node.id}
                    data-node
                    onMouseDown={(event) =>
                      handleNodeMouseDown(event, node.id)
                    }
                    className={`absolute select-none rounded-xl border shadow-xl backdrop-blur ${
                      typeStyles[node.type]
                    } ${
                      selected
                        ? "ring-2 ring-violet-400/60"
                        : ""
                    } ${
                      connecting
                        ? "ring-2 ring-violet-300"
                        : ""
                    } ${
                      draggingNode === node.id
                        ? "cursor-grabbing"
                        : "cursor-grab"
                    }`}
                    style={{
                      left: node.x,
                      top: node.y,
                      width: NODE_WIDTH,
                      height: NODE_HEIGHT,
                    }}
                  >
                    <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${typeAccent[node.type]}`}
                        />

                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${typeText[node.type]}`}
                        >
                          {node.type}
                        </span>
                      </div>

                      <span className="rounded-md bg-black/20 px-1.5 py-0.5 font-mono text-[8px] text-slate-500">
                        {node.id.slice(0, 8)}
                      </span>
                    </div>

                    <div className="px-3 py-2">
                      <p className="truncate text-xs font-semibold text-white">
                        {node.label}
                      </p>

                      <p className="mt-1 truncate font-mono text-[9px] text-slate-500">
                        {node.ruleId}
                      </p>

                      <div className="mt-2 flex items-center justify-between">
                        <span
                          className={`rounded-md border px-1.5 py-0.5 text-[8px] font-medium ${
                            severityStyles[node.severity]
                          }`}
                        >
                          {node.severity}
                        </span>

                        <button
                          onMouseDown={(event) => {
                            event.stopPropagation();
                            startConnection(node.id);
                          }}
                          className="rounded-md border border-white/10 bg-black/20 p-1 text-slate-500 hover:text-white"
                          title="Connect"
                        >
                          <Link2 size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MINIMAP */}
          {showMinimap && (
            <div className="absolute bottom-4 right-4 z-20 h-36 w-52 overflow-hidden rounded-xl border border-white/10 bg-[#0b111b]/95 p-2 shadow-xl backdrop-blur">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                  Minimap
                </span>

                <Move size={11} className="text-slate-600" />
              </div>

              <div className="relative h-[105px] overflow-hidden rounded-lg border border-white/5 bg-[#070b12]">
                {nodes.map((node) => (
                  <div
                    key={node.id}
                    className={`absolute h-2 w-4 rounded-sm ${typeAccent[node.type]}`}
                    style={{
                      left: `${(node.x / CANVAS_WIDTH) * 100}%`,
                      top: `${(node.y / CANVAS_HEIGHT) * 100}%`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* VALIDATION */}
          {validation && (
            <div
              className={`absolute bottom-4 left-4 z-30 max-w-md rounded-xl border p-3 shadow-xl backdrop-blur ${
                validation.valid
                  ? "border-emerald-400/20 bg-emerald-500/10"
                  : "border-red-400/20 bg-red-500/10"
              }`}
            >
              <div className="flex items-start gap-2">
                {validation.valid ? (
                  <Check
                    size={16}
                    className="mt-0.5 text-emerald-300"
                  />
                ) : (
                  <AlertCircle
                    size={16}
                    className="mt-0.5 text-red-300"
                  />
                )}

                <div>
                  <p
                    className={`text-xs font-semibold ${
                      validation.valid
                        ? "text-emerald-300"
                        : "text-red-300"
                    }`}
                  >
                    {validation.valid
                      ? "Validation Passed"
                      : "Validation Issues"}
                  </p>

                  <div className="mt-1 space-y-1">
                    {validation.messages.map((message, index) => (
                      <p
                        key={index}
                        className="text-[10px] leading-4 text-slate-400"
                      >
                        {message}
                      </p>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setValidation(null)}
                  className="ml-auto text-slate-500 hover:text-white"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          )}
        </main>

        {/* RIGHT INSPECTOR */}
        <aside className="w-[315px] shrink-0 overflow-y-auto border-l border-white/10 bg-[#0a1019]">
          <div className="border-b border-white/10 px-4 py-4">
            <div className="flex items-center gap-2">
              <Settings2 size={16} className="text-violet-300" />
              <div>
                <h2 className="text-xs font-semibold">
                  Node Properties
                </h2>
                <p className="text-[10px] text-slate-500">
                  Configure selected node
                </p>
              </div>
            </div>
          </div>

          {selectedNode ? (
            <div className="space-y-5 p-4">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.025] p-3">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-slate-500">
                    Node Type
                  </p>

                  <p
                    className={`mt-1 text-sm font-semibold ${typeText[selectedNode.type]}`}
                  >
                    {selectedNode.type}
                  </p>
                </div>

                <div
                  className={`h-3 w-3 rounded-full ${typeAccent[selectedNode.type]}`}
                />
              </div>

              <InspectorField
                label="Label"
                value={selectedNode.label}
                onChange={(value) =>
                  updateNode(selectedNode.id, { label: value })
                }
              />

              <InspectorField
                label="Rule ID"
                value={selectedNode.ruleId}
                onChange={(value) =>
                  updateNode(selectedNode.id, { ruleId: value })
                }
                mono
              />

              <div>
                <label className="mb-1.5 block text-[10px] font-medium text-slate-500">
                  Description
                </label>

                <textarea
                  value={selectedNode.description}
                  onChange={(event) =>
                    updateNode(selectedNode.id, {
                      description: event.target.value,
                    })
                  }
                  rows={4}
                  className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs leading-5 text-slate-200 outline-none transition focus:border-violet-400/40"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-medium text-slate-500">
                  Severity
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      "Low",
                      "Medium",
                      "High",
                      "Critical",
                    ] as Severity[]
                  ).map((severity) => (
                    <button
                      key={severity}
                      onClick={() =>
                        updateNode(selectedNode.id, {
                          severity,
                        })
                      }
                      className={`rounded-lg border px-2 py-2 text-[10px] ${
                        selectedNode.severity === severity
                          ? severityStyles[severity]
                          : "border-white/10 bg-white/[0.02] text-slate-500"
                      }`}
                    >
                      {severity}
                    </button>
                  ))}
                </div>
              </div>

              <InspectorField
                label="Parameters"
                value={selectedNode.parameters}
                onChange={(value) =>
                  updateNode(selectedNode.id, {
                    parameters: value,
                  })
                }
                mono
              />

              <InspectorField
                label="Metadata"
                value={selectedNode.metadata}
                onChange={(value) =>
                  updateNode(selectedNode.id, {
                    metadata: value,
                  })
                }
                mono
              />

              <div className="border-t border-white/10 pt-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Node Position
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <InspectorField
                    label="X"
                    value={String(Math.round(selectedNode.x))}
                    onChange={(value) =>
                      updateNode(selectedNode.id, {
                        x: Number(value) || 0,
                      })
                    }
                    mono
                  />

                  <InspectorField
                    label="Y"
                    value={String(Math.round(selectedNode.y))}
                    onChange={(value) =>
                      updateNode(selectedNode.id, {
                        y: Number(value) || 0,
                      })
                    }
                    mono
                  />
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Connections
                </p>

                <div className="space-y-2">
                  <ConnectionList
                    title="Parents"
                    nodes={nodes}
                    edges={edges}
                    nodeId={selectedNode.id}
                    direction="parents"
                  />

                  <ConnectionList
                    title="Children"
                    nodes={nodes}
                    edges={edges}
                    nodeId={selectedNode.id}
                    direction="children"
                  />
                </div>
              </div>

              <button
                onClick={deleteNode}
                disabled={selectedNode.type === "Root"}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-400/20 bg-red-500/5 px-3 py-2.5 text-xs font-medium text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Trash2 size={14} />
                Delete Node
              </button>
            </div>
          ) : (
            <div className="flex h-80 flex-col items-center justify-center px-8 text-center">
              <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <Settings2
                  size={20}
                  className="text-slate-600"
                />
              </div>

              <p className="text-xs font-medium text-slate-400">
                No node selected
              </p>

              <p className="mt-1 text-[10px] leading-4 text-slate-600">
                Select a node on the canvas to edit its properties.
              </p>
            </div>
          )}
        </aside>
      </div>

      {/* IMPORT MODAL */}
      {importOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0c131e] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-violet-500/10 p-2 text-violet-300">
                  <FileJson size={18} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold">
                    Import Tree JSON
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Paste an exported Glynac tree definition.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setImportOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-white/[0.06] hover:text-white"
              >
                <X size={17} />
              </button>
            </div>

            <div className="p-5">
              <textarea
                value={importText}
                onChange={(event) =>
                  setImportText(event.target.value)
                }
                placeholder={`{
  "nodes": [],
  "edges": []
}`}
                className="h-80 w-full resize-none rounded-xl border border-white/10 bg-[#070b12] p-4 font-mono text-xs leading-5 text-slate-300 outline-none focus:border-violet-400/40"
              />

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setImportOpen(false)}
                  className="rounded-lg border border-white/10 px-4 py-2 text-xs text-slate-400 hover:bg-white/[0.05]"
                >
                  Cancel
                </button>

                <button
                  onClick={importJSON}
                  className="flex items-center gap-2 rounded-lg bg-violet-500 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-400"
                >
                  <Upload size={14} />
                  Import Tree
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function InspectorField({
  label,
  value,
  onChange,
  mono = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  mono?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-medium text-slate-500">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-200 outline-none transition focus:border-violet-400/40 ${
          mono ? "font-mono" : ""
        }`}
      />
    </div>
  );
}

function ConnectionList({
  title,
  nodes,
  edges,
  nodeId,
  direction,
}: {
  title: string;
  nodes: TreeNode[];
  edges: TreeEdge[];
  nodeId: string;
  direction: "parents" | "children";
}) {
  const connectedIds =
    direction === "parents"
      ? edges
          .filter((edge) => edge.target === nodeId)
          .map((edge) => edge.source)
      : edges
          .filter((edge) => edge.source === nodeId)
          .map((edge) => edge.target);

  const connectedNodes = nodes.filter((node) =>
    connectedIds.includes(node.id)
  );

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
      <div className="mb-2 flex items-center gap-2">
        {direction === "parents" ? (
          <ArrowUp size={12} className="text-slate-600" />
        ) : (
          <ArrowDown size={12} className="text-slate-600" />
        )}

        <span className="text-[9px] uppercase tracking-wider text-slate-500">
          {title}
        </span>
      </div>

      {connectedNodes.length > 0 ? (
        <div className="space-y-1">
          {connectedNodes.map((node) => (
            <div
              key={node.id}
              className="flex items-center justify-between rounded-md bg-black/10 px-2 py-1.5"
            >
              <span className="truncate text-[10px] text-slate-400">
                {node.label}
              </span>

              <span className="ml-2 text-[8px] text-slate-600">
                {node.type}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[9px] text-slate-600">
          No connections
        </p>
      )}
    </div>
  );
}