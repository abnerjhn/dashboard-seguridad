import React from 'react';
import { ChevronDown, Calendar } from 'lucide-react';
import { getWeekDateRange } from '../../utils/dateUtils';
import { DataSourceIndicator } from './DataSourceIndicator';

interface WeekSelectorProps {
    selectedWeek: number;
    maxWeek: number;
    year: number;
    onSelectWeek: (week: number) => void;
    className?: string;
}

export const WeekSelector: React.FC<WeekSelectorProps> = ({
    selectedWeek,
    maxWeek,
    year,
    onSelectWeek,
    className
}) => {
    // Generate week options in reverse order (newest first)
    const weekOptions = Array.from({ length: maxWeek }, (_, i) => maxWeek - i);

    return (
        <div className={`relative group ${className || ''}`}>
            <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1 flex items-center gap-2">
                Periodo Analizado
                <DataSourceIndicator dataSourceId="portada-periodo" fallbackMode="real" className="ml-2" />
            </div>

            <div className="relative inline-block">
                <select
                    value={selectedWeek}
                    onChange={(e) => onSelectWeek(parseInt(e.target.value))}
                    className="appearance-none bg-transparent text-4xl font-bold text-gray-800 pr-8 focus:outline-none cursor-pointer hover:text-institutional-blue transition-colors w-full"
                >
                    {weekOptions.map(w => (
                        <option key={w} value={w} className="text-base font-medium">Semana {w}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none" />
            </div>

            <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                {getWeekDateRange(selectedWeek, year)}
            </p>
        </div>
    );
};
