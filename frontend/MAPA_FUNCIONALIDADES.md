# Dashboard com Mapa Interativo do Brasil

## Funcionalidades Implementadas

### 🗺️ Navegação Hierárquica no Mapa
O dashboard agora possui um sistema de navegação hierárquica que permite:

1. **Visualização Nacional**: Mapa do Brasil mostrando estados e municípios
2. **Drill-down para Município**: Ao clicar em um município, o usuário pode:
   - Ver dados detalhados do município em um modal
   - Navegar para visualizar apenas as cidades daquele município
3. **Visualização por Cidades**: Mapa focado nas cidades do município selecionado

### 📊 Modal de Detalhes do Município
Quando o usuário clica em um município, um modal é exibido com:

- **Informações Gerais**: População, área, densidade demográfica, PIB
- **Indicadores de Saúde**: Hospitais ativos, leitos disponíveis, médicos por mil habitantes, taxa de vacinação
- **Demografia**: Distribuição por faixas etárias e níveis de escolaridade
- **Economia**: PIB per capita, taxa de desemprego, principais setores econômicos
- **Botão "Ver Cidades do Município"**: Para navegar para o mapa das cidades

### 🏙️ Visualização de Cidades
Após clicar em "Ver Cidades do Município":
- O mapa muda para mostrar apenas as cidades do município selecionado
- As cidades aparecem como pontos circulares amarelos
- Ao clicar em uma cidade, exibe informações básicas e um botão para ver dados detalhados
- Botão "Voltar ao Mapa Nacional" para retornar à visualização principal

### 🔧 Preparação para Backend
A arquitetura foi preparada para integração com backend:

#### Serviço de API (`municipalityService.ts`)
```typescript
export const municipalityAPI = {
  async fetchMunicipalityById(id: string): Promise<Municipality>
  async fetchMunicipalityDetails(id: string): Promise<MunicipalityDetails>
  async fetchCitiesByMunicipality(municipalityId: string): Promise<City[]>
}
```

**Para integrar com o backend, basta substituir as implementações fake por chamadas reais:**

```typescript
// Exemplo de integração com backend real
async fetchMunicipalityById(id: string): Promise<Municipality> {
  const response = await fetch(`/api/municipalities/${id}`);
  return response.json();
}

async fetchMunicipalityDetails(id: string): Promise<MunicipalityDetails> {
  const response = await fetch(`/api/municipalities/${id}/details`);
  return response.json();
}

async fetchCitiesByMunicipality(municipalityId: string): Promise<City[]> {
  const response = await fetch(`/api/municipalities/${municipalityId}/cities`);
  return response.json();
}
```

### 📱 Interface do Usuário
- **Indicadores visuais**: Badges e cores diferentes para cada nível (país, município, cidade)
- **Instruções contextuais**: Textos explicativos sobre como interagir com o mapa
- **Navegação intuitiva**: Botões claros para navegar entre diferentes níveis
- **Loading states**: Indicadores de carregamento durante as transições

### 🎨 Tecnologias Utilizadas
- **React** + **TypeScript**
- **Mantine UI** para componentes
- **React-Leaflet** para mapas interativos
- **TopoJSON-client** para dados geográficos
- **Faker.js** para dados de demonstração

### 📈 Dados Simulados
Todos os dados são gerados dinamicamente usando Faker.js para simular:
- Informações demográficas realistas
- Indicadores de saúde
- Dados econômicos
- Informações geográficas

### 🚀 Como Usar
1. Na visualização inicial, ative a opção "Show Municipalities"
2. Clique em qualquer município no mapa
3. No modal que abrir, explore os dados e clique em "Ver Cidades do Município"
4. No mapa de cidades, clique nos pontos amarelos para ver dados específicos
5. Use o botão "Voltar ao Mapa Nacional" para retornar

Esta implementação fornece uma base sólida para um sistema de visualização geográfica hierárquica, pronto para ser integrado com dados reais de um backend.