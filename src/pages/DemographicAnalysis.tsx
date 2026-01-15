import React, { useState, useMemo } from 'react';
import { useDashboardContext } from '../context/DashboardContext';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { Users } from 'lucide-react';
import { PageHeader } from '../components/UI/PageHeader';
import { DualTabLayout } from '../components/Layout/DualTabLayout';

export const DemographicAnalysis: React.FC = () => {
    const { data, globalState } = useDashboardContext();
    const { historical: historicalData, demographics } = data;
    const xAxisVar = (globalState.viewState?.['demographics']?.xAxisVar as 'youth' | 'male' | 'adult' | 'senior') || 'youth';
    const setXAxisVar = (val: string) => globalState.setViewState('demographics', { ...globalState.viewState?.['demographics'], xAxisVar: val });

    const scatterData = useMemo(() => {
        if (!historicalData.length || Object.keys(demographics).length === 0) return [];

        // 1. Aggregate Crimes by Comuna (Latest Year)
        const latestYear = historicalData.reduce((max, d) => (d.anio > max ? d.anio : max), 0);

        const crimesPerComuna: Record<string, number> = {};

        historicalData.forEach(d => {
            if (d.anio === latestYear) {
                const id = String(d.codcom);
                const sum = d.meses.reduce((a, b) => a + b, 0);
                crimesPerComuna[id] = (crimesPerComuna[id] || 0) + sum;
            }
        });

        // 2. Merge with Demographics
        return Object.entries(demographics).map(([id, demo]) => {
            const crimes = crimesPerComuna[id] || 0;
            if (demo.population < 1000) return null;

            const rate = (crimes / demo.population) * 100000;

            // X Vars
            const youthPct = (demo.pop_youth / demo.population) * 100;
            const adultPct = (demo.pop_adult / demo.population) * 100;
            const seniorPct = (demo.pop_senior / demo.population) * 100;
            const malePct = (demo.pop_male / demo.population) * 100;

            let xVal = 0;
            if (xAxisVar === 'youth') xVal = youthPct;
            if (xAxisVar === 'adult') xVal = adultPct;
            if (xAxisVar === 'senior') xVal = seniorPct;
            if (xAxisVar === 'male') xVal = malePct;

            return {
                id,
                name: demo.name,
                x: parseFloat(xVal.toFixed(1)),
                y: parseFloat(rate.toFixed(1)),
                pop: demo.population
            };
        }).filter(Boolean) as { name: string; x: number; y: number; pop: number }[];

    }, [historicalData, demographics, xAxisVar]);

    if (!scatterData.length) return <div className="p-4 text-white">Cargando datos demográficos...</div>;

    const xLabel = {
        'youth': '% Población Joven (15-29)',
        'male': '% Hombres',
        'adult': '% Población Adulta (30-64)',
        'senior': '% Adulto Mayor (65+)'
    }[xAxisVar];

    return (
        <DualTabLayout pageId="demographics" title="Análisis Demográfico" className="space-y-6 animate-in fade-in duration-500">
            <PageHeader
                title="CORRELACIÓN SOCIO-DELICTUAL"
                subtitle="Análisis Cruzado: Demografía vs Criminalidad"
                icon={Users}
                sourceName="INE & STOP (Criminología Ambiental)"
                dataSourceId="demographics-header"
            >
                {/* Controls */}
                <div className="flex space-x-2 bg-slate-100 border border-gray-200 p-1 rounded-lg">
                    {(['youth', 'male', 'adult', 'senior'] as const).map(v => (
                        <button
                            key={v}
                            onClick={() => setXAxisVar(v)}
                            className={`px-3 py-1 text-xs font-bold rounded transition-colors ${xAxisVar === v ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-500 hover:bg-slate-200'}`}
                        >
                            {v === 'youth' ? 'Jóvenes' : v === 'male' ? 'Hombres' : v === 'adult' ? 'Adultos' : 'Mayores'}
                        </button>
                    ))}
                </div>
            </PageHeader>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-2">Criminalidad vs {xLabel}</h3>
                <p className="text-sm text-gray-400 mb-6">
                    Cada punto representa una Comuna. El tamaño del punto es proporcional a la población.
                </p>

                <div className="h-[500px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis
                                type="number"
                                dataKey="x"
                                name={xLabel}
                                unit="%"
                                stroke="#94a3b8"
                                domain={['auto', 'auto']}
                            />
                            <YAxis
                                type="number"
                                dataKey="y"
                                name="Tasa de Delitos"
                                unit=""
                                stroke="#94a3b8"
                            />
                            <ZAxis type="number" dataKey="pop" range={[50, 400]} name="Población" />
                            <Tooltip
                                cursor={{ strokeDasharray: '3 3' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const d = payload[0].payload;
                                        return (
                                            <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-xl text-xs">
                                                <div className="font-bold text-white border-b border-gray-600 mb-2 pb-1">{d.name}</div>
                                                <div className="text-emerald-400">{xLabel}: {d.x}%</div>
                                                <div className="text-red-400">Tasa Delitos: {d.y} / 100k</div>
                                                <div className="text-gray-400 mt-1">Población: {d.pop.toLocaleString()}</div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Scatter name="Comunas" data={scatterData} fill="#10b981" fillOpacity={0.6} />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </DualTabLayout>
    );
};
