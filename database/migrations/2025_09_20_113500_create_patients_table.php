<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            // Codigo -> id (uuid)
            $table->uuid('id')->primary();

            // CPF -> cpf (unique, 11 chars)
            $table->string('cpf', 11)->unique();

            // Nome_Completo -> full_name
            $table->string('full_name');

            // Genero -> gender (M/F)
            $table->string('gender', 1);

            // Cod_municipio -> city (IBGE city code)
            $table->unsignedInteger('city');

            // Bairro -> neighborhood
            $table->string('neighborhood');

            // Convenio (SIM/NAO) -> has_insurance (boolean)
            $table->boolean('has_insurance')->default(false);

            // CID-10 -> icd10_code
            $table->string('icd10_code', 10);

            $table->timestamps();

            // Helpful indexes
            $table->index('city');
            $table->index('icd10_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
