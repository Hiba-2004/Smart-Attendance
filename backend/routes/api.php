<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

use App\Http\Controllers\Api\MeController;
use App\Http\Controllers\Api\AnnouncementsController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\TeacherController;

use App\Http\Controllers\Api\Admin\DepartmentsController;
use App\Http\Controllers\Api\Admin\FilieresController;
use App\Http\Controllers\Api\Admin\ModulesController;
use App\Http\Controllers\Api\Admin\UsersController;
use App\Http\Controllers\Api\Admin\SessionsController as AdminSessionsController;
use App\Http\Controllers\Api\Admin\DisciplineController;

use App\Http\Controllers\Api\Teacher\AttendanceController as TeacherAttendanceController;
use App\Http\Controllers\Api\Teacher\CoursesController as TeacherCoursesController;
use App\Http\Controllers\Api\Teacher\HomeworksController as TeacherHomeworksController;
use App\Http\Controllers\Api\Teacher\JustificationsController as TeacherJustificationsController;

use App\Http\Controllers\Api\Student\TimetableController as StudentTimetableController;
use App\Http\Controllers\Api\Student\CoursesController as StudentCoursesController;
use App\Http\Controllers\Api\Student\HomeworksController as StudentHomeworksController;
use App\Http\Controllers\Api\Teacher\ModulesController as TeacherModulesController;

use App\Http\Controllers\Api\Teacher\AnnouncementsController as TeacherAnnouncementsController;
use App\Http\Controllers\Api\Teacher\TimetableController as TeacherTimetableController;



/*
|--------------------------------------------------------------------------
| API Routes (SPA) — Sanctum cookie auth
|--------------------------------------------------------------------------
| The React frontend should:
|  1) GET  /sanctum/csrf-cookie
|  2) POST /api/login
|  3) GET  /api/me
|
| All protected endpoints use auth:sanctum.
*/

/**
 * SPA Login (JSON) — avoids Fortify's web redirects (/dashboard).
 */
Route::post('/login', function (Request $request) {
    $credentials = $request->validate([
        'email' => ['required', 'email'],
        'password' => ['required'],
    ]);

    if (! Auth::attempt($credentials, true)) {
        throw ValidationException::withMessages([
            'email' => ['Invalid credentials.'],
        ]);
    }

    $request->session()->regenerate();

    return response()->json(['ok' => true]);
});

/**
 * SPA Logout (JSON)
 */
Route::post('/logout', function (Request $request) {
    Auth::guard('web')->logout();

    $request->session()->invalidate();
    $request->session()->regenerateToken();

    return response()->json(['ok' => true]);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', MeController::class);

    // Announcements (read for all authenticated users)
    Route::get('/announcements', [AnnouncementsController::class, 'index']);

    // Announcements (write for teacher/admin)
    Route::middleware('role:teacher,admin')->group(function () {
        Route::post('/announcements', [AnnouncementsController::class, 'store']);
        Route::put('/announcements/{announcement}', [AnnouncementsController::class, 'update']);
        Route::delete('/announcements/{announcement}', [AnnouncementsController::class, 'destroy']);
    });

    // Student APIs
    Route::middleware('role:student')->prefix('student')->group(function () {
        Route::get('/attendances', [StudentController::class, 'attendances']);
        Route::get('/attendance-stats', [StudentController::class, 'attendanceStats']);
        Route::post('/justifications', [StudentController::class, 'uploadJustification']);

        // Timetable + PDF
        Route::get('/timetable', [StudentTimetableController::class, 'index']);
        Route::get('/timetable/pdf', [StudentTimetableController::class, 'pdf']);

        // Courses
        Route::get('/courses', [StudentCoursesController::class, 'index']);
        Route::get('/courses/{course}/download', [StudentCoursesController::class, 'download']);

        // Homeworks (assignments) + submissions
        Route::get('/homeworks', [StudentHomeworksController::class, 'index']);
        Route::post('/homeworks/{homework}/submit', [StudentHomeworksController::class, 'submit']);
        Route::get('/submissions/{submission}/download', [StudentHomeworksController::class, 'downloadSubmission']);
        Route::get('/exams', [\App\Http\Controllers\Api\Student\ExamsController::class, 'index']);
        Route::get('/notification-preferences', [\App\Http\Controllers\Api\Student\NotificationPreferencesController::class, 'show']);
        Route::put('/notification-preferences', [\App\Http\Controllers\Api\Student\NotificationPreferencesController::class, 'update']);
        Route::put('/profile', [\App\Http\Controllers\Api\Student\ProfileController::class, 'update']);
        Route::post('/attendances/mark-qr', [\App\Http\Controllers\Api\Student\QrAttendanceController::class, 'mark']);



    });

    // Teacher APIs
    Route::middleware('role:teacher')->prefix('teacher')->group(function () {
        Route::get('/sessions/today', [TeacherController::class, 'todaySessions']);

        // Attendance
        Route::post('/attendances/mark-manual', [TeacherAttendanceController::class, 'markManual']);
        Route::post('/attendances/qr-token', [TeacherAttendanceController::class, 'qrToken']);
        Route::post('/attendances/mark-qr', [TeacherAttendanceController::class, 'markQr']);
        Route::post('/attendances/mark-face', [TeacherAttendanceController::class, 'markFace']);
        Route::get('/attendances/export', [TeacherAttendanceController::class, 'exportExcel']);

        // Courses CRUD
        Route::get('/courses', [TeacherCoursesController::class, 'index']);
        Route::post('/courses', [TeacherCoursesController::class, 'store']);
        Route::put('/courses/{course}', [TeacherCoursesController::class, 'update']);
        Route::delete('/courses/{course}', [TeacherCoursesController::class, 'destroy']);
        Route::get('/courses/{course}/download', [TeacherCoursesController::class, 'download']);

        // Homeworks CRUD
        Route::get('/homeworks', [TeacherHomeworksController::class, 'index']);
        Route::post('/homeworks', [TeacherHomeworksController::class, 'store']);
        Route::put('/homeworks/{homework}', [TeacherHomeworksController::class, 'update']);
        Route::delete('/homeworks/{homework}', [TeacherHomeworksController::class, 'destroy']);
        Route::get('/homeworks/{homework}/submissions', [TeacherHomeworksController::class, 'submissions']);

        // Justifications review
        Route::get('/justifications', [TeacherJustificationsController::class, 'index']);
        Route::post('/justifications/{justification}/review', [TeacherJustificationsController::class, 'review']);
        Route::get('/justifications/{justification}/download', [TeacherJustificationsController::class, 'download']);

        // Students of a session (for manual attendance list)
        Route::get('/sessions/{session}/students', [TeacherAttendanceController::class, 'students']);

        // Batch manual mark (save all checkboxes at once)
        Route::post('/attendances/mark-manual-batch', [TeacherAttendanceController::class, 'markManualBatch']);
        Route::get('/modules', [TeacherModulesController::class, 'index']);
        Route::get('/announcements', [TeacherAnnouncementsController::class, 'index']);
        Route::post('/announcements', [TeacherAnnouncementsController::class, 'store']);
        Route::put('/announcements/{announcement}', [TeacherAnnouncementsController::class, 'update']);
        Route::delete('/announcements/{announcement}', [TeacherAnnouncementsController::class, 'destroy']);
        Route::get('/timetable', [TeacherTimetableController::class, 'index']);
        Route::get('/timetable/pdf', [TeacherTimetableController::class, 'pdf']);
        Route::get('/homeworks/{homework}/file', [TeacherHomeworksController::class, 'downloadFile']);
        Route::get('/homeworks/{homework}/submissions/download', [TeacherHomeworksController::class, 'downloadSubmissionsZip']);
        Route::post('/homeworks/{homework}/submissions/{submission}/grade', [TeacherHomeworksController::class, 'gradeSubmission']);
        Route::put('/homeworks/{homework}/submissions/{submission}/grade', [TeacherHomeworksController::class, 'gradeSubmission']);


    });

    // Admin APIs
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        // Discipline
        Route::get('/discipline', [DisciplineController::class, 'list']);
        Route::post('/discipline/summon', [DisciplineController::class, 'summon']);

        // Users CRUD
        Route::get('/users', [UsersController::class, 'index']);
        Route::post('/users', [UsersController::class, 'store']);
        Route::put('/users/{user}', [UsersController::class, 'update']);
        Route::delete('/users/{user}', [UsersController::class, 'destroy']);

        // Academic structure
        Route::apiResource('/departments', DepartmentsController::class)->except(['show']);
        Route::apiResource('/filieres', FilieresController::class)->except(['show']);
        Route::apiResource('/modules', ModulesController::class)->except(['show']);

        // Timetable sessions (course_sessions)
        Route::get('/sessions', [AdminSessionsController::class, 'index']);
        Route::post('/sessions', [AdminSessionsController::class, 'store']);
        Route::put('/sessions/{session}', [AdminSessionsController::class, 'update']);
        Route::delete('/sessions/{session}', [AdminSessionsController::class, 'destroy']);
    });
});
