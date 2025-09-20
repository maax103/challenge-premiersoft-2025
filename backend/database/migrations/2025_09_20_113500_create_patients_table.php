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
            $table->uuid('id')->primary();
            $table->string('cpf', 11)->unique();
            $table->string('full_name');
            $table->string('gender', 1);
            $table->unsignedInteger('city');
            $table->string('neighborhood');
            $table->boolean('has_insurance')->default(false);
            $table->string('icd10_code', 10);
            $table->timestamps();
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
