# Baixa o whisper.cpp e modelos no Windows.
# Uso: powershell -ExecutionPolicy Bypass -File .\scripts\download_whisper_windows.ps1 -Model base

param(
  [string]$Model = "base"
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error "Git não encontrado. Instale o Git e tente novamente."
}

if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
  Write-Error "Python não encontrado. Instale o Python e tente novamente."
}

if (-not (Test-Path -Path "whisper.cpp")) {
  Write-Host "Clonando whisper.cpp..."
  git clone https://github.com/ggerganov/whisper.cpp.git
} else {
  Write-Host "whisper.cpp já existe. Atualizando..."
  Push-Location whisper.cpp
  git pull
  Pop-Location
}

Push-Location whisper.cpp

# Baixa modelo
Write-Host "Baixando modelo: $Model"
if (Test-Path -Path ".\\models\\download-ggml-model.ps1") {
  .\models\download-ggml-model.ps1 $Model
} elseif (Test-Path -Path ".\\models\\download-ggml-model.sh") {
  # fallback via bash se disponível
  if (Get-Command bash -ErrorAction SilentlyContinue) {
    bash ./models/download-ggml-model.sh $Model
  } else {
    Write-Error "Script de download não encontrado."
  }
} else {
  Write-Error "Scripts de download não encontrados em whisper.cpp/models."
}

Pop-Location

Write-Host "Concluído."
