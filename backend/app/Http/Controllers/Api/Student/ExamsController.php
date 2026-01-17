<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use Illuminate\Http\Request;

class ExamsController extends Controller
{
    public function index(Request $request)
    {
        $student = $request->user();
        $filiereId = $student->filiere_id;
        abort_unless($filiereId, 422, 'No filiere assigned to this student.');

        $exams = Exam::with(['module:id,name,code'])
            ->where('filiere_id', $filiereId)
            ->orderBy('date')
            ->orderBy('start_time')
            ->get();

        // Map to frontend Exam type:
        // { id, course, courseCode, date, startTime, endTime, room, type }
        $mapped = $exams->map(function (Exam $e) {
            $course = $e->module?->name ?? '';
            $courseCode = $e->module?->code ?? $course;

            return [
                'id' => $e->id,
                'course' => $course,
                'courseCode' => $courseCode,
                'date' => $e->date?->toDateString() ?? (string)$e->date,
                'startTime' => substr((string)$e->start_time, 0, 5),
                'endTime' => substr((string)$e->end_time, 0, 5),
                'room' => $e->room ?? '',
                'type' => in_array($e->type, ['midterm','final','quiz'], true) ? $e->type : 'final',
            ];
        })->values();

        return response()->json($mapped);
    }
}
