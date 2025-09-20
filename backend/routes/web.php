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
});
