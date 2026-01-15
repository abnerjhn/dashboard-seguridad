export interface LeyStopData {
    Region: string;
    Comuna: string;
    Anio: number;
    Semana: number;
    Categoria: string;
    Casos: number;
    Casos_previos_anio: number;
    Variacion_porcentual: number;
}

export interface CeadData {
    Region: string;
    Comuna: string;
    Anio: number;
    Mes: number;
    Categoria: string;
    Frecuencia: number;
    Tasa_por_100k: number;
    IDI: number;
}

export interface ComunaAnalysisData {
    Region: string;
    Comuna: string;
    Anio: number;
    Categoria: string;
    Frecuencia: number;
    IDI_Comuna: number;
    IDI_Region: number;
    IDI_Nacional: number;
}

export interface NationalAnalysisData {
    Region: string;
    Categoria: string;
    Frecuencia_2023: number; // Adapting based on partial view, assuming explicit years might be present or generic
    // Based on "Arica y Parinacota,Violaciones y Delitos Sexuales,37,37,0" in my previous view of ley_stop, wait.
    // The national regional csv had: Region,Categoria,Frecuencia_2023,Frecuencia_20...
    // Let's use a generic map for flexibility if columns change, but typed preferred.
    // I will use loose typing for now for this specific file or define generic structure.
    [key: string]: string | number;
}

export interface DashboardState {
    selectedComuna: string;
    selectedYear: number;
    selectedWeek: number;
}

export interface HistoricalDataItem {
    delito: string;
    anio: number;
    codcom: number;
    comuna: string;
    meses: number[]; // Array of 12 values [Jan-Dec]
}

export interface DemographicsMap {
    [codcom: string]: {
        name: string;
        population: number;
        pop_youth: number;
        pop_adult: number;
        pop_senior: number;
        pop_male: number;
    };
}
