
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { loadStopData } from '../../utils/dataLoader';
import { TrendingUp } from 'lucide-react';
import { DualTabLayout } from '../../components/Layout/DualTabLayout';
import { PageHeader } from '../../components/UI/PageHeader';

import { useDashboardContext } from '../../context/DashboardContext';

export const TacticalTrend: React.FC = () => {
    const { globalState } = useDashboardContext();
    const [trendData, setTrendData] = useState<any[]>([]);

    useEffect(() => {
        loadStopData().then(data => {
            const weeklyMap: Record<number, number> = {};
            const targetWeek = globalState.selectedWeek || globalState.maxWeek;

            data.forEach(d => {
                const wid = parseInt(String(d.id_semana));
                if (!isNaN(wid) && wid <= targetWeek) {
                    weeklyMap[wid] = (weeklyMap[wid] || 0) + d.frecuencia;
                }
            });

            const sorted = Object.entries(weeklyMap)
                .map(([w, val]) => ({ week: parseInt(w), delitos: val }))
                .sort((a, b) => a.week - b.week);

            // Limit to last 52 weeks if too many? Or just show all available
            setTrendData(sorted);
        });
    }, [globalState.selectedWeek, globalState.maxWeek]);

    return (
        <DualTabLayout pageId="tactical-trend" title="Tendencia Táctica" className="space-y-6 animate-in fade-in duration-500">
            <PageHeader
                title="EVOLUCIÓN MULTISEMANAL"
                subtitle="Tendencia General STOP"
                icon={TrendingUp}
                sourceName="STOP (Comparativa Anual)"
                dataSourceId="tactical-trend-header"
            />

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">Tendencia General STOP</h3>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                            <XAxis dataKey="week" stroke="#94a3b8" label={{ value: 'Semana', position: 'insideBottom', offset: -10 }} />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                            />
                            <Area type="monotone" dataKey="delitos" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </DualTabLayout>
    );
};
