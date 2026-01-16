import { useState, useRef } from 'react';
import { Layout } from './components/Layout';
import { ModeSelector } from './components/ModeSelector';
import { UploadSection } from './components/UploadSection';
import { ProcessingStatus } from './components/ProcessingStatus';
import { EditorSection } from './components/EditorSection';
import { ModelsManager } from './components/ModelsManager';
import { BatchResults } from './components/BatchResults';
import { HistoryView } from './components/HistoryView';
import { StorageManagement } from './components/StorageManagement';
import { api } from './services/api';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [currentView, setCurrentView] = useState('home'); // home, history, storage
  const [mode, setMode] = useState('single');
  const [appState, setAppState] = useState('idle'); // idle, uploading, processing, completed
  const [statusObj, setStatusObj] = useState({});
  const [result, setResult] = useState(null);
  const [, setBatchId] = useState(null);

  const pollingRef = useRef(null);

  const startPollingSingle = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const data = await api.getTranscriptionStatus();
        if (data.status === 'completed') {
          clearInterval(pollingRef.current);
          setAppState('completed');
          setResult({ text: data.text, filename: data.filename });
          setStatusObj(prev => ({ ...prev, state: 'completed', progress: 100 }));
        } else if (data.status === 'error') {
          clearInterval(pollingRef.current);
          setAppState('idle');
          alert(`Erro: ${data.error}`);
        } else if (data.status === 'processing') {
          setStatusObj(prev => ({ ...prev, state: 'processing' }));
        }
      } catch (e) {
        console.error("Polling error", e);
      }
    }, 2000);
  };

  const startPollingBatch = (bid) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const data = await api.getBatchStatus(bid);
        setStatusObj({
          state: data.status,
          total: data.total,
          completed: data.completed,
          currentFile: data.files.find(f => f.status === 'processing')?.name,
          files: data.files
        });

        if (data.status === 'completed') {
          clearInterval(pollingRef.current);
          setAppState('completed');
          setResult(data);
        }
      } catch (e) {
        console.error("Batch Polling error", e);
      }
    }, 2000);
  };

  const handleUploadComplete = async ({ files, sessionName, language, model }) => {
    try {
      if (mode === 'single') {
        setAppState('uploading');
        // Upload
        await api.uploadFile(files[0]);

        // Start Transcription
        setAppState('processing');
        setStatusObj({ state: 'processing', filename: files[0].name });

        await api.transcribe(language, model);
        startPollingSingle();

      } else {
        setAppState('uploading');
        const uploadRes = await api.uploadBatch(files, sessionName);
        const bid = uploadRes.batch_id;
        setBatchId(bid);

        setAppState('processing');
        setStatusObj({ state: 'ready', total: files.length, completed: 0, files: [] }); // Initial status

        await api.transcribeBatch(bid, language, model);
        startPollingBatch(bid);
      }
    } catch (e) {
      console.error("Error starting process", e);
      setAppState('idle');
      alert("Falha ao iniciar o processo.");
    }
  };

  const handleCancel = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setAppState('idle');
    setResult(null);
    setStatusObj({});
  };

  const handleExport = async (text, format) => {
    try {
      const response = await fetch('http://localhost:8080/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, format })
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcription.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error("Export failed", e);
    }
  };

  const renderHome = () => (
    <>
      <header className="mb-10 text-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-serif font-bold mb-4 tracking-tight"
        >
          Transcript Audio
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-gray-400 max-w-2xl mx-auto"
        >
          Converta reuniões, entrevistas e áudios em texto com a nova interface premium.
        </motion.p>
      </header>

      <ModeSelector mode={mode} setMode={(m) => {
        if (appState === 'idle') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setAppState('idle');
          setResult(null);
          setStatusObj({});
          setMode(m);
        }
      }} />

      <AnimatePresence mode="wait">
        {/* IDLE STATE: UPLOAD */}
        {appState === 'idle' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-8"
          >
            <UploadSection mode={mode} onUploadComplete={handleUploadComplete} isProcessing={false} />
            <div className="mt-8">
              <ModelsManager />
            </div>
          </motion.div>
        )}

        {/* PROCESSING STATE */}
        {(appState === 'processing' || appState === 'uploading') && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ProcessingStatus mode={mode} status={statusObj} onCancel={handleCancel} />
          </motion.div>
        )}

        {/* COMPLETED STATE: RESULTS */}
        {appState === 'completed' && (
          <motion.div
            key="completed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {mode === 'single' ? (
              <EditorSection
                transcription={result?.text || ''}
                filename={result?.filename || 'Transcrição'}
                onExport={handleExport}
              />
            ) : (
              <BatchResults
                results={result}
                onReset={() => setAppState('idle')}
              />
            )}

            <button
              onClick={() => setAppState('idle')}
              className="mt-6 text-gray-500 hover:text-white underline text-sm mx-auto block"
            >
              Voltar ao início
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      <div className="max-w-4xl mx-auto pb-20">
        {currentView === 'home' && renderHome()}
        {currentView === 'history' && <HistoryView />}
        {currentView === 'storage' && <StorageManagement />}
      </div>
    </Layout>
  );
}

export default App;
