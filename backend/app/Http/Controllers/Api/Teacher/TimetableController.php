<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Models\CourseSession;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class TimetableController extends Controller
{
    public function index(Request $request)
    {
        $teacherId = $request->user()->id;

        // "week" = une date dans la semaine (YYYY-MM-DD). Par défaut aujourd’hui.
        $week = $request->query('week');
        $ref = $week ? Carbon::parse($week) : now();

        // Début/fin de semaine (Lundi -> Vendredi)
        $start = $ref->copy()->startOfWeek(Carbon::MONDAY)->startOfDay();
        $end = $ref->copy()->endOfWeek(Carbon::SUNDAY)->endOfDay();

        $sessions = CourseSession::query()
            ->with(['module:id,code,name'])
            ->where('teacher_id', $teacherId)
            ->where(function ($q) use ($start, $end) {
                // si date_effective existe => filtrer la semaine
                $q->whereBetween('date_effective', [$start->toDateString(), $end->toDateString()])
                  // sinon fallback: séances "récurrentes" (sans date_effective)
                  ->orWhereNull('date_effective');
            })
            ->orderByRaw("FIELD(jour,'monday','tuesday','wednesday','thursday','friday','saturday','sunday')")
            ->orderBy('heure_debut')
            ->get();

        // Normalisation jour (au cas où c'est "Lundi", "Monday", etc.)
        $mapDay = function (?string $jour) {
            if (!$jour) return null;
            $j = strtolower(trim($jour));

            $aliases = [
                'lundi' => 'monday', 'monday' => 'monday', 'mon' => 'monday',
                'mardi' => 'tuesday', 'tuesday' => 'tuesday', 'tue' => 'tuesday',
                'mercredi' => 'wednesday', 'wednesday' => 'wednesday', 'wed' => 'wednesday',
                'jeudi' => 'thursday', 'thursday' => 'thursday', 'thu' => 'thursday',
                'vendredi' => 'friday', 'friday' => 'friday', 'fri' => 'friday',
                'samedi' => 'saturday', 'saturday' => 'saturday', 'sat' => 'saturday',
                'dimanche' => 'sunday', 'sunday' => 'sunday', 'sun' => 'sunday',
            ];

            return $aliases[$j] ?? $j;
        };

        $payload = $sessions->map(function ($s) use ($mapDay) {
            $dayKey = $mapDay($s->jour);

            // Si jour est nul mais date_effective existe, on calcule le jour
            if (!$dayKey && $s->date_effective) {
                $dayKey = strtolower(Carbon::parse($s->date_effective)->format('l')); // monday...
            }

            return [
                'id' => $s->id,
                'day' => $dayKey,
                'startTime' => substr((string) $s->heure_debut, 0, 5),
                'endTime' => substr((string) $s->heure_fin, 0, 5),
                'room' => $s->salle,
                'type' => 'lecture', // pas de champ type dans DB => on fixe "Cours"
                'course' => $s->module?->name ?? 'Module',
                'courseCode' => $s->module?->code ?? null,
                'date_effective' => $s->date_effective?->toDateString(),
            ];
        });

        return response()->json([
            'weekStart' => $start->toDateString(),
            'weekEnd' => $end->toDateString(),
            'data' => $payload,
        ]);
    }

    public function pdf(Request $request)
    {
        $teacherId = $request->user()->id;

        // Même logique que index(): param ?week=YYYY-MM-DD sinon today
        $week = $request->query('week');
        $ref = $week ? Carbon::parse($week) : now();

        $start = $ref->copy()->startOfWeek(Carbon::MONDAY)->startOfDay();
        $end   = $ref->copy()->endOfWeek(Carbon::SUNDAY)->endOfDay();

        $mapDay = function (?string $jour) {
            if (!$jour) return null;
            $j = strtolower(trim($jour));

            $aliases = [
                'lundi' => 'monday', 'monday' => 'monday', 'mon' => 'monday',
                'mardi' => 'tuesday', 'tuesday' => 'tuesday', 'tue' => 'tuesday',
                'mercredi' => 'wednesday', 'wednesday' => 'wednesday', 'wed' => 'wednesday',
                'jeudi' => 'thursday', 'thursday' => 'thursday', 'thu' => 'thursday',
                'vendredi' => 'friday', 'friday' => 'friday', 'fri' => 'friday',
                'samedi' => 'saturday', 'saturday' => 'saturday', 'sat' => 'saturday',
                'dimanche' => 'sunday', 'sunday' => 'sunday', 'sun' => 'sunday',
            ];

            return $aliases[$j] ?? $j;
        };

        // ✅ Slots 2h + après-midi 14:30
        $slots = [
            ['label' => '08:30 - 10:30', 'start' => '08:30', 'end' => '10:30'],
            ['label' => '10:45 - 12:45', 'start' => '10:45', 'end' => '12:45'],
            ['label' => '14:30 - 16:30', 'start' => '14:30', 'end' => '16:30'],
            ['label' => '16:45 - 18:45', 'start' => '16:45', 'end' => '18:45'],
        ];

        $days = [
            ['key' => 'monday', 'label' => 'Lundi'],
            ['key' => 'tuesday', 'label' => 'Mardi'],
            ['key' => 'wednesday', 'label' => 'Mercredi'],
            ['key' => 'thursday', 'label' => 'Jeudi'],
            ['key' => 'friday', 'label' => 'Vendredi'],
            ['key' => 'saturday', 'label' => 'Samedi'],
        ];

        // ✅ Même filtre que index(): semaine sur date_effective OU séances récurrentes (null)
        $sessions = CourseSession::query()
            ->with(['module:id,code,name'])
            ->where('teacher_id', $teacherId)
            ->where(function ($q) use ($start, $end) {
                $q->whereBetween('date_effective', [$start->toDateString(), $end->toDateString()])
                ->orWhereNull('date_effective');
            })
            ->orderByRaw("FIELD(jour,'monday','tuesday','wednesday','thursday','friday','saturday','sunday')")
            ->orderBy('heure_debut')
            ->get()
            ->map(function ($s) use ($mapDay) {
                $dayKey = $mapDay($s->jour);

                // Si jour null mais date_effective existe -> on calcule
                if (!$dayKey && $s->date_effective) {
                    $dayKey = strtolower(Carbon::parse($s->date_effective)->format('l')); // monday...
                }

                return [
                    'day'   => $dayKey,
                    'start' => substr((string)$s->heure_debut, 0, 5),
                    'end'   => substr((string)$s->heure_fin, 0, 5),
                    'room'  => $s->salle,
                    'type'  => 'Cours', // DB n’a pas type
                    'module'=> [
                        'code' => $s->module?->code,
                        'name' => $s->module?->name,
                    ],
                ];
            })
            ->filter(fn ($x) => in_array($x['day'], ['monday','tuesday','wednesday','thursday','friday','saturday']))
            ->values();

        // ✅ Helper overlap (comme ton tableau React)
        $toMins = function (string $t) {
            [$h, $m] = array_map('intval', explode(':', $t));
            return $h * 60 + $m;
        };

        // ✅ Construire une grille day+slot en utilisant overlap
        $grid = [];
        foreach ($days as $d) {
            $grid[$d['key']] = [];
            foreach ($slots as $slot) {
                $grid[$d['key']][$slot['start']] = null;

                $slotStart = $toMins($slot['start']);
                $slotEnd   = $toMins($slot['end']);

                foreach ($sessions as $s) {
                    if ($s['day'] !== $d['key']) continue;

                    $sStart = $toMins($s['start']);
                    $sEnd   = $toMins($s['end']);

                    // overlap
                    if ($sStart < $slotEnd && $sEnd > $slotStart) {
                        $grid[$d['key']][$slot['start']] = $s;
                        break;
                    }
                }
            }
        }

        $pdf = PDF::loadView('pdf.teacher_timetable', [
            'weekStart'   => $start,
            'weekEnd'     => $end,
            'days'        => $days,
            'slots'       => $slots,
            'grid'        => $grid,
            'teacherName' => $request->user()->name,
        ])->setPaper('a4', 'landscape');

        // download() OK pour blob axios
        return $pdf->download('emploi-du-temps-enseignant-semaine.pdf');
    }
}