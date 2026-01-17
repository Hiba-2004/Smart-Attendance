import React, { useState } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Save, Bell, Mail, Smartphone, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import { PageTransition } from '@/components/ui/page-transition';

const AdminProfile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  // Notification preferences state
  const [notifications, setNotifications] = useState({
    emailDisciplinary: true,
    emailUsers: true,
    emailSystem: true,
    platformDisciplinary: true,
    platformUsers: true,
    platformSystem: true,
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

  const permissions = ['Gestion des étudiants', 'Gestion des enseignants', 'Gestion des emplois du temps', 'Annonces', 'Discipline'];

  return (
    <AdminLayout>
      <PageTransition>
      <div className="space-y-8 max-w-5xl">
        {/* Page Header */}
        <div>
          <h1 className="font-serif text-2xl lg:text-3xl text-foreground mb-2">
            Mon profil
          </h1>
          <p className="text-muted-foreground">
            Informations personnelles et préférences administrateur
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
              <div className="flex items-center justify-center gap-2 mt-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-medium">Administrateur</span>
              </div>
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
                  <Label className="text-sm text-muted-foreground">Téléphone</Label>
                  <Input 
                    defaultValue="+213 555 123 456" 
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

        {/* Permissions */}
        <div className="card-institutional">
          <div className="p-5 border-b border-border">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Permissions</h3>
            </div>
          </div>
          <div className="p-5">
            <div className="flex flex-wrap gap-2">
              {permissions.map((permission) => (
                <Badge key={permission} variant="academic" className="text-sm py-1.5 px-3">
                  {permission}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Les permissions sont gérées par l'administrateur principal. Contactez le support pour toute modification.
            </p>
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
                    <Label className="text-sm text-muted-foreground">Alertes disciplinaires</Label>
                    <Switch 
                      checked={notifications.emailDisciplinary}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailDisciplinary: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">Nouveaux utilisateurs</Label>
                    <Switch 
                      checked={notifications.emailUsers}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailUsers: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">Alertes système</Label>
                    <Switch 
                      checked={notifications.emailSystem}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailSystem: checked }))}
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
                    <Label className="text-sm text-muted-foreground">Alertes disciplinaires</Label>
                    <Switch 
                      checked={notifications.platformDisciplinary}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, platformDisciplinary: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">Nouveaux utilisateurs</Label>
                    <Switch 
                      checked={notifications.platformUsers}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, platformUsers: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">Alertes système</Label>
                    <Switch 
                      checked={notifications.platformSystem}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, platformSystem: checked }))}
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
      </div>
      </PageTransition>
    </AdminLayout>
  );
};

export default AdminProfile;
