import { useState } from 'react';
import { Flex } from '@mantine/core';
import { 
  useStateStats, 
  useCityStats, 
  useCitiesGeoJson,
  useTopoJsonData
} from '../hooks/useMapData';
import StateInfoPanel from './StateInfoPanel';
import CityInfoPanel from './CityInfoPanel';
import SearchSidebar from './SearchSidebar';
import LeafletMap from './LeafletMap';

interface BrazilMapProps {
  onDrilldown?: (stateCode?: string, cityCode?: string) => void;
}

export default function BrazilMap({ onDrilldown }: BrazilMapProps) {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [isStateView, setIsStateView] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // SWR hooks for data fetching
  const { data: stateStats, isLoading: loadingStateStats } = useStateStats();
  const { cityStats, isLoading: loadingCityStats } = useCityStats(selectedCity ? parseInt(selectedCity) : null);
  const { citiesGeoJson, isLoading: loadingCitiesGeoJson } = useCitiesGeoJson(selectedState ? parseInt(selectedState) : null);
  const { statesData: topoJsonData, isLoading: loadingTopoJson } = useTopoJsonData();

  const isLoading = loadingStateStats || loadingCityStats || loadingCitiesGeoJson || loadingTopoJson;

  // Handle city selection from search
  const handleCitySearch = (_value: string, option?: { value: string; label: string; city: any; state: any }) => {
    if (option) {
      const { city, state } = option;
      
      // Update map to show the selected city
      setSelectedState(state.id.toString());
      setSelectedCity(city.id.toString());
      setIsStateView(true);
      setSearchValue(`${city.name} - ${state.uf}`);
    }
  };

  // Handle state click from map
  const handleStateClick = (stateCode: string) => {
    setSelectedState(stateCode);
    setSelectedCity(null);
    setIsStateView(false);
  };

  // Handle city click from map
  const handleCityClick = (cityId: string) => {
    setSelectedCity(cityId);
    if (onDrilldown) {
      onDrilldown(selectedState || undefined, cityId);
    }
  };

  // Handle back to states
  const handleBackToStates = () => {
    setIsStateView(false);
    setSelectedState(null);
    setSelectedCity(null);
    setSearchValue('');
    
    if (onDrilldown) {
      onDrilldown();
    }
  };

  return (
    <Flex style={{ height: '100%' }}>
      <SearchSidebar
        selectedState={selectedState}
        selectedCity={selectedCity}
        isStateView={isStateView}
        stateStats={stateStats}
        cityStats={cityStats}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onCitySelect={handleCitySearch}
        onBackToStates={handleBackToStates}
      />

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
    </Flex>
  );
}