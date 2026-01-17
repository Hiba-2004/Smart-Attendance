import React, { useState } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { mockTeachersList } from '@/lib/mockData';
import { toast } from '@/hooks/use-toast';
import { exportToExcel, exportToPDF } from '@/lib/exportUtils';
import { 
  UserCog, 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  Download,
  FileText,
  BookOpen
} from 'lucide-react';
import type { MockTeacher } from '@/lib/mockData';

const departments = [
  'Informatique & Systèmes',
  'Mathématiques',
  'Réseaux & Télécoms',
  'Intelligence Artificielle',
  'Communication',
  'Génie Civil',
  'Génie Électrique',
  'Génie Mécanique',
];

const AdminTeachers: React.FC = () => {
  const [teachers, setTeachers] = useState<MockTeacher[]>(mockTeachersList);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<MockTeacher | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
  });

  const handleCreateTeacher = () => {
    const newTeacher: MockTeacher = {
      id: teachers.length + 1,
      teacherId: `TCH-2024-${String(teachers.length + 60).padStart(4, '0')}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      department: formData.department,
      courses: [],
      status: 'active',
      hireDate: new Date().toISOString().split('T')[0],
    };
    setTeachers([...teachers, newTeacher]);
    setIsCreateOpen(false);
    setFormData({ firstName: '', lastName: '', email: '', department: '' });
  };

  const handleUpdateTeacher = () => {
    if (!editingTeacher) return;
    setTeachers(teachers.map(t => 
      t.id === editingTeacher.id 
        ? { ...editingTeacher, ...formData }
        : t
    ));
    setEditingTeacher(null);
    setFormData({ firstName: '', lastName: '', email: '', department: '' });
  };

  const handleDeleteTeacher = (id: number) => {
    setTeachers(teachers.filter(t => t.id !== id));
  };

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = 
      t.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.teacherId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || t.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const activeCount = teachers.filter(t => t.status === 'active').length;
  const sabbaticalCount = teachers.filter(t => t.status === 'sabbatical').length;

  const handleExportExcel = () => {
    exportToExcel({
      filename: 'liste-enseignants',
      headers: ['ID', 'Nom', 'Prénom', 'Email', 'Département', 'Cours', 'Statut'],
      data: filteredTeachers.map(t => ({
        'id': t.teacherId,
        'nom': t.lastName,
        'prénom': t.firstName,
        'email': t.email,
        'département': t.department,
        'cours': t.courses.length.toString(),
        'statut': t.status === 'active' ? 'Actif' : t.status === 'sabbatical' ? 'Sabbatique' : 'Inactif',
      })),
    });
  };

  const handleExportPDF = () => {
    exportToPDF({
      filename: 'liste-enseignants',
      title: 'Liste des Enseignants',
      headers: ['ID', 'Nom', 'Prénom', 'Email', 'Département', 'Statut'],
      data: filteredTeachers.map(t => ({
        'id': t.teacherId,
        'nom': t.lastName,
        'prénom': t.firstName,
        'email': t.email,
        'département': t.department,
        'statut': t.status === 'active' ? 'Actif' : t.status === 'sabbatical' ? 'Sabbatique' : 'Inactif',
      })),
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl lg:text-3xl text-foreground mb-2">Gestion des enseignants</h1>
            <p className="text-muted-foreground">{teachers.length} enseignants enregistrés</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportExcel}>
              <Download className="w-4 h-4 mr-2" />
              Excel
            </Button>
            <Button variant="outline" onClick={handleExportPDF}>
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvel enseignant
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Ajouter un enseignant</DialogTitle>
                  <DialogDescription>
                    Créez un nouveau compte enseignant
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
                    <Label>Département</Label>
                    <Select 
                      value={formData.department}
                      onValueChange={(v) => setFormData({ ...formData, department: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreateTeacher}>
                    Créer l'enseignant
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="metric-card">
            <UserCog className="w-8 h-8 text-primary mb-3" />
            <p className="metric-value">{teachers.length}</p>
            <p className="metric-label">Total</p>
          </div>
          <div className="metric-card">
            <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center mb-3">
              <div className="w-3 h-3 rounded-full bg-success" />
            </div>
            <p className="metric-value">{activeCount}</p>
            <p className="metric-label">Actifs</p>
          </div>
          <div className="metric-card">
            <div className="w-8 h-8 rounded-full bg-info/20 flex items-center justify-center mb-3">
              <div className="w-3 h-3 rounded-full bg-info" />
            </div>
            <p className="metric-value">{sabbaticalCount}</p>
            <p className="metric-label">En sabbatique</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher par nom, ID, email..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterDepartment} onValueChange={setFilterDepartment}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Département" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les départements</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Teachers Table */}
        <div className="card-institutional overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-institutional">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Email</th>
                  <th>Département</th>
                  <th>Cours</th>
                  <th>Statut</th>
                  <th className="w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td className="font-mono text-sm">{teacher.teacherId}</td>
                    <td className="font-medium">{teacher.lastName}</td>
                    <td>{teacher.firstName}</td>
                    <td className="text-muted-foreground">{teacher.email}</td>
                    <td>{teacher.department}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        <span>{teacher.courses.length}</span>
                      </div>
                    </td>
                    <td>
                      <Badge 
                        variant={
                          teacher.status === 'active' ? 'approved' :
                          teacher.status === 'sabbatical' ? 'info' : 'pending'
                        }
                      >
                        {teacher.status === 'active' ? 'Actif' :
                         teacher.status === 'sabbatical' ? 'Sabbatique' : 'Inactif'}
                      </Badge>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setEditingTeacher(teacher);
                            setFormData({
                              firstName: teacher.firstName,
                              lastName: teacher.lastName,
                              email: teacher.email,
                              department: teacher.department,
                            });
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteTeacher(teacher.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredTeachers.length === 0 && (
            <div className="p-8 text-center">
              <UserCog className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun enseignant trouvé</p>
            </div>
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingTeacher} onOpenChange={(open) => !open && setEditingTeacher(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Modifier l'enseignant</DialogTitle>
              <DialogDescription>
                {editingTeacher?.teacherId}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prénom</Label>
                  <Input 
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Nom</Label>
                  <Input 
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Département</Label>
                <Select 
                  value={formData.department}
                  onValueChange={(v) => setFormData({ ...formData, department: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingTeacher(null)}>
                Annuler
              </Button>
              <Button onClick={handleUpdateTeacher}>
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminTeachers;
