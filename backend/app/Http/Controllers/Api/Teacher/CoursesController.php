<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Module;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class CoursesController extends Controller
{
    public function index(Request $request)
    {
        // Teacher sees courses they uploaded
        $courses = Course::with('module:id,name')
            ->where('teacher_id', $request->user()->id)
            ->latest()->paginate(15);

        return $courses;
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'module_id' => 'required|exists:modules,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'file' => 'nullable|file|mimes:pdf,zip,rar,doc,docx,ppt,pptx,xls,xlsx|max:20480',
        ]);

        // Optional safety: teacher must be assigned to module
        $assigned = $request->user()->taughtModules()->where('modules.id', $data['module_id'])->exists();
        abort_unless($assigned, 403, 'You are not assigned to this module.');

        $path = null;
        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('courses', 'public');
        }

        $course = Course::create([
            'module_id' => $data['module_id'],
            'teacher_id' => $request->user()->id,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'file_path' => $path,
        ]);

        return response()->json($course->load('module:id,name'), 201);
    }

    public function update(Request $request, Course $course)
    {
        abort_unless($course->teacher_id === $request->user()->id, 403);

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'file' => 'nullable|file|mimes:pdf,zip,rar,doc,docx,ppt,pptx,xls,xlsx|max:20480',
        ]);

        if ($request->hasFile('file')) {
            if ($course->file_path) {
                Storage::disk('public')->delete($course->file_path);
            }
            $course->file_path = $request->file('file')->store('courses', 'public');
        }

        $course->title = $data['title'];
        $course->description = $data['description'] ?? null;
        $course->save();

        return response()->json($course->fresh()->load('module:id,name'));
    }

    public function destroy(Request $request, Course $course)
    {
        abort_unless($course->teacher_id === $request->user()->id, 403);

        if ($course->file_path) {
            Storage::disk('public')->delete($course->file_path);
        }
        $course->delete();

        return response()->json(['ok' => true]);
    }

    public function download(Request $request, Course $course)
    {
        // Teacher can download their own; students use Student controller
        abort_unless($course->teacher_id === $request->user()->id, 403);
        abort_unless($course->file_path, 404);

        return response()->download(Storage::disk('public')->path($course->file_path));
    }

    public function studentsCounts(Request $request)
    {
        $teacherId = $request->user()->id;

        // ✅ étudiants par module (via course_sessions -> filiere -> users)
        $rows = DB::table('course_sessions')
            ->join('users', function ($join) {
                $join->on('users.filiere_id', '=', 'course_sessions.filiere_id')
                    ->where('users.role', '=', 'student');
            })
            ->where('course_sessions.teacher_id', $teacherId)
            ->whereNotNull('course_sessions.module_id')
            ->select(
                'course_sessions.module_id as module_id',
                DB::raw('COUNT(DISTINCT users.id) as students_count')
            )
            ->groupBy('course_sessions.module_id')
            ->get();

        $byModule = [];
        foreach ($rows as $r) {
            $byModule[(int) $r->module_id] = (int) $r->students_count;
        }

        // ✅ total étudiants distincts sur tous les modules enseignés
        $totalStudents = DB::table('course_sessions')
            ->join('users', function ($join) {
                $join->on('users.filiere_id', '=', 'course_sessions.filiere_id')
                    ->where('users.role', '=', 'student');
            })
            ->where('course_sessions.teacher_id', $teacherId)
            ->distinct('users.id')
            ->count('users.id');

        return response()->json([
            'total_students' => (int) $totalStudents,
            'by_module' => $byModule,
        ]);
    }

}
