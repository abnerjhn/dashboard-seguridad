import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import type { LeyStopData, CeadData, ComunaAnalysisData, NationalAnalysisData, HistoricalDataItem, DemographicsMap } from '../types/index';
import { loadHistoricalData, loadDemographics } from '../utils/dataLoader';

export const useDataFetcher = () => {
    const [data, setData] = useState<{
        leyStopData: LeyStopData[];
        ceadData: CeadData[];
        comunaAnalysisData: ComunaAnalysisData[];
        nationalData: NationalAnalysisData[];
        historicalData: HistoricalDataItem[];
        demographicsData: DemographicsMap;
    }>({
        leyStopData: [],
        ceadData: [],
        comunaAnalysisData: [],
        nationalData: [],
        historicalData: [],
        demographicsData: {},
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [leyStop, cead, analysis, national, historical, demographics] = await Promise.all([
                    fetchCsv<LeyStopData>('/data/ley_stop_weekly_example.csv'),
                    fetchCsv<CeadData>('/data/cead_example_data.csv'),
                    fetchCsv<ComunaAnalysisData>('/data/analysis_by_comuna_example.csv'),
                    fetchCsv<NationalAnalysisData>('/data/national_regional_analysis_example.csv'),
                    loadHistoricalData(),
                    loadDemographics()
                ]);

                setData({
                    leyStopData: leyStop,
                    ceadData: cead,
                    comunaAnalysisData: analysis,
                    nationalData: national,
                    historicalData: historical,
                    demographicsData: demographics
                });
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error loading data');
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    // Derived state
    const availableComunas = Array.from(new Set(data.leyStopData.map(d => d.Comuna))).sort();
    const maxWeek = Math.max(...data.leyStopData.map(d => d.Semana), 0);

    return { ...data, loading, error, availableComunas, maxWeek };
};

const fetchCsv = <T>(url: string): Promise<T[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse(url, {
            download: true,
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
                resolve(results.data as T[]);
            },
            error: (error) => {
                reject(error);
            },
        });
    });
};
