import { Modal, Title, Text, Group, Badge, Grid, Card, Stack, Button, LoadingOverlay } from '@mantine/core';
import { useEffect, useState } from 'react';
import type { MunicipalityDetails } from '../services/municipalityService';
import { municipalityAPI } from '../services/municipalityService';

interface MunicipalityModalProps {
  opened: boolean;
  onClose: () => void;
  municipalityId: string | null;
  municipalityName: string;
  onShowCities: (municipalityId: string, municipalityName: string) => void;
}

export function MunicipalityModal({ 
  opened, 
  onClose, 
  municipalityId, 
  municipalityName,
  onShowCities 
}: MunicipalityModalProps) {
  const [details, setDetails] = useState<MunicipalityDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (opened && municipalityId) {
      loadMunicipalityDetails();
    }
  }, [opened, municipalityId]);

  const loadMunicipalityDetails = async () => {
    if (!municipalityId) return;
    
    setLoading(true);
    try {
      const data = await municipalityAPI.fetchMunicipalityDetails(municipalityId);
      setDetails(data);
    } catch (error) {
      console.error('Erro ao carregar detalhes do município:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowCities = () => {
    if (municipalityId) {
      onShowCities(municipalityId, municipalityName);
      onClose();
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num);
  };

  const formatPercentage = (num: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(num);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <Title order={3}>{municipalityName}</Title>
          <Badge color="blue" variant="light">Município</Badge>
        </Group>
      }
      size="xl"
      centered
    >
      <LoadingOverlay visible={loading} />
      
      {details && (
        <Stack gap="md">
          {/* Informações Básicas */}
          <Card withBorder>
            <Title order={4} mb="md">Informações Gerais</Title>
            <Grid>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">População</Text>
                <Text fw={500}>{formatNumber(details.municipality.population)} habitantes</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Área</Text>
                <Text fw={500}>{details.municipality.area} km²</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Densidade Demográfica</Text>
                <Text fw={500}>{details.municipality.density} hab/km²</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">PIB Municipal</Text>
                <Text fw={500}>{formatCurrency(details.municipality.gdp)}</Text>
              </Grid.Col>
            </Grid>
          </Card>

          {/* Saúde */}
          <Card withBorder>
            <Title order={4} mb="md">Indicadores de Saúde</Title>
            <Grid>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Hospitais Ativos</Text>
                <Text fw={500}>{details.health.activeHospitals}</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Leitos Disponíveis</Text>
                <Text fw={500}>{formatNumber(details.health.bedsAvailable)}</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Médicos por 1000 hab.</Text>
                <Text fw={500}>{details.health.doctorsPerThousand}</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Taxa de Vacinação</Text>
                <Text fw={500}>{formatPercentage(details.health.vaccinationRate)}</Text>
              </Grid.Col>
            </Grid>
          </Card>

          {/* Demografia */}
          <Card withBorder>
            <Title order={4} mb="md">Demografia</Title>
            <Text size="sm" c="dimmed" mb="xs">Faixas Etárias</Text>
            <Stack gap="xs" mb="md">
              {details.demographics.ageGroups.map((group) => (
                <Group key={group.label} justify="space-between">
                  <Text size="sm">{group.label}</Text>
                  <Badge variant="light">{group.percentage}%</Badge>
                </Group>
              ))}
            </Stack>
            
            <Text size="sm" c="dimmed" mb="xs">Escolaridade</Text>
            <Stack gap="xs">
              {details.demographics.education.map((edu) => (
                <Group key={edu.level} justify="space-between">
                  <Text size="sm">{edu.level}</Text>
                  <Badge variant="light">{edu.percentage}%</Badge>
                </Group>
              ))}
            </Stack>
          </Card>

          {/* Economia */}
          <Card withBorder>
            <Title order={4} mb="md">Economia</Title>
            <Grid>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">PIB per capita</Text>
                <Text fw={500}>{formatCurrency(details.economy.gdpPerCapita)}</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Taxa de Desemprego</Text>
                <Text fw={500}>{formatPercentage(details.economy.unemployment)}</Text>
              </Grid.Col>
              <Grid.Col span={12}>
                <Text size="sm" c="dimmed" mb="xs">Principais Setores</Text>
                <Group gap="xs">
                  {details.economy.majorIndustries.map((industry) => (
                    <Badge key={industry} variant="outline">{industry}</Badge>
                  ))}
                </Group>
              </Grid.Col>
            </Grid>
          </Card>

          {/* Botão para ver cidades */}
          <Group justify="center" mt="md">
            <Button 
              size="lg" 
              onClick={handleShowCities}
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan' }}
            >
              Ver Cidades do Município
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}