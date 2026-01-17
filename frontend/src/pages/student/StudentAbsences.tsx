import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StudentLayout } from '@/layouts/StudentLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import {
  studentAttendanceService,
  mapAttendanceToAbsence,
  type Absence,
  type AttendanceStatsFromBackend
} from '@/lib/api';
import {
  Upload,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const StudentAbsences: React.FC = () => {
  const [expandedAbsence, setExpandedAbsence] = useState<number | null>(null);

  const [absences, setAbsences] = useState<Absence[]>([]);
  const [statsRaw, setStatsRaw] = useState<AttendanceStatsFromBackend | null>(null);
  const [loading, setLoading] = useState(true);

  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const selectedAttendanceIdRef = useRef<number | null>(null);

  const refresh = async () => {
    const [att, st] = await Promise.all([
      studentAttendanceService.getAttendances(),
      studentAttendanceService.getStats(),
    ]);

    // Keep only absences (status absent) in this page,
    // but mapping is safe either way.
    const mapped = att
      .map(mapAttendanceToAbsence)
      .filter(a => a.status === 'pending' || a.status === 'approved' || a.status === 'rejected');

    // If you want ONLY actual absences (not present), uncomment:
    // const mapped = att.filter(x => x.status === 'absent').map(mapAttendanceToAbsence);

    setAbsences(mapped);
    setStatsRaw(st);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await refresh();
      } catch {
        toast({
          title: "Erreur",
          description: "Impossible de charger les absences.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDeadline = (dateString: string) => {
    const deadline = new Date(dateString);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 0) return 'Délai dépassé';
    if (hours < 24) return `${hours}h restantes`;
    const days = Math.floor(hours / 24);
    return `${days} jour(s) restant(s)`;
  };

  const isDeadlineClose = (dateString: string) => {
    const deadline = new Date(dateString);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return hours < 48 && hours > 0;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5 text-warning" />;
    }
  };

  // Build stats the UI expects, from backend stats + computed module grouping
  const uiStats = useMemo(() => {
    const totalAbsences = absences.length;
    const pendingCount = absences.filter(a => a.status === 'pending').length;

    // hours totals based on absences list
    const totalHours = absences.reduce((s, a) => s + (a.hours || 0), 0);
    const justifiedHours = absences.filter(a => a.status === 'approved').reduce((s, a) => s + (a.hours || 0), 0);
    const unjustifiedHours = absences.filter(a => a.status !== 'approved').reduce((s, a) => s + (a.hours || 0), 0);

    const byModuleMap = new Map<string, { module: string; hours: number; justified: number }>();
    absences.forEach(a => {
      const key = a.module || '—';
      const cur = byModuleMap.get(key) || { module: key, hours: 0, justified: 0 };
      cur.hours += a.hours || 0;
      if (a.status === 'approved') cur.justified += a.hours || 0;
      byModuleMap.set(key, cur);
    });

    const byModule = Array.from(byModuleMap.values()).sort((a, b) => b.hours - a.hours);

    return {
      totalAbsences,
      pendingCount,
      totalHours,
      justifiedHours,
      unjustifiedHours,
      byModule,
      statsRaw,
    };
  }, [absences, statsRaw]);

  const openFilePicker = (attendanceId: number) => {
    selectedAttendanceIdRef.current = attendanceId;
    fileInputRef.current?.click();
  };

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const attendanceId = selectedAttendanceIdRef.current;

    e.target.value = "";
    if (!file || !attendanceId) return;

    try {
      setUploadingId(attendanceId);

      toast({
        title: "Soumission",
        description: "Envoi du justificatif en cours...",
      });

      await studentAttendanceService.submitJustification(attendanceId, file);

      toast({
        title: "Justificatif envoyé",
        description: "Votre justificatif a été soumis.",
      });

      await refresh();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Impossible d'envoyer le justificatif.";
      toast({
        title: "Erreur",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setUploadingId(null);
      selectedAttendanceIdRef.current = null;
    }
  };

  return (
    <StudentLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="font-serif text-2xl lg:text-3xl text-foreground mb-2">
            Gestion des absences
          </h1>
          <p className="text-muted-foreground">
            Consultez et justifiez vos absences
          </p>
        </div>

        {/* Hidden upload input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={onFileSelected}
          accept=".pdf,.jpg,.jpeg,.png"
        />

        {loading && (
          <div className="card-institutional p-6 text-sm text-muted-foreground">
            Chargement des absences...
          </div>
        )}

        {!loading && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card-institutional p-5">
                <p className="text-2xl font-serif text-foreground">{uiStats.totalHours}h</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Total absences</p>
              </div>
              <div className="card-institutional p-5">
                <p className="text-2xl font-serif text-success">{uiStats.justifiedHours}h</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Justifiées</p>
              </div>
              <div className="card-institutional p-5">
                <p className="text-2xl font-serif text-destructive">{uiStats.unjustifiedHours}h</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Non justifiées</p>
              </div>
              <div className="card-institutional p-5">
                <p className="text-2xl font-serif text-warning">{uiStats.pendingCount}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">En attente</p>
              </div>
            </div>

            {/* Absences by Module */}
            <div className="card-institutional">
              <div className="p-5 border-b border-border">
                <h2 className="font-semibold text-foreground">Répartition par module</h2>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {uiStats.byModule.map((stat, index) => (
                    <div key={index} className="p-4 rounded-md bg-muted/30">
                      <p className="text-sm font-medium text-foreground">{stat.module}</p>
                      <p className="text-lg font-serif text-foreground mt-1">{stat.hours}h</p>
                      <p className="text-xs text-muted-foreground">{stat.justified}h justifiées</p>
                    </div>
                  ))}
                  {uiStats.byModule.length === 0 && (
                    <p className="text-sm text-muted-foreground">Aucune donnée disponible.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Absences List */}
            <div className="card-institutional">
              <div className="p-5 border-b border-border">
                <h2 className="font-semibold text-foreground">Historique des absences</h2>
              </div>
              <div className="divide-y divide-border">
                {absences.map((absence) => (
                  <div key={absence.id} className="p-5">
                    <div
                      className="flex items-start gap-4 cursor-pointer"
                      onClick={() => setExpandedAbsence(expandedAbsence === absence.id ? null : absence.id)}
                    >
                      {getStatusIcon(absence.status)}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium text-foreground">{absence.module}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(absence.date)} • {absence.hours}h</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={absence.status as 'pending' | 'approved' | 'rejected'}>
                              {absence.status === 'pending' ? 'En attente' : absence.status === 'approved' ? 'Acceptée' : 'Refusée'}
                            </Badge>
                            {expandedAbsence === absence.id ? (
                              <ChevronUp className="w-5 h-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>

                        {absence.status === 'pending' && (
                          <div className={`mt-2 flex items-center gap-2 text-xs ${isDeadlineClose(absence.justificationDeadline) ? 'text-warning' : 'text-muted-foreground'}`}>
                            <AlertTriangle className="w-3 h-3" />
                            Délai de justification : {formatDeadline(absence.justificationDeadline)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {expandedAbsence === absence.id && (
                      <div className="mt-4 ml-9 pt-4 border-t border-border">
                        <div className="grid lg:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-medium text-foreground mb-2">Détails</h4>
                            <dl className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">Code module</dt>
                                <dd className="text-foreground">{absence.moduleCode}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">Date</dt>
                                <dd className="text-foreground">{formatDate(absence.date)}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">Durée</dt>
                                <dd className="text-foreground">{absence.hours} heures</dd>
                              </div>
                            </dl>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-foreground mb-2">Justification</h4>
                            {/* Backend creates a justification record; for now we show simple UI */}
                            {absence.status !== 'pending' ? (
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                  Statut : {absence.status === 'approved' ? 'Acceptée' : 'Refusée'}
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <p className="text-sm text-muted-foreground">Aucune justification soumise</p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openFilePicker(absence.id)}
                                  disabled={uploadingId === absence.id}
                                >
                                  <Upload className="w-4 h-4 mr-2" />
                                  {uploadingId === absence.id ? "Envoi..." : "Soumettre un justificatif"}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {absences.length === 0 && (
                  <div className="p-6 text-sm text-muted-foreground text-center">
                    Aucune absence enregistrée.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentAbsences;
