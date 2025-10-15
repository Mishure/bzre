'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

import { Property } from '@/types/property';

interface WorkingMapProps {
  properties: Property[];
  height?: string;
  onPropertyClick?: (property: Property) => void;
  onBoundsChange?: (bounds: any) => void;
}

export default function WorkingMap({ properties, height = '100%', onPropertyClick, onBoundsChange }: WorkingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initializingRef = useRef(false);

  // Store markers in a ref to manage them efficiently
  const markersRef = useRef<any[]>([]);
  
  // Function to update markers on the map
  const updateMarkersForMap = async (map: any, propertiesToAdd: Property[]) => {
    const L = (await import('leaflet')).default;
    
    // Clear existing markers efficiently
    if (markersRef.current.length > 0) {
      markersRef.current.forEach(marker => {
        map.removeLayer(marker);
      });
      markersRef.current = [];
    }

    // Add new markers
    let markersAdded = 0;
    propertiesToAdd.forEach((property) => {
      if (property.latitude && property.longitude) {
        
        const colors: { [key: string]: string } = {
          APARTAMENT: '#3B82F6',
          CASA: '#10B981', 
          TEREN: '#F59E0B',
          SPATIU_COMERCIAL: '#8B5CF6',
        };
        
        const color = colors[property.propertyType] || '#6B7280';
        const symbol = property.operationType === 'INCHIRIERE' ? 'Î' : 'V';
        
        const icon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div class="map-marker" style="
              background-color: ${color};
              width: 24px;
              height: 24px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              color: white;
              font-weight: bold;
              cursor: pointer;
              transition: transform 0.2s;
            ">
              ${symbol}
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([property.latitude, property.longitude], { icon }).addTo(map);
        markersRef.current.push(marker);
        markersAdded++;

        const popupContent = `
          <div style="min-width: 200px; font-family: system-ui;">
            <h3 style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">${property.name}</h3>
            <div style="color: #059669; font-weight: bold; margin-bottom: 4px;">
              ${new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'EUR' }).format(property.price)}
            </div>
            <div style="color: #6b7280; font-size: 12px; margin-bottom: 2px;">${property.street}</div>
            <div style="color: #6b7280; font-size: 12px; margin-bottom: 8px;">${property.zone}</div>
            <div style="display: flex; justify-content: space-between; font-size: 12px;">
              <span>${property.rooms > 0 ? property.rooms + ' camere' : 'Teren/Spațiu'}</span>
              <span>${property.surface} m²</span>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          maxWidth: 300,
          autoPan: true,
          autoPanPadding: [50, 50]
        });

        // Add debounced click handler
        let isProcessingClick = false;
        marker.on('click', (e: any) => {
          // Prevent multiple rapid clicks
          if (isProcessingClick) return;
          isProcessingClick = true;
          
          // Prevent default behavior and stop propagation
          L.DomEvent.stopPropagation(e);
          
          // Get current zoom level
          const currentZoom = map.getZoom();
          
          // Only zoom if not already zoomed in
          if (currentZoom < 15) {
            // Zoom in and center on the clicked marker
            map.setView([property.latitude, property.longitude], 16, {
              animate: true,
              duration: 0.5
            });
          }
          
          // Open the popup
          marker.openPopup();
          
          // Call the property click handler if provided, with a small delay
          if (onPropertyClick) {
            setTimeout(() => {
              onPropertyClick(property);
            }, 100);
          }
          
          // Reset click processing flag
          setTimeout(() => {
            isProcessingClick = false;
          }, 500);
        });
      }
    });
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (mapInstanceRef.current) {
      return;
    }
    if (initializingRef.current) {
      return;
    }

    const initMap = async () => {
      if (!mapRef.current) return;

      // Clean up any existing map instance on the container
      if ((mapRef.current as any)._leaflet_id) {
        console.log('Found existing Leaflet ID, cleaning up container...');
        delete (mapRef.current as any)._leaflet_id;
        // Clear the container's HTML to ensure a clean slate
        mapRef.current.innerHTML = '';
      }

      initializingRef.current = true;
      
      try {
        // Dynamically import Leaflet to avoid SSR issues
        const L = (await import('leaflet')).default;

        // Load CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        if (!document.head.querySelector('link[href*="leaflet.css"]')) {
          document.head.appendChild(link);
          console.log('Added Leaflet CSS');
        }

        // Add custom CSS for marker hover effect
        if (!document.head.querySelector('style[data-map-markers]')) {
          const style = document.createElement('style');
          style.setAttribute('data-map-markers', 'true');
          style.textContent = `
            .map-marker:hover {
              transform: scale(1.2) !important;
            }
          `;
          document.head.appendChild(style);
        }

        // Fix default marker icons
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        console.log('Creating new map instance...');
        // Create the map
        const map = L.map(mapRef.current, {
          center: [45.1467, 26.8102], // Buzau center
          zoom: 13,
          zoomControl: true,
          preferCanvas: true, // Use canvas for better performance
          scrollWheelZoom: true,
          doubleClickZoom: true,
          touchZoom: true,
          zoomAnimation: true,
          zoomAnimationThreshold: 4,
          markerZoomAnimation: false // Disable marker zoom animation for performance
        });

        console.log('Map created, adding tiles...');
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        mapInstanceRef.current = map;
        
        // Force map to resize and add initial markers
        setTimeout(() => {
          map.invalidateSize();
          console.log('Map fully ready, initial properties count:', properties.length);
          if (properties.length > 0) {
            updateMarkersForMap(map, properties);
          }
        }, 500);

        setIsLoading(false);
        console.log('Map initialization complete!');
      } catch (error) {
        console.error('Failed to initialize map:', error);
        // Only set error if map wasn't already created successfully
        if (!mapInstanceRef.current) {
          setError('Failed to load map');
        }
        setIsLoading(false);
      } finally {
        initializingRef.current = false;
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        console.log('Cleaning up map instance');
        try {
          // Remove all markers first
          if (markersRef.current.length > 0) {
            markersRef.current.forEach(marker => {
              mapInstanceRef.current?.removeLayer(marker);
            });
            markersRef.current = [];
          }
          // Remove the map instance
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (error) {
          console.error('Error during map cleanup:', error);
        }
      }
      // Clean the container
      if (mapRef.current) {
        delete (mapRef.current as any)._leaflet_id;
        mapRef.current.innerHTML = '';
      }
      initializingRef.current = false;
    };
  }, []); // Remove dependencies to prevent re-initialization

  // Separate effect to update markers when properties change
  useEffect(() => {
    console.log('Properties effect triggered, map available:', !!mapInstanceRef.current, 'properties count:', properties.length);
    
    if (!mapInstanceRef.current || properties.length === 0) {
      console.log('Map not ready or no properties, skipping markers');
      return;
    }

    console.log('Calling updateMarkersForMap...');
    updateMarkersForMap(mapInstanceRef.current, properties);
  }, [properties.length, properties.map(p => p.id).join(',')]);

  // Separate effect to handle bounds change
  useEffect(() => {
    if (!mapInstanceRef.current || !onBoundsChange) return;

    const map = mapInstanceRef.current;
    
    const handleBoundsChange = async () => {
      const L = (await import('leaflet')).default;
      const bounds = map.getBounds();
      console.log('Bounds change detected, calling onBoundsChange with Leaflet bounds');
      onBoundsChange(bounds);
    };
    
    map.on('moveend', handleBoundsChange);
    map.on('zoomend', handleBoundsChange);
    
    // Call it once immediately to set initial bounds
    handleBoundsChange();

    return () => {
      map.off('moveend', handleBoundsChange);
      map.off('zoomend', handleBoundsChange);
    };
  }, [onBoundsChange]);

  if (error) {
    return (
      <div className="relative w-full flex items-center justify-center bg-gray-100 rounded-lg" style={{ height }}>
        <div className="text-center">
          <p className="text-gray-600 mb-2">Nu s-a putut încărca harta</p>
          <button 
            onClick={() => {
              setError(null);
              setIsLoading(true);
              window.location.reload();
            }}
            className="text-primary-600 hover:text-primary-700 text-sm"
          >
            Încearcă din nou
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden" style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-[1001]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 text-sm">Se încarcă harta...</p>
          </div>
        </div>
      )}
      <div 
        ref={mapRef} 
        style={{ 
          height: '100%', 
          width: '100%',
          minHeight: '400px',
          position: 'relative',
          zIndex: 0
        }} 
        className="rounded-lg bg-gray-200" 
      />
      <div className="absolute bottom-4 right-4 bg-white px-3 py-2 rounded-lg shadow-lg border text-sm text-gray-700 z-[1000]">
        {properties.filter(p => p.latitude && p.longitude).length} proprietăți pe hartă
      </div>
    </div>
  );
}