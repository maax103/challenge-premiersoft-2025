<?php

namespace App\Domain\Geography\Actions;

use App\Domain\Geography\Factories\CityDataFactory;
use App\Models\City;

class FetchCityByIdAction
{
    public function execute(int $cityId): ?array
    {
        return City::find($cityId);
    }
}