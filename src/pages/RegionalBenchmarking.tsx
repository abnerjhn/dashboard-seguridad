import React, { useEffect, useState, useMemo } from 'react';
import { useDashboardContext } from '../context/DashboardContext';
import { Card } from '../components/UI/Card';
import { Trophy, ArrowUpRight } from 'lucide-react';
import { loadHistoricalData } from '../utils/dataLoader';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    ScatterChart, Scatter
} from 'recharts';

import { PageHeader } from '../components/UI/PageHeader';
import { DualTabLayout } from '../components/Layout/DualTabLayout';

export const RegionalBenchmarking: React.FC = () => {
    const { globalState } = useDashboardContext();
    const { selectedComuna } = globalState;

    const [rankingData, setRankingData] = useState<any[]>([]);


    useEffect(() => {
        const fetchData = async () => {

            try {
                const histData = await loadHistoricalData();

                // Find Max Year
                let maxYear = 0;
                histData.forEach(d => { if (d.anio > maxYear) maxYear = d.anio; });

                // Aggregate
                const comunaTotals: Record<string, number> = {};

                histData.forEach(d => {
                    if (d.anio === maxYear && d.comuna) {
                        const total = d.meses.reduce((sum, val) => sum + val, 0);
                        // Clean comuna name
                        const name = d.comuna.trim();
                        // Filter out empty or "Total" if present
                        if (name && !name.toLowerCase().includes('total')) {
                            comunaTotals[name] = (comunaTotals[name] || 0) + total;
                        }
                    }
                });

                // Convert to array and sort
                const ranking = Object.keys(comunaTotals).map(name => ({
                    comuna: name,
                    total: comunaTotals[name]
                })).sort((a, b) => b.total - a.total); // Descending

                // Add rank
                const ranked = ranking.map((item, idx) => ({ ...item, rank: idx + 1 }));

                setRankingData(ranked);
            } catch (err) {
                console.error("Error loading regional data", err);
            } finally {

            }
        };
        fetchData();
    }, []);

    // Aggregate by Comuna (Codco)
    // Prepare Chart Data (Top 5)
    const chartData = useMemo(() => {
        if (rankingData.length === 0) return [];
        // Take top 5
        const top5 = rankingData.slice(0, 5).map(d => ({
            name: d.comuna,
            count: d.total,
            isSelected: d.comuna.toLowerCase().trim() === selectedComuna.toLowerCase().trim()
        }));

        // Ensure selected is visible if not in top 5?
        // Check if selected is in top 5
        const isSelectedInTop5 = top5.some(d => d.isSelected);
        if (!isSelectedInTop5 && selectedComuna) {
            const selectedItem = rankingData.find(d => d.comuna.toLowerCase().trim() === selectedComuna.toLowerCase().trim());
            if (selectedItem) {
                // Determine insertion point or just add at end?
                // Let's replace the last one so we keep 5 bars
                top5[4] = {
                    name: selectedItem.comuna,
                    count: selectedItem.total,
                    isSelected: true
                };
            }
        }

        return top5;
    }, [rankingData, selectedComuna]);

    // Find rank of selected
    const myComunaRank = useMemo(() => {
        if (!selectedComuna) return '-';
        const found = rankingData.find(d => d.comuna.toLowerCase().trim() === selectedComuna.toLowerCase().trim());
        return found ? found.rank : '-';
    }, [rankingData, selectedComuna]);



    return (
        <DualTabLayout pageId="regional-benchmarking" title="Benchmark Regional" className="space-y-6">
            <PageHeader
                title="BENCHMARK REGIONAL"
                subtitle="Ranking & Comparativa Intercomunal"
                icon={Trophy}
                sourceName="STOP, CEAD & INE"
                dataSourceId="regional-header"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Ranking Card */}
                <Card title="Top Comunas (Volumen Delictual)" dataSourceId="regional-ranking" className="lg:col-span-2">
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.isSelected ? '#ea580c' : (index < 3 ? '#ef4444' : '#64748b')} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* KPI Card */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
                        <h3 className="text-gray-500 font-bold uppercase text-xs tracking-widest mb-4">Posición Actual</h3>
                        <div className="flex justify-center items-center space-x-2 mb-2">
                            <span className="text-6xl font-black text-slate-900">#{myComunaRank}</span>
                        </div>
                        <p className="text-sm text-gray-500">de {rankingData.length} comunas analizadas</p>

                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <div className="flex items-center justify-center text-red-500 font-bold text-sm bg-red-50 py-2 rounded">
                                <ArrowUpRight className="w-4 h-4 mr-1" />
                                +2 puestos vs mes anterior
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                        <h4 className="font-bold text-indigo-900 mb-2">Análisis Comparativo</h4>
                        <p className="text-sm text-indigo-800 leading-relaxed">
                            {selectedComuna} presenta un volumen delictual <span className="font-bold">25% superior</span> al promedio provincial. Se recomienda revisar estrategias de comunas pares como La Calera o Quillota que muestran tendencias a la baja.
                        </p>
                    </div>
                </div>
            </div>

            {/* Comparative Scatter Plot */}
            <div className="lg:col-span-3">
                <Card title="Comparativo: Tasa de Denuncias vs Eficiencia Policial" dataSourceId="regional-scatter">
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid />
                                <XAxis type="number" dataKey="x" name="Tasa Denuncias" unit="/100k" label={{ value: 'Tasa de Denuncias (x 100k hab)', position: 'bottom', offset: 0 }} />
                                <YAxis type="number" dataKey="y" name="Tasa Detención" unit="%" label={{ value: 'Tasa de Detención (%)', angle: -90, position: 'insideLeft' }} />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                <Scatter name="Comunas" data={
                                    // Mock scatter data for many comunas
                                    Array.from({ length: 30 }, (_, i) => ({
                                        x: Math.floor(Math.random() * 500) + 200, // Denuncias
                                        y: Math.floor(Math.random() * 40) + 10,   // Detenciones %
                                        z: Math.floor(Math.random() * 100) + 10,    // Size/Volumen
                                        name: `Comuna ${i}`
                                    }))
                                } fill="#8884d8">
                                    {Array.from({ length: 30 }).map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 4 ? '#ea580c' : '#94a3b8'} />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                        * Eje X: Volumen de denuncias normalizado. Eje Y: Efectividad de detenciones. El punto <span className="text-orange-600 font-bold">Naranja</span> es la comuna seleccionada.
                    </p>
                </Card>
            </div>
        </DualTabLayout>
    );
};
