import { convertFileSrc } from "@tauri-apps/api/core";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value: string): string {
  return escapeHtml(value);
}

function isExternalTarget(target: string): boolean {
  return /^(https?:|mailto:|tel:)/i.test(target) || target.startsWith("//");
}

function isAbsoluteFilePath(target: string): boolean {
  return target.startsWith("/") || /^[A-Za-z]:[\\/]/.test(target) || target.startsWith("\\\\");
}

function dirname(path: string): string {
  const normalized = path.replace(/[\\/]+$/, "");
  const separatorIndex = Math.max(normalized.lastIndexOf("/"), normalized.lastIndexOf("\\"));

  if (separatorIndex === -1) {
    return "";
  }

  return normalized.slice(0, separatorIndex);
}

function joinFilePath(baseDir: string, target: string): string {
  const separator = baseDir.includes("\\") ? "\\" : "/";
  const prefixMatch = baseDir.match(/^[A-Za-z]:/);
  const prefix = prefixMatch ? prefixMatch[0] : baseDir.startsWith("\\\\") ? "\\\\" : baseDir.startsWith("/") ? "/" : "";
  const rawBase = baseDir.replace(/^[A-Za-z]:/, "").replace(/^\\\\/, "").replace(/^\//, "");
  const baseSegments = rawBase.split(/[\\/]+/).filter(Boolean);
  const targetSegments = target.split(/[\\/]+/).filter(Boolean);
  const segments = [...baseSegments];

  for (const segment of targetSegments) {
    if (segment === ".") {
      continue;
    }

    if (segment === "..") {
      segments.pop();
      continue;
    }

    segments.push(segment);
  }

  const joined = segments.join(separator);

  if (prefixMatch) {
    return `${prefix}${separator}${joined}`;
  }

  if (prefix === "\\\\") {
    return `${prefix}${joined}`;
  }

  if (prefix === "/") {
    return `${prefix}${joined}`;
  }

  return joined;
}

function resolveAssetSource(documentPath: string | null, target: string): string {
  const trimmedTarget = target.trim();

  if (trimmedTarget.length === 0) {
    return "";
  }

  if (isExternalTarget(trimmedTarget)) {
    return trimmedTarget;
  }

  if (trimmedTarget.startsWith("#")) {
    return trimmedTarget;
  }

  const absolutePath = isAbsoluteFilePath(trimmedTarget)
    ? trimmedTarget
    : documentPath
      ? joinFilePath(dirname(documentPath), trimmedTarget)
      : trimmedTarget;

  return convertFileSrc(absolutePath);
}

function parseInline(text: string, documentPath: string | null): string {
  const escaped = escapeHtml(text);

  return escaped
    .replace(/!\[([^\]]*)\]\(([^)\s]+(?:\s+"[^"]*")?)\)/g, (_match, alt, target) => {
      const [source] = String(target).trim().split(/\s+"/);
      const resolvedSource = resolveAssetSource(documentPath, source);

      return `<img alt="${escapeAttribute(alt)}" class="md-inline-image" src="${escapeAttribute(resolvedSource)}" />`;
    })
    .replace(/\[([^\]]+)\]\(([^)\s]+(?:\s+"[^"]*")?)\)/g, (_match, label, target) => {
      const [href] = String(target).trim().split(/\s+"/);
      const resolvedHref = resolveAssetSource(documentPath, href);
      const isExternal = isExternalTarget(href);
      const extra = isExternal ? ' target="_blank" rel="noreferrer"' : "";

      return `<a href="${escapeAttribute(resolvedHref)}"${extra}>${label}</a>`;
    })
    .replace(/`([^`]+)`/g, (_match, code) => `<code>${code}</code>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/(^|[\s(])\*([^*]+)\*(?=[\s).,!?:;]|$)/g, "$1<em>$2</em>")
    .replace(/(^|[\s(])_([^_]+)_(?=[\s).,!?:;]|$)/g, "$1<em>$2</em>");
}

function isTableSeparator(line: string): boolean {
  const cells = splitTableRow(line);

  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function renderTable(lines: string[], documentPath: string | null): string {
  const [headerLine, , ...bodyLines] = lines;
  const headers = splitTableRow(headerLine);
  const body = bodyLines
    .filter((line) => line.includes("|"))
    .map((line) => splitTableRow(line))
    .map(
      (cells) =>
        `<tr>${cells.map((cell) => `<td>${parseInline(cell, documentPath)}</td>`).join("")}</tr>`
    )
    .join("");

  return `
    <table>
      <thead>
        <tr>${headers.map((cell) => `<th>${parseInline(cell, documentPath)}</th>`).join("")}</tr>
      </thead>
      <tbody>${body}</tbody>
    </table>
  `;
}

function renderList(lines: string[], documentPath: string | null): string {
  const ordered = /^\s*\d+\.\s+/.test(lines[0]);
  const tag = ordered ? "ol" : "ul";
  const items = lines
    .map((line) => line.replace(/^\s*(?:[-*+]|\d+\.)\s+/, ""))
    .map((item) => `<li>${parseInline(item, documentPath)}</li>`)
    .join("");

  return `<${tag}>${items}</${tag}>`;
}

function renderCodeBlock(lines: string[]): string {
  const opening = lines[0].trim();
  const language = opening.slice(3).trim();
  const hasClosingFence = lines[lines.length - 1]?.trim().startsWith("```") ?? false;
  const code = (hasClosingFence ? lines.slice(1, -1) : lines.slice(1)).join("\n");
  const className = language ? ` class="language-${escapeAttribute(language)}"` : "";

  return `<pre><code${className}>${escapeHtml(code)}</code></pre>`;
}

export function renderMarkdown(content: string, documentPath: string | null): string {
  const normalized = content.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const parts: string[] = [];

  for (let index = 0; index < lines.length; ) {
    const line = lines[index];
    const trimmed = line.trim();

    if (trimmed.length === 0) {
      index += 1;
      continue;
    }

    if (trimmed.startsWith("```")) {
      let endIndex = index + 1;

      while (endIndex < lines.length && !lines[endIndex].trim().startsWith("```")) {
        endIndex += 1;
      }

      const block = lines.slice(index, Math.min(endIndex + 1, lines.length));
      parts.push(renderCodeBlock(block));
      index = endIndex < lines.length ? endIndex + 1 : lines.length;
      continue;
    }

    if (/^#{1,6}\s+/.test(trimmed)) {
      const level = trimmed.match(/^#+/)?.[0].length ?? 1;
      const text = trimmed.replace(/^#{1,6}\s+/, "");
      parts.push(`<h${level}>${parseInline(text, documentPath)}</h${level}>`);
      index += 1;
      continue;
    }

    if (
      index + 1 < lines.length &&
      line.includes("|") &&
      isTableSeparator(lines[index + 1].trim())
    ) {
      let endIndex = index + 2;

      while (endIndex < lines.length && lines[endIndex].includes("|") && lines[endIndex].trim().length > 0) {
        endIndex += 1;
      }

      parts.push(renderTable(lines.slice(index, endIndex), documentPath));
      index = endIndex;
      continue;
    }

    if (/^\s*(?:[-*+]|\d+\.)\s+/.test(line)) {
      let endIndex = index + 1;

      while (endIndex < lines.length && /^\s*(?:[-*+]|\d+\.)\s+/.test(lines[endIndex])) {
        endIndex += 1;
      }

      parts.push(renderList(lines.slice(index, endIndex), documentPath));
      index = endIndex;
      continue;
    }

    let endIndex = index + 1;

    while (
      endIndex < lines.length &&
      lines[endIndex].trim().length > 0 &&
      !lines[endIndex].trim().startsWith("```") &&
      !/^#{1,6}\s+/.test(lines[endIndex].trim()) &&
      !/^\s*(?:[-*+]|\d+\.)\s+/.test(lines[endIndex]) &&
      !(lines[endIndex].includes("|") && endIndex + 1 < lines.length && isTableSeparator(lines[endIndex + 1].trim()))
    ) {
      endIndex += 1;
    }

    const paragraph = lines
      .slice(index, endIndex)
      .map((entry: string) => entry.trim())
      .join(" ");

    parts.push(`<p>${parseInline(paragraph, documentPath)}</p>`);
    index = endIndex;
  }

  return parts.join("");
}
