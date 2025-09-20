import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { Card, Title, LoadingOverlay, Group, Button, Text, Badge } from '@mantine/core';
import * as topojson from 'topojson-client';
import * as L from 'leaflet';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { GeoJsonObject } from 'geojson';
import { MunicipalityModal } from './MunicipalityModal';
import { municipalityAPI } from '../services/municipalityService';
import { faker } from '@faker-js/faker';

interface BrazilMapProps {
  height?: number;
  showStates?: boolean;
  showMunicipalities?: boolean;
}

type MapMode = 'country' | 'municipality';

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
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState<string | null>(null);
  const [selectedMunicipalityName, setSelectedMunicipalityName] = useState('');
  const [modalOpened, setModalOpened] = useState(false);
  const [currentMunicipalityName, setCurrentMunicipalityName] = useState('');

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

  const generateCitiesGeoJson = async (municipalityId: string): Promise<any> => {
    const cities = await municipalityAPI.fetchCitiesByMunicipality(municipalityId);
    
    return {
      type: 'FeatureCollection',
      features: cities.map(city => ({
        type: 'Feature',
        properties: {
          id: city.id,
          name: city.name,
          population: city.population,
          area: city.area,
          districts: city.districts,
          healthFacilities: city.healthFacilities
        },
        geometry: {
          type: 'Point',
          coordinates: [city.coordinates[1], city.coordinates[0]] // [lng, lat]
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

  const onEachMunicipalityFeature = (feature: any, layer: any) => {
    const municipalityName = feature.properties?.name || feature.properties?.NM_MUN || 'Município';
    
    layer.bindPopup(`
      <div>
        <strong>${municipalityName}</strong><br/>
        <button onclick="window.showMunicipalityDetails('${feature.properties?.id || faker.string.uuid()}', '${municipalityName}')" 
                style="margin-top: 8px; padding: 4px 8px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Ver Detalhes
        </button>
      </div>
    `);
  };

  const onEachCityFeature = (feature: any, layer: any) => {
    const cityName = feature.properties?.name || 'Cidade';
    
    layer.bindPopup(`
      <div>
        <strong>${cityName}</strong><br/>
        <small>População: ${feature.properties?.population?.toLocaleString('pt-BR') || 'N/A'}</small><br/>
        <small>Unidades de Saúde: ${feature.properties?.healthFacilities || 'N/A'}</small><br/>
        <button onclick="window.showCityDetails('${feature.properties?.id}', '${cityName}')" 
                style="margin-top: 8px; padding: 4px 8px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Ver Dados da Cidade
        </button>
      </div>
    `);
  };

  const onEachStateFeature = (feature: any, layer: any) => {
    if (feature.properties && feature.properties.name) {
      layer.bindPopup(`<strong>${feature.properties.name}</strong>`);
    }
  };

  // Global functions for popup buttons
  useEffect(() => {
    (window as any).showMunicipalityDetails = (id: string, name: string) => {
      setSelectedMunicipalityId(id);
      setSelectedMunicipalityName(name);
      setModalOpened(true);
    };

    (window as any).showCityDetails = (id: string, name: string) => {
      // Here you could open another modal for city details
      alert(`Detalhes da cidade ${name} (ID: ${id})\n\nEsta funcionalidade pode ser expandida para mostrar dados específicos da cidade.`);
    };

    return () => {
      delete (window as any).showMunicipalityDetails;
      delete (window as any).showCityDetails;
    };
  }, []);

  const handleShowCities = async (municipalityId: string, municipalityName: string) => {
    setLoading(true);
    try {
      const citiesGeoJson = await generateCitiesGeoJson(municipalityId);
      setCitiesData(citiesGeoJson);
      setMapMode('municipality');
      setCurrentMunicipalityName(municipalityName);
    } catch (error) {
      console.error('Erro ao carregar cidades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCountry = () => {
    setMapMode('country');
    setCitiesData(null);
    setCurrentMunicipalityName('');
  };

  const getMapTitle = () => {
    if (mapMode === 'municipality') {
      return `Cidades de ${currentMunicipalityName}`;
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
              {mapMode === 'municipality' && (
                <Badge color="orange" variant="light">Visualização por Município</Badge>
              )}
            </Group>
            {mapMode === 'municipality' && (
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
            zoom={mapMode === 'country' ? 4 : 8}
            style={{ height: '100%', width: '100%' }}
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

            {mapMode === 'municipality' && citiesData && (
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
              💡 Clique em um município para ver seus dados detalhados e navegar para as cidades
            </Text>
          </Card.Section>
        )}
        
        {mapMode === 'municipality' && (
          <Card.Section p="md">
            <Text size="sm" c="dimmed">
              💡 Clique nas cidades (pontos amarelos) para ver dados específicos de cada uma
            </Text>
          </Card.Section>
        )}
      </Card>

      <MunicipalityModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        municipalityId={selectedMunicipalityId}
        municipalityName={selectedMunicipalityName}
        onShowCities={handleShowCities}
      />
    </>
  );
}