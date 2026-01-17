<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Filiere;
use Illuminate\Http\Request;

class FilieresController extends Controller
{
    public function index()
    {
        return Filiere::with('department:id,name')->orderBy('name')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'department_id' => 'required|exists:departments,id',
        ]);

        // Unique name within department
        $exists = Filiere::where('department_id', $data['department_id'])
            ->where('name', $data['name'])->exists();
        abort_unless(!$exists, 422, 'Filiere name already exists in this department.');

        $f = Filiere::create($data);
        return response()->json($f->load('department:id,name'), 201);
    }

    public function update(Request $request, Filiere $filiere)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'department_id' => 'required|exists:departments,id',
        ]);

        $exists = Filiere::where('department_id', $data['department_id'])
            ->where('name', $data['name'])
            ->where('id', '!=', $filiere->id)
            ->exists();
        abort_unless(!$exists, 422, 'Filiere name already exists in this department.');

        $filiere->update($data);
        return response()->json($filiere->fresh()->load('department:id,name'));
    }

    public function destroy(Filiere $filiere)
    {
        $filiere->delete();
        return response()->json(['ok' => true]);
    }
}
