<?php

namespace App\Domain\Geography\Actions;

use App\Domain\Geography\Factories\CityDataFactory;
use Illuminate\Support\Collection;

class FetchCitiesByStateAction
{
    public function execute(int $stateId): Collection
    {
        $cities = CityDataFactory::getCitiesByState($stateId);
        
        return collect($cities)->map(function ($city) {
            return [
                'id' => $city['id'],
                'name' => $city['name'],
                'latitude' => $city['latitude'],
                'longitude' => $city['longitude'],
                'is_capital' => $city['is_capital'],
                'population' => $city['population'],
                'state_id' => $city['state_id']
            ];
        });
    }
}