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
            $table->unique(['cid_id', 'specialty_id'], 'unique_cid_specialty');
            $table->index('cid_id');
            $table->index('specialty_id');
        
            $table->foreign('cid_id')->references('id')->on('cids')->onDelete('cascade');
            $table->foreign('specialty_id')->references('id')->on('specialties_unique')->onDelete('cascade');
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