import { useRef, useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L, { GeoJSON, Map } from 'leaflet';
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
  const mapRef = useRef<Map | null>(null);
  const geoLayerRef = useRef<L.GeoJSON | null>(null);
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
    
    // Clear existing GeoJSON layers
    if (geoLayerRef.current) {
      map.removeLayer(geoLayerRef.current);
      geoLayerRef.current = null;
    }

    // Close any existing popup
    if (currentPopup) {
      map.closePopup(currentPopup);
      setCurrentPopup(null);
    }

    if (isStateView && selectedState && citiesGeoJson) {
      // Show cities view - now using proper municipality polygons
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
              
              setSelectedCity(cityId.toString());
              
              const content = `
                <div style="min-width: 200px;">
                  <h3 style="margin: 0 0 10px 0;">${cityName}</h3>
                  <p><strong>Município:</strong> ${cityName}</p>
                  <p><em>Clique para ver detalhes no painel ao lado</em></p>
                </div>
              `;
              
              const popup = L.popup()
                .setLatLng(e.latlng)
                .setContent(content)
                .openOn(map);
              
              setCurrentPopup(popup);
              
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
    } else {
      // Show states view
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
          const stateCode = feature.properties?.codigo; // Use 'codigo' not 'codigo_ibge'
          const stateName = feature.properties?.name;
          
          if (stateCode && stateName) {
            layer.on('click', (e) => {
              L.DomEvent.stopPropagation(e);
              
              setSelectedState(stateCode.toString());
              
              const stats = stateStats?.find((s) => 
                s.state?.id?.toString() === stateCode.toString()
              );
              
              const content = `
                <div style="min-width: 200px;">
                  <h3 style="margin: 0 0 10px 0;">${stateName}</h3>
                  ${stats ? `
                    <p><strong>Total de Pacientes:</strong> ${stats.totalPatients || 0}</p>
                    <p><strong>Cidades:</strong> ${stats.totalCities || 0}</p>
                    <p><strong>Hospitais:</strong> ${stats.totalHospitals || 0}</p>
                    <p><strong>População:</strong> ${stats.totalPopulation?.toLocaleString() || 0}</p>
                    <p><strong>Leitos:</strong> ${stats.totalBeds || 0}</p>
                  ` : '<p>Carregando dados...</p>'}
                </div>
              `;
              
              const popup = L.popup()
                .setLatLng(e.latlng)
                .setContent(content)
                .openOn(map);
              
              setCurrentPopup(popup);
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
      
      // Fit map to Brazil bounds
      if (statesLayer.getBounds().isValid()) {
        map.fitBounds(statesLayer.getBounds(), { padding: [20, 20] });
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
        <Box style={{ 
          position: 'absolute', 
          bottom: 10, 
          right: 10, 
          background: 'white', 
          padding: '15px', 
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          zIndex: 1000,
          minWidth: '250px'
        }}>
          {!isStateView ? (
            <>
              <Text size="md" weight="bold" mb="xs">
                Estado Selecionado
              </Text>
              {(() => {
                const stats = stateStats?.find((s) => 
                  s.state?.id?.toString() === selectedState
                );
                const stateName = topoJsonData?.features?.find((f: any) => 
                  f.properties?.codigo?.toString() === selectedState
                )?.properties?.name || `Estado ${selectedState}`;
                
                return (
                  <>
                    <Text size="sm" weight="500" mb="xs">
                      {stateName}
                    </Text>
                    {stats ? (
                      <>
                        <Text size="xs" mb="4px">
                          <strong>Pacientes:</strong> {stats.totalPatients?.toLocaleString() || 0}
                        </Text>
                        <Text size="xs" mb="4px">
                          <strong>Cidades:</strong> {stats.totalCities || 0}
                        </Text>
                        <Text size="xs" mb="4px">
                          <strong>Hospitais:</strong> {stats.totalHospitals || 0}
                        </Text>
                        <Text size="xs" mb="4px">
                          <strong>População:</strong> {stats.totalPopulation?.toLocaleString() || 0}
                        </Text>
                        <Text size="xs" mb="xs">
                          <strong>Leitos:</strong> {stats.totalBeds || 0}
                        </Text>
                        <Button 
                          size="xs" 
                          fullWidth
                          onClick={() => {
                            setIsStateView(true);
                            if (onDrilldown) {
                              onDrilldown(selectedState);
                            }
                          }}
                          style={{ marginTop: '8px' }}
                        >
                          Ver Municípios
                        </Button>
                      </>
                    ) : (
                      <Text size="xs" color="dimmed" mb="xs">
                        Carregando dados...
                      </Text>
                    )}
                  </>
                );
              })()}
            </>
          ) : (
            <>
              <Text size="md" weight="bold" mb="xs">
                Visualizando Municípios
              </Text>
              {(() => {
                const stateName = topoJsonData?.features?.find((f: any) => 
                  f.properties?.codigo?.toString() === selectedState
                )?.properties?.name || `Estado ${selectedState}`;
                
                return (
                  <Text size="sm" mb="xs">
                    {stateName}
                  </Text>
                );
              })()}
              {selectedCity && (() => {
                const stats = cityStats;
                const cityName = citiesGeoJson?.features?.find((f: any) => 
                  f.properties?.id?.toString() === selectedCity
                )?.properties?.name || `Município ${selectedCity}`;
                
                return (
                  <>
                    <Text size="sm" weight="500" mb="xs">
                      {cityName}
                    </Text>
                    {stats ? (
                      <>
                        <Text size="xs" mb="4px">
                          <strong>Pacientes:</strong> {stats.totalPatients || 0}
                        </Text>
                        <Text size="xs" mb="4px">
                          <strong>Hospitais:</strong> {stats.hospitals?.length || 0}
                        </Text>
                        <Text size="xs" mb="4px">
                          <strong>Leitos:</strong> {stats.totalBeds || 0}
                        </Text>
                        <Text size="xs" mb="xs">
                          <strong>Médicos:</strong> {stats.totalDoctors || 0}
                        </Text>
                      </>
                    ) : (
                      <Text size="xs" color="dimmed">
                        Carregando dados...
                      </Text>
                    )}
                  </>
                );
              })()}
            </>
          )}
        </Box>
      )}
    </Box>
  );
}