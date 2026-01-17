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
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Users,
  FileText,
  Upload,
  Download as DownloadIcon,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

type Module = {
  id: number;
  code?: string | null;
  name: string;
  credits?: number | null;
  semester?: number | null;
  description?: string | null;
};

type Course = {
  id: number;
  module_id: number;
  teacher_id: number;
  title: string;
  description?: string | null;
  file_path?: string | null;
  created_at?: string;
  module?: Module | null;
};

type Pagination<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

const TeacherCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const [modules, setModules] = useState<Module[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    module_id: '' as string | number,
    title: '',
    description: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const stats = useMemo(() => {
    // gardé simple: cours = courses.length, ressources = nb cours avec fichier
    const resources = courses.filter(c => !!c.file_path).length;
    return {
      activeCourses: courses.length,
      students: 142, // tu peux le connecter plus tard si tu veux
      resources,
    };
  }, [courses]);

  const resetForm = () => {
    setFormData({ module_id: '', title: '', description: '' });
    setSelectedFile(null);
    setEditingCourse(null);
  };

  const loadModules = async () => {
    setLoadingModules(true);
    try {
      const res = await api.get<Module[]>('/api/teacher/modules');
      setModules(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      setModules([]);
      toast({
        title: 'Erreur',
        description: e?.response?.data?.message || 'Impossible de charger les modules.',
        variant: 'destructive',
      });
    } finally {
      setLoadingModules(false);
    }
  };

  const loadCourses = async () => {
    setLoadingCourses(true);
    try {
      const res = await api.get<Pagination<Course>>('/api/teacher/courses');
      const rows = Array.isArray(res.data?.data) ? res.data.data : [];
      setCourses(rows);
    } catch (e: any) {
      setCourses([]);
      toast({
        title: 'Erreur',
        description: e?.response?.data?.message || 'Impossible de charger les cours.',
        variant: 'destructive',
      });
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    loadCourses();
    loadModules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      module_id: course.module_id,
      title: course.title,
      description: course.description ?? '',
    });
    setSelectedFile(null);
    setIsCreateOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.module_id) {
      toast({ title: 'Module requis', description: 'Choisis un module.' });
      return;
    }
    if (!formData.title.trim()) {
      toast({ title: 'Titre requis', description: 'Saisis un titre.' });
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('module_id', String(formData.module_id));
      fd.append('title', formData.title.trim());
      if (formData.description?.trim()) fd.append('description', formData.description.trim());
      if (selectedFile) fd.append('file', selectedFile);

      if (!editingCourse) {
        await api.post('/api/teacher/courses', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast({ title: 'Créé', description: 'Cours ajouté avec succès.' });
      } else {
        // Laravel: PUT multipart parfois capricieux → méthode POST + _method=PUT
        fd.append('_method', 'PUT');
        await api.post(`/api/teacher/courses/${editingCourse.id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast({ title: 'Modifié', description: 'Cours mis à jour.' });
      }

      setIsCreateOpen(false);
      resetForm();
      await loadCourses();
    } catch (e: any) {
      toast({
        title: 'Erreur',
        description: e?.response?.data?.message || "Impossible d'enregistrer le cours.",
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async (id: number) => {
    try {
      await api.delete(`/api/teacher/courses/${id}`);
      setCourses(prev => prev.filter(c => c.id !== id));
      toast({ title: 'Supprimé', description: 'Cours supprimé.' });
    } catch (e: any) {
      toast({
        title: 'Erreur',
        description: e?.response?.data?.message || "Impossible de supprimer le cours.",
        variant: 'destructive',
      });
    }
  };

  const handleDownload = (courseId: number) => {
    const base = (api.defaults.baseURL || '').replace(/\/$/, '');
    window.open(`${base}/api/teacher/courses/${courseId}/download`, '_blank');
  };

  return (
    <TeacherLayout>
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl lg:text-3xl text-foreground mb-2">Mes cours</h1>
            <p className="text-muted-foreground">Gestion des cours et ressources pédagogiques</p>
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
                Nouveau cours
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle>{editingCourse ? 'Modifier le cours' : 'Créer un nouveau cours'}</DialogTitle>
                <DialogDescription>
                  {editingCourse ? 'Mettez à jour les informations du cours' : 'Renseignez les informations du nouveau cours'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="module_id">Module</Label>
                  <select
                    id="module_id"
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={String(formData.module_id)}
                    onChange={(e) => setFormData({ ...formData, module_id: Number(e.target.value) })}
                    disabled={loadingModules}
                  >
                    <option value="">
                      {loadingModules ? 'Chargement...' : 'Choisir un module'}
                    </option>
                    {modules.map((m) => (
                      <option key={m.id} value={String(m.id)}>
                        {(m.code ? `${m.code} — ` : '')}{m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="title">Titre du support</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Chapitre 1 - Introduction"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Description du cours..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="file">Fichier (optionnel)</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.zip,.rar,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                  {editingCourse?.file_path && !selectedFile && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Un fichier existe déjà. Sélectionne un nouveau fichier pour le remplacer.
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={submitting}>
                  Annuler
                </Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'En cours...' : (editingCourse ? 'Enregistrer' : 'Créer le cours')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats (style conservé) */}
        <div className="grid grid-cols-3 gap-4">
          <div className="metric-card">
            <BookOpen className="w-8 h-8 text-primary mb-3" />
            <p className="metric-value">{stats.activeCourses}</p>
            <p className="metric-label">Cours actifs</p>
          </div>
          <div className="metric-card">
            <Users className="w-8 h-8 text-info mb-3" />
            <p className="metric-value">{stats.students}</p>
            <p className="metric-label">Étudiants inscrits</p>
          </div>
          <div className="metric-card">
            <FileText className="w-8 h-8 text-success mb-3" />
            <p className="metric-value">{stats.resources}</p>
            <p className="metric-label">Ressources</p>
          </div>
        </div>

        {/* Courses List (style conservé) */}
        <div className="grid lg:grid-cols-2 gap-6">
          {loadingCourses && (
            <div className="card-institutional p-6 text-muted-foreground">
              Chargement des cours...
            </div>
          )}

          {!loadingCourses && courses.map((course) => {
            const m = course.module;
            const badgeCode = m?.code || `M-${course.module_id}`;
            const badgeCredits = typeof m?.credits === 'number' ? `${m.credits} ECTS` : '— ECTS';
            const semester = typeof m?.semester === 'number' ? `Semestre ${m.semester}` : 'Semestre —';

            return (
              <div key={course.id} className="card-institutional overflow-hidden">
                <div className="p-5 border-b border-border">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="lecture">{badgeCode}</Badge>
                        <Badge variant="info">{badgeCredits}</Badge>
                      </div>
                      <h3 className="font-serif text-lg text-foreground">
                        {m?.name || course.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {course.title}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(course)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteCourse(course.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{semester}</span>
                    <span className="text-muted-foreground">24 étudiants</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      disabled={!course.file_path}
                      onClick={() => handleDownload(course.id)}
                    >
                      <DownloadIcon className="w-4 h-4 mr-2" />
                      Ressources
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEdit(course)}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Ajouter
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {!loadingCourses && courses.length === 0 && (
            <div className="card-institutional p-6 text-muted-foreground">
              Aucun cours pour le moment.
            </div>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherCourses;
