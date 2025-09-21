<?php

namespace App\Domain\Geography\Actions;

use App\Domain\Geography\Factories\CityDataFactory;
use App\Models\City;
use Illuminate\Support\Collection;

class FetchCitiesByStateAction
{
    public function execute(int $stateId): Collection
    {
        $cities = City::where('state_id', $stateId)->get();
        
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