<?php

namespace App\Services;

class FaceService
{
    /**
     * Placeholder face verification.
     *
     * Later: integrate a Python microservice (InsightFace/DeepFace) or cloud API.
     */
    public function verify(string $imageBase64): array
    {
        return [
            'matched' => false,
            'confidence' => 0.00,
            'message' => 'Face recognition not enabled (placeholder).',
        ];
    }
}
