<?php

namespace App\Domain\Geography\Factories;

class CityDataFactory
{
    private static array $citiesByState = [
        35 => [ // São Paulo
            ['id' => 3550308, 'name' => 'São Paulo', 'latitude' => -23.5489, 'longitude' => -46.6388, 'is_capital' => true, 'population' => 12396372, 'state_id' => 35],
            ['id' => 3509502, 'name' => 'Campinas', 'latitude' => -22.9056, 'longitude' => -47.0608, 'is_capital' => false, 'population' => 1213792, 'state_id' => 35],
            ['id' => 3552205, 'name' => 'Santos', 'latitude' => -23.9537, 'longitude' => -46.3369, 'is_capital' => false, 'population' => 433991, 'state_id' => 35],
            ['id' => 3518800, 'name' => 'Guarulhos', 'latitude' => -23.4538, 'longitude' => -46.5333, 'is_capital' => false, 'population' => 1392121, 'state_id' => 35],
            ['id' => 3534401, 'name' => 'Osasco', 'latitude' => -23.5329, 'longitude' => -46.7918, 'is_capital' => false, 'population' => 696382, 'state_id' => 35],
        ],
        33 => [ // Rio de Janeiro
            ['id' => 3304557, 'name' => 'Rio de Janeiro', 'latitude' => -22.9035, 'longitude' => -43.2096, 'is_capital' => true, 'population' => 6747815, 'state_id' => 33],
            ['id' => 3301702, 'name' => 'Duque de Caxias', 'latitude' => -22.7856, 'longitude' => -43.3117, 'is_capital' => false, 'population' => 924624, 'state_id' => 33],
            ['id' => 3303500, 'name' => 'Nova Iguaçu', 'latitude' => -22.7592, 'longitude' => -43.4507, 'is_capital' => false, 'population' => 821128, 'state_id' => 33],
            ['id' => 3304904, 'name' => 'São Gonçalo', 'latitude' => -22.8267, 'longitude' => -43.0537, 'is_capital' => false, 'population' => 1091737, 'state_id' => 33],
        ],
        31 => [ // Minas Gerais
            ['id' => 3106200, 'name' => 'Belo Horizonte', 'latitude' => -19.9167, 'longitude' => -43.9345, 'is_capital' => true, 'population' => 2530701, 'state_id' => 31],
            ['id' => 3170206, 'name' => 'Uberlândia', 'latitude' => -18.9113, 'longitude' => -48.2622, 'is_capital' => false, 'population' => 699097, 'state_id' => 31],
            ['id' => 3106705, 'name' => 'Betim', 'latitude' => -19.9678, 'longitude' => -44.1988, 'is_capital' => false, 'population' => 444784, 'state_id' => 31],
            ['id' => 3118601, 'name' => 'Contagem', 'latitude' => -19.9317, 'longitude' => -44.0536, 'is_capital' => false, 'population' => 668949, 'state_id' => 31],
        ],
        41 => [ // Paraná
            ['id' => 4106902, 'name' => 'Curitiba', 'latitude' => -25.4278, 'longitude' => -49.2731, 'is_capital' => true, 'population' => 1963726, 'state_id' => 41],
            ['id' => 4115200, 'name' => 'Londrina', 'latitude' => -23.3045, 'longitude' => -51.1696, 'is_capital' => false, 'population' => 575377, 'state_id' => 41],
            ['id' => 4113700, 'name' => 'Maringá', 'latitude' => -23.4205, 'longitude' => -51.9331, 'is_capital' => false, 'population' => 430157, 'state_id' => 41],
            ['id' => 4108304, 'name' => 'Foz do Iguaçu', 'latitude' => -25.5478, 'longitude' => -54.5882, 'is_capital' => false, 'population' => 258248, 'state_id' => 41],
        ],
        43 => [ // Rio Grande do Sul
            ['id' => 4314902, 'name' => 'Porto Alegre', 'latitude' => -30.0346, 'longitude' => -51.2177, 'is_capital' => true, 'population' => 1492530, 'state_id' => 43],
            ['id' => 4304606, 'name' => 'Caxias do Sul', 'latitude' => -29.1634, 'longitude' => -51.1797, 'is_capital' => false, 'population' => 517451, 'state_id' => 43],
            ['id' => 4314100, 'name' => 'Pelotas', 'latitude' => -31.7654, 'longitude' => -52.3376, 'is_capital' => false, 'population' => 343651, 'state_id' => 43],
            ['id' => 4304101, 'name' => 'Canoas', 'latitude' => -29.9177, 'longitude' => -51.1844, 'is_capital' => false, 'population' => 348208, 'state_id' => 43],
        ],
        23 => [ // Ceará
            ['id' => 2304400, 'name' => 'Fortaleza', 'latitude' => -3.7319, 'longitude' => -38.5267, 'is_capital' => true, 'population' => 2703391, 'state_id' => 23],
            ['id' => 2307650, 'name' => 'Juazeiro do Norte', 'latitude' => -7.2138, 'longitude' => -39.3158, 'is_capital' => false, 'population' => 278264, 'state_id' => 23],
            ['id' => 2310308, 'name' => 'Sobral', 'latitude' => -3.6886, 'longitude' => -40.3499, 'is_capital' => false, 'population' => 208935, 'state_id' => 23],
        ],
        29 => [ // Bahia
            ['id' => 2927408, 'name' => 'Salvador', 'latitude' => -12.9714, 'longitude' => -38.5014, 'is_capital' => true, 'population' => 2886698, 'state_id' => 29],
            ['id' => 2910800, 'name' => 'Feira de Santana', 'latitude' => -12.2667, 'longitude' => -38.9667, 'is_capital' => false, 'population' => 619609, 'state_id' => 29],
            ['id' => 2932408, 'name' => 'Vitória da Conquista', 'latitude' => -14.8619, 'longitude' => -40.8442, 'is_capital' => false, 'population' => 341597, 'state_id' => 29],
        ]
    ];

    private static array $allCities = [
        3550308 => ['id' => 3550308, 'name' => 'São Paulo', 'latitude' => -23.5489, 'longitude' => -46.6388, 'is_capital' => true, 'population' => 12396372, 'state_id' => 35, 'area_code' => 11, 'time_zone' => 'America/Sao_Paulo'],
        3304557 => ['id' => 3304557, 'name' => 'Rio de Janeiro', 'latitude' => -22.9035, 'longitude' => -43.2096, 'is_capital' => true, 'population' => 6747815, 'state_id' => 33, 'area_code' => 21, 'time_zone' => 'America/Sao_Paulo'],
        3106200 => ['id' => 3106200, 'name' => 'Belo Horizonte', 'latitude' => -19.9167, 'longitude' => -43.9345, 'is_capital' => true, 'population' => 2530701, 'state_id' => 31, 'area_code' => 31, 'time_zone' => 'America/Sao_Paulo'],
        4106902 => ['id' => 4106902, 'name' => 'Curitiba', 'latitude' => -25.4278, 'longitude' => -49.2731, 'is_capital' => true, 'population' => 1963726, 'state_id' => 41, 'area_code' => 41, 'time_zone' => 'America/Sao_Paulo'],
        4314902 => ['id' => 4314902, 'name' => 'Porto Alegre', 'latitude' => -30.0346, 'longitude' => -51.2177, 'is_capital' => true, 'population' => 1492530, 'state_id' => 43, 'area_code' => 51, 'time_zone' => 'America/Sao_Paulo'],
        2304400 => ['id' => 2304400, 'name' => 'Fortaleza', 'latitude' => -3.7319, 'longitude' => -38.5267, 'is_capital' => true, 'population' => 2703391, 'state_id' => 23, 'area_code' => 85, 'time_zone' => 'America/Fortaleza'],
        2927408 => ['id' => 2927408, 'name' => 'Salvador', 'latitude' => -12.9714, 'longitude' => -38.5014, 'is_capital' => true, 'population' => 2886698, 'state_id' => 29, 'area_code' => 71, 'time_zone' => 'America/Bahia'],
        // Add more cities from the citiesByState array
        3509502 => ['id' => 3509502, 'name' => 'Campinas', 'latitude' => -22.9056, 'longitude' => -47.0608, 'is_capital' => false, 'population' => 1213792, 'state_id' => 35, 'area_code' => 19, 'time_zone' => 'America/Sao_Paulo'],
        3301702 => ['id' => 3301702, 'name' => 'Duque de Caxias', 'latitude' => -22.7856, 'longitude' => -43.3117, 'is_capital' => false, 'population' => 924624, 'state_id' => 33, 'area_code' => 21, 'time_zone' => 'America/Sao_Paulo'],
        3170206 => ['id' => 3170206, 'name' => 'Uberlândia', 'latitude' => -18.9113, 'longitude' => -48.2622, 'is_capital' => false, 'population' => 699097, 'state_id' => 31, 'area_code' => 34, 'time_zone' => 'America/Sao_Paulo'],
        4115200 => ['id' => 4115200, 'name' => 'Londrina', 'latitude' => -23.3045, 'longitude' => -51.1696, 'is_capital' => false, 'population' => 575377, 'state_id' => 41, 'area_code' => 43, 'time_zone' => 'America/Sao_Paulo'],
        4304606 => ['id' => 4304606, 'name' => 'Caxias do Sul', 'latitude' => -29.1634, 'longitude' => -51.1797, 'is_capital' => false, 'population' => 517451, 'state_id' => 43, 'area_code' => 54, 'time_zone' => 'America/Sao_Paulo'],
    ];

    public static function getCitiesByState(int $stateId): array
    {
        return self::$citiesByState[$stateId] ?? [];
    }

    public static function getCityById(int $cityId): ?array
    {
        return self::$allCities[3509502] ?? null;
    }

    public static function getCityStatsById(int $cityId): ?array
    {
        $city = self::getCityById($cityId);
        
        if (!$city) {
            return null;
        }

        // Generate realistic stats based on population
        $population = $city['population'];
        $baseHospitals = max(1, intval($population / 100000));
        $hospitalsCount = $baseHospitals + rand(0, 3);
        
        // Generate hospitals array with detailed information
        $hospitals = [];
        for ($i = 0; $i < $hospitalsCount; $i++) {
            $hospitals[] = [
                'id' => 'hosp_' . $cityId . '_' . ($i + 1),
                'name' => self::generateHospitalName(),
                'city' => $cityId,
                'neighborhood' => self::generateNeighborhood(),
                'total_beds' => rand(50, 500),
                'created_at' => date('Y-m-d H:i:s', strtotime('-' . rand(1, 10) . ' years')),
                'updated_at' => date('Y-m-d H:i:s', strtotime('-' . rand(1, 30) . ' days')),
            ];
        }

        $totalBeds = array_sum(array_column($hospitals, 'total_beds'));
        $totalDoctors = intval($population * 0.0008) + rand(0, 100);
        $totalPatients = intval($population * 0.02) + rand(0, 1000);
        $patientsWithInsurance = intval($totalPatients * (0.3 + rand(0, 40) / 100));

        // Generate doctors by specialty
        $specialties = ['Cardiologia', 'Pediatria', 'Neurologia', 'Ortopedia', 'Dermatologia'];
        $doctorsBySpecialty = [];
        foreach ($specialties as $specialty) {
            $doctorsBySpecialty[$specialty] = intval($totalDoctors / count($specialties)) + rand(-20, 20);
        }

        // Generate common diseases (CID)
        $commonDiseases = [
            ['cid' => ['id' => 1, 'code' => 'I10', 'name' => 'Hipertensão arterial'], 'count' => rand(50, 200)],
            ['cid' => ['id' => 2, 'code' => 'E11', 'name' => 'Diabetes mellitus'], 'count' => rand(30, 150)],
            ['cid' => ['id' => 3, 'code' => 'J45', 'name' => 'Asma'], 'count' => rand(20, 100)],
            ['cid' => ['id' => 4, 'code' => 'K29', 'name' => 'Gastrite'], 'count' => rand(40, 120)],
            ['cid' => ['id' => 5, 'code' => 'G43', 'name' => 'Enxaqueca'], 'count' => rand(25, 80)],
        ];

        return [
            'city' => [
                'id' => $city['id'],
                'name' => $city['name'],
                'latitude' => $city['latitude'],
                'longitude' => $city['longitude'],
                'is_capital' => $city['is_capital'],
                'population' => $city['population'],
                'state_id' => $city['state_id'],
                'siafi_id' => rand(1000, 9999),
                'area_code' => $city['area_code'] ?? 11,
                'time_zone' => $city['time_zone'] ?? 'America/Sao_Paulo',
            ],
            'hospitals' => $hospitals,
            'totalBeds' => $totalBeds,
            'totalDoctors' => $totalDoctors,
            'totalPatients' => $totalPatients,
            'patientsWithInsurance' => $patientsWithInsurance,
            'doctorsBySpecialty' => $doctorsBySpecialty,
            'commonDiseases' => $commonDiseases,
        ];
    }

    private static function generateHospitalName(): string
    {
        $prefixes = ['Hospital', 'Hospital Regional', 'Hospital Municipal', 'Hospital Geral'];
        $suffixes = ['São José', 'Santa Maria', 'São Paulo', 'Central', 'do Coração', 'da Criança', 'Municipal', 'Regional'];
        
        return $prefixes[array_rand($prefixes)] . ' ' . $suffixes[array_rand($suffixes)];
    }

    private static function generateNeighborhood(): string
    {
        $neighborhoods = [
            'Centro', 'Jardim das Flores', 'Vila Nova', 'Bela Vista', 'Cidade Alta',
            'São José', 'Santa Maria', 'Vila Industrial', 'Jardim América', 'Centro Histórico'
        ];
        
        return $neighborhoods[array_rand($neighborhoods)];
    }
}