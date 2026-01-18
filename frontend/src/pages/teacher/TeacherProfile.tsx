import React, { useEffect, useMemo, useState } from "react";
import { TeacherLayout } from "@/layouts/TeacherLayout";
import { PageTransition } from "@/components/ui/page-transition";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import {
  api,
  type Course,
  teacherPreferencesService,
  type NotificationPreferences,
  teacherProfileService,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { Save, Bell, Mail, Smartphone } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const TeacherProfile: React.FC = () => {
  const { user, refresh } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const [courses, setCourses] = useState<Course[]>([]);

  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email_absences: true,
    email_assignments: true,
    email_announcements: true,
    email_exams: true,
    platform_absences: true,
    platform_assignments: true,
    platform_announcements: true,
    platform_exams: true,
  });

  const [prefLoading, setPrefLoading] = useState(true);
  const [prefSaving, setPrefSaving] = useState(false);

  const [firstNameDraft, setFirstNameDraft] = useState<string>(user?.firstName || "");
  const [lastNameDraft, setLastNameDraft] = useState<string>(user?.lastName || "");

  useEffect(() => {
    setFirstNameDraft(user?.firstName || "");
    setLastNameDraft(user?.lastName || "");
  }, [user?.firstName, user?.lastName]);

  useEffect(() => {
    (async () => {
      try {
        const pref = await teacherPreferencesService.get();
        setNotifications(pref);
      } catch {
        // keep defaults
      } finally {
        setPrefLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<any>("/api/teacher/courses");
        const data = Array.isArray(res.data) ? res.data : res.data?.data;
        setCourses(Array.isArray(data) ? data : []);
      } catch {
        setCourses([]);
      }
    })();
  }, []);

  const initials = useMemo(() => {
    const f = user?.firstName?.[0] || "";
    const l = user?.lastName?.[0] || "";
    return `${f}${l}`.trim();
  }, [user?.firstName, user?.lastName]);

  const handleSaveProfile = async () => {
    try {
      const f = firstNameDraft.trim();
      const l = lastNameDraft.trim();

      if (!f || !l) {
        toast({
          title: "Champs requis",
          description: "Veuillez saisir le prénom et le nom.",
          variant: "destructive" as any,
        });
        return;
      }

      await teacherProfileService.updateName(f, l);
      await refresh();

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées avec succès.",
      });
      setIsEditing(false);
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Une erreur est survenue. Veuillez réessayer.";
      toast({ title: "Erreur", description: msg, variant: "destructive" as any });
    }
  };

  const handleSaveNotifications = async () => {
    setPrefSaving(true);
    try {
      await teacherPreferencesService.update(notifications);
      toast({
        title: "Préférences enregistrées",
        description: "Vos préférences de notification ont été mises à jour.",
      });
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || "Impossible d'enregistrer les préférences. Réessayez.";
      toast({ title: "Erreur", description: msg, variant: "destructive" as any });
    } finally {
      setPrefSaving(false);
    }
  };

  return (
    <TeacherLayout>
      <PageTransition>
        <div className="space-y-8 max-w-5xl">
          <div>
            <h1 className="font-serif text-2xl lg:text-3xl text-foreground mb-2">Mon profil</h1>
            <p className="text-muted-foreground">Informations personnelles et préférences</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="card-institutional p-6">
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <AvatarUpload
                    currentAvatar={user?.avatar}
                    initials={initials}
                    onAvatarChange={() =>
                      toast({ title: "Photo mise à jour", description: "Votre avatar a été enregistré." })
                    }
                  />
                </div>

                <h2 className="font-serif text-xl text-foreground">
                  {user?.firstName} {user?.lastName}
                </h2>

                <p className="text-sm text-muted-foreground mt-1">{user?.teacherId}</p>
                <p className="text-sm text-primary font-medium mt-1">{user?.department}</p>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <dl className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <dt className="text-muted-foreground">Email</dt>
                    <dd className="text-foreground font-medium text-right truncate ml-2">{user?.email}</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-muted-foreground">Statut</dt>
                    <dd className="text-success font-medium">Actif</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-muted-foreground">Année</dt>
                    <dd className="text-foreground font-medium">2024-2025</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="lg:col-span-2 card-institutional">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h3 className="font-semibold text-foreground">Informations personnelles</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (isEditing) {
                      setFirstNameDraft(user?.firstName || "");
                      setLastNameDraft(user?.lastName || "");
                    }
                    setIsEditing(!isEditing);
                  }}
                >
                  {isEditing ? "Annuler" : "Modifier"}
                </Button>
              </div>

              <div className="p-5">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Prénom</Label>
                    <Input
                      value={firstNameDraft}
                      onChange={(e) => setFirstNameDraft(e.target.value)}
                      disabled={!isEditing}
                      className="disabled:bg-muted/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Nom</Label>
                    <Input
                      value={lastNameDraft}
                      onChange={(e) => setLastNameDraft(e.target.value)}
                      disabled={!isEditing}
                      className="disabled:bg-muted/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Email</Label>
                    <Input defaultValue={user?.email} disabled className="disabled:bg-muted/30" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Identifiant enseignant</Label>
                    <Input defaultValue={user?.teacherId} disabled className="disabled:bg-muted/30" />
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-6 flex justify-end">
                    <Button variant="institutional" onClick={handleSaveProfile}>
                      <Save className="w-4 h-4 mr-2" />
                      Enregistrer
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card-institutional">
            <div className="p-5 border-b border-border">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Préférences de notification</h3>
              </div>
            </div>

            <div className="p-5">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <h4 className="font-medium text-foreground">Notifications par email</h4>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">Nouvelles absences</Label>
                      <Switch
                        checked={notifications.email_absences}
                        disabled={prefLoading}
                        onCheckedChange={(checked) =>
                          setNotifications((p) => ({ ...p, email_absences: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">Travaux & devoirs</Label>
                      <Switch
                        checked={notifications.email_assignments}
                        disabled={prefLoading}
                        onCheckedChange={(checked) =>
                          setNotifications((p) => ({ ...p, email_assignments: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">Annonces</Label>
                      <Switch
                        checked={notifications.email_announcements}
                        disabled={prefLoading}
                        onCheckedChange={(checked) =>
                          setNotifications((p) => ({ ...p, email_announcements: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">Rappels (exams)</Label>
                      <Switch
                        checked={notifications.email_exams}
                        disabled={prefLoading}
                        onCheckedChange={(checked) =>
                          setNotifications((p) => ({ ...p, email_exams: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Smartphone className="w-4 h-4 text-muted-foreground" />
                    <h4 className="font-medium text-foreground">Notifications plateforme</h4>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">Nouvelles absences</Label>
                      <Switch
                        checked={notifications.platform_absences}
                        disabled={prefLoading}
                        onCheckedChange={(checked) =>
                          setNotifications((p) => ({ ...p, platform_absences: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">Travaux & devoirs</Label>
                      <Switch
                        checked={notifications.platform_assignments}
                        disabled={prefLoading}
                        onCheckedChange={(checked) =>
                          setNotifications((p) => ({ ...p, platform_assignments: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">Annonces</Label>
                      <Switch
                        checked={notifications.platform_announcements}
                        disabled={prefLoading}
                        onCheckedChange={(checked) =>
                          setNotifications((p) => ({ ...p, platform_announcements: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">Rappels (exams)</Label>
                      <Switch
                        checked={notifications.platform_exams}
                        disabled={prefLoading}
                        onCheckedChange={(checked) =>
                          setNotifications((p) => ({ ...p, platform_exams: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border flex justify-end">
                <Button
                  variant="institutional"
                  onClick={handleSaveNotifications}
                  disabled={prefLoading || prefSaving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer les préférences
                </Button>
              </div>
            </div>
          </div>

          <div className="card-institutional">
            <div className="p-5 border-b border-border">
              <h3 className="font-semibold text-foreground">Cours assignés — Semestre en cours</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="table-institutional">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Intitulé</th>
                    <th>Crédits</th>
                    <th>Étudiants</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id}>
                      <td className="font-medium text-foreground">{course.code}</td>
                      <td>{course.name}</td>
                      <td>{course.credits} ECTS</td>
                      <td className="text-muted-foreground">—</td>
                    </tr>
                  ))}

                  {courses.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center text-muted-foreground py-6">
                        Aucun cours assigné.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </PageTransition>
    </TeacherLayout>
  );
};

export default TeacherProfile;
