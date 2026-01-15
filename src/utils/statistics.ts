
export interface Point {
    x: number;
    y: number;
}

export interface RegressionResult {
    slope: number;
    intercept: number;
    r2: number;
    predict: (x: number) => number;
}

export const calculateLinearRegression = (data: Point[]): RegressionResult => {
    const n = data.length;
    if (n === 0) return { slope: 0, intercept: 0, r2: 0, predict: () => 0 };

    const sumX = data.reduce((acc, p) => acc + p.x, 0);
    const sumY = data.reduce((acc, p) => acc + p.y, 0);
    const sumXY = data.reduce((acc, p) => acc + (p.x * p.y), 0);
    const sumXX = data.reduce((acc, p) => acc + (p.x * p.x), 0);
    const sumYY = data.reduce((acc, p) => acc + (p.y * p.y), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const predict = (x: number) => slope * x + intercept;

    // R2 Calculation
    const ssTot = data.reduce((acc, p) => acc + Math.pow(p.y - (sumY / n), 2), 0);
    const ssRes = data.reduce((acc, p) => acc + Math.pow(p.y - predict(p.x), 2), 0);
    const r2 = 1 - (ssRes / ssTot);

    return { slope, intercept, r2, predict };
};

export const calculateCorrelation = (x: number[], y: number[]): number => {
    const n = x.length;
    if (n !== y.length || n === 0) return 0;

    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;

    const numerator = x.reduce((acc, val, i) => acc + (val - meanX) * (y[i] - meanY), 0);
    const denomX = Math.sqrt(x.reduce((acc, val) => acc + Math.pow(val - meanX, 2), 0));
    const denomY = Math.sqrt(y.reduce((acc, val) => acc + Math.pow(val - meanY, 2), 0));

    if (denomX === 0 || denomY === 0) return 0;
    return numerator / (denomX * denomY);
};
