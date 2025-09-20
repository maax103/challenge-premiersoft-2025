<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class EstadoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $path = database_path('seeders/data/estados.csv');

        if (!file_exists($path)) {
            $this->command?->warn("CSV de estados não encontrado em: {$path}");
            return;
        }

        $rows = array_map('str_getcsv', file($path));
        if (empty($rows)) {
            $this->command?->warn('CSV de estados está vazio.');
            return;
        }

        // First row is header
        $header = array_map('trim', array_shift($rows));
        $expected = ['codigo_uf','uf','nome','latitude','longitude','regiao'];
        // Basic header validation
        if (array_map('strtolower', $header) !== $expected) {
            $this->command?->warn('Cabeçalho do CSV de estados não corresponde ao esperado.');
        }

        $now = now();
        $data = [];
        foreach ($rows as $row) {
            if (count($row) < 6) {
                continue; // skip malformed rows
            }
            [$codigoUf, $uf, $nome, $latitude, $longitude, $regiao] = $row;
            $data[] = [
                'codigo_uf' => (int) $codigoUf,
                'uf' => trim($uf),
                'nome' => trim($nome),
                'latitude' => $latitude !== '' ? (float) $latitude : null,
                'longitude' => $longitude !== '' ? (float) $longitude : null,
                'regiao' => trim($regiao),
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if (!empty($data)) {
            // Use upsert to avoid duplicates on repeated seeding runs
            DB::table('estados')->upsert(
                $data,
                ['codigo_uf'],
                ['uf','nome','latitude','longitude','regiao','updated_at']
            );
            $this->command?->info('Estados importados com sucesso.');
        } else {
            $this->command?->warn('Nenhuma linha válida encontrada no CSV de estados.');
        }
    }
}
