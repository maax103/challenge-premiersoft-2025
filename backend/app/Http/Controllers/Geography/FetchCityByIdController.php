<?php

namespace App\Http\Controllers\Geography;

use App\Http\Controllers\Controller;
use App\Domain\Geography\Actions\FetchCityByIdAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FetchCityByIdController extends Controller
{
    public function __invoke(Request $request, FetchCityByIdAction $action, int $cityId): JsonResponse
    {
        try {
            $city = $action->execute($cityId);

            if (!$city) {
                return response()->json([
                    'success' => false,
                    'message' => 'City not found',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $city,
                'message' => 'City fetched successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch city',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}