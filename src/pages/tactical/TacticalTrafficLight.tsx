
import React, { useEffect, useState } from 'react';
import { useDashboardContext } from '../../context/DashboardContext';
import { Siren, Filter, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { loadStopData, type StopDataItem } from '../../utils/dataLoader';
import { PageHeader } from '../../components/UI/PageHeader';
import { DualTabLayout } from '../../components/Layout/DualTabLayout';

export const TacticalTrafficLight: React.FC = () => {
    const { globalState } = useDashboardContext();
    const [trends, setTrends] = useState<any[]>([]);
    const [filter, setFilter] = useState('Todos');

    useEffect(() => {
        loadStopData().then(data => {
            const targetWeek = globalState.selectedWeek || globalState.maxWeek;

            // Group by Crime
            const groups: Record<string, StopDataItem[]> = {};
            data.forEach(d => {
                const wid = parseInt(String(d.id_semana || 0));
                // Filter by week cap
                if (wid > targetWeek) return;

                if (!groups[d.delito]) groups[d.delito] = [];
                groups[d.delito].push(d);
            });

            const results = Object.keys(groups).map(delito => {
                const sorted = groups[delito].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

                const weeklyMap: Record<number, number> = {};
                sorted.forEach(d => {
                    const wid = parseInt(String(d.id_semana || 0)); // simple parser
                    weeklyMap[wid] = (weeklyMap[wid] || 0) + d.frecuencia;
                });

                const trendArr = Object.entries(weeklyMap)
                    .map(([w, val]) => ({ week: parseInt(w), value: val }))
                    .sort((a, b) => a.week - b.week)
                    .slice(-10); // Last 10 weeks ending at selected week

                const current = trendArr[trendArr.length - 1]?.value || 0;
                const prev = trendArr[trendArr.length - 2]?.value || 0;
                const variation = prev === 0 ? (current > 0 ? 100 : 0) : ((current - prev) / prev) * 100;

                return {
                    name: delito,
                    current,
                    prev,
                    variation,
                    trend: trendArr
                };
            }).sort((a, b) => b.current - a.current);

            setTrends(results);
        });
    }, [globalState.selectedWeek, globalState.maxWeek]);

    return (
        <DualTabLayout pageId="tactical-traffic" title="Semáforo Delictual" className="space-y-6 animate-in fade-in duration-500">
            <PageHeader
                title="SEMÁFORO DELICTUAL (STOP)"
                subtitle="Últimas 10 Semanas - Análisis de Variación"
                icon={Siren}
                sourceName="STOP (Series Históricas)"
                dataSourceId="traffic-light-header"
            />

            <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="bg-slate-900 text-gray-200 uppercase font-medium">
                        <tr>
                            <th className="px-6 py-4">Delito</th>
                            <th className="px-6 py-4 text-center">Casos (Esta Sem)</th>
                            <th className="px-6 py-4 text-center">Tendencia</th>
                            <th className="px-6 py-4 text-right">Variación</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {trends.map((row) => (
                            <tr key={row.name} className="hover:bg-slate-700/50">
                                <td className="px-6 py-4 font-medium text-white">{row.name}</td>
                                <td className="px-6 py-4 text-center text-xl font-bold text-white">{row.current}</td>
                                <td className="px-6 py-4">
                                    <div className="h-8 w-32 mx-auto">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={row.trend}>
                                                <Line
                                                    type="monotone"
                                                    dataKey="value"
                                                    stroke={row.variation > 0 ? "#ef4444" : "#10b981"}
                                                    strokeWidth={2}
                                                    dot={false}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${row.variation > 0 ? 'bg-red-500/20 text-red-400' :
                                        row.variation < 0 ? 'bg-green-500/20 text-green-400' :
                                            'bg-gray-500/20 text-gray-400'
                                        }`}>
                                        {row.variation > 0 ? <ArrowUp className="w-3 h-3 mr-1" /> :
                                            row.variation < 0 ? <ArrowDown className="w-3 h-3 mr-1" /> :
                                                <Minus className="w-3 h-3 mr-1" />}
                                        {Math.abs(row.variation).toFixed(1)}%
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </DualTabLayout>
    );
};
