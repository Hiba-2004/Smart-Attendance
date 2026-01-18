<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();
        abort_unless($user->role === 'teacher', 403);

        $data = $request->validate([
            'firstName' => 'required|string|max:100',
            'lastName' => 'required|string|max:100',
        ]);

        $user->name = trim($data['firstName'] . ' ' . $data['lastName']);
        $user->save();

        return response()->json(['ok' => true]);
    }
}
