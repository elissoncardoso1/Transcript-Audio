# 🎙️ Transcript-Audio

**Transcreva áudios com qualidade profissional usando Whisper.cpp**

[![Python](https://img.shields.io/badge/Python-3.8%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-Backend-000000?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Vite](https://img.shields.io/badge/Vite-Frontend-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-UI-61DAFB?logo=react&logoColor=000000)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Aplicação web para transcrição de áudio com backend em **Python/Flask** e frontend **Vite/React**. Permite enviar arquivos, acompanhar processamento, gerenciar modelos e histórico de transcrições, integrando o **Whisper** para converter áudio em texto de forma rápida e organizada.

---

## ✨ Destaques

- 🚀 **Whisper.cpp local**: transcrição rápida sem depender de APIs externas
- 📦 **Upload em lote** com sessões nomeadas
- 🧠 **Múltiplos modelos** (tiny, base, small, medium, large)
- 🌍 **Detecção automática de idioma**
- 🧾 **Exportação**: TXT, JSON e Markdown
- 🗂️ **Histórico** + **gerenciamento de armazenamento**

---

## 🧰 Stack

- **Backend**: Python + Flask
- **Frontend**: Vite + React
- **Transcrição**: whisper.cpp
- **Conversão de áudio**: FFmpeg

---

## ✅ Funcionalidades

### Transcrição
- Integração com **whisper.cpp**
- Suporte a MP3, WAV, OGG, OPUS, M4A, FLAC
- Modelos: tiny, base, small, medium, large
- Detecção automática de idioma

### Upload e Processamento
- Drag-and-drop
- **Upload em lote**
- **Sessões nomeadas**
- Conversão automática para WAV

### Exportação e Organização
- TXT, JSON, Markdown
- **Resumo automático** por sessão
- Histórico com data e tamanho
- Cópia rápida para área de transferência

### Interface
- Responsiva e moderna
- Indicador do modelo em uso
- Visão dos modelos baixados
- Gerenciamento de armazenamento

---

## ⚙️ Requisitos

- Python 3.8+
- FFmpeg
- whisper.cpp compilado

---

## 🚀 Instalação

### 1) Clonar o repositório
```bash
git clone <url-do-repositorio>
cd Transcript_audio
```

### 2) Criar ambiente virtual
```bash
python3 -m venv venv
```

### 3) Ativar o ambiente
**macOS/Linux**
```bash
source venv/bin/activate
```

**Windows**
```bash
venv\Scripts\activate
```

### 4) Instalar dependências
```bash
pip install -r requirements.txt
```

### 5) Instalar o FFmpeg
**macOS (Homebrew)**
```bash
brew install ffmpeg
```

**Ubuntu/Debian**
```bash
sudo apt update
sudo apt install ffmpeg
```

**Windows**
- Baixe em https://ffmpeg.org/download.html
- Adicione ao PATH do sistema

### 6) Baixar modelos Whisper
```bash
cd whisper.cpp
./models/download-ggml-model.sh base
```
Modelos: `tiny`, `base`, `small`, `medium`, `large`, `large-v2`, `large-v3`

---

## ▶️ Uso

### Forma rápida (recomendado)
```bash
./start.sh
```

### Forma manual
```bash
source venv/bin/activate
python run.py
```

Acesse: **http://localhost:8080**

---

## 🧭 Como usar

### Arquivo único
1. Selecione o modo "Arquivo Único"
2. Arraste e solte um áudio
3. Escolha modelo e idioma
4. Clique em "Iniciar Transcrição"
5. Exporte no formato desejado

### Transcrição em lote
1. Selecione o modo "Lote (Múltiplos)"
2. (Opcional) Nomeie a sessão
3. Selecione vários arquivos
4. Clique em "Iniciar Transcrição"
5. Acompanhe o progresso

### Gerenciamento
- **Modelos**: seção "Modelos Whisper Disponíveis"
- **Histórico**: transcrições anteriores
- **Armazenamento**: limpar uploads/transcrições

---

## 🗂️ Estrutura do projeto

```
Transcript_audio/
├── app.py                 # Aplicação Flask principal
├── whisper_wrapper.py     # Wrapper para whisper.cpp
├── run.py                 # Script de inicialização
├── start.sh               # Inicialização rápida
├── requirements.txt       # Dependências Python
├── templates/
│   └── index.html         # Interface web
├── frontend/              # UI Vite/React
├── uploads/               # Áudios enviados
├── transcriptions/        # Transcrições salvas
└── whisper.cpp/           # Binários e modelos do whisper.cpp
```

---

## 📦 Formatos suportados

**Entrada**: MP3, WAV, OGG, OPUS, M4A, FLAC

**Saída**: TXT, JSON, Markdown

---

## 🧪 Modelos Whisper

| Modelo | Tamanho | Velocidade | Qualidade |
|--------|---------|------------|-----------|
| tiny   | ~75 MB  | Muito rápido | Básica |
| base   | ~142 MB | Rápido | Boa |
| small  | ~466 MB | Moderado | Muito boa |
| medium | ~1.5 GB | Lento | Excelente |
| large  | ~3 GB   | Muito lento | Melhor |

---

## 🌍 Idiomas suportados

- Português
- Inglês
- Espanhol
- Francês
- Alemão
- Italiano
- Detecção automática

---

## 🔌 API Endpoints

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/` | GET | Interface web |
| `/upload` | POST | Upload único |
| `/upload_batch` | POST | Upload em lote |
| `/transcribe` | POST | Transcrição única |
| `/transcribe_batch` | POST | Transcrição em lote |
| `/transcription_status` | GET | Status da transcrição |
| `/batch_status/<id>` | GET | Status do lote |
| `/export` | POST | Exportar transcrição |
| `/history` | GET | Histórico |
| `/models` | GET | Modelos disponíveis |
| `/storage_info` | GET | Info de armazenamento |
| `/clear_uploads` | POST | Limpar uploads |
| `/clear_history` | POST | Limpar histórico |

---

## 🛠️ Troubleshooting

**FFmpeg não encontrado**
- Instale o FFmpeg
- Verifique o PATH

**Modelo não encontrado**
- Baixe em `whisper.cpp/models/`

**Executável não encontrado**
- Compile: `cd whisper.cpp && make`
- Verifique `whisper.cpp/build/bin/whisper-cli`

**Porta 8080 em uso**
- Finalize outra instância ou altere a porta

---

## 📄 Licença

MIT License

---

## 🤝 Contribuições

Contribuições são bem-vindas:
1. Faça um fork
2. Crie uma branch
3. Faça commit
4. Abra um Pull Request
