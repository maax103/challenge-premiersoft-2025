<?php

use Illuminate\Support\Facades\Route;

Route::prefix('api')->group(function () {
    Route::get('/', function () {
        return response()->json([
            'message' => 'Endpoint API funcionando!',
            'data' => [
                'status' => 'success',
                'proxy' => 'nginx reverse proxy',
                'backend' => 'Laravel'
            ]
        ]);
    });

    Route::get('/test', function () {
        return response()->json([
            'message' => 'Teste de rota API aninhada',
            'path' => '/api/test',
            'method' => 'GET'
        ]);
    });

    Route::get('/health', function () {
        return response()->json(['status' => 'ok']);
    });

    Route::get('/test', function () {
        return response()->json([
            'message' => 'Teste de rota API aninhada',
            'path' => '/api/test',
            'method' => 'GET'
        ]);
    });

    // Geography API routes
    Route::prefix('geography')->group(function () {
        Route::get('/states', \App\Http\Controllers\Geography\FetchAllStatesController::class);
        Route::get('/states/{stateId}/stats', \App\Http\Controllers\Geography\FetchStateStatsController::class);
        Route::get('/states/{stateId}/cities', \App\Http\Controllers\Geography\FetchCitiesByStateController::class);
        Route::get('/cities/{cityId}', \App\Http\Controllers\Geography\FetchCityByIdController::class);
        Route::get('/cities/{cityId}/stats', \App\Http\Controllers\Geography\FetchCityStatsController::class);
    });
});
