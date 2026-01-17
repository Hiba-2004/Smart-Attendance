<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CourseSession;
use Illuminate\Http\Request;

class SessionsController extends Controller
{
    public function index(Request $request)
    {
        $q = CourseSession::with([
            'module:id,name',
            'filiere:id,name',
            'teacher:id,name'
        ])->orderBy('jour')->orderBy('heure_debut');

        if ($request->query('filiere_id')) {
            $q->where('filiere_id', $request->query('filiere_id'));
        }
        if ($request->query('teacher_id')) {
            $q->where('teacher_id', $request->query('teacher_id'));
        }

        return $q->paginate(25);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'filiere_id' => 'required|exists:filieres,id',
            'module_id' => 'required|exists:modules,id',
            'teacher_id' => 'required|exists:users,id',
            'salle' => 'nullable|string|max:255',
            'jour' => 'required|in:Mon,Tue,Wed,Thu,Fri,Sat',
            'heure_debut' => 'required|date_format:H:i',
            'heure_fin' => 'required|date_format:H:i|after:heure_debut',
            'date_effective' => 'nullable|date',
        ]);

        $session = CourseSession::create($data);
        return response()->json($session->load(['module:id,name','filiere:id,name','teacher:id,name']), 201);
    }

    public function update(Request $request, CourseSession $session)
    {
        $data = $request->validate([
            'filiere_id' => 'required|exists:filieres,id',
            'module_id' => 'required|exists:modules,id',
            'teacher_id' => 'required|exists:users,id',
            'salle' => 'nullable|string|max:255',
            'jour' => 'required|in:Mon,Tue,Wed,Thu,Fri,Sat',
            'heure_debut' => 'required|date_format:H:i',
            'heure_fin' => 'required|date_format:H:i|after:heure_debut',
            'date_effective' => 'nullable|date',
        ]);

        $session->update($data);
        return response()->json($session->fresh()->load(['module:id,name','filiere:id,name','teacher:id,name']));
    }

    public function destroy(CourseSession $session)
    {
        $session->delete();
        return response()->json(['ok' => true]);
    }
}
