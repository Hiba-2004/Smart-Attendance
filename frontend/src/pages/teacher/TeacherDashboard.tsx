import React, { useEffect, useMemo, useState } from "react";
import { TeacherLayout } from "@/layouts/TeacherLayout";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, ClipboardCheck, Bell, QrCode, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { teacherDashboardService, teacherCoursesService, type TeacherCourseItem } from "@/lib/api";

const TeacherDashboard: React.FC = () => {
  const [courses, setCourses] = useState<TeacherCourseItem[]>([]);
  const [stats, setStats] = useState({
    assignedCourses: 0,
    pendingJustifications: 0,
    sessionsThisWeek: 0,
    studentsCount: 0,
  });

  useEffect(() => {
    (async () => {
      try {
        const [s, c] = await Promise.all([
          teacherDashboardService.getStats(),
          teacherCoursesService.list(),
        ]);
        setStats(s);
        setCourses(c);
      } catch (e: any) {
        toast({
          title: "Erreur",
          description: "Impossible de charger le dashboard enseignant.",
          variant: "destructive",
        });
      }
    })();
  }, []);


  return (
    <TeacherLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-serif text-2xl lg:text-3xl text-foreground mb-2">
            Tableau de bord
          </h1>
          <p className="text-muted-foreground">Gestion de vos cours et étudiants</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="metric-card">
            <BookOpen className="w-8 h-8 text-primary mb-3" />
            <p className="metric-value">{stats.assignedCourses}</p>
            <p className="metric-label">Cours assignés</p>
          </div>
          <div className="metric-card">
            <Users className="w-8 h-8 text-info mb-3" />
            <p className="metric-value">{stats.studentsCount}</p>
            <p className="metric-label">Étudiants</p>
          </div>
          <div className="metric-card">
            <ClipboardCheck className="w-8 h-8 text-warning mb-3" />
            <p className="metric-value">{stats.pendingJustifications}</p>
            <p className="metric-label">Justificatifs en attente</p>
          </div>
          <div className="metric-card">
            <Calendar className="w-8 h-8 text-success mb-3" />
            <p className="metric-value">{stats.sessionsThisWeek}</p>
            <p className="metric-label">Cours cette semaine</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card-institutional p-6">
            <div className="flex items-center gap-3 mb-4">
              <QrCode className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Prise de présence</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Générez un QR code ou utilisez la reconnaissance faciale pour enregistrer les présences.
            </p>
            <Link
              to="/teacher/attendance"
              className="inline-flex items-center justify-center h-10 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90"
            >
              Démarrer une session
            </Link>
          </div>

          <div className="card-institutional p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Annonces rapides</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Publiez une annonce pour vos étudiants (annulation, report, événement).
            </p>
            <Link
              to="/teacher/announcements"
              className="inline-flex items-center justify-center h-10 px-4 border border-border text-sm font-medium rounded-md hover:bg-muted"
            >
              Créer une annonce
            </Link>
          </div>
        </div>

        <div className="card-institutional">
          <div className="p-5 border-b border-border">
            <h2 className="font-semibold text-foreground">Mes cours</h2>
          </div>

          <div className="divide-y divide-border">
            {courses.slice(0, 4).map((course) => (
              <div key={course.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{course.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {course.module?.name ?? "—"}
                  </p>
                </div>
                <Badge variant="lecture">{/* on garde ton badge UI */}Support</Badge>
              </div>
            ))}

            {courses.length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Aucun cours pour le moment.
              </div>
            )}
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherDashboard;
