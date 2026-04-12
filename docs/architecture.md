# Architecture

## Overview

Seamd é uma aplicação desktop construída com **Tauri + Rust + Svelte**.

A arquitetura deve permanecer simples e orientada ao MVP:

- **Rust** cuida do acesso ao sistema de arquivos e das responsabilidades nativas
- **Tauri commands** fazem a ponte entre frontend e backend
- **Svelte** renderiza a interface desktop e mantém o estado da sessão atual

## Layers

### 1. Desktop Shell

Responsável por abrir a janela da aplicação e hospedar a interface.

- tecnologia: Tauri
- responsabilidades:
  - ciclo de vida da aplicação
  - registro de plugins necessários
  - registro de commands

### 2. Native Backend

Responsável por acessar arquivos e diretórios locais.

- tecnologia: Rust
- responsabilidades:
  - selecionar e validar diretórios
  - listar arquivos
  - priorizar `.md`
  - abrir e ler conteúdo de arquivos Markdown
  - no futuro: salvar alterações

### 3. Frontend UI

Responsável pela experiência read-first.

- tecnologia: Svelte
- responsabilidades:
  - layout principal
  - navegação na sidebar
  - abas abertas
  - estado de tema
  - estado read/edit
  - exibição do conteúdo atual

## Initial Layout

O layout base do MVP é dividido em:

- **Sidebar**
  - pasta atual
  - árvore de navegação focada em Markdown
- **Header**
  - arquivo atual
  - abas abertas
  - ações simples como tema e modo read/edit
- **Main Area**
  - leitura do arquivo atual
  - renderização inicial pode começar com conteúdo bruto
  - renderização Markdown entra em seguida sem refatoração grande

## Frontend State

O estado mínimo inicial deve conter:

- `currentFolder`
- `selectedFile`
- `openedTabs`
- `theme`
- `viewMode`
- `fileTree`
- `fileContent`

Esse estado pode ficar local no app no início. Não há necessidade de store global complexa no MVP.

## Backend Commands

Commands iniciais esperados:

- `list_directory(path)`
  - recebe uma pasta
  - percorre diretórios
  - retorna apenas diretórios úteis e arquivos `.md`
- `open_markdown_file(path)`
  - valida se o arquivo é `.md`
  - lê o conteúdo bruto
  - retorna metadados mínimos para a UI

No futuro, o próximo command natural é:

- `save_markdown_file(path, content)`

## File Navigation Rules

Para sustentar a proposta read-first:

- arquivos `.md` são prioridade
- arquivos não-Markdown não precisam aparecer nesta primeira versão
- diretórios sem arquivos Markdown podem ser omitidos
- ordenação deve ser previsível e simples
  - diretórios primeiro
  - arquivos depois
  - ambos em ordem alfabética

## UX Constraints

- interface leve
- foco em leitura
- sem elementos de dashboard
- sem features fora do MVP
- sem abstrações antecipadas

## Non-goals For This Phase

Não fazem parte desta fundação inicial:

- sync em nuvem
- auth
- colaboração
- plugins
- banco de dados
- indexação complexa
- engine avançada de busca

## Current MVP Foundation Scope

Esta primeira base deve entregar:

- janela desktop funcionando
- seleção de pasta
- navegação de arquivos `.md`
- abertura de arquivo
- exibição do conteúdo bruto no painel principal

Ainda não é obrigatório nesta etapa:

- renderização Markdown final
- edição persistente
- salvar arquivo
- busca no documento
- atalhos
