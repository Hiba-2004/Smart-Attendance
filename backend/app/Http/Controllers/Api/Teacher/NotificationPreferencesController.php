<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Models\NotificationPreference;
use Illuminate\Http\Request;

class NotificationPreferencesController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();
        abort_unless($user->role === 'teacher', 403);

        // 1 row per user
        $pref = NotificationPreference::firstOrCreate(
            ['user_id' => $user->id],
            [] // defaults from migration
        );

        return response()->json($pref);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        abort_unless($user->role === 'teacher', 403);

        $data = $request->validate([
            'email_absences' => 'required|boolean',
            'email_assignments' => 'required|boolean',
            'email_announcements' => 'required|boolean',
            'email_exams' => 'required|boolean',
            'platform_absences' => 'required|boolean',
            'platform_assignments' => 'required|boolean',
            'platform_announcements' => 'required|boolean',
            'platform_exams' => 'required|boolean',
        ]);

        $pref = NotificationPreference::firstOrCreate(
            ['user_id' => $user->id],
            []
        );

        $pref->update($data);

        return response()->json($pref->fresh());
    }
}
