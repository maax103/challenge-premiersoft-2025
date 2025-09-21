<?php

namespace App\Domain\Geography\Factories;

class DoctorDataFactory
{
    private static array $specialties = [
        'Cardiologia', 'Pediatria', 'Neurologia', 'Ortopedia', 'Dermatologia',
        'Ginecologia', 'Urologia', 'Psiquiatria', 'Oftalmologia', 'Endocrinologia'
    ];

    private static array $names = [
        'Dr. João Silva', 'Dra. Maria Santos', 'Dr. Pedro Oliveira', 'Dra. Ana Costa',
        'Dr. Carlos Ferreira', 'Dra. Lucia Rodrigues', 'Dr. Fernando Lima', 'Dra. Patricia Alves',
        'Dr. Ricardo Martins', 'Dra. Juliana Pereira', 'Dr. Marcos Souza', 'Dra. Beatriz Gomes',
        'Dr. André Dias', 'Dra. Camila Barbosa', 'Dr. Rafael Cardoso', 'Dra. Tatiana Ribeiro'
    ];

    public static function getDoctorsBySpecialty(string $specialty): array
    {
        $doctorCount = rand(5, 25);
        $doctors = [];
        
        for ($i = 0; $i < $doctorCount; $i++) {
            $doctors[] = [
                'id' => 'doc_' . uniqid(),
                'full_name' => self::$names[array_rand(self::$names)],
                'specialty' => $specialty,
                'city' => rand(1000000, 9999999),
                'created_at' => date('Y-m-d H:i:s', strtotime('-' . rand(1, 5) . ' years')),
                'updated_at' => date('Y-m-d H:i:s', strtotime('-' . rand(1, 30) . ' days')),
            ];
        }

        return $doctors;
    }

    public static function getAllSpecialties(): array
    {
        return self::$specialties;
    }
}