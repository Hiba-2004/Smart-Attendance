<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Emploi du temps — Enseignant</title>
  <style>
    body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #0f172a; }
    h1 { font-size: 16px; margin: 0 0 6px 0; }
    .meta { margin-bottom: 10px; color: #334155; }
    .small { font-size: 10px; color: #475569; }

    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    th, td { border: 1px solid #cbd5e1; padding: 6px; vertical-align: middle; }
    th { background: #f1f5f9; text-align: center; font-weight: 700; }
    .time { width: 110px; background: #f8fafc; text-align: center; font-weight: 700; }
    .cell { height: 58px; text-align: center; }

    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 999px;
      font-size: 9px;
      font-weight: 700;
      margin-bottom: 4px;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #0f172a;
    }

    .title { font-weight: 700; font-size: 11px; margin-bottom: 2px; }
    .muted { color: #475569; font-size: 10px; }
  </style>
</head>
<body>
  <h1>Emploi du temps — Enseignant</h1>

  <div class="meta">
    <div><strong>Enseignant :</strong> {{ $teacherName }}</div>
    <div><strong>Semaine :</strong> {{ $weekStart->format('d/m/Y') }} → {{ $weekEnd->format('d/m/Y') }}</div>
    <div class="small">Généré le {{ now()->format('Y-m-d H:i') }}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th class="time">Horaire</th>
        @foreach($days as $d)
          <th>{{ $d['label'] }}</th>
        @endforeach
      </tr>
    </thead>

    <tbody>
      @foreach($slots as $slot)
        <tr>
          <td class="time">{{ $slot['label'] }}</td>

          @foreach($days as $d)
            @php
              $entry = $grid[$d['key']][$slot['start']] ?? null;
            @endphp

            <td class="cell">
              @if($entry)
                <div class="badge">{{ $entry['type'] ?? 'Cours' }}</div>
                <div class="title">
                  {{ $entry['module']['code'] ?? '' }}
                  @if(!empty($entry['module']['code'])) — @endif
                  {{ $entry['module']['name'] ?? 'Module' }}
                </div>
                <div class="muted">{{ $entry['room'] ?? '—' }}</div>
                <div class="muted">{{ $entry['start'] }} - {{ $entry['end'] }}</div>
              @else
                <span class="muted">—</span>
              @endif
            </td>
          @endforeach
        </tr>
      @endforeach
    </tbody>
  </table>
</body>
</html>
