import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { Card, Title, LoadingOverlay, Group, Button, Text, Badge } from '@mantine/core';
import * as topojson from 'topojson-client';
import * as L from 'leaflet';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { GeoJsonObject } from 'geojson';
import { apiService } from '../services/municipalityService';
import '../styles/map.css';

interface BrazilMapProps {
  height?: number;
  showStates?: boolean;
  showMunicipalities?: boolean;
}

type MapMode = 'country' | 'state';

export function BrazilMap({ 
  height = 400, 
  showStates = true, 
  showMunicipalities = false 
}: BrazilMapProps) {
  const [statesData, setStatesData] = useState<GeoJsonObject | null>(null);
  const [municipalitiesData, setMunicipalitiesData] = useState<GeoJsonObject | null>(null);
  const [citiesData, setCitiesData] = useState<GeoJsonObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapMode, setMapMode] = useState<MapMode>('country');
  const [currentStateName, setCurrentStateName] = useState('');
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const loadTopoJsonData = async () => {
      try {
        setLoading(true);
        
        // Load states data if needed
        if (showStates && mapMode === 'country') {
          const statesResponse = await fetch('/topograph/uf.json');
          const statesTopology = await statesResponse.json() as Topology;
          
          // Find the correct object in the topology
          const statesObject = Object.keys(statesTopology.objects)[0];
          const statesGeoJson = topojson.feature(
            statesTopology, 
            statesTopology.objects[statesObject] as GeometryCollection
          );
          setStatesData(statesGeoJson);
        }

        // Load municipalities data if needed
        if (showMunicipalities && mapMode === 'country') {
          const municipalitiesResponse = await fetch('/topograph/municipio.json');
          const municipalitiesTopology = await municipalitiesResponse.json() as Topology;
          
          const municipalitiesObject = Object.keys(municipalitiesTopology.objects)[0];
          const municipalitiesGeoJson = topojson.feature(
            municipalitiesTopology,
            municipalitiesTopology.objects[municipalitiesObject] as GeometryCollection
          );
          setMunicipalitiesData(municipalitiesGeoJson);
        }
      } catch (error) {
        console.error('Error loading topojson data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTopoJsonData();
  }, [showStates, showMunicipalities, mapMode]);

  const generateCitiesGeoJson = async (stateId: number): Promise<any> => {
    const cities = await apiService.fetchCitiesByState(stateId);
    
    return {
      type: 'FeatureCollection',
      features: cities.map(city => ({
        type: 'Feature',
        properties: {
          id: city.id,
          name: city.name,
          population: city.population,
          is_capital: city.is_capital,
          time_zone: city.time_zone,
          state_id: city.state_id
        },
        geometry: {
          type: 'Point',
          coordinates: [city.longitude || -50, city.latitude || -15] // [lng, lat]
        }
      }))
    };
  };

  const stateStyle = {
    fillColor: '#3b82f6',
    weight: 2,
    opacity: 1,
    color: '#1e40af',
    dashArray: '3',
    fillOpacity: 0.3
  };

  const municipalityStyle = {
    fillColor: '#10b981',
    weight: 1,
    opacity: 1,
    color: '#059669',
    fillOpacity: 0.2
  };

  const cityStyle = {
    fillColor: '#f59e0b',
    weight: 2,
    opacity: 1,
    color: '#d97706',
    fillOpacity: 0.6,
    radius: 8
  };

  const onEachStateFeature = (feature: any, layer: any) => {
    const stateName = feature.properties?.name || feature.properties?.NM_ESTADO || 'Estado';
    const stateId = feature.properties?.id || Math.floor(Math.random() * 27) + 1;
    
    layer.on('click', async () => {
      setLoading(true);
      try {
        const stateStats = await apiService.fetchStateStats(stateId);
        
        const popupContent = `
          <div style="min-width: 280px; font-family: sans-serif;">
            <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 8px; margin-bottom: 12px;">
              <h3 style="margin: 0; color: #1e40af; font-size: 16px;">${stateName}</h3>
              <span style="background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 12px; font-size: 12px;">Estado</span>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
              <div>
                <div style="font-size: 12px; color: #666;">População Total</div>
                <div style="font-weight: bold; color: #111;">${stateStats.totalPopulation.toLocaleString('pt-BR')}</div>
              </div>
              <div>
                <div style="font-size: 12px; color: #666;">Cidades</div>
                <div style="font-weight: bold; color: #111;">${stateStats.totalCities}</div>
              </div>
              <div>
                <div style="font-size: 12px; color: #666;">Hospitais</div>
                <div style="font-weight: bold; color: #111;">${stateStats.totalHospitals}</div>
              </div>
              <div>
                <div style="font-size: 12px; color: #666;">Leitos</div>
                <div style="font-weight: bold; color: #111;">${stateStats.totalBeds.toLocaleString('pt-BR')}</div>
              </div>
              <div>
                <div style="font-size: 12px; color: #666;">Médicos</div>
                <div style="font-weight: bold; color: #111;">${stateStats.totalDoctors.toLocaleString('pt-BR')}</div>
              </div>
              <div>
                <div style="font-size: 12px; color: #666;">Pacientes</div>
                <div style="font-weight: bold; color: #111;">${stateStats.totalPatients.toLocaleString('pt-BR')}</div>
              </div>
            </div>
            
            <button 
              onclick="window.drillDownToState(${stateId}, '${stateName}')" 
              style="
                width: 100%; 
                padding: 8px 16px; 
                background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); 
                color: white; 
                border: none; 
                border-radius: 6px; 
                cursor: pointer; 
                font-weight: 500;
                font-size: 14px;
                transition: transform 0.2s;
              "
              onmouseover="this.style.transform='scale(1.02)'"
              onmouseout="this.style.transform='scale(1)'"
            >
              🏙️ Ver Cidades do Estado
            </button>
          </div>
        `;
        
        layer.bindPopup(popupContent, {
          maxWidth: 320,
          className: 'custom-popup'
        }).openPopup();
        
      } catch (error) {
        console.error('Erro ao carregar dados do estado:', error);
      } finally {
        setLoading(false);
      }
    });
  };

  const onEachMunicipalityFeature = (feature: any, layer: any) => {
    const municipalityName = feature.properties?.name || feature.properties?.NM_MUN || 'Município';
    const municipalityId = feature.properties?.id || Math.floor(Math.random() * 5570) + 1;
    
    layer.on('click', async () => {
      setLoading(true);
      try {
        const cityStats = await apiService.fetchCityStats(municipalityId);
        
        const topDiseases = cityStats.commonDiseases.slice(0, 3);
        const topSpecialties = Object.entries(cityStats.doctorsBySpecialty)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3);
        
        const popupContent = `
          <div style="min-width: 300px; font-family: sans-serif;">
            <div style="border-bottom: 2px solid #10b981; padding-bottom: 8px; margin-bottom: 12px;">
              <h3 style="margin: 0; color: #059669; font-size: 16px;">${municipalityName}</h3>
              <span style="background: #d1fae5; color: #059669; padding: 2px 8px; border-radius: 12px; font-size: 12px;">Município</span>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
              <div>
                <div style="font-size: 12px; color: #666;">População</div>
                <div style="font-weight: bold; color: #111;">${cityStats.city.population.toLocaleString('pt-BR')}</div>
              </div>
              <div>
                <div style="font-size: 12px; color: #666;">Hospitais</div>
                <div style="font-weight: bold; color: #111;">${cityStats.hospitals.length}</div>
              </div>
              <div>
                <div style="font-size: 12px; color: #666;">Leitos</div>
                <div style="font-weight: bold; color: #111;">${cityStats.totalBeds}</div>
              </div>
              <div>
                <div style="font-size: 12px; color: #666;">Médicos</div>
                <div style="font-weight: bold; color: #111;">${cityStats.totalDoctors}</div>
              </div>
              <div>
                <div style="font-size: 12px; color: #666;">Pacientes</div>
                <div style="font-weight: bold; color: #111;">${cityStats.totalPatients}</div>
              </div>
              <div>
                <div style="font-size: 12px; color: #666;">Com Convênio</div>
                <div style="font-weight: bold; color: #111;">${Math.round((cityStats.patientsWithInsurance / cityStats.totalPatients) * 100)}%</div>
              </div>
            </div>
            
            <div style="margin-bottom: 12px;">
              <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Principais Especialidades</div>
              ${topSpecialties.map(([specialty, count]) => 
                `<div style="font-size: 11px; margin-bottom: 2px;">• ${specialty}: ${count} médicos</div>`
              ).join('')}
            </div>
            
            <div style="margin-bottom: 12px;">
              <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Doenças Mais Comuns</div>
              ${topDiseases.map(disease => 
                `<div style="font-size: 11px; margin-bottom: 2px;">• ${disease.cid.name}: ${disease.count} casos</div>`
              ).join('')}
            </div>
          </div>
        `;
        
        layer.bindPopup(popupContent, {
          maxWidth: 350,
          className: 'custom-popup'
        }).openPopup();
        
      } catch (error) {
        console.error('Erro ao carregar dados do município:', error);
      } finally {
        setLoading(false);
      }
    });
  };

  const onEachCityFeature = (feature: any, layer: any) => {
    const cityName = feature.properties?.name || 'Cidade';
    const cityId = feature.properties?.id || Math.floor(Math.random() * 5570) + 1;
    
    layer.on('click', async () => {
      setLoading(true);
      try {
        const cityStats = await apiService.fetchCityStats(cityId);
        
        const topSpecialties = Object.entries(cityStats.doctorsBySpecialty)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 2);
        
        const popupContent = `
          <div style="min-width: 280px; font-family: sans-serif;">
            <div style="border-bottom: 2px solid #f59e0b; padding-bottom: 8px; margin-bottom: 12px;">
              <h3 style="margin: 0; color: #d97706; font-size: 16px;">${cityName}</h3>
              <div style="display: flex; gap: 4px; margin-top: 4px;">
                <span style="background: #fef3c7; color: #d97706; padding: 2px 8px; border-radius: 12px; font-size: 12px;">Cidade</span>
                ${feature.properties?.is_capital ? '<span style="background: #fee2e2; color: #dc2626; padding: 2px 8px; border-radius: 12px; font-size: 12px;">Capital</span>' : ''}
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
              <div>
                <div style="font-size: 12px; color: #666;">População</div>
                <div style="font-weight: bold; color: #111;">${feature.properties?.population?.toLocaleString('pt-BR') || 'N/A'}</div>
              </div>
              <div>
                <div style="font-size: 12px; color: #666;">Fuso Horário</div>
                <div style="font-weight: bold; color: #111;">${feature.properties?.time_zone || 'N/A'}</div>
              </div>
              <div>
                <div style="font-size: 12px; color: #666;">Hospitais</div>
                <div style="font-weight: bold; color: #111;">${cityStats.hospitals.length}</div>
              </div>
              <div>
                <div style="font-size: 12px; color: #666;">Leitos</div>
                <div style="font-weight: bold; color: #111;">${cityStats.totalBeds}</div>
              </div>
              <div>
                <div style="font-size: 12px; color: #666;">Médicos</div>
                <div style="font-weight: bold; color: #111;">${cityStats.totalDoctors}</div>
              </div>
              <div>
                <div style="font-size: 12px; color: #666;">Pacientes</div>
                <div style="font-weight: bold; color: #111;">${cityStats.totalPatients}</div>
              </div>
            </div>
            
            ${topSpecialties.length > 0 ? `
              <div style="margin-bottom: 8px;">
                <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Principais Especialidades</div>
                ${topSpecialties.map(([specialty, count]) => 
                  `<div style="font-size: 11px; margin-bottom: 2px;">• ${specialty}: ${count} médicos</div>`
                ).join('')}
              </div>
            ` : ''}
          </div>
        `;
        
        layer.bindPopup(popupContent, {
          maxWidth: 320,
          className: 'custom-popup'
        }).openPopup();
        
      } catch (error) {
        console.error('Erro ao carregar dados da cidade:', error);
      } finally {
        setLoading(false);
      }
    });
  };

  // Global function for drill-down
  useEffect(() => {
    (window as any).drillDownToState = async (stateId: number, stateName: string) => {
      setLoading(true);
      try {
        const citiesGeoJson = await generateCitiesGeoJson(stateId);
        setCitiesData(citiesGeoJson);
        setMapMode('state');
        setCurrentStateName(stateName);
        
        // Close any open popups
        if (mapRef.current) {
          mapRef.current.closePopup();
        }
      } catch (error) {
        console.error('Erro ao carregar cidades:', error);
      } finally {
        setLoading(false);
      }
    };

    return () => {
      delete (window as any).drillDownToState;
    };
  }, []);

  const handleBackToCountry = () => {
    setMapMode('country');
    setCitiesData(null);
    setCurrentStateName('');
  };

  const getMapTitle = () => {
    if (mapMode === 'state' && currentStateName) {
      return `Cidades de ${currentStateName}`;
    }
    return 'Mapa do Brasil';
  };

  return (
    <>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section>
          <Group justify="space-between" p="md">
            <Group>
              <Title order={3}>{getMapTitle()}</Title>
              {mapMode === 'state' && (
                <Badge color="orange" variant="light">Visualização por Estado</Badge>
              )}
            </Group>
            {mapMode === 'state' && (
              <Button variant="light" onClick={handleBackToCountry}>
                ← Voltar ao Mapa Nacional
              </Button>
            )}
          </Group>
        </Card.Section>
        <Card.Section style={{ position: 'relative', height }}>
          <LoadingOverlay visible={loading} />
          <MapContainer
            key={mapMode} // Force re-render when mode changes
            center={mapMode === 'country' ? [-14.235, -51.9253] : [-14.235, -51.9253]}
            zoom={mapMode === 'country' ? 4 : 6}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {mapMode === 'country' && showStates && statesData && (
              <GeoJSON
                key="states"
                data={statesData}
                style={stateStyle}
                onEachFeature={onEachStateFeature}
              />
            )}
            
            {mapMode === 'country' && showMunicipalities && municipalitiesData && (
              <GeoJSON
                key="municipalities"
                data={municipalitiesData}
                style={municipalityStyle}
                onEachFeature={onEachMunicipalityFeature}
              />
            )}

            {mapMode === 'state' && citiesData && (
              <GeoJSON
                key="cities"
                data={citiesData}
                style={cityStyle}
                onEachFeature={onEachCityFeature}
                pointToLayer={(_, latlng) => {
                  return L.circleMarker(latlng, cityStyle);
                }}
              />
            )}
          </MapContainer>
        </Card.Section>
        
        {mapMode === 'country' && (
          <Card.Section p="md">
            <Text size="sm" c="dimmed">
              💡 Clique em um estado ou município para ver dados detalhados. Use o botão nos tooltips para navegar para as cidades
            </Text>
          </Card.Section>
        )}
        
        {mapMode === 'state' && (
          <Card.Section p="md">
            <Text size="sm" c="dimmed">
              💡 Clique nas cidades (pontos amarelos) para ver dados específicos de cada uma
            </Text>
          </Card.Section>
        )}
      </Card>
    </>
  );
}