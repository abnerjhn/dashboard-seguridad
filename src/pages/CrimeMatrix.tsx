import React, { useEffect, useState, useMemo } from 'react';

import { Card } from '../components/UI/Card';
import { AlertTriangle, Crosshair } from 'lucide-react';
import { loadStopData, type StopDataItem } from '../utils/dataLoader';
import { PageHeader } from '../components/UI/PageHeader';
import { DualTabLayout } from '../components/Layout/DualTabLayout';
import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, ReferenceLine, LabelList
} from 'recharts';

export const CrimeMatrix: React.FC = () => {
    // useDashboardContext();

    const [realData, setRealData] = useState<StopDataItem[]>([]);


    useEffect(() => {
        const fetchData = async () => {
            const data = await loadStopData();
            // In a real scenario, filter by selectedComuna here
            setRealData(data);
        };
        fetchData();
    }, []);

    // Process Data for BCG Matrix (Volume vs Growth)
    const bcgData = useMemo(() => {
        if (realData.length === 0) return [];

        // 1. Find Max Date
        let maxDate = new Date('2000-01-01');
        realData.forEach(d => {
            if (!d.fecha) return;
            const date = new Date(d.fecha);
            if (!isNaN(date.getTime()) && date > maxDate) maxDate = date;
        });

        console.log("CrimeMatrix Max Date:", maxDate);

        // 2. Define Periods (Last 4 weeks vs Previous 4 weeks)
        const periodLength = 28 * 24 * 60 * 60 * 1000;
        const currentPeriodStart = new Date(maxDate.getTime() - periodLength);
        const previousPeriodStart = new Date(currentPeriodStart.getTime() - periodLength);

        const currentCounts: Record<string, number> = {};
        const previousCounts: Record<string, number> = {};

        realData.forEach(d => {
            if (!d.fecha) return;
            const date = new Date(d.fecha);
            if (isNaN(date.getTime())) return;

            const crime = d.delito;

            if (date >= currentPeriodStart && date <= maxDate) {
                currentCounts[crime] = (currentCounts[crime] || 0) + (d.frecuencia || 1);
            } else if (date >= previousPeriodStart && date < currentPeriodStart) {
                previousCounts[crime] = (previousCounts[crime] || 0) + (d.frecuencia || 1);
            }
        });

        // 3. Calculate Growth & Volume
        const result = Object.keys(currentCounts).map(crime => {
            const curr = currentCounts[crime] || 0;
            const prev = previousCounts[crime] || 0;

            // Avoid division by zero, simplistic growth calc
            let growth = 0;
            if (prev > 0) growth = ((curr - prev) / prev) * 100;
            else if (curr > 0) growth = 100; // New emergence

            // Classification
            let type = 'Normal';
            if (growth > 20 && curr > 10) type = 'Crítico (Alto Crecimiento)';
            else if (growth > 20) type = 'Emergente (Alerta)';
            else if (curr > 50) type = 'Estructural (Alto Volumen)';

            return {
                name: crime,
                x: growth, // Growth %
                y: curr,   // Volume
                prev: prev,
                type
            };
        });

        return result.filter(d => d.y > 0); // Only show active crimes
    }, [realData]);

    // Process Data for Pareto (Top 80% volume)
    const paretoData = useMemo(() => {
        const sorted = [...bcgData].sort((a, b) => b.y - a.y);
        const totalCases = sorted.reduce((acc, curr) => acc + curr.y, 0);

        let accumulated = 0;
        return sorted.map(item => {
            accumulated += item.y;
            return {
                ...item,
                accumulatedPct: (accumulated / totalCases) * 100
            };
        }).slice(0, 10); // Top 10 for display
    }, [bcgData]);

    // Custom Tooltip for Scatter
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
                    <p className="font-bold text-slate-800">{data.name}</p>
                    <p className="text-sm text-gray-600">Volumen: <span className="font-bold">{data.y}</span> casos</p>
                    <p className="text-sm text-gray-600">Crecimiento: <span className={`font-bold ${data.x > 0 ? 'text-red-500' : 'text-green-500'}`}>{data.x.toFixed(1)}%</span></p>
                    <p className="text-xs text-gray-400 mt-1 uppercase font-bold">{data.type}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <DualTabLayout pageId="crime-matrix" title="Matriz de Focos" className="space-y-6">
            {/* Header Section */}
            <PageHeader
                title="MATRIZ DE FOCOS"
                subtitle="Priorización & Análisis de Pareto"
                icon={Crosshair}
                sourceName="STOP & Modelo Interno"
                dataSourceId="matrix-header"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* BCG Matrix */}
                <Card title="Matriz de Crecimiento vs Volumen (Cuadrantes)" dataSourceId="matrix-growth">
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" dataKey="x" name="Crecimiento" unit="%" label={{ value: 'Crecimiento (%)', position: 'bottom', offset: 0 }} />
                                <YAxis type="number" dataKey="y" name="Volumen" label={{ value: 'Volumen (Casos)', angle: -90, position: 'insideLeft' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <ReferenceLine x={0} stroke="#cbd5e1" />
                                <ReferenceLine y={20} label={{ position: 'insideTopLeft', value: 'Alto Volumen', fill: '#ef4444', fontSize: 10, dy: -5 }} stroke="#ef4444" strokeDasharray="3 3" />
                                <ReferenceLine x={20} label={{ position: 'insideTopRight', value: 'Alto Crecimiento', fill: '#ef4444', fontSize: 10, dx: 5, angle: -90 }} stroke="#ef4444" strokeDasharray="3 3" />
                                <Scatter name="Delitos" data={bcgData} fill="#4f46e5" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex space-x-4 text-xs text-gray-500 justify-center">
                        <div className="flex items-center"><div className="w-3 h-3 bg-red-100 border border-red-300 mr-1"></div> Críticos (Volumen Alto + Crecimiento)</div>
                        <div className="flex items-center"><div className="w-3 h-3 bg-blue-100 border border-blue-300 mr-1"></div> Emergentes (Crecimiento Rápido)</div>
                    </div>
                </Card>

                {/* Pareto Chart */}
                <Card title="Top 10 Delitos (Volumen)" dataSourceId="matrix-pareto">
                    <div className="h-[400px] w-full overflow-x-auto">
                        <div className="min-w-[600px] h-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={paretoData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={180} tick={{ fontSize: 10 }} />
                                    <Tooltip />
                                    <Bar dataKey="y" fill="#ea580c" radius={[0, 4, 4, 0]}>
                                        <LabelList dataKey="y" position="right" style={{ fontSize: 10, fill: '#666' }} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="mt-4 bg-orange-50 p-3 rounded text-sm text-orange-800 border border-orange-100 flex items-start">
                        <AlertTriangle className="w-4 h-4 mr-2 mt-0.5" />
                        <p><strong>Hallazgo Pareto:</strong> El top 3 de los delitos representa el <strong>{paretoData.length > 0 ? paretoData[2]?.accumulatedPct.toFixed(0) : 0}%</strong> del volumen total. Focalizar recursos aquí maximiza el impacto.</p>
                    </div>
                </Card>
            </div>
        </DualTabLayout>
    );
};
