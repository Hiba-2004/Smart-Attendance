<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    /** @use HasFactory<\Database\Factories\AnnouncementFactory> */
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'image_path',
        'filiere_id',
        'created_by',
        'role_creator',
    ];

    public function filiere()
    {
        return $this->belongsTo(Filiere::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
