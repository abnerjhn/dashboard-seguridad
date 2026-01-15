
import React, { useEffect, useState, useMemo } from 'react';
import { useDashboardContext } from '../context/DashboardContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis, Cell } from 'recharts';
import { loadHistoricalData, type HistoricalDataItem } from '../utils/dataLoader';
import { Calendar, Sun, Snowflake } from 'lucide-react';
import { PageHeader } from '../components/UI/PageHeader';
import { DualTabLayout } from '../components/Layout/DualTabLayout';

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export const Seasonality: React.FC = () => {
    const { globalState } = useDashboardContext();
    const { selectedComuna } = globalState;
    const [historicalData, setHistoricalData] = useState<HistoricalDataItem[]>([]);

    useEffect(() => {
        loadHistoricalData().then(setHistoricalData);
    }, []);

    const { monthlyProfile, heatmapData, maxHeat } = useMemo(() => {
        if (!historicalData.length) return { monthlyProfile: [], heatmapData: [], maxHeat: 0 };

        const comunaData = historicalData.filter(d => d.comuna === selectedComuna);

        // 1. Monthly Profile (Sum across all years)
        const profile = new Array(12).fill(0);

        // 2. Heatmap Data
        const heatmap: { x: number; y: number; val: number }[] = [];
        let maxVal = 0;

        // Group by Year first to normalize? Or just sum per year/month?
        // We iterate raw records
        const yearMonthMap: Record<string, number> = {};

        comunaData.forEach(d => {
            const year = d.anio;
            if (d.meses) {
                d.meses.forEach((count, monthIdx) => {
                    profile[monthIdx] += count;

                    const key = `${year}-${monthIdx}`;
                    yearMonthMap[key] = (yearMonthMap[key] || 0) + count;
                });
            }
        });

        // Format Monthly Profile
        const formattedProfile = profile.map((count, idx) => ({
            name: MONTH_NAMES[idx],
            delitos: count
        }));

        // Format Heatmap
        Object.entries(yearMonthMap).forEach(([key, val]) => {
            const [yr, mo] = key.split('-').map(Number);
            heatmap.push({ x: mo, y: yr, val }); // x=0..11, y=2017..2023
            if (val > maxVal) maxVal = val;
        });

        return { monthlyProfile: formattedProfile, heatmapData: heatmap, maxHeat: maxVal };
    }, [historicalData, selectedComuna]);

    if (!monthlyProfile.length) return <div className="p-4 text-white">Cargando datos estacionales...</div>;

    // Find Critical Month
    const criticalMonthIdx = monthlyProfile.reduce((maxIdx, curr, idx, arr) => curr.delitos > arr[maxIdx].delitos ? idx : maxIdx, 0);
    const criticalMonth = MONTH_NAMES[criticalMonthIdx];
    const isSummer = criticalMonthIdx <= 2 || criticalMonthIdx === 11;

    return (
        <DualTabLayout pageId="seasonality" title="Patrones de Estacionalidad" className="space-y-6 animate-in fade-in duration-500">
            <PageHeader
                title="PATRONES DE ESTACIONALIDAD"
                subtitle={`${selectedComuna} - Análisis Mensual Histórico`}
                icon={Calendar}
                sourceName="CEAD (Análisis Multianual)"
                dataSourceId="seasonality-header"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-white">Reloj del Delito (Mes Crítico)</h3>
                        {isSummer ? <Sun className="text-yellow-400 w-6 h-6" /> : <Snowflake className="text-blue-400 w-6 h-6" />}
                    </div>
                    <p className="text-5xl font-bold text-white">{criticalMonth}</p>
                    <p className="text-sm text-gray-400 mt-2">
                        Históricamente, este es el mes con mayor frecuencia delictual en la comuna.
                    </p>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-white mb-4">Perfil Anual Promedio</h3>
                    <div className="h-[150px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyProfile}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} interval={0} />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: '#334155', opacity: 0.4 }}
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                />
                                <Bar dataKey="delitos" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mt-8">
                <h3 className="text-lg font-medium text-white mb-2">Mapa de Calor Histórico (Año vs Mes)</h3>
                <p className="text-sm text-gray-400 mb-6">
                    Intensidad mensual de delitos desde 2017 a la fecha.
                </p>
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 0, bottom: 20, left: 0 }}>
                            <XAxis
                                type="number"
                                dataKey="x"
                                domain={[0, 11]}
                                ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]}
                                tickFormatter={(val) => MONTH_NAMES[val]}
                                stroke="#94a3b8"
                            />
                            <YAxis
                                type="number"
                                dataKey="y"
                                domain={['dataMin', 'dataMax']}
                                tickCount={8}
                                stroke="#94a3b8"
                                reversed
                            />
                            <ZAxis type="number" dataKey="val" range={[0, 500]} />
                            <Tooltip
                                cursor={{ strokeDasharray: '3 3' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const d = payload[0].payload;
                                        return (
                                            <div className="bg-slate-900 border border-slate-700 p-2 rounded text-xs text-white">
                                                <div>{MONTH_NAMES[d.x]} {d.y}</div>
                                                <div className="font-bold text-orange-400">{d.val} Delitos</div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Scatter data={heatmapData} shape="square">
                                {heatmapData.map((entry, index) => {
                                    const opacity = 0.2 + (0.8 * (entry.val / maxHeat));
                                    return <Cell key={`cell-${index}`} fill={`rgba(249, 115, 22, ${opacity})`} stroke="none" width={40} height={40} />;
                                })}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </DualTabLayout>
    );
};
