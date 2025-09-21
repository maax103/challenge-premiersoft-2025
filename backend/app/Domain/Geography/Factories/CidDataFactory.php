<?php

namespace App\Domain\Geography\Factories;

class CidDataFactory
{
    private static array $cids = [
        ['id' => 1, 'code' => 'I10', 'name' => 'Hipertensão arterial'],
        ['id' => 2, 'code' => 'E11', 'name' => 'Diabetes mellitus'],
        ['id' => 3, 'code' => 'J45', 'name' => 'Asma'],
        ['id' => 4, 'code' => 'J44', 'name' => 'Bronquite'],
        ['id' => 5, 'code' => 'K29', 'name' => 'Gastrite'],
        ['id' => 6, 'code' => 'G43', 'name' => 'Enxaqueca'],
        ['id' => 7, 'code' => 'M06', 'name' => 'Artrite'],
        ['id' => 8, 'code' => 'F32', 'name' => 'Depressão'],
        ['id' => 9, 'code' => 'F41', 'name' => 'Ansiedade'],
        ['id' => 10, 'code' => 'J18', 'name' => 'Pneumonia'],
        ['id' => 11, 'code' => 'D50', 'name' => 'Anemia'],
        ['id' => 12, 'code' => 'E66', 'name' => 'Obesidade'],
        ['id' => 13, 'code' => 'I20', 'name' => 'Angina pectoris'],
        ['id' => 14, 'code' => 'M54', 'name' => 'Dorsalgia'],
        ['id' => 15, 'code' => 'K21', 'name' => 'Refluxo gastroesofágico'],
        ['id' => 16, 'code' => 'N39', 'name' => 'Infecção do trato urinário'],
        ['id' => 17, 'code' => 'H52', 'name' => 'Distúrbios de refração'],
        ['id' => 18, 'code' => 'J06', 'name' => 'Infecção das vias aéreas superiores'],
        ['id' => 19, 'code' => 'R50', 'name' => 'Febre'],
        ['id' => 20, 'code' => 'K59', 'name' => 'Constipação']
    ];

    public static function getAllCids(): array
    {
        return array_map(function($cid) {
            return [
                'id' => $cid['id'],
                'code' => $cid['code'],
                'name' => $cid['name'],
                'created_at' => date('Y-m-d H:i:s', strtotime('-' . rand(1, 3) . ' years')),
                'updated_at' => date('Y-m-d H:i:s', strtotime('-' . rand(1, 60) . ' days')),
            ];
        }, self::$cids);
    }

    public static function getCidById(int $cidId): ?array
    {
        foreach (self::$cids as $cid) {
            if ($cid['id'] === $cidId) {
                return [
                    'id' => $cid['id'],
                    'code' => $cid['code'],
                    'name' => $cid['name'],
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s'),
                ];
            }
        }
        return null;
    }
}