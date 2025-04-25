import React, { useRef, useEffect, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface MapDisplayProps {
  apiKey: string;
  trackData: any[];
  isLoading: boolean;
  onMapReady: (map: google.maps.Map) => void;
  onPolylineCreated: (polyline: google.maps.Polyline) => void;
  startMarker: google.maps.Marker | null;
  endMarker: google.maps.Marker | null;
  polyline: google.maps.Polyline | null;
}

const MapDisplay: React.FC<MapDisplayProps> = ({
  apiKey,
  trackData,
  isLoading,
  onMapReady,
  onPolylineCreated,
  startMarker,
  endMarker,
  polyline
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapsLoaded, setMapsLoaded] = useState<boolean>(false);
  const loaderRef = useRef<Loader | null>(null);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  
  // Initialize map only once
  useEffect(() => {
    // Skip if already loaded or no API key
    if (mapsLoaded || !apiKey || apiKey === '') return;
    
    const initMap = async () => {
      try {
        if (!loaderRef.current) {
          loaderRef.current = new Loader({
            apiKey: apiKey,
            version: "weekly",
            libraries: ["geometry"]
          });
        }
        
        const google = await loaderRef.current.load();
        setMapsLoaded(true);
        
        if (mapRef.current && !map) {
          const mapInstance = new google.maps.Map(mapRef.current, {
            center: { lat: 20.5937, lng: 78.9629 }, // India center coordinates as default
            zoom: 5,
            mapTypeId: "terrain",
          });
          setMap(mapInstance);
          // Notify parent component that map is ready
          onMapReady(mapInstance);
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error);
      }
    };

    initMap();
    
    // Cleanup function
    return () => {
      // No cleanup needed for loader
    };
  }, [apiKey, map, mapsLoaded]);

  // Draw track line once data is available and map is ready
  useEffect(() => {
    if (!map || trackData.length === 0 || !mapsLoaded) return;

    // Clean up previous polyline (we'll handle this ourselves rather than relying on props)
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    const drawTrack = async () => {
      try {
        const path = trackData.map((point) => ({
          lat: point.latitude,
          lng: point.longitude,
        }));

        // Create polyline with arrow icons
        const lineSymbol = {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 5,
          strokeColor: "#393",
        };

        const polylineInstance = new google.maps.Polyline({
          path: path,
          icons: [
            {
              icon: lineSymbol,
              offset: "0%",
            },
          ],
          map: map,
          strokeColor: "#2196F3",
          strokeOpacity: 0.8,
          strokeWeight: 3,
        });

        // Store in ref to avoid state updates
        polylineRef.current = polylineInstance;
        
        // Notify parent component about the new polyline
        onPolylineCreated(polylineInstance);

        // Fit the map to the polyline bounds
        if (path.length > 0) {
          const bounds = new google.maps.LatLngBounds();
          path.forEach((coord) => bounds.extend(coord));
          map.fitBounds(bounds);
        }
      } catch (error) {
        console.error("Error drawing track:", error);
      }
    };

    drawTrack();
  }, [map, trackData, mapsLoaded]); // Removed onPolylineCreated from dependencies

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-70 z-10">
          <div className="p-5 bg-white rounded shadow-md">
            Loading map data...
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full"></div>
      
      {/* Legend */}
      <div className="absolute bottom-5 right-5 bg-white p-2.5 rounded shadow-md text-xs">
        <div className="mb-1 flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-1 border border-white"></div>
          <span>Start Point</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-1 border border-white"></div>
          <span>End Point</span>
        </div>
      </div>
    </div>
  );
};

export default MapDisplay;