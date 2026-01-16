import React, { useEffect, useState } from 'react';
import { HardDrive, Trash2 } from 'lucide-react';
import { api } from '../services/api';

export function StorageManagement() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await api.getStorageInfo();
            setStats(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const clearUploads = async () => {
        if (!confirm('Deseja apagar todos os uploads temporários?')) return;
        await api.clearUploads();
        loadStats();
    };

    if (loading) return <div className="text-center p-10">Carregando...</div>;
    if (!stats) return <div className="text-center p-10">Erro ao carregar dados.</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-serif font-bold text-white mb-8">Armazenamento</h2>

            <div className="bg-surface-secondary border border-border rounded-xl p-6 shadow-lg mb-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <HardDrive className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Uso Total</h3>
                        <p className="text-sm text-gray-400">{stats.total.size_display} usados</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-surface p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                            <span>Uploads</span>
                        </div>
                        <div className="text-right">
                            <span className="block font-medium">{stats.uploads.size_display}</span>
                            <span className="text-xs text-gray-500">{stats.uploads.count} arquivos</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center bg-surface p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full bg-green-400"></span>
                            <span>Transcrições</span>
                        </div>
                        <div className="text-right">
                            <span className="block font-medium">{stats.transcriptions.size_display}</span>
                            <span className="text-xs text-gray-500">{stats.transcriptions.count} arquivos</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <button
                    onClick={clearUploads}
                    className="p-4 bg-surface-secondary border border-border rounded-xl hover:bg-surface-secondary/80 hover:border-red-500/50 transition-all flex flex-col items-center gap-2 group"
                >
                    <Trash2 className="w-6 h-6 text-gray-400 group-hover:text-red-500 transition-colors" />
                    <span className="font-medium group-hover:text-white transition-colors">Limpar Uploads</span>
                    <span className="text-xs text-gray-500">Remove arquivos temporários</span>
                </button>
            </div>
        </div>
    );
}
