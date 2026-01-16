import React from 'react';
import { FileText, Download, Play, CheckCircle, AlertTriangle } from 'lucide-react';

export function BatchResults({ results, onReset }) {
    // results: { session_name, total, completed, transcriptions: [], errors: [] }

    return (
        <div className="w-full space-y-6">
            <div className="bg-surface-secondary border border-border rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <CheckCircle className="w-6 h-6 text-success" />
                            Lote Concluído
                        </h3>
                        {results.session_name && (
                            <p className="text-gray-400 text-sm mt-1">{results.session_name}</p>
                        )}
                    </div>

                    <div className="text-right">
                        <p className="text-2xl font-bold text-white">
                            {results.completed} <span className="text-gray-500 text-base font-normal">/ {results.total}</span>
                        </p>
                        <p className="text-xs text-gray-500">Arquivos Processados</p>
                    </div>
                </div>

                {/* Global Actions */}
                <div className="flex gap-3 mb-6">
                    <button className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg py-3 font-medium flex items-center justify-center gap-2 transition-colors">
                        <FileText className="w-4 h-4" />
                        Baixar Resumo Consolidado (.md)
                    </button>
                </div>

                {/* File List */}
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Transcrições Individuais</h4>

                    {results.transcriptions && results.transcriptions.map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-surface p-4 rounded-lg border border-border flex items-center justify-between group hover:border-gray-600 transition-colors"
                        >
                            <div className="overflow-hidden">
                                <p className="font-medium text-white truncate">{item.filename}</p>
                                <p className="text-xs text-gray-500 truncate mt-1 max-w-md">{item.text.substring(0, 60)}...</p>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 text-gray-400 hover:text-white rounded hover:bg-white/10" title="Editar">
                                    <FileText className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-white rounded hover:bg-white/10" title="Download">
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {results.errors && results.errors.length > 0 && (
                        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <h5 className="flex items-center gap-2 text-red-400 font-bold mb-2">
                                <AlertTriangle className="w-4 h-4" />
                                Erros ({results.errors.length})
                            </h5>
                            <ul className="list-disc list-inside text-sm text-red-300 space-y-1">
                                {results.errors.map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-center">
                    <button
                        onClick={onReset}
                        className="text-gray-400 hover:text-white flex items-center gap-2 text-sm transition-colors px-4 py-2 hover:bg-white/5 rounded-full"
                    >
                        <Play className="w-4 h-4" /> Novo Lote
                    </button>
                </div>
            </div>
        </div>
    );
}
