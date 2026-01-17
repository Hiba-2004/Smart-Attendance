<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AnnouncementsController extends Controller
{
    public function index(Request $request)
    {
        // Show general announcements + filiere-specific announcements (if student has filiere)
        $user = $request->user();
        $query = Announcement::query()->with('creator:id,name');

        $query->whereNull('filiere_id');

        if ($user && $user->filiere_id) {
            $query->orWhere('filiere_id', $user->filiere_id);
        }

        return $query->latest()->paginate(12);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'filiere_id' => 'nullable|exists:filieres,id',
            'image' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $path = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('announcements', 'public');
        }

        $announcement = Announcement::create([
            'title' => $data['title'],
            'content' => $data['content'],
            'filiere_id' => $data['filiere_id'] ?? null,
            'image_path' => $path,
            'created_by' => $request->user()->id,
            'role_creator' => $request->user()->role === 'teacher' ? 'teacher' : 'admin',
        ]);

        return response()->json($announcement->load('creator:id,name'), 201);
    }

    public function update(Request $request, Announcement $announcement)
    {
        // Creator or admin
        abort_unless(
            $request->user()->role === 'admin' || $announcement->created_by === $request->user()->id,
            403
        );

        $data = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
            'filiere_id' => 'nullable|exists:filieres,id',
            'image' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        if ($request->hasFile('image')) {
            if ($announcement->image_path) {
                Storage::disk('public')->delete($announcement->image_path);
            }
            $announcement->image_path = $request->file('image')->store('announcements', 'public');
        }

        $announcement->fill(collect($data)->except(['image'])->toArray());
        $announcement->save();

        return response()->json($announcement->fresh()->load('creator:id,name'));
    }

    public function destroy(Request $request, Announcement $announcement)
    {
        abort_unless(
            $request->user()->role === 'admin' || $announcement->created_by === $request->user()->id,
            403
        );

        if ($announcement->image_path) {
            Storage::disk('public')->delete($announcement->image_path);
        }

        $announcement->delete();

        return response()->json(['ok' => true]);
    }
}
