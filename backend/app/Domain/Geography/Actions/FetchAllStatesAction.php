<?php

namespace App\Domain\Geography\Actions;

use App\Domain\Geography\Factories\StateDataFactory;
use Illuminate\Support\Collection;

class FetchAllStatesAction
{
    public function execute(): Collection
    {
        $states = StateDataFactory::getAllStates();
        
        return collect($states)->map(function ($state) {
            return [
                'id' => $state['id'],
                'uf' => $state['uf'],
                'name' => $state['name'],
                'latitude' => $state['latitude'],
                'longitude' => $state['longitude'],
                'region' => $state['region']
            ];
        });
    }
}