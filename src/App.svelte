<script lang="ts">
  import { listDirectory, openMarkdownFile, selectFolder } from "./lib/tauri";
  import { renderMarkdown } from "./lib/markdown";
  import type { DocumentTab, FileNode, Theme, ViewMode } from "./lib/types";

  let currentFolder: string | null = null;
  let fileTree: FileNode[] = [];
  let selectedFile: string | null = null;
  let openedTabs: DocumentTab[] = [];
  let theme: Theme = "dark";
  let viewMode: ViewMode = "read";
  let fileTitle = "No file selected";
  let fileContent = "";
  let renderedContent = "";
  let statusMessage = "Choose a folder to start reading local Markdown files.";
  let isLoading = false;

  $: document.body.dataset.theme = theme;
  $: renderedContent = renderMarkdown(fileContent, selectedFile);

  async function handleSelectFolder() {
    const folder = await selectFolder();

    if (!folder) {
      return;
    }

    isLoading = true;
    statusMessage = "Loading folder contents...";

    try {
      const tree = collapseTree(await listDirectory(folder));
      currentFolder = folder;
      fileTree = tree;
      selectedFile = null;
      openedTabs = [];
      fileTitle = "No file selected";
      fileContent = "";
      statusMessage =
        tree.length > 0
          ? "Select a Markdown file from the sidebar."
          : "No Markdown files were found in this folder.";
    } catch (error) {
      statusMessage = getErrorMessage(error);
    } finally {
      isLoading = false;
    }
  }

  async function handleOpenFile(node: FileNode) {
    if (node.isDir) {
      return;
    }

    isLoading = true;
    statusMessage = `Opening ${node.name}...`;

    try {
      const document = await openMarkdownFile(node.path);

      selectedFile = document.path;
      fileTitle = document.title;
      fileContent = document.content;
      statusMessage = `Reading ${document.title}`;

      if (!openedTabs.some((tab) => tab.path === document.path)) {
        openedTabs = [...openedTabs, { title: document.title, path: document.path }];
      }
    } catch (error) {
      statusMessage = getErrorMessage(error);
    } finally {
      isLoading = false;
    }
  }

  function handleTabSelect(tab: DocumentTab) {
    const node = findNodeByPath(fileTree, tab.path);

    if (node) {
      void handleOpenFile(node);
    }
  }

  function toggleTheme() {
    theme = theme === "dark" ? "light" : "dark";
  }

  function toggleViewMode() {
    viewMode = viewMode === "read" ? "edit" : "read";
  }

  function collapseTree(nodes: FileNode[]): FileNode[] {
    return nodes.map((node) => ({
      ...node,
      expanded: false,
      children: node.children ? collapseTree(node.children) : undefined
    }));
  }

  function toggleDirectory(node: FileNode) {
    node.expanded = !node.expanded;
    fileTree = [...fileTree];
  }

  function isDirectoryExpanded(node: FileNode) {
    return node.expanded === true;
  }

  function findNodeByPath(nodes: FileNode[], path: string): FileNode | null {
    for (const node of nodes) {
      if (node.path === path) {
        return node;
      }

      if (node.children) {
        const match = findNodeByPath(node.children, path);

        if (match) {
          return match;
        }
      }
    }

    return null;
  }

  function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "An unexpected error occurred.";
  }
</script>

<svelte:head>
  <title>Seamd</title>
</svelte:head>

{#snippet tree(nodes: FileNode[])}
  <ul class="tree">
    {#each nodes as node (node.path)}
      <li>
        {#if node.isDir}
          <button
            aria-expanded={isDirectoryExpanded(node)}
            class:expanded={isDirectoryExpanded(node)}
            class="tree-label tree-directory"
            on:click={() => toggleDirectory(node)}
            type="button"
          >
            <span class="tree-caret" aria-hidden="true"></span>
            <span class="tree-name">{node.name}</span>
          </button>
          {#if isDirectoryExpanded(node) && node.children && node.children.length > 0}
            {@render tree(node.children)}
          {/if}
        {:else}
          <button
            class:selected={selectedFile === node.path}
            class="tree-label tree-file"
            on:click={() => handleOpenFile(node)}
            type="button"
          >
            <span class="tree-file-spacer" aria-hidden="true"></span>
            <span class="tree-name">{node.name}</span>
          </button>
        {/if}
      </li>
    {/each}
  </ul>
{/snippet}

<div class="app-shell">
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-brand">
        <p class="eyebrow">Workspace</p>
        <h1>Seamd</h1>
      </div>
      <button class="toolbar-button toolbar-button-strong" on:click={handleSelectFolder} type="button">
        Open Folder
      </button>
    </div>

    <div class="sidebar-path">
      {#if currentFolder}
        <span>{currentFolder}</span>
      {:else}
        <span>No folder selected</span>
      {/if}
    </div>

    <div class="sidebar-tree">
      {#if fileTree.length > 0}
        {@render tree(fileTree)}
      {:else}
        <p class="empty-state">Markdown-focused navigation will appear here.</p>
      {/if}
    </div>
  </aside>

  <div class="workspace">
    <header class="header">
      <div class="header-main">
        <div class="header-title">
          <p class="eyebrow">Current File</p>
          <h2>{fileTitle}</h2>
        </div>
        <div class="header-actions">
          <button class="toolbar-button" on:click={toggleViewMode} type="button">
            {viewMode === "read" ? "Switch to Edit" : "Switch to Read"}
          </button>
          <button class="toolbar-button" on:click={toggleTheme} type="button">
            Theme: {theme}
          </button>
        </div>
      </div>

      <div class="tabs">
        {#if openedTabs.length > 0}
          {#each openedTabs as tab (tab.path)}
            <button
              class:active={selectedFile === tab.path}
              class="tab"
              on:click={() => handleTabSelect(tab)}
              type="button"
            >
              {tab.title}
            </button>
          {/each}
        {:else}
          <span class="tabs-empty">Open Markdown files to populate tabs.</span>
        {/if}
      </div>
    </header>

    <main class="main-content">
      <div class="content-meta">
        <span>{viewMode === "read" ? "Read mode" : "Edit mode"}</span>
        <span>{isLoading ? "Working..." : statusMessage}</span>
      </div>

      {#if selectedFile}
        {#if viewMode === "read"}
          <article class="document-rendered document-surface">
            {@html renderedContent}
          </article>
        {:else}
          <pre class:editing={viewMode === "edit"} class="document-content document-surface">{fileContent}</pre>
        {/if}
      {:else}
        <section class="empty-document document-surface">
          <h3>Read-first workspace</h3>
          <p>
            Open a local folder, pick a Markdown file, and Seamd will show its raw content here for
            the MVP foundation.
          </p>
        </section>
      {/if}
    </main>
  </div>
</div>
