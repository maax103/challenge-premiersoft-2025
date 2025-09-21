<?php

namespace App\Http\Controllers\Geography;

use App\Http\Controllers\Controller;
use App\Domain\Geography\Actions\FetchDoctorsBySpecialtyAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FetchDoctorsBySpecialtyController extends Controller
{
    public function __invoke(Request $request, FetchDoctorsBySpecialtyAction $action, string $specialty): JsonResponse
    {
        try {
            $doctors = $action->execute($specialty);

            return response()->json([
                'success' => true,
                'data' => $doctors,
                'message' => 'Doctors by specialty fetched successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch doctors by specialty',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}