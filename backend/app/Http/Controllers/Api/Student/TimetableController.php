<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\CourseSession;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class TimetableController extends Controller
{
    private function normalizeDay($jour): string
    {
        $j = strtolower(trim((string) $jour));

        return match ($j) {
            'lundi', 'monday' => 'monday',
            'mardi', 'tuesday' => 'tuesday',
            'mercredi', 'wednesday' => 'wednesday',
            'jeudi', 'thursday' => 'thursday',
            'vendredi', 'friday' => 'friday',
            'samedi', 'saturday' => 'saturday',
            default => 'monday',
        };
    }

    private function normalizeType($value): string
    {
        // If you later add a "type" column in DB, we normalize it.
        // Otherwise default to lecture (Cours).
        $t = strtolower(trim((string) $value));
        return match ($t) {
            'cours', 'cm', 'lecture' => 'lecture',
            'td', 'tutorial' => 'tutorial',
            'tp', 'lab' => 'lab',
            default => 'lecture',
        };
    }

    public function index(Request $request)
    {
        $filiereId = $request->user()->filiere_id;
        abort_unless($filiereId, 422, 'No filiere assigned to this student.');

        $items = CourseSession::with(['module', 'teacher:id,name', 'filiere:id,name'])
            ->where('filiere_id', $filiereId)
            ->orderBy('jour')
            ->orderBy('heure_debut')
            ->get();

        // Map to frontend TimetableEntry:
        // { id, day, startTime, endTime, course, courseCode, room, type, teacher? }
        $mapped = $items->map(function (CourseSession $s) {
            $module = $s->module;

            $courseName = data_get($module, 'name') ?? '';
            $courseCode = data_get($module, 'code')
                ?? data_get($module, 'module_code')
                ?? data_get($module, 'abbreviation')
                ?? $courseName;

            // If you add a "type" column later, it will be used automatically.
            // Otherwise it's lecture.
            $type = $this->normalizeType(data_get($s, 'type'));

            return [
                'id' => $s->id,
                'day' => $this->normalizeDay($s->jour),
                'startTime' => substr((string) $s->heure_debut, 0, 5),
                'endTime' => substr((string) $s->heure_fin, 0, 5),
                'course' => (string) $courseName,
                'courseCode' => (string) $courseCode,
                'room' => (string) ($s->salle ?? ''),
                'type' => $type, // lecture | tutorial | lab
                'teacher' => (string) ($s->teacher?->name ?? ''),
            ];
        })->values();

        return response()->json($mapped);
    }

    public function pdf(Request $request)
    {
        $filiereId = $request->user()->filiere_id;
        abort_unless($filiereId, 422, 'No filiere assigned to this student.');

        $items = CourseSession::with(['module:id,name', 'teacher:id,name', 'filiere:id,name'])
            ->where('filiere_id', $filiereId)
            ->orderBy('jour')
            ->orderBy('heure_debut')
            ->get();

        $filiereName = optional($items->first()?->filiere)->name ?? 'Filiere';

        $pdf = Pdf::loadView('pdf.timetable', [
            'student' => $request->user(),
            'filiereName' => $filiereName,
            'items' => $items,
        ])->setPaper('a4', 'portrait');

        return $pdf->download('emploi_du_temps.pdf');
    }
}
