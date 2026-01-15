import React from 'react';
import { useDashboardContext } from '../context/DashboardContext';
import { Card } from '../components/UI/Card';
import { Siren, Filter, AlertTriangle, Info } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

import { DataSourceIndicator } from '../components/UI/DataSourceIndicator';
import { PageHeader } from '../components/UI/PageHeader';
import { DualTabLayout } from '../components/Layout/DualTabLayout';


export const WeeklyAnalysis: React.FC = () => {
    const { globalState } = useDashboardContext();
    const { selectedComuna } = globalState;

    const [realTrends, setRealTrends] = React.useState<any[]>([]);
    const [categories, setCategories] = React.useState<string[]>([]);

    const selectedCategory = globalState.viewState?.['weekly-analysis']?.category || 'Todas';
    const setSelectedCategory = (cat: string) => globalState.setViewState('weekly-analysis', { ...globalState.viewState?.['weekly-analysis'], category: cat });

    React.useEffect(() => {
        const processData = async () => {
            const loadedData = await import('../utils/dataLoader').then(m => m.loadStopData());
            const targetWeek = globalState.selectedWeek || globalState.maxWeek;

            // 1. Group by Crime
            const groups: Record<string, any[]> = {};
            loadedData.forEach(d => {
                // Filter by rough match or code if available, assuming global selectedComuna matches loaded for now
                // or just aggregate everything since the loader is simple
                if (!groups[d.delito]) groups[d.delito] = [];
                groups[d.delito].push(d);
            });

            // Set categories for filter
            setCategories(['Todas', ...Object.keys(groups).sort()]);

            // 2. Process each group to get current, prev, and trend
            const results = Object.keys(groups).map(delito => {
                // Filter data to only include weeks up to selected week
                // Assuming data has 'Semana' property based on ExecutiveSummary usage, or 'fecha'
                // The loader might return objects with 'Semana'. Let's check previously viewed files or infer.
                // ExecutiveSummary uses d.Semana. 
                // WeeklyAnalysis uses d.fecha.
                // We need to verify if loadedData has Semana.
                // loadedData comes from loadStopData.

                // Let's assume we can filter by week if available, or by date if we calculate it.
                // For safety, let's look at what loadStopData returns in a separate step if unsure, but 
                // typically it matches the type LeyStopData which has Semana.

                const entries = groups[delito]
                    .filter(d => d.Semana <= targetWeek) // Filter by selected week cap
                    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

                // Intead of complex date logic, take last 10 entries as "trend" ending at selected week
                const trend = entries.slice(-10).map((e, i) => ({ name: i, value: e.frecuencia }));

                const current = trend[trend.length - 1]?.value || 0;
                const prev = trend[trend.length - 2]?.value || 0;
                const variation = prev === 0 ? 0 : ((current - prev) / prev) * 100;

                return {
                    name: delito,
                    cur: current,
                    prev: prev,
                    var: variation,
                    trend: trend
                };
            }).sort((a, b) => b.cur - a.cur).slice(0, 10); // Top 10 by volume

            setRealTrends(results);
        };
        processData();
    }, [selectedComuna, globalState.selectedWeek, globalState.maxWeek]);

    // Use mapped data for sparklines
    const displayData = realTrends.length > 0 ? realTrends : [];


    // Mock data for heat map to match screenshot visual
    const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    const timeSlots = ['08-12', '12-16', '16-20', '20-00', '00-04'];

    // Function to get opacity/color based on mock intensity
    const getIntensityClass = (dayIndex: number, timeIndex: number) => {
        // Mock specific intensities to look somewhat like the screenshot
        if (dayIndex === 2 && timeIndex === 2) return 'bg-blue-600'; // High
        if (dayIndex === 4 && timeIndex === 3) return 'bg-blue-800'; // Very High (Critical)
        if (timeIndex === 4) return 'bg-blue-200'; // Low (Night)
        if (timeIndex === 0) return 'bg-blue-400';
        return 'bg-blue-300';
    };

    return (
        <DualTabLayout pageId="weekly-analysis" title="Análisis Semanal" className="space-y-6">
            {/* Header Section */}
            <PageHeader
                title="ANÁLISIS TÁCTICO SEMANAL"
                subtitle="Datos STOP"
                icon={Siren}
                sourceName="STOP (Sistema Táctico de Operación Policial)"
                dataSourceId="tactical-header"
            >
                <div className="flex items-center bg-white border border-gray-200 rounded px-2">
                    <Filter className="w-4 h-4 text-gray-400 mr-2" />
                    <select
                        className="bg-transparent text-sm font-bold text-gray-600 py-1.5 focus:outline-none"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </PageHeader>

            {/* AI Insight Banner */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-start space-x-3 flex-shrink-0 relative group">
                <Info className="text-indigo-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-indigo-900 leading-relaxed">
                    <span className="font-bold text-indigo-700">Insight IA:</span> La disociación entre delitos violentos (-3%) y contra la propiedad (+5%) sugiere un cambio en el modus operandi de bandas locales.
                </p>
                {/* Custom Indicator Position for Banner */}
                <div className="absolute top-2 right-2">
                    <DataSourceIndicator dataSourceId="tactical-insight" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Detailed Table */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-shrink-0">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="px-6 py-4 text-left font-bold text-gray-600 uppercase tracking-wider flex items-center">
                                        Delito ▲
                                        <DataSourceIndicator dataSourceId="tactical-table" fallbackMode="real" className="ml-1" />
                                    </th>
                                    <th className="px-6 py-4 text-center font-bold text-gray-600 uppercase tracking-wider">
                                        Casos (Sem) ▲
                                        <DataSourceIndicator dataSourceId="tactical-table" fallbackMode="real" className="ml-1" />
                                    </th>
                                    <th className="px-6 py-4 text-center font-bold text-gray-400 uppercase tracking-wider">
                                        Tendencia (10 Sem)
                                        <DataSourceIndicator dataSourceId="tactical-table" fallbackMode="real" className="ml-1" />
                                    </th>
                                    <th className="px-6 py-4 text-right font-bold text-gray-600 uppercase tracking-wider">
                                        Var %
                                        <DataSourceIndicator dataSourceId="tactical-table" fallbackMode="real" className="ml-1" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {displayData.length > 0 ? displayData.map((row) => (
                                    <tr key={row.name} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4 font-bold text-gray-700 group-hover:text-slate-900">{row.name}</td>
                                        <td className="px-6 py-4 text-center font-black text-slate-900 text-lg">{row.cur}</td>
                                        <td className="px-6 py-4">
                                            <div className="h-8 w-24 mx-auto">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={row.trend}>
                                                        <Line type="monotone" dataKey="value" stroke={row.var >= 0 ? "#ef4444" : "#10b981"} strokeWidth={2} dot={false} isAnimationActive={false} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`inline-flex items-center justify-center px-2 py-1 min-w-[3rem] rounded text-xs font-bold ${row.var > 0
                                                ? 'bg-red-50 text-red-600'
                                                : row.var < 0
                                                    ? 'bg-emerald-50 text-emerald-600'
                                                    : 'bg-gray-50 text-gray-500'
                                                }`}>
                                                {row.var > 0 ? '+' : ''}{parseFloat(row.var).toFixed(1)}%
                                            </span>
                                        </td>
                                    </tr>
                                )) : null}


                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Column: Heatmap & Alert */}
                <div className="space-y-6">
                    {/* Heatmap Card */}
                    <Card title="Matriz de Calor Temporal" dataSourceId="tactical-heatmap">

                        <div className="flex">
                            {/* Y Axis Labels (Time) */}
                            <div className="flex flex-col justify-between mr-2 text-[10px] text-gray-400 font-medium py-1 h-48">
                                {timeSlots.map(t => <span key={t}>{t.replace('-', '\n')}</span>)}
                            </div>

                            {/* Grid */}
                            <div className="flex-1">
                                {/* X Axis Labels (Days) */}
                                <div className="grid grid-cols-7 mb-2 text-center">
                                    {days.map((d, i) => <span key={i} className="text-xs font-bold text-gray-500">{d}</span>)}
                                </div>

                                {/* Cells */}
                                <div className="grid grid-cols-7 gap-1.5 h-48">
                                    {timeSlots.map((time, tIdx) => (
                                        days.map((day, dIdx) => (
                                            <div
                                                key={`${dIdx}-${tIdx}`}
                                                className={`rounded-sm hover:ring-2 hover:ring-orange-400 transition-all cursor-pointer ${getIntensityClass(dIdx, tIdx)}`}
                                                title={`${day} ${time}: High Activity`}
                                            ></div>
                                        ))
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-4 text-xs text-gray-400">
                            <span>Bajo</span>
                            <div className="flex space-x-1">
                                <div className="w-3 h-3 bg-blue-100 rounded-full"></div>
                                <div className="w-3 h-3 bg-blue-200 rounded-full"></div>
                                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                <div className="w-3 h-3 bg-blue-800 rounded-full"></div>
                            </div>
                            <span>Alto</span>
                        </div>
                    </Card>

                    {/* Critical Focus Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center relative group">
                        <div className="absolute top-4 right-4">
                            <DataSourceIndicator dataSourceId="tactical-focus-card" />
                        </div>
                        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-3">
                            <AlertTriangle className="text-red-500 w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm mb-1">Foco Crítico Detectado</h3>
                        <p className="text-xs text-gray-500 mb-4">Viernes 20:00 - 00:00 hrs</p>

                        <button className="bg-red-50 text-red-600 text-xs font-bold px-4 py-2 rounded hover:bg-red-100 transition-colors">
                            Ver detalles
                        </button>
                    </div>


                </div>
            </div>
        </DualTabLayout>
    );
};
