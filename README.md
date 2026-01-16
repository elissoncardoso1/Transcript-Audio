# Transcript-Audio
Aplicação web para transcrição de áudio com backend em Python/Flask e frontend Vite/React. Permite enviar arquivos, acompanhar processamento, gerenciar modelos e histórico de transcrições, integrando o Whisper para converter áudio em texto de forma rápida e organizada.

## Funcionalidades

### Transcrição
- ✅ **Whisper.cpp Integration** - Transcrição com IA usando modelos otimizados localmente
- ✅ Suporte a múltiplos formatos de áudio (MP3, WAV, OGG, OPUS, M4A, FLAC)
- ✅ **Múltiplos Modelos** - tiny, base, small, medium, large (com visualização de tamanho)
- ✅ Suporte a múltiplos idiomas com detecção automática

### Upload e Processamento
- ✅ Interface intuitiva com drag-and-drop
- ✅ **Upload em Lote** - Processe múltiplos arquivos de uma vez
- ✅ **Sessões Nomeadas** - Organize transcrições em lote com nome personalizado
- ✅ Conversão automática para WAV

### Exportação e Organização
- ✅ Exportação em diferentes formatos (TXT, JSON, Markdown)
- ✅ **Resumo Automático** - Arquivo Markdown consolidando todas as transcrições de uma sessão
- ✅ Histórico de transcrições com data e tamanho
- ✅ Cópia rápida para área de transferência

### Interface
- ✅ Interface responsiva e moderna
- ✅ **Visualização de Modelos** - Cards visuais mostrando modelos baixados e seus tamanhos
- ✅ **Indicador de Modelo** - Mostra qual modelo está sendo usado durante a transcrição
- ✅ **Gerenciamento de Armazenamento** - Visualize e limpe uploads e transcrições

## Requisitos

- Python 3.8+
- FFmpeg (para conversão de formatos de áudio)
- whisper.cpp compilado (incluído na pasta `whisper.cpp/`)

## Instalação

### 1. Clonar o repositório
```bash
git clone <url-do-repositorio>
cd Transcript_audio
```

### 2. Criar ambiente virtual
```bash
python3 -m venv venv
```

### 3. Ativar ambiente virtual
- **macOS/Linux:**
  ```bash
  source venv/bin/activate
  ```
- **Windows:**
  ```bash
  venv\Scripts\activate
  ```

### 4. Instalar dependências
```bash
pip install -r requirements.txt
```

### 5. Instalar FFmpeg

**macOS (com Homebrew):**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**Windows:**
- Baixe em https://ffmpeg.org/download.html
- Adicione ao PATH do sistema

### 6. Baixar modelos Whisper

Os modelos devem estar na pasta `whisper.cpp/models/`. Para baixar:

```bash
cd whisper.cpp
./models/download-ggml-model.sh base
```

Modelos disponíveis: `tiny`, `base`, `small`, `medium`, `large`, `large-v2`, `large-v3`

## Uso

### Forma Rápida (Recomendado)
```bash
./start.sh
```

### Forma Manual
```bash
source venv/bin/activate
python run.py
```

### Acessar a interface
Abra seu navegador e acesse: **http://localhost:8080**

## Como Usar

### Transcrição de Arquivo Único
1. Selecione o modo "Arquivo Único"
2. Arraste e solte um arquivo de áudio ou clique para selecionar
3. Escolha o modelo e idioma nas configurações
4. Clique em "Iniciar Transcrição"
5. Aguarde o processamento
6. Exporte no formato desejado

### Transcrição em Lote
1. Selecione o modo "Lote (Múltiplos)"
2. (Opcional) Digite um nome para a sessão (ex: "Reunião 10/12")
3. Arraste múltiplos arquivos ou selecione vários
4. Escolha o modelo e idioma
5. Clique em "Iniciar Transcrição"
6. Acompanhe o progresso de cada arquivo
7. Ao finalizar, todas as transcrições estarão disponíveis

### Gerenciamento
- **Modelos**: Visualize e selecione modelos na seção "Modelos Whisper Disponíveis"
- **Histórico**: Veja todas as transcrições anteriores
- **Armazenamento**: Monitore e limpe uploads/transcrições na seção de gerenciamento

## Estrutura do Projeto

```
Transcript_audio/
├── app.py                 # Aplicação Flask principal
├── whisper_wrapper.py     # Wrapper Python para whisper.cpp
├── run.py                 # Script de inicialização com verificações
├── start.sh               # Script de inicialização rápida
├── requirements.txt       # Dependências Python
├── README.md              # Documentação
├── uploads/               # Arquivos de áudio enviados (temporários)
├── transcriptions/        # Transcrições salvas
├── templates/
│   └── index.html         # Interface web
├── static/
│   ├── css/               # Arquivos CSS
│   └── js/                # Arquivos JavaScript
├── whisper.cpp/           # Binários e modelos do whisper.cpp
│   ├── build/bin/         # Executável whisper-cli
│   └── models/            # Modelos .bin baixados
└── venv/                  # Ambiente virtual
```

## Formatos Suportados

### Áudio (Entrada)
- MP3, WAV, OGG, OPUS, M4A, FLAC
- Tamanho máximo: 100MB por arquivo (500MB total em lote)

### Exportação (Saída)
- **TXT**: Texto puro
- **JSON**: Estruturado com metadados
- **Markdown**: Formatado para documentação

## Modelos Whisper

| Modelo | Tamanho | Velocidade | Qualidade |
|--------|---------|------------|-----------|
| tiny | ~75 MB | Muito rápido | Básica |
| base | ~142 MB | Rápido | Boa |
| small | ~466 MB | Moderado | Muito boa |
| medium | ~1.5 GB | Lento | Excelente |
| large | ~3 GB | Muito lento | Melhor |

## Idiomas Suportados

- 🇧🇷 Português
- 🇺🇸 Inglês
- 🇪🇸 Espanhol
- 🇫🇷 Francês
- 🇩🇪 Alemão
- 🇮🇹 Italiano
- 🌐 Detecção Automática

## API Endpoints

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/` | GET | Interface web |
| `/upload` | POST | Upload de arquivo único |
| `/upload_batch` | POST | Upload de múltiplos arquivos |
| `/transcribe` | POST | Iniciar transcrição única |
| `/transcribe_batch` | POST | Iniciar transcrição em lote |
| `/transcription_status` | GET | Status da transcrição única |
| `/batch_status/<id>` | GET | Status da transcrição em lote |
| `/export` | POST | Exportar transcrição |
| `/history` | GET | Histórico de transcrições |
| `/models` | GET | Lista de modelos disponíveis |
| `/storage_info` | GET | Informações de armazenamento |
| `/clear_uploads` | POST | Limpar uploads |
| `/clear_history` | POST | Limpar histórico |

## Troubleshooting

### Erro: "FFmpeg not found"
- Instale o FFmpeg seguindo as instruções acima
- Verifique se está no PATH do sistema

### Erro: "Modelo não encontrado"
- Baixe o modelo usando o script em `whisper.cpp/models/`
- Verifique se o arquivo `.bin` está na pasta correta

### Erro: "Executável main não encontrado"
- Compile o whisper.cpp: `cd whisper.cpp && make`
- Verifique se o executável está em `whisper.cpp/build/bin/whisper-cli`

### Transcrição de baixa qualidade
- Use áudio com boa qualidade e sem ruído
- Experimente um modelo maior (small, medium)
- Especifique o idioma ao invés de usar detecção automática

### Porta 8080 em uso
- Verifique se há outra instância rodando
- Mude a porta em `app.py` e `run.py`

## Licença

MIT License - sinta-se livre para usar e modificar conforme necessário.

## Contribuições

Contribuições são bem-vindas! Por favor:
1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Faça commit das mudanças
4. Abra um Pull Request
