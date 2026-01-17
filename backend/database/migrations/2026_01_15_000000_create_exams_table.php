<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Safety: do nothing if already exists
        if (Schema::hasTable('exams')) {
            return;
        }

        Schema::create('exams', function (Blueprint $table) {
            $table->id();

            $table->foreignId('filiere_id')->constrained('filieres')->cascadeOnDelete();
            $table->foreignId('module_id')->constrained('modules')->cascadeOnDelete();

            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->string('room')->nullable();

            $table->enum('type', ['midterm', 'final', 'quiz'])->default('final');

            $table->timestamps();

            $table->index(['filiere_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exams');
    }
};
