import React, { useEffect, useMemo, useState } from 'react';
import { TeacherLayout } from '@/layouts/TeacherLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bell,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  XCircle,
  RefreshCw,
  Megaphone,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

type Module = {
  id: number;
  code?: string | null;
  name: string;
};

type AnnouncementApi = {
  id: number;
  title: string;
  content: string;
  filiere_id?: number | null;
  image_path?: string | null;
  created_by: number;
  role_creator?: 'teacher' | 'admin' | null;
  created_at: string;
  creator?: { id: number; name: string } | null;
};

type Pagination<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

type UiAnnouncement = {
  id: number;
  title: string;
  content: string;
  type: 'urgent' | 'academic' | 'event' | 'general';
  createdAt: string;
  author: string;
  imageUrl?: string | null;
  filiere_id?: number | null;
};

const TeacherAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<UiAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);

  const [modules, setModules] = useState<Module[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [announcementType, setAnnouncementType] = useState<'cancellation' | 'reschedule' | 'event' | 'general'>('general');

  const [editing, setEditing] = useState<UiAnnouncement | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general',
    courseCode: '',
    newDate: '',
    newTime: '',
    filiere_id: '' as string | number, // optionnel
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const base = (api.defaults.baseURL || '').replace(/\/$/, '');

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'general',
      courseCode: '',
      newDate: '',
      newTime: '',
      filiere_id: '',
    });
    setSelectedImage(null);
    setEditing(null);
    setAnnouncementType('general');
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const inferType = (a: AnnouncementApi): UiAnnouncement['type'] => {
    const t = (a.title || '').toLowerCase();
    if (t.includes('annul') || t.includes('urgent') || t.includes('important')) return 'urgent';
    if (t.includes('événement') || t.includes('event') || t.includes('conférence') || t.includes('soutenance')) return 'event';
    if (a.role_creator === 'admin') return 'academic';
    return 'general';
  };

  const getAnnouncementVariant = (type: string) => {
    switch (type) {
      case 'urgent': return 'urgent';
      case 'academic': return 'academic';
      case 'event': return 'event';
      default: return 'general';
    }
  };

  const getAnnouncementLabel = (type: string) => {
    switch (type) {
      case 'urgent': return 'Urgent';
      case 'academic': return 'Académique';
      case 'event': return 'Événement';
      default: return 'Information';
    }
  };

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get<Pagination<AnnouncementApi>>('/api/teacher/announcements');
      const rows = Array.isArray(res.data?.data) ? res.data.data : [];

      const mapped: UiAnnouncement[] = rows.map((a) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        type: inferType(a),
        createdAt: a.created_at,
        author: a.creator?.name || (a.role_creator === 'admin' ? 'Administration' : 'Enseignant'),
        imageUrl: a.image_path ? `${base}/storage/${a.image_path}` : null,
        filiere_id: a.filiere_id ?? null,
      }));

      // On garde "Mes annonces" : côté UI on montre celles que l’enseignant a créées
      // (le endpoint /announcements retourne aussi celles générales/admin)
      // Si tu veux voir TOUTES, supprime ce filtre.
      const mine = mapped.filter((x) => x.author !== 'Administration'); // simple
      setAnnouncements(mine);
    } catch (e: any) {
      setAnnouncements([]);
      toast({
        title: 'Erreur',
        description: e?.response?.data?.message || "Impossible de charger les annonces.",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadModules = async () => {
    setLoadingModules(true);
    try {
      const res = await api.get<Module[]>('/api/teacher/modules');
      setModules(Array.isArray(res.data) ? res.data : []);
    } catch {
      setModules([]);
    } finally {
      setLoadingModules(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
    loadModules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEdit = (a: UiAnnouncement) => {
    setEditing(a);
    setFormData((p) => ({
      ...p,
      title: a.title,
      content: a.content,
      type: a.type,
      filiere_id: a.filiere_id ?? '',
      courseCode: '',
      newDate: '',
      newTime: '',
    }));
    setSelectedImage(null);
    setIsCreateOpen(true);
  };

  const buildAutoTitle = () => {
    // on garde la logique UI (cancellation/reschedule) mais on sauvegarde juste title/content
    if (announcementType === 'cancellation' && formData.courseCode) {
      return `Annulation - ${formData.courseCode}`;
    }
    if (announcementType === 'reschedule' && formData.courseCode) {
      const when = [formData.newDate, formData.newTime].filter(Boolean).join(' ');
      return `Report - ${formData.courseCode}${when ? ` (${when})` : ''}`;
    }
    if (announcementType === 'event') return formData.title || 'Événement';
    return formData.title || "Annonce";
  };

  const handleSubmit = async () => {
    if (!formData.content.trim()) {
      toast({ title: 'Contenu requis', description: "Écris le contenu de l'annonce." });
      return;
    }

    const title = formData.title.trim() ? formData.title.trim() : buildAutoTitle();

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('content', formData.content.trim());
      if (formData.filiere_id) fd.append('filiere_id', String(formData.filiere_id));
      if (selectedImage) fd.append('image', selectedImage);

      if (!editing) {
        await api.post('/api/teacher/announcements', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast({ title: 'Publié', description: "Annonce publiée." });
      } else {
        fd.append('_method', 'PUT');
        await api.post(`/api/teacher/announcements/${editing.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast({ title: 'Modifié', description: "Annonce mise à jour." });
      }

      setIsCreateOpen(false);
      resetForm();
      await loadAnnouncements();
    } catch (e: any) {
      toast({
        title: 'Erreur',
        description: e?.response?.data?.message || "Impossible d'enregistrer l'annonce.",
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/teacher/announcements/${id}`);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      toast({ title: 'Supprimé', description: "Annonce supprimée." });
    } catch (e: any) {
      toast({
        title: 'Erreur',
        description: e?.response?.data?.message || "Impossible de supprimer l'annonce.",
        variant: 'destructive',
      });
    }
  };

  const modulesByCode = useMemo(() => {
    const map = new Map<string, Module>();
    modules.forEach((m) => {
      if (m.code) map.set(m.code, m);
    });
    return map;
  }, [modules]);

  return (
    <TeacherLayout>
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl lg:text-3xl text-foreground mb-2">Annonces</h1>
            <p className="text-muted-foreground">Publiez des annonces pour vos étudiants</p>
          </div>

          <Dialog
            open={isCreateOpen}
            onOpenChange={(v) => {
              setIsCreateOpen(v);
              if (!v) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle annonce
              </Button>
            </DialogTrigger>

      <DialogContent className="sm:max-w-[720px] max-h-[85vh] overflow-hidden p-0">
        {/* Header fixe */}
        <div className="p-6 pb-4 border-b border-border">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier l'annonce" : "Créer une annonce"}</DialogTitle>
            <DialogDescription>
              Choisissez le type d'annonce et complétez les informations
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Body scroll */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(85vh-168px)]">
          {/* Announcement Type Selection (style conservé) */}
          <div className="grid grid-cols-4 gap-2 mb-5">
            <button
              className={`p-3 rounded-lg border text-center transition-colors ${
                announcementType === 'general'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-muted/50'
              }`}
              onClick={() => setAnnouncementType('general')}
              type="button"
            >
              <Megaphone className="w-5 h-5 mx-auto mb-1 text-primary" />
              <span className="text-xs">Général</span>
            </button>

            <button
              className={`p-3 rounded-lg border text-center transition-colors ${
                announcementType === 'cancellation'
                  ? 'border-destructive bg-destructive/10'
                  : 'border-border hover:bg-muted/50'
              }`}
              onClick={() => setAnnouncementType('cancellation')}
              type="button"
            >
              <XCircle className="w-5 h-5 mx-auto mb-1 text-destructive" />
              <span className="text-xs">Annulation</span>
            </button>

            <button
              className={`p-3 rounded-lg border text-center transition-colors ${
                announcementType === 'reschedule'
                  ? 'border-warning bg-warning/10'
                  : 'border-border hover:bg-muted/50'
              }`}
              onClick={() => setAnnouncementType('reschedule')}
              type="button"
            >
              <RefreshCw className="w-5 h-5 mx-auto mb-1 text-warning" />
              <span className="text-xs">Report</span>
            </button>

            <button
              className={`p-3 rounded-lg border text-center transition-colors ${
                announcementType === 'event'
                  ? 'border-info bg-info/10'
                  : 'border-border hover:bg-muted/50'
              }`}
              onClick={() => setAnnouncementType('event')}
              type="button"
            >
              <Calendar className="w-5 h-5 mx-auto mb-1 text-info" />
              <span className="text-xs">Événement</span>
            </button>
          </div>

          <div className="space-y-4">
            {(announcementType === 'cancellation' || announcementType === 'reschedule') && (
              <div>
                <Label>Cours concerné</Label>
                <Select
                  value={formData.courseCode}
                  onValueChange={(v) => setFormData({ ...formData, courseCode: v })}
                  disabled={loadingModules}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={loadingModules ? 'Chargement...' : 'Sélectionner un cours'} />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map((m) => (
                      <SelectItem key={m.id} value={m.code || String(m.id)}>
                        {(m.code ? `${m.code} - ` : '')}{m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {announcementType === 'reschedule' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newDate">Nouvelle date</Label>
                  <Input
                    id="newDate"
                    type="date"
                    className="mt-1"
                    value={formData.newDate}
                    onChange={(e) => setFormData({ ...formData, newDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="newTime">Nouvelle heure</Label>
                  <Input
                    id="newTime"
                    type="time"
                    className="mt-1"
                    value={formData.newTime}
                    onChange={(e) => setFormData({ ...formData, newTime: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="title">Titre de l'annonce</Label>
              <Input
                id="title"
                className="mt-1"
                placeholder={
                  announcementType === 'cancellation' ? "Annulation du cours..." :
                  announcementType === 'reschedule' ? "Report du cours..." :
                  announcementType === 'event' ? "Événement : ..." :
                  "Titre de l'annonce"
                }
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="content">Contenu</Label>
              <Textarea
                id="content"
                className="mt-1 resize-none"
                placeholder="Détails de l'annonce..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={5}
              />
            </div>

            <div>
              <Label htmlFor="filiere_id">Cibler une filière (optionnel)</Label>
              <Input
                id="filiere_id"
                className="mt-1 h-10"
                type="number"
                placeholder="ID filière (ex: 1)"
                value={String(formData.filiere_id)}
                onChange={(e) => setFormData({ ...formData, filiere_id: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Laisse vide pour annonce générale.
              </p>
            </div>

            <div>
              <Label htmlFor="image">Image (optionnel)</Label>
              <Input
                id="image"
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
              />
            </div>
          </div>
        </div>

        {/* Footer fixe */}
        <div className="p-6 pt-4 border-t border-border flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={submitting}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'En cours...' : (editing ? 'Enregistrer' : "Publier l'annonce")}
          </Button>
        </div>
      </DialogContent>
         </Dialog>
        </div>

        {/* Quick Actions (style conservé) */}
        <div className="grid md:grid-cols-3 gap-4">
          <button
            className="card-institutional p-4 text-left hover:shadow-md transition-shadow"
            onClick={() => { resetForm(); setAnnouncementType('cancellation'); setIsCreateOpen(true); }}
            type="button"
          >
            <XCircle className="w-8 h-8 text-destructive mb-2" />
            <p className="font-medium text-foreground">Annuler un cours</p>
            <p className="text-sm text-muted-foreground">Informer d'une annulation</p>
          </button>

          <button
            className="card-institutional p-4 text-left hover:shadow-md transition-shadow"
            onClick={() => { resetForm(); setAnnouncementType('reschedule'); setIsCreateOpen(true); }}
            type="button"
          >
            <RefreshCw className="w-8 h-8 text-warning mb-2" />
            <p className="font-medium text-foreground">Reporter un cours</p>
            <p className="text-sm text-muted-foreground">Reprogrammer une séance</p>
          </button>

          <button
            className="card-institutional p-4 text-left hover:shadow-md transition-shadow"
            onClick={() => { resetForm(); setAnnouncementType('event'); setIsCreateOpen(true); }}
            type="button"
          >
            <Calendar className="w-8 h-8 text-info mb-2" />
            <p className="font-medium text-foreground">Annoncer un événement</p>
            <p className="text-sm text-muted-foreground">Conférence, soutenance...</p>
          </button>
        </div>

        {/* Announcements List (style conservé) */}
        <div className="card-institutional">
          <div className="p-5 border-b border-border">
            <h2 className="font-semibold text-foreground">Mes annonces</h2>
          </div>

          <div className="divide-y divide-border">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Chargement...</div>
            ) : announcements.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">Aucune annonce publiée</p>
              </div>
            ) : (
              announcements.map((announcement) => (
                <div key={announcement.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant={getAnnouncementVariant(announcement.type)}>
                          {getAnnouncementLabel(announcement.type)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(announcement.createdAt)}
                        </span>
                        {announcement.imageUrl && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <ImageIcon className="w-3 h-3" /> image
                          </span>
                        )}
                      </div>

                      <h3 className="font-medium text-foreground mb-1">{announcement.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{announcement.content}</p>

                      {announcement.imageUrl && (
                        <div className="mt-3">
                          <a
                            href={announcement.imageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Voir l’image
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(announcement)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(announcement.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherAnnouncements;
