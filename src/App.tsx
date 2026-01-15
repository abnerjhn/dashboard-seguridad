import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { PortadaLive } from './pages/PortadaLive';
import { ExecutiveSummary } from './pages/ExecutiveSummary';
import { WeeklyAnalysis } from './pages/WeeklyAnalysis';
import { StrategicAnalysis } from './pages/StrategicAnalysis';
import { AIProjections } from './pages/AIProjections';

import { HistoricalTrends } from './pages/HistoricalTrends';
import { CrimeMatrix } from './pages/CrimeMatrix';
import { RegionalBenchmarking } from './pages/RegionalBenchmarking';
import { Forecasting } from './pages/Forecasting';
import { DemographicAnalysis } from './pages/DemographicAnalysis';
import { Seasonality } from './pages/Seasonality';
import { TacticalTrafficLight } from './pages/tactical/TacticalTrafficLight';
import { TacticalDailyProfile } from './pages/tactical/TacticalDailyProfile';
import { TacticalTrend } from './pages/tactical/TacticalTrend';
import { CommunalFactSheet } from './pages/executive/CommunalFactSheet';
import { ImpactEvaluator } from './pages/simulator/ImpactEvaluator';
import { FullReport } from './pages/FullReport';
import { PrintWizardPage } from './pages/PrintWizardPage';
import { Documentation } from './pages/Documentation';

import { PrintPreferencesProvider } from './context/PrintPreferencesContext';
import { PdfGeneratorProvider } from './context/PdfGeneratorContext';
import { DashboardProvider, type DashboardContextType } from './context/DashboardContext';
import { useDataFetcher } from './hooks/useDataFetcher';

function App() {
  // Global Data Fetching & State
  const {
    leyStopData,
    ceadData,
    comunaAnalysisData,
    nationalData,
    historicalData,
    demographicsData,
    loading,
    error,
    availableComunas,
    maxWeek
  } = useDataFetcher();

  const [selectedComuna, setSelectedComuna] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState<number>(0);
  // Add global view state for persistence
  const [viewState, setViewState] = useState<Record<string, any>>({});

  // Sync selectedWeek with maxWeek when loaded
  useEffect(() => {
    if (maxWeek && selectedWeek === 0) {
      setSelectedWeek(maxWeek);
    }
  }, [maxWeek, selectedWeek]);

  // Set default comuna once loaded
  useEffect(() => {
    if (availableComunas.length > 0 && !selectedComuna) {
      // Default to "Quillota" if exists, otherwise first
      const defaultComuna = availableComunas.includes('Quillota') ? 'Quillota' : availableComunas[0];
      setSelectedComuna(defaultComuna);
    }
  }, [availableComunas, selectedComuna]);

  // Simulated User Context (Role Based Access Control)
  const userRole: string = 'admin'; // 'admin' or 'user'
  const contractedComunas = ['Quillota', 'Las Condes'];

  const displayComunas = userRole === 'admin'
    ? availableComunas
    : availableComunas.filter(c => contractedComunas.includes(c) || c === 'Quillota');

  const contextValue: DashboardContextType = {
    data: {
      leyStop: leyStopData,
      cead: ceadData,
      comunaAnalysis: comunaAnalysisData,
      national: nationalData,
      historical: historicalData,
      demographics: demographicsData
    },
    globalState: {
      selectedComuna,
      setSelectedComuna,
      availableComunas: displayComunas,
      year: 2025,
      week: maxWeek || 28,
      maxWeek: maxWeek || 28,
      selectedWeek: selectedWeek || 28,
      setSelectedWeek,
      viewState,
      setViewState: (pageId: string, state: any) => setViewState(prev => ({ ...prev, [pageId]: state })),
    },
    loading,
    error
  };

  return (
    <Router>
      <DashboardProvider value={contextValue}>
        <PrintPreferencesProvider>
          <PdfGeneratorProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<PortadaLive />} />
                <Route path="dashboard" element={<ExecutiveSummary />} />
                <Route path="fact-sheet" element={<CommunalFactSheet />} />
                <Route path="weekly" element={<WeeklyAnalysis />} />
                <Route path="tactical-traffic" element={<TacticalTrafficLight />} />
                <Route path="tactical-daily" element={<TacticalDailyProfile />} />
                <Route path="tactical-trend" element={<TacticalTrend />} />
                <Route path="strategic" element={<StrategicAnalysis />} />
                <Route path="forecasting" element={<Forecasting />} />
                <Route path="demographics" element={<DemographicAnalysis />} />
                <Route path="seasonality" element={<Seasonality />} />
                <Route path="projections" element={<AIProjections />} />
                <Route path="impact-evaluator" element={<ImpactEvaluator />} />
                <Route path="trends" element={<HistoricalTrends />} />
                <Route path="matrix" element={<CrimeMatrix />} />
                <Route path="ranking" element={<RegionalBenchmarking />} />
                <Route path="documentation" element={<Documentation />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
              <Route path="/full-report" element={<FullReport />} />
              <Route path="/print-wizard" element={<PrintWizardPage />} />
            </Routes>
          </PdfGeneratorProvider>
        </PrintPreferencesProvider>
      </DashboardProvider>
    </Router>
  );
}

export default App;
