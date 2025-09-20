<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CidSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cids = [
            // Capítulo I: Algumas doenças Infecciosas e parasitárias (A00-B99)
            ['code' => 'A00', 'name' => 'Cólera'],
            ['code' => 'A01', 'name' => 'Febres tifóide e paratifóide'],
            ['code' => 'A02', 'name' => 'Outras infecções por Salmonella'],
            ['code' => 'A03', 'name' => 'Shiguelose'],
            ['code' => 'A04', 'name' => 'Outras infecções intestinais bacterianas'],
            ['code' => 'A05', 'name' => 'Outras intoxicações alimentares bacterianas'],
            ['code' => 'A06', 'name' => 'Amebíase'],
            ['code' => 'A08', 'name' => 'Infecções intestinais virais, outras e as não especificadas'],
            ['code' => 'A09', 'name' => 'Diarréia e gastroenterite de origem infecciosa presumível'],
            ['code' => 'A15', 'name' => 'Tuberculose respiratória, com confirmação bacteriológica e histológica'],
            ['code' => 'A16', 'name' => 'Tuberculose das vias respiratórias, sem confirmação bacteriológica ou histológica'],
            ['code' => 'A17', 'name' => 'Tuberculose do sistema nervoso'],
            ['code' => 'A18', 'name' => 'Tuberculose de outros órgãos'],
        ];

        foreach ($cids as $cid) {
            DB::table('cids')->insert([
                'code' => $cid['code'],
                'name' => $cid['name'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}