
import React, { useEffect, useState, useMemo } from 'react';
import { useDashboardContext } from '../context/DashboardContext';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { loadHistoricalData, loadDemographics, type HistoricalDataItem, type DemographicsMap } from '../utils/dataLoader';
import { calculateLinearRegression } from '../utils/statistics';
import { BrainCircuit, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { PageHeader } from '../components/UI/PageHeader';
import { DualTabLayout } from '../components/Layout/DualTabLayout';

export const Forecasting: React.FC = () => {
    const { globalState, data } = useDashboardContext();
    const { selectedComuna } = globalState;
    const { historical: historicalData, demographics } = data;
    // const [historicalData, setHistoricalData] = useState<HistoricalDataItem[]>([]); // Removed
    // const [demographics, setDemographics] = useState<DemographicsMap>({}); // Removed

    // useEffect removed - data comes from context

    // 1. Process Data for Regression
    const analysisData = useMemo(() => {
        if (!historicalData.length) return null;

        // Filter by Comuna
        const comunaData = historicalData.filter(d => d.comuna === selectedComuna);

        // Aggregate by Year
        const yearly = comunaData.reduce((acc, curr) => {
            const yr = curr.anio;
            const count = curr.meses.reduce((a, b) => a + b, 0);
            acc[yr] = (acc[yr] || 0) + count;
            return acc;
        }, {} as Record<number, number>);

        const points = Object.entries(yearly)
            .map(([yr, count]) => ({ x: parseInt(yr), y: count }))
            .sort((a, b) => a.x - b.x);

        const { slope, r2, predict } = calculateLinearRegression(points);

        // Generate Chart Data (History + Projection)
        const lastYear = points[points.length - 1]?.x || 2023;
        const projectedYears = [lastYear + 1, lastYear + 2]; // 2025, 2026

        const chartData = [
            ...points.map(p => ({
                year: p.x,
                actual: p.y,
                trend: predict(p.x),
                isProjection: false
            })),
            ...projectedYears.map(yr => ({
                year: yr,
                actual: null,
                trend: predict(yr),
                isProjection: true
            }))
        ];

        return { chartData, slope, r2, nextYearVal: predict(lastYear + 1) };
    }, [historicalData, selectedComuna]);

    if (!analysisData) return <div className="p-4 text-white">Cargando datos...</div>;

    const { chartData, slope, r2, nextYearVal } = analysisData;
    const trendDirection = slope > 50 ? 'Alza Acelerada' : slope > 0 ? 'Leve Alza' : slope < -50 ? 'Baja Acelerada' : 'Estable';
    const trendColor = slope > 0 ? 'text-red-400' : 'text-green-400';
    const TrendIcon = slope > 0 ? TrendingUp : TrendingDown;

    return (
        <DualTabLayout pageId="forecasting" title="Proyección" className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <PageHeader
                title="MODELO PREDICTIVO"
                subtitle={`Proyección basada en regresión lineal histórica (${selectedComuna})`}
                icon={BrainCircuit}
                sourceName="STOP (Modelado Predictivo)"
                dataSourceId="forecasting-header"
            />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400">Tendencia General</p>
                        <TrendIcon className={`w-5 h-5 ${trendColor}`} />
                    </div>
                    <p className={`text-2xl font-semibold mt-2 ${trendColor}`}>{trendDirection}</p>
                    <p className="text-xs text-gray-500 mt-1">Pendiente: {slope.toFixed(1)} delitos/año</p>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <p className="text-sm text-gray-400">Proyección 2025 (Estimada)</p>
                    <p className="text-3xl font-semibold text-white mt-2">{Math.round(nextYearVal).toLocaleString()}</p>
                    <p className="text-xs text-blue-400 mt-1">Delitos Totales</p>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400">Confiabilidad del Modelo</p>
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                    </div>
                    <p className="text-3xl font-semibold text-white mt-2">{(r2 * 100).toFixed(1)}%</p>
                    <p className="text-xs text-gray-500 mt-1">R² Score (Ajuste Histórico)</p>
                </div>
            </div>

            {/* Main Chart */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mt-8">
                <h3 className="text-lg font-medium text-white mb-4">Proyección de Criminalidad (2017-2026)</h3>
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis
                                dataKey="year"
                                stroke="#94a3b8"
                                tick={{ fill: '#94a3b8' }}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                tick={{ fill: '#94a3b8' }}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                labelStyle={{ color: '#94a3b8' }}
                            />
                            <Legend />

                            {/* Historical Area */}
                            <Area
                                type="monotone"
                                dataKey="actual"
                                name="Datos Históricos"
                                stroke="#3b82f6"
                                fill="url(#colorActual)"
                                fillOpacity={0.3}
                                strokeWidth={3}
                            />

                            {/* Trend Line (Dashed) */}
                            <Line
                                type="monotone"
                                dataKey="trend"
                                name="Tendencia / Proyección"
                                stroke="#f472b6"
                                strokeDasharray="5 5"
                                strokeWidth={2}
                                dot={false}
                            />

                            <defs>
                                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700 text-sm text-gray-400">
                    <p>
                        <span className="text-blue-400 font-bold">Nota:</span> La línea punteada rosa representa el modelo matemático ajustado.
                        Los puntos más allá de 2024 son proyecciones basadas en la inercia histórica.
                        Factores externos no modelados (nuevas políticas, cambios socioeconómicos) pueden alterar este resultado.
                    </p>
                </div>
            </div>
        </DualTabLayout>
    );
};
