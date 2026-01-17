<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
    use HasFactory;

    protected $fillable = [
        'filiere_id',
        'module_id',
        'date',
        'start_time',
        'end_time',
        'room',
        'type',
    ];

    protected $casts = [
        'date' => 'date',
        'start_time' => 'string',
        'end_time' => 'string',
    ];

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function filiere()
    {
        return $this->belongsTo(Filiere::class);
    }
}
