import React from 'react';
import { useDashboardContext } from '../context/DashboardContext';
import { WeekSelector } from '../components/UI/WeekSelector';
import logoImg from '../assets/Logo.png';

import { DataSourceIndicator } from '../components/UI/DataSourceIndicator';

import { usePrintPreferences } from '../context/PrintPreferencesContext'; // Import context

export const PortadaLive: React.FC = () => {
    const { globalState } = useDashboardContext();
    const { selectedComuna, year, maxWeek, selectedWeek, setSelectedWeek } = globalState;
    const { isPrinting } = usePrintPreferences(); // Get print state

    return (
        <div className={`${isPrinting ? 'bg-white' : 'bg-white rounded-t-3xl shadow-lg'} min-h-[calc(100vh-8rem)] relative overflow-hidden`}>
            {/* Dark Header Strip inside the card */}
            <div className="bg-slate-950 p-8 flex justify-between items-start relative z-10 border-b border-white/5">
                <div className="flex items-center space-x-5">
                    <img src={logoImg} alt="Instituto Libertad Logo" className="h-20 object-contain brightness-0 invert" />
                </div>
                <div className="text-right">
                    <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span className="text-xs font-medium text-emerald-500">Live Data Feed</span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-mono tracking-wide">ID: #QLT-{year}-{maxWeek}-LIVE</p>
                </div>
            </div>

            {/* Content Body */}
            <div className="p-12 md:p-16 max-w-5xl mx-auto">
                <div className="flex items-center space-x-4 mb-8">
                    <div className="bg-orange-100 text-institutional-orange px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-sm">
                        Informe Semanal
                    </div>

                    <div className="relative">
                        <select
                            value={selectedComuna}
                            onChange={(e) => globalState.setSelectedComuna(e.target.value)}
                            className="appearance-none bg-white border border-gray-300 hover:border-institutional-orange text-gray-700 text-sm font-medium py-1 pl-3 pr-8 rounded focus:outline-none focus:ring-1 focus:ring-institutional-orange cursor-pointer"
                        >
                            {globalState.availableComunas.map(c => (
                                <option key={c} value={c}>Comuna de {c}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                </div>

                <h1 className="text-6xl font-black text-slate-900 leading-tight mb-6">
                    Monitor de Seguridad<br />
                    <span className="text-orange-600">Comuna {selectedComuna}</span>
                </h1>

                <p className="text-2xl text-slate-500 font-light max-w-2xl mb-16">
                    Análisis táctico, estratégico y predictivo para la toma de decisiones.
                </p>

                {/* Bottom Indicators */}
                <div className="flex items-start space-x-12 border-t border-gray-100 pt-8">
                    <div className="border-l-4 border-institutional-blue pl-4">
                        <WeekSelector
                            selectedWeek={selectedWeek || maxWeek}
                            maxWeek={maxWeek}
                            year={year}
                            onSelectWeek={setSelectedWeek}
                        />
                    </div>

                    <div className="border-l-4 border-institutional-orange pl-4">
                        <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1 flex items-center gap-2">
                            Estado de Alerta IA
                            <DataSourceIndicator dataSourceId="portada-alerta" className="ml-2" />
                        </div>
                        <p className="text-4xl font-bold text-institutional-orange mb-1">Nivel Medio-Alto</p>
                        <p className="text-sm text-gray-500">Foco: Robos con Violencia</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

