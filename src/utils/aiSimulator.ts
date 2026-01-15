import type { LeyStopData } from '../types/index';

export const generateInsights = (data: LeyStopData[]) => {
    const insights: { type: 'positive' | 'negative' | 'neutral'; text: string }[] = [];

    // Filter for relevant data (e.g., current week if filtered beforehand, or aggregate)
    // Assuming 'data' passed here is already filtered for the specific context

    const violenceCrimes = data.find(d => d.Categoria.toLowerCase().includes('violencia'));
    const totalCasos = data.reduce((sum, d) => sum + (d.Casos || 0), 0);
    const totalPrev = data.reduce((sum, d) => sum + (d.Casos_previos_anio || 0), 0);

    // Rule 1: Violent Crimes Spike
    if (violenceCrimes && violenceCrimes.Variacion_porcentual > 15) {
        insights.push({
            type: 'negative',
            text: `ALERTA CRÍTICA: Se ha detectado un aumento significativo (${violenceCrimes.Variacion_porcentual}%) en delitos violentos respecto al año anterior. Se sugiere reforzar patrullaje en zonas críticas.`
        });
    }

    // Rule 2: Overall Reduction
    if (totalCasos < totalPrev) {
        const reduction = ((totalPrev - totalCasos) / totalPrev * 100).toFixed(1);
        insights.push({
            type: 'positive',
            text: `TENDENCIA POSITIVA: Reducción global del ${reduction}% en casos policiales comparado con la misma semana del año anterior. Las estrategias de prevención muestran efectividad.`
        });
    } else if (totalCasos > totalPrev) {
        const increase = ((totalCasos - totalPrev) / totalPrev * 100).toFixed(1);
        insights.push({
            type: 'negative',
            text: `ATENCIÓN: Incremento general del ${increase}% en la actividad delictual. Se recomienda revisar la distribución de recursos preventivos.`
        });
    }

    // Fallback
    if (insights.length === 0) {
        insights.push({
            type: 'neutral',
            text: "La actividad delictual se mantiene estable dentro de los rangos esperados para esta época del año."
        });
    }

    return insights;
};
