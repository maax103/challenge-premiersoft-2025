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
        maxHeight: 'calc(100vh - 100px)',
        overflowY: 'scroll',
      }}
    >
      <Stack gap="md">
        {/* Header - Fixed */}
        <Group>
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

        {/* Location Info - Fixed */}
        <Stack gap="xs" style={{ flexShrink: 0 }}>
          <Text size="lg" fw={600} c="blue">
            {stateName}
          </Text>
          {isStateView && selectedCity && cityName && (
            <Text size="md" fw={500} c="gray.7">
              {cityName}
            </Text>
          )}
        </Stack>

        {/* Statistics Cards - Scrollable */}
        <Stack gap="md">
          <Text size="md" fw={500} style={{ flexShrink: 0 }}>📊 Estatísticas</Text>
        
            {isStateView && selectedCity ? (
              // City stats
              <Stack gap="sm">
                {createCityStatsCards(cityStats).map((stat, index) => (
                  <StatCard key={index} {...stat} />
                ))}
              </Stack>
            ) : (
              // State stats
              <Stack gap="sm">
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
              </Stack>
            )}
        </Stack>
      </Stack>
    </Paper>
  );
}