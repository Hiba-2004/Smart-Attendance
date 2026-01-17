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
import { mockTimetable, mockCourses, mockPrograms, mockTeachersList } from '@/lib/mockData';
import { 
  Calendar, 
  Plus, 
  Edit2, 
  Trash2, 
  Clock,
  MapPin,
  Download,
  Upload
} from 'lucide-react';

const rooms = ['Amphi A', 'Amphi B', 'Amphi C', 'Salle 201', 'Salle 202', 'Salle 301', 'Lab 1', 'Lab 2', 'Lab 3'];
const days = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
];

const AdminTimetables: React.FC = () => {
  const [entries, setEntries] = useState(mockTimetable);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<string>('GI');
  const [selectedYear, setSelectedYear] = useState<string>('3');

  const [formData, setFormData] = useState({
    day: '',
    startTime: '',
    endTime: '',
    courseCode: '',
    room: '',
    type: 'lecture',
    teacher: '',
  });

  const handleCreateEntry = () => {
    const course = mockCourses.find(c => c.code === formData.courseCode);
    const newEntry: typeof entries[0] = {
      id: entries.length + 1,
      day: formData.day as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday',
      startTime: formData.startTime,
      endTime: formData.endTime,
      course: course?.name || '',
      courseCode: formData.courseCode,
      room: formData.room,
      type: formData.type as 'lecture' | 'tutorial' | 'lab',
      teacher: formData.teacher,
    };
    setEntries([...entries, newEntry]);
    setIsCreateOpen(false);
    setFormData({ day: '', startTime: '', endTime: '', courseCode: '', room: '', type: 'lecture', teacher: '' });
  };

  const handleDeleteEntry = (id: number) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const getEntriesForDay = (dayKey: string) => {
    return entries.filter(entry => entry.day === dayKey).sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'lecture': return 'lecture';
      case 'tutorial': return 'tutorial';
      case 'lab': return 'lab';
      default: return 'secondary';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'lecture': return 'Cours';
      case 'tutorial': return 'TD';
      case 'lab': return 'TP';
      default: return type;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl lg:text-3xl text-foreground mb-2">Gestion des emplois du temps</h1>
            <p className="text-muted-foreground">Configuration des plannings par filière et année</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Importer
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une séance
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Ajouter une séance</DialogTitle>
                  <DialogDescription>
                    Créez une nouvelle entrée dans l'emploi du temps
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Jour</Label>
                      <Select 
                        value={formData.day}
                        onValueChange={(v) => setFormData({ ...formData, day: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {days.map((day) => (
                            <SelectItem key={day.key} value={day.key}>
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select 
                        value={formData.type}
                        onValueChange={(v) => setFormData({ ...formData, type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lecture">Cours magistral</SelectItem>
                          <SelectItem value="tutorial">TD</SelectItem>
                          <SelectItem value="lab">TP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Heure de début</Label>
                      <Input 
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Heure de fin</Label>
                      <Input 
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Cours</Label>
                    <Select 
                      value={formData.courseCode}
                      onValueChange={(v) => setFormData({ ...formData, courseCode: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un cours" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockCourses.map((course) => (
                          <SelectItem key={course.id} value={course.code}>
                            {course.code} - {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Salle</Label>
                      <Select 
                        value={formData.room}
                        onValueChange={(v) => setFormData({ ...formData, room: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {rooms.map((room) => (
                            <SelectItem key={room} value={room}>
                              {room}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Enseignant</Label>
                      <Select 
                        value={formData.teacher}
                        onValueChange={(v) => setFormData({ ...formData, teacher: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockTeachersList.map((teacher) => (
                            <SelectItem key={teacher.id} value={`Prof. ${teacher.lastName}`}>
                              Prof. {teacher.lastName}
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
                  <Button onClick={handleCreateEntry}>
                    Ajouter la séance
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Program/Year Selection */}
        <div className="card-institutional p-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <Label className="mb-2 block">Filière</Label>
              <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockPrograms.map((program) => (
                    <SelectItem key={program.id} value={program.code}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block">Année</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[150px]">
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

        {/* Timetable Grid */}
        <div className="card-institutional overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">
                {mockPrograms.find(p => p.code === selectedProgram)?.name} - {selectedYear}ème année
              </span>
            </div>
            <span className="text-sm text-muted-foreground">Semestre de printemps 2024-2025</span>
          </div>

          <div className="grid lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-border">
            {days.map((day) => (
              <div key={day.key} className="min-h-[400px]">
                <div className="p-3 bg-muted/30 border-b border-border">
                  <span className="font-medium text-sm text-foreground">{day.label}</span>
                </div>
                <div className="p-2 space-y-2">
                  {getEntriesForDay(day.key).length === 0 ? (
                    <p className="text-xs text-muted-foreground p-2 text-center">Aucune séance</p>
                  ) : (
                    getEntriesForDay(day.key).map((entry) => (
                      <div 
                        key={entry.id} 
                        className="p-3 rounded-md bg-card border border-border hover:shadow-sm transition-shadow group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant={getTypeVariant(entry.type)}>
                            {getTypeLabel(entry.type)}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                            onClick={() => handleDeleteEntry(entry.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="font-medium text-sm text-foreground mb-1">{entry.course}</p>
                        <p className="text-xs text-muted-foreground mb-2">{entry.courseCode}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Clock className="w-3 h-3" />
                          {entry.startTime} - {entry.endTime}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <MapPin className="w-3 h-3" />
                          {entry.room}
                        </div>
                        <p className="text-xs text-muted-foreground">{entry.teacher}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="metric-card">
            <p className="metric-value">{entries.filter(e => e.type === 'lecture').length}</p>
            <p className="metric-label">Cours magistraux</p>
          </div>
          <div className="metric-card">
            <p className="metric-value">{entries.filter(e => e.type === 'tutorial').length}</p>
            <p className="metric-label">TD</p>
          </div>
          <div className="metric-card">
            <p className="metric-value">{entries.filter(e => e.type === 'lab').length}</p>
            <p className="metric-label">TP</p>
          </div>
          <div className="metric-card">
            <p className="metric-value">{entries.length}</p>
            <p className="metric-label">Total séances</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminTimetables;
