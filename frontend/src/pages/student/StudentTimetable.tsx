import React, { useEffect, useState } from 'react';
import { StudentLayout } from '@/layouts/StudentLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { studentTimetableService, type TimetableEntry } from '@/lib/api';

const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'] as const;
const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;

const timeSlots = [
  { start: '08:00', end: '10:00', label: '08h - 10h' },
  { start: '10:00', end: '12:00', label: '10h - 12h' },
  { start: '12:00', end: '14:00', label: '12h - 14h' },
  { start: '14:00', end: '16:00', label: '14h - 16h' },
  { start: '16:00', end: '18:00', label: '16h - 18h' },
];

const StudentTimetable: React.FC = () => {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await studentTimetableService.getAll();
        setTimetable(data);
      } catch {
        toast({
          title: "Erreur",
          description: "Impossible de charger l'emploi du temps depuis le serveur.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'lecture': return 'Cours';
      case 'tutorial': return 'TD';
      case 'lab': return 'TP';
      default: return type;
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'lecture': return 'bg-primary/10 border-primary/20 text-primary';
      case 'tutorial': return 'bg-accent/30 border-accent/40';
      case 'lab': return 'bg-info/10 border-info/20 text-info';
      default: return 'bg-muted border-border';
    }
  };

  const getEntryForSlot = (day: string, slotStart: string, slotEnd: string) => {
    const slotStartMins = parseInt(slotStart.split(':')[0]) * 60 + parseInt(slotStart.split(':')[1]);
    const slotEndMins = parseInt(slotEnd.split(':')[0]) * 60 + parseInt(slotEnd.split(':')[1]);

    return timetable.find(entry => {
      if (entry.day !== day) return false;

      const entryStartMins = parseInt(entry.startTime.split(':')[0]) * 60 + parseInt(entry.startTime.split(':')[1]);
      const entryEndMins = parseInt(entry.endTime.split(':')[0]) * 60 + parseInt(entry.endTime.split(':')[1]);

      return entryStartMins < slotEndMins && entryEndMins > slotStartMins;
    });
  };

  const handlePrint = () => {
    window.print();
    toast({
      title: "Impression",
      description: "La boîte de dialogue d'impression a été ouverte.",
    });
  };

  const handleDownloadPDF = async () => {
    try {
      toast({
        title: "Téléchargement PDF",
        description: "Préparation du PDF...",
      });

      const blob = await studentTimetableService.downloadPdf();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "emploi_du_temps.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch {
      toast({
        title: "Erreur",
        description: "Téléchargement du PDF impossible.",
        variant: "destructive",
      });
    }
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl lg:text-3xl text-foreground mb-2">
              Emploi du temps
            </h1>
            <p className="text-muted-foreground">
              Semestre 7 — Génie Informatique
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Imprimer
            </Button>
            <Button variant="institutional" size="sm" onClick={handleDownloadPDF}>
              <Download className="w-4 h-4 mr-2" />
              Télécharger PDF
            </Button>
          </div>
        </div>

        {loading && (
          <div className="card-institutional p-6 text-sm text-muted-foreground">
            Chargement de l'emploi du temps...
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary/10 border border-primary/20" />
            <span className="text-sm text-muted-foreground">Cours magistral</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-accent/30 border border-accent/40" />
            <span className="text-sm text-muted-foreground">Travaux dirigés (TD)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-info/10 border border-info/20" />
            <span className="text-sm text-muted-foreground">Travaux pratiques (TP)</span>
          </div>
        </div>

        {/* Timetable Grid */}
        <div className="card-institutional overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse">
              <thead>
                <tr>
                  <th className="w-24 p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50 border-b border-r border-border">
                    Horaire
                  </th>
                  {days.map((day) => (
                    <th key={day} className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50 border-b border-r border-border last:border-r-0">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((slot) => {
                  const isLunchBreak = slot.start === '12:00';

                  return (
                    <tr key={slot.label} className={isLunchBreak ? 'bg-muted/10' : ''}>
                      <td className="p-3 text-sm font-medium text-muted-foreground border-r border-b border-border bg-muted/20 whitespace-nowrap">
                        {slot.label}
                        {isLunchBreak && (
                          <span className="block text-[10px] text-muted-foreground/60 mt-0.5">
                            Pause
                          </span>
                        )}
                      </td>
                      {dayKeys.map((dayKey) => {
                        const entry = getEntryForSlot(dayKey, slot.start, slot.end);

                        return (
                          <td
                            key={dayKey}
                            className="p-2 border-r border-b border-border last:border-r-0 align-top h-24"
                          >
                            {entry && !isLunchBreak ? (
                              <div className={`h-full p-3 rounded-md border ${getTypeStyles(entry.type)} transition-all hover:shadow-sm`}>
                                <div className="flex flex-col h-full">
                                  <p className="font-medium text-sm text-foreground leading-tight">
                                    {entry.course}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {entry.room}
                                  </p>
                                  <div className="mt-auto pt-2 flex items-center justify-between">
                                    <span className="text-[10px] text-muted-foreground">
                                      {entry.startTime} - {entry.endTime}
                                    </span>
                                    <Badge
                                      variant={entry.type as 'lecture' | 'tutorial' | 'lab'}
                                      className="text-[10px] px-1.5 py-0"
                                    >
                                      {getTypeLabel(entry.type)}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            ) : isLunchBreak ? (
                              <div className="h-full flex items-center justify-center">
                                <span className="text-xs text-muted-foreground/40 italic">—</span>
                              </div>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Week info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground p-4 bg-muted/20 rounded-lg">
          <span>Semaine du 30 décembre 2024 au 3 janvier 2025</span>
          <span>Semaine 1 — Semestre 7</span>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentTimetable;
