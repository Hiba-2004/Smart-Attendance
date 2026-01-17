import React from 'react';
import { TeacherLayout } from '@/layouts/TeacherLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockTimetable } from '@/lib/mockData';
import { Calendar, Clock, MapPin, Printer, Download } from 'lucide-react';

const TeacherTimetable: React.FC = () => {
  const days = [
    { key: 'monday', label: 'Lundi' },
    { key: 'tuesday', label: 'Mardi' },
    { key: 'wednesday', label: 'Mercredi' },
    { key: 'thursday', label: 'Jeudi' },
    { key: 'friday', label: 'Vendredi' },
  ];

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

  const getEntriesForDay = (dayKey: string) => {
    return mockTimetable.filter(entry => entry.day === dayKey).sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  return (
    <TeacherLayout>
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl lg:text-3xl text-foreground mb-2">Emploi du temps</h1>
            <p className="text-muted-foreground">Semestre de printemps 2024-2025</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-2" />
              Imprimer
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exporter PDF
            </Button>
          </div>
        </div>

        <div className="card-institutional">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">Semaine du 30 décembre 2024</span>
          </div>

          <div className="grid lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-border">
            {days.map((day) => (
              <div key={day.key} className="min-h-[300px]">
                <div className="p-3 bg-muted/30 border-b border-border">
                  <span className="font-medium text-sm text-foreground">{day.label}</span>
                </div>
                <div className="p-2 space-y-2">
                  {getEntriesForDay(day.key).length === 0 ? (
                    <p className="text-xs text-muted-foreground p-2 text-center">Aucun cours</p>
                  ) : (
                    getEntriesForDay(day.key).map((entry) => (
                      <div 
                        key={entry.id} 
                        className="p-3 rounded-md bg-card border border-border hover:shadow-sm transition-shadow"
                      >
                        <Badge variant={getTypeVariant(entry.type)} className="mb-2">
                          {getTypeLabel(entry.type)}
                        </Badge>
                        <p className="font-medium text-sm text-foreground mb-1">{entry.course}</p>
                        <p className="text-xs text-muted-foreground mb-2">{entry.courseCode}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Clock className="w-3 h-3" />
                          {entry.startTime} - {entry.endTime}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {entry.room}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherTimetable;
