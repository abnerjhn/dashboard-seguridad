
import React, { useEffect, useState, useMemo } from 'react';
import { useDashboardContext } from '../../context/DashboardContext';
import { loadStopData } from '../../utils/dataLoader';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';
import { BrainCircuit, CheckCircle2, XCircle } from 'lucide-react';
import { PageHeader } from '../../components/UI/PageHeader';
import { DualTabLayout } from '../../components/Layout/DualTabLayout';

export const ImpactEvaluator: React.FC = () => {
    const { globalState } = useDashboardContext();
    const [weeklyData, setWeeklyData] = useState<any[]>([]);

    // Default intervention week: Week 25 of 2024 (approx mid year)
    const interventionIdx = globalState.viewState?.['impact-evaluator']?.interventionIdx || 20;
    const setInterventionIdx = (idx: number) => globalState.setViewState('impact-evaluator', { ...globalState.viewState?.['impact-evaluator'], interventionIdx: idx });

    useEffect(() => {
        loadStopData().then(data => {
            // Aggregate all crimes by week ID
            const weeklyMap: Record<number, number> = {};
            data.forEach(d => {
                const wid = parseInt(String(d.id_semana));
                if (!isNaN(wid)) weeklyMap[wid] = (weeklyMap[wid] || 0) + d.frecuencia;
            });

            // Sort and convert to array
            const sorted = Object.entries(weeklyMap)
                .map(([w, val]) => ({ week: parseInt(w), value: val }))
                .sort((a, b) => a.week - b.week);

            // Limit to a reasonable range for demo (e.g. 0 to 50)
            // Assuming data has week IDs like 1..52
            setWeeklyData(sorted);
        });
    }, []);

    const impactStats = useMemo(() => {
        if (!weeklyData.length) return null;

        const beforeData = weeklyData.slice(0, interventionIdx);
        const afterData = weeklyData.slice(interventionIdx);

        if (!beforeData.length || !afterData.length) return null;

        const avgBefore = beforeData.reduce((a, b) => a + b.value, 0) / beforeData.length;
        const avgAfter = afterData.reduce((a, b) => a + b.value, 0) / afterData.length;

        const diff = avgAfter - avgBefore;
        const pct = (diff / avgBefore) * 100;

        return { avgBefore, avgAfter, diff, pct };
    }, [weeklyData, interventionIdx]);

    if (!impactStats) return <div className="text-white p-8">Cargando analizador...</div>;

    const isPositiveResult = impactStats.pct < 0; // Negative variation is good for crime

    return (
        <DualTabLayout pageId="impact-evaluator" title="Evaluador de Impacto" className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <PageHeader
                title="EVALUADOR DE IMPACTO"
                subtitle="Análisis Ex-Post (Intervención Temporal)"
                icon={BrainCircuit}
                sourceName="STOP (Auditoría Ex-Post)"
                dataSourceId="impact-evaluator-header"
            />

            {/* Controls & KPI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        Punto de Intervención (Semana {weeklyData[interventionIdx]?.week || 0})
                    </label>
                    <input
                        type="range"
                        min="5"
                        max={weeklyData.length - 5}
                        value={interventionIdx}
                        onChange={(e) => setInterventionIdx(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        Desliza para marcar cuándo se implementó la medida (ej. Nueva Patrulla, Cámaras).
                    </p>
                </div>

                <div className={`border rounded-lg p-6 flex flex-col justify-center items-center ${isPositiveResult ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
                    <div className="flex items-center space-x-2 mb-1">
                        <span className="text-gray-300 font-bold uppercase text-xs">Impacto Medido</span>
                        {isPositiveResult ? <CheckCircle2 className="text-emerald-400 w-4 h-4" /> : <XCircle className="text-red-400 w-4 h-4" />}
                    </div>
                    <p className={`text-4xl font-black ${isPositiveResult ? 'text-emerald-400' : 'text-red-400'}`}>
                        {impactStats.pct > 0 ? '+' : ''}{impactStats.pct.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-400 mt-1 center text-center">
                        Cambio en promedio semanal de delitos post-intervención.
                    </p>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mt-8">
                <h3 className="text-lg font-medium text-white mb-10">Curva de Delitos: Antes vs Después</h3>
                <div className="h-[450px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={weeklyData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                            <XAxis dataKey="week" stroke="#94a3b8" label={{ value: 'Semana', position: 'insideBottom', offset: -10 }} />
                            <YAxis stroke="#94a3b8" padding={{ top: 50 }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                            />

                            {/* Visual Separation */}
                            <ReferenceArea x1={weeklyData[0]?.week} x2={weeklyData[interventionIdx]?.week} fill="green" fillOpacity={0.05} />
                            <ReferenceArea x1={weeklyData[interventionIdx]?.week} x2={weeklyData[weeklyData.length - 1]?.week} fill="purple" fillOpacity={0.05} />

                            <ReferenceLine x={weeklyData[interventionIdx]?.week} stroke="#a855f7" strokeDasharray="3 3" label={{ value: "INTERVENCIÓN", fill: "#a855f7", fontSize: 10, position: 'insideTopLeft' }} />

                            {/* Averages */}
                            {impactStats && (
                                <>
                                    <ReferenceLine y={impactStats.avgBefore} stroke="#10b981" strokeDasharray="5 5" label={{ value: `Avg Pre: ${impactStats.avgBefore.toFixed(0)}`, fill: "#10b981", fontSize: 10 }} />
                                    <ReferenceLine y={impactStats.avgAfter} stroke="#a855f7" strokeDasharray="5 5" label={{ value: `Avg Post: ${impactStats.avgAfter.toFixed(0)}`, fill: "#a855f7", fontSize: 10 }} />
                                </>
                            )}

                            <Line type="monotone" dataKey="value" stroke="#fff" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </DualTabLayout>
    );
};
