<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dashboard', function () {
        $role = auth()->user()->role;

        return match ($role) {
            'admin' => redirect()->route('admin.dashboard'),
            'teacher' => redirect()->route('teacher.dashboard'),
            default => redirect()->route('student.dashboard'),
        };
    })->name('dashboard');

    Route::get('/student/dashboard', function () {
        return view('dashboards.student');
    })->middleware('role:student')->name('student.dashboard');

    Route::get('/teacher/dashboard', function () {
        return view('dashboards.teacher');
    })->middleware('role:teacher')->name('teacher.dashboard');

    Route::get('/admin/dashboard', function () {
        return view('dashboards.admin');
    })->middleware('role:admin')->name('admin.dashboard');
});
