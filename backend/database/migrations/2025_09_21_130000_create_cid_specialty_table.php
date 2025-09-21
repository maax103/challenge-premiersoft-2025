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
        Schema::create('cid_specialty', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('cid_id');
            $table->unsignedBigInteger('specialty_id');
            $table->timestamps();

            // Índices para otimizar consultas
            $table->index('cid_id');
            $table->index('specialty_id');
            
            // Índice único composto para evitar duplicatas
            $table->unique(['cid_id', 'specialty_id']);

            // Chaves estrangeiras
            $table->foreign('cid_id')
                ->references('id')->on('cids')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreign('specialty_id')
                ->references('id')->on('specialties')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cid_specialty');
    }
};