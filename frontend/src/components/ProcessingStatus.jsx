import React from 'react';
import { Loader2, CheckCircle, Clock } from 'lucide-react';

export function ProcessingStatus({ mode, status, onCancel }) {
    // status structure:
    // Single: { state: 'processing'|'completed', progress: number (simulated), filename: string }
    // Batch: { state: 'processing'|'completed', total: number, completed: number, currentFile: string, files: Array }

    return (
        <div className="w-full bg-surface-secondary border border-border rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    {mode === 'single' ? 'Processando Áudio' : 'Processando Lote'}
                    <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                </h3>
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="text-sm text-red-400 hover:text-red-300 transition-colors"
                    >
                        Cancelar
                    </button>
                )}
            </div>

            {mode === 'single' ? (
                <div className="space-y-4">
                    <div className="flex justify-between text-sm text-gray-400">
                        <span>Transcrevendo...</span>
                        <span>{status.filename}</span>
                    </div>
                    {/* Indeterminate progress bar for now as backend doesn't give % */}
                    <div className="h-2 bg-surface rounded-full overflow-hidden w-full">
                        <div className="h-full bg-primary w-1/3 animate-pulse" />
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                        Isso pode levar alguns minutos dependendo do tamanho do arquivo e do modelo escolhido.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Overall Progress */}
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-white font-medium">Progresso Geral</span>
                            <span className="text-primary">{status.completed} / {status.total} arquivos</span>
                        </div>
                        <div className="h-4 bg-surface rounded-full overflow-hidden w-full">
                            <div
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: `${(status.completed / status.total) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Current File Activity */}
                    <div className="bg-surface rounded-lg p-4 border border-border">
                        <p className="text-sm text-gray-400 mb-3">Atividade Atual:</p>
                        <div className="flex items-center gap-3">
                            <Loader2 className="w-5 h-5 text-primary animate-spin" />
                            <div>
                                <p className="font-medium text-white">{status.currentFile || 'Inicializando...'}</p>
                                <p className="text-xs text-gray-500">Processando...</p>
                            </div>
                        </div>
                    </div>

                    {/* File List Preview (limited) */}
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {status.files && status.files.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm p-2 rounded bg-surface/50">
                                <span className="truncate max-w-[200px] text-gray-300">{file.name}</span>
                                {file.status === 'completed' ? (
                                    <span className="text-success flex items-center gap-1 text-xs"><CheckCircle className="w-3 h-3" /> Feito</span>
                                ) : file.status === 'processing' ? (
                                    <span className="text-primary flex items-center gap-1 text-xs"><Loader2 className="w-3 h-3 animate-spin" /> Processando</span>
                                ) : (
                                    <span className="text-gray-600 flex items-center gap-1 text-xs"><Clock className="w-3 h-3" /> Fila</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
