import React, { useEffect, useMemo, useState } from 'react';
import { TeacherLayout } from '@/layouts/TeacherLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  ClipboardCheck,
  Download,
  Check,
  X,
  Clock,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

type ApiJustification = {
  id: number;
  status: 'pending' | 'accepted' | 'refused';

  justification_type?: string | null;
  justification_text?: string | null;

  file_path?: string | null;

  created_at?: string | null;
  reviewed_at?: string | null;
  review_comment?: string | null;

  attendance?: {
    id: number;
    date: string;
    student?: { id: number; name: string; matricule?: string | null };
    module?: { id: number; name: string; code?: string | null };
  } | null;
};

type Pagination<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

type UiRequest = {
  id: number;
  status: 'pending' | 'approved' | 'rejected';
  studentName: string;
  studentId: string;
  courseName: string;
  courseCode: string;
  date: string;
  hours: number;
  justificationType: string;
  justificationText: string;
  submittedAt: string;
  reviewedAt?: string | null;
  reviewComment?: string | null;
  hasFile: boolean;
};

const TeacherJustifications: React.FC = () => {
  const [requests, setRequests] = useState<UiRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const mapStatus = (s: ApiJustification['status']): UiRequest['status'] =>
    s === 'pending' ? 'pending' : s === 'accepted' ? 'approved' : 'rejected';

  const load = async () => {
    setLoading(true);
    try {
      const statusParam =
        filter === 'all' ? undefined : filter === 'pending' ? 'pending' : filter === 'approved' ? 'accepted' : 'refused';

      const res = await api.get<Pagination<ApiJustification>>('/api/teacher/justifications', {
        params: statusParam ? { status: statusParam } : undefined,
      });

      const rows = Array.isArray(res.data?.data) ? res.data.data : [];

      const ui: UiRequest[] = rows.map((j) => {
        const att = j.attendance;
        const studentName = att?.student?.name ?? 'Étudiant';
        const studentId = att?.student?.matricule ?? String(att?.student?.id ?? '-');
        const courseName = att?.module?.name ?? 'Module';
        const courseCode = att?.module?.code ?? '—';
        const date = att?.date ?? new Date().toISOString().slice(0, 10);

        return {
          id: j.id,
          status: mapStatus(j.status),
          studentName,
          studentId,
          courseName,
          courseCode,
          date,
          hours: 2, // simple (si tu veux, on le branche plus tard via session)
          justificationType: j.justification_type ?? '—',
          justificationText: j.justification_text ?? '—',
          submittedAt: j.created_at ?? new Date().toISOString(),
          reviewedAt: j.reviewed_at ?? null,
          reviewComment: j.review_comment ?? null,
          hasFile: !!j.file_path,
        };
      });

      setRequests(ui);
    } catch (e: any) {
      setRequests([]);
      toast({
        title: 'Erreur',
        description: e?.response?.data?.message || "Impossible de charger les justificatifs.",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const pendingCount = useMemo(() => requests.filter((r) => r.status === 'pending').length, [requests]);

  const stats = useMemo(() => {
    return {
      pending: requests.filter((r) => r.status === 'pending').length,
      approved: requests.filter((r) => r.status === 'approved').length,
      rejected: requests.filter((r) => r.status === 'rejected').length,
    };
  }, [requests]);

  const handleReview = async (id: number, status: 'accepted' | 'refused') => {
    try {
      await api.post(`/api/teacher/justifications/${id}/review`, {
        status,
        review_comment: reviewComment.trim() ? reviewComment.trim() : null,
      });

      toast({
        title: status === 'accepted' ? 'Acceptée' : 'Refusée',
        description: 'La demande a été mise à jour.',
      });

      setExpandedId(null);
      setReviewComment('');
      await load();
    } catch (e: any) {
      toast({
        title: 'Erreur',
        description: e?.response?.data?.message || "Impossible de traiter la demande.",
        variant: 'destructive',
      });
    }
  };

  const handleDownload = (id: number) => {
    const base = (api.defaults.baseURL || '').replace(/\/$/, '');
    window.open(`${base}/api/teacher/justifications/${id}/download`, '_blank');
  };

  return (
    <TeacherLayout>
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl lg:text-3xl text-foreground mb-2">Justificatifs d'absence</h1>
            <p className="text-muted-foreground">
              {pendingCount} demande{pendingCount > 1 ? 's' : ''} en attente de validation
            </p>
          </div>
        </div>

        {/* Statistics (style conservé) */}
        <div className="grid grid-cols-3 gap-4">
          <div className="metric-card">
            <Clock className="w-8 h-8 text-warning mb-3" />
            <p className="metric-value">{stats.pending}</p>
            <p className="metric-label">En attente</p>
          </div>
          <div className="metric-card">
            <Check className="w-8 h-8 text-success mb-3" />
            <p className="metric-value">{stats.approved}</p>
            <p className="metric-label">Acceptées</p>
          </div>
          <div className="metric-card">
            <X className="w-8 h-8 text-destructive mb-3" />
            <p className="metric-value">{stats.rejected}</p>
            <p className="metric-label">Refusées</p>
          </div>
        </div>

        {/* Filter (style conservé) */}
        <div className="flex gap-2">
          <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>
            Tous
          </Button>
          <Button variant={filter === 'pending' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('pending')}>
            En attente
          </Button>
          <Button variant={filter === 'approved' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('approved')}>
            Acceptées
          </Button>
          <Button variant={filter === 'rejected' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('rejected')}>
            Refusées
          </Button>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {loading ? (
            <div className="card-institutional p-8 text-center text-muted-foreground">
              Chargement...
            </div>
          ) : requests.length === 0 ? (
            <div className="card-institutional p-8 text-center">
              <ClipboardCheck className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune demande de justificatif</p>
            </div>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="card-institutional overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => {
                    const next = expandedId === request.id ? null : request.id;
                    setExpandedId(next);
                    setReviewComment(''); // évite de mélanger le commentaire entre cartes
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-medium text-foreground">{request.studentName}</p>
                        <span className="text-sm text-muted-foreground">({request.studentId})</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>
                          {request.courseName} ({request.courseCode})
                        </span>
                        <span>•</span>
                        <span>{formatDate(request.date)}</span>
                        <span>•</span>
                        <span>{request.hours}h</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          request.status === 'pending'
                            ? 'pending'
                            : request.status === 'approved'
                              ? 'approved'
                              : 'rejected'
                        }
                      >
                        {request.status === 'pending'
                          ? 'En attente'
                          : request.status === 'approved'
                            ? 'Acceptée'
                            : 'Refusée'}
                      </Badge>

                      {expandedId === request.id ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedId === request.id && (
                  <div className="border-t border-border p-4 bg-muted/20">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Type de justificatif</p>
                          <p className="text-foreground">{request.justificationType}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Motif</p>
                          <p className="text-foreground">{request.justificationText}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Soumis le</p>
                          <p className="text-foreground">{formatDateTime(request.submittedAt)}</p>
                        </div>

                        {request.hasFile && (
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Document joint</p>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleDownload(request.id)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Visualiser
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDownload(request.id)}>
                                <Download className="w-4 h-4 mr-2" />
                                Télécharger
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {request.status === 'pending' ? (
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Commentaire (optionnel)</p>
                            <Textarea
                              placeholder="Ajouter un commentaire pour l'étudiant..."
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              className="flex-1 bg-success hover:bg-success/90"
                              onClick={() => handleReview(request.id, 'accepted')}
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Accepter
                            </Button>
                            <Button
                              variant="destructive"
                              className="flex-1"
                              onClick={() => handleReview(request.id, 'refused')}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Refuser
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Traité le</p>
                            <p className="text-foreground">{request.reviewedAt ? formatDateTime(request.reviewedAt) : '-'}</p>
                          </div>
                          {request.reviewComment && (
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Commentaire</p>
                              <p className="text-foreground">{request.reviewComment}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherJustifications;
