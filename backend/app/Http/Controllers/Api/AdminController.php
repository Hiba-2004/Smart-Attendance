<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Students with > 6 unjustified absences.
     */
    public function disciplineList(Request $request)
    {
        $rows = Attendance::query()
            ->select('users.id', 'users.name', 'users.email', DB::raw('COUNT(attendances.id) as count'))
            ->join('users', 'users.id', '=', 'attendances.student_id')
            ->leftJoin('justifications', 'justifications.attendance_id', '=', 'attendances.id')
            ->where('users.role', 'student')
            ->where('attendances.status', 'absent')
            ->where(function ($q) {
                $q->whereNull('justifications.id')
                  ->orWhere('justifications.status', '!=', 'accepted');
            })
            ->groupBy('users.id', 'users.name', 'users.email')
            ->having('count', '>', 6)
            ->orderByDesc('count')
            ->get();

        return response()->json($rows);
    }
}
