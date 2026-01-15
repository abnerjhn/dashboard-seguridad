import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, BarChart2, TrendingUp, BrainCircuit, Shield, Crosshair, Trophy, Users, Calendar, Siren, BookOpen } from 'lucide-react';

import { usePdfGenerator } from '../../context/PdfContext';

interface SidebarProps {
    onExport: () => void;
    selectedComuna: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
    onExport,
    selectedComuna
}) => {
    const { startGeneration, isGenerating } = usePdfGenerator();
    const navItems = [
        { to: '/', icon: FileText, label: 'Portada' },
        { to: '/dashboard', icon: LayoutDashboard, label: '1. Resumen Ejecutivo' },
        { to: '/fact-sheet', icon: FileText, label: '1a. Ficha Comunal (PDF)' },
        { to: '/weekly', icon: BarChart2, label: '2. Análisis Táctico' },
        { to: '/tactical-traffic', icon: Siren, label: '2a. Semáforo STOP' },
        { to: '/tactical-daily', icon: Calendar, label: '2b. Perfil Diario' },
        { to: '/tactical-trend', icon: TrendingUp, label: '2c. Evolución' },
        { to: '/matrix', icon: Crosshair, label: '2d. Matriz de Focos' },
        { to: '/strategic', icon: TrendingUp, label: '3. Análisis Estratégico' },
        { to: '/ranking', icon: Trophy, label: '3a. Benchmark Regional' },
        { to: '/trends', icon: TrendingUp, label: '3b. Tendencias Históricas' },
        { to: '/forecasting', icon: BrainCircuit, label: '3c. Proyección' },
        { to: '/demographics', icon: Users, label: '3d. Demografía' },
        { to: '/seasonality', icon: Calendar, label: '3e. Estacionalidad' },
        { to: '/projections', icon: BrainCircuit, label: '4. Simulador IA' },
        { to: '/impact-evaluator', icon: BrainCircuit, label: '4a. Evaluador de Impacto' },
        { to: '/documentation', icon: BookOpen, label: 'Descripción' },
    ];

    // No change needed in class name if the CSS variable was updated correctly.
    // Wait, I should manually trigger a rebuild or style injection? No, HMR handles it.
    return (
        <div className="w-64 bg-slate-950 h-screen text-white flex flex-col fixed left-0 top-0 z-30 font-sans border-r border-white/5">
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center space-x-2 mb-1">
                    <div className="bg-orange-600 p-1 rounded-sm">
                        <Shield className="w-4 h-4 text-white" fill="currentColor" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">SECURITY<span className="text-orange-600">INSIGHT</span></span>
                </div>
                <div className="text-[10px] text-gray-500 font-medium uppercase tracking-widest pl-1">
                    v1.1 Premium Dashboard
                </div>
            </div>



            <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {navItems.map((item) => {
                    const isSubItem = /^\d+[a-z]\./.test(item.label);
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center rounded-lg transition-colors ${isSubItem
                                    ? 'pl-11 pr-4 py-2 text-xs space-x-2'
                                    : 'px-4 py-3 text-sm space-x-3'
                                } ${isActive
                                    ? 'bg-white/5 text-white font-bold'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className={`${isSubItem ? 'w-3 h-3' : 'w-5 h-5'} ${isActive ? 'text-orange-500' : 'text-current'}`} />
                                    <span>{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/5">
                <div className="flex items-center space-x-3 mb-6 px-2">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-sm">
                        IL
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white">Admin Municipal</p>
                        <p className="text-xs text-gray-500">{selectedComuna}, Valparaíso</p>
                    </div>
                </div>

                <button
                    onClick={() => window.location.href = '/print-wizard'} // Simple navigation, or use useNavigate if available in hooks. Sidebar is inside Router.
                    className="w-full flex items-center justify-center space-x-2 bg-transparent border border-white/10 hover:bg-white/5 text-white rounded-lg px-4 py-3 transition-colors text-sm"
                >
                    <FileText className="w-4 h-4" />
                    <span>Exportar Reporte</span>
                </button>
            </div>
        </div>
    );
};
