<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/test', function () {
    return response()->json(['message' => 'Hello World']);
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});