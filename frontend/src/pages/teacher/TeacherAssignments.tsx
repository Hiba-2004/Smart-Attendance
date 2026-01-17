import React, { useState } from 'react';
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
import { mockAssignments, mockCourses } from '@/lib/mockData';
import { 
  FileText, 
  Plus, 
  Edit2, 
  Trash2, 
  Clock,
  Users,
  CheckCircle,
  Download
} from 'lucide-react';

const TeacherAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState(mockAssignments);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    courseCode: '',
    dueDate: '',
    maxGrade: 20,
    description: '',
  });

  const handleCreateAssignment = () => {
    const course = mockCourses.find(c => c.code === formData.courseCode);
    const newAssignment = {
      id: assignments.length + 1,
      title: formData.title,
      course: course?.name || '',
      courseCode: formData.courseCode,
      dueDate: formData.dueDate,
      status: 'pending' as const,
      maxGrade: formData.maxGrade,
    };
    setAssignments([...assignments, newAssignment]);
    setIsCreateOpen(false);
    setFormData({ title: '', courseCode: '', dueDate: '', maxGrade: 20, description: '' });
  };

  const handleDeleteAssignment = (id: number) => {
    setAssignments(assignments.filter(a => a.id !== id));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const pendingCount = assignments.filter(a => a.status === 'pending').length;
  const submittedCount = assignments.filter(a => a.status === 'submitted').length;
  const gradedCount = assignments.filter(a => a.status === 'graded').length;

  return (
    <TeacherLayout>
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl lg:text-3xl text-foreground mb-2">Travaux & Devoirs</h1>
            <p className="text-muted-foreground">Gestion des travaux pratiques et devoirs maison</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau travail
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
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
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Cours</Label>
                    <Select 
                      value={formData.courseCode}
                      onValueChange={(v) => setFormData({ ...formData, courseCode: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockCourses.map((course) => (
                          <SelectItem key={course.id} value={course.code}>
                            {course.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="maxGrade">Note maximale</Label>
                    <Input 
                      id="maxGrade"
                      type="number"
                      min={1}
                      max={100}
                      value={formData.maxGrade}
                      onChange={(e) => setFormData({ ...formData, maxGrade: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="dueDate">Date limite</Label>
                  <Input 
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Instructions</Label>
                  <Textarea 
                    id="description"
                    placeholder="Détails et consignes du travail..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateAssignment}>
                  Créer le travail
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="metric-card">
            <Clock className="w-8 h-8 text-warning mb-3" />
            <p className="metric-value">{pendingCount}</p>
            <p className="metric-label">En attente</p>
          </div>
          <div className="metric-card">
            <Users className="w-8 h-8 text-info mb-3" />
            <p className="metric-value">{submittedCount}</p>
            <p className="metric-label">Soumis</p>
          </div>
          <div className="metric-card">
            <CheckCircle className="w-8 h-8 text-success mb-3" />
            <p className="metric-value">{gradedCount}</p>
            <p className="metric-label">Notés</p>
          </div>
        </div>

        {/* Assignments List */}
        <div className="card-institutional">
          <div className="p-5 border-b border-border">
            <h2 className="font-semibold text-foreground">Liste des travaux</h2>
          </div>
          <div className="divide-y divide-border">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-medium text-foreground">{assignment.title}</p>
                    <Badge variant="lecture">{assignment.courseCode}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{assignment.course}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(assignment.dueDate)}
                    </span>
                    <span>•</span>
                    <span>/{assignment.maxGrade} pts</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={
                      assignment.status === 'pending' ? 'pending' :
                      assignment.status === 'submitted' ? 'info' : 'approved'
                    }
                  >
                    {assignment.status === 'pending' ? 'En cours' :
                     assignment.status === 'submitted' ? 'Soumis' : 'Noté'}
                  </Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteAssignment(assignment.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherAssignments;
