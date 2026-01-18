<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TeacherDashboardController extends Controller
{
    public function stats(Request $request)
    {
        $teacherId = $request->user()->id;

        // Cours assignés = modules assignés au prof
        $assignedCourses = DB::table('teacher_module')
            ->where('teacher_id', $teacherId)
            ->count();

        // Justificatifs en attente (liés aux séances du prof)
        $pendingJustifications = DB::table('justifications')
            ->join('attendances', 'attendances.id', '=', 'justifications.attendance_id')
            ->join('course_sessions', 'course_sessions.id', '=', 'attendances.course_session_id')
            ->where('course_sessions.teacher_id', $teacherId)
            ->where('justifications.status', 'pending')
            ->count();

        // Sessions cette semaine (date_effective si définie, sinon on compte aussi les récurrentes)
        $start = now()->startOfWeek()->toDateString();
        $end = now()->endOfWeek()->toDateString();

        $sessionsThisWeek = DB::table('course_sessions')
            ->where('teacher_id', $teacherId)
            ->where(function ($q) use ($start, $end) {
                $q->whereNull('date_effective')
                  ->orWhereBetween('date_effective', [$start, $end]);
            })
            ->count();

        // ✅ Étudiants = étudiants inscrits dans les filières où le prof a (au moins) une séance
        $studentsCount = DB::table('users')
            ->where('users.role', 'student')
            ->whereIn('users.filiere_id', function ($q) use ($teacherId) {
                $q->select('course_sessions.filiere_id')
                  ->from('course_sessions')
                  ->where('course_sessions.teacher_id', $teacherId)
                  ->whereNotNull('course_sessions.filiere_id')
                  ->distinct();
            })
            ->distinct('users.id')
            ->count('users.id');

        return response()->json([
            'assignedCourses' => (int) $assignedCourses,
            'pendingJustifications' => (int) $pendingJustifications,
            'sessionsThisWeek' => (int) $sessionsThisWeek,
            'studentsCount' => (int) $studentsCount,
        ]);
    }
}
