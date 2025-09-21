<?php

namespace App\Http\Controllers\Geography;

use App\Http\Controllers\Controller;
use App\Domain\Geography\Actions\FetchStateStatsAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FetchStateStatsController extends Controller
{
    public function __invoke(Request $request, FetchStateStatsAction $action, int $stateId): JsonResponse
    {
        try {
            $stats = $action->execute($stateId);

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'State statistics fetched successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch state statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}