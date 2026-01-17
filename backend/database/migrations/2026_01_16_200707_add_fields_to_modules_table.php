<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('modules', function (Blueprint $table) {
            // si ton mysql est strict, mets nullable au début pour éviter erreurs sur données existantes
            $table->string('code')->nullable()->after('id');
            $table->unsignedTinyInteger('credits')->default(3)->after('name');
            $table->unsignedTinyInteger('semester')->default(1)->after('credits');
            $table->text('description')->nullable()->after('semester');
        });
    }

    public function down(): void
    {
        Schema::table('modules', function (Blueprint $table) {
            $table->dropColumn(['code', 'credits', 'semester', 'description']);
        });
    }
};
