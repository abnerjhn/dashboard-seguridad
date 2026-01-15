import React from 'react';
import { Database, ShieldCheck, AlertTriangle, BookOpen } from 'lucide-react';
import { PageHeader } from '../components/UI/PageHeader';
import { DualTabLayout } from '../components/Layout/DualTabLayout';
import { Card } from '../components/UI/Card';

export const Documentation: React.FC = () => {
    return (
        <DualTabLayout pageId="documentation" title="Documentación" className="space-y-6 animate-in fade-in duration-500">
            <PageHeader
                title="DESCRIPCIÓN DEL REPORTE"
                subtitle="Metodología, Fuentes de Datos y Cálculos"
                icon={BookOpen}
                sourceName="Documentación Oficial"
                dataSourceId=""
            />

            {/* Legend Section */}
            <div className="bg-slate-800 border-l-4 border-slate-600 rounded-r-lg p-6 mb-8">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <Database className="w-5 h-5 mr-2 text-slate-400" />
                    Leyenda de Fuentes de Datos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-emerald-900/20 border border-emerald-800/50 p-4 rounded flex items-start space-x-3">
                        <ShieldCheck className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-1" />
                        <div>
                            <span className="text-emerald-400 font-bold block mb-1">[DATOS REALES]</span>
                            <p className="text-sm text-gray-400">Información extraída directamente de los archivos de datos operativos (CSV, JSON).</p>
                        </div>
                    </div>
                    <div className="bg-amber-900/20 border border-amber-800/50 p-4 rounded flex items-start space-x-3">
                        <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                        <div>
                            <span className="text-amber-400 font-bold block mb-1">[DATOS DE EJEMPLO]</span>
                            <p className="text-sm text-gray-400">Información simulada o estática para fines demostrativos de la interfaz.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Sections */}
            <div className="grid grid-cols-1 gap-6">

                {/* Portada */}
                <DocSection
                    title="Portada"
                    component="PortadaLive"
                    purpose="Vista inicial y presentación formal del reporte."
                    items={[
                        { label: 'Fecha', type: 'real', desc: 'Basada en la última fecha disponible en stop_data.csv.' },
                        { label: 'Comuna', type: 'real', desc: 'Configuración global del dashboard.' }
                    ]}
                />

                {/* Resumen Ejecutivo */}
                <DocSection
                    title="1. Resumen Ejecutivo"
                    component="ExecutiveSummary"
                    purpose="Visión general de alto nivel del estado delictual con foco en los principales KPIs de gestión."
                    items={[
                        { label: 'Casos Policiales', type: 'real', desc: 'Sumatoria de frecuencia de delitos para la semana seleccionada (stop_data.csv).' },
                        { label: 'Variación Semanal', type: 'mock', desc: 'Valor demostrativo fijo -4.5%.' },
                        { label: 'Índice IDI / Victimización', type: 'mock', desc: 'Valores estáticos 112.4 / 8.2%.' },
                        { label: 'Hallazgos Clave', type: 'mock', desc: 'Textos predefinidos sobre "Sector San Pedro" e "Incivilidades".' },
                        { label: 'Recomendaciones', type: 'mock', desc: 'Tarjetas estáticas de ejemplo.' }
                    ]}
                />

                {/* Ficha Comunal */}
                <DocSection
                    title="1a. Ficha Comunal"
                    component="CommunalFactSheet"
                    purpose="Documento resumen imprimible con estadísticas demográficas y delictuales consolidadas."
                    items={[
                        { label: 'Perfil Demográfico', type: 'real', desc: 'Población y superficie desde comuna_demographics.json.' },
                        { label: 'Tabla de Resumen Delictual', type: 'real', desc: 'Agregación real de casos por tipo de delito (stop_data.csv).' },
                        { label: 'Mapa de Situación', type: 'mock', desc: 'Imagen estática representativa.' }
                    ]}
                />

                {/* Análisis Táctico */}
                <DocSection
                    title="2. Análisis Táctico"
                    component="WeeklyAnalysis"
                    purpose="Herramienta operativa para identificar tendencias de corto plazo y focos horarios."
                    items={[
                        { label: 'Tabla de Tendencias Tácticas', type: 'real', desc: 'Conteo real filtrado por semana (stop_data.csv).' },
                        { label: 'Matriz de Calor Temporal (Heatmap)', type: 'mock', desc: 'Datos de ejemplo (visualización simulada).' },
                        { label: 'Tarjeta de Foco Crítico', type: 'mock', desc: 'Texto estático "Viernes 20:00 - 00:00 hrs".' }
                    ]}
                />

                {/* Semáforo STOP */}
                <DocSection
                    title="2a. Semáforo STOP"
                    component="TacticalTrafficLight"
                    purpose="Sistema de alerta temprana basado en desviaciones estadísticas."
                    items={[
                        { label: 'Cartas de Delitos', type: 'real', desc: 'Datos reales (stop_data.csv).' },
                        { label: 'Cálculo de Semáforo', type: 'real', desc: 'Media y desviación estándar real calculada sobre la historia disponible.' }
                    ]}
                />

                {/* Perfil Diario */}
                <DocSection
                    title="2b. Perfil Diario"
                    component="TacticalDailyProfile"
                    purpose="Análisis granular del comportamiento delictual por día/hora."
                    items={[
                        { label: 'Distribución Semanal / Horaria', type: 'real', desc: 'Day/Hour parsing real de la columna "fecha" (stop_data.csv).' }
                    ]}
                />

                {/* Evolución */}
                <DocSection
                    title="2c. Evolución"
                    component="TacticalTrend"
                    purpose="Comparativa directa de evolución temporal entre periodos."
                    items={[
                        { label: 'Gráfico Comparativo', type: 'real', desc: 'Agrupación semanal real para curva actual (stop_data.csv).' }
                    ]}
                />

                {/* Matriz de Focos */}
                <DocSection
                    title="2d. Matriz de Focos"
                    component="CrimeMatrix"
                    purpose="Priorización estratégica combinando Frecuencia y Severidad."
                    items={[
                        { label: 'Eje Frecuencia', type: 'real', desc: 'Datos reales (stop_data.csv).' },
                        { label: 'Eje Impacto', type: 'mock', desc: 'Score de gravedad asignado heurísticamente.' }
                    ]}
                />

                {/* Análisis Estratégico */}
                <DocSection
                    title="3. Análisis Estratégico"
                    component="StrategicAnalysis"
                    purpose="Diagnóstico de mediano y largo plazo."
                    items={[
                        { label: 'Evolución Multianual', type: 'real', desc: 'Datos históricos mensuales (combined_historical.csv).' },
                        { label: 'Composición Delictual', type: 'real', desc: 'Datos históricos reales.' },
                        { label: 'Distribución Regional del Delito', type: 'real', desc: 'Visualización geoespacial de tasas delictuales por comuna.' }
                    ]}
                />

                {/* Benchmark Regional */}
                <DocSection
                    title="3a. Benchmark Regional"
                    component="RegionalBenchmarking"
                    purpose="Contextualizar la situación comunal."
                    items={[
                        { label: 'Ranking', type: 'real', desc: 'Comparativa de múltiples comunas del dataset histórico.' },
                        { label: 'Población para Tasas', type: 'real', desc: 'Datos censales reales (comuna_demographics.json).' }
                    ]}
                />

                {/* Tendencias Históricas */}
                <DocSection
                    title="3b. Tendencias Históricas"
                    component="HistoricalTrends"
                    purpose="Análisis de series temporales largas."
                    items={[
                        { label: 'Línea de Tiempo Larga', type: 'real', desc: 'Visualización de datos 2017-2023+ (combined_historical.csv).' }
                    ]}
                />

                {/* Proyección */}
                <DocSection
                    title="3c. Proyección"
                    component="Forecasting"
                    purpose="Estimación estadística del futuro inmediato."
                    items={[
                        { label: 'Datos Históricos', type: 'real', desc: 'Serie real (stop_data.csv).' },
                        { label: 'Datos Proyectados', type: 'mock', desc: 'Generados algorítmicamente o simulados.' }
                    ]}
                />

                {/* Demografía */}
                <DocSection
                    title="3d. Demografía"
                    component="DemographicAnalysis"
                    purpose="Búsqueda de correlaciones."
                    items={[
                        { label: 'Datos Delictuales', type: 'real', desc: 'Frecuencia real (stop_data.csv).' },
                        { label: 'Datos Socio-demográficos', type: 'real', desc: 'Variables reales (comuna_demographics.json).' }
                    ]}
                />

                {/* Estacionalidad */}
                <DocSection
                    title="3e. Estacionalidad"
                    component="Seasonality"
                    purpose="Análisis cíclico."
                    items={[
                        { label: 'Gráfico Mensual', type: 'real', desc: 'Promedios históricos reales.' }
                    ]}
                />

                {/* Simulador IA */}
                <DocSection
                    title="4. Simulador IA"
                    component="AIProjections"
                    purpose="Simulador de escenarios What-If."
                    items={[
                        { label: 'Línea Base', type: 'real', desc: 'Total real actual como punto de partida.' },
                        { label: 'Modelo de Reducción', type: 'mock', desc: 'Modelo heurístico matemático frontend.' }
                    ]}
                />

                {/* Evaluador de Impacto */}
                <DocSection
                    title="4a. Evaluador de Impacto"
                    component="ImpactEvaluator"
                    purpose="Auditoría ex-post."
                    items={[
                        { label: 'Curva de Delitos', type: 'real', desc: 'Datos reales (stop_data.csv).' },
                        { label: 'Cálculo de Impacto', type: 'real', desc: 'Cálculo dinámico real pre/post intervención.' }
                    ]}
                />

            </div>
        </DualTabLayout>
    );
};

// Helper Components
const DocSection: React.FC<{
    title: string;
    component: string;
    purpose: string;
    items: { label: string; type: 'real' | 'mock'; desc: string }[]
}> = ({ title, component, purpose, items }) => (
    <Card title={title} className="hover:border-slate-600 transition-colors">
        <div className="mb-4">
            <p className="text-sm text-gray-400 mb-1">Componente: <code className="text-orange-400 bg-slate-900 px-1 py-0.5 rounded text-xs">{component}</code></p>
            <p className="text-slate-300 italic">"{purpose}"</p>
        </div>
        <div className="space-y-3">
            {items.map((item, idx) => (
                <div key={idx} className="flex items-start text-sm border-t border-slate-700/50 pt-3 first:border-0 first:pt-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mr-3 flex-shrink-0 mt-0.5 
                        ${item.type === 'real' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800' : 'bg-amber-900/40 text-amber-400 border border-amber-800'}`}>
                        {item.type === 'real' ? 'Real' : 'Ejemplo'}
                    </span>
                    <div>
                        <strong className="text-white block sm:inline sm:mr-2">{item.label}:</strong>
                        <span className="text-gray-400">{item.desc}</span>
                    </div>
                </div>
            ))}
        </div>
    </Card>
);
