<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\App;

class LocaleController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/locale",
     *     summary="Get current locale",
     *     tags={"Locale"},
     *     @OA\Response(
     *         response=200,
     *         description="Current locale",
     *         @OA\JsonContent(
     *             @OA\Property(property="locale", type="string", example="en"),
     *             @OA\Property(property="available_locales", type="array", @OA\Items(type="string"))
     *         )
     *     )
     * )
     */
    public function getCurrentLocale(): JsonResponse
    {
        return response()->json([
            'locale' => App::getLocale(),
            'available_locales' => ['en', 'id']
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/locale",
     *     summary="Set locale",
     *     tags={"Locale"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"locale"},
     *             @OA\Property(property="locale", type="string", example="id", enum={"en", "id"})
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Locale set successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="locale", type="string")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Invalid locale")
     * )
     */
    public function setLocale(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'locale' => 'required|string|in:en,id'
        ]);

        App::setLocale($validated['locale']);

        return response()->json([
            'message' => 'Locale set successfully',
            'locale' => App::getLocale()
        ]);
    }
}
