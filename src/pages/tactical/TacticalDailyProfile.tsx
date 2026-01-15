
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { loadStopData } from '../../utils/dataLoader';
import { CalendarClock } from 'lucide-react';

import { DualTabLayout } from '../../components/Layout/DualTabLayout';
import { PageHeader } from '../../components/UI/PageHeader';

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

import { useDashboardContext } from '../../context/DashboardContext';

export const TacticalDailyProfile: React.FC = () => {
    const { globalState } = useDashboardContext();
    const [profile, setProfile] = useState<any[]>([]);

    useEffect(() => {
        loadStopData().then(data => {
            const counts = new Array(7).fill(0);
            const targetWeek = globalState.selectedWeek || globalState.maxWeek;

            data.forEach(d => {
                const wid = parseInt(String(d.id_semana || 0));
                if (wid > targetWeek) return;

                // Parse date 2024-11-18
                // Note: Check timezone issues? Assuming local string parsing is robust enough for "Week Day" stats
                const parts = d.fecha.split('-');
                if (parts.length === 3) {
                    const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                    const day = date.getDay(); // 0 = Sun, 6 = Sat
                    counts[day] += d.frecuencia;
                }
            });

            const formatted = counts.map((val, i) => ({
                day: DAYS[i],
                delitos: val
            }));

            // Reorder to start on Monday (optional, but typical in Chile)
            // 0=Sun is last
            const mondayFirst = [...formatted.slice(1), formatted[0]];
            setProfile(mondayFirst);
        });
    }, [globalState.selectedWeek, globalState.maxWeek]);

    return (
        <DualTabLayout pageId="tactical-daily" title="Perfil Diario" className="space-y-6 animate-in fade-in duration-500">
            <PageHeader
                title="PERFIL DIARIO DE DELITOS"
                subtitle="Concentración Semanal Histórica"
                icon={CalendarClock}
                sourceName="STOP"
                dataSourceId="daily-profile-header"
            />

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">Concentración Semanal</h3>
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={profile}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                            <XAxis dataKey="day" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                cursor={{ fill: '#334155', opacity: 0.2 }}
                            />
                            <Bar dataKey="delitos" fill="#f97316" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <p className="mt-4 text-sm text-gray-400">
                    *Acumulado histórico según registros STOP disponibles.
                </p>
            </div>
        </DualTabLayout>
    );
};
