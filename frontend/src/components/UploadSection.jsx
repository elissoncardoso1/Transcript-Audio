import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileAudio, X, Play, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { AnimatePresence } from 'framer-motion';
import { api } from '../services/api';

export function UploadSection({ mode, onUploadComplete, isProcessing }) {
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState([]);
    const [sessionName, setSessionName] = useState('');
    const [language, setLanguage] = useState('auto');
    const [model, setModel] = useState('base');
    const [availableModels, setAvailableModels] = useState({});

    const inputRef = useRef(null);

    useEffect(() => {
        const loadModels = async () => {
            try {
                const data = await api.listModels();
                setAvailableModels(data.models);
                // Set first available model as default
                const installedModels = Object.keys(data.models).filter(key => data.models[key]);
                if (installedModels.length > 0 && !model) {
                    setModel(installedModels[0]);
                }
            } catch (err) {
                console.error("Failed to load models", err);
            }
        };
        loadModels();
    }, []);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
    };

    const handleFiles = (newFiles) => {
        if (mode === 'single') {
            setFiles([newFiles[0]]);
        } else {
            // Append new files for batch
            setFiles(prev => [...prev, ...Array.from(newFiles)]);
        }
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        if (files.length === 0) return;
        onUploadComplete({ files, sessionName, language, model });
    };

    return (
        <div className="w-full">
            {/* Batch Session Name Input */}
            {mode === 'batch' && (
                <div className="mb-4"
                >
                    <label className="block text-sm font-medium text-gray-400 mb-1">Nome da Sessão</label>
                    <input
                        type="text"
                        value={sessionName}
                        onChange={(e) => setSessionName(e.target.value)}
                        placeholder="Ex: Reunião de Planejamento 14/12"
                        className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                </div>
            )}

            {/* Upload Area */}
            <div
                className={clsx(
                    "relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ease-in-out flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden group",
                    dragActive ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-surface-secondary",
                    files.length > 0 ? "bg-surface-secondary/50" : ""
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    multiple={mode === 'batch'}
                    accept="audio/*"
                    onChange={handleChange}
                />

                <AnimatePresence>
                    {files.length === 0 ? (
                        <div key="empty"
                        >
                            <div className="w-16 h-16 bg-surface-secondary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <UploadCloud className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">
                                {mode === 'single' ? "Upload file" : "Upload multiple files"}
                            </h3>
                            <p className="text-gray-400 text-sm max-w-xs mx-auto">
                                Drag & drop or click to browse. Supported: MP3, WAV, OGG, M4A
                            </p>
                        </div>
                    ) : (
                        <div
                            className="w-full"
                            key="files"
                            onClick={(e) => e.stopPropagation()} // Prevent clicking file list from opening file dialog again
                        >
                            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto w-full px-2">
                                {files.map((file, idx) => (
                                    <div
                                        key={`${file.name}-${idx}`}
                                        className="flex items-center justify-between bg-surface p-3 rounded-lg border border-border"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <FileAudio className="w-4 h-4 text-primary" />
                                            </div>
                                            <div className="text-left overflow-hidden">
                                                <p className="text-sm font-medium truncate">{file.name}</p>
                                                <p className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeFile(idx)}
                                            className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                                className="mt-4 text-xs text-primary hover:text-primary-dark font-medium"
                            >
                                + Add more files
                            </button>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="mt-6 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Idioma</label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full bg-surface-secondary border border-border rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-primary outline-none"
                        >
                            <option value="auto">Auto Detecção</option>
                            <option value="pt">Português</option>
                            <option value="en">Inglês</option>
                            <option value="es">Espanhol</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Modelo</label>
                        <select
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="w-full bg-surface-secondary border border-border rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-primary outline-none"
                        >
                            {Object.keys(availableModels).filter(key => availableModels[key]).map((modelName) => (
                                <option key={modelName} value={modelName}>
                                    {modelName.charAt(0).toUpperCase() + modelName.slice(1)}
                                </option>
                            ))}
                            {Object.keys(availableModels).filter(key => availableModels[key]).length === 0 && (
                                <option value="">Nenhum modelo instalado</option>
                            )}
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={files.length === 0 || isProcessing}
                    className={clsx(
                        "md:w-auto w-full px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-200",
                        files.length > 0 && !isProcessing
                            ? "bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/25"
                            : "bg-surface-secondary text-gray-500 cursor-not-allowed"
                    )}
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processando...
                        </>
                    ) : (
                        <>
                            <Play className="w-5 h-5 fill-current" />
                            Iniciar Transcrição
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
