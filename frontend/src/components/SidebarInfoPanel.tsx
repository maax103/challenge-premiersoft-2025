import { Paper, Title, Stack, Group, Button, Text, SimpleGrid } from '@mantine/core';
import { StatCard, createStateStatsCards, createCityStatsCards } from './StatCard';
import type { StateStats, CityStats } from '../services/municipalityService';

interface SidebarInfoPanelProps {
  selectedState: string | null;
  selectedCity: string | null;
  isStateView: boolean;
  stateStats?: StateStats[];
  cityStats?: CityStats;
  topoJsonData?: any;
  citiesGeoJson?: any;
  onDrilldown: () => void;
  onBackToStates: () => void;
}

export default function SidebarInfoPanel({
  selectedState,
  selectedCity,
  isStateView,
  stateStats,
  cityStats,
  topoJsonData,
  citiesGeoJson,
  onDrilldown,
  onBackToStates
}: SidebarInfoPanelProps) {
  if (!selectedState) return null;

  const selectedStateStats = stateStats?.find(state => 
    state.state.id.toString() === selectedState
  );

  const stateName = topoJsonData?.features?.find((f: any) => 
    f.properties?.codigo?.toString() === selectedState
  )?.properties?.name || `Estado ${selectedState}`;

  const cityName = selectedCity ? citiesGeoJson?.features?.find((f: any) => 
    f.properties?.id?.toString() === selectedCity
  )?.properties?.name || `Município ${selectedCity}` : null;

  return (
    <Paper 
      shadow="sm" 
      p="md" 
      style={{ 
        height: '100%', 
        overflowY: 'auto',
        borderLeft: '1px solid #e9ecef'
      }}
    >
      <Stack gap="md" style={{ overflow: 'auto'}}>
        {/* Header */}
        <Group justify="space-between" align="center" >
          <Title order={3}>
            {isStateView && selectedCity ? 'Detalhes da Cidade' : 'Detalhes do Estado'}
          </Title>
          {isStateView && (
            <Button 
              onClick={onBackToStates}
              variant="light"
              size="sm"
            >
              ← Voltar ao Estado
            </Button>
          )}
        </Group>

        {/* Location Info */}
        <Stack gap="xs">
          <Text size="lg" fw={600} c="blue">
            {stateName}
          </Text>
          {isStateView && selectedCity && cityName && (
            <Text size="md" fw={500} c="gray.7">
              {cityName}
            </Text>
          )}
        </Stack>

        {/* Statistics Cards */}
        <Stack gap="md">
          <Text size="md" fw={500}>📊 Estatísticas</Text>
          
          {isStateView && selectedCity ? (
            // City stats
            <SimpleGrid cols={1} spacing="sm">
              {createCityStatsCards(cityStats).map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </SimpleGrid>
          ) : (
            // State stats
            <SimpleGrid cols={1} spacing="sm">
              {createStateStatsCards(selectedStateStats).map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
              
              {/* Drill down button for state view */}
              {!isStateView && (
                <Button 
                  onClick={onDrilldown}
                  variant="filled"
                  size="sm"
                  style={{ marginTop: '8px' }}
                >
                  Ver Municípios
                </Button>
              )}
            </SimpleGrid>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}