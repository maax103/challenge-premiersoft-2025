import { useState, useMemo } from 'react';
import { Autocomplete, Loader } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useAllCities, useTopoJsonData } from '../hooks/useMapData';

interface SearchBarProps {
  onCitySelect: (cityId: string, stateId: string) => void;
  selectedState?: string | null;
  placeholder?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export default function SearchBar({ 
  onCitySelect, 
  selectedState,
  placeholder = "🔍 Pesquisar cidades...",
  size = "sm"
}: SearchBarProps) {
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchValue, 300);
  
  const { cities: allCities, isLoading, isError } = useAllCities();
  const { statesData: topoJsonData } = useTopoJsonData();

  // Get state name helper
  const getStateName = (stateId: string) => {
    if (!topoJsonData) return '';
    try {
      const features = (topoJsonData as any).features;
      if (!features) return '';
      const stateFeature = features.find((f: any) => 
        f.properties?.codigo?.toString() === stateId
      );
      return stateFeature?.properties?.name || '';
    } catch {
      return '';
    }
  };

  // Create dynamic placeholder
  const dynamicPlaceholder = useMemo(() => {
    if (selectedState) {
      const stateName = getStateName(selectedState);
      return stateName ? `🔍 Pesquisar cidades em ${stateName}...` : placeholder;
    }
    return placeholder;
  }, [selectedState, topoJsonData, placeholder]);

  // Prepare autocomplete data 
  const citySearchData = useMemo(() => {
    if (!allCities || allCities.length === 0 || isLoading) return [];
    
    let filteredCities = allCities;
    
    // Filter by selected state if provided
    if (selectedState) {
      filteredCities = allCities.filter(item => 
        item.state.id.toString() === selectedState
      );
    }
    
    // If we have a search term, filter the cities further
    if (debouncedSearch.trim()) {
      const searchTerm = debouncedSearch.toLowerCase().trim();
      filteredCities = filteredCities.filter(item => 
        item.city.name.toLowerCase().includes(searchTerm) ||
        item.state.uf.toLowerCase().includes(searchTerm) ||
        item.state.name.toLowerCase().includes(searchTerm)
      );
    }
    
    // Limit results for performance and return as simple string array
    return filteredCities.slice(0, 50).map(item => `${item.city.name} - ${item.state.uf}`);
  }, [allCities, debouncedSearch, isLoading, selectedState]);

  const handleSelect = (value: string) => {
    if (!allCities) return;
    
    // Find the selected city data
    const selectedCity = allCities.find(item => 
      `${item.city.name} - ${item.state.uf}` === value
    );
    
    if (selectedCity) {
      onCitySelect(selectedCity.city.id.toString(), selectedCity.state.id.toString());
      setSearchValue(value);
    }
  };

  if (isError) {
    console.error('Error loading cities for search');
  }

  return (
    <Autocomplete
      placeholder={dynamicPlaceholder}
      data={citySearchData}
      value={searchValue}
      onChange={setSearchValue}
      onOptionSubmit={handleSelect}
      size={size}
      style={{ minWidth: '300px' }}
      disabled={isLoading}
      rightSection={isLoading ? <Loader size="xs" /> : null}
      clearable
      limit={50}
      comboboxProps={{
        position: 'bottom-start',
        middlewares: { flip: true, shift: true }
      }}
    />
  );
}