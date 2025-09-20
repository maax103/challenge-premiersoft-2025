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
        Schema::create('cities', function (Blueprint $table) {
            $table->unsignedInteger('id')->primary();
            $table->string('name');
            $table->decimal('latitude', 9, 6)->nullable();
            $table->decimal('longitude', 9, 6)->nullable();
            $table->boolean('is_capital')->default(false);
            $table->unsignedSmallInteger('state_id');
            $table->unsignedInteger('siafi_id');
            $table->unsignedSmallInteger('area_code');
            $table->string('time_zone');
            $table->unsignedInteger('population');
            $table->timestamps();
            $table->index('state_id');
            $table->index('name');

            $table->foreign('state_id')
                ->references('id')->on('states')
                ->onUpdate('cascade')
                ->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cities');
    }
};
