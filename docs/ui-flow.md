# UI Flow

## Direção Visual

A interface do Seamd deve ser:

- minimalista
- desktop-first
- read-first
- inspirada em IDEs enxutas, com linguagem visual seca e precisa

Princípios visuais:

- cantos retos ou quase retos
- sem "ilhas" para botões
- sem cards decorativos desnecessários
- separação por linhas, contraste e espaçamento
- uso contido de transparência
- efeito de vidro fosco leve, nunca chamativo

O fundo pode combinar:

- cor sólida dominante
- camadas translúcidas discretas
- blur leve apenas em superfícies estruturais como sidebar e header

## Layout Geral

A interface será dividida em três áreas principais:

### Sidebar

- visão do diretório
- foco em arquivos `.md`
- permite abrir arquivos e navegar entre pastas
- comportamento similar a editores desktop
- aparência estrutural, sem caixas arredondadas para cada bloco

### Header

- exibe o título do arquivo atual
- contém ações simples e abas
- deve parecer uma barra de trabalho contínua
- ações com aparência plana, não como botões flutuantes

### Main Area

- área principal focada em leitura
- renderização limpa de Markdown
- modo edição ativado via botão ou atalho
- superfície mais limpa da tela
- prioridade para tipografia e legibilidade, não para ornamento

## Componentes Visuais

### Sidebar

- largura fixa
- divisória vertical clara
- pasta atual exibida de forma discreta
- árvore de arquivos com destaque linear para item selecionado

### Header

- duas linhas quando necessário:
  - contexto do arquivo atual
  - abas abertas
- divisória horizontal clara
- ações alinhadas à direita

### Tabs

- abas planas
- sem cápsulas arredondadas
- item ativo destacado por contraste ou linha inferior

### Buttons

- aparência plana
- cantos retos
- sem fundo chamativo por padrão
- hover sutil

### Main Reading Area

- área ampla
- pouco ruído visual
- fundo levemente diferente do entorno apenas quando necessário
- sem cartão central arredondado

## Fluxo principal

1. usuário abre uma pasta
2. sidebar mostra arquivos `.md`
3. usuário clica em um arquivo
4. conteúdo é exibido em modo leitura
5. usuário pode:
   - editar (atalho/botão)
   - navegar entre arquivos
   - buscar no documento
   - trocar tema
