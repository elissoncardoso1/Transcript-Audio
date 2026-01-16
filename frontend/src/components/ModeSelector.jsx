import React from 'react';
import { FileAudio, Layers } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export function ModeSelector({ mode, setMode }) {
    return (
        <div className="flex items-center justify-center mb-8">
            <div className="bg-surface-secondary p-1 rounded-lg border border-border inline-flex relative">
                {/* Active Background Pill Animation */}
                <div
                    className="absolute top-1 bottom-1 bg-primary rounded-md shadow-sm transition-transform duration-200"
                    style={{
                        transform: mode === 'single' ? 'translateX(0)' : 'translateX(100%)',
                        width: '50%'
                    }}
                />

                <button
                    onClick={() => setMode('single')}
                    className={twMerge(
                        "relative z-10 flex items-center px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200",
                        mode === 'single' ? "text-white" : "text-text-secondary hover:text-white"
                    )}
                >
                    <FileAudio className="w-4 h-4 mr-2" />
                    Arquivo Único
                </button>

                <button
                    onClick={() => setMode('batch')}
                    className={twMerge(
                        "relative z-10 flex items-center px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200",
                        mode === 'batch' ? "text-white" : "text-text-secondary hover:text-white"
                    )}
                >
                    <Layers className="w-4 h-4 mr-2" />
                    Lote (Múltiplos)
                </button>
            </div>
        </div>
    );
}
