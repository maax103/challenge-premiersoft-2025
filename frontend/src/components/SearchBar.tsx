import { useState, useMemo } from 'react';
import { Autocomplete, Loader } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useAllCities } from '../hooks/useMapData';

interface SearchBarProps {
  onCitySelect: (cityId: string, stateId: string) => void;
  placeholder?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export default function SearchBar({ 
  onCitySelect, 
  placeholder = "🔍 Pesquisar cidades...",
  size = "sm"
}: SearchBarProps) {
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchValue, 300);
  
  const { cities: allCities, isLoading, isError } = useAllCities();

  // Prepare autocomplete data 
  const citySearchData = useMemo(() => {
    if (!allCities || allCities.length === 0 || isLoading) return [];
    
    let filteredCities = allCities;
    
    // If we have a search term, filter the cities
    if (debouncedSearch.trim()) {
      const searchTerm = debouncedSearch.toLowerCase().trim();
      filteredCities = allCities.filter(item => 
        item.city.name.toLowerCase().includes(searchTerm) ||
        item.state.uf.toLowerCase().includes(searchTerm) ||
        item.state.name.toLowerCase().includes(searchTerm)
      );
    }
    
    // Limit results for performance and return as simple string array
    return filteredCities.slice(0, 50).map(item => `${item.city.name} - ${item.state.uf}`);
  }, [allCities, debouncedSearch, isLoading]);

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
      placeholder={placeholder}
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