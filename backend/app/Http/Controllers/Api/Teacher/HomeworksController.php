<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Homework;
use App\Models\HomeworkSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class HomeworksController extends Controller
{
    public function index(Request $request)
    {
        return Homework::with('module:id,name')
            ->where('teacher_id', $request->user()->id)
            ->latest()->paginate(15);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'module_id' => 'required|exists:modules,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'deadline' => 'required|date',
            'file' => 'nullable|file|mimes:pdf,zip,rar,doc,docx|max:20480',
        ]);

        $assigned = $request->user()->taughtModules()->where('modules.id', $data['module_id'])->exists();
        abort_unless($assigned, 403, 'You are not assigned to this module.');

        $path = null;
        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('homeworks', 'public');
        }

        $hw = Homework::create([
            'module_id' => $data['module_id'],
            'teacher_id' => $request->user()->id,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'deadline' => $data['deadline'],
            'file_path' => $path,
        ]);

        return response()->json($hw->load('module:id,name'), 201);
    }

    public function update(Request $request, Homework $homework)
    {
        abort_unless($homework->teacher_id === $request->user()->id, 403);

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'deadline' => 'required|date',
            'file' => 'nullable|file|mimes:pdf,zip,rar,doc,docx|max:20480',
        ]);

        if ($request->hasFile('file')) {
            if ($homework->file_path) {
                Storage::disk('public')->delete($homework->file_path);
            }
            $homework->file_path = $request->file('file')->store('homeworks', 'public');
        }

        $homework->title = $data['title'];
        $homework->description = $data['description'] ?? null;
        $homework->deadline = $data['deadline'];
        $homework->save();

        return response()->json($homework->fresh()->load('module:id,name'));
    }

    public function destroy(Request $request, Homework $homework)
    {
        abort_unless($homework->teacher_id === $request->user()->id, 403);

        if ($homework->file_path) {
            Storage::disk('public')->delete($homework->file_path);
        }

        $homework->delete();
        return response()->json(['ok' => true]);
    }

    public function submissions(Request $request, Homework $homework)
    {
        abort_unless($homework->teacher_id === $request->user()->id, 403);

        return HomeworkSubmission::with('student:id,name,email')
            ->where('homework_id', $homework->id)
            ->latest()->paginate(20);
    }
}
