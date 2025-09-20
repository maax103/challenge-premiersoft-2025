import useSWR from 'swr';
import { apiService, type StateStats, type CityStats, type State, type City } from '../services/municipalityService';

// Fetcher functions for SWR
const fetchers = {
  stateStats: (stateId: number) => apiService.fetchStateStats(stateId),
  cityStats: (cityId: number) => apiService.fetchCityStats(cityId),
  citiesByState: (stateId: number) => apiService.fetchCitiesByState(stateId),
  cityById: (cityId: number) => apiService.fetchCityById(cityId),
  allStates: () => apiService.fetchAllStates(),
};

// Custom hooks using SWR
// All states statistics
export function useStateStats() {
  const { data, error, isLoading, mutate } = useSWR<StateStats[]>(
    'all-states-stats',
    async () => {
      // Use proper state codes that match the topojson data
      // These are the actual state codes from the topojson file
      const states = [12, 27, 16, 23, 53, 32, 52, 21, 31, 50, 51, 25, 41, 33, 24, 43, 26, 22, 29, 17, 28, 11, 14, 42, 35, 15, 13]; 
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

export function useCityStats(cityId: number | null) {
  const { data, error, isLoading, mutate } = useSWR(
    cityId ? ['cityStats', cityId] : null,
    () => cityId ? fetchers.cityStats(cityId) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
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
  // Also get municipalities TopoJSON data
  const { data: municipalitiesData, isLoading: municipalitiesLoading } = useSWR(
    stateId ? ['municipalities-topojson', stateId] : null,
    async () => {
      const response = await fetch('/topograph/municipio.json');
      const topology = await response.json();
      const { feature } = await import('topojson-client');
      const municipalitiesObject = Object.keys(topology.objects)[0]; // Should be 'Munic'
      const allMunicipalities = feature(topology, topology.objects[municipalitiesObject]) as any;
      
      return allMunicipalities;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: Infinity,
    }
  );

  // Return municipalities as GeoJSON (all municipalities for now, could be filtered by state later)
  const citiesGeoJson = municipalitiesData?.features ? {
    type: 'FeatureCollection' as const,
    features: municipalitiesData.features.map((municipalityFeature: any, index: number) => {
      return {
        type: 'Feature' as const,
        properties: {
          id: index + 1, // Use index as ID since we don't have proper IDs
          name: municipalityFeature.properties?.n || `Município ${index + 1}`,
          state_id: stateId,
          ...municipalityFeature.properties
        },
        geometry: municipalityFeature.geometry
      };
    })
  } : null;

  return {
    citiesGeoJson,
    isLoading: municipalitiesLoading,
    isError: false,
  };
}