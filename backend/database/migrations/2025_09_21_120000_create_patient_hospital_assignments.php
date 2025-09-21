<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('patient_hospital', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->foreignId('hospital_id')->constrained('hospitals')->onDelete('cascade');
            $table->decimal('distance_km', 10, 2)->nullable()->comment('Distância em km entre patient e hospital');
            $table->boolean('same_city')->default(false)->comment('Se patient e hospital estão na mesma cidade');
            $table->timestamps();
            
            $table->index(['patient_id', 'hospital_id']);
            $table->index('same_city');
            $table->index('distance_km');
            
            $table->unique(['patient_id', 'hospital_id']);
        });
        
        $this->assignPatientsToHospitals();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_hospital');
    }

    /**
     * Lógica para associar patients com hospitals da mesma cidade
     */
    private function assignPatientsToHospitals(): void
    {
        $patientsCount = DB::table('patients')->count();
        $hospitalsCount = DB::table('hospitals')->count();
        
        if ($patientsCount === 0 || $hospitalsCount === 0) {
            echo "Não há dados suficientes para associar patients e hospitals.\n";
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
                    } catch (\Exception $e) {
                        echo "✗ Erro ao inserir Patient {$patient->id} -> Hospital {$hospital->id}: " . $e->getMessage() . "\n";
                    }
                }
            } else {
                echo "✗ Nenhum hospital encontrado na cidade {$patient->city} para o patient {$patient->id}\n";
            }
        }
    }

    /**
     * Busca TODOS os hospitals na mesma cidade do patient
     */
    private function getHospitalsInSameCity($patientCityCode)
    {
        try {
            return DB::table('hospitals')
                ->join('cities', 'hospitals.city', '=', 'cities.id')
                ->where('cities.id', $patientCityCode)
                ->select('hospitals.id', 'hospitals.name', 'hospitals.city', 'cities.name as city_name')
                ->get();
        } catch (\Exception $e) {
            echo "Erro em getHospitalsInSameCity: " . $e->getMessage() . "\n";
            return collect();
        }
    }
};