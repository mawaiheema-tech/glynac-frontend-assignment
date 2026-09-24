"use client";

import {
  Archive,
  Bot,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Copy,
  File,
  FileText,
  Flag,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Pin,
  Plus,
  Search,
  Send,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  User,
  X,
} from "lucide-react";
import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";

type Role = "user" | "assistant";

type Citation = {
  id: string;
  label: string;
  title: string;
  excerpt: string;
  document: string;
};

type Attachment = {
  id: string;
  name: string;
  size: string;
  type: string;
};

type Message = {
  id: string;
  role: Role;
  content: string;
  timestamp: string;
  citations?: Citation[];
  attachments?: Attachment[];
  feedback?: "up" | "down";
};

type ChatThread = {
  id: string;
  title: string;
  dateGroup: "Today" | "Yesterday" | "Previous 7 Days";
  pinned: boolean;
  messages: Message[];
};

const initialThreads: ChatThread[] = [
  {
    id: "thread-1",
    title: "FINRA-2210 disclosure review",
    dateGroup: "Today",
    pinned: true,
    messages: [
      {
        id: "m1",
        role: "user",
        content:
          "Does Section 4 of the investment agreement create a compliance issue under FINRA-2210?",
        timestamp: "10:42 AM",
        attachments: [
          {
            id: "a1",
            name: "Investment_Agreement_2026.pdf",
            size: "2.4 MB",
            type: "PDF",
          },
        ],
      },
      {
        id: "m2",
        role: "assistant",
        content:
          "Section 4 should be reviewed carefully because it contains language that may be interpreted as a performance-related representation.\n\nFor compliance review, the key point is whether the wording could create an implication of guaranteed or misleading returns. The disclosure should clearly communicate applicable risks and avoid unsupported performance claims.",
        timestamp: "10:42 AM",
        citations: [
          {
            id: "c1",
            label: "FINRA Rule 2210 § 4",
            title: "FINRA Rule 2210 — Communications with the Public",
            excerpt:
              "Communications must be fair and balanced and must not contain false, exaggerated, unwarranted or misleading statements.",
            document: "FINRA-2210-Communications.pdf",
          },
          {
            id: "c2",
            label: "Investment Agreement § 4",
            title: "Investment Agreement 2026",
            excerpt:
              "The advisor may discuss projected investment outcomes subject to applicable risk disclosures.",
            document: "Investment_Agreement_2026.pdf",
          },
        ],
      },
      {
        id: "m3",
        role: "user",
        content: "What should I check before approving this section?",
        timestamp: "10:45 AM",
      },
      {
        id: "m4",
        role: "assistant",
        content:
          "Check these three areas:\n\n• **Performance language:** Look for guaranteed, certain, or risk-free wording.\n• **Risk disclosure:** Confirm material risks are presented clearly.\n• **Supporting evidence:** Make sure performance statements can be substantiated.\n\nYou can also compare the wording against the firm's approved disclosure policy.",
        timestamp: "10:45 AM",
        citations: [
          {
            id: "c3",
            label: "Compliance Policy § 7",
            title: "Firm Compliance Policy",
            excerpt:
              "Marketing and client-facing communications require documented review of performance representations and material risk disclosures.",
            document: "Compliance_Policy.md",
          },
        ],
      },
    ],
  },
  {
    id: "thread-2",
    title: "Client disclosure requirements",
    dateGroup: "Today",
    pinned: false,
    messages: [
      {
        id: "m5",
        role: "user",
        content: "What documents should be checked before a client disclosure is approved?",
        timestamp: "9:18 AM",
      },
      {
        id: "m6",
        role: "assistant",
        content:
          "A typical review should include the relevant client agreement, disclosure statement, supporting performance material, and applicable compliance policy.\n\nThe exact review set depends on the communication type and the firm's internal approval workflow.",
        timestamp: "9:18 AM",
        citations: [
          {
            id: "c4",
            label: "Disclosure Policy § 3",
            title: "Client Disclosure Policy",
            excerpt:
              "Required disclosure materials should be reviewed against the communication type and applicable regulatory requirements.",
            document: "Client_Disclosure_Policy.pdf",
          },
        ],
      },
    ],
  },
  {
    id: "thread-3",
    title: "Regulatory review checklist",
    dateGroup: "Yesterday",
    pinned: false,
    messages: [
      {
        id: "m7",
        role: "user",
        content: "Create a short checklist for regulatory document review.",
        timestamp: "4:26 PM",
      },
      {
        id: "m8",
        role: "assistant",
        content:
          "### Regulatory Review Checklist\n\n1. Confirm the applicable rule.\n2. Identify required disclosures.\n3. Check claims and supporting evidence.\n4. Review risk language.\n5. Record exceptions and reviewer notes.\n6. Complete approval or escalation.",
        timestamp: "4:26 PM",
        citations: [
          {
            id: "c5",
            label: "Review Procedure § 2",
            title: "Regulatory Review Procedure",
            excerpt:
              "Reviewers must document applicable rules, findings, exceptions and final disposition.",
            document: "Review_Procedure.pdf",
          },
        ],
      },
    ],
  },
  {
    id: "thread-4",
    title: "SEC record retention question",
    dateGroup: "Previous 7 Days",
    pinned: false,
    messages: [
      {
        id: "m9",
        role: "user",
        content: "What should our team consider when reviewing record retention?",
        timestamp: "Monday",
      },
      {
        id: "m10",
        role: "assistant",
        content:
          "Record retention reviews should consider the applicable regulatory requirement, document type, retention period, access controls, and the firm's internal retention policy.",
        timestamp: "Monday",
        citations: [
          {
            id: "c6",
            label: "SEC-17a-4",
            title: "SEC Recordkeeping Reference",
            excerpt:
              "Records subject to applicable retention requirements should be preserved according to the governing rule and firm policy.",
            document: "SEC-17a-4-Reference.pdf",
          },
        ],
      },
    ],
  },
];

const quickPrompts = [
  "Check investment agreement for guaranteed return clauses",
  "Summarize the key compliance risks",
  "Create a regulatory review checklist",
  "Find potential disclosure issues",
];

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

function renderMessageContent(content: string, searchTerm = "") {
  const lines = content.split("\n");

  return (
    <div className="space-y-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
      {lines.map((line, index) => {
        if (!line.trim()) return <div key={index} className="h-1" />;

        if (line.startsWith("### ")) {
          return (
            <h3
              key={index}
              className="pt-1 text-base font-bold text-slate-950 dark:text-white"
            >
              {highlightSearch(line.replace("### ", ""), searchTerm)}
            </h3>
          );
        }

        if (/^\d+\.\s/.test(line)) {
          return (
            <div key={index} className="flex gap-2">
              <span className="font-semibold text-slate-500">
                {line.match(/^\d+\./)?.[0]}
              </span>
              <span>{highlightSearch(line.replace(/^\d+\.\s/, ""), searchTerm)}</span>
            </div>
          );
        }

        if (line.startsWith("• ")) {
          return (
            <div key={index} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
              <span>
                {renderInlineMarkdown(line.replace("• ", ""), searchTerm)}
              </span>
            </div>
          );
        }

        return (
          <p key={index}>{renderInlineMarkdown(line, searchTerm)}</p>
        );
      })}
    </div>
  );
}

function highlightSearch(text: string, searchTerm: string) {
  if (!searchTerm.trim()) return text;

  const parts = text.split(new RegExp(`(${escapeRegExp(searchTerm)})`, "gi"));

  return parts.map((part, index) =>
    part.toLowerCase() === searchTerm.toLowerCase() ? (
      <mark
        key={index}
        className="rounded bg-yellow-200 px-0.5 text-yellow-950 dark:bg-yellow-500/30 dark:text-yellow-100"
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function renderInlineMarkdown(text: string, searchTerm: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const value = part.slice(2, -2);

      return (
        <strong
          key={index}
          className="font-semibold text-slate-950 dark:text-white"
        >
          {highlightSearch(value, searchTerm)}
        </strong>
      );
    }

    return <span key={index}>{highlightSearch(part, searchTerm)}</span>;
  });
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function ChatPage() {
  const [threads, setThreads] = useState<ChatThread[]>(initialThreads);
  const [activeThreadId, setActiveThreadId] = useState("thread-1");

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [messageSearch, setMessageSearch] = useState("");
  const [citation, setCitation] = useState<Citation | null>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [dragging, setDragging] = useState(false);

  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const [menuThreadId, setMenuThreadId] = useState<string | null>(null);
  const [feedbackMessageId, setFeedbackMessageId] = useState<string | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeThread =
    threads.find((thread) => thread.id === activeThreadId) ?? threads[0];

  useEffect(() => {
    try {
      const saved = localStorage.getItem("glynac-chat-threads");

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed) && parsed.length > 0) {
          setThreads(parsed);
          setActiveThreadId(parsed[0].id);
        }
      }
    } catch {
      // Keep default mock state.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("glynac-chat-threads", JSON.stringify(threads));
    } catch {
      // Ignore storage errors.
    }
  }, [threads]);

  useEffect(() => {
    return () => {
      if (streamTimerRef.current) {
        clearInterval(streamTimerRef.current);
      }
    };
  }, []);

  const groupedThreads = useMemo(() => {
    const groups: Record<string, ChatThread[]> = {
      Today: [],
      Yesterday: [],
      "Previous 7 Days": [],
    };

    threads.forEach((thread) => {
      if (groups[thread.dateGroup]) {
        groups[thread.dateGroup].push(thread);
      }
    });

    return groups;
  }, [threads]);

  const filteredMessages = useMemo(() => {
    if (!activeThread) return [];

    if (!messageSearch.trim()) return activeThread.messages;

    const query = messageSearch.toLowerCase();

    return activeThread.messages.filter(
      (message) =>
        message.content.toLowerCase().includes(query) ||
        message.attachments?.some((file) =>
          file.name.toLowerCase().includes(query)
        )
    );
  }, [activeThread, messageSearch]);

  function createThread() {
    const newThread: ChatThread = {
      id: `thread-${Date.now()}`,
      title: "New compliance conversation",
      dateGroup: "Today",
      pinned: false,
      messages: [],
    };

    setThreads((current) => [newThread, ...current]);
    setActiveThreadId(newThread.id);
    setMessageInput("");
    setAttachments([]);
  }

  function deleteThread(id: string) {
    setThreads((current) => current.filter((thread) => thread.id !== id));

    if (activeThreadId === id) {
      const remaining = threads.filter((thread) => thread.id !== id);
      setActiveThreadId(remaining[0]?.id ?? "");
    }

    setMenuThreadId(null);
  }

  function togglePin(id: string) {
    setThreads((current) =>
      current.map((thread) =>
        thread.id === id ? { ...thread, pinned: !thread.pinned } : thread
      )
    );

    setMenuThreadId(null);
  }

  function startRename(thread: ChatThread) {
    setEditingThreadId(thread.id);
    setEditingTitle(thread.title);
    setMenuThreadId(null);
  }

  function saveRename() {
    if (!editingThreadId || !editingTitle.trim()) {
      setEditingThreadId(null);
      return;
    }

    setThreads((current) =>
      current.map((thread) =>
        thread.id === editingThreadId
          ? { ...thread, title: editingTitle.trim() }
          : thread
      )
    );

    setEditingThreadId(null);
    setEditingTitle("");
  }

  function addFiles(files: FileList | File[]) {
    const incoming = Array.from(files);

    const mapped = incoming.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type || "Document",
    }));

    setAttachments((current) => [...current, ...mapped]);
  }

  function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      addFiles(event.target.files);
    }

    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);

    if (event.dataTransfer.files.length) {
      addFiles(event.dataTransfer.files);
    }
  }

  function removeAttachment(id: string) {
    setAttachments((current) => current.filter((file) => file.id !== id));
  }

  function generateAssistantResponse(prompt: string) {
    const lower = prompt.toLowerCase();

    if (lower.includes("guaranteed") || lower.includes("return")) {
      return {
        content:
          "I found a potential review point related to performance representations.\n\nCheck whether the agreement uses **guaranteed, certain, risk-free, or similar language**. Any performance statement should be supported and presented with appropriate risk disclosures.\n\nI recommend documenting the specific clause and comparing it with the firm's approved disclosure language before approval.",
        citations: [
          {
            id: `citation-${Date.now()}-1`,
            label: "FINRA Rule 2210 § 4",
            title: "FINRA Rule 2210 — Communications with the Public",
            excerpt:
              "Communications must be fair and balanced and must not contain false, exaggerated, unwarranted or misleading statements.",
            document: "FINRA-2210-Communications.pdf",
          },
          {
            id: `citation-${Date.now()}-2`,
            label: "Disclosure Policy § 7",
            title: "Firm Disclosure Policy",
            excerpt:
              "Performance-related communications require appropriate risk disclosure and documented review.",
            document: "Disclosure_Policy.pdf",
          },
        ],
      };
    }

    if (lower.includes("checklist")) {
      return {
        content:
          "### Compliance Review Checklist\n\n1. Identify the applicable regulatory rule.\n2. Review required disclosures.\n3. Check performance and product claims.\n4. Confirm supporting documentation.\n5. Review material risk language.\n6. Record exceptions and reviewer notes.\n7. Escalate unresolved issues before approval.",
        citations: [
          {
            id: `citation-${Date.now()}-3`,
            label: "Review Procedure § 2",
            title: "Regulatory Review Procedure",
            excerpt:
              "Reviewers must document applicable rules, findings, exceptions and final disposition.",
            document: "Review_Procedure.pdf",
          },
        ],
      };
    }

    if (lower.includes("summarize") || lower.includes("risk")) {
      return {
        content:
          "The main compliance review areas are:\n\n• **Disclosure accuracy:** Statements should be clear and supportable.\n• **Risk language:** Material risks should not be omitted or minimized.\n• **Performance claims:** Claims should have appropriate evidence and context.\n• **Approval workflow:** Exceptions should be documented and escalated.",
        citations: [
          {
            id: `citation-${Date.now()}-4`,
            label: "Compliance Policy § 7",
            title: "Firm Compliance Policy",
            excerpt:
              "Marketing and client-facing communications require documented review of performance representations and material risk disclosures.",
            document: "Compliance_Policy.md",
          },
        ],
      };
    }

    return {
      content:
        "Based on the compliance context provided, I would review the applicable rule, supporting document language, required disclosures, and any internal policy requirements.\n\nFor a production workflow, the relevant source documents should be verified before making a final compliance determination.",
      citations: [
        {
          id: `citation-${Date.now()}-5`,
          label: "Compliance Review Guide",
          title: "Internal Compliance Review Guide",
          excerpt:
            "Reviewers should verify applicable requirements against the current source documents and record their findings.",
          document: "Compliance_Review_Guide.pdf",
        },
      ],
    };
  }

  function sendMessage(customPrompt?: string) {
    const prompt = (customPrompt ?? messageInput).trim();

    if (!prompt || isStreaming || !activeThread) return;

    const userMessage: Message = {
      id: `message-${Date.now()}`,
      role: "user",
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
      attachments: attachments.length ? [...attachments] : undefined,
    };

    setThreads((current) =>
      current.map((thread) =>
        thread.id === activeThread.id
          ? {
              ...thread,
              title:
                thread.messages.length === 0
                  ? prompt.slice(0, 42) +
                    (prompt.length > 42 ? "..." : "")
                  : thread.title,
              messages: [...thread.messages, userMessage],
            }
          : thread
      )
    );

    setMessageInput("");
    setAttachments([]);
    setIsStreaming(true);
    setStreamingText("");

    const response = generateAssistantResponse(prompt);
    const fullText = response.content;
    let index = 0;

    if (streamTimerRef.current) {
      clearInterval(streamTimerRef.current);
    }

    streamTimerRef.current = setInterval(() => {
      index += Math.max(1, Math.floor(Math.random() * 3));

      if (index >= fullText.length) {
        index = fullText.length;

        if (streamTimerRef.current) {
          clearInterval(streamTimerRef.current);
        }

        const assistantMessage: Message = {
          id: `message-${Date.now()}-assistant`,
          role: "assistant",
          content: fullText,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          }),
          citations: response.citations,
        };

        setThreads((current) =>
          current.map((thread) =>
            thread.id === activeThread.id
              ? {
                  ...thread,
                  messages: [...thread.messages, assistantMessage],
                }
              : thread
          )
        );

        setStreamingText("");
        setIsStreaming(false);
        return;
      }

      setStreamingText(fullText.slice(0, index));
    }, 18);
  }

  function copyMessage(message: Message) {
    navigator.clipboard?.writeText(message.content);
    setCopiedId(message.id);

    setTimeout(() => setCopiedId(null), 1600);
  }

  function regenerateMessage(message: Message) {
    if (message.role !== "assistant" || isStreaming || !activeThread) return;

    const index = activeThread.messages.findIndex(
      (item) => item.id === message.id
    );

    if (index <= 0) return;

    const previousUserMessage = activeThread.messages[index - 1];

    if (previousUserMessage.role === "user") {
      setThreads((current) =>
        current.map((thread) =>
          thread.id === activeThread.id
            ? {
                ...thread,
                messages: thread.messages.filter(
                  (item) => item.id !== message.id
                ),
              }
            : thread
        )
      );

      setTimeout(() => sendMessage(previousUserMessage.content), 50);
    }
  }

  function setFeedback(messageId: string, feedback: "up" | "down") {
    setFeedbackMessageId(messageId);

    setThreads((current) =>
      current.map((thread) =>
        thread.id === activeThread.id
          ? {
              ...thread,
              messages: thread.messages.map((message) =>
                message.id === messageId
                  ? { ...message, feedback }
                  : message
              ),
            }
          : thread
      )
    );

    setTimeout(() => setFeedbackMessageId(null), 1200);
  }

  function editPrompt(message: Message) {
    if (message.role !== "user") return;

    setMessageInput(message.content);

    setThreads((current) =>
      current.map((thread) =>
        thread.id === activeThread.id
          ? {
              ...thread,
              messages: thread.messages.filter(
                (item) => item.id !== message.id
              ),
            }
          : thread
      )
    );
  }

  function renderThreadGroup(title: string) {
    const group = groupedThreads[title];

    if (!group?.length) return null;

    return (
      <div className="mb-5">
        <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
          {title}
        </div>

        <div className="space-y-1">
          {group.map((thread) => (
            <div key={thread.id} className="relative">
              {editingThreadId === thread.id ? (
                <div className="px-2">
                  <input
                    autoFocus
                    value={editingTitle}
                    onChange={(event) => setEditingTitle(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") saveRename();
                      if (event.key === "Escape") setEditingThreadId(null);
                    }}
                    onBlur={saveRename}
                    className="w-full rounded-lg border border-indigo-300 bg-white px-3 py-2 text-sm outline-none dark:border-indigo-500/40 dark:bg-slate-900"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setActiveThreadId(thread.id)}
                  className={`group flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition ${
                    activeThreadId === thread.id
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />

                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
                    {thread.title}
                  </span>

                  {thread.pinned && (
                    <Pin className="h-3.5 w-3.5 shrink-0 fill-current" />
                  )}

                  <span
                    onClick={(event) => {
                      event.stopPropagation();
                      setMenuThreadId(
                        menuThreadId === thread.id ? null : thread.id
                      );
                    }}
                    className="rounded-md p-1 opacity-0 transition hover:bg-slate-200 group-hover:opacity-100 dark:hover:bg-slate-700"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </span>
                </button>
              )}

              {menuThreadId === thread.id && (
                <div className="absolute right-2 top-10 z-40 w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                  <button
                    onClick={() => togglePin(thread.id)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Pin className="h-3.5 w-3.5" />
                    {thread.pinned ? "Unpin" : "Pin"}
                  </button>

                  <button
                    onClick={() => startRename(thread)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Rename
                  </button>

                  <button
                    onClick={() => deleteThread(thread.id)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`hidden border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-slate-950 lg:flex lg:flex-col ${
            sidebarCollapsed ? "w-[72px]" : "w-[280px]"
          }`}
        >
          <div className="flex h-16 items-center border-b border-slate-200 px-4 dark:border-slate-800">
            {!sidebarCollapsed && (
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="text-sm font-bold tracking-tight">
                    Compliance AI
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Glynac Workspace
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setSidebarCollapsed((value) => !value)}
              className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="p-3">
            <button
              onClick={createThread}
              className={`flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 ${
                sidebarCollapsed ? "px-0" : ""
              }`}
            >
              <Plus className="h-4 w-4" />
              {!sidebarCollapsed && "New conversation"}
            </button>
          </div>

          {!sidebarCollapsed && (
            <div className="flex-1 overflow-y-auto px-3 pb-4">
              {renderThreadGroup("Today")}
              {renderThreadGroup("Yesterday")}
              {renderThreadGroup("Previous 7 Days")}
            </div>
          )}

          <div className="border-t border-slate-200 p-3 dark:border-slate-800">
            <div
              className={`flex items-center gap-3 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-900 ${
                sidebarCollapsed ? "justify-center" : ""
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-white dark:text-slate-900">
                H
              </div>

              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <div className="truncate text-xs font-semibold">Heema</div>
                  <div className="truncate text-[10px] text-slate-400">
                    Frontend Intern
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="flex h-16 items-center border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90 md:px-6">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-sm font-bold md:text-base">
                    AI Compliance Assistant
                  </h1>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Mock streaming assistant
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSearchOpen((value) => !value)}
                className={`rounded-lg p-2 transition ${
                  searchOpen
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                }`}
                title="Search messages"
              >
                <Search className="h-4 w-4" />
              </button>

              <button className="hidden rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white md:block">
                <Archive className="h-4 w-4" />
              </button>

              <div className="hidden h-6 w-px bg-slate-200 dark:bg-slate-800 md:block" />

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                H
              </div>
            </div>
          </header>

          {searchOpen && (
            <div className="border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950 md:px-6">
              <div className="relative mx-auto max-w-4xl">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  autoFocus
                  value={messageSearch}
                  onChange={(event) => setMessageSearch(event.target.value)}
                  placeholder="Search messages in this conversation..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-10 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-indigo-500/10"
                />
                {messageSearch && (
                  <button
                    onClick={() => setMessageSearch("")}
                    className="absolute right-3 top-2.5 text-slate-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Conversation */}
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
                {activeThread?.messages.length === 0 ? (
                  <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                      <Sparkles className="h-7 w-7" />
                    </div>

                    <h2 className="text-xl font-bold">
                      How can I help with compliance?
                    </h2>

                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Ask about regulatory requirements, review a document, or
                      check potential compliance issues.
                    </p>

                    <div className="mt-7 flex max-w-2xl flex-wrap justify-center gap-2">
                      {quickPrompts.map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => sendMessage(prompt)}
                          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {filteredMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`mb-8 flex gap-3 ${
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        {message.role === "assistant" && (
                          <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/15">
                            <Bot className="h-4 w-4" />
                          </div>
                        )}

                        <div
                          className={`min-w-0 ${
                            message.role === "user"
                              ? "max-w-[85%] md:max-w-[72%]"
                              : "max-w-[90%] md:max-w-[82%]"
                          }`}
                        >
                          <div
                            className={`rounded-2xl ${
                              message.role === "user"
                                ? "rounded-tr-md bg-indigo-600 px-4 py-3 text-white shadow-lg shadow-indigo-600/10"
                                : "rounded-tl-md border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                            }`}
                          >
                            {message.attachments &&
                              message.attachments.length > 0 && (
                                <div className="mb-3 flex flex-wrap gap-2">
                                  {message.attachments.map((file) => (
                                    <div
                                      key={file.id}
                                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
                                        message.role === "user"
                                          ? "border-white/20 bg-white/10"
                                          : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
                                      }`}
                                    >
                                      <FileText className="h-4 w-4" />
                                      <div className="min-w-0">
                                        <div className="max-w-[180px] truncate text-xs font-semibold">
                                          {file.name}
                                        </div>
                                        <div
                                          className={`text-[10px] ${
                                            message.role === "user"
                                              ? "text-indigo-100"
                                              : "text-slate-400"
                                          }`}
                                        >
                                          {file.size}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                            {renderMessageContent(
                              message.content,
                              messageSearch
                            )}

                            <div
                              className={`mt-3 text-[10px] ${
                                message.role === "user"
                                  ? "text-indigo-100"
                                  : "text-slate-400"
                              }`}
                            >
                              {message.timestamp}
                            </div>
                          </div>

                          {message.role === "assistant" &&
                            message.citations &&
                            message.citations.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {message.citations.map((item) => (
                                  <button
                                    key={item.id}
                                    onClick={() => setCitation(item)}
                                    className="group flex items-center gap-1.5 rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1.5 text-[10px] font-semibold text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-100 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
                                  >
                                    <FileText className="h-3 w-3" />
                                    {item.label}
                                    <ChevronRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                                  </button>
                                ))}
                              </div>
                            )}

                          <div
                            className={`mt-2 flex items-center gap-1 ${
                              message.role === "user"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <button
                              onClick={() =>
                                copyMessage(message)
                              }
                              className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                              title="Copy"
                            >
                              {copiedId === message.id ? (
                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>

                            {message.role === "assistant" ? (
                              <>
                                <button
                                  onClick={() =>
                                    regenerateMessage(message)
                                  }
                                  className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                                  title="Regenerate"
                                >
                                  <Sparkles className="h-3.5 w-3.5" />
                                </button>

                                <button
                                  onClick={() =>
                                    setFeedback(message.id, "up")
                                  }
                                  className={`rounded-md p-1.5 transition ${
                                    message.feedback === "up"
                                      ? "text-emerald-500"
                                      : "text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                                  }`}
                                  title="Helpful"
                                >
                                  <ThumbsUp className="h-3.5 w-3.5" />
                                </button>

                                <button
                                  onClick={() =>
                                    setFeedback(message.id, "down")
                                  }
                                  className={`rounded-md p-1.5 transition ${
                                    message.feedback === "down"
                                      ? "text-red-500"
                                      : "text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                                  }`}
                                  title="Not helpful"
                                >
                                  <ThumbsDown className="h-3.5 w-3.5" />
                                </button>

                                {feedbackMessageId === message.id && (
                                  <span className="ml-1 text-[10px] text-emerald-500">
                                    Feedback saved
                                  </span>
                                )}
                              </>
                            ) : (
                              <button
                                onClick={() => editPrompt(message)}
                                className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                                title="Edit prompt"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {message.role === "user" && (
                          <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    ))}

                    {isStreaming && (
                      <div className="mb-8 flex gap-3">
                        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
                          <Bot className="h-4 w-4" />
                        </div>

                        <div className="max-w-[82%] rounded-2xl rounded-tl-md border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                          {renderMessageContent(streamingText)}
                          <div className="mt-2 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.3s]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.15s]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500" />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Composer */}
            <div className="border-t border-slate-200 bg-white/95 px-4 pb-5 pt-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 md:px-6">
              <div className="mx-auto max-w-4xl">
                {activeThread?.messages.length > 0 && (
                  <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                    {quickPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => sendMessage(prompt)}
                        disabled={isStreaming}
                        className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-medium text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}

                {attachments.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {attachments.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
                      >
                        <File className="h-4 w-4 text-indigo-500" />
                        <div className="max-w-[180px] truncate text-xs font-medium">
                          {file.name}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {file.size}
                        </span>
                        <button
                          onClick={() => removeAttachment(file.id)}
                          className="rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  onDragEnter={(event) => {
                    event.preventDefault();
                    setDragging(true);
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className={`relative rounded-2xl border bg-white shadow-sm transition dark:bg-slate-900 ${
                    dragging
                      ? "border-indigo-500 ring-4 ring-indigo-100 dark:ring-indigo-500/10"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {dragging && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl border-2 border-dashed border-indigo-400 bg-indigo-50/90 text-sm font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                      Drop documents here
                    </div>
                  )}

                  <textarea
                    value={messageInput}
                    onChange={(event) => setMessageInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Ask the compliance assistant..."
                    rows={3}
                    disabled={isStreaming}
                    className="w-full resize-none rounded-2xl bg-transparent px-4 py-3 text-sm outline-none placeholder:text-slate-400 disabled:opacity-50"
                  />

                  <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2 dark:border-slate-800">
                    <div className="flex items-center gap-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileInput}
                      />

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isStreaming}
                        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-white"
                      >
                        <Paperclip className="h-4 w-4" />
                        Attach
                      </button>

                      <span className="hidden text-[10px] text-slate-400 sm:block">
                        Drop files anywhere in the composer
                      </span>
                    </div>

                    <button
                      onClick={() => sendMessage()}
                      disabled={!messageInput.trim() || isStreaming}
                      className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isStreaming ? "Thinking..." : "Send"}
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-2 text-center text-[10px] text-slate-400">
                  AI responses are simulated for this frontend demonstration.
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Citation Popover */}
      {citation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-start justify-between border-b border-slate-200 p-5 dark:border-slate-800">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                  <FileText className="h-5 w-5" />
                </div>

                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                    Source Citation
                  </div>
                  <h3 className="mt-1 text-sm font-bold">
                    {citation.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setCitation(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 dark:border-indigo-500/20 dark:bg-indigo-500/10">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">
                  Exact excerpt
                </div>

                <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                  “{citation.excerpt}”
                </p>
              </div>

              <div>
                <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Document
                </div>

                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4 text-slate-400" />
                  {citation.document}
                </div>
              </div>

              <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                <Clipboard className="h-3.5 w-3.5" />
                Copy citation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}