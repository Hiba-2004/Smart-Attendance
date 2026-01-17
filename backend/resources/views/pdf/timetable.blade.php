<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Emploi du temps</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #0f172a; }
        h1 { font-size: 18px; margin: 0 0 6px 0; }
        .meta { margin-bottom: 12px; color: #334155; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
        th { background: #f1f5f9; }
        .small { font-size: 11px; color: #475569; }
    </style>
</head>
<body>
    <h1>Emploi du temps</h1>
    <div class="meta">
        <div><strong>Étudiant:</strong> {{ $student->name }} ({{ $student->email }})</div>
        <div><strong>Filière:</strong> {{ $filiereName }}</div>
        <div class="small">Généré le {{ now()->format('Y-m-d H:i') }}</div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Jour</th>
                <th>Heure</th>
                <th>Module</th>
                <th>Enseignant</th>
                <th>Salle</th>
            </tr>
        </thead>
        <tbody>
            @forelse($items as $it)
                <tr>
                    <td>{{ $it->jour }}</td>
                    <td>{{ $it->heure_debut }} - {{ $it->heure_fin }}</td>
                    <td>{{ $it->module?->name }}</td>
                    <td>{{ $it->teacher?->name }}</td>
                    <td>{{ $it->salle ?? '—' }}</td>
                </tr>
            @empty
                <tr><td colspan="5">Aucune séance.</td></tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
