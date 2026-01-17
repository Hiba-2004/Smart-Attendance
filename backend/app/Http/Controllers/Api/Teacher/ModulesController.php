<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ModulesController extends Controller
{
    /**
     * List modules assigned to the authenticated teacher.
     * Returns fields used by frontend: code / name / credits / semester (+ id, description).
     */
    public function index(Request $request)
    {
        // Needs relationship taughtModules() on User model (already used in CoursesController).
        $modules = $request->user()
            ->taughtModules()
            ->select([
                'modules.id',
                'modules.code',
                'modules.name',
                'modules.credits',
                'modules.semester',
                'modules.description',
            ])
            ->orderBy('modules.semester')
            ->orderBy('modules.code')
            ->get();

        return response()->json($modules);
    }
}
