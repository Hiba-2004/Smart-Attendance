<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    /** @use HasFactory<\Database\Factories\ModuleFactory> */
    use HasFactory;

    protected $fillable = ['name', 'filiere_id'];

    public function filiere()
    {
        return $this->belongsTo(Filiere::class);
    }

    public function teachers()
    {
        return $this->belongsToMany(User::class, 'teacher_module', 'module_id', 'teacher_id')
            ->withTimestamps();
    }

    public function sessions()
    {
        return $this->hasMany(CourseSession::class);
    }

    public function courses()
    {
        return $this->hasMany(Course::class);
    }

    public function homeworks()
    {
        return $this->hasMany(Homework::class);
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }
}
