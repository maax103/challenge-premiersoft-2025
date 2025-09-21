import { useState, useCallback, useMemo } from 'react';
import { Grid, Paper, Title, Group, Button, Box } from '@mantine/core';
import { 
  useStateStats, 
  useCityStats, 
  useCitiesGeoJson,
  useTopoJsonData
} from '../hooks/useMapData';
import LeafletMap from './LeafletMapOptimized';
import SearchBar from './SearchBar';
import StateInfoPanel from './StateInfoPanel';
import CityInfoPanel from './CityInfoPanel';
import SidebarInfoPanel from './SidebarInfoPanel';

interface DashboardProps {
  onDrilldown?: (stateCode?: string, cityCode?: string) => void;
}

export default function Dashboard({ onDrilldown }: DashboardProps) {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [isStateView, setIsStateView] = useState(false);

  // SWR hooks for data fetching - Memoize the parameters to avoid re-renders
  const selectedStateNum = useMemo(() => selectedState ? parseInt(selectedState) : null, [selectedState]);
  const selectedCityNum = useMemo(() => selectedCity ? parseInt(selectedCity) : null, [selectedCity]);
  
  const { data: stateStats, isLoading: loadingStateStats } = useStateStats();
  const { cityStats, isLoading: loadingCityStats } = useCityStats(selectedCityNum);
  const { citiesGeoJson, isLoading: loadingCitiesGeoJson } = useCitiesGeoJson(selectedStateNum);
  const { statesData: topoJsonData, isLoading: loadingTopoJson } = useTopoJsonData();

  const isLoading = loadingStateStats || loadingCityStats || loadingCitiesGeoJson || loadingTopoJson;

  // Handle city selection from search - useCallback to prevent re-renders
  const handleCitySearch = useCallback((cityId: string, stateId: string) => {
    setSelectedState(stateId);
    setSelectedCity(cityId);
    setIsStateView(true);
    if (onDrilldown) {
      onDrilldown(stateId, cityId);
    }
  }, [onDrilldown]);

  // Handle state click from map - useCallback to prevent re-renders
  const handleStateClick = useCallback((stateCode: string) => {
    setSelectedState(stateCode);
    setSelectedCity(null);
    setIsStateView(false);
    
    // Focus on the state by showing its details
    if (onDrilldown) {
      onDrilldown(stateCode);
    }
  }, [onDrilldown]);

  // Handle city click from map - useCallback to prevent re-renders
  const handleCityClick = useCallback((cityId: string) => {
    setSelectedCity(cityId);
    setIsStateView(true); // Switch to city view when a city is clicked
    if (onDrilldown) {
      onDrilldown(selectedState || undefined, cityId);
    }
  }, [onDrilldown, selectedState]);

  // Handle back to states - useCallback to prevent re-renders
  const handleBackToStates = useCallback(() => {
    setIsStateView(false);
    setSelectedState(null);
    setSelectedCity(null);
    
    if (onDrilldown) {
      onDrilldown();
    }
  }, [onDrilldown]);

  const refreshData = () => {
    window.location.reload();
  };

  return (
    <Box style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper 
        shadow="sm" 
        p="md" 
        style={{ 
          borderBottom: '1px solid #e9ecef',
          zIndex: 1000,
          flexShrink: 0
        }}
      >
        <Group justify="space-between" align="center">
          <Title order={1} c="blue">
            Dashboard de Saúde do Brasil
          </Title>
          <Group>
            <SearchBar 
              onCitySelect={handleCitySearch}
              placeholder="🔍 Pesquisar cidades..."
            />
            <Button onClick={refreshData} variant="light">
              Atualizar Dados
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* Main Dashboard Content */}
      <Box style={{ flex: 1, overflow: 'hidden' }}>
        <Grid style={{ height: '100%', margin: 0 }} gutter="md">
          {/* Map Section */}
          <Grid.Col 
            span={selectedState ? 8 : 12} 
            style={{ 
              height: '100%', 
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              minHeight: 0
            }}
          >
            <Box style={{ 
              width: selectedState ? '100%' : '80%',
              maxWidth: selectedState ? '100%' : '1000px',
              height: '100%',
              minHeight: '600px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              padding: 16,
            }}>
              <LeafletMap
                topoJsonData={topoJsonData}
                citiesGeoJson={citiesGeoJson}
                isStateView={isStateView}
                selectedState={selectedState}
                selectedCity={selectedCity}
                isLoading={isLoading}
                onStateClick={handleStateClick}
                onCityClick={handleCityClick}
              />
              
              {/* Small info panels positioned over the map */}
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
                      onBackToStates={handleBackToStates}
                    />
                  )}
                </>
              )}
            </Box>
          </Grid.Col>

          {/* Sidebar with detailed stats */}
          {selectedState && (
            <Grid.Col 
              span={4} 
              style={{ 
                height: '100%',
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <SidebarInfoPanel
                selectedState={selectedState}
                selectedCity={selectedCity}
                isStateView={isStateView}
                stateStats={stateStats}
                cityStats={cityStats}
                topoJsonData={topoJsonData}
                citiesGeoJson={citiesGeoJson}
                onDrilldown={() => {
                  setIsStateView(true);
                  if (onDrilldown) {
                    onDrilldown(selectedState);
                  }
                }}
                onBackToStates={handleBackToStates}
              />
            </Grid.Col>
          )}
        </Grid>
      </Box>
    </Box>
  );
}