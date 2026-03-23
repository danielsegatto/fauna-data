# 🦜 Fauna Data

Aplicativo PWA para monitoramento e registro de fauna silvestre em campo.

## Tecnologias

- **React 18** + TypeScript
- **Vite** — build tool
- **Tailwind CSS** — estilos
- **React Router v6** — navegação
- **Dexie.js** — banco de dados local (IndexedDB)
- **Recharts** — gráficos
- **PWA** — funciona offline, instalável no celular

---

## Desenvolvimento no Codespace

### 1. Abrir o Codespace

No repositório do GitHub, clique em **Code → Codespaces → Create codespace on main**.

O ambiente instala as dependências automaticamente via `postCreateCommand`.

### 2. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

O Vite sobe na porta `5173`. O Codespace abre o preview automaticamente.

### 3. Ver no celular (durante desenvolvimento)

No painel **Ports** do VS Code, mude a visibilidade da porta `5173` para **Public**. Copie a URL e abra no celular.

---

## Scripts

```bash
npm run dev       # Servidor de desenvolvimento
npm run build     # Build de produção
npm run preview   # Preview do build
```

---

## Estrutura do Projeto

```
src/
├── App.tsx                  # Shell de rotas
├── main.tsx                 # Entry point
├── index.css                # Estilos globais + Tailwind
├── lib/
│   ├── types.ts             # Tipos, interfaces e constantes
│   ├── theme.ts             # Design system (cores, utilitários)
│   └── db.ts                # Banco de dados (Dexie/IndexedDB)
├── hooks/                   # React hooks customizados
├── components/              # Componentes reutilizáveis
│   └── ui/                  # Primitivos de UI
└── pages/                   # Telas da aplicação
```

---

## Fluxo de Navegação

```
Home
 ├── Metodologias            (por grupo: Aves, Mamíferos, Herpetofauna)
 │    └── Ponto de Coleta    (nome + GPS)
 │         └── Entrada de Dados  (formulário de observação)
 ├── Registros Salvos
 │    └── Detalhe do Registro
 ├── Painel de Análise
 └── Exportar Dados
```

---

## Como usar no campo

1. Acesse o app pelo celular
2. Toque em **Adicionar ao início** (iOS: compartilhar → adicionar à tela inicial)
3. O app funciona **offline** após o primeiro carregamento
4. Os dados ficam salvos localmente no dispositivo
5. Use **Exportar Dados** para gerar CSV e compartilhar com a equipe

---

## Progresso de Desenvolvimento

- [x] Step 1 — Scaffold, design system, tipos
- [x] Step 2 — Banco de dados (Dexie/IndexedDB)
- [x] Step 3 — Componentes base de UI
- [x] Step 4 — Home screen
- [x] Step 5 — Metodologias
- [x] Step 6 — Ponto de Coleta + GPS
- [x] Step 7 — Entrada de Dados
- [x] Step 8 — Registros Salvos
- [x] Step 9 — Detalhe do Registro
- [x] Step 10 — Painel de Análise
- [x] Step 11 — Exportação de Dados
