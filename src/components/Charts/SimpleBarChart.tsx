import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SimpleBarChartProps {
    data: any[];
    xKey: string;
    yKey: string;
    color?: string;
    height?: number;
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({
    data,
    xKey,
    yKey,
    color = '#1a237e',
    height = 300
}) => {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" hide />
                <YAxis
                    type="category"
                    dataKey={xKey}
                    width={150}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey={yKey} fill={color} radius={[0, 4, 4, 0]}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry[yKey] > 10 ? '#ff6f00' : '#1a237e'} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};
