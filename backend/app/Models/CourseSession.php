<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourseSession extends Model
{
    /** @use HasFactory<\Database\Factories\CourseSessionFactory> */
    use HasFactory;

    protected $fillable = [
        'filiere_id',
        'module_id',
        'teacher_id',
        'salle',
        'jour',
        'heure_debut',
        'heure_fin',
        'date_effective',
    ];

    protected $casts = [
        'date_effective' => 'date',
    ];

    public function filiere()
    {
        return $this->belongsTo(Filiere::class);
    }

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class, 'course_session_id');
    }
}
