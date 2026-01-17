<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:60'],
            'last_name'  => ['required', 'string', 'max:60'],
        ]);

        // We store as "name" (your frontend maps from BackendUser.name)
        $fullName = trim($data['first_name'] . ' ' . $data['last_name']);

        $user->update([
            'name' => $fullName,
        ]);

        // Return user (MeController structure expects user fields)
        return response()->json($user->fresh());
    }
}
