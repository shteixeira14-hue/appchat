## subir nova versão ##

git status
git add .
git commit -m "nome do commit"

## HNEX - Agenda

Sistema de agendamento com interface de chat interativa integrada ao n8n.

### Visão geral técnica

- **Linguagem principal**: TypeScript
- **Runtime**: Node.js (para desenvolvimento/build)
- **Framework UI**: React 18
- **Bundler/Dev Server**: Vite 5
- **Estilização**: Tailwind CSS 3 + tailwindcss-animate + tokens customizados
- **Componentes UI**: shadcn-ui (Radix UI + utilitários próprios)
- **Ícones**: lucide-react
- **Gerenciamento de dados remotos**: @tanstack/react-query
- **Formulários/validação**: react-hook-form + zod + @hookform/resolvers
- **Roteamento**: react-router-dom
- **Notificações**: sonner + shadcn toaster
- **Integração externa**: Webhook HTTP para n8n (chat de agendamento)

---

## Arquitetura da aplicação

### Frontend

- **Entrypoint**: `src/main.tsx`  
  - Renderiza o componente raiz `App` dentro de `#root`.
  - Importa os estilos globais de `src/index.css`.

- **Componente raiz**: `src/App.tsx`  
  - Configura:
    - `QueryClientProvider` (React Query) para chamadas assíncronas e cache.
    - `TooltipProvider` (shadcn-ui / Radix).
    - `Toaster` (shadcn-ui) e `Sonner` para notificações.
    - `BrowserRouter` + `Routes`/`Route` (react-router-dom) com rota principal `/` (`Index`) e rota catch-all (`NotFound`).

- **Página principal**: `src/pages/Index.tsx`  
  - Composição de layout da tela principal:
    - `ChatHeader` (título/descrição do serviço).
    - Lista de mensagens (`ChatMessage`).
    - Estado vazio (`EmptyState`) quando ainda não há conversas.
    - Indicador de digitação (`TypingIndicator`).
    - Área de input (`ChatInput`) **ou** botão de reinício (`RestartButton`), conforme estado do fluxo.
  - Lida com:
    - Overlay inicial com botão **Iniciar** que dispara a mensagem “primeiramensagem” ao webhook.
    - Handlers de clique para:
      - Serviços (`handleServiceClick`)
      - Horários (`handleTimeSlotClick`)
      - Opções (`handleOptionClick`)
      - Profissionais (`handleProfessionalClick`)
      - Reinício do chat (`handleRestart`)

### Hook de chat

- **Arquivo principal**: `src/hooks/useChat.ts`

- **Responsabilidades**:
  - Gerenciar o estado do chat:
    - `messages`: lista de mensagens (usuário/bot).
    - `isLoading`: indica requisições em andamento.
    - `isFinished`: indica que o fluxo foi finalizado (`fim: "true"` do webhook).
    - `sessionId`: identificador único do usuário (persistido em `localStorage`).
  - Funções expostas:
    - `sendInitialMessage()`: envia `"primeiramensagem"` para iniciar o fluxo no n8n.
    - `sendMessage(...)`: envia mensagens do usuário + metadados (serviço, horário, opção, profissional).
    - `sendFinalData(flowData)`: envia payload final de agendamento ao webhook.
    - `viewFlowData()`: loga no console todos os dados do fluxo agrupados.
    - `clearMessages()`: limpa mensagens e dados de fluxo.
    - `restartChat()`: reinicia o chat mantendo o mesmo `sessionId`.

- **Modelos de dados**:
  - `Message`: mensagem do chat (conteúdo, timestamp, flags, payloads de UI).
  - `Service`, `ServicesData`: serviços disponíveis.
  - `TimeSlot`, `CalendarDay`, `CalendarData`: estrutura do calendário/horários.
  - `Option`, `OptionsData`: opções clicáveis (e.g. “Meus agendamentos”, “Agendar”).
  - `Professional`, `ProfessionalsData`: profissionais disponíveis.
  - `FlowData`: dados acumulados do fluxo de agendamento:
    - `SessionId`
    - `NomeCliente`
    - `Serviço`
    - `DataAgendamento`
    - `Profissional` (ID do profissional)

- **Persistência local**:
  - `localStorage`:
    - `chatbarber_session_id`: `sessionId` persistente por navegador/usuário.
      - Gerado apenas uma vez em `getOrCreateSessionId()`.
  - `sessionStorage`:
    - `chatbarber_flow_data` (via `FLOW_DATA_KEY`):
      - Mantém o estado do fluxo atual (sumido ao recarregar a página).
      - Manipulado por `getFlowData`, `saveFlowData`, `clearFlowData`.

### Integração com n8n (Webhook)

- **Constante de URL**:
  - Definida em `useChat.ts` como `WEBHOOK_URL`.
  - Todas as interações (mensagem inicial, mensagens do usuário, envio final) passam por essa URL.

- **Formato das requisições**:
  - Quando o usuário envia mensagem “normal”:
    - `{ message: string, sessionId: string }`
  - Quando clica em **serviço**:
    - Envia:
      - `message`: `id` do serviço
      - `sessionId`
      - `serviço: true`
      - `profselecionado` (ID do profissional previamente escolhido, se existir)
    - Atualiza `FlowData.Serviço`.
  - Quando clica em **opção**:
    - Envia:
      - `message`: `id` da opção
      - `opcao`: valor mapeado (`"meus"` ou `"agendar"`)
      - `sessionId`
  - Quando clica em **profissional**:
    - Envia:
      - `message`: `id` do profissional
      - `professional`: `id` do profissional
      - `sessionId`
    - Atualiza `FlowData.Profissional` com o **ID**.
  - Quando clica em **horário** (slot do calendário):
    - Primeiro atualiza `FlowData.DataAgendamento` com `YYYY-MM-DD HH:MM`.
    - Em seguida envia **payload final** ao webhook:
      - Todo `FlowData`
      - `tipomensagem: "final"`

- **Formato das respostas esperadas**:
  - Texto simples:
    - `{ "response": "mensagem de texto" }`
  - Serviços:
    - `{ "response": { "type": "services", "title": "...", "services": [...] } }`
  - Calendário:
    - `{ "response": { "type": "calendar", "title": "...", "days": [...] } }`
  - Opções:
    - `{ "response": { "type": "options", "title": "...", "options": [...] } }`
  - Profissionais:
    - `{ "response": { "type": "professionals", "title": "...", "professionals": [...] } }`
  - Final:
    - `{ "response": { "type": "final", "message"?: string, "title"?: string }, "fim"?: "true" | true }`
  - Nome do cliente:
    - `nomeCliente` vem no **nível raiz**:
      - Ex.: `{ response: "...", nomeCliente: "Sandro" }`
    - É salvo em `FlowData.NomeCliente`.
  - Fim do fluxo:
    - Campo raiz `"fim": "true"` ou `"fim": true`
    - Ao detectar, o sistema:
      - Seta `isFinished = true`.
      - Bloqueia envios de mensagens e cliques em cards.
      - Exibe o botão **Reiniciar Agendamento**.

---

## Componentes principais

### Chat e UI

- `ChatHeader`  
  - Mostra título **“Serviço de Agendamento”** e subtítulo **“HNEX - Agenda”**.

- `ChatMessage`  
  - Renderiza mensagens de usuário/bot.
  - Quando a resposta do webhook tiver:
    - `servicesData` → renderiza `ServicesCards`.
    - `calendarData` → renderiza `CalendarCards`.
    - `optionsData` → renderiza `OptionsCards`.
    - `professionalsData` → renderiza `ProfessionalsCards`.

- `ChatInput`  
  - Textarea com auto-resize.
  - Envio por:
    - Enter: envia mensagem.
    - Shift+Enter: nova linha.
  - Bloqueado quando:
    - `isLoading === true` ou `isFinished === true`.

- `RestartButton`  
  - Mostrado quando `isFinished === true`.
  - Ao clicar:
    - Chama `restartChat()`.
    - Reenvia `sendInitialMessage()` para iniciar novo fluxo com **mesmo `sessionId`**.

- `ServicesCards`, `CalendarCards`, `OptionsCards`, `ProfessionalsCards`  
  - Listas horizontais com scroll e hovers animados.
  - Cada card é **clicável** e dispara o respectivo handler em `Index.tsx`.

- `EmptyState`  
  - Estado inicial da área de mensagens, com ícones e textos explicativos.

- `TypingIndicator`  
  - Mostra o bot “digitando” enquanto `isLoading` está ativo.

---

## Estilização e tema

- **Arquivo principal de estilos**: `src/index.css`
  - Define tokens CSS customizados (`--background`, `--primary`, `--border`, etc.).
  - Estiliza:
    - Scrollbar customizado (`.scrollbar-thin`).
    - Animações:
      - `fadeIn`
      - `pulse-glow`
      - `typing`
  - Classes utilitárias:
    - `.glow-primary`
    - `.text-gradient`

- **Tailwind CSS**:
  - Configurado via `tailwind.config` (não mostrado aqui, mas utilizado pelo projeto).
  - Integrado ao Vite.

---

## Configuração de build e desenvolvimento

### Vite

- Arquivo: `vite.config.ts`
  - Plugins:
    - `@vitejs/plugin-react-swc`: suporte a React com SWC.
    - `lovable-tagger` em modo de desenvolvimento (tagger para componentes, pode ser removido se não for mais necessário).
  - Alias:
    - `"@"` apontando para `./src` (importações como `@/hooks/useChat`).
  - Servidor de desenvolvimento:
    - Host: `"::"`
    - Porta: `8080`

### TypeScript

- Arquivo: `tsconfig.json`
  - `baseUrl: "."` e `paths` para `@/*`.
  - `skipLibCheck: true`, `allowJs: true`.
  - Algumas flags de estrito desativadas (`noImplicitAny`, `noUnusedLocals`, `noUnusedParameters`, `strictNullChecks`), focando em DX mais flexível.

---

## Dependências principais

### Produção (`dependencies`)

- **React/Router**
  - `react`, `react-dom`
  - `react-router-dom`

- **UI/Design System**
  - `@radix-ui/react-*` (diversos componentes)
  - `class-variance-authority`, `clsx`, `tailwind-merge`
  - `lucide-react` (ícones)
  - `tailwindcss-animate`
  - `vaul`, `cmdk`, `embla-carousel-react` (utilitários de UI opcionais/futuras features)

- **Formulários e validação**
  - `react-hook-form`
  - `zod`
  - `@hookform/resolvers`

- **Estado assíncrono**
  - `@tanstack/react-query`

- **Datas**
  - `date-fns`
  - `react-day-picker`

- **Gráficos**
  - `recharts` (disponível para dashboards/relatórios se necessário).

- **Outros**
  - `sonner` (notificações tipo toast)
  - `next-themes` (theming, mesmo fora do Next.js)
  - `input-otp`, `react-resizable-panels`

### Desenvolvimento (`devDependencies`)

- `vite`
- `typescript`
- `@vitejs/plugin-react-swc`
- `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`
- `tailwindcss`, `postcss`, `autoprefixer`, `@tailwindcss/typography`
- Tipagens:
  - `@types/node`
  - `@types/react`
  - `@types/react-dom`
- `lovable-tagger` (plugin auxiliar de desenvolvimento)

---

## Como executar o projeto

Pré-requisitos:
- Node.js (versão LTS recomendada)
- npm ou pnpm/yarn

Passos:

```sh
# 1. Clone o repositório
git clone <YOUR_GIT_URL>

# 2. Acesse a pasta do projeto
cd <YOUR_PROJECT_NAME>

# 3. Instale as dependências
npm install

# 4. Execute em modo desenvolvimento
npm run dev
```

Por padrão, a aplicação sobe em `http://localhost:8080` (conforme `vite.config.ts`).

---

## Fluxo de agendamento (resumo)

1. Usuário acessa a página.
2. Vê o overlay com botão **Iniciar**.
3. Ao clicar em **Iniciar**:
   - O frontend envia `"primeiramensagem"` ao webhook com `sessionId`.
   - Recebe a primeira resposta do n8n (texto, serviços, etc.).
4. Usuário interage selecionando:
   - Serviços (cards horizontais).
   - Profissionais.
   - Datas/horários (calendário).
   - Opções rápidas.
5. O frontend:
   - Armazena `SessionId`, `NomeCliente`, `Serviço`, `DataAgendamento`, `Profissional` em `sessionStorage`.
   - No clique de horário, envia todos os dados com `tipomensagem: "final"`.
6. Quando o webhook retorna `"fim": "true"`:
   - O chat é marcado como finalizado.
   - Input e cliques são bloqueados.
   - Aparece o botão **Reiniciar Agendamento**.
7. Ao reiniciar:
   - Mensagens e fluxo são limpos.
   - `sessionId` é **mantido**.
   - A mensagem inicial é reenviada automaticamente.

Este README resume a visão técnica completa do projeto para desenvolvimento, manutenção e integração com o fluxo n8n. 
