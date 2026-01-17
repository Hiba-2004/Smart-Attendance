<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationPreference extends Model
{
    protected $fillable = [
        'user_id',
        'email_absences',
        'email_assignments',
        'email_announcements',
        'email_exams',
        'platform_absences',
        'platform_assignments',
        'platform_announcements',
        'platform_exams',
    ];

    protected $casts = [
        'email_absences' => 'boolean',
        'email_assignments' => 'boolean',
        'email_announcements' => 'boolean',
        'email_exams' => 'boolean',
        'platform_absences' => 'boolean',
        'platform_assignments' => 'boolean',
        'platform_announcements' => 'boolean',
        'platform_exams' => 'boolean',
    ];
}
