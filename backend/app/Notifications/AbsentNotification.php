<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class AbsentNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $moduleName,
        public string $date,
        public string $startTime = '',
        public string $room = ''
    ) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Absence enregistrée')
            ->greeting('Bonjour ' . $notifiable->name . ',')
            ->line("Une absence a été enregistrée pour le module : {$this->moduleName}.")
            ->line("Date : {$this->date} | Heure : " . ($this->startTime ?: '—') . " | Salle : " . ($this->room ?: '—'))
            ->line('Si vous avez un justificatif, merci de le déposer dans les 48h depuis votre espace étudiant.');
    }
}
