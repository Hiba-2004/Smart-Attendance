<?php

namespace App\Exports;

use App\Models\Attendance;
use Illuminate\Contracts\Support\Responsable;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class AttendancesExport implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(
        public string $date,
        public ?int $moduleId = null,
        public ?int $sessionId = null,
    ) {}

    public function collection(): Collection
    {
        $q = Attendance::with(['student:id,name,email,matricule','module:id,name','session:id,salle,jour,heure_debut,heure_fin'])
            ->where('date', $this->date);

        if ($this->moduleId) {
            $q->where('module_id', $this->moduleId);
        }
        if ($this->sessionId) {
            $q->where('course_session_id', $this->sessionId);
        }

        return $q->orderBy('module_id')->orderBy('student_id')->get();
    }

    public function headings(): array
    {
        return [
            'Date',
            'Module',
            'Etudiant',
            'Email',
            'Matricule',
            'Statut',
            'Methode',
            'Salle',
            'Jour',
            'Heure debut',
            'Heure fin',
        ];
    }

    public function map($row): array
    {
        return [
            $row->date?->format('Y-m-d'),
            $row->module?->name,
            $row->student?->name,
            $row->student?->email,
            $row->student?->matricule,
            $row->status,
            $row->method,
            $row->session?->salle,
            $row->session?->jour,
            $row->session?->heure_debut,
            $row->session?->heure_fin,
        ];
    }
}
