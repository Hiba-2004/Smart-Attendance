<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\User;
use App\Notifications\DisciplinarySummonNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DisciplineController extends Controller
{
    public function list()
    {
        $rows = Attendance::query()
            ->select('users.id','users.name','users.email', DB::raw('COUNT(attendances.id) as count'))
            ->join('users','users.id','=','attendances.student_id')
            ->leftJoin('justifications','justifications.attendance_id','=','attendances.id')
            ->where('users.role','student')
            ->where('attendances.status','absent')
            ->where(function($q){
                $q->whereNull('justifications.id')
                  ->orWhere('justifications.status','!=','accepted');
            })
            ->groupBy('users.id','users.name','users.email')
            ->having('count','>',6)
            ->orderByDesc('count')
            ->get();

        return response()->json($rows);
    }

    public function summon(Request $request)
    {
        $data = $request->validate([
            'student_id' => 'required|exists:users,id',
            'count' => 'required|integer|min:7',
        ]);

        $student = User::where('role','student')->findOrFail($data['student_id']);

        $student->notify(new DisciplinarySummonNotification($data['count']));

        return response()->json(['ok'=>true]);
    }
}
