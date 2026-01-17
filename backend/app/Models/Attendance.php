<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    /** @use HasFactory<\Database\Factories\AttendanceFactory> */
    use HasFactory;

    protected $fillable = [
        'student_id',
        'module_id',
        'course_session_id',
        'date',
        'status',
        'method',
        'confidence',
        'marked_at',
    ];

    protected $casts = [
        'date' => 'date',
        'marked_at' => 'datetime',
        'confidence' => 'decimal:2',
    ];

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function session()
    {
        return $this->belongsTo(CourseSession::class, 'course_session_id');
    }

    public function justification()
    {
        return $this->hasOne(Justification::class);
    }
}
