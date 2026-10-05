"use client";

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
  CircleDot,
  Clipboard,
  Copy,
  Download,
  Eye,
  FileJson,
  Grid3X3,
  Hand,
  Info,
  Layers3,
  Link2,
  Maximize2,
  Minus,
  MousePointer2,
  Move,
  Network,
  Plus,
  RefreshCcw,
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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
  parameters: Record<string, string>;
  metadata: Record<string, string>;
};

type TreeEdge = {
  id: string;
  source: string;
  target: string;
};

const NODE_WIDTH = 220;
const NODE_HEIGHT = 118;

const CANVAS_WIDTH = 1800;
const CANVAS_HEIGHT = 1100;

const typeConfig: Record<
  NodeType,
  {
    icon: any;
    color: string;
    bg: string;
    border: string;
  }
> = {
  Root: {
    icon: ShieldCheck,
    color: "text-violet-300",
    bg: "bg-violet-500/10",
    border: "border-violet-400/30",
  },
  Rule: {
    icon: Layers3,
    color: "text-blue-300",
    bg: "bg-blue-500/10",
    border: "border-blue-400/30",
  },
  Condition: {
    icon: CircleDot,
    color: "text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-400/30",
  },
  Action: {
    icon: Activity,
    color: "text-emerald-300",
    bg: "bg-emerald-500/10",
    border: "border-emerald-400/30",
  },
};

const severityConfig: Record<
  Severity,
  {
    color: string;
    bg: string;
    border: string;
  }
> = {
  Low: {
    color: "text-slate-300",
    bg: "bg-slate-500/10",
    border: "border-slate-400/20",
  },
  Medium: {
    color: "text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-400/20",
  },
  High: {
    color: "text-orange-300",
    bg: "bg-orange-500/10",
    border: "border-orange-400/20",
  },
  Critical: {
    color: "text-red-300",
    bg: "bg-red-500/10",
    border: "border-red-400/20",
  },
};

const initialNodes: TreeNode[] = [
  {
    id: "root",
    type: "Root",
    x: 780,
    y: 80,
    label: "Compliance Policy",
    ruleId: "POLICY-001",
    description:
      "Primary compliance workflow controlling regulated communications.",
    severity: "High",
    parameters: {
      owner: "Compliance Team",
      version: "1.0",
    },
    metadata: {
      createdBy: "Admin",
      environment: "Production",
    },
  },
  {
    id: "rule-finra",
    type: "Rule",
    x: 470,
    y: 300,
    label: "FINRA 2210",
    ruleId: "FINRA-2210",
    description:
      "Communications with the public must meet applicable FINRA standards.",
    severity: "High",
    parameters: {
      category: "Communications",
      approval: "Required",
    },
    metadata: {
      source: "FINRA",
      version: "2026",
    },
  },
  {
    id: "rule-sec",
    type: "Rule",
    x: 1090,
    y: 300,
    label: "SEC Recordkeeping",
    ruleId: "SEC-17a-4",
    description:
      "Business communications must be retained according to SEC requirements.",
    severity: "Critical",
    parameters: {
      retention: "7 years",
      storage: "Immutable",
    },
    metadata: {
      source: "SEC",
      version: "2026",
    },
  },
  {
    id: "condition-claim",
    type: "Condition",
    x: 300,
    y: 540,
    label: "Contains Claim",
    ruleId: "COND-001",
    description:
      "Checks whether the communication contains a performance or financial claim.",
    severity: "Medium",
    parameters: {
      field: "message",
      operator: "contains",
    },
    metadata: {
      detector: "claim-detector",
    },
  },
  {
    id: "action-approval",
    type: "Action",
    x: 600,
    y: 760,
    label: "Require Approval",
    ruleId: "ACT-001",
    description:
      "Routes the communication to a compliance reviewer before publication.",
    severity: "High",
    parameters: {
      queue: "Compliance Review",
      priority: "High",
    },
    metadata: {
      action: "manual-review",
    },
  },
  {
    id: "condition-record",
    type: "Condition",
    x: 1060,
    y: 540,
    label: "Record Exists",
    ruleId: "COND-002",
    description:
      "Checks whether an immutable record exists for the communication.",
    severity: "Critical",
    parameters: {
      storage: "archive",
      operator: "exists",
    },
    metadata: {
      detector: "record-check",
    },
  },
];

const initialEdges: TreeEdge[] = [
  {
    id: "edge-root-finra",
    source: "root",
    target: "rule-finra",
  },
  {
    id: "edge-root-sec",
    source: "root",
    target: "rule-sec",
  },
  {
    id: "edge-finra-condition",
    source: "rule-finra",
    target: "condition-claim",
  },
  {
    id: "edge-condition-action",
    source: "condition-claim",
    target: "action-approval",
  },
  {
    id: "edge-sec-condition",
    source: "rule-sec",
    target: "condition-record",
  },
];

export default function TreeEditorPage() {
  const [nodes, setNodes] = useState<TreeNode[]>(initialNodes);
  const [edges, setEdges] = useState<TreeEdge[]>(initialEdges);

  const [selectedId, setSelectedId] = useState("root");

  const [zoom, setZoom] = useState(0.82);
  const [search, setSearch] = useState("");

  const [showGrid, setShowGrid] = useState(true);
  const [showMinimap, setShowMinimap] = useState(true);

  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [reparentingId, setReparentingId] = useState<string | null>(null);

  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");

  const [validation, setValidation] = useState<{
    valid: boolean;
    errors: string[];
  } | null>(null);

  const [isPanning, setIsPanning] = useState(false);

  const canvasRef = useRef<HTMLDivElement | null>(null);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedId),
    [nodes, selectedId]
  );

  const filteredNodes = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return nodes;

    return nodes.filter(
      (node) =>
        node.label.toLowerCase().includes(query) ||
        node.ruleId.toLowerCase().includes(query) ||
        node.type.toLowerCase().includes(query)
    );
  }, [nodes, search]);

  const nodeMap = useMemo(() => {
    return new Map(nodes.map((node) => [node.id, node]));
  }, [nodes]);

  const incomingEdges = useMemo(() => {
    if (!selectedNode) return [];

    return edges.filter((edge) => edge.target === selectedNode.id);
  }, [edges, selectedNode]);

  const outgoingEdges = useMemo(() => {
    if (!selectedNode) return [];

    return edges.filter((edge) => edge.source === selectedNode.id);
  }, [edges, selectedNode]);

  const updateNode = useCallback(
    (id: string, patch: Partial<TreeNode>) => {
      setNodes((current) =>
        current.map((node) =>
          node.id === id ? { ...node, ...patch } : node
        )
      );

      setValidation(null);
    },
    []
  );

  const addNode = useCallback(
    (type: NodeType, parentId?: string) => {
      const parent = parentId
        ? nodes.find((node) => node.id === parentId)
        : undefined;

      const id = `${type.toLowerCase()}-${Date.now()}`;

      const newNode: TreeNode = {
        id,
        type,
        x: parent ? parent.x + 280 : 650,
        y: parent ? parent.y + 210 : 300,
        label: `New ${type}`,
        ruleId: `NEW-${Date.now().toString().slice(-4)}`,
        description: `New ${type.toLowerCase()} node.`,
        severity: "Medium",
        parameters: {},
        metadata: {},
      };

      setNodes((current) => [...current, newNode]);

      if (parent) {
        setEdges((current) => [
          ...current,
          {
            id: `edge-${parent.id}-${id}`,
            source: parent.id,
            target: id,
          },
        ]);
      }

      setSelectedId(id);
      setValidation(null);
    },
    [nodes]
  );

  const addChild = () => {
    if (!selectedNode) return;

    const type: NodeType =
      selectedNode.type === "Root"
        ? "Rule"
        : selectedNode.type === "Rule"
        ? "Condition"
        : selectedNode.type === "Condition"
        ? "Action"
        : "Action";

    addNode(type, selectedNode.id);
  };

  const duplicateNode = () => {
    if (!selectedNode) return;

    const id = `${selectedNode.type.toLowerCase()}-${Date.now()}`;

    const copy: TreeNode = {
      ...selectedNode,
      id,
      x: selectedNode.x + 280,
      y: selectedNode.y + 80,
      label: `${selectedNode.label} Copy`,
      ruleId: `${selectedNode.ruleId}-COPY`,
      parameters: { ...selectedNode.parameters },
      metadata: { ...selectedNode.metadata },
    };

    setNodes((current) => [...current, copy]);

    const parent = edges.find((edge) => edge.target === selectedNode.id);

    if (parent) {
      setEdges((current) => [
        ...current,
        {
          id: `edge-${parent.source}-${id}`,
          source: parent.source,
          target: id,
        },
      ]);
    }

    setSelectedId(id);
  };

  const deleteNode = () => {
    if (!selectedNode || selectedNode.type === "Root") return;

    const id = selectedNode.id;

    setNodes((current) => current.filter((node) => node.id !== id));

    setEdges((current) =>
      current.filter(
        (edge) => edge.source !== id && edge.target !== id
      )
    );

    setSelectedId("root");
    setConnectingFrom(null);
    setReparentingId(null);
    setValidation(null);
  };

  const startConnection = (nodeId: string) => {
    setReparentingId(null);
    setConnectingFrom(nodeId);
  };

  const finishConnection = (targetId: string) => {
    if (!connectingFrom || connectingFrom === targetId) {
      setConnectingFrom(null);
      return;
    }

    const exists = edges.some(
      (edge) =>
        edge.source === connectingFrom && edge.target === targetId
    );

    if (!exists) {
      setEdges((current) => [
        ...current,
        {
          id: `edge-${connectingFrom}-${targetId}-${Date.now()}`,
          source: connectingFrom,
          target: targetId,
        },
      ]);
    }

    setConnectingFrom(null);
    setValidation(null);
  };

  const startReparent = () => {
    if (!selectedNode || selectedNode.type === "Root") return;

    setConnectingFrom(null);
    setReparentingId(selectedNode.id);
  };

  const isDescendant = (ancestorId: string, targetId: string) => {
    const visited = new Set<string>();

    const walk = (id: string): boolean => {
      if (visited.has(id)) return false;

      visited.add(id);

      const children = edges
        .filter((edge) => edge.source === id)
        .map((edge) => edge.target);

      if (children.includes(targetId)) return true;

      return children.some(walk);
    };

    return walk(ancestorId);
  };

  const finishReparent = (newParentId: string) => {
    if (!reparentingId) return;

    if (newParentId === reparentingId) {
      setReparentingId(null);
      return;
    }

    if (isDescendant(reparentingId, newParentId)) {
      setValidation({
        valid: false,
        errors: [
          "Reparenting would create a circular reference. Choose a node outside the selected node's descendants.",
        ],
      });

      setReparentingId(null);
      return;
    }

    setEdges((current) => {
      const withoutOldParents = current.filter(
        (edge) => edge.target !== reparentingId
      );

      const alreadyConnected = withoutOldParents.some(
        (edge) =>
          edge.source === newParentId &&
          edge.target === reparentingId
      );

      if (alreadyConnected) return withoutOldParents;

      return [
        ...withoutOldParents,
        {
          id: `edge-${newParentId}-${reparentingId}-${Date.now()}`,
          source: newParentId,
          target: reparentingId,
        },
      ];
    });

    setReparentingId(null);
    setValidation(null);
  };

  const deleteEdge = (edgeId: string) => {
    setEdges((current) =>
      current.filter((edge) => edge.id !== edgeId)
    );

    setValidation(null);
  };

  const resetView = () => {
    setZoom(0.82);

    if (canvasRef.current) {
      canvasRef.current.scrollLeft = 0;
      canvasRef.current.scrollTop = 0;
    }
  };

  const autoLayout = () => {
    const children = new Map<string, string[]>();

    edges.forEach((edge) => {
      if (!children.has(edge.source)) {
        children.set(edge.source, []);
      }

      children.get(edge.source)!.push(edge.target);
    });

    const root = nodes.find((node) => node.type === "Root");

    if (!root) return;

    const positions = new Map<
      string,
      {
        x: number;
        y: number;
      }
    >();

    positions.set(root.id, {
      x: 780,
      y: 70,
    });

    const queue: {
      id: string;
      level: number;
      index: number;
      total: number;
    }[] = [
      {
        id: root.id,
        level: 0,
        index: 0,
        total: 1,
      },
    ];

    const visited = new Set<string>([root.id]);

    while (queue.length) {
      const current = queue.shift()!;

      const childIds = children.get(current.id) || [];

      childIds.forEach((childId, index) => {
        if (visited.has(childId)) return;

        visited.add(childId);

        const spread = 340;

        const center =
          (childIds.length - 1) / 2;

        positions.set(childId, {
          x:
            positions.get(current.id)!.x +
            (index - center) * spread,
          y:
            positions.get(current.id)!.y + 210,
        });

        queue.push({
          id: childId,
          level: current.level + 1,
          index,
          total: childIds.length,
        });
      });
    }

    setNodes((current) =>
      current.map((node) => {
        const position = positions.get(node.id);

        return position
          ? {
              ...node,
              x: Math.max(30, position.x),
              y: Math.max(30, position.y),
            }
          : node;
      })
    );
  };

  const validateTree = () => {
    const errors: string[] = [];

    const root = nodes.find((node) => node.type === "Root");

    if (!root) {
      errors.push("No Root node exists.");
    }

    const incoming = new Map<string, number>();

    nodes.forEach((node) => {
      incoming.set(node.id, 0);
    });

    edges.forEach((edge) => {
      incoming.set(
        edge.target,
        (incoming.get(edge.target) || 0) + 1
      );
    });

    nodes.forEach((node) => {
      if (node.type !== "Root" && !incoming.get(node.id)) {
        errors.push(`Orphan node: ${node.label}`);
      }
    });

    const adjacency = new Map<string, string[]>();

    edges.forEach((edge) => {
      if (!adjacency.has(edge.source)) {
        adjacency.set(edge.source, []);
      }

      adjacency.get(edge.source)!.push(edge.target);
    });

    const visiting = new Set<string>();
    const visited = new Set<string>();

    const detectCycle = (id: string): boolean => {
      if (visiting.has(id)) return true;
      if (visited.has(id)) return false;

      visiting.add(id);

      for (const child of adjacency.get(id) || []) {
        if (detectCycle(child)) return true;
      }

      visiting.delete(id);
      visited.add(id);

      return false;
    };

    for (const node of nodes) {
      if (detectCycle(node.id)) {
        errors.push("Circular reference detected.");
        break;
      }
    }

    setValidation({
      valid: errors.length === 0,
      errors,
    });
  };

  const exportJSON = () => {
    const payload = JSON.stringify(
      {
        nodes,
        edges,
      },
      null,
      2
    );

    const blob = new Blob([payload], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "compliance-tree.json";
    anchor.click();

    URL.revokeObjectURL(url);
  };

  const importJSON = () => {
    try {
      const parsed = JSON.parse(importText);

      if (
        !Array.isArray(parsed.nodes) ||
        !Array.isArray(parsed.edges)
      ) {
        throw new Error("Invalid tree structure.");
      }

      setNodes(parsed.nodes);
      setEdges(parsed.edges);

      setSelectedId(parsed.nodes[0]?.id || "");
      setImportOpen(false);
      setImportText("");
      setValidation({
        valid: true,
        errors: [],
      });
    } catch {
      setValidation({
        valid: false,
        errors: ["Invalid JSON. Please provide a valid tree export."],
      });
    }
  };

  const handleCanvasMouseDown = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (
      event.target === event.currentTarget ||
      (event.target as HTMLElement).dataset.canvas === "true"
    ) {
      setIsPanning(true);
    }
  };

  useEffect(() => {
    const handleMouseUp = () => {
      setIsPanning(false);
    };

    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const moveNode = (
    nodeId: string,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    event.stopPropagation();

    const startX = event.clientX;
    const startY = event.clientY;

    const node = nodes.find((item) => item.id === nodeId);

    if (!node) return;

    const startNodeX = node.x;
    const startNodeY = node.y;

    const handleMove = (moveEvent: MouseEvent) => {
      const dx = (moveEvent.clientX - startX) / zoom;
      const dy = (moveEvent.clientY - startY) / zoom;

      updateNode(nodeId, {
        x: Math.max(
          20,
          Math.min(
            CANVAS_WIDTH - NODE_WIDTH - 20,
            startNodeX + dx
          )
        ),
        y: Math.max(
          20,
          Math.min(
            CANVAS_HEIGHT - NODE_HEIGHT - 20,
            startNodeY + dy
          )
        ),
      });
    };

    const handleUp = () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
  };

  const getNodeCenter = (node: TreeNode) => ({
    x: node.x + NODE_WIDTH / 2,
    y: node.y + NODE_HEIGHT / 2,
  });

  const getEdgePath = (
    source: TreeNode,
    target: TreeNode
  ) => {
    const start = {
      x: source.x + NODE_WIDTH / 2,
      y: source.y + NODE_HEIGHT,
    };

    const end = {
      x: target.x + NODE_WIDTH / 2,
      y: target.y,
    };

    const middleY = start.y + (end.y - start.y) / 2;

    return `
      M ${start.x} ${start.y}
      C ${start.x} ${middleY},
        ${end.x} ${middleY},
        ${end.x} ${end.y}
    `;
  };

  return (
    <div className="min-h-screen bg-[#050914] text-slate-100">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[25%] top-[-200px] h-[500px] w-[500px] rounded-full bg-violet-600/8 blur-[140px]" />
        <div className="absolute right-[-100px] top-[30%] h-[400px] w-[400px] rounded-full bg-blue-600/6 blur-[130px]" />
      </div>

      {/* Header */}
      <header className="relative z-50 flex h-[70px] items-center justify-between border-b border-white/10 bg-[#080e18]/95 px-5 shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-gradient-to-br from-violet-500/20 to-blue-500/10 shadow-lg shadow-violet-950/20">
            <Network
              size={20}
              className="text-violet-300"
            />
          </div>

          <div>
            <h1 className="text-sm font-semibold tracking-tight">
              Compliance Tree Editor
            </h1>

            <p className="mt-0.5 text-[11px] text-slate-500">
              Interactive policy workflow builder
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.025] px-3 py-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-[11px] text-slate-400">
              Local workspace
            </span>
          </div>

          <div className="h-5 w-px bg-white/10" />

          <span className="text-[11px] text-slate-500">
            {nodes.length} nodes · {edges.length} connections
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={validateTree}
            className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-medium text-slate-300 shadow-sm transition-all hover:border-emerald-400/20 hover:bg-emerald-500/[0.06] hover:text-emerald-200 active:scale-[0.98] sm:flex"
          >
            <ShieldCheck size={15} />
            Validate
          </button>

          <button
            onClick={() => setImportOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-medium text-slate-300 shadow-sm transition-all hover:bg-white/[0.07] hover:text-white active:scale-[0.98]"
          >
            <Upload size={15} />
            <span className="hidden sm:inline">
              Import
            </span>
          </button>

          <button
            onClick={exportJSON}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-950/30 transition-all hover:from-violet-400 hover:to-indigo-400 active:scale-[0.98]"
          >
            <Download size={15} />
            Export JSON
          </button>
        </div>
      </header>

      <div className="relative z-10 flex h-[calc(100vh-70px)]">
        {/* Left sidebar */}
        <aside className="w-[255px] shrink-0 overflow-y-auto border-r border-white/10 bg-[#080e18] p-4 shadow-[10px_0_35px_rgba(0,0,0,0.12)]">
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Node Palette
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Drag nodes onto the canvas
                </p>
              </div>

              <Sparkles
                size={15}
                className="text-violet-400"
              />
            </div>

            <div className="space-y-2">
              {(
                Object.keys(typeConfig) as NodeType[]
              ).map((type) => {
                const config = typeConfig[type];
                const Icon = config.icon;

                return (
                  <div
                    key={type}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData(
                        "node-type",
                        type
                      );
                    }}
                    className={`group cursor-grab rounded-xl border p-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06] hover:shadow-lg hover:shadow-black/20 active:cursor-grabbing active:translate-y-0 ${config.border} ${config.bg}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-black/10 ${config.color}`}
                      >
                        <Icon size={17} />
                      </div>

                      <div className="min-w-0">
                        <p
                          className={`text-xs font-semibold ${config.color}`}
                        >
                          {type}
                        </p>

                        <p className="mt-0.5 text-[10px] leading-4 text-slate-500">
                          {type === "Root" &&
                            "Top-level policy node"}
                          {type === "Rule" &&
                            "Compliance rule"}
                          {type === "Condition" &&
                            "Decision condition"}
                          {type === "Action" &&
                            "Workflow action"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mb-5">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Quick Actions
            </p>

            <div className="space-y-2">
              <button
                onClick={addChild}
                disabled={!selectedNode}
                className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2.5 text-xs font-medium text-slate-300 shadow-sm transition-all hover:border-white/15 hover:bg-white/[0.07] hover:text-white active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <Plus size={15} />
                Add Child
              </button>

              <button
                onClick={duplicateNode}
                disabled={!selectedNode}
                className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2.5 text-xs font-medium text-slate-300 shadow-sm transition-all hover:border-white/15 hover:bg-white/[0.07] hover:text-white active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <Copy size={15} />
                Duplicate
              </button>

              <button
                onClick={startReparent}
                disabled={
                  !selectedNode ||
                  selectedNode.type === "Root"
                }
                className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-35 ${
                  reparentingId
                    ? "border-violet-400/30 bg-violet-500/10 text-violet-300"
                    : "border-white/10 bg-white/[0.025] text-slate-300 hover:border-white/15 hover:bg-white/[0.07] hover:text-white"
                }`}
              >
                <Link2 size={15} />
                {reparentingId
                  ? "Choose New Parent"
                  : "Reparent Node"}
              </button>

              <button
                onClick={() => {
                  if (selectedNode) {
                    startConnection(selectedNode.id);
                  }
                }}
                disabled={!selectedNode}
                className="flex w-full items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500/[0.06] px-3 py-2.5 text-xs font-medium text-violet-300 shadow-sm transition-all hover:bg-violet-500/10 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <MousePointer2 size={15} />
                Connect Node
              </button>

              <button
                onClick={autoLayout}
                className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2.5 text-xs font-medium text-slate-300 shadow-sm transition-all hover:border-white/15 hover:bg-white/[0.07] hover:text-white active:scale-[0.99]"
              >
                <Network size={15} />
                Auto Layout
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-violet-400/10 bg-gradient-to-br from-white/[0.035] to-white/[0.015] p-3.5 shadow-inner">
            <div className="flex items-center gap-2">
              <Info
                size={15}
                className="text-violet-300"
              />

              <p className="text-xs font-semibold text-slate-300">
                Editor Tips
              </p>
            </div>

            <ul className="mt-3 space-y-2 text-[10px] leading-4 text-slate-500">
              <li>• Drag nodes to reposition them.</li>
              <li>• Double-click an edge to remove it.</li>
              <li>• Use Reparent to move a node.</li>
              <li>• Validate before exporting.</li>
            </ul>
          </div>
        </aside>

        {/* Canvas */}
        <main
          ref={canvasRef}
          className={`relative min-w-0 flex-1 overflow-auto bg-[#060b14] ${
            isPanning ? "cursor-grabbing" : ""
          }`}
          onMouseDown={handleCanvasMouseDown}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();

            const type = event.dataTransfer.getData(
              "node-type"
            ) as NodeType;

            if (!type) return;

            const rect =
              canvasRef.current?.getBoundingClientRect();

            if (!rect) return;

            addNode(type);
          }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.09),transparent_42%)]" />

          {/* Canvas toolbar */}
          <div className="absolute left-5 right-5 top-5 z-30 flex items-center justify-between">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0b121d]/90 p-1.5 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <button
                onClick={() =>
                  setZoom((value) =>
                    Math.min(1.5, value + 0.1)
                  )
                }
                className="rounded-lg p-2 text-slate-400 transition-all hover:bg-white/[0.08] hover:text-white active:scale-95"
              >
                <ZoomIn size={15} />
              </button>

              <span className="min-w-[48px] text-center text-[11px] font-medium text-slate-400">
                {Math.round(zoom * 100)}%
              </span>

              <button
                onClick={() =>
                  setZoom((value) =>
                    Math.max(0.45, value - 0.1)
                  )
                }
                className="rounded-lg p-2 text-slate-400 transition-all hover:bg-white/[0.08] hover:text-white active:scale-95"
              >
                <ZoomOut size={15} />
              </button>

              <div className="mx-1 h-5 w-px bg-white/10" />

              <button
                onClick={resetView}
                title="Reset view"
                className="rounded-lg p-2 text-slate-400 transition-all hover:bg-white/[0.08] hover:text-white active:scale-95"
              >
                <RotateCcw size={15} />
              </button>

              <button
                onClick={() =>
                  setShowGrid((value) => !value)
                }
                title="Toggle grid"
                className={`rounded-lg p-2 transition-all ${
                  showGrid
                    ? "bg-violet-500/10 text-violet-300"
                    : "text-slate-500 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <Grid3X3 size={15} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0b121d]/90 px-3 py-2 shadow-2xl shadow-black/30 backdrop-blur-xl">
                <Search
                  size={14}
                  className="text-slate-500"
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search nodes..."
                  className="w-40 bg-transparent text-xs text-white outline-none placeholder:text-slate-600"
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

              <button
                onClick={() =>
                  setShowMinimap((value) => !value)
                }
                className={`rounded-xl border border-white/10 bg-[#0b121d]/90 p-2.5 shadow-xl backdrop-blur-xl ${
                  showMinimap
                    ? "text-violet-300"
                    : "text-slate-500"
                }`}
                title="Toggle minimap"
              >
                <Maximize2 size={15} />
              </button>
            </div>
          </div>

          {/* Mode banner */}
          {(connectingFrom || reparentingId) && (
            <div className="absolute left-1/2 top-24 z-40 -translate-x-1/2 rounded-full border border-violet-400/25 bg-violet-500/10 px-5 py-2.5 text-xs font-medium text-violet-200 shadow-2xl shadow-violet-950/20 backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <Link2 size={14} />

                {reparentingId
                  ? "Reparent mode — click the new parent node"
                  : "Connection mode — click a target node"}

                <button
                  onClick={() => {
                    setConnectingFrom(null);
                    setReparentingId(null);
                  }}
                  className="ml-2 rounded-full p-1 hover:bg-white/10"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          )}

          {/* Canvas */}
          <div
            data-canvas="true"
            className="relative"
            style={{
              width: CANVAS_WIDTH * zoom,
              height: CANVAS_HEIGHT * zoom,
              minWidth: CANVAS_WIDTH * zoom,
              minHeight: CANVAS_HEIGHT * zoom,
            }}
          >
            <div
              data-canvas="true"
              className="absolute left-0 top-0"
              style={{
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
                backgroundImage: showGrid
                  ? `
                    linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)
                  `
                  : "none",
                backgroundSize: "32px 32px",
              }}
            >
              {/* Edges */}
              <svg
                className="pointer-events-none absolute inset-0 overflow-visible"
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
              >
                <defs>
                  <marker
                    id="tree-arrow"
                    markerWidth="8"
                    markerHeight="8"
                    refX="6"
                    refY="3"
                    orient="auto"
                  >
                    <path
                      d="M0,0 L0,6 L7,3 z"
                      fill="rgba(148,163,184,0.65)"
                    />
                  </marker>

                  <marker
                    id="tree-arrow-active"
                    markerWidth="8"
                    markerHeight="8"
                    refX="6"
                    refY="3"
                    orient="auto"
                  >
                    <path
                      d="M0,0 L0,6 L7,3 z"
                      fill="#a78bfa"
                    />
                  </marker>
                </defs>

                {edges.map((edge) => {
                  const source = nodeMap.get(edge.source);
                  const target = nodeMap.get(edge.target);

                  if (!source || !target) return null;

                  const active =
                    selectedId === edge.source ||
                    selectedId === edge.target;

                  return (
                    <g key={edge.id}>
                      <path
                        d={getEdgePath(
                          source,
                          target
                        )}
                        fill="none"
                        stroke={
                          active
                            ? "rgba(167,139,250,0.75)"
                            : "rgba(100,116,139,0.45)"
                        }
                        strokeWidth={active ? 2.4 : 1.6}
                        markerEnd={
                          active
                            ? "url(#tree-arrow-active)"
                            : "url(#tree-arrow)"
                        }
                        className="pointer-events-auto cursor-pointer transition-all"
                        onDoubleClick={() =>
                          deleteEdge(edge.id)
                        }
                      />

                      {active && (
                        <circle
                          cx={
                            (source.x +
                              target.x +
                              NODE_WIDTH) /
                            2
                          }
                          cy={
                            (source.y +
                              target.y +
                              NODE_HEIGHT) /
                            2
                          }
                          r="3"
                          fill="#a78bfa"
                          className="animate-pulse"
                        />
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Nodes */}
              {filteredNodes.map((node) => {
                const config = typeConfig[node.type];
                const severity =
                  severityConfig[node.severity];

                const Icon = config.icon;

                const selected =
                  selectedId === node.id;

                const connecting =
                  connectingFrom === node.id;

                const reparentTarget =
                  reparentingId &&
                  reparentingId !== node.id;

                return (
                  <div
                    key={node.id}
                    onClick={(event) => {
                      event.stopPropagation();

                      if (reparentingId) {
                        finishReparent(node.id);
                        setSelectedId(node.id);
                        return;
                      }

                      if (connectingFrom) {
                        finishConnection(node.id);
                        setSelectedId(node.id);
                        return;
                      }

                      setSelectedId(node.id);
                    }}
                    onMouseDown={(event) =>
                      moveNode(node.id, event)
                    }
                    className={`absolute select-none rounded-2xl border bg-[#0b121d]/95 shadow-2xl shadow-black/25 backdrop-blur-xl transition-shadow ${
                      config.border
                    } ${
                      selected
                        ? "ring-2 ring-violet-400/70 shadow-[0_0_0_4px_rgba(139,92,246,0.08),0_20px_50px_rgba(0,0,0,0.35)]"
                        : "hover:shadow-[0_18px_45px_rgba(0,0,0,0.32)]"
                    } ${
                      connecting
                        ? "ring-2 ring-violet-300 shadow-[0_0_28px_rgba(139,92,246,0.25)]"
                        : ""
                    } ${
                      reparentTarget
                        ? "cursor-crosshair hover:ring-2 hover:ring-emerald-400/50"
                        : ""
                    }`}
                    style={{
                      left: node.x,
                      top: node.y,
                      width: NODE_WIDTH,
                      height: NODE_HEIGHT,
                    }}
                  >
                    <div className="flex items-center justify-between border-b border-white/10 bg-black/10 px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-lg ${config.bg} ${config.color}`}
                        >
                          <Icon size={14} />
                        </div>

                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wider ${config.color}`}
                        >
                          {node.type}
                        </span>
                      </div>

                      <span
                        className={`rounded-full border px-2 py-0.5 text-[9px] font-medium ${severity.bg} ${severity.border} ${severity.color}`}
                      >
                        {node.severity}
                      </span>
                    </div>

                    <div className="px-3 py-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-xs font-semibold text-white">
                          {node.label}
                        </p>

                        <Move
                          size={12}
                          className="shrink-0 text-slate-600"
                        />
                      </div>

                      <p className="mt-1 truncate font-mono text-[9px] text-slate-500">
                        {node.ruleId}
                      </p>

                      <p className="mt-1.5 line-clamp-2 text-[10px] leading-4 text-slate-500">
                        {node.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Minimap */}
          {showMinimap && (
            <div className="absolute bottom-5 right-5 z-20 h-40 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#0a111c]/90 p-2.5 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                  Minimap
                </span>

                <Eye
                  size={11}
                  className="text-slate-600"
                />
              </div>

              <div className="relative h-[110px] overflow-hidden rounded-lg border border-white/5 bg-[#060b12]">
                {edges.map((edge) => {
                  const source = nodeMap.get(edge.source);
                  const target = nodeMap.get(edge.target);

                  if (!source || !target) return null;

                  const sx =
                    (source.x / CANVAS_WIDTH) * 220;
                  const sy =
                    (source.y / CANVAS_HEIGHT) * 110;
                  const tx =
                    (target.x / CANVAS_WIDTH) * 220;
                  const ty =
                    (target.y / CANVAS_HEIGHT) * 110;

                  return (
                    <div
                      key={edge.id}
                      className="absolute h-px origin-left bg-slate-700"
                      style={{
                        left: sx,
                        top: sy,
                        width: Math.sqrt(
                          (tx - sx) ** 2 +
                            (ty - sy) ** 2
                        ),
                        transform: `rotate(${Math.atan2(
                          ty - sy,
                          tx - sx
                        )}rad)`,
                      }}
                    />
                  );
                })}

                {nodes.map((node) => (
                  <div
                    key={node.id}
                    className={`absolute rounded-sm ${
                      node.id === selectedId
                        ? "bg-violet-400"
                        : node.type === "Root"
                        ? "bg-violet-500"
                        : node.type === "Rule"
                        ? "bg-blue-400"
                        : node.type === "Condition"
                        ? "bg-amber-400"
                        : "bg-emerald-400"
                    }`}
                    style={{
                      left:
                        (node.x / CANVAS_WIDTH) * 220,
                      top:
                        (node.y / CANVAS_HEIGHT) * 110,
                      width: 8,
                      height: 5,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Validation */}
          {validation && (
            <div
              className={`absolute bottom-5 left-5 z-30 max-w-md rounded-2xl border p-3.5 shadow-2xl shadow-black/30 backdrop-blur-xl ${
                validation.valid
                  ? "border-emerald-400/20 bg-emerald-500/[0.07]"
                  : "border-red-400/20 bg-red-500/[0.07]"
              }`}
            >
              <div className="flex gap-3">
                {validation.valid ? (
                  <Check
                    size={17}
                    className="mt-0.5 text-emerald-300"
                  />
                ) : (
                  <AlertCircle
                    size={17}
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
                      ? "Tree validation passed"
                      : "Validation issues found"}
                  </p>

                  {!validation.valid && (
                    <div className="mt-2 space-y-1">
                      {validation.errors.map(
                        (error, index) => (
                          <p
                            key={index}
                            className="text-[10px] leading-4 text-red-200/70"
                          >
                            • {error}
                          </p>
                        )
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setValidation(null)}
                  className="ml-auto text-slate-500 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Inspector */}
        <aside className="w-[325px] shrink-0 overflow-y-auto border-l border-white/10 bg-[#080e18] shadow-[-10px_0_35px_rgba(0,0,0,0.12)]">
          <div className="border-b border-white/10 bg-white/[0.015] px-5 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Inspector
                </p>

                <h2 className="mt-1 text-sm font-semibold text-white">
                  Node Properties
                </h2>
              </div>

              <Settings2
                size={17}
                className="text-slate-500"
              />
            </div>
          </div>

          {!selectedNode ? (
            <div className="flex h-[400px] flex-col items-center justify-center px-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                <MousePointer2
                  size={20}
                  className="text-slate-500"
                />
              </div>

              <p className="mt-4 text-sm font-medium text-slate-300">
                Select a node
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                Select a node on the canvas to inspect
                and edit its properties.
              </p>
            </div>
          ) : (
            <div className="space-y-6 p-5">
              {/* Summary */}
              <div
                className={`rounded-2xl border p-3.5 ${typeConfig[selectedNode.type].border} ${typeConfig[selectedNode.type].bg}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/10 ${typeConfig[selectedNode.type].color}`}
                  >
                    {(() => {
                      const Icon =
                        typeConfig[
                          selectedNode.type
                        ].icon;

                      return <Icon size={18} />;
                    })()}
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`text-[10px] font-semibold uppercase tracking-wider ${typeConfig[selectedNode.type].color}`}
                    >
                      {selectedNode.type}
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-white">
                      {selectedNode.label}
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic properties */}
              <section>
                <SectionTitle
                  icon={<Settings2 size={14} />}
                  title="Basic Properties"
                />

                <div className="space-y-3">
                  <InspectorField
                    label="Label"
                    value={selectedNode.label}
                    onChange={(value) =>
                      updateNode(selectedNode.id, {
                        label: value,
                      })
                    }
                  />

                  <InspectorField
                    label="Rule ID"
                    value={selectedNode.ruleId}
                    onChange={(value) =>
                      updateNode(selectedNode.id, {
                        ruleId: value,
                      })
                    }
                  />

                  <div>
                    <label className="mb-1.5 block text-[10px] font-medium text-slate-500">
                      Description
                    </label>

                    <textarea
                      value={selectedNode.description}
                      onChange={(event) =>
                        updateNode(selectedNode.id, {
                          description:
                            event.target.value,
                        })
                      }
                      rows={4}
                      className="w-full resize-none rounded-xl border border-white/10 bg-[#070d17] px-3 py-2.5 text-xs leading-5 text-slate-200 outline-none transition-all placeholder:text-slate-600 focus:border-violet-400/50 focus:bg-[#09101b] focus:ring-2 focus:ring-violet-500/10"
                    />
                  </div>
                </div>
              </section>

              {/* Severity */}
              <section>
                <SectionTitle
                  icon={<AlertCircle size={14} />}
                  title="Severity"
                />

                <div className="grid grid-cols-2 gap-2">
                  {(
                    Object.keys(
                      severityConfig
                    ) as Severity[]
                  ).map((severity) => {
                    const config =
                      severityConfig[severity];

                    const active =
                      selectedNode.severity ===
                      severity;

                    return (
                      <button
                        key={severity}
                        onClick={() =>
                          updateNode(selectedNode.id, {
                            severity,
                          })
                        }
                        className={`rounded-xl border px-3 py-2 text-[10px] font-medium transition-all ${
                          active
                            ? `${config.border} ${config.bg} ${config.color}`
                            : "border-white/10 bg-white/[0.025] text-slate-500 hover:bg-white/[0.06] hover:text-slate-300"
                        }`}
                      >
                        {severity}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Parameters */}
              <section>
                <SectionTitle
                  icon={<Clipboard size={14} />}
                  title="Parameters"
                />

                <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
                  {Object.entries(
                    selectedNode.parameters
                  ).length === 0 ? (
                    <p className="text-[10px] text-slate-600">
                      No parameters configured.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(
                        selectedNode.parameters
                      ).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between gap-3"
                        >
                          <span className="text-[10px] text-slate-500">
                            {key}
                          </span>

                          <span className="truncate text-[10px] font-medium text-slate-300">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Position */}
              <section>
                <SectionTitle
                  icon={<Move size={14} />}
                  title="Canvas Position"
                />

                <div className="grid grid-cols-2 gap-2">
                  <InspectorField
                    label="X"
                    value={String(
                      Math.round(selectedNode.x)
                    )}
                    onChange={(value) =>
                      updateNode(selectedNode.id, {
                        x: Number(value) || 0,
                      })
                    }
                  />

                  <InspectorField
                    label="Y"
                    value={String(
                      Math.round(selectedNode.y)
                    )}
                    onChange={(value) =>
                      updateNode(selectedNode.id, {
                        y: Number(value) || 0,
                      })
                    }
                  />
                </div>
              </section>

              {/* Connections */}
              <section>
                <SectionTitle
                  icon={<Link2 size={14} />}
                  title="Connections"
                />

                <div className="space-y-2">
                  <ConnectionList
                    title="Parent"
                    edges={incomingEdges}
                    nodeMap={nodeMap}
                    empty="No parent"
                  />

                  <ConnectionList
                    title="Children"
                    edges={outgoingEdges}
                    nodeMap={nodeMap}
                    source
                    empty="No children"
                  />
                </div>
              </section>

              {/* Actions */}
              <section className="border-t border-white/10 pt-5">
                <div className="space-y-2">
                  <button
                    onClick={startReparent}
                    disabled={
                      selectedNode.type === "Root"
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500/[0.06] px-3 py-2.5 text-xs font-medium text-violet-300 transition-all hover:bg-violet-500/10 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Link2 size={14} />
                    Reparent Node
                  </button>

                  <button
                    onClick={deleteNode}
                    disabled={
                      selectedNode.type === "Root"
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/[0.06] px-3 py-2.5 text-xs font-medium text-red-300 shadow-sm transition-all hover:border-red-400/30 hover:bg-red-500/10 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Trash2 size={14} />
                    Delete Node
                  </button>
                </div>
              </section>
            </div>
          )}
        </aside>
      </div>

      {/* Import modal */}
      {importOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0a111c] shadow-[0_30px_100px_rgba(0,0,0,0.55)]">
            <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.015] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                  <FileJson size={17} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Import Tree JSON
                  </h3>

                  <p className="mt-0.5 text-[10px] text-slate-500">
                    Paste a previously exported tree definition.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setImportOpen(false);
                  setImportText("");
                }}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-white/[0.06] hover:text-white"
              >
                <X size={16} />
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
                className="h-80 w-full resize-none rounded-xl border border-white/10 bg-[#050a12] p-4 font-mono text-xs leading-5 text-slate-300 outline-none transition-all focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
              />

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setImportOpen(false);
                    setImportText("");
                  }}
                  className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/[0.07]"
                >
                  Cancel
                </button>

                <button
                  onClick={importJSON}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-950/30 transition-all hover:from-violet-400 hover:to-indigo-400 active:scale-[0.98]"
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

/* -------------------------------------------------------------------------- */
/* Helper Components                                                          */
/* -------------------------------------------------------------------------- */

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <div className="text-slate-500">{icon}</div>

      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {title}
      </p>
    </div>
  );
}

function InspectorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-medium text-slate-500">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-white/10 bg-[#070d17] px-3 py-2.5 text-xs text-slate-200 outline-none transition-all focus:border-violet-400/50 focus:bg-[#09101b] focus:ring-2 focus:ring-violet-500/10"
      />
    </div>
  );
}

function ConnectionList({
  title,
  edges,
  nodeMap,
  source,
  empty,
}: {
  title: string;
  edges: TreeEdge[];
  nodeMap: Map<string, TreeNode>;
  source?: boolean;
  empty: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-medium text-slate-500">
          {title}
        </span>

        <span className="rounded-full bg-white/[0.05] px-1.5 py-0.5 text-[9px] text-slate-600">
          {edges.length}
        </span>
      </div>

      {edges.length === 0 ? (
        <p className="text-[10px] text-slate-600">
          {empty}
        </p>
      ) : (
        <div className="space-y-1.5">
          {edges.map((edge) => {
            const id = source
              ? edge.target
              : edge.source;

            const node = nodeMap.get(id);

            if (!node) return null;

            return (
              <div
                key={edge.id}
                className="flex items-center gap-2 rounded-lg bg-black/10 px-2 py-1.5"
              >
                <div
                  className={`h-1.5 w-1.5 rounded-full ${
                    node.type === "Root"
                      ? "bg-violet-400"
                      : node.type === "Rule"
                      ? "bg-blue-400"
                      : node.type === "Condition"
                      ? "bg-amber-400"
                      : "bg-emerald-400"
                  }`}
                />

                <span className="truncate text-[10px] text-slate-400">
                  {node.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}