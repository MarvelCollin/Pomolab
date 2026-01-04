<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\User;

class AdminBypass
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();
        
        if ($token === 'admin-token-hardcoded') {
            $adminUser = new User();
            $adminUser->id = 0;
            $adminUser->username = 'Admin';
            $adminUser->email = 'admin@gmail.com';
            $adminUser->role = 'admin';
            $adminUser->is_banned = false;
            
            $request->setUserResolver(function () use ($adminUser) {
                return $adminUser;
            });
            
            return $next($request);
        }
        
        $guard = app('auth')->guard('sanctum');
        
        if ($guard->check()) {
            return $next($request);
        }
        
        return response()->json(['message' => 'Unauthenticated'], 401);
    }
}
