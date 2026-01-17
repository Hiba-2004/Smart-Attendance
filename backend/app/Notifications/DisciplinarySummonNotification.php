<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class DisciplinarySummonNotification extends Notification
{
    use Queueable;

    public function __construct(public int $unjustifiedCount) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Convocation - Suivi disciplinaire')
            ->greeting('Bonjour ' . $notifiable->name . ',')
            ->line("Votre nombre d'absences injustifiées est actuellement : {$this->unjustifiedCount}.")
            ->line("Merci de vous rapprocher de l'administration pour régularisation.");
    }
}
