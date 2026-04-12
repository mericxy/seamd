# MVP

## Objective

Entregar um leitor de Markdown desktop, local-first e read-first, com a menor complexidade possível.

## MVP Phases

### Foundation

Primeira etapa para colocar o projeto de pé com segurança:

- estrutura Tauri + Rust + Svelte
- janela desktop funcional
- layout principal
- seleção de pasta
- listagem de arquivos `.md`
- abertura de arquivo Markdown
- exibição do conteúdo bruto
- estado mínimo da aplicação

### MVP Complete

Camada seguinte para completar o MVP descrito no produto:

- renderização Markdown no painel principal
- modo edição simples
- salvar no mesmo arquivo
- tema claro/escuro
- busca no documento

## Core Features

- abrir arquivo `.md`
- leitura como padrão
- edição simples quando necessário
- salvar no mesmo arquivo

## File Navigation

- sidebar com arquivos da pasta
- foco em arquivos `.md`
- navegação por diretórios

## Markdown Rendering

Suporte esperado no MVP:

- headings
- listas
- tabelas
- code blocks
- links
- imagens locais

## UX

- tema claro/escuro
- busca no documento
- experiência minimalista
- interface desktop-oriented

## Non-goals

- sincronização em nuvem
- plugins
- colaboração em tempo real
- suporte completo a todos os padrões Markdown

## Notes

O estado atual do projeto pode satisfazer a fase **Foundation** sem ainda satisfazer o **MVP Complete**.
