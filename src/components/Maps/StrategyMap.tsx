import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useOutletContext } from 'react-router-dom';
import { type DashboardContextType } from '../Layout/Layout';
import type { HistoricalDataItem, DemographicsMap } from '../../utils/dataLoader';
import L from 'leaflet';

// Fix leaflet icons
// import icon from 'leaflet/dist/images/marker-icon.png';
// import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// let DefaultIcon = L.icon({
//     iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png', // Use CDN temporarily or comment out
//     shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
//     iconSize: [25, 41],
//     iconAnchor: [12, 41]
// });

// L.Marker.prototype.options.icon = DefaultIcon;

interface StrategyMapProps {
    historicalData: HistoricalDataItem[];
    demographics: DemographicsMap;
    selectedComuna: string;
    onSelectComuna: (comuna: string) => void;
}

const StrategyMap: React.FC<StrategyMapProps> = ({ historicalData, demographics, selectedComuna, onSelectComuna }) => {
    // const { globalState } = useOutletContext<DashboardContextType>(); // Removed: Context not available here
    const [geoJsonData, setGeoJsonData] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'total' | 'rate'>('rate'); // Default to Rate

    // 1. Load GeoJSON (Partitioned)
    useEffect(() => {
        const loadPartitionedGeo = async () => {
            try {
                // comunas.json (160MB) split into approx 4 parts
                const parts = 4;
                const promises = [];

                for (let i = 1; i <= parts; i++) {
                    promises.push(fetch(`/data/geo/comunas_part${i}.json`).then(res => {
                        if (!res.ok) throw new Error(`Missing part ${i}`);
                        return res.text();
                    }));
                }

                const chunks = await Promise.all(promises);
                const fullText = chunks.join('');
                if (!fullText) throw new Error("Empty data");

                setGeoJsonData(JSON.parse(fullText));
            } catch (err) {
                console.warn("Failed to load partitioned geo data, trying single file fallback...", err);
                fetch('/data/geo/comunas.json')
                    .then(res => res.json())
                    .then(data => setGeoJsonData(data))
                    .catch(e => console.error("Failed to load map data (fallback)", e));
            }
        };

        loadPartitionedGeo();
    }, []);

    // 2. Aggregate Data for Coloring
    const mapStats = useMemo(() => {
        const stats: Record<number, { count: number; rate: number; pop: number }> = {};
        if (!historicalData || !historicalData.length) return stats;

        // Sum crimes per comuna (latest year)
        // Avoid spread operator on large arrays to prevent stack overflow
        const latestYear = historicalData.reduce((max, d) => (d.anio > max ? d.anio : max), 0);

        // Temp aggregators
        const counts: Record<number, number> = {};

        historicalData.forEach(d => {
            if (d.anio === latestYear) {
                const sum = d.meses ? d.meses.reduce((a, b) => a + b, 0) : 0;
                counts[d.codcom] = (counts[d.codcom] || 0) + sum;
            }
        });

        // Calculate Rates and enrich with demographics
        Object.keys(counts).forEach(key => {
            const cod = parseInt(key);
            const count = counts[cod];
            const popStr = String(cod); // demographics keys are strings
            const pop = demographics && demographics[popStr] ? demographics[popStr].population : 0;

            // Rate per 100,000 inhabitants
            const rate = pop > 0 ? (count / pop) * 100000 : 0;

            stats[cod] = { count, rate, pop };
        });

        return stats;
    }, [historicalData, demographics]);

    // Calculate Max for Scaling
    const maxVal = useMemo(() => {
        const values = Object.values(mapStats).map(s => viewMode === 'total' ? s.count : s.rate);
        return Math.max(...values, 1);
    }, [mapStats, viewMode]);

    // 3. Style Function
    const style = (feature: any) => {
        const cod = feature.properties.cod_comuna;
        const stat = mapStats[cod] || { count: 0, rate: 0, pop: 0 };
        const val = viewMode === 'total' ? stat.count : stat.rate;
        const normalized = val / maxVal;

        // Color scale: Green to Red
        const getColor = (d: number) => {
            return d > 0.8 ? '#800026' :
                d > 0.6 ? '#BD0026' :
                    d > 0.4 ? '#E31A1C' :
                        d > 0.2 ? '#FC4E2A' :
                            d > 0.05 ? '#FD8D3C' :
                                '#FFEDA0';
        };

        const isSelected = selectedComuna === feature.properties.Comuna;

        return {
            fillColor: getColor(normalized),
            weight: isSelected ? 3 : 1,
            opacity: 1,
            color: isSelected ? 'cyan' : 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    };

    const onEachFeature = (feature: any, layer: any) => {
        const name = feature.properties.Comuna;
        const cod = feature.properties.cod_comuna;
        const stat = mapStats[cod] || { count: 0, rate: 0, pop: 0 };

        layer.bindTooltip(`
            <div class="text-sm min-w-[150px]">
                <div class="font-bold border-b border-gray-400 mb-1 pb-1">${name}</div>
                <div class="flex justify-between"><span>Delitos:</span> <b>${stat.count.toLocaleString()}</b></div>
                ${stat.pop > 0 ? `<div class="flex justify-between"><span>Población:</span> <span>${stat.pop.toLocaleString()}</span></div>` : ''}
                ${stat.pop > 0 ? `<div class="flex justify-between text-blue-300 mt-1 pt-1 border-t border-gray-500"><span>Tasa:</span> <b>${stat.rate.toFixed(1)}</b></div>` : ''}
                ${stat.pop > 0 ? `<div class="text-[10px] text-gray-400 text-right">x 100k hab.</div>` : ''}
            </div>
        `, { sticky: true });

        layer.on({
            click: () => {
                console.log("Clicked Comuna:", name);
                onSelectComuna(name);
            },
            mouseover: (e: any) => {
                const layer = e.target;
                layer.setStyle({
                    weight: 3,
                    color: '#666',
                    dashArray: '',
                    fillOpacity: 0.7
                });
                layer.bringToFront();
            },
            mouseout: (e: any) => {
                // Determine if this layer is currently selected
                // Note: we can't easily access latest 'selectedComuna' prop inside this closure if it's stale, 
                // but checking feature propery against prop passed to style is usually handled by re-render.
                // Here we just reset to default style logic.
                const isSelected = selectedComuna === feature.properties.Comuna;
                // StrategyMap re-renders when selectedComuna changes, so style() is called again.
                // But mouseout might override. We should just resetStyle or manually apply style().
                // Simple reset:
                layer.setStyle({
                    weight: isSelected ? 3 : 1,
                    color: isSelected ? 'cyan' : 'white',
                    dashArray: '3',
                    fillOpacity: 0.7
                });
            }
        });
    };

    if (!geoJsonData) return <div className="h-full flex items-center justify-center text-white">Cargando Mapa...</div>;

    return (
        <div className="relative h-full w-full">
            {/* View Mode Toggle */}
            <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-1 flex space-x-1 border border-gray-200">
                <button
                    onClick={() => setViewMode('rate')}
                    className={`px-3 py-1 text-xs font-bold rounded transition-colors ${viewMode === 'rate' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    Tasa (x 100k)
                </button>
                <button
                    onClick={() => setViewMode('total')}
                    className={`px-3 py-1 text-xs font-bold rounded transition-colors ${viewMode === 'total' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    Total Delitos
                </button>
            </div>

            <MapContainer center={[-33.4489, -70.6693]} zoom={8} className="h-full w-full rounded-lg" style={{ background: '#1a1a1a' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <GeoJSON
                    key={`${viewMode}-${selectedComuna}`} // Force re-render on mode/selection change to update styles properly
                    data={geoJsonData}
                    style={style}
                    onEachFeature={onEachFeature}
                />
            </MapContainer>
        </div>
    );
};

export default StrategyMap;
