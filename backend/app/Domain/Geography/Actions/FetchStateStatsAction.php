<?php

namespace App\Domain\Geography\Actions;

use App\Domain\Geography\Factories\StateDataFactory;

class FetchStateStatsAction
{
    public function execute(int $stateId): array
    {
        $stateStats = StateDataFactory::getStateStatsById($stateId);
        
        if (!$stateStats) {
            return [
                'id' => $stateId,
                'name' => 'Estado não encontrado',
                'uf' => '',
                'totalCities' => 0,
                'totalPopulation' => 0,
                'averagePopulation' => 0,
                'largestCity' => null,
                'region' => '',
                'coordinates' => [
                    'latitude' => 0,
                    'longitude' => 0
                ]
            ];
        }

        return $stateStats;
    }
}