<?php

namespace App\Domain\Geography\Actions;

use App\Domain\Geography\Factories\DoctorDataFactory;

class FetchDoctorsBySpecialtyAction
{
    public function execute(string $specialty): array
    {
        return DoctorDataFactory::getDoctorsBySpecialty($specialty);
    }
}