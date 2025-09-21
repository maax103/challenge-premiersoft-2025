import { Text, Box, Button } from '@mantine/core';
import type { CityStats } from '../services/municipalityService';

interface CityInfoPanelProps {
  selectedState: string;
  selectedCity?: string | null;
  cityStats?: CityStats;
  citiesGeoJson?: any;
  topoJsonData?: any;
  onBackToStates?: () => void;
}

export default function CityInfoPanel({ 
  selectedState, 
  selectedCity, 
  cityStats, 
  citiesGeoJson, 
  topoJsonData,
  onBackToStates 
}: CityInfoPanelProps) {
  const stateName = topoJsonData?.features?.find((f: any) => 
    f.properties?.codigo?.toString() === selectedState
  )?.properties?.name || `Estado ${selectedState}`;

  const cityName = selectedCity ? citiesGeoJson?.features?.find((f: any) => 
    f.properties?.id?.toString() === selectedCity
  )?.properties?.name || `Município ${selectedCity}` : null;

  return (
    <Box style={{ 
      position: 'absolute', 
      bottom: 120, 
      right: 20, 
      background: 'white', 
      padding: '15px', 
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      zIndex: 1000,
      minWidth: '250px'
    }}>
      <Text size="md" fw="bold" mb="xs">
        Visualizando Municípios
      </Text>
      <Text size="sm" mb="xs">
        {stateName}
      </Text>
      {selectedCity && cityName && (
        <>
          <Text size="sm" fw="500" mb="xs">
            {cityName}
          </Text>
          {cityStats ? (
            <>
              <Text size="xs" mb="4px">
                <strong>Pacientes:</strong> {cityStats.totalPatients || 0}
              </Text>
              <Text size="xs" mb="4px">
                <strong>Hospitais:</strong> {cityStats.hospitals?.length || 0}
              </Text>
              <Text size="xs" mb="4px">
                <strong>Leitos:</strong> {cityStats.totalBeds || 0}
              </Text>
              <Text size="xs" mb="xs">
                <strong>Médicos:</strong> {cityStats.totalDoctors || 0}
              </Text>
            </>
          ) : (
            <Text size="xs" color="dimmed">
              Carregando dados...
            </Text>
          )}
        </>
      )}
      
      {onBackToStates && (
        <Button 
          size="xs" 
          fullWidth
          onClick={onBackToStates}
          style={{ marginTop: '8px' }}
          variant="light"
        >
          ← Voltar ao Estado
        </Button>
      )}
    </Box>
  );
}