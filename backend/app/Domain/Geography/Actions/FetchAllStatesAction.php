<?php

namespace App\Domain\Geography\Actions;

use App\Domain\Geography\Factories\StateDataFactory;
use App\Models\Estado;
use Illuminate\Support\Collection;

class FetchAllStatesAction
{
    public function execute(): Collection
    {
        $states = Estado::all();
        
        return collect($states)->map(function ($state) {
            return [
                'id' => $state['codigo_uf'],
                'uf' => $state['uf'],
                'name' => $state['name'],
                'latitude' => $state['latitude'],
                'longitude' => $state['longitude'],
                'region' => $state['region']
            ];
        });
    }
}