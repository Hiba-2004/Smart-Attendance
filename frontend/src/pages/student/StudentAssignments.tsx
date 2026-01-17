import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StudentLayout } from '@/layouts/StudentLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle2, Clock, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { studentAssignmentsService, type Assignment } from '@/lib/api';

const StudentAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  // Hidden file input to keep UI unchanged
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const selectedAssignmentRef = useRef<Assignment | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await studentAssignmentsService.getAll();
        setAssignments(data);
      } catch {
        toast({
          title: "Erreur",
          description: "Impossible de charger les travaux depuis le serveur.",
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

  const getDaysUntil = (dateString: string) => {
    const due = new Date(dateString);
    const now = new Date();
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Dépassé';
    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return 'Demain';
    return `${diff} jours`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'graded':
        return <Badge variant="approved">Noté</Badge>;
      case 'submitted':
        return <Badge variant="info">Soumis</Badge>;
      default:
        return <Badge variant="pending">À rendre</Badge>;
    }
  };

  const stats = useMemo(() => {
    const pending = assignments.filter(a => a.status === 'pending').length;
    const submitted = assignments.filter(a => a.status === 'submitted').length;
    const graded = assignments.filter(a => a.status === 'graded').length;
    return { pending, submitted, graded };
  }, [assignments]);

  const openFilePickerFor = (assignment: Assignment) => {
    selectedAssignmentRef.current = assignment;
    fileInputRef.current?.click();
  };

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const assignment = selectedAssignmentRef.current;

    // reset input so selecting same file twice triggers change
    e.target.value = "";

    if (!file || !assignment) return;

    try {
      setUploadingId(assignment.id);
      toast({
        title: "Soumission",
        description: "Envoi du fichier en cours...",
      });

      await studentAssignmentsService.submit(assignment.id, file);

      toast({
        title: "Soumission réussie",
        description: "Votre travail a été envoyé.",
      });

      // refresh list after submit
      const data = await studentAssignmentsService.getAll();
      setAssignments(data);
    } catch {
      toast({
        title: "Erreur",
        description: "Soumission impossible. Vérifiez le fichier et réessayez.",
        variant: "destructive",
      });
    } finally {
      setUploadingId(null);
      selectedAssignmentRef.current = null;
    }
  };

  return (
    <StudentLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="font-serif text-2xl lg:text-3xl text-foreground mb-2">
            Travaux & Devoirs
          </h1>
          <p className="text-muted-foreground">
            Soumettez vos travaux et consultez vos notes
          </p>
        </div>

        {/* Hidden input for upload (no UI style change) */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={onFileSelected}
          // optional: accept pdf/doc/zip/images if needed
          // accept=".pdf,.doc,.docx,.zip,.rar,.png,.jpg,.jpeg"
        />

        {/* Loading */}
        {loading && (
          <div className="card-institutional p-6 text-sm text-muted-foreground">
            Chargement des travaux...
          </div>
        )}

        {!loading && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="card-institutional p-5 text-center">
                <p className="text-2xl font-serif text-warning">
                  {stats.pending}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">À rendre</p>
              </div>
              <div className="card-institutional p-5 text-center">
                <p className="text-2xl font-serif text-info">
                  {stats.submitted}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">En attente</p>
              </div>
              <div className="card-institutional p-5 text-center">
                <p className="text-2xl font-serif text-success">
                  {stats.graded}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Notés</p>
              </div>
            </div>

            {/* Assignments List */}
            <div className="card-institutional">
              <div className="p-5 border-b border-border">
                <h2 className="font-semibold text-foreground">Liste des travaux</h2>
              </div>
              <div className="divide-y divide-border">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="font-medium text-foreground">{assignment.title}</h3>
                            <p className="text-sm text-muted-foreground">{assignment.course}</p>
                          </div>
                          {getStatusBadge(assignment.status)}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>Échéance: {formatDate(assignment.dueDate)}</span>
                            {assignment.status === 'pending' && (
                              <span className="text-warning">({getDaysUntil(assignment.dueDate)})</span>
                            )}
                          </div>

                          {assignment.status === 'graded' && assignment.grade !== undefined && (
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-success" />
                              <span className="font-medium text-foreground">
                                {assignment.grade}/{assignment.maxGrade}
                              </span>
                            </div>
                          )}
                        </div>

                        {assignment.status === 'pending' && (
                          <div className="mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openFilePickerFor(assignment)}
                              disabled={uploadingId === assignment.id}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              {uploadingId === assignment.id ? "Envoi..." : "Soumettre le travail"}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {assignments.length === 0 && (
                  <div className="p-6 text-sm text-muted-foreground text-center">
                    Aucun travail disponible.
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

export default StudentAssignments;
