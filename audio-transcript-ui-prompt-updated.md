# Prompt: UI/UX Redesign - Transcritor de Áudio com Whisper.cpp

## Contexto do Projeto
Aplicação Flask para transcrição de áudio usando whisper.cpp com suporte a:
- **Transcrição individual e em lote** com processamento paralelo
- **Múltiplos formatos** de áudio (MP3, WAV, OGG, OPUS, M4A, FLAC)
- **Múltiplos modelos** Whisper (tiny a large) com visualização de tamanho
- **Sessões nomeadas** para organizar lotes de transcrições
- **Resumo automático** em Markdown consolidando transcrições
- **Gerenciamento de armazenamento** (uploads, transcrições, modelos)
- **API completa** com endpoints para todas as funcionalidades

---

## 📋 Briefing

Redesenhe a interface web do **Transcritor de Áudio com Whisper.cpp** usando as metodologias de `frontend-design` e `web-artifacts-builder`. O objetivo é criar uma experiência moderna, intuitiva e distintiva que transforme uma aplicação funcional em um produto premium.

### Usuário-alvo
- Profissionais que transcrevem áudios frequentemente (jornalistas, pesquisadores, produtores)
- Usuários que apreciam interfaces limpas e intuitivas
- Pessoas que trabalham com múltiplos idiomas

### Necessidades principais
1. **Upload individual ou em lote** - Processamento paralelo com feedback de progresso
2. **Sessões nomeadas** - Organizar transcrições em grupos temáticos
3. **Gerenciamento de modelos** - Visualização clara de modelos disponíveis
4. **Status em tempo real** - Progresso por arquivo durante lote
5. **Resumo consolidado** - Markdown automático com todas transcrições da sessão
6. **Gerenciamento de armazenamento** - Monitorar e limpar uploads/transcrições
7. **Edição e exportação** - Editar transcrições antes de exportar em múltiplos formatos

---

## 🎨 Diretrizes de Design

### Aesthetic Principal: **Modern Minimal + Editorial Sophistication**

Uma combinação de minimalismo moderno com toques editoriais sofisticados, refletindo a natureza intelectual da atividade de transcrição.

#### Tipografia

**Evite:** Inter, Roboto, Open Sans, fontes genéricas

**Recomendações:**
- **Header/Títulos:** `Newsreader` (serif editorial) ou `Bricolage Grotesque` (distinctive sans)
  - Criar impacto visual, comunicar profissionalismo
  - Usar weights extremos: 700/800 para headlines
  
- **Body Text:** `IBM Plex Sans` ou `Source Sans 3` (leitura confortável)
  - Weight: 400/500
  - Tamanho base: 14-16px
  
- **Código/Transcrição:** `JetBrains Mono` ou `Fira Code`
  - Criar distinção visual para conteúdo transcrito
  - Weight: 400
  - Tamanho: 13-14px

**Princípio de contraste:**
- Combinar `Newsreader 700` + `IBM Plex Sans 400` = alto contraste interessante
- Usar `JetBrains Mono` para áreas de transcrição = destaque semântico

#### Paleta de Cores

**Tema Principal (Dark Sophisticated):**

```css
/* CSS Variables */
--primary: #6366f1        /* Indigo vibrant */
--primary-dark: #4f46e5   /* Indigo darker para hover */
--secondary: #ec4899      /* Pink accent para CTAs */
--surface: #1a1a1a        /* Dark background */
--surface-secondary: #2a2a2a /* Elevated surface */
--border: #3a3a3a         /* Subtle borders */
--text-primary: #ffffff   /* Main text */
--text-secondary: #a0a0a0 /* Secondary text */
--success: #10b981        /* Verde para sucesso */
--warning: #f59e0b        /* Âmbar para avisos */
--error: #ef4444          /* Vermelho para erros */
```

**Rationale:**
- Dark background reduz fadiga ao trabalhar com texto transcrito
- Indigo vibrant como primary cria energia e modernidade
- Pink accent em CTAs guia atenção para ações importantes
- Verde/âmbar/vermelho para status feedback claro

#### Motion & Animações

**High-Impact Moments:**
1. **Page Load:** Staggered fade-in para componentes (100ms stagger)
2. **Upload Area:** Hover effect + scale subtle (scale: 1.02)
3. **Transcrição Iniciada:** Pulse animation suave no botão
4. **Processamento:** Progress bar com motion (2s duration)
5. **Resultado:** Slide-up do painel de edição (300ms ease-out)
6. **Exportação:** Micro-interaction feedback (checkmark animation)

**CSS Animations:**
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
```

#### Backgrounds & Depth

- **Base:** Solid #1a1a1a com subtle radial gradient corner accents
- **Elevated surfaces:** #2a2a2a com border subtle (#3a3a3a 1px)
- **Upload area:** Gradient diagonal indigo subtle + border dashed animate
- **Transcrição:** Code background pattern com grid subtle
- **Hover states:** Overlay gradient semi-transparent

---

## 🏗️ Estrutura de Componentes

### 0. **Mode Selector (Tab Navigation)**
```
┌─────────────────────────────────────────┐
│ 🎙️ TranscriptAI Pro                     │
├─────────────────────────────────────────┤
│ [Arquivo Único]  [Lote (Múltiplos)]    │
└─────────────────────────────────────────┘
```
- Tabs para alternar entre Single e Batch mode
- Visual indicator do modo ativo
- Transition smooth entre modos
```
┌─────────────────────────────────────────┐
│ 🎙️ TranscriptAI Pro    [History] [Help] │
└─────────────────────────────────────────┘
```
- Logo com ícone distintivo
- Links para histórico e configurações
- Dark theme toggle (optional)

### 2. **Upload Section (Single Mode)**
```
┌─────────────────────────────────────────┐
│  Upload Your Audio File                 │
│  ┌───────────────────────────────────┐  │
│  │ 📁 Drag & drop your audio file     │  │
│  │    or click to browse             │  │
│  │                                   │  │
│  │ Supported: MP3, WAV, OGG, M4A... │  │
│  └───────────────────────────────────┘  │
│                                          │
│  Language: [Português ▼]  Model: [🤖]   │
└─────────────────────────────────────────┘
```

### 3. **Upload Section (Batch Mode)**
```
┌──────────────────────────────────────────┐
│  Upload Multiple Audio Files             │
│  Session Name: [Digite um nome...]       │
│  (ex: "Reunião 10/12" ou deixe vazio)   │
├──────────────────────────────────────────┤
│  ┌────────────────────────────────────┐  │
│  │ 📁 Drop multiple files or click     │  │
│  │    Max 500MB total / 100MB per file │  │
│  └────────────────────────────────────┘  │
│                                           │
│  Files selected: 3                        │
│  ☐ Arquivo1.mp3 (45.2 MB)               │
│  ☐ Arquivo2.wav (32.1 MB)               │
│  ☐ Arquivo3.m4a (28.7 MB)               │
│                                           │
│  Language: [Português ▼]  Model: [🤖]    │
└──────────────────────────────────────────┘
```

**Design Details:**
- Upload box com border dashed animated
- Icons para cada formato suportado
- Language/Model dropdowns elegantes
- Clear typography hierarchy

### 4. **Whisper Models Section**
```
┌──────────────────────────────────────────┐
│  Whisper Models Available                │
├──────────────────────────────────────────┤
│  ┌────────────────────────────────────┐  │
│  │ 🔹 tiny (75 MB)                    │  │
│  │ ✓ Installed  ⚡ Very fast          │  │
│  └────────────────────────────────────┘  │
│                                           │
│  ┌────────────────────────────────────┐  │
│  │ 🔹 base (142 MB)                   │  │
│  │ ✓ Installed  ⚡ Fast               │  │
│  └────────────────────────────────────┘  │
│                                           │
│  ┌────────────────────────────────────┐  │
│  │ 🔹 small (466 MB)                  │  │
│  │ ✓ Installed  🔄 Moderate           │  │
│  └────────────────────────────────────┘  │
│                                           │
│  ┌────────────────────────────────────┐  │
│  │ 🔹 medium (1.5 GB)                 │  │
│  │ ⊘ Not installed  🐢 Slow           │  │
│  │ [Download Model]                   │  │
│  └────────────────────────────────────┘  │
│                                           │
│  ┌────────────────────────────────────┐  │
│  │ 🔹 large (3 GB)                    │  │
│  │ ⊘ Not installed  🐢 Very slow      │  │
│  │ [Download Model]                   │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

**Design Details:**
- Card para cada modelo com tamanho proeminente
- Status visual (✓ Installed vs ⊘ Not installed)
- Indicadores de velocidade/qualidade
- Download buttons para modelos não instalados
### 5. **Processing Status (Single Mode)**
```
┌──────────────────────────────────────────┐
│ Processing your audio...                 │
│ ████████░░░░░░░░░░░░░░░░ 45%            │
│ Estimated time: 2m 30s                   │
│ Model: base | Estimated remaining: 1.5GB│
│ [Cancel]                                 │
└──────────────────────────────────────────┘
```

### 6. **Processing Status (Batch Mode)**
```
┌──────────────────────────────────────────┐
│ Processing Batch (3/5 files)             │
│ ████████████░░░░░░░░░░░░░░░░ 60%        │
│ Total time: ~8m 15s remaining            │
├──────────────────────────────────────────┤
│ Current: arquivo2.wav                    │
│ ████████████░░░░░░ 65%                   │
│ [00:00:45 / 01:10]                       │
├──────────────────────────────────────────┤
│ ✓ arquivo1.mp3 - Completed (2m 10s)    │
│ 🔄 arquivo2.wav - Processing (0m 45s)  │
│ ⏳ arquivo3.m4a - Queued                │
│ ⏳ arquivo4.mp3 - Queued                │
│ ⏳ arquivo5.wav - Queued                │
├──────────────────────────────────────────┤
│ Generated Summary: Reunião_10-12.md     │
│ [Cancel]                                 │
└──────────────────────────────────────────┘
```

### 7. **Editor Section (Single File)**
```
┌──────────────────────────────────────────┐
│ Transcription Editor                     │
│ arquivo1.mp3 - 2:45 min | 245 words    │
├──────────────────────────────────────────┤
│ [Copy] [Share] [Export ▼]  [Edit Mode]  │
├──────────────────────────────────────────┤
│ [00:00] Olá, este é um teste...         │
│ [00:05] Continuando a transcrição       │
│ [00:12] Mais um trecho do áudio          │
│                                          │
│ Word count: 245 | Duration: 2:45        │
│ Last updated: now                       │
└──────────────────────────────────────────┘
```

### 8. **Batch Results Panel**
```
┌──────────────────────────────────────────┐
│ Batch Complete: Reunião 10/12            │
│ 5 files processed | Total: 12m 34s       │
├──────────────────────────────────────────┤
│ Session Summary (Auto-generated)         │
│ 📄 Reunião_10-12.md [Download]           │
│                                          │
│ Individual Transcriptions:               │
│ 📄 arquivo1.mp3 [Edit] [Export]          │
│ 📄 arquivo2.wav [Edit] [Export]          │
│ 📄 arquivo3.m4a [Edit] [Export]          │
│ 📄 arquivo4.mp3 [Edit] [Export]          │
│ 📄 arquivo5.wav [Edit] [Export]          │
├──────────────────────────────────────────┤
│ [Save Session] [New Batch] [Clear All]  │
└──────────────────────────────────────────┘
```

### 9. **Export Modal**
```
┌─────────────────────────────────┐
│ Export Your Transcription        │
├─────────────────────────────────┤
│ Format:                          │
│ ☑️ TXT - Plain text              │
│ ☐ JSON - Structured data        │
│ ☐ Markdown - Formatted          │
│                                 │
│ Options:                        │
│ ☑️ Include timestamps           │
│ ☑️ Include metadata             │
│                                 │
│      [Cancel]  [Export]         │
└─────────────────────────────────┘
```

---

## 🎯 Funcionalidades Principais com UX Focus

### Upload Flow
**Single Mode:**
1. **Visual Feedback:** Upload area reage ao hover + drag-over
2. **File Preview:** Card mostra nome, tamanho, duração antes de processar
3. **Settings Sidebar:** Colapsável com Language, Model, Advanced Options
4. **Start Button:** Prominent, animated, após file upload

**Batch Mode:**
1. **Multi-select:** Adicionar/remover arquivos com preview cards
2. **Session Naming:** Campo para organizar lotes (opcional)
3. **File List Preview:** Card para cada arquivo com tamanho/duração
4. **Capacity Indicator:** Visual bar mostrando uso de espaço (500MB max)
5. **Start Button:** Process all com confirmação visual

### Processing UX
**Single Mode:**
1. **Real-time Progress:** Barra de progresso com estimativa de tempo
2. **Processing Details:** Qual modelo está sendo usado, idioma detectado
3. **Cancel Option:** Sempre disponível durante processamento
4. **Background Processing:** Pode continuar navegando

**Batch Mode:**
1. **Overall Progress:** Barra de progresso geral (X/N files)
2. **Per-File Progress:** Progress bar para arquivo sendo processado
3. **Queue Visualization:** Status de cada arquivo (Queued/Processing/Done)
4. **Real-time Updates:** WebSocket para updates instantâneos
5. **Session Summary:** Markdown gerado automaticamente conforme processa
6. **Pause/Resume:** Pausar e resumar processamento

### Editor UX
1. **Syntax Highlighting:** Timestamps com cor diferente
2. **Line Numbers:** Para referência fácil
3. **Word Wrap:** Adaptado para leitura confortável
4. **Editable Content:** Click-to-edit com undo/redo
5. **Keyboard Shortcuts:** Ctrl+S para salvar, Ctrl+E para exportar

### History Sidebar
1. **Timeline Visual:** Mostrar transcrições recentes
2. **Quick Actions:** Edit, Download, Delete em cada item
3. **Search:** Buscar por conteúdo transcrito
4. **Metadata:** Data, idioma, modelo usado
5. **Session Grouping:** Agrupar transcrições por sessão de lote

### Storage Management
1. **Visual Gauge:** Mostrar espaço usado vs disponível
2. **Breakdown:** Uploads, Transcrições, Modelos
3. **Quick Clean:** Botões para limpar uploads antigos
4. **Model Manager:** Visualizar e remover modelos instalados
5. **Export All:** Exportar histórico completo

---

## 🛠️ Implementação Técnica

### Stack Recomendado
- **Backend:** Flask (existente)
- **Frontend:** React + Tailwind CSS (para artifact interativo)
- **Components:** shadcn/ui + custom components
- **Animations:** Framer Motion + CSS animations
- **Fonts:** Google Fonts (Newsreader, IBM Plex Sans, JetBrains Mono)

### Responsive Design
- **Desktop:** Full editor + sidebar layout
- **Tablet:** Collapsible sidebar
- **Mobile:** Modal-based upload + fullscreen editor

### Performance Considerations
- Lazy load History
- Debounce search
- Virtualize long transcript lists
- Optimize animation frame rates (GPU acceleration)

---

## ✅ Checklist de Qualidade

### Tipografia
- [ ] Newsreader ou Bricolage Grotesque para headlines
- [ ] IBM Plex Sans ou Source Sans 3 para body
- [ ] JetBrains Mono para código/transcrição
- [ ] Weights: 700+ para headers, 400 para body
- [ ] Tamanhos com jumps de 2-3x

### Cores & Theme
- [ ] Dark theme coesivo implementado
- [ ] CSS variables para todas cores
- [ ] Indigo + Pink como primary/secondary
- [ ] Status colors claros (verde, âmbar, vermelho)
- [ ] Contraste suficiente para accessibility

### Motion & Animation
- [ ] Page load orchestrada com staggered reveals
- [ ] Upload area com hover animations
- [ ] Processing com progress visual + pulse
- [ ] Editor com slide-up entrance
- [ ] Export com feedback animation

### Backgrounds & Depth
- [ ] Dark base com subtle gradient corners
- [ ] Elevated surfaces com borders
- [ ] Upload area com padrão visual distintivo
- [ ] Transcrição com background pattern code-like
- [ ] Hover states com overlay gradients

### UX & Usability
- [ ] Visual hierarchy clara
- [ ] Drag-and-drop intuitivo (single e batch)
- [ ] Status feedback em todos os pontos críticos
- [ ] Keyboard shortcuts documentadas
- [ ] Responsivo em todos os devices
- [ ] Accessibility WCAG AA compliant
- [ ] Mode selector (Single vs Batch) visualmente claro
- [ ] Session naming intuitivo para batch
- [ ] File list preview com tamanho/duração

### Batch Processing
- [ ] WebSocket real-time updates funcionando
- [ ] Overall progress + per-file progress visible
- [ ] Queue visualization com status (Queued/Processing/Done)
- [ ] Auto-generated Markdown summary funcionando
- [ ] Pause/Resume buttons disponíveis
- [ ] Session grouping no histórico

### Model & Storage Management
- [ ] Model cards mostrando tamanho proeminentemente
- [ ] Status visual (✓ Installed vs ⊘ Not installed)
- [ ] Download buttons para modelos não instalados
- [ ] Storage gauge mostrando uso vs disponível
- [ ] Breakdown claro (Uploads/Transcriptions/Models)
- [ ] Quick clean buttons com confirmação

### Code Quality
- [ ] React components reutilizáveis
- [ ] Tailwind classes semânticas
- [ ] Código documentado
- [ ] Sem dependencies desnecessárias
- [ ] Performance otimizado

---

## 📱 Ejemplos de Design Inspiration

1. **Vercel Dashboard** - Dark theme, clean typography, micro-interactions
2. **Linear App** - Editorial aesthetic, sophisticated animations
3. **Figma Editor** - Modern controls, clear visual hierarchy
4. **Notion** - Minimal + powerful, distinctive typography

---

## 🚀 Próximos Passos

1. **Mockup Phase:** Criar componentes React com design definido
2. **Animation Phase:** Adicionar Motion library para micro-interactions
3. **Responsiveness:** Testar em múltiplos devices
4. **Accessibility Audit:** WCAG AA compliance
5. **Performance Testing:** Lighthouse score 90+
6. **User Testing:** Feedback de usuários reais

---

## 📝 Notas Implementação Flask

### Backend Integration Points
- WebSocket para real-time progress updates (essencial para batch)
- API endpoints para upload (single + batch)
- API endpoints para transcrição (single + batch)
- Endpoints para gerenciamento de modelos e armazenamento
- Session management para agrupar transcrições
- Markdown generation automático para resumos de sessão
- Cache inteligente para histórico recente
- Background tasks para processamento em lote

### Frontend Integration
- Axios/Fetch para API calls
- FormData para multipart uploads
- LocalStorage para preferences
- Service Workers para offline support (optional)

---

**Objetivo Final:** Transformar uma aplicação funcional em um **produto premium** que usuários amem usar diariamente.
