<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
{
    Schema::table('users', function (Blueprint $table) {

        
        if (!Schema::hasColumn('users','role')) {
            $table->enum('role', ['student','teacher','admin'])->default('student')->after('password');
        }

        if (!Schema::hasColumn('users','matricule')) {
            $table->string('matricule')->nullable()->unique()->after('role');
        }

        if (!Schema::hasColumn('users','phone')) {
            $table->string('phone')->nullable()->after('matricule');
        }

        if (!Schema::hasColumn('users','filiere_id')) {
            $table->foreignId('filiere_id')->nullable()->constrained('filieres')->nullOnDelete()->after('phone');
        }
    });
}


    public function down(): void
{
    Schema::table('users', function (Blueprint $table) {

        if (Schema::hasColumn('users','filiere_id')) {
            $table->dropConstrainedForeignId('filiere_id');
        }

        if (Schema::hasColumn('users','phone')) {
            $table->dropColumn('phone');
        }

        if (Schema::hasColumn('users','matricule')) {
            $table->dropColumn('matricule');
        }

        if (Schema::hasColumn('users','role')) {
            $table->dropColumn('role');
        }
    });
}

};
