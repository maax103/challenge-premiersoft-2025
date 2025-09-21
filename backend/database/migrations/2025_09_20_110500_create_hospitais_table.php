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
        Schema::create('hospitals', function (Blueprint $table) {
            $table->id('id')->primary();
            $table->string('hospital_code', 40)->unique();
            $table->string('name');
            $table->unsignedBigInteger('city');
            $table->foreign('city')->references('id')->on('cities');
            $table->string('neighborhood');
            $table->unsignedSmallInteger('total_beds');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hospitals');
    }
};
