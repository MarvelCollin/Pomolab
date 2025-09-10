<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

/**
 * @OA\Info(
 *     title="Pomolab API",
 *     version="1.0.0",
 *     description="API documentation for Pomolab backend"
 * )
 */

/**
 * @OA\Get(
 *     path="/api/test",
 *     summary="Test endpoint",
 *     description="A simple test endpoint",
 *     @OA\Response(
 *         response=200,
 *         description="Successful operation",
 *         @OA\JsonContent(
 *             @OA\Property(property="message", type="string", example="Hello World")
 *         )
 *     )
 * )
 */
Route::get('/test', function () {
    return response()->json(['message' => 'Hello World']);
});

Route::get('/users/test', [UserController::class, 'test']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});