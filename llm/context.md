# Seamd - LLM Context

## Project Summary

Seamd é um leitor de Markdown desktop, leve e minimalista, construído com Rust + Tauri.

A proposta principal é ser **read-first**, diferente de editores tradicionais que são edit-first.

## Key Concepts

- arquivos `.md` locais são a fonte da verdade
- leitura é o modo padrão
- edição é secundária e opcional
- interface simples, rápida e sem distrações

## Stack

- Rust (backend)
- Tauri (desktop)
- Svelte (frontend)

## Core Features

- abrir arquivos `.md`
- renderizar Markdown
- editar conteúdo
- salvar arquivos
- navegar por diretórios

## Constraints

- manter leveza
- evitar complexidade desnecessária
- não usar soluções pesadas