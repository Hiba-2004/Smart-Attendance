<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Homework;
use App\Models\HomeworkSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use ZipArchive;
use Illuminate\Support\Str;

class HomeworksController extends Controller
{
    public function index(Request $request)
    {
        return Homework::query()
            ->with('module:id,code,name') // tu peux garder id,name mais là on récupère code aussi si tu veux
            ->withCount('submissions')
            ->withCount([
                'submissions as graded_count' => function ($q) {
                    $q->whereNotNull('note');
                }
            ])
            ->where('teacher_id', $request->user()->id)
            ->latest()
            ->paginate(15);
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

        // store()
        return response()->json(
            $hw->load('module:id,code,name')
            ->loadCount('submissions')
            ->loadCount([
                'submissions as graded_count' => function ($q) {
                    $q->whereNotNull('note');
                }
            ]),
            201
        );

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

        // update()
        return response()->json(
            $homework->fresh()
                ->load('module:id,code,name')
                ->loadCount('submissions')
                ->loadCount([
                    'submissions as graded_count' => function ($q) {
                        $q->whereNotNull('note');
                    }
                ])
        );

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

    public function downloadFile(Request $request, Homework $homework)
    {
        abort_unless($homework->teacher_id === $request->user()->id, 403);

        if (!$homework->file_path) {
            return response()->json(['message' => 'No file attached'], 404);
        }

        if (!Storage::disk('public')->exists($homework->file_path)) {
            return response()->json(['message' => 'File not found on disk'], 404);
        }

        return response()->download(Storage::disk('public')->path($homework->file_path));
    }


    public function downloadSubmissionsZip(Request $request, Homework $homework)
    {
        abort_unless($homework->teacher_id === $request->user()->id, 403);

        $subs = HomeworkSubmission::where('homework_id', $homework->id)
            ->with('student:id,name,matricule')
            ->get();

        if ($subs->isEmpty()) {
            return response()->json(['message' => 'No submissions'], 404);
        }

        $zipFileName = 'submissions_homework_' . $homework->id . '_' . now()->format('Ymd_His') . '.zip';
        $tmpPath = storage_path('app/tmp');
        if (!is_dir($tmpPath)) mkdir($tmpPath, 0777, true);

        $zipPath = $tmpPath . DIRECTORY_SEPARATOR . $zipFileName;

        $zip = new ZipArchive();
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            return response()->json(['message' => 'Cannot create zip'], 500);
        }

        foreach ($subs as $s) {
            $diskPath = $s->file_path; // stored on public disk
            if (!Storage::disk('public')->exists($diskPath)) continue;

            $fileContent = Storage::disk('public')->get($diskPath);

            $studentName = $s->student?->name ?? 'student';
            $matricule = $s->student?->matricule ?? '';
            $safeStudent = Str::slug($studentName, '_');
            $safeMat = $matricule ? ('_' . Str::slug($matricule, '_')) : '';

            $ext = pathinfo($diskPath, PATHINFO_EXTENSION);
            $entryName = $safeStudent . $safeMat . '_submission_' . $s->id . ($ext ? ('.' . $ext) : '');

            $zip->addFromString($entryName, $fileContent);
        }

        $zip->close();

        return response()->download($zipPath)->deleteFileAfterSend(true);
    }

    public function gradeSubmission(Request $request, Homework $homework, HomeworkSubmission $submission)
    {
        abort_unless($homework->teacher_id === $request->user()->id, 403);

        abort_unless($submission->homework_id === $homework->id, 404);

        $data = $request->validate([
            'note' => 'nullable|numeric|min:0|max:20',
            'comment' => 'nullable|string|max:2000',
        ]);

        $submission->note = $data['note'];      // null = pas noté
        $submission->comment = $data['comment'] ?? null;
        $submission->save();

        return response()->json($submission->fresh()->load('student:id,name,email'));
    }


    
}
