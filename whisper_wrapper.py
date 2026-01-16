"""
Wrapper Python para whisper.cpp

Este módulo fornece uma interface Python para o whisper.cpp, permitindo
transcrição de áudio usando os modelos Whisper da OpenAI compilados em C++.

Exemplo de uso:
    whisper = WhisperCpp(model_name="tiny")
    result = whisper.transcribe("audio.wav", language="pt")
    print(result["text"])
"""

import subprocess
import os
import json
import tempfile
from typing import Optional, Dict, Any

class WhisperCpp:
    """
    Wrapper Python para whisper.cpp
    
    Esta classe fornece uma interface Python para o executável whisper-cli,
    permitindo transcrição de áudio usando os modelos Whisper compilados.
    
    Attributes:
        project_root: Diretório raiz do projeto
        whisper_cpp_path: Caminho para o executável whisper-cli
        model_path: Caminho para o arquivo do modelo .bin
    """
    
    def __init__(self, model_name: str = None, whisper_cpp_path: str = None):
        """
        Inicializa wrapper do whisper.cpp

        Args:
            model_name: Nome do modelo (ex: 'base', 'tiny', 'small', 'medium', 'large')
                        ou caminho completo para o arquivo do modelo .bin
            whisper_cpp_path: Caminho para o executável whisper-cli do whisper.cpp
        """
        self.project_root = os.path.dirname(os.path.abspath(__file__))
        
        # Usar o executável 'whisper-cli' atualizado
        self.whisper_cpp_path = whisper_cpp_path or os.path.join(
            self.project_root, "whisper.cpp", "build", "bin", "whisper-cli"
        )

        # Construir caminho do modelo
        if model_name is None:
            model_name = "base"
        
        # Se model_name já é um caminho completo, use-o diretamente
        if os.path.isabs(model_name) or model_name.endswith('.bin'):
            self.model_path = model_name
        else:
            # Construa o caminho completo com base no nome do modelo
            self.model_path = os.path.join(
                self.project_root, "whisper.cpp", "models", f"ggml-{model_name}.bin"
            )

        # Verificar se o executável existe
        if not os.path.exists(self.whisper_cpp_path):
            raise FileNotFoundError(f"Executável main não encontrado em {self.whisper_cpp_path}")

        # Verificar se o modelo existe
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"Modelo não encontrado em {self.model_path}")

    def transcribe(
        self,
        audio_path: str,
        language: str = "auto",
        model: str = None,
        output_format: str = "txt"
    ) -> Dict[str, Any]:
        """
        Transcreve arquivo de áudio usando whisper.cpp

        Args:
            audio_path: Caminho para o arquivo de áudio
            language: Idioma do áudio ('pt', 'en', 'auto' para detecção automática)
            model: Caminho para modelo específico (opcional, sobrescreve o modelo padrão)
            output_format: Formato de saída ('txt', 'json', 'srt', 'vtt')

        Returns:
            Dicionário com resultado da transcrição contendo a chave 'text'
            
        Raises:
            FileNotFoundError: Se o arquivo de áudio ou modelo não for encontrado
            RuntimeError: Se ocorrer erro na transcrição ou timeout
        """
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Arquivo de áudio não encontrado: {audio_path}")

        # Usar modelo específico se fornecido
        model_to_use = model or self.model_path

        if model:
            # Permitir nomes curtos como 'base' e 'tiny'
            if not (os.path.isabs(model) or model.endswith('.bin')):
                candidate = os.path.join(
                    self.project_root, "whisper.cpp", "models", f"ggml-{model}.bin"
                )
                if os.path.exists(candidate):
                    model_to_use = candidate
                else:
                    raise FileNotFoundError(f"Modelo não encontrado: {candidate}")
            elif not os.path.exists(model_to_use):
                raise FileNotFoundError(f"Modelo não encontrado: {model_to_use}")

        # Construir comando baseado na API do whisper.cpp main
        cmd = [
            self.whisper_cpp_path,
            "-m", model_to_use,
            "-f", audio_path
        ]

        # Adicionar idioma se não for auto
        if language != "auto":
            cmd.extend(["-l", language])

        # Adicionar formato de saída
        if output_format == "txt":
            cmd.append("--output-txt")
        elif output_format == "json":
            cmd.append("--output-json")
        elif output_format == "srt":
            cmd.append("--output-srt")
        elif output_format == "vtt":
            cmd.append("--output-vtt")

        # Desabilitar prints desnecessários
        cmd.append("--no-prints")

        try:
            # Executar whisper.cpp
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=300  # 5 minutos timeout
            )

            if result.returncode != 0:
                raise RuntimeError(f"Erro na transcrição: {result.stderr}")

            # O whisper.cpp main cria arquivos de saída automaticamente
            # baseado no nome do arquivo de entrada
            base_name = os.path.splitext(audio_path)[0]
            
            text = ""
            
            if output_format == "txt":
                output_file = f"{base_name}.txt"
            elif output_format == "json":
                output_file = f"{base_name}.json"
            elif output_format == "srt":
                output_file = f"{base_name}.srt"
            elif output_format == "vtt":
                output_file = f"{base_name}.vtt"
            else:
                output_file = f"{base_name}.txt"

            # Ler resultado do arquivo criado
            if os.path.exists(output_file):
                with open(output_file, 'r', encoding='utf-8') as f:
                    if output_format == "json":
                        try:
                            json_data = json.load(f)
                            # Extrair texto dos segmentos JSON
                            if 'transcription' in json_data:
                                segments = json_data['transcription']
                                text = ' '.join([segment.get('text', '') for segment in segments])
                            else:
                                text = str(json_data)
                        except json.JSONDecodeError:
                            text = f.read()
                    else:
                        text = f.read()
                
                # Limpar arquivo de saída
                try:
                    os.unlink(output_file)
                except:
                    pass
            else:
                # Se não encontrou arquivo de saída, usar stdout
                text = result.stdout

            return {"text": text.strip()}

        except subprocess.TimeoutExpired:
            raise RuntimeError("Timeout na transcrição (5 minutos)")
        except Exception as e:
            raise RuntimeError(f"Erro na transcrição: {str(e)}")

    def list_models(self) -> Dict[str, str]:
        """
        Lista modelos disponíveis no diretório de modelos

        Returns:
            Dicionário com nome e caminho dos modelos
        """
        models_dir = os.path.join(self.project_root, "whisper.cpp", "models")
        models = {}

        if os.path.exists(models_dir):
            for file in os.listdir(models_dir):
                if file.endswith('.bin') and file.startswith('ggml-'):
                    # Remove 'ggml-' prefix and '.bin' suffix
                    name = file.replace('ggml-', '').replace('.bin', '')
                    
                    # Extract base model name (handle versioned models like large-v1, large-v2, etc.)
                    base_name = name.split('-')[0] if '-' in name else name
                    
                    # Map to base name if it's a standard model with version
                    # This allows 'large-v1' to be accessible as 'large'
                    if base_name in ['tiny', 'base', 'small', 'medium', 'large']:
                        # Use base name for standard models (prefer latest version)
                        if base_name not in models:
                            models[base_name] = os.path.join(models_dir, file)
                    
                    # Also add the full name for direct access
                    models[name] = os.path.join(models_dir, file)

        return models

    def get_model_info(self) -> Dict[str, Any]:
        """
        Obtém informações sobre o modelo atual

        Returns:
            Dicionário com informações do modelo
        """
        return {
            "model_path": self.model_path,
            "model_name": os.path.basename(self.model_path).replace('ggml-', '').replace('.bin', ''),
            "whisper_cli_path": self.whisper_cpp_path,
            "available_models": self.list_models()
        }

# Função de conveniência para uso rápido
def transcribe_audio(audio_path: str, language: str = "auto", model: str = None) -> str:
    """
    Função simples para transcrever áudio

    Args:
        audio_path: Caminho para o arquivo de áudio
        language: Idioma do áudio
        model: Modelo específico (opcional)

    Returns:
        Texto transcrito
    """
    try:
        whisper = WhisperCpp(model_name=model)
        result = whisper.transcribe(audio_path, language=language)
        return result.get("text", "")
    except Exception as e:
        return f"Erro na transcrição: {str(e)}"
