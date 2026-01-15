import { PortadaLive } from '../pages/PortadaLive';
import { ExecutiveSummary } from '../pages/ExecutiveSummary';
import { CommunalFactSheet } from '../pages/executive/CommunalFactSheet';
import { WeeklyAnalysis } from '../pages/WeeklyAnalysis';
import { TacticalTrafficLight } from '../pages/tactical/TacticalTrafficLight';
import { TacticalDailyProfile } from '../pages/tactical/TacticalDailyProfile';
import { TacticalTrend } from '../pages/tactical/TacticalTrend';
import { CrimeMatrix } from '../pages/CrimeMatrix';
import { StrategicAnalysis } from '../pages/StrategicAnalysis';
import { RegionalBenchmarking } from '../pages/RegionalBenchmarking';
import { HistoricalTrends } from '../pages/HistoricalTrends';
import { Forecasting } from '../pages/Forecasting';
import { DemographicAnalysis } from '../pages/DemographicAnalysis';
import { Seasonality } from '../pages/Seasonality';
import { AIProjections } from '../pages/AIProjections';
import { ImpactEvaluator } from '../pages/simulator/ImpactEvaluator';

// Define the order and mapping of pages
export const REPORT_PAGES = [
    { id: 'portada', component: PortadaLive, title: 'Portada' },
    { id: 'executive-summary', component: ExecutiveSummary, title: 'Resumen Ejecutivo' },
    { id: 'communal-fact-sheet', component: CommunalFactSheet, title: 'Ficha Comunal' },
    { id: 'weekly-analysis', component: WeeklyAnalysis, title: 'Análisis Semanal' },
    { id: 'tactical-traffic', component: TacticalTrafficLight, title: 'Semáforo Delictual' },
    { id: 'tactical-daily', component: TacticalDailyProfile, title: 'Perfil Diario' },
    { id: 'tactical-trend', component: TacticalTrend, title: 'Tendencia Táctica' },
    { id: 'crime-matrix', component: CrimeMatrix, title: 'Matriz de Delitos' },
    { id: 'strategic-analysis', component: StrategicAnalysis, title: 'Análisis Estratégico' },
    { id: 'regional-benchmarking', component: RegionalBenchmarking, title: 'Ranking Regional' },
    { id: 'historical-trends', component: HistoricalTrends, title: 'Tendencias Históricas' },
    { id: 'forecasting', component: Forecasting, title: 'Proyección' },
    { id: 'demographics', component: DemographicAnalysis, title: 'Análisis Demográfico' },
    { id: 'seasonality', component: Seasonality, title: 'Estacionalidad' },
    { id: 'ai-projections', component: AIProjections, title: 'Proyecciones IA' },
    { id: 'impact-evaluator', component: ImpactEvaluator, title: 'Evaluador de Impacto' },
];
