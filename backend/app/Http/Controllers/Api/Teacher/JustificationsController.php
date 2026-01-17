<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Justification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class JustificationsController extends Controller
{
    public function index(Request $request)
    {
        $tid = $request->user()->id;

        $q = Justification::with([
            'attendance:id,student_id,module_id,date,status,course_session_id',
            'attendance.student:id,name,email,matricule',
            'attendance.module:id,name,code',
            'attendance.session:id,teacher_id,salle,jour,heure_debut,heure_fin',
        ])
        ->whereHas('attendance.session', function ($qq) use ($tid) {
            $qq->where('teacher_id', $tid);
        })
        ->when($request->query('status'), function ($qq) use ($request) {
            $qq->where('status', $request->query('status'));
        })
        ->orderByRaw("FIELD(status,'pending','accepted','refused')")
        ->latest();

        return $q->paginate(20);
    }

    public function review(Request $request, Justification $justification)
    {
        $data = $request->validate([
            'status' => 'required|in:accepted,refused',
            'review_comment' => 'nullable|string|max:2000',
        ]);

        $attendance = $justification->attendance()->with('session')->firstOrFail();
        abort_unless($attendance->session && $attendance->session->teacher_id === $request->user()->id, 403);

        $justification->status = $data['status'];
        $justification->review_comment = $data['review_comment'] ?? null;
        $justification->reviewed_at = now();
        $justification->save();

        return response()->json($justification->fresh());
    }

    public function download(Request $request, Justification $justification)
    {
        $attendance = $justification->attendance()->with('session')->firstOrFail();
        abort_unless($attendance->session && $attendance->session->teacher_id === $request->user()->id, 403);

        abort_unless($justification->file_path, 404);
        return response()->download(Storage::disk('public')->path($justification->file_path));
    }
}
