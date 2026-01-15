import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Search } from 'lucide-react';
import { useDashboardContext } from '../../context/DashboardContext';
import { getWeekDateRange } from '../../utils/dateUtils';


export const Layout: React.FC = () => {
    const location = useLocation();

    // Consume context provided by App.tsx
    const { globalState, loading, error } = useDashboardContext();
    const { selectedComuna, selectedWeek } = globalState;

    const handleExport = () => {
        // Open the full report view in a new tab which will auto-trigger print
        window.open('/full-report', '_blank');
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-institutional-blue"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center bg-red-50 text-red-800">
                <p>Error cargando datos: {error}</p>
            </div>
        );
    }

    // Header logic ...

    return (
        <div className="flex bg-slate-50 min-h-screen font-sans">
            <Sidebar
                onExport={handleExport}
                selectedComuna={selectedComuna}
            />
            <main className="flex-1 ml-64 p-8 transition-all duration-300" id="dashboard-content">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header / Top bar info */}
                    <header className="flex justify-between items-start mb-6 pb-6 border-b border-gray-200">
                        <div>
                            <div className="flex flex-col text-sm text-gray-500 mb-1">
                                <span className="text-slate-700 font-medium text-lg">Comuna: {selectedComuna}, Región de Valparaíso</span>
                                <span className="text-slate-500 font-normal">
                                    Semana {selectedWeek > 0 ? selectedWeek : '-'}: {selectedWeek > 0 ? getWeekDateRange(selectedWeek, 2025) : 'Cargando...'}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-6">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Buscar indicador..."
                                    className="bg-white border border-gray-200 text-gray-700 text-sm rounded-full px-4 py-2 pl-10 focus:outline-none focus:ring-1 focus:ring-institutional-orange w-64 placeholder-gray-400 shadow-sm"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </header>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200 shadow-sm flex items-center">
                            <span className="font-bold mr-2">Error:</span> {error}
                        </div>
                    )}

                    <Outlet />
                </div>
            </main>
        </div>
    );
};
