import React, { useEffect, useState } from 'react';
import { useDashboardContext } from '../../context/DashboardContext';
import { usePrintPreferences } from '../../context/PrintPreferencesContext';
import { FileText, TrendingDown, Users, AlertCircle, MapPin } from 'lucide-react';
import { PageHeader } from '../../components/UI/PageHeader';
import { DualTabLayout } from '../../components/Layout/DualTabLayout';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Bar } from 'recharts';

export const CommunalFactSheet: React.FC = () => {
    const { globalState, data } = useDashboardContext();
    const { selectedComuna } = globalState;
    const { historical, demographics } = data;
    const [stats, setStats] = useState<any>(null);
    const { isPrinting } = usePrintPreferences();

    useEffect(() => {
        if (!historical.length || !demographics || !selectedComuna) return;

        // Filter
        const comunaData = historical.filter(d => d.comuna === selectedComuna);
        const comunaDemo = Object.values(demographics).find(d => d.name === selectedComuna);

        if (!comunaData.length) return;

        // 1. Total Crimes Last Year
        const lastYear = 2023; // Fixed for demo, or calculate max
        const currentData = comunaData.filter(d => d.anio === lastYear);
        const prevData = comunaData.filter(d => d.anio === lastYear - 1);

        const totalCurrent = currentData.reduce((acc, d) => acc + d.meses.reduce((a, b) => a + b, 0), 0);
        const totalPrev = prevData.reduce((acc, d) => acc + d.meses.reduce((a, b) => a + b, 0), 0);
        const variation = totalPrev === 0 ? 0 : ((totalCurrent - totalPrev) / totalPrev) * 100;

        // 2. Top 3 Crimes
        const topCrimes = currentData.map(d => ({
            name: d.delito,
            count: d.meses.reduce((a, b) => a + b, 0)
        })).sort((a, b) => b.count - a.count).slice(0, 3);

        // 3. Mini Trend (Last 5 Years)
        const yearlyTrend = [2019, 2020, 2021, 2022, 2023].map(yr => {
            const sum = comunaData.filter(d => d.anio === yr)
                .reduce((acc, d) => acc + d.meses.reduce((a, b) => a + b, 0), 0);
            return { year: yr, total: sum };
        });

        setStats({
            totalCurrent,
            variation,
            topCrimes,
            yearlyTrend,
            population: comunaDemo?.population || 0,
            demographic: comunaDemo
        });
    }, [selectedComuna, historical, demographics]);

    if (!stats) return <div className="text-white p-8">Cargando datos ficha...</div>;



    return (
        <DualTabLayout pageId="communal-fact-sheet" title="Ficha Comunal" className="w-full">
            <div className={`${isPrinting ? 'w-full shadow-none border-none' : 'w-full max-w-[210mm] shadow-2xl mx-auto'} bg-white min-h-[297mm] p-12 text-slate-800 flex flex-col`}>

                {/* Header */}
                <PageHeader
                    title="FICHA COMUNAL"
                    subtitle={selectedComuna}
                    icon={FileText}
                    sourceName="INE & STOP"
                    dataSourceId="factsheet-header"
                    className="mb-8"
                />

                {/* Key Metrics Row */}
                <div className="grid grid-cols-3 gap-6 mb-10">
                    <div className="bg-slate-50 p-6 border-l-4 border-blue-600">
                        <p className="text-xs font-bold text-slate-400 uppercase">Delitos Totales (2023)</p>
                        <p className="text-4xl font-black text-slate-900 mt-2">{stats.totalCurrent.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50 p-6 border-l-4 border-indigo-600">
                        <p className="text-xs font-bold text-slate-400 uppercase">Variación Anual</p>
                        <div className="flex items-center mt-2">
                            <p className={`text-4xl font-black ${stats.variation > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {stats.variation > 0 ? '+' : ''}{stats.variation.toFixed(1)}%
                            </p>
                            {stats.variation < 0 && <TrendingDown className="ml-3 text-green-600 w-8 h-8" />}
                        </div>
                    </div>
                    <div className="bg-slate-50 p-6 border-l-4 border-slate-600">
                        <p className="text-xs font-bold text-slate-400 uppercase">Población Estimada</p>
                        <div className="flex items-center mt-2">
                            <Users className="w-6 h-6 text-slate-400 mr-2" />
                            <p className="text-3xl font-bold text-slate-700">{stats.population.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-2 gap-10 flex-1">

                    {/* Left Col: Context & Rankings */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 border-b-2 border-slate-100 pb-2 mb-4 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
                                Principales Delitos
                            </h3>
                            <div className="space-y-4">
                                {stats.topCrimes.map((c: any, i: number) => (
                                    <div key={i} className="relative">
                                        <div className="flex justify-between text-sm font-bold text-slate-700 mb-1">
                                            <span>{i + 1}. {c.name}</span>
                                            <span>{c.count}</span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                            <div
                                                className="bg-slate-800 h-full"
                                                style={{ width: `${(c.count / stats.topCrimes[0].count) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-slate-900 border-b-2 border-slate-100 pb-2 mb-4">
                                Perfil Demográfico
                            </h3>
                            <div className="bg-white border border-slate-200 rounded-lg p-4 text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Jóvenes (15-29)</span>
                                    <span className="font-bold">{stats.demographic?.pop_youth?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Adultos (30-64)</span>
                                    <span className="font-bold">{stats.demographic?.pop_adult?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between border-t border-slate-100 pt-2 mt-2">
                                    <span className="text-slate-500">Tasa de Delitos (x 100k)</span>
                                    <span className="font-bold text-red-600">
                                        {Math.round((stats.totalCurrent / stats.population) * 100000).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Col: Trends & Map Placeholder */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 border-b-2 border-slate-100 pb-2 mb-4">
                                Evolución 5 Años
                            </h3>
                            <div className="h-48 border border-slate-100 rounded-lg p-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={stats.yearlyTrend}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                                        <YAxis hide />
                                        <Bar dataKey="total" fill="#cbd5e1" barSize={30} />
                                        <Line type="monotone" dataKey="total" stroke="#0f172a" strokeWidth={3} dot={{ r: 4 }} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-slate-900 border-b-2 border-slate-100 pb-2 mb-4 flex items-center">
                                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                                Zona Focal
                            </h3>
                            <div className="h-64 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                                <span className="text-slate-400 font-medium text-sm">Vista de Mapa Estático</span>
                                {/* Ideally we render a static leaflet image or similar here */}
                            </div>
                            <p className="text-xs text-slate-500 mt-2 text-center italic">
                                *Concentración espacial basada en denuncias georreferenciadas.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-slate-200 text-center">
                    <p className="text-xs text-slate-400">
                        Generado automáticamente por SecurityInsight v1.1.
                        Datos oficiales: Carabineros de Chile, PDI, Subsecretaría de Prevención del Delito.
                    </p>
                </div>
            </div>
        </DualTabLayout>
    );
};
