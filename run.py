#!/usr/bin/env python3
"""
Script de inicialização da aplicação Transcritor de Áudio
Verifica dependências e inicia o servidor Flask
"""

import sys
import os
import subprocess
import importlib

def check_python_version():
    """Verifica se a versão do Python é compatível"""
    if sys.version_info < (3, 8):
        print("❌ Erro: Python 3.8 ou superior é necessário")
        print(f"Versão atual: {sys.version}")
        sys.exit(1)
    print("✅ Versão Python compatível")

def check_ffmpeg():
    """Verifica se o FFmpeg está instalado"""
    try:
        result = subprocess.run(['ffmpeg', '-version'],
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            print("✅ FFmpeg encontrado")
            return True
    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass

    print("⚠️  FFmpeg não encontrado no sistema")
    print("   Instale FFmpeg para conversão de formatos de áudio:")
    print("   macOS: brew install ffmpeg")
    print("   Ubuntu/Debian: sudo apt install ffmpeg")
    print("   Windows: Baixe de https://ffmpeg.org/download.html")
    return False

def check_dependencies():
    """Verifica se as dependências estão instaladas"""
    required_packages = ['flask', 'speech_recognition', 'pydub', 'werkzeug']
    missing_packages = []

    for package in required_packages:
        try:
            if package == 'speech_recognition':
                importlib.import_module('speech_recognition')
            else:
                importlib.import_module(package)
        except ImportError:
            missing_packages.append(package)

    if missing_packages:
        print(f"❌ Pacotes faltando: {', '.join(missing_packages)}")
        print("   Execute: pip install -r requirements.txt")
        return False

    print("✅ Dependências Python instaladas")
    return True

def create_directories():
    """Cria diretórios necessários"""
    directories = ['uploads', 'transcriptions']
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
    print("✅ Diretórios criados/verificados")

def start_app():
    """Inicia a aplicação Flask"""
    print("\n🚀 Iniciando Transcritor de Áudio...")
    print("   Acesse: http://localhost:8080")
    print("   Pressione Ctrl+C para parar\n")

    try:
        from app import app
        app.run(debug=False, host='0.0.0.0', port=8080)
    except KeyboardInterrupt:
        print("\n👋 Aplicação encerrada")
    except Exception as e:
        print(f"❌ Erro ao iniciar aplicação: {e}")
        sys.exit(1)

def main():
    """Função principal"""
    print("🔍 Verificando requisitos do Transcritor de Áudio...\n")

    check_python_version()

    dependencies_ok = check_dependencies()
    if not dependencies_ok:
        print("\n⚠️  Dependências faltando. Tentando instalar automaticamente...")
        try:
            subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'],
                         check=True)
            print("✅ Dependências instaladas com sucesso")
        except subprocess.CalledProcessError:
            print("❌ Falha ao instalar dependências. Instale manualmente:")
            print("   source venv/bin/activate  # ou venv\\Scripts\\activate no Windows")
            print("   pip install -r requirements.txt")
            sys.exit(1)

    check_ffmpeg()
    create_directories()

    start_app()

if __name__ == '__main__':
    main()