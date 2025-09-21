<?php

namespace App\Http\Controllers\Geography;

use App\Http\Controllers\Controller;
use App\Domain\Geography\Actions\FetchAllStatesAction;
use Illuminate\Http\JsonResponse;

class FetchAllStatesController extends Controller
{
    public function __invoke(FetchAllStatesAction $action): JsonResponse
    {
        try {
            $states = $action->execute();

            return response()->json([
                'success' => true,
                'data' => $states,
                'message' => 'States fetched successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch states',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}