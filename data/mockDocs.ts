export type SecurityLevel =
  | "Confidential"
  | "Public"
  | "Internal Only"
  | "Restricted";

export type FileType =
  | "PDF"
  | "TXT"
  | "MD"
  | "JSON"
  | "Image";

export interface DocumentItem {
  id: string;
  name: string;
  type: FileType;
  size: string;
  modified: string;
  owner: string;
  security: SecurityLevel;
  folderId: string | null;
  content: string;
  flagged?: boolean;
}

export interface FolderItem {
  id: string;
  name: string;
  parentId: string | null;
}

export const mockFolders: FolderItem[] = [
  {
    id: "root",
    name: "Data Room",
    parentId: null,
  },
  {
    id: "financial",
    name: "Financial Documents",
    parentId: "root",
  },
  {
    id: "legal",
    name: "Legal",
    parentId: "root",
  },
  {
    id: "compliance",
    name: "Compliance",
    parentId: "root",
  },
  {
    id: "reports",
    name: "Reports",
    parentId: "root",
  },
];

export const mockDocuments: DocumentItem[] = [
  {
    id: "doc-1",
    name: "Q4 Financial Report.pdf",
    type: "PDF",
    size: "2.4 MB",
    modified: "Sep 18, 2026",
    owner: "Sarah Wilson",
    security: "Confidential",
    folderId: "financial",
    flagged: true,
    content:
      "Q4 Financial Report\n\nRevenue increased by 18% compared with the previous quarter.\n\nCONFIDENTIAL — This document contains sensitive financial information.",
  },

  {
    id: "doc-2",
    name: "Investment Policy.txt",
    type: "TXT",
    size: "18 KB",
    modified: "Sep 17, 2026",
    owner: "James Carter",
    security: "Internal Only",
    folderId: "compliance",
    content:
      "Investment Policy\n\nAll investment decisions must comply with internal risk management policies.",
  },

  {
    id: "doc-3",
    name: "Compliance Guidelines.md",
    type: "MD",
    size: "42 KB",
    modified: "Sep 16, 2026",
    owner: "Emily Davis",
    security: "Restricted",
    folderId: "compliance",
    flagged: true,
    content:
      "# Compliance Guidelines\n\n## Regulatory Requirements\n\nAll advisors must follow applicable compliance procedures.\n\nFLAGGED: Review regulatory disclosure requirements before distribution.",
  },

  {
    id: "doc-4",
    name: "Client Overview.json",
    type: "JSON",
    size: "12 KB",
    modified: "Sep 15, 2026",
    owner: "Michael Brown",
    security: "Internal Only",
    folderId: "reports",
    content: `{
  "client": "Example Wealth Client",
  "riskProfile": "Moderate",
  "portfolioValue": 1250000,
  "status": "Active"
}`,
  },

  {
    id: "doc-5",
    name: "Annual Compliance Report.pdf",
    type: "PDF",
    size: "4.8 MB",
    modified: "Sep 12, 2026",
    owner: "Sarah Wilson",
    security: "Confidential",
    folderId: "reports",
    content:
      "Annual Compliance Report\n\nThis report summarizes compliance activities and regulatory reviews conducted during the year.",
  },

  {
    id: "doc-6",
    name: "Advisor Handbook.pdf",
    type: "PDF",
    size: "3.1 MB",
    modified: "Sep 10, 2026",
    owner: "James Carter",
    security: "Internal Only",
    folderId: "legal",
    content:
      "Advisor Handbook\n\nThis handbook provides operational guidance for wealth management advisors.",
  },

  {
    id: "doc-7",
    name: "Public Disclosure.txt",
    type: "TXT",
    size: "9 KB",
    modified: "Sep 08, 2026",
    owner: "Emily Davis",
    security: "Public",
    folderId: "legal",
    content:
      "Public Disclosure\n\nThis document contains information approved for public distribution.",
  },
];