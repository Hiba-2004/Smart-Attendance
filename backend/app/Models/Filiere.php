<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Filiere extends Model
{
    /** @use HasFactory<\Database\Factories\FiliereFactory> */
    use HasFactory;

    protected $fillable = ['name', 'department_id'];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function modules()
    {
        return $this->hasMany(Module::class);
    }

    public function students()
    {
        return $this->hasMany(User::class);
    }
}
