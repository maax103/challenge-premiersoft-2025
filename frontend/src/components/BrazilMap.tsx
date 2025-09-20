import { useRef, useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L, { GeoJSON } from 'leaflet';
import { Text, Button, Box, LoadingOverlay } from '@mantine/core';
import { 
  useStateStats, 
  useCityStats, 
  useCitiesGeoJson,
  useTopoJsonData 
} from '../hooks/useMapData';

interface BrazilMapProps {
  onDrilldown?: (stateCode?: string, cityCode?: string) => void;
}

export default function BrazilMap({ onDrilldown }: BrazilMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [isStateView, setIsStateView] = useState(false);
  const [currentPopup, setCurrentPopup] = useState<L.Popup | null>(null);

  // SWR hooks for data fetching
  const { data: stateStats, isLoading: loadingStateStats } = useStateStats();
  const { cityStats, isLoading: loadingCityStats } = useCityStats(selectedCity ? parseInt(selectedCity) : null);
  const { citiesGeoJson, isLoading: loadingCitiesGeoJson } = useCitiesGeoJson(selectedState ? parseInt(selectedState) : null);
  const { statesData: topoJsonData, isLoading: loadingTopoJson } = useTopoJsonData();

  const isLoading = loadingStateStats || loadingCityStats || loadingCitiesGeoJson || loadingTopoJson;

  useEffect(() => {
    if (!mapRef.current || !topoJsonData) return;

    const map = mapRef.current;
    
    // Clear existing layers
    map.eachLayer((layer) => {
      if (layer instanceof L.GeoJSON) {
        map.removeLayer(layer);
      }
    });

    if (isStateView && selectedState && citiesGeoJson) {
      // Show cities view
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
          const cityCode = feature.properties?.codigo_ibge;
          const cityName = feature.properties?.nome;
          
          if (cityCode && cityName) {
            layer.on('click', () => {
              setSelectedCity(cityCode);
              if (onDrilldown) {
                onDrilldown(selectedState, cityCode);
              }
            });

            layer.on('mouseover', () => {
              const stats = cityStats;
              const content = `
                <div>
                  <h3>${cityName}</h3>
                  ${stats ? `
                    <p>Total de Pacientes: ${stats.totalPatients || 0}</p>
                    <p>Hospitais: ${stats.hospitals?.length || 0}</p>
                    <p>Leitos: ${stats.totalBeds || 0}</p>
                  ` : '<p>Carregando dados...</p>'}
                </div>
              `;
              
              if (layer instanceof GeoJSON) {
                const popup = L.popup()
                  .setLatLng(layer.getBounds().getCenter())
                  .setContent(content)
                  .openOn(map);
                
                setCurrentPopup(popup);
              }
            });

            layer.on('mouseout', () => {
              if (currentPopup) {
                map.closePopup(currentPopup);
                setCurrentPopup(null);
              }
            });
          }
        }
      }).addTo(map);

      map.fitBounds(citiesLayer.getBounds());
    } else {
      // Show states view - topoJsonData is already a GeoJSON feature
      if (topoJsonData) {
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
          const stateCode = feature.properties?.codigo_ibge;
          const stateName = feature.properties?.nome;
          
          if (stateCode && stateName) {
            layer.on('click', () => {
              setSelectedState(stateCode);
              setIsStateView(true);
              if (onDrilldown) {
                onDrilldown(stateCode);
              }
            });

            layer.on('mouseover', () => {
              const stats = stateStats?.find((s: { state?: { id?: number } }) => s.state?.id?.toString() === stateCode);
              const content = `
                <div>
                  <h3>${stateName}</h3>
                  ${stats ? `
                    <p>Total de Pacientes: ${stats.totalPatients || 0}</p>
                    <p>Cidades: ${stats.totalCities || 0}</p>
                    <p>Hospitais: ${stats.totalHospitals || 0}</p>
                    <p>População: ${stats.totalPopulation || 0}</p>
                  ` : '<p>Carregando dados...</p>'}
                </div>
              `;
              
              if (layer instanceof GeoJSON) {
                const popup = L.popup()
                  .setLatLng(layer.getBounds().getCenter())
                  .setContent(content)
                  .openOn(map);
                
                setCurrentPopup(popup);
              }
            });

            layer.on('mouseout', () => {
              if (currentPopup) {
                map.closePopup(currentPopup);
                setCurrentPopup(null);
              }
            });
          }
        }
      }).addTo(map);

      map.fitBounds(statesLayer.getBounds());
      }
    }
  }, [topoJsonData, isStateView, selectedState, citiesGeoJson, stateStats, cityStats, currentPopup, onDrilldown]);

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
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>

      {selectedState && (
        <Box style={{ 
          position: 'absolute', 
          bottom: 10, 
          right: 10, 
          background: 'white', 
          padding: '10px', 
          borderRadius: '5px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          zIndex: 1000
        }}>
          <Text size="sm">
            Estado Selecionado: {selectedState}
          </Text>
          {selectedCity && (
            <Text size="sm">
              Cidade Selecionada: {selectedCity}
            </Text>
          )}
        </Box>
      )}
    </Box>
  );
}