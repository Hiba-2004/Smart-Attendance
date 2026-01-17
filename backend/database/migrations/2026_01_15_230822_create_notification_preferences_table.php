<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->unique();
            $table->boolean('email_absences')->default(true);
            $table->boolean('email_assignments')->default(true);
            $table->boolean('email_announcements')->default(true);
            $table->boolean('email_exams')->default(true);

            $table->boolean('platform_absences')->default(true);
            $table->boolean('platform_assignments')->default(true);
            $table->boolean('platform_announcements')->default(true);
            $table->boolean('platform_exams')->default(true);

            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_preferences');
    }
};
