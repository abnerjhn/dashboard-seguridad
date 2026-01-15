import React, { useState } from 'react';
import { X, Info } from 'lucide-react';
import { DATA_SOURCES } from '../../data/dataSourceConfig';

interface DataSourceIndicatorProps {
    dataSourceId?: string;
    fallbackMode?: 'real' | 'mock' | 'mixed';
    className?: string; // For margin/padding adjustments
}

export const DataSourceIndicator: React.FC<DataSourceIndicatorProps> = ({
    dataSourceId,
    fallbackMode = 'mixed',
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);

    // Determine configuration based on dataSourceId or fallback
    const config = dataSourceId ? DATA_SOURCES[dataSourceId] : null;
    const mode = config ? config.mode : fallbackMode;

    const theme = {
        real: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', title: 'Datos Reales' },
        mock: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', title: 'Simulación / Datos de Prueba' },
        mixed: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', title: 'Datos Mixtos' }
    }[mode];

    const toggleModal = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering parent card clicks if any
        setIsOpen(!isOpen);
    };

    return (
        <>
            {/* The Trigger Icon */}
            <div
                className={`inline-flex items-center justify-center align-middle cursor-pointer hover:scale-110 transition-transform ${className}`}
                onClick={toggleModal}
                title="Haga clic para ver detalles del origen de datos"
            >
                <div className={`w-4 h-4 rounded-full ${theme.bg} flex items-center justify-center border ${theme.border}`}>
                    <span className={`text-[10px] font-bold ${theme.color}`}>?</span>
                </div>
            </div>

            {/* The Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsOpen(false)}>
                    <div
                        className="bg-white rounded-xl shadow-2xl w-full max-w-md relative overflow-hidden animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className={`px-6 py-4 flex justify-between items-center border-b ${theme.border} ${theme.bg}`}>
                            <div className="flex items-center space-x-2">
                                <Info className={`w-5 h-5 ${theme.color}`} />
                                <h3 className={`font-bold ${theme.color} text-lg`}>
                                    {config?.label || theme.title}
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-black/5 rounded-full transition-colors text-gray-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            {!config ? (
                                <p className="text-gray-600">
                                    Este componente utiliza <strong>{theme.title}</strong>.
                                    <br />No hay información detallada disponible para este elemento específico.
                                </p>
                            ) : (
                                <>
                                    {config.realInfo && (
                                        <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100">
                                            <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Datos Reales</h4>
                                            <div className="space-y-2 text-sm text-gray-700">
                                                <p>
                                                    <span className="font-semibold text-emerald-800">Fuente:</span><br />
                                                    {config.realInfo.source}
                                                </p>
                                                <p>
                                                    <span className="font-semibold text-emerald-800">Cálculo:</span><br />
                                                    {config.realInfo.calculation}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {config.mockInfo && (
                                        <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100">
                                            <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Simulación</h4>
                                            <div className="space-y-2 text-sm text-gray-700">
                                                <p>
                                                    <span className="font-semibold text-amber-800">Requerimiento:</span><br />
                                                    {config.mockInfo.requiredInput}
                                                </p>
                                                <p>
                                                    <span className="font-semibold text-amber-800">Fuente Potencial:</span><br />
                                                    {config.mockInfo.potentialSource}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-6 py-3 text-xs text-gray-400 text-center border-t border-gray-100">
                            Presione ESC o haga clic fuera para cerrar
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
