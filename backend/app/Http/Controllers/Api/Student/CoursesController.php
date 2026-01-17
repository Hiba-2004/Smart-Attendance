<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CoursesController extends Controller
{
    public function index(Request $request)
    {
        $filiereId = $request->user()->filiere_id;
        abort_unless($filiereId, 422, 'No filiere assigned to this student.');

        // We keep your original filtering logic:
        // return courses whose module belongs to the student's filiere.
        $courses = Course::with(['module', 'teacher:id,name'])
            ->whereHas('module', function ($q) use ($filiereId) {
                $q->where('filiere_id', $filiereId);
            })
            ->latest()
            ->get();

        // Map to frontend type Course:
        // { id, code, name, credits, semester, teacher }
        $mapped = $courses->map(function (Course $c) {
            $module = $c->module;

            // These fields depend on your modules table.
            // If some columns are missing, we fallback safely.
            $code = data_get($module, 'code')
                ?? data_get($module, 'module_code')
                ?? data_get($module, 'abbreviation')
                ?? data_get($module, 'name')
                ?? data_get($c, 'title')
                ?? '';

            $name = data_get($module, 'name')
                ?? data_get($c, 'title')
                ?? '';

            $credits = (int) (
                data_get($module, 'credits')
                ?? data_get($module, 'ects')
                ?? 0
            );

            $semester = (int) (
                data_get($module, 'semester')
                ?? data_get($module, 'semestre')
                ?? 1
            );

            return [
                'id' => $c->id,
                'code' => (string) $code,
                'name' => (string) $name,
                'credits' => $credits,
                'semester' => $semester,
                'teacher' => (string) ($c->teacher?->name ?? ''),
            ];
        })->values();

        return response()->json($mapped);
    }

    public function download(Request $request, Course $course)
    {
        $filiereId = $request->user()->filiere_id;
        abort_unless($filiereId, 422, 'No filiere assigned to this student.');

        // Ensure course module belongs to student's filiere
        abort_unless($course->module && (int)$course->module->filiere_id === (int)$filiereId, 403);
        abort_unless($course->file_path, 404);

        // Your original behavior:
        return response()->download(storage_path('app/public/' . $course->file_path));
    }
}
