<?php

namespace App\Http\Controllers\Geography;

use App\Http\Controllers\Controller;
use App\Domain\Geography\Actions\FetchCitiesByStateAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FetchCitiesByStateController extends Controller
{
    public function __invoke(Request $request, FetchCitiesByStateAction $action, int $stateId): JsonResponse
    {
        try {
            $cities = $action->execute($stateId);

            return response()->json([
                'success' => true,
                'data' => $cities,
                'message' => 'Cities fetched successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch cities',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}