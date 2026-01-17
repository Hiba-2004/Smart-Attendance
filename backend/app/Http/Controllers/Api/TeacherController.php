<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\CourseSession;
use Illuminate\Http\Request;

class TeacherController extends Controller
{
    public function todaySessions(Request $request)
    {
        $today = now()->format('Y-m-d');

        return CourseSession::with(['module:id,name', 'filiere:id,name'])
            ->where('teacher_id', $request->user()->id)
            // If you keep recurring timetable without date_effective, show all sessions of the day
            ->where(function ($q) use ($today) {
                $q->whereNull('date_effective')
                  ->orWhere('date_effective', $today);
            })
            ->orderBy('heure_debut')
            ->get();
    }

    public function markManual(Request $request)
    {
        $data = $request->validate([
            'student_id' => 'required|exists:users,id',
            'module_id' => 'required|exists:modules,id',
            'date' => 'required|date',
            'status' => 'required|in:present,absent',
            'course_session_id' => 'nullable|exists:course_sessions,id',
        ]);

        $attendance = Attendance::updateOrCreate(
            [
                'student_id' => $data['student_id'],
                'module_id' => $data['module_id'],
                'date' => $data['date'],
            ],
            [
                'course_session_id' => $data['course_session_id'] ?? null,
                'status' => $data['status'],
                'method' => 'manual',
                'marked_at' => now(),
            ]
        );

        return response()->json($attendance->fresh());
    }
}
