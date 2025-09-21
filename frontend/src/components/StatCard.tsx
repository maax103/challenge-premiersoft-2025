import { Card, Text, Group, Badge, ThemeIcon, Stack } from '@mantine/core';
import { IconUsers, IconHospital, IconBed, IconStethoscope } from '@tabler/icons-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatCard({ 
  title, 
  value, 
  description, 
  icon,
  color = 'blue',
  trend = 'neutral' 
}: StatCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'green';
      case 'down': return 'red';
      default: return 'gray';
    }
  };

  const getTrendSymbol = () => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  return (
    <Card 
      shadow="md" 
      padding="lg" 
      radius="md" 
      withBorder
      style={{ 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        height: '140px'
      }}
    >
      <Stack gap="xs" h="100%">
        <Group justify="apart" align="flex-start">
          <Group gap="xs">
            {icon && (
              <ThemeIcon color={color} variant="light" size="lg">
                {icon}
              </ThemeIcon>
            )}
            <Text size="sm" c="dimmed" fw={500}>
              {title}
            </Text>
          </Group>
          {trend !== 'neutral' && (
            <Badge color={getTrendColor()} variant="light" size="sm">
              {getTrendSymbol()}
            </Badge>
          )}
        </Group>
        
        <Text fw={700} size="xl" c={color} style={{ fontSize: '1.8rem' }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Text>
        
        {description && (
          <Text size="xs" c="dimmed" style={{ marginTop: 'auto' }}>
            {description}
          </Text>
        )}
      </Stack>
    </Card>
  );
}

// Helper function to create stat cards from state data
export function createStateStatsCards(stateStats: any) {
  if (!stateStats) return [];
  
  return [
    {
      title: 'Total Cities',
      value: stateStats.totalCities,
      description: `Cities in ${stateStats.state.name}`,
      icon: <IconUsers size={20} />,
      color: 'blue'
    },
    {
      title: 'Population',
      value: stateStats.totalPopulation.toLocaleString(),
      description: 'Total inhabitants',
      icon: <IconUsers size={20} />,
      color: 'green'
    },
    {
      title: 'Hospitals',
      value: stateStats.totalHospitals,
      description: 'Healthcare facilities',
      icon: <IconHospital size={20} />,
      color: 'red'
    },
    {
      title: 'Hospital Beds',
      value: stateStats.totalBeds.toLocaleString(),
      description: 'Available beds',
      icon: <IconBed size={20} />,
      color: 'orange'
    }
  ];
}

// Helper function to create stat cards from city data
export function createCityStatsCards(cityStats: any) {
  if (!cityStats) return [];
  
  return [
    {
      title: 'Population',
      value: cityStats.city.population.toLocaleString(),
      description: `Inhabitants in ${cityStats.city.name}`,
      icon: <IconUsers size={20} />,
      color: 'blue'
    },
    {
      title: 'Hospitals',
      value: cityStats.hospitals.length,
      description: 'Healthcare facilities',
      icon: <IconHospital size={20} />,
      color: 'red'
    },
    {
      title: 'Hospital Beds',
      value: cityStats.totalBeds.toLocaleString(),
      description: 'Available beds',
      icon: <IconBed size={20} />,
      color: 'orange'
    },
    {
      title: 'Medical Staff',
      value: cityStats.totalDoctors.toLocaleString(),
      description: 'Doctors and specialists',
      icon: <IconStethoscope size={20} />,
      color: 'purple'
    }
  ];
}