import React, { useEffect, useState } from "react";
import { TeacherLayout } from "@/layouts/TeacherLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { teacherTimetableService, type TeacherTimetableEntry } from "@/lib/api";

const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"] as const;
const dayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

// ✅ créneaux 2h + après-midi commence 14:30
const timeSlots = [
  { start: "08:30", end: "10:30", label: "08:30 - 10:30" },
  { start: "10:45", end: "12:45", label: "10:45 - 12:45" },
  { start: "14:30", end: "16:30", label: "14:30 - 16:30" },
  { start: "16:45", end: "18:45", label: "16:45 - 18:45" },
];

const TeacherTimetable: React.FC = () => {
  const [timetable, setTimetable] = useState<TeacherTimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await teacherTimetableService.getAll();
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
      case "lecture":
        return "Cours";
      case "tutorial":
        return "TD";
      case "lab":
        return "TP";
      default:
        return type;
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "lecture":
        return "bg-primary/10 border-primary/20 text-primary";
      case "tutorial":
        return "bg-accent/30 border-accent/40";
      case "lab":
        return "bg-info/10 border-info/20 text-info";
      default:
        return "bg-muted border-border";
    }
  };

  const toMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  // ✅ même logique que student: on place un cours s’il overlap le créneau
  const getEntryForSlot = (day: string, slotStart: string, slotEnd: string) => {
    const slotStartMins = toMinutes(slotStart);
    const slotEndMins = toMinutes(slotEnd);

    return timetable.find((entry) => {
      if ((entry.day || "").toLowerCase() !== day) return false;

      const entryStartMins = toMinutes(entry.startTime);
      const entryEndMins = toMinutes(entry.endTime);

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

  // ✅ export PDF EXACTEMENT comme student (blob)
  const handleDownloadPDF = async () => {
    try {
      toast({ title: "Téléchargement PDF", description: "Préparation du PDF..." });

      const blob = await teacherTimetableService.downloadPdf();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "emploi_du_temps_enseignant.pdf";
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
    <TeacherLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl lg:text-3xl text-foreground mb-2">Emploi du temps</h1>
            <p className="text-muted-foreground">Mes séances (enseignant)</p>
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

        {/* Legend (même style) */}
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

        {/* Grid (copié style student) */}
        <div className="card-institutional overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse">
              <thead>
                <tr>
                  <th className="w-28 p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50 border-b border-r border-border">
                    Horaire
                  </th>
                  {days.map((day) => (
                    <th
                      key={day}
                      className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50 border-b border-r border-border last:border-r-0"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {timeSlots.map((slot) => (
                  <tr key={slot.label}>
                    {/* horaire (centré comme tu veux) */}
                    <td className="p-3 text-sm font-medium text-muted-foreground border-r border-b border-border bg-muted/20 whitespace-nowrap text-center align-middle">
                      {slot.label}
                    </td>

                    {dayKeys.map((dayKey) => {
                      const entry = getEntryForSlot(dayKey, slot.start, slot.end);

                      return (
                        <td
                          key={dayKey}
                          className="p-2 border-r border-b border-border last:border-r-0 align-top h-24"
                        >
                          {entry ? (
                            <div className={`h-full p-3 rounded-md border ${getTypeStyles(entry.type)} transition-all hover:shadow-sm`}>
                              <div className="flex flex-col h-full">
                                <p className="font-medium text-sm text-foreground leading-tight">
                                  {entry.course}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {entry.courseCode ? `${entry.courseCode} • ` : ""}{entry.room}
                                </p>

                                <div className="mt-auto pt-2 flex items-center justify-between">
                                  <span className="text-[10px] text-muted-foreground">
                                    {entry.startTime} - {entry.endTime}
                                  </span>
                                  <Badge
                                    variant={entry.type as "lecture" | "tutorial" | "lab"}
                                    className="text-[10px] px-1.5 py-0"
                                  >
                                    {getTypeLabel(entry.type)}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {!loading && timetable.length === 0 && (
          <div className="card-institutional p-6 text-sm text-muted-foreground">
            Aucun cours trouvé pour le moment.
          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

export default TeacherTimetable;
