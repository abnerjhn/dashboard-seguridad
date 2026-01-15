
import Papa from 'papaparse';
import { COMUNA_MAPPING } from './comunaMapping';
import type { HistoricalDataItem, DemographicsMap } from '../types';
export type { HistoricalDataItem, DemographicsMap };

export interface StopDataItem {
    delito: string;
    frecuencia: number;
    codco: number;
    calle?: string;
    fecha: string;
    semana: string;
    id_semana?: number;
}

// Helper to load partitioned files
const loadPartitionedCSV = async (baseName: string, parts: number): Promise<string> => {
    try {
        const promises = [];
        const [name, ext] = baseName.split('.');

        for (let i = 1; i <= parts; i++) {
            promises.push(fetch(`/data/${name}_part${i}.${ext}`).then(res => {
                if (!res.ok) throw new Error(`Missing part ${i}`);
                return res.text();
            }));
        }

        const chunks = await Promise.all(promises);
        return chunks.join('');
    } catch (e) {
        console.warn(`Failed to load partitioned data for ${baseName}, trying fallback to single file.`);
        const res = await fetch(`/data/${baseName}`);
        if (!res.ok) throw new Error("Failed to load data file.");
        return res.text();
    }
};

export const loadStopData = async (): Promise<StopDataItem[]> => {
    try {
        // stop_data.csv is split into 3 parts (approx 107MB total / 45MB chunk)
        const text = await loadPartitionedCSV('stop_data.csv', 3);
        return parseCSV(text);
    } catch (error) {
        console.error("Error loading STOP data:", error);
        return [];
    }
};

export const loadHistoricalData = async (): Promise<HistoricalDataItem[]> => {
    try {
        // combined_historical.csv is split into 5 parts (approx 205MB total / 45MB chunk)
        const text = await loadPartitionedCSV('combined_historical.csv', 5);
        return parseHistoricalCSV(text);
    } catch (error) {
        console.error("Error loading Historical data:", error);
        return [];
    }
};

const parseCSV = (csvText: string): StopDataItem[] => {
    const lines = csvText.split('\n');
    if (lines.length < 2) return [];

    const data: StopDataItem[] = [];

    // Skip header
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(',');
        if (values.length < 6) continue;

        const freq = parseInt(values[1]) || 0;
        const codco = parseInt(values[2]) || 0;
        const id_semana = parseInt(values[3]) || 0;
        const semana_det = values[4]?.trim() || '';
        const fechaRaw = values[5]?.trim() || '';

        data.push({
            delito: values[0].trim(),
            frecuencia: freq,
            codco: codco,
            calle: '',
            fecha: fechaRaw,
            semana: semana_det,
            id_semana: id_semana
        });
    }
    return data;
};

const parseHistoricalCSV = (csvText: string): HistoricalDataItem[] => {
    const result = Papa.parse(csvText, {
        header: false,
        skipEmptyLines: true,
    });

    const lines = result.data as string[][];
    if (lines.length < 2) return [];

    const headers = lines[0];

    const idxDelito = headers.findIndex(h => h.includes('GRUPO') || h.includes('DELITO'));
    const idxCodcom = headers.findIndex(h => h.toLowerCase().includes('codcom'));
    const idxAnio = headers.findIndex(h => h.includes('Año') || h.includes('A?o') || h.includes('Ano'));
    const idxDesc = headers.findIndex(h => h.includes('Descripcion'));
    const idxEnero = headers.findIndex(h => h.includes('Enero'));

    if (idxDelito === -1 || idxEnero === -1) {
        console.error("Historical CSV missing required headers", { headers });
        return [];
    }

    const data: HistoricalDataItem[] = [];

    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i];
        if (cols.length < headers.length) continue;

        const months = [];
        for (let m = 0; m < 12; m++) {
            const val = cols[idxEnero + m];
            months.push(typeof val === 'number' ? val : (parseFloat(String(val)) || 0));
        }

        data.push({
            delito: cols[idxDelito].trim(),
            anio: parseInt(String(cols[idxAnio])) || 0,
            codcom: parseInt(String(cols[idxCodcom])) || 0,
            comuna: COMUNA_MAPPING[parseInt(String(cols[idxCodcom]))] || (idxDesc > -1 ? String(cols[idxDesc]).trim() : `Comuna ${cols[idxCodcom]}`),
            meses: months
        });
    }

    console.log(`Loaded ${data.length} historical records via PapaParse.`);
    return data;
};

export const loadDemographics = async (): Promise<DemographicsMap> => {
    try {
        const response = await fetch('/data/comuna_demographics.json');
        if (!response.ok) throw new Error("Failed to load demographics");
        return await response.json();
    } catch (error) {
        console.error("Error loading demographics:", error);
        return {};
    }
};
