import React, { useState, useRef } from 'react';
import { toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';
import { usePrintPreferences, PrintPreferencesContext } from './PrintPreferencesContext';
import { PdfGeneratorContext } from './PdfContext';
import { REPORT_PAGES } from '../config/reportPages';

export const PdfGeneratorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentAction, setCurrentAction] = useState('');
    const [mountingPage, setMountingPage] = useState<any>(null); // The component currently being rendered for capture
    const captureRef = useRef<HTMLDivElement>(null);
    const { getSettings } = usePrintPreferences();

    const startGeneration = async () => {
        if (isGenerating) return;
        setIsGenerating(true);
        setProgress(0);

        try {
            const pdf = new jsPDF({
                unit: 'mm',
                format: 'a4', // Initial format, will vary per page
            });

            // Iterate through pages
            for (let i = 0; i < REPORT_PAGES.length; i++) {
                const pageDef = REPORT_PAGES[i];
                setCurrentAction(`Procesando: ${pageDef.title}`);
                setProgress(Math.round((i / REPORT_PAGES.length) * 100));

                const settings = getSettings(pageDef.id);
                // Mount the page
                setMountingPage({
                    component: pageDef.component,
                    settings: settings,
                    id: pageDef.id
                });

                // Wait for render (crucial: wait for charts to animate/render)
                // We use a promise-based delay. For charts, 1000-1500ms is usually safe.
                await new Promise(resolve => setTimeout(resolve, 2000));

                if (captureRef.current) {
                    const imgData = await toJpeg(captureRef.current, {
                        quality: 0.85,
                        backgroundColor: '#ffffff',
                        pixelRatio: 2, // High resolution
                        // Set dimensions explicitly to match the container/PDF size
                        width: settings.orientation === 'landscape' ? 1123 : 794,
                        height: settings.orientation === 'landscape' ? 794 : 1123,
                    });

                    // Page dimensions in mm (A4)
                    const isLandscape = settings.orientation === 'landscape';
                    const pageWidth = isLandscape ? 297 : 210;
                    const pageHeight = isLandscape ? 210 : 297;

                    if (i > 0) {
                        pdf.addPage([pageWidth, pageHeight], isLandscape ? 'landscape' : 'portrait');
                    } else {
                        // First page
                        // For now, let's just stick to standard A4 addImage logic.
                    }

                    pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
                }

                // Unmount
                setMountingPage(null);
                // Small GC pause?
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            setCurrentAction('Guardando archivo PDF...');
            pdf.save(`Reporte_Seguridad_${new Date().toISOString().split('T')[0]}.pdf`);

        } catch (error) {
            console.error("PDF Generation Error", error);
            alert("Hubo un error al generar el PDF.");
        } finally {
            setIsGenerating(false);
            setMountingPage(null);
            setProgress(0);
        }
    };

    return (
        <PdfGeneratorContext.Provider value={{ startGeneration, isGenerating, progress, currentAction }}>
            {children}

            {/* Hidden Capture Container */}
            {isGenerating && mountingPage && (
                <div
                    style={{
                        position: 'fixed',
                        left: '-9999px',
                        top: 0,
                        // Set explicit size based on orientation for html2canvas
                        width: mountingPage.settings.orientation === 'landscape' ? '297mm' : '210mm',
                        minHeight: mountingPage.settings.orientation === 'landscape' ? '210mm' : '297mm',
                        backgroundColor: 'white',
                        zIndex: -1,
                        // Ensure high resolution rasterization
                    }}
                >
                    <div ref={captureRef} style={{ padding: '10mm', height: '100%', boxSizing: 'border-box' }}>
                        {/* Render the component with forced Print Context */}
                        <PrintPreferencesContext.Provider value={{
                            getSettings,
                            updateSettings: () => { },
                            isPrinting: true,
                            setPrinting: () => { },
                            setAllSettings: () => { },
                            hasSavedSettings: () => false
                        }}>
                            <mountingPage.component />
                        </PrintPreferencesContext.Provider>
                    </div>
                </div>
            )}

            {/* Progress Modal */}
            {isGenerating && (
                <div className="fixed inset-0 z-[100] bg-slate-900/90 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                    <div className="w-96 text-center space-y-6 animate-in zoom-in-50 duration-300">
                        <div className="text-4xl animate-bounce">🖨️</div>
                        <div>
                            <h3 className="text-2xl font-bold mb-1">Generando PDF</h3>
                            <p className="text-gray-400 text-sm">{currentAction}</p>
                        </div>

                        <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden shadow-inner border border-slate-600">
                            <div
                                className="bg-orange-500 h-full transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-xs text-slate-500">Por favor espere, procesando imágenes...</p>
                    </div>
                </div>
            )}
        </PdfGeneratorContext.Provider>
    );
};
