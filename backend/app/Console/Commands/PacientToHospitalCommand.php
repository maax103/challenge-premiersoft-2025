<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class PacientToHospitalCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:pacient-to-hospital-command';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $patientsCount = DB::table('patients')->count();
        $hospitalsCount = DB::table('hospitals')->count();
        
        if ($patientsCount === 0 || $hospitalsCount === 0) {
            return;
        }

        $patients = DB::table('patients')
            ->select('id', 'city', 'cid_id')
            ->get();

        $insertCount = 0;
        
        foreach ($patients as $patient) {
            
            $hospitalsInSameCity = $this->getHospitalsInSameCity($patient->city);
            
            if ($hospitalsInSameCity->isNotEmpty()) {
                echo "Encontrados " . $hospitalsInSameCity->count() . " hospitals na cidade\n";
                
                foreach ($hospitalsInSameCity as $hospital) {
                    try {
                        DB::table('patient_hospital')->insert([
                            'patient_id' => $patient->id,
                            'hospital_id' => $hospital->id,
                            'distance_km' => 0, 
                            'same_city' => true,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                        $insertCount++;
                        echo "✓ Patient {$patient->id} -> Hospital {$hospital->id} ({$hospital->name})\n";
                    } catch (\Exception $e) {}
                }
            }
        }
    }

    private function getHospitalsInSameCity($patientCityCode)
    {
        try {
            return DB::table('hospitals')
                ->join('cities', 'hospitals.city', '=', 'cities.id')
                ->where('cities.id', $patientCityCode)
                ->select('hospitals.id', 'hospitals.name', 'hospitals.city', 'cities.name as city_name')
                ->get();
        } catch (\Exception $e) {
            return collect();
        }
    }
}
