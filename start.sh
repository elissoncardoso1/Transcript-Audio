#!/bin/bash

# Função para matar processos filhos ao sair
cleanup() {
    echo ""
    echo "� Encerrando servidores..."
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

echo "�🚀 Iniciando Transcritor de Áudio..."

# 1. Configuração do Backend
echo "📦 [Backend] Verificando ambiente Python..."

# Verificar se o ambiente virtual existe
if [ ! -d "venv" ]; then
    echo "   Ambiente virtual não encontrado. Criando..."
    python3 -m venv venv
fi

# Ativar ambiente virtual
source venv/bin/activate

# Instalar dependências
echo "   Instalando/Atualizando dependências Python..."
pip install -r requirements.txt > /dev/null 2>&1

# 2. Configuração do Frontend
echo "🎨 [Frontend] Verificando ambiente Node.js..."

if [ -d "frontend" ]; then
    cd frontend
    if [ ! -d "node_modules" ]; then
        echo "   Instalando dependências do frontend..."
        npm install > /dev/null 2>&1
    fi
    cd ..
else
    echo "❌ Diretório 'frontend' não encontrado!"
    exit 1
fi

echo "✨ Tudo pronto! Iniciando servidores..."
echo ""

# 3. Iniciar Backend
echo "🌐 Iniciando Backend (Flask) na porta 8080..."
python app.py &
BACKEND_PID=$!

# Aguardar um pouco para o backend inicializar
sleep 2

# 4. Iniciar Frontend
echo "💻 Iniciando Frontend (Vite) na porta 5173..."
cd frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Aplicação iniciada com sucesso!"
echo "👉 Frontend: http://localhost:5173"
echo "👉 Backend:  http://localhost:8080"
echo ""
echo "Pressione Ctrl+C para encerrar."

# Aguardar processos
wait