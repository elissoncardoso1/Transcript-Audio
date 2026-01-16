import React, { useState } from 'react';
import { Copy, Download, Share2, Edit3, Check } from 'lucide-react';

export function EditorSection({ transcription, filename, onExport }) {
    const [text, setText] = useState(transcription);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full bg-surface border border-border rounded-xl overflow-hidden flex flex-col h-[600px] shadow-2xl">
            {/* Toolbar */}
            <div className="bg-surface-secondary border-b border-border p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h3 className="font-serif font-bold text-lg text-white">Transcrição</h3>
                    <span className="text-xs text-gray-500 bg-surface px-2 py-1 rounded border border-border max-w-[200px] truncate">
                        {filename}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopy}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                        title="Copiar texto"
                    >
                        {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={() => onExport(text, 'txt')}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                        title="Download TXT"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                    <div className="h-4 w-px bg-border mx-1"></div>
                    <button
                        className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-md text-sm font-medium transition-colors"
                    >
                        Salvar
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-hidden relative">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full h-full bg-surface p-6 md:p-8 text-gray-300 font-mono text-sm leading-relaxed resize-none focus:outline-none"
                    spellCheck={false}
                />
            </div>

            {/* Footer Status */}
            <div className="bg-surface-secondary border-t border-border p-2 px-4 text-xs text-gray-500 flex justify-between">
                <span>{text.length} caracteres</span>
                <span>Editável</span>
            </div>
        </div>
    );
}
