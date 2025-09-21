import { useRef, useEffect, memo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L, { Map } from 'leaflet';
import { Box, LoadingOverlay, Text } from '@mantine/core';

interface LeafletMapProps {
  topoJsonData: any;
  citiesGeoJson: any;
  isStateView: boolean;
  selectedState: string | null;
  selectedCity: string | null;
  isLoading: boolean;
  onStateClick: (stateCode: string) => void;
  onCityClick: (cityId: string) => void;
}

function LeafletMap({
  topoJsonData,
  citiesGeoJson,
  isStateView,
  selectedState,
  selectedCity: _selectedCity,
  isLoading,
  onStateClick,
  onCityClick
}: LeafletMapProps) {
  const mapRef = useRef<Map | null>(null);
  const geoLayerRef = useRef<L.GeoJSON | null>(null);
  const activeLayerRef = useRef<L.Layer | null>(null);

  // Helper functions for active layer styling
  const setActiveLayer = (layer: L.Layer) => {
    // Reset previous active layer
    if (activeLayerRef.current && geoLayerRef.current) {
      geoLayerRef.current.resetStyle(activeLayerRef.current);
    }
    
    // Set new active layer with highlighted style
    if (layer) {
      (layer as any).setStyle({
        fillColor: '#FF5722',
        weight: 4,
        opacity: 1,
        color: '#FF5722',
        dashArray: '',
        fillOpacity: 0.8
      });
      activeLayerRef.current = layer;
    }
  };

  // Load states layer - optimized to prevent flickering
  useEffect(() => {
    if (!mapRef.current || !topoJsonData || isStateView) return;

    const map = mapRef.current;
    
    // Remove existing layer smoothly
    if (geoLayerRef.current) {
      map.removeLayer(geoLayerRef.current);
      geoLayerRef.current = null;
      activeLayerRef.current = null;
    }

    // Add states layer
    const statesLayer = L.geoJSON(topoJsonData, {
      style: () => ({
        fillColor: '#4CAF50',
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
      }),
      onEachFeature: (feature, layer) => {
        const stateCode = feature.properties?.codigo;
        const stateName = feature.properties?.name;
        
        if (stateCode && stateName) {
          // Bind tooltip
          layer.bindTooltip(stateName, {
            permanent: false,
            direction: 'top',
            className: 'leaflet-tooltip-custom'
          });

          layer.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            onStateClick(stateCode.toString());
            setActiveLayer(layer);
          });

          layer.on('mouseover', (e) => {
            const target = e.target;
            if (target !== activeLayerRef.current) {
              target.setStyle({
                weight: 3,
                color: '#666',
                dashArray: '',
                fillOpacity: 0.9
              });
              target.bringToFront();
            }
          });

          layer.on('mouseout', (e) => {
            if (e.target !== activeLayerRef.current) {
              geoLayerRef.current?.resetStyle(e.target);
            }
          });
        }
      }
    });

    statesLayer.addTo(map);
    geoLayerRef.current = statesLayer;
  }, [topoJsonData, isStateView]); // Removed onStateClick to prevent re-renders

  // Load cities layer when in state view - optimized
  useEffect(() => {
    if (!mapRef.current || !citiesGeoJson || !isStateView) return;

    const map = mapRef.current;
    
    // Remove existing layer smoothly
    if (geoLayerRef.current) {
      map.removeLayer(geoLayerRef.current);
      geoLayerRef.current = null;
      activeLayerRef.current = null;
    }

    // Add cities layer
    const citiesLayer = L.geoJSON(citiesGeoJson, {
      style: () => ({
        fillColor: '#2196F3',
        weight: 1,
        opacity: 1,
        color: 'white',
        dashArray: '2',
        fillOpacity: 0.6
      }),
      onEachFeature: (feature, layer) => {
        const cityId = feature.properties?.id;
        const cityName = feature.properties?.name;
        
        if (cityId && cityName) {
          // Bind tooltip
          layer.bindTooltip(cityName, {
            permanent: false,
            direction: 'top',
            className: 'leaflet-tooltip-custom'
          });

          layer.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            onCityClick(cityId.toString());
            setActiveLayer(layer);
          });

          layer.on('mouseover', (e) => {
            const target = e.target;
            if (target !== activeLayerRef.current) {
              target.setStyle({
                weight: 3,
                color: '#1976D2',
                dashArray: '',
                fillOpacity: 0.9
              });
              target.bringToFront();
            }
          });

          layer.on('mouseout', (e) => {
            if (e.target !== activeLayerRef.current) {
              geoLayerRef.current?.resetStyle(e.target);
            }
          });
        }
      }
    });

    citiesLayer.addTo(map);
    geoLayerRef.current = citiesLayer;

    // Fit bounds to state boundaries
    if (citiesGeoJson && citiesGeoJson.features && citiesGeoJson.features.length > 0) {
      const bounds = L.geoJSON(citiesGeoJson).getBounds();
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [citiesGeoJson, isStateView]); // Removed onCityClick to prevent re-renders

  // Force map to resize when layout changes - optimized
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [selectedState, isStateView]);

  // Additional resize when window changes
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Box 
      style={{ 
        position: 'relative',
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <LoadingOverlay visible={isLoading} />
      
      {!selectedState && !isLoading && (
        <Box
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            background: 'rgba(255, 255, 255, 0.9)',
            marginTop: '50px',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center',
            pointerEvents: 'none'
          }}
        >
          <Text size="sm" c="dimmed">
            🗺️ Clique em qualquer estado para explorar os dados de saúde
          </Text>
        </Box>
      )}
      
      <Box style={{ flex: 1, position: 'relative' }}>
        <MapContainer
          center={[-14.235004, -51.92528]}
          zoom={4}
          style={{ 
            height: '100%', 
            width: '100%',
            position: 'absolute',
            top: 0,
            left: 0
          }}
          ref={(mapInstance) => {
            if (mapInstance) {
              mapRef.current = mapInstance;
            }
          }}
        >
          <TileLayer
            attribution='&copy; Premiersoft Challenge'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </MapContainer>
      </Box>
    </Box>
  );
}

// Memoize to prevent unnecessary re-renders and flickering
export default memo(LeafletMap, (prevProps, nextProps) => {
  // Custom comparison to prevent re-renders when data doesn't actually change
  return (
    prevProps.isStateView === nextProps.isStateView &&
    prevProps.selectedState === nextProps.selectedState &&
    prevProps.selectedCity === nextProps.selectedCity &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.topoJsonData === nextProps.topoJsonData &&
    prevProps.citiesGeoJson === nextProps.citiesGeoJson
  );
});