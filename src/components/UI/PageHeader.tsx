import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { DataSourceIndicator } from './DataSourceIndicator';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    icon?: LucideIcon;
    sourceName?: string;
    dataSourceId?: string;
    className?: string;
    children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    subtitle,
    icon: Icon,
    sourceName = "CEAD (Min. Interior)",
    dataSourceId,
    className,
    children
}) => {
    return (
        <div className={`flex justify-between items-end border-b-2 border-slate-900 pb-4 mb-6 ${className || ''}`}>
            <div>
                <div className="flex items-center space-x-2">
                    {Icon && <Icon className="text-orange-600 w-6 h-6" />}
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center">
                        {title}
                        {dataSourceId && <DataSourceIndicator dataSourceId={dataSourceId} className="ml-2" />}
                    </h2>
                </div>
                {subtitle && <p className="text-gray-500 font-medium ml-8">{subtitle}</p>}
            </div>

            <div className="flex items-end gap-4">
                {children}

                <div className="text-right hidden sm:block">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1">FUENTE OFICIAL</p>
                    <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-xs font-bold border border-gray-200 shadow-sm">
                        {sourceName}
                    </div>
                </div>
            </div>
        </div>
    );
};
