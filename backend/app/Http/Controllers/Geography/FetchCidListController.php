<?php

namespace App\Http\Controllers\Geography;

use App\Http\Controllers\Controller;
use App\Domain\Geography\Actions\FetchCidListAction;
use Illuminate\Http\JsonResponse;

class FetchCidListController extends Controller
{
    public function __invoke(FetchCidListAction $action): JsonResponse
    {
        try {
            $cids = $action->execute();

            return response()->json([
                'success' => true,
                'data' => $cids,
                'message' => 'CID list fetched successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch CID list',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}