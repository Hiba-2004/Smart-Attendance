<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Justification;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function attendances(Request $request)
    {
        return Attendance::with(['module:id,name', 'justification:id,attendance_id,status'])
            ->where('student_id', $request->user()->id)
            ->latest('date')
            ->paginate(15);
    }

    public function attendanceStats(Request $request)
    {
        $uid = $request->user()->id;
        $total = Attendance::where('student_id', $uid)->count();
        $present = Attendance::where('student_id', $uid)->where('status', 'present')->count();
        $absent = Attendance::where('student_id', $uid)->where('status', 'absent')->count();

        return response()->json(compact('total', 'present', 'absent'));
    }

    public function uploadJustification(Request $request)
    {
        $data = $request->validate([
            'attendance_id' => 'required|exists:attendances,id',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $attendance = Attendance::where('id', $data['attendance_id'])
            ->where('student_id', $request->user()->id)
            ->firstOrFail();

        // Optional: enforce 48h rule
        $deadline = $attendance->date->copy()->addHours(48);
        abort_unless(now()->lessThanOrEqualTo($deadline), 422, 'Justification window expired (48h).');

        $path = $request->file('file')->store('justifications', 'public');

        $justification = Justification::create([
            'attendance_id' => $attendance->id,
            'file_path' => $path,
            'status' => 'pending',
        ]);

        return response()->json($justification, 201);
    }
}
