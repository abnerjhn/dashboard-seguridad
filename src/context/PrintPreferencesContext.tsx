import React, { createContext, useContext, useState, useEffect } from 'react';

export type Orientation = 'portrait' | 'landscape';

export interface PagePrintSettings {
    orientation: Orientation;
    fitToPage: boolean;
    scale?: number;
    maximize?: boolean; // New property
}

interface PrintPreferencesContextType {
    getSettings: (pageId: string) => PagePrintSettings;
    updateSettings: (pageId: string, settings: Partial<PagePrintSettings>) => void;
    setAllSettings: (settings: Record<string, PagePrintSettings>) => void;
    hasSavedSettings: (pageId: string) => boolean;
    isPrinting: boolean;
    setPrinting: (printing: boolean) => void;
}

export const PrintPreferencesContext = createContext<PrintPreferencesContextType | undefined>(undefined);

const DEFAULT_SETTINGS: PagePrintSettings = {
    orientation: 'portrait',
    fitToPage: false,
    scale: 1,
    maximize: false,
};

export const PrintPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [preferences, setPreferences] = useState<Record<string, PagePrintSettings>>({});
    const [loaded, setLoaded] = useState(false);
    const [isPrinting, setPrinting] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem('print_preferences');
            if (saved) {
                setPreferences(JSON.parse(saved));
            }
        } catch (e) {
            console.error("Failed to load print preferences", e);
        } finally {
            setLoaded(true);
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        if (loaded) {
            localStorage.setItem('print_preferences', JSON.stringify(preferences));
        }
    }, [preferences, loaded]);

    const getSettings = React.useCallback((pageId: string) => {
        return preferences[pageId] || DEFAULT_SETTINGS;
    }, [preferences]);

    const updateSettings = React.useCallback((pageId: string, settings: Partial<PagePrintSettings>) => {
        setPreferences(prev => {
            // Optimization: check if actually changed to avoid re-renders if same
            const current = prev[pageId] || DEFAULT_SETTINGS;
            const hasChanges = Object.keys(settings).some(key => {
                const k = key as keyof PagePrintSettings;
                return settings[k] !== current[k];
            });

            if (!hasChanges) return prev;

            return {
                ...prev,
                [pageId]: {
                    ...current,
                    ...settings
                }
            };
        });
    }, []);

    const setAllSettings = React.useCallback((settings: Record<string, PagePrintSettings>) => {
        setPreferences(settings);
    }, []);

    const hasSavedSettings = React.useCallback((pageId: string) => {
        return !!preferences[pageId];
    }, [preferences]);

    return (
        <PrintPreferencesContext.Provider value={{ getSettings, updateSettings, setAllSettings, hasSavedSettings, isPrinting, setPrinting }}>
            {children}
        </PrintPreferencesContext.Provider>
    );
};

export const usePrintPreferences = () => {
    const context = useContext(PrintPreferencesContext);
    if (context === undefined) {
        throw new Error('usePrintPreferences must be used within a PrintPreferencesProvider');
    }
    return context;
};
