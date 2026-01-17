<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('module_id')->constrained('modules')->cascadeOnDelete();
            $table->foreignId('course_session_id')->nullable()->constrained('course_sessions')->nullOnDelete();
            $table->date('date');
            $table->enum('status', ['present','absent'])->default('absent');
            $table->enum('method', ['qr','face','manual'])->default('manual');
            $table->decimal('confidence', 5, 2)->nullable();
            $table->timestamp('marked_at')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'module_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
