import useSWR from 'swr';
import { apiService, type StateStats, type CityStats, type State, type City } from '../services/municipalityService';

// State code to UF mapping
const STATE_CODE_TO_UF: Record<number, string> = {
  12: 'AC', // Acre
  27: 'AL', // Alagoas  
  13: 'AM', // Amazonas
  16: 'AP', // Amapá
  29: 'BA', // Bahia
  23: 'CE', // Ceará
  53: 'DF', // Distrito Federal
  32: 'ES', // Espírito Santo
  52: 'GO', // Goiás
  21: 'MA', // Maranhão
  51: 'MT', // Mato Grosso
  50: 'MS', // Mato Grosso do Sul
  31: 'MG', // Minas Gerais
  15: 'PA', // Pará
  25: 'PB', // Paraíba
  41: 'PR', // Paraná
  26: 'PE', // Pernambuco
  22: 'PI', // Piauí
  33: 'RJ', // Rio de Janeiro
  24: 'RN', // Rio Grande do Norte
  43: 'RS', // Rio Grande do Sul
  11: 'RO', // Rondônia
  14: 'RR', // Roraima
  42: 'SC', // Santa Catarina
  35: 'SP', // São Paulo
  28: 'SE', // Sergipe
  17: 'TO', // Tocantins
};

// Fetcher functions for SWR
const fetchers = {
  stateStats: (stateId: number) => apiService.fetchStateStats(stateId),
  cityStats: (cityId: number) => apiService.fetchCityStats(cityId),
  citiesByState: (stateId: number) => apiService.fetchCitiesByState(stateId),
  cityById: (cityId: number) => apiService.fetchCityById(cityId),
  allStates: () => apiService.fetchAllStates(),
  allCities: () => apiService.fetchAllCities(),
};

// Custom hooks using SWR
// All states statistics
export function useStateStats() {
  const { data, error, isLoading, mutate } = useSWR<StateStats[]>(
    'all-states-stats',
    async () => {
      // Use the state codes that match our mapping
      const states = Object.keys(STATE_CODE_TO_UF).map(Number); 
      const statsPromises = states.map(id => apiService.fetchStateStats(id));
      return Promise.all(statsPromises);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return { data, isLoading, isError: error, refetch: mutate };
}

// City stats hook with better caching
export function useCityStats(cityId: number | null) {
  const { data, error, isLoading, mutate } = useSWR(
    cityId ? ['cityStats', cityId] : null,
    () => cityId ? fetchers.cityStats(cityId) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false, // Changed to false to reduce re-fetching
      dedupingInterval: 5 * 60 * 1000, // 5 minutes cache
      errorRetryCount: 1,
      shouldRetryOnError: false,
    }
  );

  return {
    cityStats: data as CityStats | undefined,
    isLoading,
    isError: error,
    refetch: mutate,
  };
}

export function useCitiesByState(stateId: number | null) {
  const { data, error, isLoading, mutate } = useSWR(
    stateId ? ['citiesByState', stateId] : null,
    () => stateId ? fetchers.citiesByState(stateId) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes (cities don't change often)
    }
  );

  return {
    cities: data as City[] | undefined,
    isLoading,
    isError: error,
    refetch: mutate,
  };
}

export function useCityById(cityId: number | null) {
  const { data, error, isLoading, mutate } = useSWR(
    cityId ? ['cityById', cityId] : null,
    () => cityId ? fetchers.cityById(cityId) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    city: data as City | undefined,
    isLoading,
    isError: error,
    refetch: mutate,
  };
}

export function useAllStates() {
  const { data, error, isLoading, mutate } = useSWR(
    'allStates',
    fetchers.allStates,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 3600000, // 1 hour (states rarely change)
    }
  );

  return {
    states: data as State[] | undefined,
    isLoading,
    isError: error,
    refetch: mutate,
  };
}

// Hook for TopoJSON data
export function useTopoJsonData(
  showStates: boolean = true, 
  showMunicipalities: boolean = false,
  mapMode: 'country' | 'state' = 'country'
) {
  // States data
  const { data: statesData, error: statesError, isLoading: statesLoading } = useSWR(
    showStates && mapMode === 'country' ? 'topojson-states' : null,
    async () => {
      const response = await fetch('/topograph/uf.json');
      const topology = await response.json();
      const { feature } = await import('topojson-client');
      const statesObject = Object.keys(topology.objects)[0];
      return feature(topology, topology.objects[statesObject]);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: Infinity, // TopoJSON data never changes
    }
  );

  // Municipalities data
  const { data: municipalitiesData, error: municipalitiesError, isLoading: municipalitiesLoading } = useSWR(
    showMunicipalities && mapMode === 'country' ? 'topojson-municipalities' : null,
    async () => {
      const response = await fetch('/topograph/municipio.json');
      const topology = await response.json();
      const { feature } = await import('topojson-client');
      const municipalitiesObject = Object.keys(topology.objects)[0];
      return feature(topology, topology.objects[municipalitiesObject]);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: Infinity, // TopoJSON data never changes
    }
  );

  return {
    statesData,
    municipalitiesData,
    isLoading: statesLoading || municipalitiesLoading,
    isError: statesError || municipalitiesError,
  };
}

// Hook for generating cities GeoJSON with SWR
export function useCitiesGeoJson(stateId: number | null) {
  // Get the UF code for the selected state
  const ufCode = stateId ? STATE_CODE_TO_UF[stateId] : null;
  
  // Load state-specific municipality data
  const { data: municipalitiesData, isLoading: municipalitiesLoading, error } = useSWR(
    ufCode ? ['municipalities-geojson', ufCode] : null,
    async () => {
      if (!ufCode) return null;
      
      const response = await fetch(`/topograph/${ufCode}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load municipalities for ${ufCode}: ${response.statusText}`);
      }
      
      const geoJsonData = await response.json();
      return geoJsonData;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: Infinity, // GeoJSON data never changes
    }
  );

  // Return municipalities as GeoJSON (directly from the loaded file)
  const citiesGeoJson = municipalitiesData?.type === 'FeatureCollection' ? municipalitiesData : null;

  return {
    citiesGeoJson,
    isLoading: municipalitiesLoading,
    isError: error,
  };
}

// Hook for all cities for search functionality
export function useAllCities() {
  const { data, error, isLoading, mutate } = useSWR<{city: City, state: State}[]>(
    'all-cities',
    fetchers.allCities,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30 * 60 * 1000, // Cache for 30 minutes
      errorRetryCount: 1, // Only retry once on error
      shouldRetryOnError: false, // Don't retry on error to avoid infinite loops
    }
  );

  return {
    cities: data || [], // Always return an array, even if undefined
    isLoading,
    isError: error,
    refetch: mutate,
  };
}