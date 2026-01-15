export interface DataSourceSpec {
    mode: 'real' | 'mock' | 'mixed';
    label?: string; // Optional override for the main tooltip label
    realInfo?: {
        source: string;
        calculation: string;
    };
    mockInfo?: {
        requiredInput: string;
        potentialSource: string;
    };
}

export const DATA_SOURCES: Record<string, DataSourceSpec> = {
    // --- PORTADA (PortadaLive.tsx) ---
    'portada-periodo': {
        mode: 'real',
        realInfo: {
            source: 'STOP (stop_data.csv)',
            calculation: 'Rango de fechas extraído de la columna "Fecha del Delito" del dataset activo.'
        }
    },
    'portada-alerta': {
        mode: 'mock',
        label: 'Estado Simulado (IA)',
        mockInfo: {
            requiredInput: 'Modelo de Simulación IA',
            potentialSource: 'Simulación teórica aplicada sobre línea base real.'
        }
    },

    // --- RESUMEN EJECUTIVO (ExecutiveSummary.tsx) ---
    'exec-header': {
        mode: 'real',
        label: 'Consolidado Multi-Fuente',
        realInfo: {
            source: 'STOP (stop_data.csv)',
            calculation: 'Datos operativos consolidados de la semana seleccionada.'
        }
    },
    'exec-total-delitos': {
        mode: 'real',
        realInfo: {
            source: 'STOP (stop_data.csv)',
            calculation: 'Sumatoria de frecuencia de delitos para la semana seleccionada.'
        }
    },
    'exec-indice-idi': {
        mode: 'mock',
        mockInfo: {
            requiredInput: 'Fórmula Índice de Delitos de Impacto',
            potentialSource: 'Datos de Ejemplo (Valores estáticos para demostración).'
        }
    },
    'exec-victimizacion': {
        mode: 'mock',
        mockInfo: {
            requiredInput: 'Encuesta ENUSC',
            potentialSource: 'Datos de Ejemplo (Estadística de prueba).'
        }
    },
    'exec-hallazgos': {
        mode: 'mock',
        mockInfo: {
            requiredInput: 'Análisis de Texto (NLP)',
            potentialSource: 'Generado con textos predefinidos para demostración de UI.'
        }
    },
    'exec-recomendaciones': {
        mode: 'mock',
        mockInfo: {
            requiredInput: 'Motor de Recomendación',
            potentialSource: 'Tarjetas estáticas de ejemplo.'
        }
    },

    // --- FICHA COMUNAL ---
    'factsheet-header': {
        mode: 'real',
        label: 'INE & STOP',
        realInfo: {
            source: 'INE (comuna_demographics.json) & STOP',
            calculation: 'Cruce de datos demográficos y operativos.'
        }
    },

    // --- ANÁLISIS TÁCTICO (WeeklyAnalysis.tsx) ---
    'tactical-header': {
        mode: 'real',
        label: 'STOP Semanal',
        realInfo: {
            source: 'STOP (stop_data.csv)',
            calculation: 'Datos tácticos de la semana seleccionada.'
        }
    },
    'tactical-table': {
        mode: 'real',
        realInfo: {
            source: 'STOP (stop_data.csv)',
            calculation: 'Conteo real filtrado por semana y cálculo de tendencia últimas 10 semanas.'
        }
    },
    'tactical-heatmap': {
        mode: 'mock',
        mockInfo: {
            requiredInput: 'Timestamp Exacto (Hora/Min)',
            potentialSource: 'Datos de Ejemplo (Matriz simulada para visualización).'
        }
    },
    'tactical-focus-card': {
        mode: 'mock',
        mockInfo: {
            requiredInput: 'Detección de Anomalías',
            potentialSource: 'Datos de Ejemplo (Texto estático).'
        }
    },
    'tactical-insight': {
        mode: 'mock',
        label: 'Insight IA',
        mockInfo: {
            requiredInput: 'Generación de Texto IA',
            potentialSource: 'Análisis de texto simulado.'
        }
    },

    // --- SEMÁFORO DELICTUAL ---
    'traffic-light-header': {
        mode: 'real',
        realInfo: {
            source: 'STOP (stop_data.csv)',
            calculation: 'Análisis de desviación estándar sobre series históricas reales.'
        }
    },

    // --- PERFIL DIARIO ---
    'daily-profile-header': {
        mode: 'real',
        realInfo: {
            source: 'STOP (stop_data.csv)',
            calculation: 'Distribución por día de la semana basada en fechas reales.'
        }
    },

    // --- TENDENCIA ---
    'tactical-trend-header': {
        mode: 'real',
        realInfo: {
            source: 'STOP (stop_data.csv)',
            calculation: 'Comparativa anual basada en agrupación semanal real.'
        }
    },


    // --- ANÁLISIS ESTRATÉGICO (StrategicAnalysis.tsx) ---
    'strat-header': {
        mode: 'real',
        label: 'CEAD (SPD)',
        realInfo: {
            source: 'CEAD (combined_historical.csv)',
            calculation: 'Estadísticas oficiales consolidadas.'
        }
    },
    'strat-map': {
        mode: 'real',
        label: 'Distribución Regional',
        realInfo: {
            source: 'CEAD (combined_historical.csv)',
            calculation: 'Tasas delictuales georreferenciadas por comuna (Rango de color según cuartiles reales).'
        }
    },
    'strat-analysis-ia': {
        mode: 'mock',
        mockInfo: {
            requiredInput: 'LLM Analysis',
            potentialSource: 'Texto simulado de análisis comparativo.'
        }
    },
    'strat-benchmarking': {
        mode: 'real',
        label: 'Ranking Regional',
        realInfo: {
            source: 'CEAD (combined_historical.csv)',
            calculation: 'Ranking calculado con datos históricos reales de todas las comunas.'
        }
    },
    'strat-history-chart': {
        mode: 'real',
        label: 'Evolución Histórica',
        realInfo: {
            source: 'CEAD (combined_historical.csv)',
            calculation: 'Datos históricos mensuales reales.'
        }
    },

    // --- BENCHMARKING REGIONAL (RegionalBenchmarking.tsx) ---
    'regional-header': {
        mode: 'real',
        realInfo: {
            source: 'STOP, CEAD & INE',
            calculation: 'Comparativa multi-fuente.'
        }
    },
    'regional-ranking': {
        mode: 'real',
        label: 'Ranking Regional',
        realInfo: {
            source: 'CEAD (combined_historical.csv)',
            calculation: 'Ranking de volumen delictual anual.'
        }
    },
    'regional-scatter': {
        mode: 'mock',
        mockInfo: {
            requiredInput: 'Variables Eficiencia Policial',
            potentialSource: 'Datos de Ejemplo (Scatter plot simulado).'
        }
    },

    // --- MATRIZ DE CRIMEN (CrimeMatrix.tsx) ---
    'matrix-header': {
        mode: 'mixed',
        label: 'Matriz de Riesgo',
        realInfo: {
            source: 'STOP (stop_data.csv)',
            calculation: 'Frecuencia real del dataset.'
        },
        mockInfo: {
            requiredInput: 'Score de Gravedad',
            potentialSource: 'Score asignado heurísticamente.'
        }
    },

    // --- TENDENCIAS HISTÓRICAS (HistoricalTrends.tsx) ---
    'trends-header': {
        mode: 'real',
        realInfo: {
            source: 'CEAD (combined_historical.csv)',
            calculation: 'Series anuales históricas.'
        }
    },
    'trends-seasonality': {
        mode: 'real',
        label: 'Estacionalidad Real',
        realInfo: {
            source: 'CEAD (combined_historical.csv)',
            calculation: 'Promedio mensual histórico (2005-2024).'
        }
    },
    'trends-composition': {
        mode: 'mixed',
        label: 'Composición',
        realInfo: {
            source: 'CEAD',
            calculation: 'Datos históricos disponibles.'
        },
        mockInfo: {
            requiredInput: 'Visualización Avanzada',
            potentialSource: 'Gráfico en desarrollo.'
        }
    },
    'trends-heatmap': {
        mode: 'real',
        realInfo: {
            source: 'STOP (stop_data.csv)',
            calculation: 'Matriz dia/hora calculada de datos reales.'
        }
    },

    // --- PROYECCIÓN (Forecasting.tsx) ---
    'forecasting-header': {
        mode: 'real',
        label: 'Modelo Predictivo',
        realInfo: {
            source: 'STOP (stop_data.csv)',
            calculation: 'Regresión Lineal sobre datos históricos reales.'
        }
    },

    // --- DEMOGRAFÍA (DemographicAnalysis.tsx) ---
    'demographics-header': {
        mode: 'real',
        label: 'Correlación',
        realInfo: {
            source: 'INE & STOP',
            calculation: 'Cruce de tasas delictuales (STOP) con variables censales (INE).'
        }
    },

    // --- ESTACIONALIDAD (Seasonality.tsx) ---
    'seasonality-header': {
        mode: 'real',
        label: 'Análisis Mensual',
        realInfo: {
            source: 'CEAD (combined_historical.csv)',
            calculation: 'Perfiles mensuales históricos.'
        }
    },

    // --- AI PROJECTIONS (AIProjections.tsx) ---
    'ai-lab-header': {
        mode: 'mock',
        label: 'Simulador IA',
        mockInfo: {
            requiredInput: 'Modelo de Elasticidad',
            potentialSource: 'Simulación de escenarios What-If.'
        }
    },
    'ai-config': {
        mode: 'mock',
        mockInfo: {
            requiredInput: 'Parámetros Usuario',
            potentialSource: 'Inputs de control para simulación.'
        }
    },
    'ai-projection-chart': {
        mode: 'mock',
        mockInfo: {
            requiredInput: 'Modelo Predictivo',
            potentialSource: 'Proyección simulada basada en parámetros.'
        }
    },

    // --- EVALUADOR IMPACTO ---
    'impact-evaluator-header': {
        mode: 'real',
        label: 'Auditoría Ex-Post',
        realInfo: {
            source: 'STOP (stop_data.csv)',
            calculation: 'Comparación de promedios pre/post intervención en serie real.'
        }
    }
};
