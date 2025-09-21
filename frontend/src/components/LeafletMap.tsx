import { useRef, useEffect, memo, useCallback } from 'react';
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
  selectedCity,
  isLoading,
  onStateClick,
  onCityClick
}: LeafletMapProps) {
  const mapRef = useRef<Map | null>(null);
  const geoLayerRef = useRef<L.GeoJSON | null>(null);
  const activeLayerRef = useRef<L.Layer | null>(null);
  const mapInitialized = useRef<boolean>(false);

  // Stable callbacks to prevent re-renders
  const stableOnStateClick = useCallback((stateCode: string) => {
    onStateClick(stateCode);
  }, [onStateClick]);

  const stableOnCityClick = useCallback((cityId: string) => {
    onCityClick(cityId);
  }, [onCityClick]);

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

  // Force map to resize when layout changes (important for proper display)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 150); // Slightly longer delay to ensure layout is stable

    return () => clearTimeout(timer);
  }, [selectedState, isStateView]);

  // Additional resize when container changes
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load states layer - optimized to not recreate map
  useEffect(() => {
    if (!mapRef.current || !topoJsonData || isStateView) return;

    const map = mapRef.current;
    
    // Remove existing layer without re-rendering the whole component
    if (geoLayerRef.current) {
      map.removeLayer(geoLayerRef.current);
    }

    // Add states layer with stable event handlers
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
          layer.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            onStateClick(stateCode.toString());
            setActiveLayer(layer);
          });

          // Stable hover effects
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
  }, [topoJsonData, isStateView, onStateClick]); // Remove mapRef.current from dependencies
              offset: [0, -10]
            })
              .setContent(stateName)
              .setLatLng(e.latlng);
            
            target.bindTooltip(tooltip).openTooltip();
          });

          layer.on('mouseout', (e) => {
            const target = e.target;
            if (target !== activeLayerRef.current) {
              statesLayer.resetStyle(e.target);
            }
            target.closeTooltip();
          });
        }
      }
    });

    statesLayer.addTo(map);
    geoLayerRef.current = statesLayer;
    
    // Fit map to Brazil bounds
    if (statesLayer.getBounds().isValid()) {
      map.fitBounds(statesLayer.getBounds(), { padding: [20, 20] });
    }
  }, [topoJsonData, isStateView, onStateClick]);

  // Load cities layer
  useEffect(() => {
    if (!mapRef.current || !citiesGeoJson || !isStateView || !selectedState) return;

    const map = mapRef.current;
    
    // Remove existing layer
    if (geoLayerRef.current) {
      map.removeLayer(geoLayerRef.current);
    }

    // Add cities layer
    const citiesLayer = L.geoJSON(citiesGeoJson, {
      style: () => ({
        fillColor: '#2196F3',
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
      }),
      onEachFeature: (feature, layer) => {
        const cityId = feature.properties?.id;
        const cityName = feature.properties?.name;
        
        if (cityId && cityName) {
          layer.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            onCityClick(cityId.toString());
            setActiveLayer(layer);
          });

          // Highlight on hover
          layer.on('mouseover', (e) => {
            const target = e.target as L.Path;
            if (target !== activeLayerRef.current) {
              target.setStyle({
                weight: 3,
                color: '#666',
                dashArray: '',
                fillOpacity: 0.9
              });
              target.bringToFront();
            }
            
            // Show tooltip with city name
            const tooltip = L.tooltip({
              permanent: false,
              direction: 'top',
              offset: [0, -10]
            })
              .setContent(cityName)
              .setLatLng(e.latlng);
            
            target.bindTooltip(tooltip).openTooltip();
          });

          layer.on('mouseout', (e) => {
            const target = e.target as L.Path;
            if (target !== activeLayerRef.current) {
              citiesLayer.resetStyle(e.target);
            }
            target.closeTooltip();
          });
        }
      }
    });

    citiesLayer.addTo(map);
    geoLayerRef.current = citiesLayer;
    
    // Fit map to cities bounds
    if (citiesLayer.getBounds().isValid()) {
      map.fitBounds(citiesLayer.getBounds(), { padding: [20, 20] });
    }
  }, [citiesGeoJson, isStateView, selectedState, onCityClick]);

  // Highlight selected features
  useEffect(() => {
    if (!geoLayerRef.current) return;
    
    if (selectedState && !isStateView) {
      // Highlight selected state
      geoLayerRef.current.eachLayer((layer: any) => {
        const feature = layer.feature;
        if (feature?.properties?.codigo?.toString() === selectedState) {
          setActiveLayer(layer);
        }
      });
    } else if (selectedCity && isStateView) {
      // Highlight selected city
      geoLayerRef.current.eachLayer((layer: any) => {
        const feature = layer.feature;
        if (feature?.properties?.id?.toString() === selectedCity) {
          setActiveLayer(layer);
        }
      });
    }
  }, [selectedState, selectedCity, isStateView]);

  return (
    <Box style={{ 
      flex: 1, 
      position: 'relative',
      height: '100%'
    }}>
      <LoadingOverlay visible={isLoading} />
      
      {/* Search hint overlay */}
      {!selectedState && (
        <Box 
          style={{ 
            position: 'absolute', 
            top: 20, 
            left: 20, 
            zIndex: 1000,
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e9ecef'
          }}
        >
          <Text size="sm" c="dimmed">
            🗺️ Click on any state to explore healthcare data
          </Text>
        </Box>
      )}
      
      <MapContainer
        center={[-14.235004, -51.92528]}
        zoom={4}
        style={{ 
          height: '100%', 
          width: '100%'
        }}
        ref={(mapInstance) => {
          if (mapInstance) {
            mapRef.current = mapInstance;
          }
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </Box>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(LeafletMap);