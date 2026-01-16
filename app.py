from flask import Flask, render_template, request, jsonify, send_file, session
import os
import uuid
from pydub import AudioSegment
from werkzeug.utils import secure_filename
import json
from datetime import datetime
import threading
import time
import re
from whisper_wrapper import WhisperCpp
from flask_cors import CORS

app = Flask(__name__)
# Enable CORS with credentials support for session cookies
CORS(app, resources={r"/*": {
    "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
    "supports_credentials": True
}})
app.secret_key = 'sua-chave-secreta-aqui'
# Configure session to work with CORS
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # Use 'Lax' for local development
app.config['SESSION_COOKIE_HTTPONLY'] = True

# Configurações
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'mp3', 'wav', 'ogg', 'opus', 'm4a', 'flac'}
TRANSCRIPTIONS_FOLDER = 'transcriptions'

# Criar diretórios necessários
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(TRANSCRIPTIONS_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB max para uploads em lote

# Armazenamento de sessões de transcrição em lote
batch_sessions = {}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def convert_to_wav(input_path, output_path):
    """Converte arquivo de áudio para formato WAV"""
    try:
        audio = AudioSegment.from_file(input_path)
        audio.export(output_path, format="wav")
        return True
    except Exception as e:
        print(f"Erro na conversão: {e}")
        return False

def transcribe_audio(audio_path, language='auto', model=None):
    """Transcreve arquivo de áudio usando whisper.cpp"""
    try:
        # Inicializar whisper.cpp
        whisper = WhisperCpp()

        # Mapear idiomas para o formato do whisper.cpp
        language_mapping = {
            'pt-BR': 'pt',
            'en-US': 'en',
            'es-ES': 'es',
            'fr-FR': 'fr',
            'de-DE': 'de',
            'it-IT': 'it'
        }

        whisper_lang = language_mapping.get(language, language)

        # Transcrever
        result = whisper.transcribe(
            audio_path=audio_path,
            language=whisper_lang,
            model=model,
            output_format='json'
        )

        return result.get('text', '').strip()

    except Exception as e:
        return f"Erro ao processar áudio com whisper.cpp: {e}"

@app.route('/')
def index():
    return render_template('index.html')

def sanitize_session_name(name):
    """Sanitiza o nome da sessão para usar em nomes de arquivo"""
    if not name:
        return ""
    # Remove caracteres especiais, mantém letras, números, espaços e hífens
    sanitized = re.sub(r'[^\w\s-]', '', name)
    # Substitui espaços por underscores
    sanitized = re.sub(r'\s+', '_', sanitized)
    return sanitized[:50]  # Limita a 50 caracteres

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'audio_file' not in request.files:
        return jsonify({'error': 'Nenhum arquivo enviado'}), 400

    file = request.files['audio_file']
    if file.filename == '':
        return jsonify({'error': 'Nenhum arquivo selecionado'}), 400

    if file and allowed_file(file.filename):
        # Salvar arquivo original
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        original_filename = f"{timestamp}_{filename}"
        original_path = os.path.join(app.config['UPLOAD_FOLDER'], original_filename)
        file.save(original_path)

        # Converter para WAV
        wav_filename = f"{timestamp}_converted.wav"
        wav_path = os.path.join(app.config['UPLOAD_FOLDER'], wav_filename)

        if convert_to_wav(original_path, wav_path):
            # Salvar informações na sessão
            session['original_file'] = original_filename
            session['converted_file'] = wav_filename
            session['upload_time'] = timestamp

            return jsonify({
                'message': 'Arquivo enviado com sucesso',
                'filename': original_filename,
                'ready_for_transcription': True
            })
        else:
            return jsonify({'error': 'Falha ao converter arquivo de áudio'}), 500

    return jsonify({'error': 'Formato de arquivo não permitido'}), 400

@app.route('/upload_batch', methods=['POST'])
def upload_batch():
    """Upload de múltiplos arquivos em lote"""
    if 'audio_files' not in request.files:
        return jsonify({'error': 'Nenhum arquivo enviado'}), 400

    files = request.files.getlist('audio_files')
    session_name = request.form.get('session_name', '').strip()
    
    if not files or all(f.filename == '' for f in files):
        return jsonify({'error': 'Nenhum arquivo selecionado'}), 400

    # Gerar ID único para esta sessão de lote
    batch_id = str(uuid.uuid4())[:8]
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Sanitizar nome da sessão
    sanitized_session_name = sanitize_session_name(session_name)
    
    uploaded_files = []
    errors = []

    for file in files:
        if file.filename == '':
            continue
            
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_timestamp = datetime.now().strftime("%Y%m%d_%H%M%S%f")[:17]
            original_filename = f"{file_timestamp}_{filename}"
            original_path = os.path.join(app.config['UPLOAD_FOLDER'], original_filename)
            file.save(original_path)

            # Converter para WAV
            wav_filename = f"{file_timestamp}_converted.wav"
            wav_path = os.path.join(app.config['UPLOAD_FOLDER'], wav_filename)

            if convert_to_wav(original_path, wav_path):
                uploaded_files.append({
                    'original_filename': original_filename,
                    'display_name': filename,
                    'converted_file': wav_filename,
                    'wav_path': wav_path,
                    'status': 'pending'
                })
            else:
                errors.append(f"Falha ao converter: {filename}")
        else:
            errors.append(f"Formato não suportado: {file.filename}")

    if not uploaded_files:
        return jsonify({'error': 'Nenhum arquivo válido foi enviado', 'details': errors}), 400

    # Armazenar informações da sessão de lote
    batch_sessions[batch_id] = {
        'session_name': session_name,
        'sanitized_name': sanitized_session_name,
        'timestamp': timestamp,
        'files': uploaded_files,
        'total': len(uploaded_files),
        'completed': 0,
        'status': 'ready',
        'transcriptions': [],
        'errors': errors
    }
    
    # Salvar batch_id na sessão do usuário
    session['batch_id'] = batch_id

    return jsonify({
        'message': f'{len(uploaded_files)} arquivo(s) enviado(s) com sucesso',
        'batch_id': batch_id,
        'session_name': session_name,
        'files': [f['display_name'] for f in uploaded_files],
        'errors': errors,
        'ready_for_transcription': True
    })

@app.route('/transcribe', methods=['POST'])
def transcribe():
    data = request.get_json()
    language = data.get('language', 'auto')
    model = data.get('model', None)

    # Debug logging
    print(f"DEBUG: Session keys: {list(session.keys())}")
    print(f"DEBUG: Session data: {dict(session)}")
    
    if 'converted_file' not in session:
        return jsonify({'error': 'Nenhum arquivo carregado'}), 400

    wav_path = os.path.join(app.config['UPLOAD_FOLDER'], session['converted_file'])

    if not os.path.exists(wav_path):
        return jsonify({'error': 'Arquivo de áudio não encontrado'}), 404

    # Transcrever em uma thread separada para não bloquear
    # Obter dados necessários da sessão antes de iniciar a thread
    upload_time = session.get('upload_time', datetime.now().strftime("%Y%m%d_%H%M%S"))
    # Gerar um ID único para esta transcrição
    if 'transcription_id' not in session:
        session['transcription_id'] = str(int(time.time()))
    session_id = session['transcription_id']
    
    def transcribe_thread():
        try:
            text = transcribe_audio(wav_path, language, model)

            # Salvar transcrição
            transcription_filename = f"{upload_time}_transcription.txt"
            transcription_path = os.path.join(TRANSCRIPTIONS_FOLDER, transcription_filename)

            with open(transcription_path, 'w', encoding='utf-8') as f:
                f.write(text)

            # Usar app_context para acessar a sessão
            with app.app_context():
                # Obter a sessão usando o session_id
                from flask import session
                # Criar uma nova sessão para armazenar os resultados
                # Como não podemos modificar a sessão original diretamente,
                # vamos armazenar os resultados em um arquivo temporário
                result_file = os.path.join(app.config['UPLOAD_FOLDER'], f"{session_id}_result.json")
                with open(result_file, 'w') as f:
                    json.dump({
                        'transcription': text,
                        'transcription_file': transcription_filename
                    }, f)

        except Exception as e:
            # Armazenar erro em um arquivo temporário
            with app.app_context():
                result_file = os.path.join(app.config['UPLOAD_FOLDER'], f"{session_id}_result.json")
                with open(result_file, 'w') as f:
                    json.dump({
                        'transcription_error': str(e)
                    }, f)

    # Iniciar transcrição em background
    thread = threading.Thread(target=transcribe_thread)
    thread.daemon = True
    thread.start()

    return jsonify({'message': 'Transcrição iniciada'})

@app.route('/transcribe_batch', methods=['POST'])
def transcribe_batch():
    """Transcreve múltiplos arquivos em lote"""
    data = request.get_json()
    language = data.get('language', 'auto')
    model = data.get('model', None)
    batch_id = data.get('batch_id') or session.get('batch_id')

    if not batch_id or batch_id not in batch_sessions:
        return jsonify({'error': 'Sessão de lote não encontrada'}), 400

    batch = batch_sessions[batch_id]
    
    if batch['status'] == 'processing':
        return jsonify({'error': 'Transcrição já em andamento'}), 400

    batch['status'] = 'processing'
    batch['completed'] = 0
    batch['current_file'] = 0

    def transcribe_batch_thread():
        session_name = batch['sanitized_name']
        timestamp = batch['timestamp']
        
        for i, file_info in enumerate(batch['files']):
            batch['current_file'] = i + 1
            file_info['status'] = 'processing'
            
            try:
                wav_path = file_info['wav_path']
                
                if not os.path.exists(wav_path):
                    file_info['status'] = 'error'
                    file_info['error'] = 'Arquivo não encontrado'
                    continue

                text = transcribe_audio(wav_path, language, model)
                
                # Gerar nome do arquivo de transcrição
                file_index = str(i + 1).zfill(2)
                if session_name:
                    transcription_filename = f"{timestamp}_{session_name}_{file_index}_transcription.txt"
                else:
                    transcription_filename = f"{timestamp}_batch_{file_index}_transcription.txt"
                
                transcription_path = os.path.join(TRANSCRIPTIONS_FOLDER, transcription_filename)

                with open(transcription_path, 'w', encoding='utf-8') as f:
                    f.write(text)

                file_info['status'] = 'completed'
                file_info['transcription'] = text
                file_info['transcription_file'] = transcription_filename
                batch['transcriptions'].append({
                    'filename': file_info['display_name'],
                    'transcription_file': transcription_filename,
                    'text': text
                })
                batch['completed'] += 1

            except Exception as e:
                file_info['status'] = 'error'
                file_info['error'] = str(e)
                batch['errors'].append(f"Erro em {file_info['display_name']}: {str(e)}")

        batch['status'] = 'completed'
        
        # Salvar resumo da sessão se houver nome
        if session_name and batch['transcriptions']:
            summary_filename = f"{timestamp}_{session_name}_resumo.md"
            summary_path = os.path.join(TRANSCRIPTIONS_FOLDER, summary_filename)
            
            with open(summary_path, 'w', encoding='utf-8') as f:
                f.write(f"# Sessão de Transcrição: {batch['session_name']}\n\n")
                f.write(f"**Data:** {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n")
                f.write(f"**Total de arquivos:** {batch['total']}\n")
                f.write(f"**Transcrições concluídas:** {batch['completed']}\n\n")
                f.write("---\n\n")
                
                for idx, trans in enumerate(batch['transcriptions'], 1):
                    f.write(f"## {idx}. {trans['filename']}\n\n")
                    f.write(f"{trans['text']}\n\n")
                    f.write("---\n\n")

    # Iniciar transcrição em background
    thread = threading.Thread(target=transcribe_batch_thread)
    thread.daemon = True
    thread.start()

    return jsonify({
        'message': 'Transcrição em lote iniciada',
        'batch_id': batch_id,
        'total_files': batch['total']
    })

@app.route('/batch_status/<batch_id>')
def batch_status(batch_id):
    """Retorna o status da transcrição em lote"""
    if batch_id not in batch_sessions:
        return jsonify({'error': 'Sessão não encontrada'}), 404

    batch = batch_sessions[batch_id]
    
    files_status = [{
        'name': f['display_name'],
        'status': f['status'],
        'error': f.get('error')
    } for f in batch['files']]

    return jsonify({
        'status': batch['status'],
        'session_name': batch['session_name'],
        'total': batch['total'],
        'completed': batch['completed'],
        'current_file': batch.get('current_file', 0),
        'files': files_status,
        'transcriptions': batch['transcriptions'] if batch['status'] == 'completed' else [],
        'errors': batch['errors']
    })

@app.route('/transcription_status')
def transcription_status():
    # Verificar se há um arquivo de resultado temporário
    if 'transcription_id' not in session:
        return jsonify({'status': 'not_started'})
    
    session_id = session['transcription_id']
    result_file = os.path.join(app.config['UPLOAD_FOLDER'], f"{session_id}_result.json")
    
    if os.path.exists(result_file):
        try:
            with open(result_file, 'r') as f:
                result = json.load(f)
            
            # Remover o arquivo temporário após a leitura
            os.remove(result_file)
            
            if 'transcription' in result:
                # Atualizar a sessão com os resultados
                session['transcription'] = result['transcription']
                session['transcription_file'] = result.get('transcription_file')
                
                return jsonify({
                    'status': 'completed',
                    'text': result['transcription'],
                    'filename': result.get('transcription_file')
                })
            elif 'transcription_error' in result:
                # Atualizar a sessão com o erro
                session['transcription_error'] = result['transcription_error']
                
                return jsonify({
                    'status': 'error',
                    'error': result['transcription_error']
                })
        except Exception as e:
            return jsonify({
                'status': 'error',
                'error': f'Erro ao ler resultado: {str(e)}'
            })
    elif 'converted_file' in session:
        return jsonify({'status': 'processing'})
    else:
        return jsonify({'status': 'not_started'})

@app.route('/export', methods=['POST'])
def export_transcription():
    data = request.get_json()
    format_type = data.get('format', 'txt')
    text = data.get('text', '')

    if not text:
        return jsonify({'error': 'Nenhum texto para exportar'}), 400

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    if format_type == 'txt':
        filename = f"transcription_{timestamp}.txt"
        filepath = os.path.join(TRANSCRIPTIONS_FOLDER, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(text)

    elif format_type == 'json':
        filename = f"transcription_{timestamp}.json"
        filepath = os.path.join(TRANSCRIPTIONS_FOLDER, filename)
        json_data = {
            'text': text,
            'timestamp': timestamp,
            'language': data.get('language', 'pt-BR'),
            'original_file': session.get('original_file', '')
        }
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, ensure_ascii=False, indent=2)

    elif format_type == 'md':
        filename = f"transcription_{timestamp}.md"
        filepath = os.path.join(TRANSCRIPTIONS_FOLDER, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(f"# Transcrição de Áudio\n\n")
            f.write(f"**Data:** {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n")
            f.write(f"**Arquivo Original:** {session.get('original_file', 'N/A')}\n\n")
            f.write(f"## Transcrição\n\n{text}")

    else:
        return jsonify({'error': 'Formato não suportado'}), 400

    return send_file(filepath, as_attachment=True, download_name=filename)

@app.route('/history')
def history():
    """Retorna histórico de transcrições"""
    transcriptions = []
    if os.path.exists(TRANSCRIPTIONS_FOLDER):
        for filename in os.listdir(TRANSCRIPTIONS_FOLDER):
            if ('transcription' in filename or 'resumo' in filename) and (filename.endswith('.txt') or filename.endswith('.md')):
                filepath = os.path.join(TRANSCRIPTIONS_FOLDER, filename)
                stat = os.stat(filepath)
                transcriptions.append({
                    'filename': filename,
                    'created': datetime.fromtimestamp(stat.st_ctime).strftime('%d/%m/%Y %H:%M:%S'),
                    'size': stat.st_size
                })

    transcriptions.sort(key=lambda x: x['created'], reverse=True)
    return jsonify(transcriptions)

@app.route('/models')
def list_models():
    """Lista modelos disponíveis do whisper.cpp com informações detalhadas"""
    try:
        whisper = WhisperCpp()
        models = whisper.list_models()
        model_info = whisper.get_model_info()

        # Adicionar informações de tamanho para cada modelo
        models_with_info = {}
        for name, path in models.items():
            size_bytes = os.path.getsize(path) if os.path.exists(path) else 0
            size_mb = round(size_bytes / (1024 * 1024), 1)
            models_with_info[name] = {
                'path': path,
                'size_mb': size_mb,
                'size_display': f"{size_mb} MB"
            }

        # Formatar resposta
        response = {
            'current_model': model_info['model_name'],
            'models': models,
            'models_info': models_with_info,
            'whisper_cpp_info': {
                'executable_path': model_info['whisper_cli_path'],
                'model_path': model_info['model_path']
            }
        }

        return jsonify(response)
    except Exception as e:
        return jsonify({'error': f'Erro ao listar modelos: {str(e)}'}), 500

@app.route('/clear_uploads', methods=['POST'])
def clear_uploads():
    """Limpa todos os arquivos de upload"""
    try:
        count = 0
        if os.path.exists(UPLOAD_FOLDER):
            for filename in os.listdir(UPLOAD_FOLDER):
                filepath = os.path.join(UPLOAD_FOLDER, filename)
                if os.path.isfile(filepath):
                    os.remove(filepath)
                    count += 1
        
        # Limpar sessões de lote
        batch_sessions.clear()
        
        return jsonify({
            'success': True,
            'message': f'{count} arquivo(s) removido(s)',
            'count': count
        })
    except Exception as e:
        return jsonify({'error': f'Erro ao limpar uploads: {str(e)}'}), 500

@app.route('/clear_history', methods=['POST'])
def clear_history():
    """Limpa todo o histórico de transcrições"""
    try:
        count = 0
        if os.path.exists(TRANSCRIPTIONS_FOLDER):
            for filename in os.listdir(TRANSCRIPTIONS_FOLDER):
                filepath = os.path.join(TRANSCRIPTIONS_FOLDER, filename)
                if os.path.isfile(filepath):
                    os.remove(filepath)
                    count += 1
        
        return jsonify({
            'success': True,
            'message': f'{count} transcrição(ões) removida(s)',
            'count': count
        })
    except Exception as e:
        return jsonify({'error': f'Erro ao limpar histórico: {str(e)}'}), 500

@app.route('/storage_info')
def storage_info():
    """Retorna informações sobre uso de armazenamento"""
    try:
        uploads_size = 0
        uploads_count = 0
        if os.path.exists(UPLOAD_FOLDER):
            for filename in os.listdir(UPLOAD_FOLDER):
                filepath = os.path.join(UPLOAD_FOLDER, filename)
                if os.path.isfile(filepath):
                    uploads_size += os.path.getsize(filepath)
                    uploads_count += 1
        
        transcriptions_size = 0
        transcriptions_count = 0
        if os.path.exists(TRANSCRIPTIONS_FOLDER):
            for filename in os.listdir(TRANSCRIPTIONS_FOLDER):
                filepath = os.path.join(TRANSCRIPTIONS_FOLDER, filename)
                if os.path.isfile(filepath):
                    transcriptions_size += os.path.getsize(filepath)
                    transcriptions_count += 1
        
        return jsonify({
            'uploads': {
                'count': uploads_count,
                'size_bytes': uploads_size,
                'size_display': f"{round(uploads_size / (1024 * 1024), 2)} MB"
            },
            'transcriptions': {
                'count': transcriptions_count,
                'size_bytes': transcriptions_size,
                'size_display': f"{round(transcriptions_size / (1024 * 1024), 2)} MB"
            },
            'total': {
                'size_bytes': uploads_size + transcriptions_size,
                'size_display': f"{round((uploads_size + transcriptions_size) / (1024 * 1024), 2)} MB"
            }
        })
    except Exception as e:
        return jsonify({'error': f'Erro ao obter informações de armazenamento: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)