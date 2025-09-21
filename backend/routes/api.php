<?php

use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

// Geography API routes
Route::prefix('geography')->group(function () {
    Route::get('/states', \App\Http\Controllers\Geography\FetchAllStatesController::class);
    Route::get('/states/{stateId}/stats', \App\Http\Controllers\Geography\FetchStateStatsController::class);
    Route::get('/states/{stateId}/cities', \App\Http\Controllers\Geography\FetchCitiesByStateController::class);
    Route::get('/cities/{cityId}', \App\Http\Controllers\Geography\FetchCityByIdController::class);
    Route::get('/cities/{cityId}/stats', \App\Http\Controllers\Geography\FetchCityStatsController::class);
    Route::get('/doctors/specialty/{specialty}', \App\Http\Controllers\Geography\FetchDoctorsBySpecialtyController::class);
    Route::get('/cids', \App\Http\Controllers\Geography\FetchCidListController::class);
});