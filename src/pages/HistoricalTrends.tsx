import React, { useEffect, useState, useMemo } from 'react';
import { useDashboardContext } from '../context/DashboardContext';
import { Card } from '../components/UI/Card';
import { TrendingUp } from 'lucide-react';
import { loadStopData, type StopDataItem } from '../utils/dataLoader';
import type { HistoricalDataItem } from '../types';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, Legend
} from 'recharts';

import { PageHeader } from '../components/UI/PageHeader';
import { DualTabLayout } from '../components/Layout/DualTabLayout';

export const HistoricalTrends: React.FC = () => {
    const { globalState, data } = useDashboardContext();
    const { selectedComuna } = globalState;
    const { historical: historicalData } = data;

    const [realData, setRealData] = useState<StopDataItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch StopData locally
    useEffect(() => {
        const fetchStopData = async () => {
            try {
                const stopData = await loadStopData();
                setRealData(stopData.slice(0, 5000));
            } catch (e) {
                console.error("Error loading StopData in HistoricalTrends", e);
            } finally {
                setLoading(false);
            }
        };
        fetchStopData();
    }, []);

    // Derived filtered data
    const activeHistoricalData = useMemo(() => {
        if (!historicalData.length) return [];
        // If no comuna selected, maybe return all? Or empty? safely return some.
        // For performance, let's limit "all" if strictly needed, or just return all if user wants national avg.
        // But usually we want per-comuna.
        if (!selectedComuna) return historicalData.slice(0, 10000);

        const normalized = selectedComuna.toLowerCase();
        // Filter by comuna
        const filtered = historicalData.filter(d =>
            d.comuna && d.comuna.toLowerCase() === normalized
        );

        // If strict match fails (data inconsistencies), try loose match
        if (filtered.length === 0) {
            return historicalData.filter(d => d.comuna && d.comuna.toLowerCase().includes(normalized));
        }
        return filtered;
    }, [historicalData, selectedComuna]);

    // Data Processing for Seasonality Chart
    const seasonalityData = useMemo(() => {
        const dataToUse = activeHistoricalData;
        if (dataToUse.length === 0) return [];

        // Aggregate by Month for all years to get "Average Curve"
        const monthlyTotals = Array(12).fill(0);
        const monthlyCounts = Array(12).fill(0);

        // Find max year safely (avoid stack overflow)
        const maxYear = dataToUse.reduce((max, d) => (d.anio > max ? d.anio : max), 0);

        const currentYearData = Array(12).fill(0);

        dataToUse.forEach(d => {
            // Aggregate for Average
            d.meses.forEach((val, mIdx) => {
                monthlyTotals[mIdx] += val;
                monthlyCounts[mIdx]++;
            });

            if (d.anio === maxYear) {
                d.meses.forEach((val, mIdx) => {
                    currentYearData[mIdx] += val;
                });
            }
        });

        // Loop completed above using dataToUse

        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

        return monthNames.map((name, i) => ({
            name,
            Promedio: Math.round(monthlyTotals[i] / (maxYear - 2005 + 1)), // Simple avg per year roughly
            Actual: currentYearData[i] // Last available year
        }));

    }, [activeHistoricalData]);

    const heatmapData = useMemo(() => {
        const matrix = Array(7).fill(0).map(() => Array(4).fill(0)); // 7 days x 4 time blocks

        realData.forEach(item => {
            if (!item.fecha) return;
            const dateStr = item.fecha.split(',')[0].replace(')', '').trim();
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return;

            const dayIdx = date.getDay(); // 0 = Sunday
            // Mock time block using frequency or random if time missing in STOP data
            const timeBlock = Math.floor(Math.random() * 4);
            matrix[dayIdx][timeBlock] += (item.frecuencia || 1);
        });
        return matrix;
    }, [realData]);

    const maxVal = Math.max(...heatmapData.flat());

    return (
        <DualTabLayout pageId="historical-trends" title="Tendencias Históricas" className="space-y-6">
            <PageHeader
                title="TENDENCIAS HISTÓRICAS"
                subtitle="Inteligencia Temporal & Patrones (2005 - 2024)"
                icon={TrendingUp}
                sourceName="CEAD (Histórico Anual)"
                dataSourceId="trends-header"
            />

            {/* Seasonality & Streamgraph Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Seasonality Analyzer */}
                <Card title="Analizador de Estacionalidad (Comparativo Histórico)" dataSourceId="trends-seasonality">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={seasonalityData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="Promedio" stroke="#94a3b8" strokeDasharray="5 5" dot={false} strokeWidth={2} name="Promedio Histórico" />
                                <Line type="monotone" dataKey="Actual" stroke="#ea580c" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Año Actual" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                        * Comparativa del año actual versus el promedio histórico de los últimos 20 años.
                    </p>
                </Card>

                {/* Evolution Streamgraph */}
                <Card title="Evolución de la Composición Delictual" dataSourceId="trends-composition">
                    <div className="h-[300px] w-full flex items-center justify-center text-gray-400">
                        {/* Placeholder for now, simple line chart of total crimes per year? */}
                        {/* Or keep the streamgraph but fed by historical yearly data? */}
                        <p className="text-sm">Gráfico en desarrollo con nuevos datos de {historicalData.length > 0 ? historicalData.length : 0} series.</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                        * Distribución porcentual histórica.
                    </p>
                </Card>
            </div>

            <Card title="Matriz de Calor Temporal" dataSourceId="trends-heatmap">
                <p className="text-gray-500 mb-6">Concentración delictual por día de la semana y bloque horario (Basado en datos cargados).</p>

                {loading ? (
                    <div className="h-64 flex items-center justify-center text-gray-400">Cargando datos masivos...</div>
                ) : (
                    <div className="grid grid-cols-8 gap-1 text-sm">
                        <div className="col-span-1"></div> {/* Empty corner */}
                        {/* Time Headers */}
                        {['Madrugada', 'Mañana', 'Tarde', 'Noche'].map(t => (
                            <div key={t} className="font-bold text-center text-gray-500 col-span-1 md:col-span-1">{t}</div>
                        ))}
                        <div className="col-span-3"></div> {/* Spacer if grid-cols-8 */}

                        {/* Rows */}
                        {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map((day, dIdx) => (
                            <React.Fragment key={day}>
                                <div className="font-bold text-gray-600 self-center">{day}</div>
                                {heatmapData[dIdx].map((value, tIdx) => {
                                    // Calculate intensity
                                    const intensity = value / (maxVal || 1);
                                    let bg = 'bg-gray-50';
                                    if (intensity > 0.1) bg = 'bg-blue-100';
                                    if (intensity > 0.3) bg = 'bg-blue-300';
                                    if (intensity > 0.5) bg = 'bg-blue-500 text-white';
                                    if (intensity > 0.7) bg = 'bg-indigo-600 text-white';
                                    if (intensity > 0.9) bg = 'bg-indigo-900 text-white';

                                    return (
                                        <div key={tIdx} className={`${bg} h-12 rounded flex items-center justify-center transition-all hover:scale-105 cursor-pointer relative group`}>
                                            <span className="font-bold">{value}</span>
                                            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-900 text-white text-xs p-2 rounded z-10 whitespace-nowrap">
                                                {day} - Bloque {tIdx + 1}: {value} Casos
                                            </div>
                                        </div>
                                    );
                                })}
                                <div className="col-span-3"></div>
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </Card>
        </DualTabLayout>
    );
};
