export interface PageSettings {
    orientation: 'portrait' | 'landscape';
    fitToPage: boolean;
    scale?: number;
    maximize?: boolean;
}

export interface SavedConfig {
    id: string; // Timestamp as ID
    date: string; // Human readable date label
    settings: Record<string, PageSettings>; // Map of pageId -> settings
}

const STORAGE_KEY = 'print_wizard_configs';

export const persistPreferences = {
    saveConfig: (settings: Record<string, PageSettings>) => {
        try {
            const now = new Date();
            const newConfig: SavedConfig = {
                id: now.getTime().toString(),
                date: now.toLocaleString('es-CL'),
                settings: settings
            };

            const existing = persistPreferences.getConfigs();
            // Keep last 5 configs to avoid bloating storage
            const updated = [newConfig, ...existing].slice(0, 5);

            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return true;
        } catch (e) {
            console.error("Failed to save config", e);
            return false;
        }
    },

    getConfigs: (): SavedConfig[] => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return [];
            return JSON.parse(stored);
        } catch (e) {
            console.error("Failed to load configs", e);
            return [];
        }
    }
};
