import React, { useEffect, useState } from 'react';
import { useDataFetcher } from '../hooks/useDataFetcher';
import { DashboardProvider, type DashboardContextType } from '../context/DashboardContext';

import { PortadaLive } from './PortadaLive';
import { ExecutiveSummary } from './ExecutiveSummary';
import { CommunalFactSheet } from './executive/CommunalFactSheet';
import { WeeklyAnalysis } from './WeeklyAnalysis';
import { TacticalTrafficLight } from './tactical/TacticalTrafficLight';
import { TacticalDailyProfile } from './tactical/TacticalDailyProfile';
import { TacticalTrend } from './tactical/TacticalTrend';
import { CrimeMatrix } from './CrimeMatrix';
import { StrategicAnalysis } from './StrategicAnalysis';
import { RegionalBenchmarking } from './RegionalBenchmarking';
import { HistoricalTrends } from './HistoricalTrends';
import { Forecasting } from './Forecasting';
import { DemographicAnalysis } from './DemographicAnalysis';
import { Seasonality } from './Seasonality';
import { AIProjections } from './AIProjections';
import { ImpactEvaluator } from './simulator/ImpactEvaluator';

export const FullReport: React.FC = () => {
    const {
        leyStopData,
        ceadData,
        comunaAnalysisData,
        nationalData,
        historicalData,
        demographicsData,
        loading,
        error,
        availableComunas,
        maxWeek
    } = useDataFetcher();

    const [selectedComuna, setSelectedComuna] = useState<string>('');
    const [progress, setProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState('Inicializando...');
    const [isReady, setIsReady] = useState(false);

    // Initialize selectedComuna when data loads
    useEffect(() => {
        if (availableComunas.length > 0 && !selectedComuna) {
            setSelectedComuna(availableComunas.includes('Quillota') ? 'Quillota' : availableComunas[0]);
        }
    }, [availableComunas, selectedComuna]);

    // Construct Context Value
    const contextValue: DashboardContextType = {
        data: {
            leyStop: leyStopData,
            cead: ceadData,
            comunaAnalysis: comunaAnalysisData,
            national: nationalData,
            historical: historicalData,
            demographics: demographicsData
        },
        globalState: {
            selectedComuna,
            setSelectedComuna,
            availableComunas,
            maxWeek,
            week: 47,
            year: 2024,
            selectedWeek: maxWeek || 47,
            setSelectedWeek: () => { }, // No-op for report view
            viewState: {},
            setViewState: () => { }
        },
        loading,
        error
    };

    // Progress Logic
    useEffect(() => {
        if (loading) {
            setProgress(10);
            setStatusMessage('Obteniendo datos del servidor...');
            return;
        }

        if (!selectedComuna) {
            setProgress(20);
            setStatusMessage('Configurando reporte...');
            return;
        }

        // Data is loaded, start rendering phase
        setStatusMessage('Generando visualizaciones...');
        let currentProgress = 30;

        const timer = setInterval(() => {
            currentProgress += 10; // Increment 10% every 500ms -> approx 3.5s total rendering buffer

            if (currentProgress >= 90) {
                setStatusMessage('Finalizando documento...');
            }

            if (currentProgress >= 100) {
                clearInterval(timer);
                setProgress(100);
                setIsReady(true);
            } else {
                setProgress(currentProgress);
            }
        }, 500);

        return () => clearInterval(timer);
    }, [loading, selectedComuna]);

    // Loading / Progress Overlay
    if (!isReady) {
        return (
            <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col items-center justify-center text-white">
                <div className="w-96 space-y-4">
                    <div className="flex justify-between items-end">
                        <h2 className="text-2xl font-bold">Generando Reporte PDF</h2>
                        <span className="text-orange-500 font-mono font-bold">{progress}%</span>
                    </div>

                    <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                        <div
                            className="h-full bg-gradient-to-r from-orange-600 to-red-600 transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <p className="text-sm text-gray-400 text-center animate-pulse">{statusMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <DashboardProvider value={contextValue}>
            <div className="bg-slate-50 min-h-screen text-slate-900 p-8 max-w-[210mm] mx-auto print:bg-white print:p-0 print:max-w-none">
                {/* CSS Overrides for Print */}
                <style>{`
                    @media print {
                        @page { size: auto; margin: 10mm; }
                        body { background-color: white !important; -webkit-print-color-adjust: exact; }
                        /* Force light mode styles for generic containers */
                        .bg-slate-950, .bg-slate-900, .bg-slate-800 { 
                            background-color: white !important; 
                            color: black !important; 
                            border: 1px solid #ddd !important;
                        }
                        .text-white { color: black !important; }
                        .text-gray-400, .text-gray-500 { color: #333 !important; }
                        
                        /* Hide UI elements definitely */
                        button, .no-print { display: none !important; }
                        
                        /* Fix Charts */
                        .recharts-responsive-container { width: 100% !important; min-height: 300px !important; }
                        
                        /* Ensure breaks */
                        .break-before-page { break-before: page; }

                        /* Print Modifications based on classes */
                        .landscape-mode {
                            width: 297mm !important; /* A4 Landscape width */
                            max-width: 297mm !important;
                            transform: rotate(90deg) translateY(-210mm); /* Rotate and shift back */
                            transform-origin: top left;
                            height: 210mm !important;
                            overflow: hidden;
                            position: relative;
                            left: 0;
                        }
                        .fit-page-mode {
                            transform: scale(0.85); /* Slightly shrink to fit margins */
                            transform-origin: top center;
                            width: 115% !important; /* Compensate width */
                        }
                        
                        /* Combined landscape + fit */
                        .landscape-mode.fit-page-mode {
                            transform: rotate(90deg) translateY(-210mm) scale(0.9);
                            width: 320mm !important;
                        }
                    }

                    /* Visual preview adjustments for controls */
                    .landscape-mode {
                         /* In preview, just make it wider scrollable maybe? Or assume portrait preview */
                         border: 2px dashed blue !important;
                    }
                `}</style>

                <div className="text-center mb-12 py-12 border-b-4 border-orange-600 print:py-4">
                    <h1 className="text-4xl font-black uppercase mb-2">Reporte Integral de Seguridad</h1>
                    <p className="text-xl text-gray-500">Comuna: {selectedComuna}</p>
                    <p className="text-sm text-gray-400">{new Date().toLocaleDateString()}</p>
                    <button
                        onClick={() => window.print()}
                        className="mt-8 bg-orange-600 text-white px-6 py-2 rounded font-bold hover:bg-orange-700 shadow-lg transition-transform hover:scale-105 no-print"
                    >
                        Imprimir / Guardar PDF
                    </button>
                    <p className="mt-4 text-xs text-slate-400 no-print">
                        (Ajuste las opciones de cada página pasando el mouse sobre ella)
                    </p>
                </div>

                <div className="space-y-8">
                    <SectionWrapper title="Portada"><PortadaLive /></SectionWrapper>
                    <SectionWrapper title="Resumen Ejecutivo"><ExecutiveSummary /></SectionWrapper>
                    <SectionWrapper title="Ficha Comunal"><CommunalFactSheet /></SectionWrapper>
                    <SectionWrapper title="Análisis Táctico"><WeeklyAnalysis /></SectionWrapper>
                    <SectionWrapper title="Semáforo"><TacticalTrafficLight /></SectionWrapper>
                    <SectionWrapper title="Perfil Diario"><TacticalDailyProfile /></SectionWrapper>
                    <SectionWrapper title="Tendencia"><TacticalTrend /></SectionWrapper>
                    <SectionWrapper title="Matriz"><CrimeMatrix /></SectionWrapper>
                    <SectionWrapper title="Estratégico"><StrategicAnalysis /></SectionWrapper>
                    <SectionWrapper title="Ranking"><RegionalBenchmarking /></SectionWrapper>
                    <SectionWrapper title="Histórico"><HistoricalTrends /></SectionWrapper>
                    <SectionWrapper title="Proyección"><Forecasting /></SectionWrapper>
                    <SectionWrapper title="Demografía"><DemographicAnalysis /></SectionWrapper>
                    <SectionWrapper title="Estacionalidad"><Seasonality /></SectionWrapper>
                    <SectionWrapper title="Proyecciones IA"><AIProjections /></SectionWrapper>
                    <SectionWrapper title="Evaluador"><ImpactEvaluator /></SectionWrapper>
                </div>

                <div className="text-center text-xs text-gray-400 mt-12 py-8 border-t border-gray-200 break-before-page">
                    Generado por SecurityInsight v1.1 - Documento Confidencial
                </div>
            </div>
        </DashboardProvider>
    );
};

// Section Wrapper with Controls (Moved Outside)
const SectionWrapper = ({ children, title }: { children: React.ReactNode, title: string }) => {
    const [isLandscape, setIsLandscape] = useState(false);
    const [fitToPage, setFitToPage] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="mb-0 break-before-page relative group/section">
            {/* Print Control Bar (Hidden in Print) */}
            <div className="absolute top-0 right-0 -mt-10 mb-2 flex space-x-2 no-print opacity-0 group-hover/section:opacity-100 transition-opacity z-50">
                <button
                    onClick={() => setIsLandscape(!isLandscape)}
                    className={`px-3 py-1 text-xs font-bold rounded border ${isLandscape ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}
                >
                    {isLandscape ? 'Horizontal (Landscape)' : 'Vertical (Portrait)'}
                </button>
                <button
                    onClick={() => setFitToPage(!fitToPage)}
                    className={`px-3 py-1 text-xs font-bold rounded border ${fitToPage ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}
                >
                    {fitToPage ? 'Ajustar a Pág' : 'Escala Real'}
                </button>
                <button
                    onClick={handleRefresh}
                    className="px-3 py-1 text-xs font-bold rounded border bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                >
                    Refrescar
                </button>
            </div>

            {/* Content Container */}
            <div
                className={`
                    p-2 rounded-lg border border-slate-800 print:border-none transition-all duration-300 origin-top-left
                    ${isLandscape ? 'landscape-mode' : ''}
                    ${fitToPage ? 'fit-page-mode' : ''}
                `}
                key={refreshKey}
            >
                {children}
            </div>
        </div>
    );
};
