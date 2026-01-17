import React, { useEffect, useMemo, useState } from 'react';
import { StudentLayout } from '@/layouts/StudentLayout';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { studentExamsService, type Exam } from '@/lib/api';

const StudentExams: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await studentExamsService.getAll();
        setExams(data);
      } catch {
        toast({
          title: "Erreur",
          description: "Impossible de charger les examens.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getDaysUntil = (dateString: string) => {
    const exam = new Date(dateString);
    const now = new Date();
    const diff = Math.ceil((exam.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Passé';
    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return 'Demain';
    return `Dans ${diff} jours`;
  };

  const getExamType = (type: string) => {
    switch (type) {
      case 'final': return 'Examen final';
      case 'midterm': return 'Partiel';
      case 'quiz': return 'Contrôle';
      default: return type;
    }
  };

  const { upcomingExams, pastExams } = useMemo(() => {
    const now = new Date();
    const upcoming = exams.filter(e => new Date(e.date) >= now);
    const past = exams.filter(e => new Date(e.date) < now);
    return { upcomingExams: upcoming, pastExams: past };
  }, [exams]);

  return (
    <StudentLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="font-serif text-2xl lg:text-3xl text-foreground mb-2">
            Calendrier des examens
          </h1>
          <p className="text-muted-foreground">
            Consultez vos examens à venir et passés
          </p>
        </div>

        {loading && (
          <div className="card-institutional p-6 text-sm text-muted-foreground">
            Chargement des examens...
          </div>
        )}

        {!loading && (
          <>
            {/* Upcoming Exams */}
            <div>
              <h2 className="font-semibold text-foreground mb-4">Examens à venir</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {upcomingExams.map((exam) => (
                  <div key={exam.id} className="card-institutional p-5 border-l-4 border-l-primary">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant={exam.type === 'final' ? 'destructive' : exam.type === 'midterm' ? 'info' : 'secondary'}>
                        {getExamType(exam.type)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {getDaysUntil(exam.date)}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg text-foreground mb-1">
                      {exam.course}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">{exam.courseCode}</p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(exam.date)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{exam.startTime} - {exam.endTime}</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{exam.room}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {upcomingExams.length === 0 && (
                  <div className="card-institutional p-6 text-sm text-muted-foreground">
                    Aucun examen à venir.
                  </div>
                )}
              </div>
            </div>

            {/* Past Exams */}
            {pastExams.length > 0 && (
              <div>
                <h2 className="font-semibold text-foreground mb-4">Examens passés</h2>
                <div className="card-institutional">
                  <table className="table-institutional">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Cours</th>
                        <th>Type</th>
                        <th>Salle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pastExams.map((exam) => (
                        <tr key={exam.id} className="opacity-60">
                          <td>{formatDate(exam.date)}</td>
                          <td>{exam.course}</td>
                          <td>{getExamType(exam.type)}</td>
                          <td>{exam.room}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentExams;
