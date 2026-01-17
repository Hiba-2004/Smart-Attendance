<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Homework extends Model
{
    /** @use HasFactory<\Database\Factories\HomeworkFactory> */
    use HasFactory;
    protected $table = 'homeworks';
    protected $fillable = [
        'module_id',
        'teacher_id',
        'title',
        'description',
        'deadline',
        'file_path',
    ];

    protected $casts = [
        'deadline' => 'datetime',
    ];

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function submissions()
    {
        return $this->hasMany(HomeworkSubmission::class);
    }
}
