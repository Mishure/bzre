'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

import { Property } from '@/types/property';

interface PropertyMapProps {
  properties: Property[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onBoundsChange?: (bounds: L.LatLngBounds) => void;
  onPropertyClick?: (property: Property) => void;
  showDrawTools?: boolean;
  onAreaDrawn?: (polygon: L.LatLng[]) => void;
}

// Custom marker icons based on property type
const createPropertyIcon = (propertyType: string, operationType: string) => {
  const colors = {
    APARTAMENT: '#3B82F6', // blue
    CASA: '#10B981', // green
    TEREN: '#F59E0B', // yellow
    SPATIU_COMERCIAL: '#8B5CF6', // purple
  };
  
  const color = colors[propertyType as keyof typeof colors] || '#6B7280';
  const isRental = operationType === 'INCHIRIERE';
  
  return new L.DivIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
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
      ">
        ${isRental ? 'Î' : 'V'}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Component to handle map events
function MapEvents({ onBoundsChange }: { onBoundsChange?: (bounds: L.LatLngBounds) => void }) {
  const map = useMapEvents({
    moveend: () => {
      if (onBoundsChange) {
        onBoundsChange(map.getBounds());
      }
    },
    zoomend: () => {
      if (onBoundsChange) {
        onBoundsChange(map.getBounds());
      }
    },
  });
  
  return null;
}

// Drawing tools component
function DrawTools({ onAreaDrawn }: { onAreaDrawn?: (polygon: L.LatLng[]) => void }) {
  const map = useMap();
  
  useEffect(() => {
    if (!onAreaDrawn) return;
    
    // Dynamically import leaflet-draw to avoid SSR issues
    import('leaflet-draw').then(() => {
      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);
      
      const drawControl = new L.Control.Draw({
        position: 'topright',
        draw: {
          rectangle: {},
          polygon: {},
          circle: false,
          polyline: false,
          marker: false,
          circlemarker: false,
        },
        edit: {
          featureGroup: drawnItems,
          remove: true,
        },
      });
      
      map.addControl(drawControl);
      
      map.on(L.Draw.Event.CREATED, (event: any) => {
        const layer = event.layer;
        drawnItems.addLayer(layer);
        
        let coordinates: L.LatLng[] = [];
        if (layer instanceof L.Rectangle || layer instanceof L.Polygon) {
          coordinates = layer.getLatLngs()[0] as L.LatLng[];
        }
        
        onAreaDrawn(coordinates);
      });
      
      map.on(L.Draw.Event.DELETED, () => {
        onAreaDrawn([]);
      });
    });
  }, [map, onAreaDrawn]);
  
  return null;
}

// Geocoding function for Buzau addresses
const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
  try {
    // Add "Buzau, Romania" to improve geocoding accuracy
    const fullAddress = `${address}, Buzau, Romania`;
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1&countrycodes=ro`
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch (error) {
    console.error('Geocoding failed:', error);
  }
  return null;
};

export default function PropertyMap({
  properties,
  center = [45.1467, 26.8102], // Buzau center
  zoom = 13,
  height = '400px',
  onBoundsChange,
  onPropertyClick,
  showDrawTools = false,
  onAreaDrawn,
}: PropertyMapProps) {
  const [geoProperties, setGeoProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Geocode properties without coordinates
  useEffect(() => {
    const geocodeProperties = async () => {
      setLoading(true);
      const updatedProperties = await Promise.all(
        properties.map(async (property) => {
          if (property.latitude && property.longitude) {
            return property;
          }
          
          // Try to geocode the address
          const coords = await geocodeAddress(property.street);
          if (coords) {
            return {
              ...property,
              latitude: coords[0],
              longitude: coords[1],
            };
          }
          
          return property;
        })
      );
      
      setGeoProperties(updatedProperties.filter(p => p.latitude && p.longitude));
      setLoading(false);
    };
    
    geocodeProperties();
  }, [properties]);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };
  
  return (
    <div className="relative">
      {loading && (
        <div className="absolute top-2 left-2 bg-white px-4 py-2 rounded-lg shadow-xl border border-gray-200 z-[1000] backdrop-blur-sm">
          <span className="text-sm text-gray-800 font-medium">Se încarcă harta...</span>
        </div>
      )}
      
      <div style={{ height }} className="rounded-lg overflow-hidden">
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapEvents onBoundsChange={onBoundsChange} />
          
          {showDrawTools && onAreaDrawn && <DrawTools onAreaDrawn={onAreaDrawn} />}
          
          {geoProperties.map((property) => (
            <Marker
              key={property.id}
              position={[property.latitude!, property.longitude!]}
              icon={createPropertyIcon(property.propertyType, property.operationType)}
              eventHandlers={{
                click: () => onPropertyClick?.(property),
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-semibold text-gray-900 mb-2">{property.name}</h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-green-600 font-bold">{formatPrice(property.price)}</p>
                    <p className="text-gray-600">{property.street}</p>
                    <p className="text-gray-600">{property.zone}</p>
                    <div className="flex justify-between">
                      <span>{property.rooms} camere</span>
                      <span>{property.surface} m²</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{property.propertyType.replace('_', ' ')}</span>
                      <span className="capitalize">{property.operationType}</span>
                    </div>
                  </div>
                  {onPropertyClick && (
                    <button
                      onClick={() => onPropertyClick(property)}
                      className="mt-2 w-full bg-primary-600 text-white py-1 px-2 rounded text-xs hover:bg-primary-700"
                    >
                      Vezi detalii
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      
      <div className="absolute bottom-2 right-2 bg-white px-3 py-2 rounded-lg text-xs text-gray-700 font-medium shadow-xl border border-gray-200 z-[1000] backdrop-blur-sm">
        {geoProperties.length} proprietăți pe hartă
      </div>
    </div>
  );
}

// Export a dynamic version to avoid SSR issues
export const DynamicPropertyMap = dynamic(() => Promise.resolve(PropertyMap), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});