
import React, { createContext, useContext } from 'react';
import type { LeyStopData, CeadData, ComunaAnalysisData, NationalAnalysisData, HistoricalDataItem, DemographicsMap } from '../types/index';

export type DashboardContextType = {
    data: {
        leyStop: LeyStopData[];
        cead: CeadData[];
        comunaAnalysis: ComunaAnalysisData[];
        national: NationalAnalysisData[];
        historical: HistoricalDataItem[];
        demographics: DemographicsMap;
    };
    globalState: {
        selectedComuna: string;
        setSelectedComuna: (comuna: string) => void;
        availableComunas: string[];

        maxWeek: number;
        week: number;
        year: number;
        selectedWeek: number;
        setSelectedWeek: (week: number) => void;
        viewState: Record<string, any>;
        setViewState: (pageId: string, state: any) => void;
    };
    loading: boolean;
    error: string | null;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ value: DashboardContextType; children: React.ReactNode }> = ({ value, children }) => {
    return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export const useDashboardContext = () => {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboardContext must be used within a DashboardProvider');
    }
    return context;
};
