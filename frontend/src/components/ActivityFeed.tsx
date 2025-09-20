import { Card, Title, Timeline, Text, Badge } from '@mantine/core';
import { faker } from '@faker-js/faker';

interface TimelineItem {
  title: string;
  description: string;
  timestamp: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export function ActivityFeed() {
  const generateActivityData = (): TimelineItem[] => {
    const types = ['success', 'warning', 'error', 'info'] as const;
    
    return Array.from({ length: 6 }, () => ({
      title: faker.company.buzzPhrase(),
      description: faker.lorem.sentence(),
      timestamp: faker.date.recent({ days: 7 }).toLocaleDateString(),
      type: faker.helpers.arrayElement(types)
    }));
  };

  const activities = generateActivityData();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'green';
      case 'warning': return 'yellow';
      case 'error': return 'red';
      case 'info': return 'blue';
      default: return 'gray';
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <Title order={3} p="md">Recent Activity</Title>
      </Card.Section>
      
      <Timeline active={activities.length} bulletSize={24} lineWidth={2}>
        {activities.map((activity, index) => (
          <Timeline.Item
            key={index}
            bullet={
              <Badge
                variant="filled"
                color={getTypeColor(activity.type)}
                size="sm"
                style={{ minWidth: 'auto' }}
              >
                {activity.type.charAt(0).toUpperCase()}
              </Badge>
            }
          >
            <Text size="sm" fw={500}>{activity.title}</Text>
            <Text size="xs" c="dimmed" mt={4}>
              {activity.description}
            </Text>
            <Text size="xs" c="dimmed" mt={2}>
              {activity.timestamp}
            </Text>
          </Timeline.Item>
        ))}
      </Timeline>
    </Card>
  );
}