<?php

namespace App\Http\Controllers\Geography;

use App\Http\Controllers\Controller;
use App\Domain\Geography\Actions\FetchCityStatsAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FetchCityStatsController extends Controller
{
    public function __invoke(Request $request, FetchCityStatsAction $action, int $cityId): JsonResponse
    {
        try {
            $stats = $action->execute($cityId);

            if (!$stats) {
                return response()->json([
                    'success' => false,
                    'message' => 'City not found',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'City statistics fetched successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch city statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}