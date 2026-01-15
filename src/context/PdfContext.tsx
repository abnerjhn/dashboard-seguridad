import React, { createContext, useContext } from 'react';

export interface PdfGeneratorContextType {
    startGeneration: () => void;
    isGenerating: boolean;
    progress: number;
    currentAction: string;
}

export const PdfGeneratorContext = createContext<PdfGeneratorContextType | undefined>(undefined);

export const usePdfGenerator = () => {
    const context = useContext(PdfGeneratorContext);
    if (!context) throw new Error("usePdfGenerator must be used within PdfGeneratorProvider");
    return context;
};
