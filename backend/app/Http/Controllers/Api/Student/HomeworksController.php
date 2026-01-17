<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Homework;
use App\Models\HomeworkSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class HomeworksController extends Controller
{
    public function index(Request $request)
    {
        $student = $request->user();
        $filiereId = $student->filiere_id;
        abort_unless($filiereId, 422, 'No filiere assigned to this student.');

        // Load homeworks for student's filiere
        $homeworks = Homework::with(['module', 'teacher:id,name'])
            ->whereHas('module', fn($q) => $q->where('filiere_id', $filiereId))
            ->latest('deadline')
            ->get();

        // Get student's submissions for these homeworks
        $submissions = HomeworkSubmission::where('student_id', $student->id)
            ->get()
            ->keyBy('homework_id');

        // Map to frontend Assignment type
        // Assignment:
        // { id, title, course, courseCode, dueDate, status, grade?, maxGrade, submittedAt?, file? }
        $mapped = $homeworks->map(function ($hw) use ($submissions) {
            $sub = $submissions->get($hw->id);

            $courseName = data_get($hw, 'module.name') ?? '';
            $courseCode = data_get($hw, 'module.code')
                ?? data_get($hw, 'module.module_code')
                ?? data_get($hw, 'module.abbreviation')
                ?? $courseName;

            $maxGrade = (int)(
                data_get($hw, 'max_grade')
                ?? data_get($hw, 'max_note')
                ?? data_get($hw, 'note_max')
                ?? 20
            );

            $status = 'pending';
            $grade = null;
            $submittedAt = null;

            if ($sub) {
                $submittedAt = optional($sub->created_at)->toISOString();

                // If there is a grade/note -> graded, else submitted
                $note = data_get($sub, 'note');
                if (!is_null($note)) {
                    $status = 'graded';
                    $grade = (int)$note;
                } else {
                    $status = 'submitted';
                }
            }

            return [
                'id' => (int)$hw->id,
                'title' => (string)(data_get($hw, 'title') ?? data_get($hw, 'name') ?? 'Devoir'),
                'course' => (string)$courseName,
                'courseCode' => (string)$courseCode,
                'dueDate' => optional($hw->deadline)->toDateString() ?? (string)$hw->deadline,
                'status' => $status,           // pending | submitted | graded
                'grade' => $grade,             // number | null
                'maxGrade' => $maxGrade,       // number
                'submittedAt' => $submittedAt, // ISO string | null
                // optional: if you have teacher file for homework later
                // 'file' => $hw->file_path ? Storage::disk('public')->url($hw->file_path) : null,
            ];
        })->values();

        return response()->json($mapped);
    }

    public function submit(Request $request, Homework $homework)
    {
        $student = $request->user();
        $filiereId = $student->filiere_id;
        abort_unless($filiereId, 422, 'No filiere assigned to this student.');
        abort_unless($homework->module && (int)$homework->module->filiere_id === (int)$filiereId, 403);

        $data = $request->validate([
            'file' => 'required|file|mimes:pdf,zip,rar,doc,docx|max:20480',
        ]);

        $path = $request->file('file')->store('submissions', 'public');

        $sub = HomeworkSubmission::updateOrCreate(
            ['homework_id' => $homework->id, 'student_id' => $student->id],
            ['file_path' => $path]
        );

        return response()->json(['ok' => true, 'submission_id' => $sub->id], 201);
    }

    public function downloadSubmission(Request $request, HomeworkSubmission $submission)
    {
        abort_unless((int)$submission->student_id === (int)$request->user()->id, 403);
        abort_unless($submission->file_path, 404);

        return response()->download(Storage::disk('public')->path($submission->file_path));
    }
}
