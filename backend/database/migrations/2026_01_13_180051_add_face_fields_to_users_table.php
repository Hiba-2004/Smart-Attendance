<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('suri_person_id', 64)->nullable()->after('filiere_id');
            $table->timestamp('face_enrolled_at')->nullable()->after('suri_person_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['suri_person_id', 'face_enrolled_at']);
        });
    }
};
