import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import type { FileNode, OpenFileResult } from "./types";

export async function selectFolder(): Promise<string | null> {
  const selected = await open({
    directory: true,
    multiple: false
  });

  return typeof selected === "string" ? selected : null;
}

export async function listDirectory(path: string): Promise<FileNode[]> {
  return invoke<FileNode[]>("list_directory", { path });
}

export async function openMarkdownFile(path: string): Promise<OpenFileResult> {
  return invoke<OpenFileResult>("open_markdown_file", { path });
}

