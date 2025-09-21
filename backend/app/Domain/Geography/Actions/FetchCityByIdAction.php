<?php

namespace App\Domain\Geography\Actions;

use App\Domain\Geography\Factories\CityDataFactory;

class FetchCityByIdAction
{
    public function execute(int $cityId): ?array
    {
        return CityDataFactory::getCityById($cityId);
    }
}