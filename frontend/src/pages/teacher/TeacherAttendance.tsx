import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TeacherLayout } from '@/layouts/TeacherLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { importExcel } from '@/lib/exportUtils';
import {
  QrCode,
  Camera,
  Users,
  Check,
  X,
  Clock,
  Download,
  Upload,
  RefreshCw,
  Search,
  Edit2,
  Save
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import QRCode from 'react-qr-code';

type TeacherSession = {
  id: number;
  module_id: number;
  filiere_id?: number | null;
  heure_debut: string;
  heure_fin: string;
  salle?: string | null;
  module?: { id: number; name: string };
  filiere?: { id: number; name: string };
};

type StudentRow = {
  id: number;
  student_id: string; // matricule
  first_name: string;
  last_name: string;
  email?: string;
};

type StudentAttendanceRow = {
  id: number;            // user id
  studentId: string;     // matricule
  firstName: string;
  lastName: string;
  present: boolean;
  arrivalTime?: string;
  method: 'manual' | 'qr' | 'facial';
};

const todayISO = () => new Date().toISOString().slice(0, 10);

const TeacherAttendance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'qr' | 'facial' | 'manual'>('qr');

  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());

  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrToken, setQrToken] = useState<string | null>(null);

  const [editMode, setEditMode] = useState(false);

  const [sessions, setSessions] = useState<TeacherSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendanceRow[]>([]);

  const [savingManual, setSavingManual] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ===== QR rotation + countdown =====
  const [expiresIn, setExpiresIn] = useState<number>(0);
  const refreshRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  const formatMMSS = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const clearQrTimers = () => {
    if (refreshRef.current) window.clearTimeout(refreshRef.current);
    if (countdownRef.current) window.clearInterval(countdownRef.current);
    refreshRef.current = null;
    countdownRef.current = null;
  };

  // ---- Load today's sessions ----
  useEffect(() => {
    (async () => {
      setSessionsLoading(true);
      try {
        const res = await api.get<TeacherSession[]>('/api/teacher/sessions/today');
        setSessions(Array.isArray(res.data) ? res.data : []);
      } catch (e: any) {
        setSessions([]);
        toast({
          title: 'Erreur',
          description: e?.response?.data?.message || "Impossible de charger les séances d'aujourd'hui.",
          variant: 'destructive',
        });
      } finally {
        setSessionsLoading(false);
      }
    })();
  }, []);

  const selectedSessionObj = useMemo(
    () => sessions.find(s => s.id === selectedSession) || null,
    [sessions, selectedSession]
  );

  // ---- When session changes, load students ----
  useEffect(() => {
    if (!selectedSession) {
      setStudentAttendance([]);
      return;
    }

    (async () => {
      setStudentsLoading(true);
      setEditMode(false);
      try {
        const res = await api.get<StudentRow[]>(`/api/teacher/sessions/${selectedSession}/students`);
        const rows = Array.isArray(res.data) ? res.data : [];
        setStudentAttendance(
          rows.map((s) => ({
            id: s.id,
            studentId: s.student_id,
            firstName: s.first_name,
            lastName: s.last_name,
            present: false,
            method: 'manual',
          }))
        );
      } catch (e: any) {
        setStudentAttendance([]);
        toast({
          title: 'Erreur',
          description: e?.response?.data?.message || 'Impossible de charger les étudiants.',
          variant: 'destructive',
        });
      } finally {
        setStudentsLoading(false);
      }
    })();
  }, [selectedSession]);

  const handleToggleAttendance = (studentId: string) => {
    setStudentAttendance(prev =>
      prev.map(s =>
        s.studentId === studentId
          ? { ...s, present: !s.present, method: 'manual' as const }
          : s
      )
    );
  };

  const presentCount = studentAttendance.filter(s => s.present).length;
  const absentCount = studentAttendance.filter(s => !s.present).length;

  const filteredStudents = studentAttendance.filter(s =>
    s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ---- QR token generation ----
  const handleGenerateQR = async () => {
    if (!selectedSession) {
      toast({ title: 'Séance requise', description: "Choisissez une séance d'abord." });
      return;
    }

    try {
      const res = await api.post('/api/teacher/attendances/qr-token', {
        course_session_id: selectedSession,
        date: selectedDate,
      });

      setQrToken(res.data?.token || null);
      setQrGenerated(true);

      // 👉 backend ne renvoie pas expires_in → on met 60 sec
      setExpiresIn(Number(res.data?.expires_in ?? 60));


      toast({
        title: 'QR généré',
        description: `QR prêt pour la date ${selectedDate}.`,
      });
    } catch (e: any) {
      toast({
        title: 'Erreur',
        description: e?.response?.data?.message || 'Impossible de générer le QR.',
        variant: 'destructive',
      });
    }
  };

  // ---- Auto countdown + auto refresh each minute ----
  useEffect(() => {
    if (activeTab !== 'qr' || !qrGenerated || !selectedSession) {
      clearQrTimers();
      return;
    }

    clearQrTimers();

    countdownRef.current = window.setInterval(() => {
      setExpiresIn((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    refreshRef.current = window.setInterval(() => {
      handleGenerateQR();
    }, Math.max(1, expiresIn) * 1000);

    return () => clearQrTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, qrGenerated, selectedSession]);

  // ---- Save manual attendance (batch) ----
  const handleSaveManual = async () => {
    if (!selectedSession) {
      toast({ title: 'Séance requise', description: "Choisissez une séance d'abord." });
      return;
    }

    setSavingManual(true);
    try {
      await api.post('/api/teacher/attendances/mark-manual-batch', {
        course_session_id: selectedSession,
        date: selectedDate,
        items: studentAttendance.map((s) => ({
          student_id: s.id,
          status: s.present ? 'present' : 'absent',
        })),
      });

      toast({
        title: 'Enregistré',
        description: 'Les présences ont été enregistrées avec succès.',
      });

      setEditMode(false);
    } catch (e: any) {
      toast({
        title: 'Erreur',
        description: e?.response?.data?.message || "Impossible d'enregistrer les présences.",
        variant: 'destructive',
      });
    } finally {
      setSavingManual(false);
    }
  };

  // ---- Export excel ----
  const handleExportExcel = () => {
    if (!selectedSession) {
      toast({ title: 'Séance requise', description: "Choisissez une séance d'abord." });
      return;
    }

    const base = (api.defaults.baseURL || '').replace(/\/$/, '');
    window.open(
      `${base}/api/teacher/attendances/export?course_session_id=${selectedSession}&date=${selectedDate}`,
      '_blank'
    );
  };

  // ---- Import ----
  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await importExcel(file);
      toast({
        title: 'Import réussi',
        description: `${data.length} enregistrements traités.`,
      });
    } catch {
      toast({
        title: "Erreur d'import",
        description: "Le fichier n'a pas pu être lu.",
        variant: 'destructive',
      });
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const recentSessions = sessions;

  return (
    <TeacherLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-serif text-2xl lg:text-3xl text-foreground mb-2">Gestion des présences</h1>
          <p className="text-muted-foreground">Enregistrement et suivi des présences étudiantes</p>
        </div>

        {/* Session Selection */}
        <div className="card-institutional p-6">
          <h2 className="font-semibold text-foreground mb-4">Sélectionner une séance</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                className="mt-1"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div>
              <Label>Séance</Label>
              <Select
                value={selectedSession ? String(selectedSession) : undefined}
                onValueChange={(v) => setSelectedSession(parseInt(v, 10))}
                disabled={sessionsLoading}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={sessionsLoading ? 'Chargement...' : 'Choisir une séance'} />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.module?.name ?? 'Module'} — {s.heure_debut} ({s.salle ?? '-'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedSessionObj && (
                <p className="text-xs text-muted-foreground mt-2">
                  Filière: {selectedSessionObj.filiere?.name ?? '-'}
                </p>
              )}
            </div>

            <div className="flex items-end">
              <div className="w-full rounded-md border border-border p-3 bg-muted/20">
                <p className="text-xs text-muted-foreground">Étudiants chargés</p>
                <p className="text-lg font-serif text-foreground">
                  {studentsLoading ? '...' : studentAttendance.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card-institutional overflow-hidden">
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('qr')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                activeTab === 'qr'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted/50'
              )}
            >
              <QrCode className="w-4 h-4" />
              QR Code
            </button>

            <button
              onClick={() => setActiveTab('facial')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                activeTab === 'facial'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted/50'
              )}
            >
              <Camera className="w-4 h-4" />
              Reconnaissance Faciale
            </button>

            <button
              onClick={() => setActiveTab('manual')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                activeTab === 'manual'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted/50'
              )}
            >
              <Users className="w-4 h-4" />
              Appel Manuel
            </button>
          </div>

          <div className="p-6">
            {/* QR */}
            {activeTab === 'qr' && (
              <div className="text-center space-y-6">
                {!qrGenerated ? (
                  <>
                    <div className="w-64 h-64 mx-auto bg-muted/30 rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                      <QrCode className="w-24 h-24 text-muted-foreground/50" />
                    </div>

                    <div>
                      <Button onClick={handleGenerateQR} size="lg" disabled={!selectedSession}>
                        <QrCode className="w-5 h-5 mr-2" />
                        Générer le QR Code
                      </Button>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Le QR Code change automatiquement chaque minute.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-64 h-64 mx-auto bg-white rounded-lg flex items-center justify-center border border-border p-4">
                      {qrToken ? (
                        <QRCode
                          value={qrToken}
                          size={220}
                          style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                          viewBox="0 0 256 256"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">Token manquant</p>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      Expire dans {formatMMSS(expiresIn)}
                    </div>

                    <div className="flex justify-center gap-2">
                      <Button variant="outline" onClick={handleGenerateQR}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Régénérer
                      </Button>

                      <Button
                        variant="destructive"
                        onClick={() => {
                          clearQrTimers();
                          setQrGenerated(false);
                          setQrToken(null);
                          setExpiresIn(0);
                        }}
                      >
                        Terminer la session
                      </Button>
                    </div>

                    <div className="bg-muted/30 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-sm font-medium text-foreground mb-2">Présences en temps réel</p>
                      <div className="flex justify-center gap-8">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-success">{presentCount}</p>
                          <p className="text-xs text-muted-foreground">Présents</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-destructive">{absentCount}</p>
                          <p className="text-xs text-muted-foreground">Absents</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Facial */}
            {activeTab === 'facial' && (
              <div className="text-center space-y-6">
                <div className="w-full max-w-lg mx-auto aspect-video bg-muted/30 rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                  <div className="text-center">
                    <Camera className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">Caméra non activée</p>
                  </div>
                </div>

                <div className="flex justify-center gap-2">
                  <Button size="lg">
                    <Camera className="w-5 h-5 mr-2" />
                    Activer la caméra
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground">
                  La reconnaissance faciale identifiera automatiquement les étudiants présents.
                </p>

                <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-sm text-warning-foreground">
                    Cette fonctionnalité nécessite le consentement préalable des étudiants et est soumise au RGPD.
                  </p>
                </div>
              </div>
            )}

            {/* Manual */}
            {activeTab === 'manual' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un étudiant..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant={editMode ? 'default' : 'outline'}
                      onClick={() => {
                        if (!selectedSession) {
                          toast({ title: 'Séance requise', description: "Choisissez une séance d'abord." });
                          return;
                        }
                        if (editMode) {
                          handleSaveManual();
                        } else {
                          setEditMode(true);
                        }
                      }}
                      disabled={studentsLoading || savingManual}
                    >
                      {editMode ? (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Enregistrer
                        </>
                      ) : (
                        <>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Modifier
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-success" />
                      <span className="text-sm text-foreground">{presentCount} Présents</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-destructive" />
                      <span className="text-sm text-foreground">{absentCount} Absents</span>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Total: {studentAttendance.length} étudiants
                  </span>
                </div>

                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="table-institutional">
                    <thead>
                      <tr>
                        <th className="w-12"></th>
                        <th>N° Étudiant</th>
                        <th>Nom</th>
                        <th>Prénom</th>
                        <th>Statut</th>
                        <th>Heure d'arrivée</th>
                        <th>Méthode</th>
                      </tr>
                    </thead>

                    <tbody>
                      {studentsLoading && (
                        <tr>
                          <td colSpan={7} className="text-center text-muted-foreground py-6">
                            Chargement des étudiants...
                          </td>
                        </tr>
                      )}

                      {!studentsLoading && filteredStudents.map((student) => (
                        <tr key={student.id}>
                          <td>
                            <Checkbox
                              checked={student.present}
                              disabled={!editMode}
                              onCheckedChange={() => handleToggleAttendance(student.studentId)}
                            />
                          </td>
                          <td className="font-mono text-sm">{student.studentId}</td>
                          <td className="font-medium">{student.lastName}</td>
                          <td>{student.firstName}</td>
                          <td>
                            {student.present ? (
                              <Badge variant="approved" className="gap-1">
                                <Check className="w-3 h-3" /> Présent
                              </Badge>
                            ) : (
                              <Badge variant="rejected" className="gap-1">
                                <X className="w-3 h-3" /> Absent
                              </Badge>
                            )}
                          </td>
                          <td className="text-muted-foreground">{student.arrivalTime || '-'}</td>
                          <td>
                            <span className="text-xs text-muted-foreground capitalize">
                              {student.method === 'qr' ? 'QR Code' : student.method === 'facial' ? 'Facial' : 'Manuel'}
                            </span>
                          </td>
                        </tr>
                      ))}

                      {!studentsLoading && filteredStudents.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center text-muted-foreground py-6">
                            Aucun étudiant.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* Import/Export */}
        <div className="card-institutional p-6">
          <h2 className="font-semibold text-foreground mb-4">Import / Export des présences</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-medium text-foreground mb-2">Importer depuis Excel</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Importez une liste de présences au format CSV ou Excel
              </p>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button variant="outline" onClick={handleImportClick} className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Sélectionner un fichier
                </Button>
              </div>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-medium text-foreground mb-2">Exporter vers Excel</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Téléchargez les présences de la séance au format Excel
              </p>
              <Button variant="outline" onClick={handleExportExcel} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Exporter la séance
              </Button>
            </div>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="card-institutional">
          <div className="p-5 border-b border-border">
            <h2 className="font-semibold text-foreground">Séances récentes</h2>
          </div>
          <div className="divide-y divide-border">
            {recentSessions.map((session) => (
              <div key={session.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{session.module?.name ?? 'Module'}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedDate} • {session.heure_debut} - {session.heure_fin} • {session.salle ?? '-'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="info">Planifiée</Badge>
                </div>
              </div>
            ))}

            {recentSessions.length === 0 && (
              <div className="p-6 text-center text-muted-foreground">
                Aucune séance.
              </div>
            )}
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherAttendance;
