import { Text, Button, Box } from '@mantine/core';

interface StateStats {
  state: { id: number; name: string };
  totalPatients: number;
  totalCities: number;
  totalHospitals: number;
  totalPopulation: number;
  totalBeds: number;
}

interface StateInfoPanelProps {
  selectedState: string;
  stateStats?: StateStats[];
  topoJsonData?: any;
  onDrilldown: () => void;
}

export default function StateInfoPanel({ 
  selectedState, 
  stateStats, 
  topoJsonData, 
  onDrilldown 
}: StateInfoPanelProps) {
  const stats = stateStats?.find((s) => 
    s.state?.id?.toString() === selectedState
  );
  
  const stateName = topoJsonData?.features?.find((f: any) => 
    f.properties?.codigo?.toString() === selectedState
  )?.properties?.name || `Estado ${selectedState}`;

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
        Estado Selecionado
      </Text>
      <Text size="sm" fw="500" mb="xs">
        {stateName}
      </Text>
      {stats ? (
        <>
          <Text size="xs" mb="4px">
            <strong>Pacientes:</strong> {stats.totalPatients?.toLocaleString() || 0}
          </Text>
          <Text size="xs" mb="4px">
            <strong>Cidades:</strong> {stats.totalCities || 0}
          </Text>
          <Text size="xs" mb="4px">
            <strong>Hospitais:</strong> {stats.totalHospitals || 0}
          </Text>
          <Text size="xs" mb="4px">
            <strong>População:</strong> {stats.totalPopulation?.toLocaleString() || 0}
          </Text>
          <Text size="xs" mb="xs">
            <strong>Leitos:</strong> {stats.totalBeds || 0}
          </Text>
          <Button 
            size="xs" 
            fullWidth
            onClick={onDrilldown}
            style={{ marginTop: '8px' }}
          >
            Ver Municípios
          </Button>
        </>
      ) : (
        <Text size="xs" color="dimmed" mb="xs">
          Carregando dados...
        </Text>
      )}
    </Box>
  );
}