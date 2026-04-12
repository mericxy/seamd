# Seamd

Leitor de Markdown desktop, leve e **read-first**, construído com **Rust + Tauri + Svelte**.

## Status

O projeto já possui a **foundation inicial do MVP**:

- shell desktop com Tauri
- layout com sidebar, header e main area
- seleção de pasta
- listagem recursiva com foco em arquivos `.md`
- abertura de arquivo Markdown
- exibição do conteúdo bruto no painel principal
- estado mínimo para pasta atual, arquivo selecionado, abas, tema e modo read/edit

Ainda faltam, para o MVP completo:

- renderização Markdown
- edição real de conteúdo
- salvar arquivo
- busca no documento

## Stack

- Rust
- Tauri v2
- Svelte 5
- Vite

## Prerequisites

Você precisa ter instalado localmente:

- Node.js 20+ ou 22+
- npm
- Rust toolchain
- dependências de sistema exigidas pelo Tauri

Documentação oficial do Tauri para preparar o ambiente:

- https://v2.tauri.app/start/prerequisites/

## Linux Ubuntu 24.04 / WSL2

No seu ambiente atual, o `cargo` já está disponível, mas a build do Tauri ainda falha porque o sistema não tem `pkg-config` e bibliotecas GTK/WebKit exigidas pelo Tauri no Linux.

Com base na documentação oficial do Tauri para Linux, instale:

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  pkg-config
```

Depois disso, abra um novo terminal e rode novamente:

```bash
npm run tauri dev
```

## Running The Project

Na raiz do projeto:

```bash
npm install
npm run tauri dev
```

Isso irá:

- subir o frontend Vite
- compilar o backend Rust
- abrir a janela desktop do Seamd

## Frontend Only Check

Se você quiser validar só a interface web e o build do frontend:

```bash
npm run dev
```

ou:

```bash
npm run build
```

## Project Structure

```text
src/                 frontend Svelte
src/lib/             tipos e bridge com Tauri
src-tauri/           backend Rust e configuração Tauri
docs/                visão, arquitetura, MVP e fluxo de UI
llm/                 contexto e tarefas de implementação
```

## Relevant Docs

- `docs/vision.md`
- `docs/architecture.md`
- `docs/mvp.md`
- `docs/ui-flow.md`
- `llm/context.md`
- `llm/tasks.md`
