<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Jetstream\HasProfilePhoto;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory;
    use HasProfilePhoto;
    use Notifiable;
    use TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'matricule',
        'phone',
        'filiere_id',
        'suri_person_id',
        'face_enrolled_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_recovery_codes',
        'two_factor_secret',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'profile_photo_url',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'face_enrolled_at' => 'datetime',
        ];
    }

    // Relations
    public function filiere()
    {
        return $this->belongsTo(\App\Models\Filiere::class);
    }

    public function taughtModules()
    {
        return $this->belongsToMany(\App\Models\Module::class, 'teacher_module', 'teacher_id', 'module_id')
            ->withTimestamps();
    }

    public function attendances()
    {
        return $this->hasMany(\App\Models\Attendance::class, 'student_id');
    }

    public function createdAnnouncements()
    {
        return $this->hasMany(\App\Models\Announcement::class, 'created_by');
    }

    // Role helpers
    public function isStudent(): bool { return $this->role === 'student'; }
    public function isTeacher(): bool { return $this->role === 'teacher'; }
    public function isAdmin(): bool { return $this->role === 'admin'; }

    public function notificationPreference()
{
    return $this->hasOne(\App\Models\NotificationPreference::class);
}


    

}
