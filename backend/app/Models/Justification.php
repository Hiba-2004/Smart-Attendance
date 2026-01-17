<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Justification extends Model
{
    /** @use HasFactory<\Database\Factories\JustificationFactory> */
    use HasFactory;

    protected $fillable = [
        'attendance_id',
        'file_path',
        'status',
    ];

    public function attendance()
    {
        return $this->belongsTo(Attendance::class);
    }
}
