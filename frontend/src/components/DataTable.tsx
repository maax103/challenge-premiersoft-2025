import { Card, Title, Table, Badge, Progress, Group, Text } from '@mantine/core';
import { faker } from '@faker-js/faker';

interface TableRowData {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  value: number;
  progress: number;
}

export function DataTable() {
  const generateTableData = (): TableRowData[] => {
    return Array.from({ length: 8 }, () => ({
      id: faker.string.uuid(),
      name: faker.location.city(),
      status: faker.helpers.arrayElement(['active', 'inactive', 'pending'] as const),
      value: faker.number.int({ min: 100, max: 10000 }),
      progress: faker.number.int({ min: 10, max: 100 })
    }));
  };

  const data = generateTableData();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'red';
      case 'pending': return 'yellow';
      default: return 'gray';
    }
  };

  const rows = data.map((item) => (
    <Table.Tr key={item.id}>
      <Table.Td>{item.name}</Table.Td>
      <Table.Td>
        <Badge color={getStatusColor(item.status)} variant="light">
          {item.status}
        </Badge>
      </Table.Td>
      <Table.Td>{item.value.toLocaleString()}</Table.Td>
      <Table.Td>
        <Group>
          <Progress value={item.progress} size="sm" style={{ flex: 1 }} />
          <Text size="xs" c="dimmed">{item.progress}%</Text>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <Title order={3} p="md">Regional Data</Title>
      </Card.Section>
      
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Location</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Cases</Table.Th>
            <Table.Th>Progress</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Card>
  );
}