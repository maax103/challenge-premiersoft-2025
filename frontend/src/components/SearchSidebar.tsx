import { Box, Paper, Stack, Title, Autocomplete, Button } from '@mantine/core';
import { useAllCities } from '../hooks/useMapData';
import { StatCard, createStateStatsCards, createCityStatsCards } from './StatCard';
import type { StateStats, CityStats } from '../services/municipalityService';

interface SearchSidebarProps {
  selectedState: string | null;
  selectedCity: string | null;
  isStateView: boolean;
  stateStats: StateStats[] | undefined;
  cityStats: CityStats | undefined;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onCitySelect: (value: string, option?: any) => void;
  onBackToStates: () => void;
  loadingAllCities?: boolean;
}

export default function SearchSidebar({
  selectedState,
  selectedCity,
  isStateView,
  stateStats,
  cityStats,
  searchValue,
  onSearchChange,
  onCitySelect,
  onBackToStates,
  loadingAllCities = false
}: SearchSidebarProps) {
  const { cities: allCities, isLoading } = useAllCities();

  // Prepare autocomplete data safely
  const citySearchData = (allCities && allCities.length > 0) ? allCities.map(item => ({
    value: `${item.city.id}`,
    label: `${item.city.name} - ${item.state.uf}`,
    city: item.city,
    state: item.state
  })) : [];

  // Only show sidebar when there's something to display
  if (!selectedState && (!allCities || allCities.length === 0)) {
    return null;
  }

  return (
    <Paper 
      style={{ 
        width: '350px', 
        minWidth: '350px',
        height: '100%',
        overflowY: 'auto',
        borderRight: '1px solid #e9ecef'
      }}
      p="md"
    >
      <Stack gap="md">
        {/* Search Section - only show if cities are loaded */}
        {allCities && allCities.length > 0 && (
          <Box>
            <Title order={4} mb="sm">🔍 Find City</Title>
            <Autocomplete
              placeholder="Search for a city..."
              data={citySearchData}
              value={searchValue}
              onChange={onSearchChange}
              onOptionSubmit={onCitySelect}
              limit={10}
              disabled={isLoading || loadingAllCities}
              size="sm"
            />
          </Box>
        )}

        {/* Statistics Cards - only show when a state/city is selected */}
        {selectedState && (
          <Box>
            <Title order={4} mb="sm">
              📊 {isStateView && selectedCity ? 'City Statistics' : 'State Statistics'}
            </Title>
            <Stack gap="sm">
              {isStateView && selectedCity ? (
                // Show city stats when a city is selected
                (() => {
                  const cityStatsCards = createCityStatsCards(cityStats);
                  return cityStatsCards.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                  ));
                })()
              ) : (
                // Show state stats when a state is selected
                (() => {
                  const selectedStateStats = stateStats?.find(state => 
                    state.state.id.toString() === selectedState
                  );
                  const stateStatsCards = createStateStatsCards(selectedStateStats);
                  return stateStatsCards.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                  ));
                })()
              )}
            </Stack>
          </Box>
        )}

        {/* Back Button */}
        {isStateView && (
          <Button 
            onClick={onBackToStates}
            variant="filled"
            color="blue"
            fullWidth
            size="sm"
          >
            ← Back to States
          </Button>
        )}
      </Stack>
    </Paper>
  );
}