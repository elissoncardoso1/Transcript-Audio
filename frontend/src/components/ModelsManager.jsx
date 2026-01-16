import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Database, Download, Check, Trash2, HardDrive } from 'lucide-react';
import { clsx } from 'clsx';

export function ModelsManager() {
    const [models, setModels] = useState({});
    const [modelsInfo, setModelsInfo] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadModels();
    }, []);

    const loadModels = async () => {
        try {
            setLoading(true);
            const data = await api.listModels();
            setModels(data.models);
            setModelsInfo(data.models_info);
        } catch (err) {
            console.error("Failed to load models", err);
        } finally {
            setLoading(false);
        }
    };

    const modelList = ['tiny', 'base', 'small', 'medium', 'large'];

    if (loading) return <div className="p-4 text-center text-gray-500">Carregando modelos...</div>;

    return (
        <div className="bg-surface-secondary border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-white">Gerenciar Modelos</h3>
            </div>

            <div className="p-4 grid gap-3">
                {modelList.map((modelName) => {
                    const isInstalled = !!models[modelName];
                    const info = modelsInfo[modelName];
                    const size = info ? info.size_display : 'Unknown';

                    return (
                        <div key={modelName} className="flex items-center justify-between bg-surface p-3 rounded-lg border border-border hover:border-gray-600 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={clsx(
                                    "w-2 h-2 rounded-full",
                                    isInstalled ? "bg-success" : "bg-gray-600"
                                )} />
                                <div>
                                    <p className="font-medium text-white capitalize">{modelName}</p>
                                    <p className="text-xs text-gray-500">{isInstalled ? `${size} instalado` : 'Não instalado'}</p>
                                </div>
                            </div>

                            {isInstalled ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-success bg-success/10 px-2 py-1 rounded flex items-center gap-1">
                                        <Check className="w-3 h-3" /> Instalado
                                    </span>
                                </div>
                            ) : (
                                <button className="text-xs bg-primary/10 text-primary hover:bg-primary hover:text-white px-3 py-1.5 rounded transition-colors flex items-center gap-1">
                                    <Download className="w-3 h-3" /> Baixar
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
