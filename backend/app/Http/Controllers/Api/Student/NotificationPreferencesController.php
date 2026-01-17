<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\NotificationPreference;
use Illuminate\Http\Request;

class NotificationPreferencesController extends Controller
{
    public function show(Request $request)
    {
        $pref = NotificationPreference::firstOrCreate(
            ['user_id' => $request->user()->id],
            [] // defaults from migration
        );

        return response()->json($pref);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'email_absences' => 'boolean',
            'email_assignments' => 'boolean',
            'email_announcements' => 'boolean',
            'email_exams' => 'boolean',
            'platform_absences' => 'boolean',
            'platform_assignments' => 'boolean',
            'platform_announcements' => 'boolean',
            'platform_exams' => 'boolean',
        ]);

        $pref = NotificationPreference::firstOrCreate(
            ['user_id' => $request->user()->id],
            []
        );

        $pref->update($data);

        return response()->json($pref);
    }
}
