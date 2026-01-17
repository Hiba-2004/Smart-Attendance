<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Module;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
}
