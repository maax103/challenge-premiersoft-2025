import { faker } from '@faker-js/faker';

export interface Municipality {
  id: string;
  name: string;
  state: string;
  population: number;
  area: number;
  density: number;
  gdp: number;
  healthIndex: number;
  hospitals: number;
  schools: number;
  coordinates: [number, number];
}

export interface City {
  id: string;
  name: string;
  municipalityId: string;
  population: number;
  area: number;
  districts: number;
  healthFacilities: number;
  coordinates: [number, number];
}

export interface MunicipalityDetails {
  municipality: Municipality;
  demographics: {
    ageGroups: { label: string; percentage: number }[];
    education: { level: string; percentage: number }[];
  };
  health: {
    activeHospitals: number;
    bedsAvailable: number;
    doctorsPerThousand: number;
    vaccinationRate: number;
  };
  economy: {
    gdpPerCapita: number;
    unemployment: number;
    majorIndustries: string[];
  };
}

// Simulate API functions that will be replaced with real backend calls
export const municipalityAPI = {
  // This function simulates fetching municipality data by ID
  async fetchMunicipalityById(id: string): Promise<Municipality> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      id,
      name: faker.location.city(),
      state: faker.location.state(),
      population: faker.number.int({ min: 10000, max: 500000 }),
      area: faker.number.float({ min: 100, max: 5000, fractionDigits: 1 }),
      density: faker.number.float({ min: 10, max: 500, fractionDigits: 1 }),
      gdp: faker.number.float({ min: 1000000, max: 50000000, fractionDigits: 0 }),
      healthIndex: faker.number.float({ min: 0.6, max: 0.95, fractionDigits: 2 }),
      hospitals: faker.number.int({ min: 1, max: 15 }),
      schools: faker.number.int({ min: 5, max: 50 }),
      coordinates: [
        faker.location.latitude({ min: -33.7, max: 5.3 }),
        faker.location.longitude({ min: -73.9, max: -34.8 })
      ]
    };
  },

  async fetchMunicipalityDetails(id: string): Promise<MunicipalityDetails> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const municipality = await this.fetchMunicipalityById(id);
    
    return {
      municipality,
      demographics: {
        ageGroups: [
          { label: '0-17 anos', percentage: faker.number.int({ min: 15, max: 25 }) },
          { label: '18-39 anos', percentage: faker.number.int({ min: 25, max: 35 }) },
          { label: '40-59 anos', percentage: faker.number.int({ min: 20, max: 30 }) },
          { label: '60+ anos', percentage: faker.number.int({ min: 10, max: 20 }) }
        ],
        education: [
          { level: 'Fundamental', percentage: faker.number.int({ min: 30, max: 50 }) },
          { level: 'Médio', percentage: faker.number.int({ min: 25, max: 40 }) },
          { level: 'Superior', percentage: faker.number.int({ min: 10, max: 25 }) }
        ]
      },
      health: {
        activeHospitals: municipality.hospitals,
        bedsAvailable: faker.number.int({ min: 50, max: 500 }),
        doctorsPerThousand: faker.number.float({ min: 1.5, max: 4.5, fractionDigits: 1 }),
        vaccinationRate: faker.number.float({ min: 0.7, max: 0.98, fractionDigits: 2 })
      },
      economy: {
        gdpPerCapita: municipality.gdp / municipality.population,
        unemployment: faker.number.float({ min: 0.03, max: 0.15, fractionDigits: 2 }),
        majorIndustries: faker.helpers.arrayElements([
          'Agricultura', 'Indústria', 'Serviços', 'Turismo', 'Mineração', 'Tecnologia'
        ], { min: 2, max: 4 })
      }
    };
  },

  async fetchCitiesByMunicipality(municipalityId: string): Promise<City[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return Array.from({ length: faker.number.int({ min: 3, max: 8 }) }, () => ({
      id: faker.string.uuid(),
      name: faker.location.city(),
      municipalityId,
      population: faker.number.int({ min: 1000, max: 50000 }),
      area: faker.number.float({ min: 10, max: 500, fractionDigits: 1 }),
      districts: faker.number.int({ min: 1, max: 8 }),
      healthFacilities: faker.number.int({ min: 1, max: 5 }),
      coordinates: [
        faker.location.latitude({ min: -33.7, max: 5.3 }),
        faker.location.longitude({ min: -73.9, max: -34.8 })
      ]
    }));
  }
};