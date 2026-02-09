import React, { useEffect, useRef, useState } from 'react';
import { Map, Marker, NavigationControl } from 'maplibre-gl';
import { 
  Globe, 
  Grid,
  Activity,
} from 'lucide-react';
import { CHICAGO_LOOP_CENTER, MOCK_BUILDINGS } from '../constants';

interface TwinCityMapProps {
  onBuildingClick: (item: any) => void;
  overlayType: 'NONE' | 'SAFETY' | 'COMMERCE';
  highlightedIds?: string[];
  groundedPoints?: any[];
}

// Simplified MapMode type
type MapMode = 'SATELLITE';
type CategoryFilter = 'ALL' | 'RESIDENTIAL' | 'LANDMARK' | 'SIGHTSEEING';

const TwinCityMap: React.FC<TwinCityMapProps> = ({ 
  onBuildingClick, 
  overlayType, 
  highlightedIds = [],
  groundedPoints = [] 
}) => {
  const mapRef = useRef<Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Record<string, Marker>>({});
  
  // Default and only mode is SATELLITE
  const [mapMode, setMapMode] = useState<MapMode>('SATELLITE');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('ALL');
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const timer = setTimeout(() => {
      if (!isMapLoaded) {
        console.log('Map failed to load, showing fallback');
        setIsMapLoaded(true);
        setShowFallback(true);
      }
    }, 5000);

    try {
      const map = new Map({
        container: containerRef.current,
        style: {
          version: 8,
          sources: {
            'satellite-tiles': {
              type: 'raster',
              tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
              tileSize: 256,
              attribution: '&copy; Esri'
            }
          },
          layers: [
            {
              id: 'satellite-base',
              type: 'raster',
              source: 'satellite-tiles',
              layout: { visibility: 'visible' }, // Always visible
              paint: { 'raster-opacity': 1.0 }   // Full opacity
            }
          ]
        },
        center: [CHICAGO_LOOP_CENTER.lng, CHICAGO_LOOP_CENTER.lat],
        zoom: 15.5,
        pitch: 60,
        bearing: -20,
        attributionControl: false,
      });

      map.on('load', () => {
        clearTimeout(timer);
        setIsMapLoaded(true);
        setShowFallback(false);
      });

      map.on('error', () => {
        setIsMapLoaded(true);
        setShowFallback(true);
      });

      map.addControl(new NavigationControl({ showCompass: true }), 'top-right');
      mapRef.current = map;
    } catch (err: any) {
      setIsMapLoaded(true);
      setShowFallback(true);
    }

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Removed the mode switching useEffect since we only have one mode now.

  // --- 核心修复：渲染 Markers ---
  useEffect(() => {
    if (!mapRef.current || showFallback) return;

    // 1. 清除旧 Markers
    Object.keys(markersRef.current).forEach(id => {
      markersRef.current[id].remove();
    });
    markersRef.current = {};

    // 2. 渲染静态建筑物
    MOCK_BUILDINGS.forEach(b => {
      if (activeCategory !== 'ALL' && b.category !== activeCategory) return;
      const isActive = highlightedIds.includes(b.id);
      const isListing = b.id.includes('listing');
      const isSightseeing = b.category === 'SIGHTSEEING';
      
      let color = '#3b82f6'; // 默认蓝色
      if (isListing) color = '#10b981'; // 绿色 - 房源
      if (isSightseeing) color = '#f59e0b'; // 橙色 - 景点
      if (b.id === 'listing-002') color = '#8b5cf6'; // 紫色

      createMarker(b, b.coordinates.lng, b.coordinates.lat, color, isActive, false);
    });

    // 3. 渲染搜索结果点
    if (groundedPoints.length > 0) {
      const uniquePoints = groundedPoints.filter((point, index, self) => 
        index === self.findIndex(p => p.id === point.id)
      );
      
      uniquePoints.forEach((point, index) => {
        if (point.lng && point.lat) {
          // 搜索结果固定使用高亮洋红色 (Satellite visible color)
          const searchColor = '#ff0066'; 
          createMarker(point, point.lng, point.lat, searchColor, true, true);
        }
      });

      const latestPoint = groundedPoints[groundedPoints.length - 1];
      if (mapRef.current && latestPoint.lng && latestPoint.lat) {
        mapRef.current.flyTo({
          center: [latestPoint.lng, latestPoint.lat],
          zoom: 16,
          essential: true,
          speed: 1.2
        });
      }
    }

  }, [highlightedIds, activeCategory, isMapLoaded, showFallback, groundedPoints, mapMode]);

  const createMarker = (item: any, lng: number, lat: number, color: string, isActive: boolean, isSearchPoint: boolean) => {
    const el = document.createElement('div');
    el.className = 'w-0 h-0 flex items-center justify-center visible';

    const pulseDuration = isSearchPoint ? '1s' : '3s';
    const scaleClass = isActive ? 'scale-150' : 'scale-100';

    const pulseRings = `
      <div class="absolute inset-0 rounded-full border opacity-40 animate-ping"
           style="border-color: ${color}; animation-duration: ${pulseDuration}; animation-delay: 0s;
                  box-shadow: 0 0 20px ${color}, 0 0 40px ${color}, inset 0 0 20px ${color};"></div>
      <div class="absolute inset-2 rounded-full border opacity-60 animate-ping"
           style="border-color: ${color}; animation-duration: ${pulseDuration}; animation-delay: 0.3s;
                  box-shadow: 0 0 15px ${color}, 0 0 30px ${color}, inset 0 0 15px ${color};"></div>
      <div class="absolute inset-4 rounded-full border opacity-80 animate-ping"
           style="border-color: ${color}; animation-duration: ${pulseDuration}; animation-delay: 0.6s;
                  box-shadow: 0 0 10px ${color}, 0 0 20px ${color}, inset 0 0 10px ${color};"></div>
    `;

    const coreLight = `
      <div class="relative w-4 h-4 rounded-full flex items-center justify-center ${scaleClass} transition-all duration-300"
           style="background: radial-gradient(circle, ${color} 0%, ${color}88 70%, transparent 100%);
                  box-shadow: 0 0 30px ${color}, 0 0 60px ${color}, 0 0 90px ${color}, inset 0 0 10px rgba(255,255,255,0.5);
                  animation: breathing 2s ease-in-out infinite;">
          <div class="w-2 h-2 bg-white rounded-full shadow-inner animate-pulse"></div>
      </div>
    `;

    const particles = isActive ? `
      <div class="absolute inset-0 animate-spin" style="animation-duration: 8s;">
        ${Array.from({length: 6}).map((_, i) => `
          <div class="absolute w-1 h-1 rounded-full"
               style="background-color: ${color};
                      top: ${50 + 40 * Math.sin((i * 60) * Math.PI / 180)}%;
                      left: ${50 + 40 * Math.cos((i * 60) * Math.PI / 180)}%;
                      box-shadow: 0 0 5px ${color};
                      animation: particle-float 3s ease-in-out infinite;
                      animation-delay: ${i * 0.2}s;"></div>
        `).join('')}
      </div>
    ` : '';

    const label = `
      <div class="absolute top-10 left-1/2 -translate-x-1/2 px-3 py-2 rounded-xl bg-gradient-to-br from-black/95 to-black/80 border text-white text-[11px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 z-50 pointer-events-none ${isActive ? 'opacity-100' : ''} shadow-2xl backdrop-blur-sm"
           style="border-color: ${color}; box-shadow: 0 0 30px ${color}, 0 0 60px rgba(0,0,0,0.8); backdrop-filter: blur(10px);">
        <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45" style="background-color: ${color};"></div>
        ${item.label || item.name}
      </div>
    `;

    el.innerHTML = `
      <style>
        @keyframes breathing {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes particle-float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 1; }
          50% { transform: translateY(-10px) scale(1.2); opacity: 0.6; }
        }
        .animate-ping {
          animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
        }
      </style>
      <div class="relative flex items-center justify-center w-12 h-12 group cursor-pointer" style="transform: translate(0, 0); will-change: transform;">
        ${pulseRings}
        ${coreLight}
        ${particles}
        ${label}
      </div>
    `;

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      onBuildingClick(item);
    });

    try {
      const marker = new Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(mapRef.current!);
      const markerId = item.id || `temp-${Math.random()}`;
      markersRef.current[markerId] = marker;
    } catch (err) {
      console.error('Error creating marker:', err);
    }
  };

  return (
    <div className="relative w-full h-full bg-[#020617] overflow-hidden">
      {!isMapLoaded && !showFallback && (
        <div className="absolute inset-0 z-[100] bg-[#020617] flex flex-col items-center justify-center">
           <Activity size={32} className="text-blue-500 animate-pulse mb-4" />
           <p className="text-blue-400 font-mono text-xs uppercase tracking-widest">Initializing Satellite Link...</p>
        </div>
      )}

      {showFallback && (
        <div className="absolute inset-0 z-0 bg-[#020617] flex items-center justify-center overflow-hidden">
          <div className="relative w-full h-full max-w-4xl max-h-[80vh] border border-blue-500/20 rounded-[3rem] bg-blue-500/5 backdrop-blur-3xl m-10 relative">
             <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <Grid size={300} className="text-blue-500" />
             </div>
             {MOCK_BUILDINGS.map((b, i) => (
                <div key={b.id} className="absolute w-3 h-3 bg-blue-500 rounded-full" style={{ left: `${20 + (i*15)}%`, top: `${30 + (i%3)*20}%` }} title={b.name} />
             ))}
             {groundedPoints.map((p, i) => (
                <div key={p.id} className="absolute flex flex-col items-center" style={{ left: '50%', top: '50%', transform: `translate(${i * 20}px, ${i * 20}px)` }}>
                   <div className="w-4 h-4 bg-red-500 rounded-full animate-bounce shadow-[0_0_20px_red]"></div>
                   <span className="text-xs text-red-400 font-mono bg-black/80 px-2 mt-1">{p.label}</span>
                </div>
             ))}
             <div className="absolute bottom-10 left-10 text-white/40 font-mono text-xs">System: Fallback Schematic Mode Active</div>
          </div>
        </div>
      )}

      <div ref={containerRef} className={`absolute inset-0 z-20 transition-opacity duration-1000 ${showFallback ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} />
      
      {/* 调试层 */}
      {!showFallback && isMapLoaded && groundedPoints.length > 0 && (
        <div className="absolute inset-0 z-25 pointer-events-none">
          {groundedPoints.map((point) => {
            if (!mapRef.current) return null;
            try {
              const pixel = mapRef.current.project([point.lng, point.lat]);
              const color = '#ff0066'; // Satellite high-vis color

              return (
                <div
                  key={`debug-${point.id}`}
                  className="absolute w-12 h-12 pointer-events-auto cursor-pointer flex items-center justify-center group"
                  style={{
                    left: pixel.x - 24,
                    top: pixel.y - 24,
                    zIndex: 1000
                  }}
                  onClick={() => onBuildingClick(point)}
                  title={point.label}
                >
                   <div className="absolute inset-0 rounded-full border-2 opacity-40 animate-ping"
                    style={{ borderColor: color, boxShadow: `0 0 20px ${color}, 0 0 40px ${color}`, animationDuration: '1s' }} />
                   <div className="absolute inset-2 rounded-full border opacity-60 animate-ping"
                    style={{ borderColor: color, boxShadow: `0 0 15px ${color}, 0 0 30px ${color}`, animationDuration: '1s', animationDelay: '0.3s' }} />
                   <div className="relative w-4 h-4 rounded-full flex items-center justify-center animate-breathing"
                    style={{ background: `radial-gradient(circle, ${color} 0%, ${color}88 70%, transparent 100%)`, boxShadow: `0 0 30px ${color}, 0 0 60px ${color}, inset 0 0 10px rgba(255,255,255,0.5)` }}>
                    <div className="w-2 h-2 bg-white rounded-full shadow-inner animate-pulse" />
                  </div>
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 px-3 py-2 rounded-xl bg-black/95 border text-white text-xs font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ borderColor: color, backdropFilter: 'blur(10px)' }}>
                    {point.label}
                  </div>
                </div>
              );
            } catch (e) {
              return null;
            }
          })}
        </div>
      )}

      <div className="absolute inset-0 z-30 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/90 to-transparent flex items-center justify-between px-10">
           <div className="flex items-center gap-3">
              <Globe size={16} className="text-blue-500" />
              <span className="text-[10px] font-mono text-white/60 uppercase tracking-[0.3em] font-bold">CHICAGO_LOOP_OS</span>
           </div>
        </div>

        <div className="absolute top-24 left-8 p-6 glass-panel rounded-[2rem] border border-white/10 pointer-events-auto flex flex-col gap-6 min-w-[280px] shadow-2xl">
          {/* 只保留 Satellite Mode 指示器，移除其他按钮 */}
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: 'SATELLITE', icon: Globe, label: 'Satellite' },
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => setMapMode(mode.id as MapMode)}
                className={`flex items-center justify-center gap-3 p-3 rounded-2xl border transition-all 
                  bg-blue-600/30 border-blue-500/50 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]`}
              >
                <mode.icon size={14} />
                <span className="text-[9px] font-bold uppercase">{mode.label} MODE ACTIVE</span>
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => {
              console.log('Force re-rendering markers...');
            }}
            className="px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-[10px] text-red-400 hover:bg-red-500/30"
          >
            刷新地图
          </button>
          
          <div className="space-y-2">
             <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] px-1">Layers</span>
             <div className="grid grid-cols-2 gap-2">
                {['ALL', 'RESIDENTIAL', 'LANDMARK', 'SIGHTSEEING'].map(filter => (
                  <button key={filter} onClick={() => setActiveCategory(filter as CategoryFilter)} className={`px-3 py-2 rounded-xl border text-[9px] font-bold uppercase ${activeCategory === filter ? 'bg-white/10 border-white/20 text-white' : 'border-transparent text-white/30'}`}>
                    {filter}
                  </button>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwinCityMap;
