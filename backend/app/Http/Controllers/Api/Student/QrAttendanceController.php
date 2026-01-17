<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\CourseSession;
use App\Services\QrTokenService;
use Illuminate\Http\Request;

class QrAttendanceController extends Controller
{
    public function mark(Request $request, QrTokenService $qr)
    {
        $data = $request->validate([
            'token' => 'required|string',
        ]);

        $student = $request->user();

        // Verify token (signed + expiry)
        $payload = $qr->verifyToken($data['token']);
        abort_unless($payload['ok'] ?? false, 422, 'Invalid or expired QR token.');

        $session = CourseSession::with(['module:id,name,filiere_id'])->findOrFail($payload['session_id']);

        // Optional safety: student must belong to same filiere as the session's module
        if ($session->module && $session->module->filiere_id) {
            abort_unless((int)$student->filiere_id === (int)$session->module->filiere_id, 403);
        }

        // Mark as present (student scanning means present)
        $attendance = Attendance::updateOrCreate(
            [
                'student_id' => $student->id,
                'module_id' => $session->module_id,
                'date' => $payload['date'],
            ],
            [
                'course_session_id' => $session->id,
                'status' => 'present',
                'method' => 'qr',
                'marked_at' => now(),
            ]
        );

        return response()->json([
            'ok' => true,
            'attendance' => $attendance->load(['module:id,name']),
            'session' => [
                'id' => $session->id,
                'module_id' => $session->module_id,
                'module_name' => $session->module?->name,
                'date' => $payload['date'],
            ],
        ]);
    }
}
