# Sistema de Informações Geográficas e de Saúde

## Visão Geral

O **Sistema de Informações Geográficas e de Saúde** é uma API RESTful desenvolvida em Laravel que oferece informações detalhadas sobre estados, cidades, hospitais, médicos, pacientes e classificações de doenças (CID-10) do Brasil. O sistema foi projetado para fornecer dados estruturados que suportam análises geográficas e de saúde pública.

## Objetivo do Sistema

O sistema tem como principais objetivos:

- **Centralizar informações geográficas** do Brasil (estados e municípios)
- **Disponibilizar dados de saúde** organizados por localização
- **Facilitar análises estatísticas** de distribuição de recursos de saúde
- **Fornecer insights** sobre padrões de doenças e especialidades médicas por região
- **Suportar tomadas de decisão** em políticas públicas de saúde

## Domínio de Negócio

### Entidades Principais

#### 1. **Geografia**
- **Estados**: Informações completas sobre os 26 estados brasileiros + Distrito Federal
  - Código UF, nome, região, coordenadas geográficas
  - Estatísticas populacionais e administrativas
  
- **Cidades**: Dados detalhados sobre municípios brasileiros
  - Identificação única, população, coordenadas
  - Indicador de capital, código SIAFI, fuso horário
  - Relacionamento com estado de origem

#### 2. **Recursos de Saúde**
- **Hospitais**: Instituições de saúde cadastradas
  - Identificação, localização por bairro
  - Capacidade (número de leitos)
  - Distribuição geográfica

- **Médicos**: Profissionais de saúde por especialidade
  - Especialidade médica, localização
  - Distribuição por cidade e região

#### 3. **Informações Epidemiológicas**
- **Pacientes**: Dados demográficos e de saúde
  - Informações pessoais (CPF, nome, gênero)
  - Localização (cidade, bairro)
  - Status de convênio médico
  - Classificação de doença (CID)

- **CID-10**: Classificação Internacional de Doenças
  - Códigos e descrições das doenças
  - Estatísticas de prevalência por região

## Funcionalidades Principais

### 1. **Consultas Geográficas**
- Listar todos os estados brasileiros
- Obter detalhes específicos de um estado
- Consultar cidades por estado
- Buscar informações detalhadas de uma cidade específica

### 2. **Análises Estatísticas**
- Estatísticas populacionais por estado
- Distribuição de recursos de saúde por cidade
- Densidade médica por especialidade
- Análise de doenças mais comuns por região

### 3. **Pesquisas Especializadas**
- Buscar médicos por especialidade
- Consultar capacidade hospitalar por região
- Analisar cobertura de convênios médicos
- Mapear prevalência de doenças específicas

## Regras de Negócio

### **Hierarquia Geográfica**
- Cada cidade pertence a exatamente um estado
- Estados são agrupados por regiões geográficas (Norte, Nordeste, Sudeste, Sul, Centro-Oeste)
- Coordenadas geográficas seguem o padrão WGS84

### **Distribuição de Recursos**
- Cidades capitais tendem a concentrar mais recursos de saúde
- A capacidade hospitalar é proporcional à população local
- Especialidades médicas são distribuídas conforme demanda regional

### **Classificação de Pacientes**
- Pacientes são classificados por localização geográfica
- Cada paciente possui uma classificação CID-10 principal
- Status de convênio médico influencia nas estatísticas de cobertura

### **Estatísticas Derivadas**
- População média por cidade é calculada dinamicamente
- Densidade médica considera proporção médicos/população
- Capacidade hospitalar é medida em leitos por 100.000 habitantes

## Casos de Uso

### **Para Gestores Públicos**
- Identificar regiões com carência de especialistas médicos
- Planejar distribuição de recursos hospitalares
- Analisar padrões epidemiológicos regionais
- Avaliar cobertura de convênios médicos

### **Para Pesquisadores**
- Estudar correlações geográficas de doenças
- Analisar distribuição de especialidades médicas
- Investigar padrões de acesso à saúde
- Mapear inequidades regionais

### **Para Aplicações Client-Side**
- Exibir mapas interativos de recursos de saúde
- Criar dashboards de indicadores de saúde
- Implementar sistemas de busca por especialistas
- Desenvolver ferramentas de análise geográfica

## Arquitetura Técnica

### **Padrão de Design**
- **Domain-Driven Design (DDD)**: Separação clara entre domínio de negócio e infraestrutura
- **Action Pattern**: Cada operação de negócio é encapsulada em uma Action específica
- **Factory Pattern**: Geração de dados mockados para desenvolvimento e testes

### **Estrutura de Dados**
- **Normalização**: Relacionamentos bem definidos entre entidades
- **Índices Geográficos**: Otimização para consultas por localização
- **Códigos Padronizados**: Uso de códigos oficiais (IBGE, SIAFI, CID-10)

### **Respostas Padronizadas**
- Todas as respostas seguem formato JSON consistente
- Incluem status de sucesso, dados e mensagens descritivas
- Tratamento adequado de erros com códigos HTTP apropriados

## Roadmap Futuro

### **Expansões Planejadas**
- Integração com APIs governamentais (DATASUS, IBGE)
- Implementação de cache inteligente para consultas frequentes
- Adição de filtros avançados por faixa etária e gênero
- Integração com sistemas de geolocalização em tempo real

### **Melhorias Técnicas**
- Implementação de rate limiting
- Adição de documentação interativa (Swagger UI)
- Testes automatizados abrangentes
- Monitoramento e métricas de performance

---

*Este sistema representa uma ferramenta fundamental para análises de saúde pública e planejamento territorial, fornecendo dados estruturados e confiáveis para suporte à tomada de decisões estratégicas no setor de saúde brasileiro.*