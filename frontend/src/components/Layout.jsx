import React from 'react';
import { Mic, History, Settings, HardDrive, Menu } from 'lucide-react';

export function Layout({ children, currentView, onViewChange }) {
    return (
        <div className="min-h-screen bg-surface text-white font-sans selection:bg-primary/30">
            {/* Sidebar - Desktop */}
            <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-secondary border-r border-border hidden md:flex flex-col z-20">
                <div className="p-6 border-b border-border">
                    <h1 className="text-xl font-display font-bold flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <Mic className="w-5 h-5 text-white" />
                        </div>
                        TranscriptAI
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <NavItem
                        icon={Mic}
                        label="Transcrever"
                        active={currentView === 'home'}
                        onClick={() => onViewChange('home')}
                    />
                    <NavItem
                        icon={History}
                        label="Histórico"
                        active={currentView === 'history'}
                        onClick={() => onViewChange('history')}
                    />
                    <NavItem
                        icon={HardDrive}
                        label="Armazenamento"
                        active={currentView === 'storage'}
                        onClick={() => onViewChange('storage')}
                    />
                </nav>

                <div className="p-4 border-t border-border">
                    <div className="bg-surface p-3 rounded-lg border border-border">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Armazenamento</h4>
                        <div className="w-full bg-surface-secondary h-1.5 rounded-full overflow-hidden mb-1">
                            <div className="bg-secondary h-full rounded-full" style={{ width: '45%' }}></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>-- MB usado</span>
                            <span>500 MB</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-surface-secondary sticky top-0 z-20">
                <h1 className="text-lg font-display font-bold flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <Mic className="w-4 h-4 text-white" />
                    </div>
                    TranscriptAI
                </h1>
                <button className="p-2 hover:bg-white/5 rounded-md">
                    <Menu className="w-6 h-6" />
                </button>
            </header>

            {/* Main Content */}
            <main className="md:ml-64 p-4 md:p-8 max-w-7xl mx-auto w-full">
                {children}
            </main>
        </div>
    );
}

function NavItem({ icon, label, active, onClick }) {
    const Icon = icon;
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${active
                ? 'bg-primary/10 text-primary'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}>
            <Icon className="w-4 h-4" />
            {label}
        </button>
    );
}
