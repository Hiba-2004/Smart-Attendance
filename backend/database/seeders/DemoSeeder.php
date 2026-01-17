<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\Department;
use App\Models\Filiere;
use App\Models\Module;
use App\Models\CourseSession;
use App\Models\Course;
use App\Models\Homework;
use App\Models\Attendance;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Demo data for local dev.
 *
 * Creates:
 * - departments / filieres / modules
 * - 1 admin, 1 teacher, 3 students
 * - teacher_module pivot
 * - 2 announcements
 */
class DemoSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $dept = Department::firstOrCreate(['name' => 'Génie Informatique']);
            $filiere = Filiere::firstOrCreate(
                ['name' => 'GI-IA', 'department_id' => $dept->id],
                ['created_at' => now(), 'updated_at' => now()]
            );

            $m1 = Module::firstOrCreate(['name' => 'Web & Laravel', 'filiere_id' => $filiere->id]);
            $m2 = Module::firstOrCreate(['name' => 'Java & Spring', 'filiere_id' => $filiere->id]);

            $admin = User::firstOrCreate(
                ['email' => 'admin@ensa.test'],
                ['name' => 'Admin ENSA', 'password' => Hash::make('password'), 'role' => 'admin']
            );

            $teacher = User::firstOrCreate(
                ['email' => 'teacher@ensa.test'],
                ['name' => 'Teacher ENSA', 'password' => Hash::make('password'), 'role' => 'teacher']
            );

            // Attach teacher to modules
            $teacher->taughtModules()->syncWithoutDetaching([$m1->id, $m2->id]);

            for ($i = 1; $i <= 3; $i++) {
                User::firstOrCreate(
                    ['email' => "student{$i}@ensa.test"],
                    [
                        'name' => "Student {$i}",
                        'password' => Hash::make('password'),
                        'role' => 'student',
                        'filiere_id' => $filiere->id,
                        'matricule' => "M2026".str_pad((string) $i, 3, '0', STR_PAD_LEFT),
                    ]
                );
            }

            // Create a basic timetable (course_sessions)
            CourseSession::firstOrCreate(
                [
                    'filiere_id' => $filiere->id,
                    'module_id' => $m1->id,
                    'teacher_id' => $teacher->id,
                    'jour' => 'Mon',
                    'heure_debut' => '08:30:00',
                    'heure_fin' => '10:30:00',
                ],
                [
                    'salle' => 'A12',
                    'date_effective' => null,
                ]
            );

            CourseSession::firstOrCreate(
                [
                    'filiere_id' => $filiere->id,
                    'module_id' => $m2->id,
                    'teacher_id' => $teacher->id,
                    'jour' => 'Wed',
                    'heure_debut' => '10:45:00',
                    'heure_fin' => '12:15:00',
                ],
                [
                    'salle' => 'B07',
                    'date_effective' => null,
                ]
            );

            // Sample course file placeholder (no file)
            Course::firstOrCreate(
                [
                    'module_id' => $m1->id,
                    'teacher_id' => $teacher->id,
                    'title' => 'Introduction Laravel',
                ],
                [
                    'description' => 'Support du cours (démo).',
                    'file_path' => null,
                ]
            );

            // Sample homework
            Homework::firstOrCreate(
                [
                    'module_id' => $m1->id,
                    'teacher_id' => $teacher->id,
                    'title' => 'TP1 Laravel',
                ],
                [
                    'description' => 'Créer un CRUD simple (démo).',
                    'deadline' => now()->addDays(7),
                    'file_path' => null,
                ]
            );

            // Sample attendance (one absence for student1)
            $student1 = User::where('email', 'student1@ensa.test')->first();
            if ($student1) {
                Attendance::firstOrCreate(
                    [
                        'student_id' => $student1->id,
                        'module_id' => $m1->id,
                        'date' => now()->toDateString(),
                    ],
                    [
                        'status' => 'absent',
                        'method' => 'manual',
                        'marked_at' => now(),
                    ]
                );
            }

            Announcement::firstOrCreate(
                ['title' => 'Bienvenue sur la plateforme'],
                [
                    'content' => "Plateforme ENSA: présence, annonces, cours, travaux et vie académique.",
                    'created_by' => $admin->id,
                    'role_creator' => 'admin',
                ]
            );

            Announcement::firstOrCreate(
                ['title' => 'Rappel justificatifs'],
                [
                    'content' => "Merci de déposer les justificatifs dans les 48h.",
                    'created_by' => $admin->id,
                    'role_creator' => 'admin',
                ]
            );
        });
    }
}
