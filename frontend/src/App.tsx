import './App.css'
import { Container, Title, Grid, Space, Group, Button, Switch } from '@mantine/core'
import { useState } from 'react'
import { BrazilMap } from './components/BrazilMap'
import { StatCard, generateRandomStats } from './components/StatCard'
import { DataTable } from './components/DataTable'
import { ChartWidget } from './components/ChartWidget'
import { ActivityFeed } from './components/ActivityFeed'

function App() {
  const [stats] = useState(generateRandomStats())
  const [showStates, setShowStates] = useState(true)
  const [showMunicipalities, setShowMunicipalities] = useState(false)

  const refreshData = () => {
    window.location.reload()
  }

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="xl">
        <Title order={1} c="blue">
          Healthcare Dashboard
        </Title>
        <Button onClick={refreshData} variant="light">
          Refresh Data
        </Button>
      </Group>

      {/* Statistics Cards */}
      <Grid mb="xl">
        {stats.map((stat, index) => (
          <Grid.Col key={index} span={{ base: 12, sm: 6, lg: 3 }}>
            <StatCard {...stat} />
          </Grid.Col>
        ))}
      </Grid>

      {/* Map and Chart Section */}
      <Grid mb="xl">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Group mb="md">
            <Switch
              label="Show States"
              checked={showStates}
              onChange={(event) => setShowStates(event.currentTarget.checked)}
            />
            <Switch
              label="Show Municipalities"
              checked={showMunicipalities}
              onChange={(event) => setShowMunicipalities(event.currentTarget.checked)}
            />
          </Group>
          <BrazilMap 
            height={500} 
            showStates={showStates}
            showMunicipalities={showMunicipalities}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <ChartWidget />
          <Space h="md" />
          <ActivityFeed />
        </Grid.Col>
      </Grid>

      {/* Data Table */}
      <DataTable />
    </Container>
  )
}

export default App
