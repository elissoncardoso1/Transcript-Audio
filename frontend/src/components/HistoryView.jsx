import React, { useEffect, useState } from 'react';
import { FileText, Download, Trash2, Calendar, Clock } from 'lucide-react';

export function HistoryView() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const res = await fetch('http://localhost:8080/history');
            const data = await res.json();
            setHistory(data);
        } catch (e) {
            console.error("Error loading history", e);
        } finally {
            setLoading(false);
        }
    };

    const handleClearHistory = async () => {
        if (!confirm('Tem certeza que deseja limpar todo o histórico?')) return;
        try {
            await fetch('http://localhost:8080/clear_history', { method: 'POST' });
            loadHistory();
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div className="text-center text-gray-500 mt-10">Carregando histórico...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-serif font-bold text-white">Histórico</h2>
                {history.length > 0 && (
                    <button
                        onClick={handleClearHistory}
                        className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                        <Trash2 className="w-4 h-4" /> Limpar Tudo
                    </button>
                )}
            </div>

            {history.length === 0 ? (
                <div className="text-center py-20 bg-surface-secondary rounded-xl border border-border">
                    <p className="text-gray-500">Nenhuma transcrição encontrada.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {history.map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-surface p-4 rounded-lg border border-border flex items-center justify-between group hover:border-primary/50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-surface-secondary flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-white">{item.filename}</h4>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.created.split(' ')[0]}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.created.split(' ')[1]}</span>
                                        <span>{(item.size / 1024).toFixed(1)} KB</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <a
                                    href={`http://localhost:8080/transcriptions/${item.filename}`}
                                    download
                                    className="p-2 text-gray-400 hover:text-white rounded hover:bg-white/10"
                                    title="Download"
                                >
                                    <Download className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
