<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Exports\AttendancesExport;
use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\CourseSession;
use App\Models\User;
use App\Services\QrTokenService;
use App\Services\FaceService;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class AttendanceController extends Controller
{
    public function markManual(Request $request)
    {
        $data = $request->validate([
            'student_id' => 'required|exists:users,id',
            'module_id' => 'required|exists:modules,id',
            'date' => 'required|date',
            'status' => 'required|in:present,absent',
            'course_session_id' => 'nullable|exists:course_sessions,id',
        ]);

        // Optional safety: if session provided, ensure it's owned by teacher
        if (!empty($data['course_session_id'])) {
            $session = CourseSession::findOrFail($data['course_session_id']);
            abort_unless($session->teacher_id === $request->user()->id, 403);
        }

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

        // Optional: email student when marked absent
        if ($attendance->status === 'absent') {
            $student = User::find($attendance->student_id);
            if ($student) {
                $student->notify(new \App\Notifications\AbsentNotification(
                    moduleName: optional($attendance->module)->name ?? 'Module',
                    date: $attendance->date->format('Y-m-d'),
                    startTime: optional($attendance->session)->heure_debut ?? '',
                    room: optional($attendance->session)->salle ?? ''
                ));
            }
        }

        return response()->json($attendance->load(['module:id,name','student:id,name,email']));
    }

    public function qrToken(Request $request, QrTokenService $qr)
    {
        $data = $request->validate([
            'course_session_id' => 'required|exists:course_sessions,id',
            'date' => 'required|date',
        ]);

        $session = CourseSession::with('module:id,name')->findOrFail($data['course_session_id']);
        abort_unless($session->teacher_id === $request->user()->id, 403);

        $token = $qr->makeToken(sessionId: $session->id, date: $data['date']);

        return response()->json([
            'session_id' => $session->id,
            'module_name' => $session->module?->name,
            'date' => $data['date'],
            'token' => $token,
            'expires_in' => $qr->expiresInSeconds(),
        ]);

    }

    public function markQr(Request $request, QrTokenService $qr)
    {
        $data = $request->validate([
            'token' => 'required|string',
            'student_id' => 'required|exists:users,id',
            'status' => 'required|in:present,absent',
            'method' => 'sometimes|in:qr',
        ]);

        $payload = $qr->verifyToken($data['token']);
        abort_unless($payload['ok'], 422, 'Invalid or expired QR token.');

        $session = CourseSession::findOrFail($payload['session_id']);
        abort_unless($session->teacher_id === $request->user()->id, 403);

        $attendance = Attendance::updateOrCreate(
            [
                'student_id' => $data['student_id'],
                'module_id' => $session->module_id,
                'date' => $payload['date'],
            ],
            [
                'course_session_id' => $session->id,
                'status' => $data['status'],
                'method' => 'qr',
                'marked_at' => now(),
            ]
        );

        return response()->json($attendance->fresh()->load(['module:id,name','student:id,name,email']));
    }

    public function markFace(Request $request, FaceService $face)
    {
        $data = $request->validate([
            'course_session_id' => 'required|exists:course_sessions,id',
            'date' => 'required|date',
            'image_base64' => 'required|string',
        ]);

        $session = CourseSession::findOrFail($data['course_session_id']);
        abort_unless($session->teacher_id === $request->user()->id, 403);

        // Placeholder: no real recognition.
        $result = $face->verify($data['image_base64']);

        return response()->json($result);
    }

    public function exportExcel(Request $request)
    {
        $data = $request->validate([
            'course_session_id' => 'nullable|exists:course_sessions,id',
            'module_id' => 'nullable|exists:modules,id',
            'date' => 'required|date',
        ]);

        $sessionId = $data['course_session_id'] ?? null;
        if ($sessionId) {
            $session = CourseSession::findOrFail($sessionId);
            abort_unless($session->teacher_id === $request->user()->id, 403);
        }

        $filename = 'attendances_' . ($data['date']) . '.xlsx';
        return Excel::download(new AttendancesExport(
            date: $data['date'],
            moduleId: $data['module_id'] ?? null,
            sessionId: $sessionId
        ), $filename);
    }

    public function students(Request $request, CourseSession $session)
{
    // sécurité: le prof ne voit que ses séances
    abort_unless($session->teacher_id === $request->user()->id, 403);

    abort_unless($session->filiere_id, 422, 'Session has no filiere.');

    // IMPORTANT: adapte les champs si chez toi c'est (prenom/nom/matricule)
    $students = User::query()
        ->select(['id', 'name', 'email', 'matricule'])
        ->where('role', 'student')
        ->where('filiere_id', $session->filiere_id)
        ->orderBy('name')
        ->get()
        ->map(function ($u) {
            // On convertit vers {first_name,last_name,student_id} pour ton React
            $parts = preg_split('/\s+/', trim($u->name ?? ''));
            $first = $parts[0] ?? '';
            $last = implode(' ', array_slice($parts, 1));

            return [
                'id' => $u->id,
                'first_name' => $first,
                'last_name' => $last,
                'student_id' => $u->matricule,
                'email' => $u->email,
            ];
        });

    return response()->json($students);
}

    public function markManualBatch(Request $request)
    {
        $data = $request->validate([
            'course_session_id' => 'required|exists:course_sessions,id',
            'date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.student_id' => 'required|exists:users,id',
            'items.*.status' => 'required|in:present,absent',
        ]);

        $session = CourseSession::findOrFail($data['course_session_id']);
        abort_unless($session->teacher_id === $request->user()->id, 403);

        foreach ($data['items'] as $item) {
            Attendance::updateOrCreate(
                [
                    'student_id' => $item['student_id'],
                    'module_id' => $session->module_id,
                    'date' => $data['date'],
                ],
                [
                    'course_session_id' => $session->id,
                    'status' => $item['status'],
                    'method' => 'manual',
                    'marked_at' => now(),
                ]
            );
        }

        return response()->json(['ok' => true]);
    }


    

}
