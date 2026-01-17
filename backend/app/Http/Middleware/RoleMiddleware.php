<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        // pas connecté => 401 (au lieu de 500/403)
        if (!$user) {
            abort(401, 'Unauthenticated.');
        }

        $role = $user->role ?? null;

        // role manquant => 403
        if (!$role) {
            abort(403, 'User has no role.');
        }

        // mauvais role => 403
        if (!in_array($role, $roles, true)) {
            abort(403, 'Forbidden.');
        }

        return $next($request);
    }
}
