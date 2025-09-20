import { Card, Title, Text, Group, RingProgress, Stack } from '@mantine/core';
import { faker } from '@faker-js/faker';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

export function ChartWidget() {
  const generateChartData = (): ChartData[] => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    
    return Array.from({ length: 5 }, (_, index) => ({
      label: faker.science.chemicalElement().name,
      value: faker.number.int({ min: 5, max: 30 }),
      color: colors[index]
    }));
  };

  const data = generateChartData();
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const ringData = data.map(item => ({
    value: (item.value / total) * 100,
    color: item.color,
    tooltip: `${item.label}: ${item.value}%`
  }));

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <Title order={3} p="md">Distribution Analysis</Title>
      </Card.Section>
      
      <Group align="flex-start">
        <RingProgress
          size={160}
          thickness={16}
          sections={ringData}
          label={
            <Text size="xs" ta="center">
              Total: {total}
            </Text>
          }
        />
        
        <Stack gap="xs" flex={1}>
          {data.map((item, index) => (
            <Group key={index} justify="space-between">
              <Group gap="xs">
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: item.color
                  }}
                />
                <Text size="sm">{item.label}</Text>
              </Group>
              <Text size="sm" c="dimmed">
                {((item.value / total) * 100).toFixed(1)}%
              </Text>
            </Group>
          ))}
        </Stack>
      </Group>
    </Card>
  );
}