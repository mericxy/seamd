export type Theme = "light" | "dark";
export type ViewMode = "read" | "edit";

export interface FileNode {
  name: string;
  path: string;
  relativePath: string;
  isDir: boolean;
  children?: FileNode[];
  expanded?: boolean;
}

export interface DocumentTab {
  title: string;
  path: string;
}

export interface OpenFileResult {
  path: string;
  title: string;
  content: string;
}
