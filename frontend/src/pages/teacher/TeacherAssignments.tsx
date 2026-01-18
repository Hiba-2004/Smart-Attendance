import React, { useEffect, useMemo, useState } from "react";
import { TeacherLayout } from "@/layouts/TeacherLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Users,
  CheckCircle,
  Download,
  Archive,
} from "lucide-react";
import {
  teacherHomeworksService,
  type TeacherHomework,
  type TeacherModuleOption,
} from "@/lib/api";

type Status = "pending" | "submitted" | "graded";

const TeacherAssignments: React.FC = () => {
  const [homeworks, setHomeworks] = useState<TeacherHomework[]>([]);
  const [modules, setModules] = useState<TeacherModuleOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedHw, setSelectedHw] = useState<TeacherHomework | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [downloadingFileId, setDownloadingFileId] = useState<number | null>(
    null
  );
  const [downloadingZipId, setDownloadingZipId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    moduleId: "",
    deadline: "",
    description: "",
    file: null as File | null,
  });

  const [editData, setEditData] = useState({
    title: "",
    moduleId: "",
    deadline: "",
    description: "",
    file: null as File | null,
  });

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const load = async (p = 1) => {
    try {
      setLoading(true);

      const [mods, paginated] = await Promise.all([
        teacherHomeworksService.getModules(),
        teacherHomeworksService.getHomeworks(p),
      ]);

      setModules(mods ?? []);
      setHomeworks(paginated.data ?? []);
      setPage(paginated.current_page ?? 1);
      setLastPage(paginated.last_page ?? 1);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de charger les travaux depuis le serveur.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (iso: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  /**
   * ✅ DÉTERMINATION "NOTÉ" :
   * - pending: 0 submissions
   * - submitted: au moins 1 submission, mais pas tout noté
   * - graded: graded_count >= submissions_count (et submissions_count > 0)
   */
  const getStatus = (hw: TeacherHomework): Status => {
    const sc = Number(hw.submissions_count ?? 0);
    const gc = Number(hw.graded_count ?? 0);

    if (sc <= 0) return "pending";
    if (gc >= sc) return "graded";
    return "submitted";
  };

  const statusBadgeVariant = (status: Status) => {
    if (status === "pending") return "pending";
    if (status === "submitted") return "info";
    return "approved";
  };

  const statusLabel = (status: Status) => {
    if (status === "pending") return "En attente";
    if (status === "submitted") return "Soumis";
    return "Noté";
  };

  const stats = useMemo(() => {
    let pending = 0;
    let submitted = 0;
    let graded = 0;

    for (const hw of homeworks) {
      const s = getStatus(hw);
      if (s === "pending") pending++;
      else if (s === "submitted") submitted++;
      else graded++;
    }

    return { pending, submitted, graded };
  }, [homeworks]);

  const resetCreateForm = () => {
    setFormData({
      title: "",
      moduleId: "",
      deadline: "",
      description: "",
      file: null,
    });
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    setSelectedHw(null);
    setEditData({
      title: "",
      moduleId: "",
      deadline: "",
      description: "",
      file: null,
    });
  };

  const handleCreateHomework = async () => {
    if (!formData.title.trim() || !formData.moduleId || !formData.deadline) {
      toast({
        title: "Champs requis",
        description: "Titre, module et date limite sont obligatoires.",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);

      const fd = new FormData();
      fd.append("module_id", formData.moduleId);
      fd.append("title", formData.title.trim());
      fd.append("deadline", formData.deadline);

      if (formData.description.trim())
        fd.append("description", formData.description.trim());
      if (formData.file) fd.append("file", formData.file);

      const created = await teacherHomeworksService.createHomework(fd);

      // ✅ On refresh pour récupérer counts cohérents si besoin
      setHomeworks((prev) => [created, ...prev]);

      setIsCreateOpen(false);
      resetCreateForm();

      toast({
        title: "Travail créé",
        description: "Le travail a été ajouté avec succès.",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Création du travail impossible.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (hw: TeacherHomework) => {
    setSelectedHw(hw);
    setEditData({
      title: hw.title ?? "",
      moduleId: String(hw.module?.id ?? ""),
      deadline: hw.deadline ? hw.deadline.slice(0, 16) : "",
      description: hw.description ?? "",
      file: null,
    });
    setIsEditOpen(true);
  };

  const handleUpdateHomework = async () => {
    if (!selectedHw) return;

    if (!editData.title.trim() || !editData.deadline) {
      toast({
        title: "Champs requis",
        description: "Titre et date limite sont obligatoires.",
        variant: "destructive",
      });
      return;
    }

    try {
      setEditing(true);

      const fd = new FormData();
      fd.append("title", editData.title.trim());
      fd.append("deadline", editData.deadline);
      if (editData.description.trim())
        fd.append("description", editData.description.trim());
      if (editData.file) fd.append("file", editData.file);

      const updated = await teacherHomeworksService.updateHomework(
        selectedHw.id,
        fd
      );

      setHomeworks((prev) =>
        prev.map((h) => (h.id === selectedHw.id ? updated : h))
      );

      toast({ title: "Modifié", description: "Le travail a été mis à jour." });
      closeEdit();
    } catch {
      toast({
        title: "Erreur",
        description: "Modification impossible.",
        variant: "destructive",
      });
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteHomework = async (id: number) => {
    try {
      setDeletingId(id);
      await teacherHomeworksService.deleteHomework(id);
      setHomeworks((prev) => prev.filter((h) => h.id !== id));
      toast({ title: "Supprimé", description: "Le travail a été supprimé." });
    } catch {
      toast({
        title: "Erreur",
        description: "Suppression impossible.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownloadHomeworkFile = async (hw: TeacherHomework) => {
    if (!hw.file_path) {
      toast({ title: "Info", description: "Aucun fichier attaché à ce travail." });
      return;
    }

    try {
      setDownloadingFileId(hw.id);
      const blob = await teacherHomeworksService.downloadHomeworkFile(hw.id);
      downloadBlob(blob, `consigne_homework_${hw.id}`);
    } catch {
      toast({
        title: "Erreur",
        description: "Téléchargement de la consigne impossible.",
        variant: "destructive",
      });
    } finally {
      setDownloadingFileId(null);
    }
  };

  const handleDownloadSubmissionsZip = async (hw: TeacherHomework) => {
    try {
      setDownloadingZipId(hw.id);
      const blob = await teacherHomeworksService.downloadSubmissionsZip(hw.id);
      downloadBlob(blob, `submissions_homework_${hw.id}.zip`);
    } catch {
      toast({
        title: "Erreur",
        description: "Téléchargement ZIP impossible (aucun rendu ou erreur serveur).",
        variant: "destructive",
      });
    } finally {
      setDownloadingZipId(null);
    }
  };

  return (
    <TeacherLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl lg:text-3xl text-foreground mb-2">
              Travaux & Devoirs
            </h1>
            <p className="text-muted-foreground">
              Gestion des travaux pratiques et devoirs maison
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau travail
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer un nouveau travail</DialogTitle>
                <DialogDescription>
                  Définissez les détails du travail à rendre
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="title">Titre du travail</Label>
                  <Input
                    id="title"
                    placeholder="TP1 - Implémentation..."
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Module</Label>
                  <Select
                    value={formData.moduleId}
                    onValueChange={(v) =>
                      setFormData({ ...formData, moduleId: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {modules.map((m) => (
                        <SelectItem key={m.id} value={String(m.id)}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="deadline">Date limite</Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="file">Fichier (optionnel)</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.zip,.rar,.doc,.docx"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        file: e.target.files?.[0] ?? null,
                      })
                    }
                  />
                  {formData.file && (
                    <p className="text-xs text-muted-foreground mt-2 truncate">
                      Fichier: {formData.file.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Instructions</Label>
                  <Textarea
                    id="description"
                    placeholder="Détails et consignes du travail..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={creating}
                >
                  Annuler
                </Button>
                <Button onClick={handleCreateHomework} disabled={creating}>
                  {creating ? "Création..." : "Créer le travail"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* ✅ EDIT dialog */}
        <Dialog
          open={isEditOpen}
          onOpenChange={(open) => {
            if (!open) closeEdit();
            else setIsEditOpen(true);
          }}
        >
          <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier le travail</DialogTitle>
              <DialogDescription>
                Mettre à jour le travail sélectionné
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label>Titre</Label>
                <Input
                  value={editData.title}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Module</Label>
                <Select value={editData.moduleId} disabled>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  (Le module n’est pas modifiable ici.)
                </p>
              </div>

              <div>
                <Label>Date limite</Label>
                <Input
                  type="datetime-local"
                  value={editData.deadline}
                  onChange={(e) =>
                    setEditData({ ...editData, deadline: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Remplacer fichier (optionnel)</Label>
                <Input
                  type="file"
                  accept=".pdf,.zip,.rar,.doc,.docx"
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      file: e.target.files?.[0] ?? null,
                    })
                  }
                />
                {editData.file && (
                  <p className="text-xs text-muted-foreground mt-2 truncate">
                    Nouveau fichier: {editData.file.name}
                  </p>
                )}
              </div>

              <div>
                <Label>Instructions</Label>
                <Textarea
                  value={editData.description}
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeEdit} disabled={editing}>
                Annuler
              </Button>
              <Button onClick={handleUpdateHomework} disabled={editing}>
                {editing ? "Sauvegarde..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="metric-card">
            <Clock className="w-8 h-8 text-warning mb-3" />
            <p className="metric-value">{stats.pending}</p>
            <p className="metric-label">En attente</p>
          </div>
          <div className="metric-card">
            <Users className="w-8 h-8 text-info mb-3" />
            <p className="metric-value">{stats.submitted}</p>
            <p className="metric-label">Soumis</p>
          </div>
          <div className="metric-card">
            <CheckCircle className="w-8 h-8 text-success mb-3" />
            <p className="metric-value">{stats.graded}</p>
            <p className="metric-label">Notés</p>
          </div>
        </div>

        {/* List */}
        <div className="card-institutional">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Liste des travaux</h2>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {homeworks.length} travail(x)
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-sm text-muted-foreground">Chargement...</div>
          ) : homeworks.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              Aucun travail pour le moment.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {homeworks.map((hw) => {
                const s = getStatus(hw);
                const sc = Number(hw.submissions_count ?? 0);
                const gc = Number(hw.graded_count ?? 0);

                return (
                  <div
                    key={hw.id}
                    className="p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <p className="font-medium text-foreground truncate">
                          {hw.title}
                        </p>
                        <Badge variant="lecture">{hw.module?.name ?? "Module"}</Badge>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(hw.deadline)}
                        </span>

                        {sc > 0 && (
                          <>
                            <span>•</span>
                            <span>{sc} soumis</span>
                            <span>•</span>
                            <span>
                              {gc}/{sc} notés
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant={statusBadgeVariant(s)}>{statusLabel(s)}</Badge>

                      <div className="flex gap-1">
                        {/* Consigne */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadHomeworkFile(hw)}
                          disabled={!hw.file_path || downloadingFileId === hw.id}
                          title="Télécharger la consigne"
                        >
                          <Download className="w-4 h-4" />
                        </Button>

                        {/* ZIP rendus */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadSubmissionsZip(hw)}
                          disabled={downloadingZipId === hw.id}
                          title="Télécharger les rendus (ZIP)"
                        >
                          <Archive className="w-4 h-4" />
                        </Button>

                        {/* Modifier */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(hw)}
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>

                        {/* Supprimer */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteHomework(hw.id)}
                          disabled={deletingId === hw.id}
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && lastPage > 1 && (
            <div className="p-4 flex items-center justify-between border-t border-border text-sm">
              <Button
                variant="outline"
                size="sm"
                onClick={() => load(page - 1)}
                disabled={page <= 1}
              >
                Précédent
              </Button>
              <span className="text-muted-foreground">
                Page {page} / {lastPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => load(page + 1)}
                disabled={page >= lastPage}
              >
                Suivant
              </Button>
            </div>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherAssignments;
