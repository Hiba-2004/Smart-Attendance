import React, { useState } from 'react';
import { TeacherLayout } from '@/layouts/TeacherLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { mockCourses } from '@/lib/mockData';
import { Save, Bell, Mail, Smartphone } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import { PageTransition } from '@/components/ui/page-transition';

const TeacherProfile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  // Notification preferences state
  const [notifications, setNotifications] = useState({
    emailAbsences: true,
    emailJustifications: true,
    emailAnnouncements: false,
    platformAbsences: true,
    platformJustifications: true,
    platformAnnouncements: true,
  });

  const handleSaveProfile = () => {
    toast({
      title: "Profil mis à jour",
      description: "Vos informations ont été enregistrées avec succès.",
    });
    setIsEditing(false);
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Préférences enregistrées",
      description: "Vos préférences de notification ont été mises à jour.",
    });
  };

  return (
    <TeacherLayout>
      <PageTransition>
      <div className="space-y-8 max-w-5xl">
        {/* Page Header */}
        <div>
          <h1 className="font-serif text-2xl lg:text-3xl text-foreground mb-2">
            Mon profil
          </h1>
          <p className="text-muted-foreground">
            Informations personnelles et préférences
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="card-institutional p-6">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <AvatarUpload 
                  currentAvatar={user?.avatar}
                  initials={`${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`}
                  onAvatarChange={(url) => toast({ title: 'Photo mise à jour', description: 'Votre avatar a été enregistré.' })}
                />
              </div>
              
              <h2 className="font-serif text-xl text-foreground">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {user?.teacherId}
              </p>
              <p className="text-sm text-primary font-medium mt-1">
                {user?.department}
              </p>
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

          {/* Personal Information */}
          <div className="lg:col-span-2 card-institutional">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-foreground">Informations personnelles</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Annuler' : 'Modifier'}
              </Button>
            </div>
            <div className="p-5">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Prénom</Label>
                  <Input 
                    defaultValue={user?.firstName} 
                    disabled={!isEditing}
                    className="disabled:bg-muted/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Nom</Label>
                  <Input 
                    defaultValue={user?.lastName} 
                    disabled={!isEditing}
                    className="disabled:bg-muted/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <Input 
                    defaultValue={user?.email} 
                    disabled 
                    className="disabled:bg-muted/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Identifiant</Label>
                  <Input 
                    defaultValue={user?.teacherId} 
                    disabled 
                    className="disabled:bg-muted/30"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-sm text-muted-foreground">Département</Label>
                  <Input 
                    defaultValue={user?.department} 
                    disabled={!isEditing}
                    className="disabled:bg-muted/30"
                  />
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

        {/* Notification Preferences */}
        <div className="card-institutional">
          <div className="p-5 border-b border-border">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Préférences de notification</h3>
            </div>
          </div>
          <div className="p-5">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Email Notifications */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <h4 className="font-medium text-foreground">Notifications par email</h4>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">Nouvelles absences</Label>
                    <Switch 
                      checked={notifications.emailAbsences}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailAbsences: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">Justificatifs soumis</Label>
                    <Switch 
                      checked={notifications.emailJustifications}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailJustifications: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">Annonces administratives</Label>
                    <Switch 
                      checked={notifications.emailAnnouncements}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailAnnouncements: checked }))}
                    />
                  </div>
                </div>
              </div>

              {/* Platform Notifications */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Smartphone className="w-4 h-4 text-muted-foreground" />
                  <h4 className="font-medium text-foreground">Notifications plateforme</h4>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">Nouvelles absences</Label>
                    <Switch 
                      checked={notifications.platformAbsences}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, platformAbsences: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">Justificatifs soumis</Label>
                    <Switch 
                      checked={notifications.platformJustifications}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, platformJustifications: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">Annonces administratives</Label>
                    <Switch 
                      checked={notifications.platformAnnouncements}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, platformAnnouncements: checked }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border flex justify-end">
              <Button variant="institutional" onClick={handleSaveNotifications}>
                <Save className="w-4 h-4 mr-2" />
                Enregistrer les préférences
              </Button>
            </div>
          </div>
        </div>

        {/* Assigned Courses */}
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
                {mockCourses.slice(0, 4).map((course) => (
                  <tr key={course.id}>
                    <td className="font-medium text-foreground">{course.code}</td>
                    <td>{course.name}</td>
                    <td>{course.credits} ECTS</td>
                    <td className="text-muted-foreground">45 inscrits</td>
                  </tr>
                ))}
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
