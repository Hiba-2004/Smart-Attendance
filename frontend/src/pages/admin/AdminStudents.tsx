import React, { useState, useRef } from 'react';
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
import { mockStudentsList, mockPrograms } from '@/lib/mockData';
import { toast } from '@/hooks/use-toast';
import { exportToExcel, exportToPDF, importExcel } from '@/lib/exportUtils';
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  Download,
  Upload,
  FileText
} from 'lucide-react';
import type { MockStudent } from '@/lib/mockData';

const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<MockStudent[]>(mockStudentsList);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<MockStudent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProgram, setFilterProgram] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    program: '',
    year: 1,
  });

  const handleCreateStudent = () => {
    const newStudent: MockStudent = {
      id: students.length + 1,
      studentId: `STU-2024-${String(students.length + 200).padStart(4, '0')}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      program: formData.program,
      year: formData.year,
      status: 'active',
      enrollmentDate: new Date().toISOString().split('T')[0],
    };
    setStudents([...students, newStudent]);
    setIsCreateOpen(false);
    setFormData({ firstName: '', lastName: '', email: '', program: '', year: 1 });
  };

  const handleUpdateStudent = () => {
    if (!editingStudent) return;
    setStudents(students.map(s => 
      s.id === editingStudent.id 
        ? { ...editingStudent, ...formData }
        : s
    ));
    setEditingStudent(null);
    setFormData({ firstName: '', lastName: '', email: '', program: '', year: 1 });
  };

  const handleDeleteStudent = (id: number) => {
    setStudents(students.filter(s => s.id !== id));
  };

  const handleToggleStatus = (id: number) => {
    setStudents(students.map(s => 
      s.id === id 
        ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' }
        : s
    ));
  };

  const handleExportExcel = () => {
    exportToExcel({
      filename: 'liste-etudiants',
      headers: ['ID', 'Nom', 'Prénom', 'Email', 'Filière', 'Année', 'Statut'],
      data: filteredStudents.map(s => ({
        'id': s.studentId,
        'nom': s.lastName,
        'prénom': s.firstName,
        'email': s.email,
        'filière': s.program,
        'année': `${s.year}A`,
        'statut': s.status === 'active' ? 'Actif' : s.status === 'suspended' ? 'Suspendu' : 'Inactif',
      })),
    });
  };

  const handleExportPDF = () => {
    exportToPDF({
      filename: 'liste-etudiants',
      title: 'Liste des Étudiants',
      headers: ['ID', 'Nom', 'Prénom', 'Email', 'Filière', 'Année', 'Statut'],
      data: filteredStudents.map(s => ({
        'id': s.studentId,
        'nom': s.lastName,
        'prénom': s.firstName,
        'email': s.email,
        'filière': s.program,
        'année': `${s.year}A`,
        'statut': s.status === 'active' ? 'Actif' : s.status === 'suspended' ? 'Suspendu' : 'Inactif',
      })),
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const data = await importExcel(file);
      toast({
        title: 'Import réussi',
        description: `${data.length} étudiants importés.`,
      });
    } catch (error) {
      toast({
        title: 'Erreur d\'import',
        description: 'Le fichier n\'a pas pu être lu.',
        variant: 'destructive',
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = 
      s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProgram = filterProgram === 'all' || s.program === filterProgram;
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchesSearch && matchesProgram && matchesStatus;
  });

  const activeCount = students.filter(s => s.status === 'active').length;
  const inactiveCount = students.filter(s => s.status === 'inactive').length;
  const suspendedCount = students.filter(s => s.status === 'suspended').length;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl lg:text-3xl text-foreground mb-2">Gestion des étudiants</h1>
            <p className="text-muted-foreground">{students.length} étudiants inscrits</p>
          </div>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button variant="outline" onClick={handleImportClick}>
              <Upload className="w-4 h-4 mr-2" />
              Importer
            </Button>
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
                  Nouvel étudiant
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Ajouter un étudiant</DialogTitle>
                  <DialogDescription>
                    Créez un nouveau compte étudiant
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Filière</Label>
                      <Select 
                        value={formData.program}
                        onValueChange={(v) => setFormData({ ...formData, program: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockPrograms.map((program) => (
                            <SelectItem key={program.id} value={program.name}>
                              {program.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="year">Année</Label>
                      <Select 
                        value={formData.year.toString()}
                        onValueChange={(v) => setFormData({ ...formData, year: parseInt(v) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}ème année
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreateStudent}>
                    Créer l'étudiant
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="metric-card">
            <Users className="w-8 h-8 text-primary mb-3" />
            <p className="metric-value">{students.length}</p>
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
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mb-3">
              <div className="w-3 h-3 rounded-full bg-muted-foreground" />
            </div>
            <p className="metric-value">{inactiveCount}</p>
            <p className="metric-label">Inactifs</p>
          </div>
          <div className="metric-card">
            <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center mb-3">
              <div className="w-3 h-3 rounded-full bg-destructive" />
            </div>
            <p className="metric-value">{suspendedCount}</p>
            <p className="metric-label">Suspendus</p>
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
          <Select value={filterProgram} onValueChange={setFilterProgram}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filière" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les filières</SelectItem>
              {mockPrograms.map((program) => (
                <SelectItem key={program.id} value={program.name}>
                  {program.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="inactive">Inactif</SelectItem>
              <SelectItem value="suspended">Suspendu</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Students Table */}
        <div className="card-institutional overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-institutional">
              <thead>
                <tr>
                  <th>N° Étudiant</th>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Email</th>
                  <th>Filière</th>
                  <th>Année</th>
                  <th>Statut</th>
                  <th className="w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td className="font-mono text-sm">{student.studentId}</td>
                    <td className="font-medium">{student.lastName}</td>
                    <td>{student.firstName}</td>
                    <td className="text-muted-foreground">{student.email}</td>
                    <td>{student.program}</td>
                    <td>{student.year}A</td>
                    <td>
                      <Badge 
                        variant={
                          student.status === 'active' ? 'approved' :
                          student.status === 'suspended' ? 'rejected' : 'pending'
                        }
                      >
                        {student.status === 'active' ? 'Actif' :
                         student.status === 'suspended' ? 'Suspendu' : 'Inactif'}
                      </Badge>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setEditingStudent(student);
                            setFormData({
                              firstName: student.firstName,
                              lastName: student.lastName,
                              email: student.email,
                              program: student.program,
                              year: student.year,
                            });
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteStudent(student.id)}
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
          {filteredStudents.length === 0 && (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun étudiant trouvé</p>
            </div>
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Modifier l'étudiant</DialogTitle>
              <DialogDescription>
                {editingStudent?.studentId}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editFirstName">Prénom</Label>
                  <Input 
                    id="editFirstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="editLastName">Nom</Label>
                  <Input 
                    id="editLastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="editEmail">Email</Label>
                <Input 
                  id="editEmail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Filière</Label>
                  <Select 
                    value={formData.program}
                    onValueChange={(v) => setFormData({ ...formData, program: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mockPrograms.map((program) => (
                        <SelectItem key={program.id} value={program.name}>
                          {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Année</Label>
                  <Select 
                    value={formData.year.toString()}
                    onValueChange={(v) => setFormData({ ...formData, year: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}ème année
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingStudent(null)}>
                Annuler
              </Button>
              <Button onClick={handleUpdateStudent}>
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminStudents;
