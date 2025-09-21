<?php

namespace App\Domain\Geography\Actions;

use App\Domain\Geography\Factories\CidDataFactory;

class FetchCidListAction
{
    public function execute(): array
    {
        return CidDataFactory::getAllCids();
    }
}