<?php

namespace App\Services;

class QrTokenService
{
    // Le token change chaque 60s
    private int $stepSeconds = 60;

    /**
     * Create a signed token for (session_id, date) with TTL and minute rotation.
     */
    public function makeToken(int $sessionId, string $date, int $ttlMinutes = 15): string
    {
        $now = now()->timestamp;
        $exp = now()->addMinutes($ttlMinutes)->timestamp;

        // minute slot: change chaque minute
        $slot = intdiv($now, $this->stepSeconds);

        $payload = $sessionId . '|' . $date . '|' . $exp . '|' . $slot;
        $sig = hash_hmac('sha256', $payload, config('app.key'));

        return base64_encode($payload . '|' . $sig);
    }

    /**
     * Verify token and return payload.
     * Accepts current slot or previous slot (tolerance).
     */
    public function verifyToken(string $token): array
    {
        $raw = base64_decode($token, true);
        if (!$raw) return ['ok' => false];

        $parts = explode('|', $raw);

        // session|date|exp|slot|sig  => 5 parts
        if (count($parts) !== 5) return ['ok' => false];

        [$sessionId, $date, $exp, $slot, $sig] = $parts;

        if ((int)$exp < now()->timestamp) return ['ok' => false];

        $payload = $sessionId . '|' . $date . '|' . $exp . '|' . $slot;
        $expected = hash_hmac('sha256', $payload, config('app.key'));
        if (!hash_equals($expected, $sig)) return ['ok' => false];

        // rotation minute
        $currentSlot = intdiv(now()->timestamp, $this->stepSeconds);

        // tolérance: slot courant ou précédent (si scan au changement de minute)
        if (!in_array((int)$slot, [$currentSlot, $currentSlot - 1], true)) {
            return ['ok' => false];
        }

        return ['ok' => true, 'session_id' => (int)$sessionId, 'date' => $date];
    }

    /**
     * Seconds until next rotation (next minute tick).
     */
    public function expiresInSeconds(): int
    {
        $now = now()->timestamp;
        $next = (intdiv($now, $this->stepSeconds) + 1) * $this->stepSeconds;
        return max(0, $next - $now);
    }
}
