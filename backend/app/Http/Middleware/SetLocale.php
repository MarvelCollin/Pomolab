<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if locale is provided in the request header
        $locale = $request->header('Accept-Language');
        
        // If not in header, check query parameter
        if (!$locale) {
            $locale = $request->query('lang');
        }
        
        // Validate and set locale
        if ($locale && in_array($locale, ['en', 'id'])) {
            App::setLocale($locale);
        } else {
            // Set default locale from config
            App::setLocale(config('app.locale', 'en'));
        }
        
        return $next($request);
    }
}
