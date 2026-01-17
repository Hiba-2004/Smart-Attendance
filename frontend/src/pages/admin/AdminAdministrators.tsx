import React, { useState } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import { mockAdministratorsList } from '@/lib/mockData';
import { 
  Shield, 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  Key
} from 'lucide-react';
import type { MockAdministrator } from '@/lib/mockData';

const roles = [
  'Administrateur Principal',
  'Gestionnaire Scolarité',
  'Gestionnaire RH',
  'Support Technique',
];

const permissionsList = [
  { key: 'students', label: 'Gestion des étudiants' },
  { key: 'teachers', label: 'Gestion des enseignants' },
  { key: 'administrators', label: 'Gestion des administrateurs' },
  { key: 'timetables', label: 'Gestion des emplois du temps' },
  { key: 'announcements', label: 'Gestion des annonces' },
  { key: 'disciplinary', label: 'Gestion disciplinaire' },
];

const AdminAdministrators: React.FC = () => {
  const [admins, setAdmins] = useState<MockAdministrator[]>(mockAdministratorsList);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<MockAdministrator | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    permissions: [] as string[],
  });

  const handleTogglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const handleCreateAdmin = () => {
    const newAdmin: MockAdministrator = {
      id: admins.length + 1,
      adminId: `ADM-2024-${String(admins.length + 10).padStart(4, '0')}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      role: formData.role,
      permissions: formData.permissions,
      status: 'active',
      hireDate: new Date().toISOString().split('T')[0],
    };
    setAdmins([...admins, newAdmin]);
    setIsCreateOpen(false);
    setFormData({ firstName: '', lastName: '', email: '', role: '', permissions: [] });
  };

  const handleDeleteAdmin = (id: number) => {
    setAdmins(admins.filter(a => a.id !== id));
  };

  const filteredAdmins = admins.filter(a => 
    a.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.adminId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl lg:text-3xl text-foreground mb-2">Gestion des administrateurs</h1>
            <p className="text-muted-foreground">{admins.length} administrateurs</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouvel administrateur
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Ajouter un administrateur</DialogTitle>
                <DialogDescription>
                  Créez un nouveau compte administrateur avec des permissions spécifiques
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input 
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom</Label>
                    <Input 
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email institutionnel</Label>
                  <Input 
                    id="email"
                    type="email"
                    placeholder="prenom.nom@esi.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Rôle</Label>
                  <Select 
                    value={formData.role}
                    onValueChange={(v) => setFormData({ ...formData, role: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-3 block">Permissions</Label>
                  <div className="space-y-2 border border-border rounded-lg p-4">
                    {permissionsList.map((permission) => (
                      <div key={permission.key} className="flex items-center gap-3">
                        <Checkbox 
                          id={permission.key}
                          checked={formData.permissions.includes(permission.key)}
                          onCheckedChange={() => handleTogglePermission(permission.key)}
                        />
                        <Label htmlFor={permission.key} className="text-sm font-normal cursor-pointer">
                          {permission.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateAdmin}>
                  Créer l'administrateur
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="metric-card">
            <Shield className="w-8 h-8 text-primary mb-3" />
            <p className="metric-value">{admins.length}</p>
            <p className="metric-label">Total administrateurs</p>
          </div>
          <div className="metric-card">
            <Key className="w-8 h-8 text-info mb-3" />
            <p className="metric-value">{roles.length}</p>
            <p className="metric-label">Rôles différents</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher par nom, ID, email..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Administrators List */}
        <div className="grid lg:grid-cols-2 gap-6">
          {filteredAdmins.map((admin) => (
            <div key={admin.id} className="card-institutional overflow-hidden">
              <div className="p-5 border-b border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground mb-1">{admin.adminId}</p>
                    <h3 className="font-medium text-foreground">
                      {admin.firstName} {admin.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">{admin.email}</p>
                  </div>
                  <Badge variant={admin.status === 'active' ? 'approved' : 'pending'}>
                    {admin.status === 'active' ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Rôle</p>
                  <p className="text-sm font-medium text-foreground">{admin.role}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Permissions</p>
                  <div className="flex flex-wrap gap-1">
                    {admin.permissions.includes('all') ? (
                      <Badge variant="info">Toutes les permissions</Badge>
                    ) : (
                      admin.permissions.map((perm) => (
                        <Badge key={perm} variant="secondary" className="text-xs">
                          {permissionsList.find(p => p.key === perm)?.label || perm}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteAdmin(admin.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAdmins.length === 0 && (
          <div className="card-institutional p-8 text-center">
            <Shield className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">Aucun administrateur trouvé</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAdministrators;
