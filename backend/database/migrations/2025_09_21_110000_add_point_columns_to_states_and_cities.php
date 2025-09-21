<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add geometry column to states if it doesn't exist
        if (!Schema::hasColumn('states', 'location')) {
            Schema::table('states', function (Blueprint $table) {
                $table->geometry('location')->nullable();
            });

            // Populate geometry column in states
            DB::table('states')->get()->each(function ($state) {
                if ($state->latitude && $state->longitude) {
                    DB::table('states')->where('id', $state->id)->update([
                        'location' => DB::raw("ST_GeomFromText('POINT({$state->longitude} {$state->latitude})')")
                    ]);
                }
            });
        }

        // Add geometry column to cities if it doesn't exist
        if (!Schema::hasColumn('cities', 'location')) {
            Schema::table('cities', function (Blueprint $table) {
                $table->geometry('location')->nullable();
            });

            // Populate geometry column in cities
            DB::table('cities')->get()->each(function ($city) {
                if ($city->latitude && $city->longitude) {
                    DB::table('cities')->where('id', $city->id)->update([
                        'location' => DB::raw("ST_GeomFromText('POINT({$city->longitude} {$city->latitude})')")
                    ]);
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('states', function (Blueprint $table) {
            $table->dropColumn('location');
        });

        Schema::table('cities', function (Blueprint $table) {
            $table->dropColumn('location');
        });
    }
};