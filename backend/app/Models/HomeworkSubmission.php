<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HomeworkSubmission extends Model
{
    /** @use HasFactory<\Database\Factories\HomeworkSubmissionFactory> */
    use HasFactory;
    protected $table = 'homework_submissions';

    protected $fillable = [
        'homework_id',
        'student_id',
        'file_path',
        'note',
    ];

    protected $casts = [
        'note' => 'decimal:2',
    ];

    public function homework()
    {
        return $this->belongsTo(Homework::class);
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
