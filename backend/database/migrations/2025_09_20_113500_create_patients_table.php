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
            $table->id('id')->primary();
            $table->string('cpf', 11)->unique();
            $table->string('codigo',255)->unique();
            $table->string('full_name');
            $table->string('gender', 1);
            $table->unsignedInteger('city'); 
            $table->string('neighborhood');
            $table->boolean('has_insurance')->default(false);
            $table->foreignId('cid_id')->constrained('cids');
            $table->timestamps();
            $table->index('city');
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
