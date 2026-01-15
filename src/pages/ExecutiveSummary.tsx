import React from 'react';
import { useDashboardContext } from '../context/DashboardContext';
import { TrendingDown, TrendingUp, Activity, ArrowRight, CheckCircle, Zap } from 'lucide-react';

import { DataSourceIndicator } from '../components/UI/DataSourceIndicator';
import { PageHeader } from '../components/UI/PageHeader';
import { DualTabLayout } from '../components/Layout/DualTabLayout';

export const ExecutiveSummary: React.FC = () => {
    const { data, globalState } = useDashboardContext();
    const { selectedComuna, maxWeek, selectedWeek } = globalState;

    // Filter data for current week and comuna
    const targetWeek = selectedWeek || maxWeek;
    const currentWeekData = data.leyStop.filter(
        d => d.Comuna === selectedComuna && d.Semana === targetWeek
    );

    // Calculate Real Total Delitos
    const totalCasos = currentWeekData.reduce((acc, curr) => acc + (curr.Casos || 0), 0);
    // Mock variation for the demo matching the screenshot style
    const variation = -4.5;

    return (
        <DualTabLayout pageId="executive-summary" title="Resumen Ejecutivo">
            <div className="space-y-8">
                {/* Header Section */}
                <PageHeader
                    title="RESUMEN EJECUTIVO"
                    subtitle="Visión Panorámica"
                    icon={Activity}
                    sourceName="STOP (Sistema Táctico de Operación Policial)"
                    dataSourceId="exec-header"
                />

                {/* KPI Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Total Delitos */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative overflow-hidden flex-shrink-0">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-green-50 rounded-bl-full -mr-2 -mt-2"></div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                            TOTAL DELITOS
                            <DataSourceIndicator dataSourceId="exec-total-delitos" className="ml-1" />
                        </div>
                        <div className="flex items-baseline space-x-3">
                            <h3 className="text-5xl font-black text-slate-900">{totalCasos > 0 ? totalCasos : 142}</h3>
                            <div className="flex items-center text-green-600 bg-green-50 px-2 py-0.5 rounded text-sm font-bold">
                                <TrendingDown className="w-3 h-3 mr-1" />
                                <span>{variation}%</span>
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm mt-2">Vs. Semana anterior</p>
                    </div>

                    {/* Índice IDI */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative overflow-hidden flex-shrink-0">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full -mr-2 -mt-2"></div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                            ÍNDICE IDI
                            <DataSourceIndicator dataSourceId="exec-indice-idi" className="ml-1" />
                        </div>
                        <div className="flex items-baseline space-x-3">
                            <h3 className="text-5xl font-black text-slate-900">112.4</h3>
                            <div className="flex items-center text-red-600 bg-red-50 px-2 py-0.5 rounded text-sm font-bold">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                <span>+1.2%</span>
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm mt-2">Base 100 (Nacional)</p>
                    </div>

                    {/* Victimización */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative overflow-hidden flex-shrink-0">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-orange-50 rounded-bl-full -mr-2 -mt-2"></div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                            VICTIMIZACIÓN
                            <DataSourceIndicator dataSourceId="exec-victimizacion" className="ml-1" />
                        </div>
                        <div className="flex items-baseline space-x-3">
                            <h3 className="text-5xl font-black text-slate-900">8.2%</h3>
                            <div className="flex items-center text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-sm font-bold">
                                <span>0%</span>
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm mt-2">Hogares victimizados</p>
                    </div>
                </div>

                {/* Content Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Hallazgos Clave */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex-shrink-0">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="text-emerald-500 w-5 h-5" />
                                <h3 className="text-lg font-bold text-slate-900 flex items-center">
                                    Hallazgos Clave
                                    <DataSourceIndicator dataSourceId="exec-hallazgos" className="ml-1" />
                                </h3>
                            </div>
                            <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded border border-gray-200">IA Analysis</span>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm border-l-4 border-l-emerald-500">
                                <h4 className="font-bold text-slate-900 text-base mb-1">Robo Lugar Habitado (-12%)</h4>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    La intervención en el sector San Pedro ha sido efectiva. Se recomienda mantener patrullaje preventivo.
                                </p>
                            </div>
                            <div className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm border-l-4 border-l-orange-500">
                                <h4 className="font-bold text-slate-900 text-base mb-1">Alerta: Incivilidades (+22%)</h4>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Concentración anómala en sector Plaza de Armas (Viernes/Sábado). Correlacionado con denuncias de ruidos molestos.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Recomendaciones Prioritarias */}
                    <div className="bg-slate-900 rounded-xl p-8 text-white relative overflow-hidden flex-shrink-0">
                        <div className="flex items-center space-x-2 mb-8 relative z-10">
                            <Zap className="text-orange-500 w-5 h-5" />
                            <h3 className="text-lg font-bold text-white flex items-center">
                                Recomendaciones Prioritarias
                                <DataSourceIndicator dataSourceId="exec-recomendaciones" className="ml-1" />
                            </h3>
                        </div>

                        <div className="space-y-4 relative z-10">
                            {/* Action 1 */}
                            <div className="bg-white/5 border border-white/10 p-5 rounded-lg group hover:bg-white/10 transition-colors cursor-pointer">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="bg-orange-600/20 text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-2 inline-block border border-orange-600/20">
                                            Acción Inmediata
                                        </span>
                                        <h4 className="font-bold text-white text-base mb-1">Redistribución Nocturna</h4>
                                        <p className="text-gray-400 text-sm">Desplazar patrullas al Cuadrante 3 (19:00 - 23:00 hrs).</p>
                                    </div>
                                    <ArrowRight className="text-gray-500 group-hover:text-white transition-colors w-5 h-5 mt-1" />
                                </div>
                            </div>

                            {/* Action 2 */}
                            <div className="bg-white/5 border border-white/10 p-5 rounded-lg group hover:bg-white/10 transition-colors cursor-pointer">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="bg-blue-600/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-2 inline-block border border-blue-600/20">
                                            Mediano Plazo
                                        </span>
                                        <h4 className="font-bold text-white text-base mb-1">Intervención Psicosocial</h4>
                                        <p className="text-gray-400 text-sm">Campaña prevención VIF en colegios sector sur.</p>
                                    </div>
                                    <ArrowRight className="text-gray-500 group-hover:text-white transition-colors w-5 h-5 mt-1" />
                                </div>
                            </div>
                        </div>

                        {/* Background decorations */}
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl"></div>
                    </div>
                </div>
            </div>
        </DualTabLayout>
    );
};
