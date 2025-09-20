import { useRef, useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L, { GeoJSON, Map } from 'leaflet';
import { Button, Box, LoadingOverlay } from '@mantine/core';
import { 
  useStateStats, 
  useCityStats, 
  useCitiesGeoJson,
  useTopoJsonData 
} from '../hooks/useMapData';
import StateInfoPanel from './StateInfoPanel';
import CityInfoPanel from './CityInfoPanel';

interface BrazilMapProps {
  onDrilldown?: (stateCode?: string, cityCode?: string) => void;
}

export default function BrazilMap({ onDrilldown }: BrazilMapProps) {
  const mapRef = useRef<Map | null>(null);
  const geoLayerRef = useRef<L.GeoJSON | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [isStateView, setIsStateView] = useState(false);
  const [currentPopup, setCurrentPopup] = useState<L.Popup | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  // SWR hooks for data fetching
  const { data: stateStats, isLoading: loadingStateStats } = useStateStats();
  const { cityStats, isLoading: loadingCityStats } = useCityStats(selectedCity ? parseInt(selectedCity) : null);
  const { citiesGeoJson, isLoading: loadingCitiesGeoJson } = useCitiesGeoJson(selectedState ? parseInt(selectedState) : null);
  const { statesData: topoJsonData, isLoading: loadingTopoJson } = useTopoJsonData();

  const isLoading = loadingStateStats || loadingCityStats || loadingCitiesGeoJson || loadingTopoJson;

  // Initialize map and load base TopoJSON data only once
  useEffect(() => {
    if (!mapRef.current || !topoJsonData || mapInitialized) return;

    const map = mapRef.current;
    
    // Load states layer initially
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
            
            // Close any existing popup
            if (currentPopup) {
              map.closePopup(currentPopup);
              setCurrentPopup(null);
            }
            
            setSelectedState(stateCode.toString());
            setSelectedCity(null); // Reset city selection
          });

          // Highlight on hover
          layer.on('mouseover', (e) => {
            const target = e.target;
            target.setStyle({
              weight: 3,
              color: '#666',
              dashArray: '',
              fillOpacity: 0.9
            });
            target.bringToFront();
          });

          layer.on('mouseout', (e) => {
            statesLayer.resetStyle(e.target);
          });
        }
      }
    });

    statesLayer.addTo(map);
    geoLayerRef.current = statesLayer;
    
    // Fit map to Brazil bounds initially
    if (statesLayer.getBounds().isValid()) {
      map.fitBounds(statesLayer.getBounds(), { padding: [20, 20] });
    }
    
    setMapInitialized(true);
  }, [topoJsonData, mapInitialized, stateStats]);

  // Handle layer switching when drilling down to cities
  useEffect(() => {
    if (!mapRef.current || !mapInitialized || !isStateView || !selectedState || !citiesGeoJson) return;

    const map = mapRef.current;
    
    // Remove current layer
    if (geoLayerRef.current) {
      map.removeLayer(geoLayerRef.current);
    }

    // Close any existing popup
    if (currentPopup) {
      map.closePopup(currentPopup);
      setCurrentPopup(null);
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
            
            // Close any existing popup
            if (currentPopup) {
              map.closePopup(currentPopup);
              setCurrentPopup(null);
            }
            
            setSelectedCity(cityId.toString());
            
            if (onDrilldown) {
              onDrilldown(selectedState, cityId.toString());
            }
          });

          // Highlight on hover
          layer.on('mouseover', (e) => {
            const target = e.target as L.Path;
            target.setStyle({
              weight: 3,
              color: '#666',
              dashArray: '',
              fillOpacity: 0.9
            });
            target.bringToFront();
          });

          layer.on('mouseout', (e) => {
            citiesLayer.resetStyle(e.target);
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
  }, [isStateView, selectedState, citiesGeoJson, mapInitialized, onDrilldown]);

  // Handle returning to states view
  useEffect(() => {
    if (!mapRef.current || !mapInitialized || isStateView || !topoJsonData) return;

    const map = mapRef.current;
    
    // Remove current layer
    if (geoLayerRef.current) {
      map.removeLayer(geoLayerRef.current);
    }

    // Close any existing popup
    if (currentPopup) {
      map.closePopup(currentPopup);
      setCurrentPopup(null);
    }

    // Re-add states layer
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
            
            if (currentPopup) {
              map.closePopup(currentPopup);
              setCurrentPopup(null);
            }
            
            setSelectedState(stateCode.toString());
            setSelectedCity(null);
          });

          layer.on('mouseover', (e) => {
            const target = e.target;
            target.setStyle({
              weight: 3,
              color: '#666',
              dashArray: '',
              fillOpacity: 0.9
            });
            target.bringToFront();
          });

          layer.on('mouseout', (e) => {
            statesLayer.resetStyle(e.target);
          });
        }
      }
    });

    statesLayer.addTo(map);
    geoLayerRef.current = statesLayer;
    
    // Don't reset zoom when returning to states view
  }, [isStateView, topoJsonData, mapInitialized, stateStats]);

  const handleBackToStates = () => {
    setIsStateView(false);
    setSelectedState(null);
    setSelectedCity(null);
    if (onDrilldown) {
      onDrilldown();
    }
  };

  return (
    <Box style={{ position: 'relative', height: '500px' }}>
      <LoadingOverlay visible={isLoading} />
      
      {isStateView && (
        <Button 
          onClick={handleBackToStates}
          style={{ 
            position: 'absolute', 
            top: 10, 
            left: 10, 
            zIndex: 1000 
          }}
        >
          ← Voltar para Estados
        </Button>
      )}

      <MapContainer
        center={[-14.235004, -51.92528]}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
        whenReady={(mapEvent) => {
          mapRef.current = mapEvent.target;
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>

      {selectedState && (
        <>
          {!isStateView ? (
            <StateInfoPanel
              selectedState={selectedState}
              stateStats={stateStats}
              topoJsonData={topoJsonData}
              onDrilldown={() => {
                setIsStateView(true);
                if (onDrilldown) {
                  onDrilldown(selectedState);
                }
              }}
            />
          ) : (
            <CityInfoPanel
              selectedState={selectedState}
              selectedCity={selectedCity}
              cityStats={cityStats}
              citiesGeoJson={citiesGeoJson}
              topoJsonData={topoJsonData}
            />
          )}
        </>
      )}
    </Box>
  );
}