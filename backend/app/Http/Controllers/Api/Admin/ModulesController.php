<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Module;
use Illuminate\Http\Request;

class ModulesController extends Controller
{
    public function index()
    {
        return Module::with('filiere:id,name')->orderBy('name')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'filiere_id' => 'required|exists:filieres,id',
        ]);

        $exists = Module::where('filiere_id', $data['filiere_id'])
            ->where('name', $data['name'])->exists();
        abort_unless(!$exists, 422, 'Module name already exists in this filiere.');

        $m = Module::create($data);
        return response()->json($m->load('filiere:id,name'), 201);
    }

    public function update(Request $request, Module $module)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'filiere_id' => 'required|exists:filieres,id',
        ]);

        $exists = Module::where('filiere_id', $data['filiere_id'])
            ->where('name', $data['name'])
            ->where('id', '!=', $module->id)
            ->exists();
        abort_unless(!$exists, 422, 'Module name already exists in this filiere.');

        $module->update($data);
        return response()->json($module->fresh()->load('filiere:id,name'));
    }

    public function destroy(Module $module)
    {
        $module->delete();
        return response()->json(['ok' => true]);
    }
}
