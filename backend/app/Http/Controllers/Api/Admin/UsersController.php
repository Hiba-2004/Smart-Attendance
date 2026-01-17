<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UsersController extends Controller
{
    public function index(Request $request)
    {
        $role = $request->query('role');
        $q = User::query()->with('filiere:id,name');
        if ($role) {
            $q->where('role', $role);
        }
        if ($request->query('search')) {
            $s = $request->query('search');
            $q->where(function ($qq) use ($s) {
                $qq->where('name', 'like', "%{$s}%")
                    ->orWhere('email', 'like', "%{$s}%")
                    ->orWhere('matricule', 'like', "%{$s}%");
            });
        }
        return $q->orderBy('name')->paginate(20);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:student,teacher,admin',
            'matricule' => 'nullable|string|max:255|unique:users,matricule',
            'phone' => 'nullable|string|max:255',
            'filiere_id' => 'nullable|exists:filieres,id',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'],
            'matricule' => $data['matricule'] ?? null,
            'phone' => $data['phone'] ?? null,
            'filiere_id' => $data['filiere_id'] ?? null,
        ]);

        return response()->json($user->load('filiere:id,name'), 201);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6',
            'role' => 'required|in:student,teacher,admin',
            'matricule' => 'nullable|string|max:255|unique:users,matricule,' . $user->id,
            'phone' => 'nullable|string|max:255',
            'filiere_id' => 'nullable|exists:filieres,id',
        ]);

        $user->name = $data['name'];
        $user->email = $data['email'];
        $user->role = $data['role'];
        $user->matricule = $data['matricule'] ?? null;
        $user->phone = $data['phone'] ?? null;
        $user->filiere_id = $data['filiere_id'] ?? null;
        if (!empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }
        $user->save();

        return response()->json($user->fresh()->load('filiere:id,name'));
    }

    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(['ok' => true]);
    }
}
