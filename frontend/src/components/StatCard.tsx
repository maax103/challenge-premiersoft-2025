import { Card, Text, Group, Badge } from '@mantine/core';
import { faker } from '@faker-js/faker';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatCard({ title, value, description, trend = 'neutral' }: StatCardProps) {
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
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="apart" mb="xs">
        <Text size="sm" c="dimmed">{title}</Text>
        <Badge color={getTrendColor()} variant="light">
          {getTrendSymbol()}
        </Badge>
      </Group>
      
      <Text fw={500} size="xl" mb="xs">
        {value}
      </Text>
      
      {description && (
        <Text size="xs" c="dimmed">
          {description}
        </Text>
      )}
    </Card>
  );
}

export function generateRandomStats() {
  return [
    {
      title: 'Total Patients',
      value: faker.number.int({ min: 10000, max: 50000 }).toLocaleString(),
      description: 'Registered this month',
      trend: faker.helpers.arrayElement(['up', 'down', 'neutral'] as const)
    },
    {
      title: 'Active Cases',
      value: faker.number.int({ min: 500, max: 5000 }).toLocaleString(),
      description: 'Currently under treatment',
      trend: faker.helpers.arrayElement(['up', 'down', 'neutral'] as const)
    },
    {
      title: 'Hospitals',
      value: faker.number.int({ min: 50, max: 200 }),
      description: 'Partner institutions',
      trend: faker.helpers.arrayElement(['up', 'down', 'neutral'] as const)
    },
    {
      title: 'Recovery Rate',
      value: `${faker.number.int({ min: 85, max: 98 })}%`,
      description: 'Average success rate',
      trend: faker.helpers.arrayElement(['up', 'down', 'neutral'] as const)
    }
  ];
}