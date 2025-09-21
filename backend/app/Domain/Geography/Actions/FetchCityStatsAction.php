<?php

namespace App\Domain\Geography\Actions;

use App\Domain\Geography\Factories\CityDataFactory;

class FetchCityStatsAction
{
    public function execute(int $cityId): ?array
    {
        return CityDataFactory::getCityStatsById($cityId);
    }
}