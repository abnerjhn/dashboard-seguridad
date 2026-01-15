import React, { useMemo, useState, useEffect } from 'react';
import { useDashboardContext } from '../context/DashboardContext';
import { Card } from '../components/UI/Card';
import { TrendLineChart } from '../components/Charts/TrendLineChart';
import { Target } from 'lucide-react';
import { DataSourceIndicator } from '../components/UI/DataSourceIndicator';
import { loadHistoricalData, loadDemographics, type HistoricalDataItem, type DemographicsMap } from '../utils/dataLoader';
import StrategyMap from '../components/Maps/StrategyMap';
import { PageHeader } from '../components/UI/PageHeader';
import { DualTabLayout } from '../components/Layout/DualTabLayout';

export const StrategicAnalysis: React.FC = () => {
    const { data, globalState } = useDashboardContext();
    const { selectedComuna } = globalState;
    const [historicalData, setHistoricalData] = useState<HistoricalDataItem[]>([]);
    const [demographics, setDemographics] = useState<DemographicsMap>({});

    useEffect(() => {
        Promise.all([
            loadHistoricalData(),
            loadDemographics()
        ]).then(([hist, demo]) => {
            setHistoricalData(hist);
            setDemographics(demo);
        });
    }, []);

    // 1. Prepare Historical Trend Data (CEAD)
    const trendData = useMemo(() => {
        const rawData = data.cead.filter(d => d.Comuna === selectedComuna);
        const monthlyData: Record<number, { name: string; frequency: number; rate: number; regional: number; national: number }> = {};

        rawData.forEach(d => {
            if (!monthlyData[d.Mes]) {
                monthlyData[d.Mes] = {
                    name: `Mes ${d.Mes}`,
                    frequency: 0,
                    rate: 0,
                    regional: 0,
                    national: 0
                };
            }
            monthlyData[d.Mes].frequency += d.Frecuencia || 0;
            monthlyData[d.Mes].rate += d.Tasa_por_100k || 0;
        });

        // Add simulated comparative trends
        Object.values(monthlyData).forEach(m => {
            m.regional = Math.round(m.frequency * 0.9 + 50); // Mock Regional Trend
            m.national = Math.round(m.frequency * 1.1 + 100);  // Mock National Trend
        });

        return Object.values(monthlyData).sort((a, b) => {
            const monthA = parseInt(a.name.split(' ')[1]);
            const monthB = parseInt(b.name.split(' ')[1]);
            return monthA - monthB;
        });
    }, [data.cead, selectedComuna]);

    return (
        <DualTabLayout pageId="strategic-analysis" title="Análisis Estratégico" className="space-y-6">
            <PageHeader
                title="ANÁLISIS ESTRATÉGICO"
                subtitle="Comparativo Regional"
                icon={Target}
                sourceName="CEAD (SPD)"
                dataSourceId="strat-header"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-16rem)]">
                {/* Left Col: Map */}
                <Card className="h-full flex flex-col p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-900 text-lg flex items-center">
                            Distribución Regional del Delito
                            <DataSourceIndicator dataSourceId="strat-map" className="ml-2" />
                        </h3>
                        <div className="flex space-x-3 text-xs font-bold">
                            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-500 mr-1"></span> Tasa Baja</div>
                            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-orange-500 mr-1"></span> Tasa Media</div>
                            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-1"></span> Tasa Alta</div>
                        </div>
                    </div>

                    <div className="flex-1 rounded-lg overflow-hidden border border-gray-200 relative z-0 h-[600px]">
                        <StrategyMap
                            historicalData={historicalData}
                            demographics={demographics}
                            selectedComuna={selectedComuna}
                            onSelectComuna={globalState.setSelectedComuna}
                        />
                    </div>
                </Card>

                {/* Right Col: Charts (Existing Analysis) */}
                <div className="flex flex-col space-y-6 overflow-y-auto pr-1 h-full">
                    {/* AI Comparative Analysis */}
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 flex-shrink-0 relative group">
                        <div className="flex items-center space-x-2 mb-3">
                            <svg className="w-5 h-5 text-indigo-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <h3 className="font-bold text-indigo-900 text-sm flex items-center">
                                Análisis Comparativo IA
                                <DataSourceIndicator dataSourceId="strat-analysis-ia" className="ml-2" />
                            </h3>
                        </div>
                        <p className="text-sm text-indigo-800 leading-relaxed">
                            {selectedComuna} mantiene mejores índices que La Calera debido a la contención en ejes comerciales, pero muestra un deterioro en zonas periféricas limítrofes con La Cruz.
                        </p>
                    </div>

                    <Card className="overflow-hidden flex-shrink-0">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-black text-slate-900 flex items-center">
                                {selectedComuna}
                                <DataSourceIndicator dataSourceId="strat-benchmarking" className="ml-2" />
                            </h2>
                            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                En Mejora
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-5">
                            <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Índice del Crimen</p>
                                <p className="text-3xl font-black text-slate-900">112.4</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Tasa x 100k Hab</p>
                                <p className="text-3xl font-black text-slate-900">680.4</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Benchmarking Relativo</h3>

                            {/* Vs Promedio Regional */}
                            <div>
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-sm text-gray-600">Vs. Promedio Regional</span>
                                    <span className="text-sm font-bold text-emerald-600">-5.2%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '45%' }}></div>
                                </div>
                            </div>

                            {/* Vs Misma Comuna */}
                            <div>
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-sm text-gray-600">Vs. Misma Comuna (Año ant.)</span>
                                    <span className="text-sm font-bold text-red-500">+1.2%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 rounded-full" style={{ width: '60%' }}></div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card title="Evolución Histórica (CEAD)" dataSourceId="strat-history-chart" className="flex-shrink-0">
                        <p className="text-sm text-gray-500 mb-2">Tendencia mensual acumulada de casos y tasas.</p>
                        <div className="h-80 w-full mb-4">
                            <TrendLineChart
                                data={trendData}
                                xKey="name"
                                dataKeys={[
                                    { key: 'frequency', name: 'Comuna', color: '#1a237e' },
                                    { key: 'regional', name: 'Regional', color: '#f97316' },
                                    { key: 'national', name: 'Nacional', color: '#64748b' }
                                ]}
                            />
                        </div>
                    </Card>
                </div>
            </div>
        </DualTabLayout>
    );
};
