<?php

namespace App\Domain\Geography\Factories;

class StateDataFactory
{
    private static array $states = [
        ['id' => 11, 'uf' => 'RO', 'name' => 'Rondônia', 'latitude' => -11.22, 'longitude' => -62.80, 'region' => 'Norte'],
        ['id' => 12, 'uf' => 'AC', 'name' => 'Acre', 'latitude' => -8.77, 'longitude' => -70.55, 'region' => 'Norte'],
        ['id' => 13, 'uf' => 'AM', 'name' => 'Amazonas', 'latitude' => -3.07, 'longitude' => -61.66, 'region' => 'Norte'],
        ['id' => 14, 'uf' => 'RR', 'name' => 'Roraima', 'latitude' => 1.89, 'longitude' => -61.22, 'region' => 'Norte'],
        ['id' => 15, 'uf' => 'PA', 'name' => 'Pará', 'latitude' => -5.53, 'longitude' => -52.29, 'region' => 'Norte'],
        ['id' => 16, 'uf' => 'AP', 'name' => 'Amapá', 'latitude' => 1.41, 'longitude' => -51.77, 'region' => 'Norte'],
        ['id' => 17, 'uf' => 'TO', 'name' => 'Tocantins', 'latitude' => -10.25, 'longitude' => -48.25, 'region' => 'Norte'],
        ['id' => 21, 'uf' => 'MA', 'name' => 'Maranhão', 'latitude' => -2.55, 'longitude' => -44.30, 'region' => 'Nordeste'],
        ['id' => 22, 'uf' => 'PI', 'name' => 'Piauí', 'latitude' => -8.28, 'longitude' => -43.68, 'region' => 'Nordeste'],
        ['id' => 23, 'uf' => 'CE', 'name' => 'Ceará', 'latitude' => -3.71, 'longitude' => -38.54, 'region' => 'Nordeste'],
        ['id' => 24, 'uf' => 'RN', 'name' => 'Rio Grande do Norte', 'latitude' => -5.22, 'longitude' => -36.52, 'region' => 'Nordeste'],
        ['id' => 25, 'uf' => 'PB', 'name' => 'Paraíba', 'latitude' => -7.06, 'longitude' => -35.55, 'region' => 'Nordeste'],
        ['id' => 26, 'uf' => 'PE', 'name' => 'Pernambuco', 'latitude' => -8.28, 'longitude' => -35.07, 'region' => 'Nordeste'],
        ['id' => 27, 'uf' => 'AL', 'name' => 'Alagoas', 'latitude' => -9.71, 'longitude' => -35.73, 'region' => 'Nordeste'],
        ['id' => 28, 'uf' => 'SE', 'name' => 'Sergipe', 'latitude' => -10.57, 'longitude' => -37.45, 'region' => 'Nordeste'],
        ['id' => 29, 'uf' => 'BA', 'name' => 'Bahia', 'latitude' => -12.96, 'longitude' => -38.51, 'region' => 'Nordeste'],
        ['id' => 31, 'uf' => 'MG', 'name' => 'Minas Gerais', 'latitude' => -18.10, 'longitude' => -44.38, 'region' => 'Sudeste'],
        ['id' => 32, 'uf' => 'ES', 'name' => 'Espírito Santo', 'latitude' => -19.19, 'longitude' => -40.34, 'region' => 'Sudeste'],
        ['id' => 33, 'uf' => 'RJ', 'name' => 'Rio de Janeiro', 'latitude' => -22.84, 'longitude' => -43.15, 'region' => 'Sudeste'],
        ['id' => 35, 'uf' => 'SP', 'name' => 'São Paulo', 'latitude' => -23.55, 'longitude' => -46.64, 'region' => 'Sudeste'],
        ['id' => 41, 'uf' => 'PR', 'name' => 'Paraná', 'latitude' => -24.89, 'longitude' => -51.55, 'region' => 'Sul'],
        ['id' => 42, 'uf' => 'SC', 'name' => 'Santa Catarina', 'latitude' => -27.33, 'longitude' => -49.44, 'region' => 'Sul'],
        ['id' => 43, 'uf' => 'RS', 'name' => 'Rio Grande do Sul', 'latitude' => -30.01, 'longitude' => -51.22, 'region' => 'Sul'],
        ['id' => 50, 'uf' => 'MS', 'name' => 'Mato Grosso do Sul', 'latitude' => -20.51, 'longitude' => -54.54, 'region' => 'Centro-Oeste'],
        ['id' => 51, 'uf' => 'MT', 'name' => 'Mato Grosso', 'latitude' => -12.64, 'longitude' => -55.42, 'region' => 'Centro-Oeste'],
        ['id' => 52, 'uf' => 'GO', 'name' => 'Goiás', 'latitude' => -16.64, 'longitude' => -49.31, 'region' => 'Centro-Oeste'],
        ['id' => 53, 'uf' => 'DF', 'name' => 'Distrito Federal', 'latitude' => -15.83, 'longitude' => -47.86, 'region' => 'Centro-Oeste'],
    ];

    public static function getAllStates(): array
    {
        return self::$states;
    }

    public static function getStateById(int $stateId): ?array
    {
        foreach (self::$states as $state) {
            if ($state['id'] === $stateId) {
                return $state;
            }
        }
        return null;
    }

    public static function getStateStatsById(int $stateId): ?array
    {
        $state = self::getStateById($stateId);
        
        if (!$state) {
            return null;
        }

        // Mock statistics data
        $mockStats = [
            11 => ['totalCities' => 52, 'totalPopulation' => 1815278, 'largestCity' => 'Porto Velho'],
            12 => ['totalCities' => 22, 'totalPopulation' => 894470, 'largestCity' => 'Rio Branco'],
            13 => ['totalCities' => 62, 'totalPopulation' => 4207714, 'largestCity' => 'Manaus'],
            14 => ['totalCities' => 15, 'totalPopulation' => 636707, 'largestCity' => 'Boa Vista'],
            15 => ['totalCities' => 144, 'totalPopulation' => 8690745, 'largestCity' => 'Belém'],
            16 => ['totalCities' => 16, 'totalPopulation' => 861773, 'largestCity' => 'Macapá'],
            17 => ['totalCities' => 139, 'totalPopulation' => 1590248, 'largestCity' => 'Palmas'],
            21 => ['totalCities' => 217, 'totalPopulation' => 7114598, 'largestCity' => 'São Luís'],
            22 => ['totalCities' => 224, 'totalPopulation' => 3281480, 'largestCity' => 'Teresina'],
            23 => ['totalCities' => 184, 'totalPopulation' => 9187103, 'largestCity' => 'Fortaleza'],
            24 => ['totalCities' => 167, 'totalPopulation' => 3534165, 'largestCity' => 'Natal'],
            25 => ['totalCities' => 223, 'totalPopulation' => 4039277, 'largestCity' => 'João Pessoa'],
            26 => ['totalCities' => 185, 'totalPopulation' => 9616621, 'largestCity' => 'Recife'],
            27 => ['totalCities' => 102, 'totalPopulation' => 3365351, 'largestCity' => 'Maceió'],
            28 => ['totalCities' => 75, 'totalPopulation' => 2318822, 'largestCity' => 'Aracaju'],
            29 => ['totalCities' => 417, 'totalPopulation' => 14985284, 'largestCity' => 'Salvador'],
            31 => ['totalCities' => 853, 'totalPopulation' => 21411923, 'largestCity' => 'Belo Horizonte'],
            32 => ['totalCities' => 78, 'totalPopulation' => 4108508, 'largestCity' => 'Vitória'],
            33 => ['totalCities' => 92, 'totalPopulation' => 17463349, 'largestCity' => 'Rio de Janeiro'],
            35 => ['totalCities' => 645, 'totalPopulation' => 46649132, 'largestCity' => 'São Paulo'],
            41 => ['totalCities' => 399, 'totalPopulation' => 11597484, 'largestCity' => 'Curitiba'],
            42 => ['totalCities' => 295, 'totalPopulation' => 7338473, 'largestCity' => 'Florianópolis'],
            43 => ['totalCities' => 497, 'totalPopulation' => 11466630, 'largestCity' => 'Porto Alegre'],
            50 => ['totalCities' => 79, 'totalPopulation' => 2839188, 'largestCity' => 'Campo Grande'],
            51 => ['totalCities' => 141, 'totalPopulation' => 3567234, 'largestCity' => 'Cuiabá'],
            52 => ['totalCities' => 246, 'totalPopulation' => 7206589, 'largestCity' => 'Goiânia'],
            53 => ['totalCities' => 1, 'totalPopulation' => 3094325, 'largestCity' => 'Brasília'],
        ];

        $stats = $mockStats[$stateId] ?? ['totalCities' => 0, 'totalPopulation' => 0, 'largestCity' => 'N/A'];

        return [
            'id' => $state['id'],
            'name' => $state['name'],
            'uf' => $state['uf'],
            'totalCities' => $stats['totalCities'],
            'totalPopulation' => $stats['totalPopulation'],
            'averagePopulation' => $stats['totalCities'] > 0 ? round($stats['totalPopulation'] / $stats['totalCities']) : 0,
            'largestCity' => $stats['largestCity'],
            'region' => $state['region'],
            'coordinates' => [
                'latitude' => $state['latitude'],
                'longitude' => $state['longitude']
            ]
        ];
    }
}