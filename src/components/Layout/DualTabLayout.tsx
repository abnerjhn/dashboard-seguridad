import React, { type ReactNode } from 'react';
import { Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePrintPreferences } from '../../context/PrintPreferencesContext';

interface DualTabLayoutProps {
    pageId: string; // Unique ID for storage
    title: string;
    children: ReactNode; // The content to render
    className?: string;
}

export const DualTabLayout: React.FC<DualTabLayoutProps> = ({ pageId, children, className }) => {
    const navigate = useNavigate();
    const { isPrinting } = usePrintPreferences();

    const handleExport = () => {
        navigate(`/print-wizard?pageId=${pageId}`);
    };

    return (
        <div className={`space-y-4 ${className || ''} relative pb-16`}>
            {/* Content Area */}
            <div className="min-h-[500px] animate-in fade-in duration-300">
                {children}
            </div>

            {/* Floating Export Button */}
            {!isPrinting && (
                <div className="fixed bottom-6 right-6 z-50">
                    <button
                        onClick={handleExport}
                        className="flex items-center space-x-2 bg-slate-900 text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                    >
                        <Printer className="w-5 h-5" />
                        <span>Exportar PDF</span>
                    </button>
                </div>
            )}
        </div>
    );
};
