<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\Request;

class DepartmentsController extends Controller
{
    public function index()
    {
        return Department::query()->orderBy('name')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:departments,name',
        ]);

        $dep = Department::create($data);
        return response()->json($dep, 201);
    }

    public function update(Request $request, Department $department)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:departments,name,' . $department->id,
        ]);

        $department->update($data);
        return response()->json($department->fresh());
    }

    public function destroy(Department $department)
    {
        $department->delete();
        return response()->json(['ok' => true]);
    }
}
