import { DataSourceIndicator } from './DataSourceIndicator';
import { DATA_SOURCES } from '../../data/dataSourceConfig';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: React.ReactNode;
    action?: React.ReactNode;
    dataMode?: 'real' | 'mock' | 'mixed';
    dataSourceId?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, action, dataMode, dataSourceId }) => {

    // Determine configuration based on dataSourceId or fallback to dataMode
    const config = dataSourceId ? DATA_SOURCES[dataSourceId] : null;

    // effectiveMode: config > prop
    const mode = config ? config.mode : dataMode;

    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
            {(title || action || mode) && (
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {title && <h3 className="text-lg font-semibold text-institutional-blue flex items-center">{title}</h3>}
                        {mode && (
                            <DataSourceIndicator dataSourceId={dataSourceId} fallbackMode={mode} />
                        )}
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className="p-6">
                {children}
            </div>
        </div>
    );
};
