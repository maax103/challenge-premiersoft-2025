import { faker } from '@faker-js/faker';

export interface State {
  id: number;
  uf: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  region: string;
  created_at: string;
  updated_at: string;
}

export interface City {
  id: number;
  name: string;
  latitude: number | null;
  longitude: number | null;
  is_capital: boolean;
  state_id: number;
  siafi_id: number;
  area_code: number;
  time_zone: string;
  population: number;
}

export interface Hospital {
  id: string;
  name: string;
  city: number;
  neighborhood: string;
  total_beds: number;
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  id: string;
  full_name: string;
  specialty: string;
  city: number;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  cpf: string;
  full_name: string;
  gender: 'M' | 'F';
  city: number;
  neighborhood: string;
  has_insurance: boolean;
  cid_id: number;
  created_at: string;
  updated_at: string;
}

export interface CID {
  id: number;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
}

// Statistics interfaces
export interface StateStats {
  state: State;
  totalCities: number;
  totalPopulation: number;
  totalHospitals: number;
  totalBeds: number;
  totalDoctors: number;
  totalPatients: number;
  averagePopulationPerCity: number;
}

export interface CityStats {
  city: City;
  hospitals: Hospital[];
  totalBeds: number;
  totalDoctors: number;
  totalPatients: number;
  patientsWithInsurance: number;
  doctorsBySpecialty: Record<string, number>;
  commonDiseases: Array<{
    cid: CID;
    count: number;
  }>;
}

// Mock data generators
const generateState = (stateId: number): State => ({
  id: stateId,
  uf: faker.location.state({ abbreviated: true }),
  name: faker.location.state(),
  latitude: faker.location.latitude({ min: -33.7, max: 5.3 }),
  longitude: faker.location.longitude({ min: -73.9, max: -34.8 }),
  region: faker.helpers.arrayElement(['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul']),
  created_at: faker.date.past().toISOString(),
  updated_at: faker.date.recent().toISOString(),
});

const generateCity = (stateId: number): City => ({
  id: faker.number.int({ min: 1000000, max: 9999999 }),
  name: faker.location.city(),
  latitude: faker.location.latitude({ min: -33.7, max: 5.3 }),
  longitude: faker.location.longitude({ min: -73.9, max: -34.8 }),
  is_capital: faker.datatype.boolean({ probability: 0.1 }),
  state_id: stateId,
  siafi_id: faker.number.int({ min: 1000, max: 9999 }),
  area_code: faker.number.int({ min: 11, max: 89 }),
  time_zone: faker.helpers.arrayElement(['America/Sao_Paulo', 'America/Manaus', 'America/Fortaleza', 'America/Campo_Grande']),
  population: faker.number.int({ min: 5000, max: 2000000 }),
});

const generateHospital = (): Hospital => ({
  id: faker.string.uuid(),
  name: `Hospital ${faker.company.name()}`,
  city: faker.number.int({ min: 1000000, max: 9999999 }),
  neighborhood: faker.location.street(),
  total_beds: faker.number.int({ min: 20, max: 500 }),
  created_at: faker.date.past().toISOString(),
  updated_at: faker.date.recent().toISOString(),
});

const generateDoctor = (): Doctor => ({
  id: faker.string.uuid(),
  full_name: faker.person.fullName(),
  specialty: faker.helpers.arrayElement([
    'Cardiologia', 'Pediatria', 'Neurologia', 'Ortopedia', 'Dermatologia',
    'Ginecologia', 'Urologia', 'Psiquiatria', 'Oftalmologia', 'Endocrinologia'
  ]),
  city: faker.number.int({ min: 1000000, max: 9999999 }),
  created_at: faker.date.past().toISOString(),
  updated_at: faker.date.recent().toISOString(),
});

const generatePatient = (): Patient => ({
  id: faker.string.uuid(),
  cpf: faker.string.numeric(11),
  full_name: faker.person.fullName(),
  gender: faker.helpers.arrayElement(['M', 'F']),
  city: faker.number.int({ min: 1000000, max: 9999999 }),
  neighborhood: faker.location.street(),
  has_insurance: faker.datatype.boolean(),
  cid_id: faker.number.int({ min: 1, max: 100 }),
  created_at: faker.date.past().toISOString(),
  updated_at: faker.date.recent().toISOString(),
});

const generateCID = (): CID => ({
  id: faker.number.int({ min: 1, max: 100 }),
  code: `${faker.string.alpha({ length: 1, casing: 'upper' })}${faker.string.numeric(2)}`,
  name: faker.helpers.arrayElement([
    'Hipertensão arterial', 'Diabetes mellitus', 'Asma', 'Bronquite',
    'Gastrite', 'Enxaqueca', 'Artrite', 'Depressão', 'Ansiedade',
    'Pneumonia', 'Anemia', 'Obesidade'
  ]),
  created_at: faker.date.past().toISOString(),
  updated_at: faker.date.recent().toISOString(),
});

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// HTTP Client
class HttpClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle Laravel API response format
    if (data.success === false) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data.data || data;
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

const httpClient = new HttpClient(API_BASE_URL);

export const apiService = {
  async fetchStateStats(stateId: number): Promise<StateStats> {
    const response = await httpClient.get<any>(`/geography/states/${stateId}/stats`);
    
    // Transform backend response to match frontend interface
    return {
      state: {
        id: response.id,
        uf: response.uf,
        name: response.name,
        latitude: response.coordinates?.latitude || null,
        longitude: response.coordinates?.longitude || null,
        region: response.region,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      totalCities: response.totalCities,
      totalPopulation: response.totalPopulation,
      totalHospitals: faker.number.int({ min: 20, max: 1000 }), // Mock for now
      totalBeds: faker.number.int({ min: 5000, max: 50000 }), // Mock for now
      totalDoctors: faker.number.int({ min: 1000, max: 20000 }), // Mock for now
      totalPatients: faker.number.int({ min: 10000, max: 500000 }), // Mock for now
      averagePopulationPerCity: response.averagePopulation,
    };
  },

  async fetchCitiesByState(stateId: number): Promise<City[]> {
    const cities = await httpClient.get<any[]>(`/geography/states/${stateId}/cities`);
    
    return cities.map(city => ({
      id: city.id,
      name: city.name,
      latitude: city.latitude,
      longitude: city.longitude,
      is_capital: city.is_capital || false,
      state_id: city.state_id,
      siafi_id: city.siafi_id || 0,
      area_code: city.area_code || 0,
      time_zone: city.time_zone || 'America/Sao_Paulo',
      population: city.population || 0,
    }));
  },

  async fetchCityById(cityId: number): Promise<City> {
    const city = await httpClient.get<any>(`/geography/cities/${cityId}`);
    
    return {
      id: city.id,
      name: city.name,
      latitude: city.latitude,
      longitude: city.longitude,
      is_capital: city.is_capital || false,
      state_id: city.state_id,
      siafi_id: city.siafi_id || 0,
      area_code: city.area_code || 0,
      time_zone: city.time_zone || 'America/Sao_Paulo',
      population: city.population || 0,
    };
  },

  async fetchCityStats(cityId: number): Promise<CityStats> {
    try {
      const response = await httpClient.get<any>(`/geography/cities/${cityId}/stats`);
      
      // For now, combine real city data with mock stats since backend doesn't have all stats yet
      const city = await this.fetchCityById(cityId);
      
      const hospitals = Array.from({ length: faker.number.int({ min: 1, max: 8 }) }, () => 
        generateHospital()
      );
      
      const totalBeds = hospitals.reduce((sum, hospital) => sum + hospital.total_beds, 0);
      const totalDoctors = faker.number.int({ min: 50, max: 500 });
      const totalPatients = faker.number.int({ min: 100, max: 2000 });
      const patientsWithInsurance = faker.number.int({ min: 20, max: totalPatients });
      
      const specialties = ['Cardiologia', 'Pediatria', 'Neurologia', 'Ortopedia', 'Dermatologia'];
      const doctorsBySpecialty: Record<string, number> = {};
      specialties.forEach(specialty => {
        doctorsBySpecialty[specialty] = faker.number.int({ min: 5, max: 50 });
      });
      
      const commonDiseases = Array.from({ length: 5 }, () => ({
        cid: generateCID(),
        count: faker.number.int({ min: 10, max: 100 })
      }));
      
      return {
        city,
        hospitals,
        totalBeds,
        totalDoctors,
        totalPatients,
        patientsWithInsurance,
        doctorsBySpecialty,
        commonDiseases,
      };
    } catch (error) {
      console.warn('Failed to fetch city stats from API, falling back to mock data:', error);
      // Fallback to mock data if API fails
      const city = generateCity(cityId);
      const hospitals = Array.from({ length: faker.number.int({ min: 1, max: 8 }) }, () => 
        generateHospital()
      );
      
      const totalBeds = hospitals.reduce((sum, hospital) => sum + hospital.total_beds, 0);
      const totalDoctors = faker.number.int({ min: 50, max: 500 });
      const totalPatients = faker.number.int({ min: 100, max: 2000 });
      const patientsWithInsurance = faker.number.int({ min: 20, max: totalPatients });
      
      const specialties = ['Cardiologia', 'Pediatria', 'Neurologia', 'Ortopedia', 'Dermatologia'];
      const doctorsBySpecialty: Record<string, number> = {};
      specialties.forEach(specialty => {
        doctorsBySpecialty[specialty] = faker.number.int({ min: 5, max: 50 });
      });
      
      const commonDiseases = Array.from({ length: 5 }, () => ({
        cid: generateCID(),
        count: faker.number.int({ min: 10, max: 100 })
      }));
      
      return {
        city,
        hospitals,
        totalBeds,
        totalDoctors,
        totalPatients,
        patientsWithInsurance,
        doctorsBySpecialty,
        commonDiseases,
      };
    }
  },

  // Additional utility methods
  async fetchAllStates(): Promise<State[]> {
    const states = await httpClient.get<any[]>('/geography/states');
    
    return states.map(state => ({
      id: state.id,
      uf: state.uf,
      name: state.name,
      latitude: state.latitude,
      longitude: state.longitude,
      region: state.region,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  },

  async fetchHospitalsByCity(_cityId: number): Promise<Hospital[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return Array.from({ length: faker.number.int({ min: 1, max: 10 }) }, () => 
      generateHospital()
    );
  },

  async fetchDoctorsBySpecialty(_specialty: string): Promise<Doctor[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return Array.from({ length: faker.number.int({ min: 5, max: 25 }) }, () => 
      generateDoctor()
    );
  },

  async fetchPatientsByCity(_cityId: number): Promise<Patient[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return Array.from({ length: faker.number.int({ min: 50, max: 200 }) }, () => 
      generatePatient()
    );
  },

  async fetchCIDList(): Promise<CID[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return Array.from({ length: 50 }, () => generateCID());
  }
};