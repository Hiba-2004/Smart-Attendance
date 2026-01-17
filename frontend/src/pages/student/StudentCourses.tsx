import React, { useEffect, useMemo, useState } from 'react';
import { StudentLayout } from '@/layouts/StudentLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Clock, Download, FileText, Video, File } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { studentCoursesService, type Course } from '@/lib/api';

// Mock course materials (kept as-is to preserve UI)
// Later we can connect these to backend files list per course.
const courseMaterials: Record<string, { name: string; type: 'pdf' | 'video' | 'doc'; size: string }[]> = {
  'INF-401': [
    { name: 'Cours 1 - Introduction aux systèmes distribués.pdf', type: 'pdf', size: '2.4 MB' },
    { name: 'TD1 - Exercices fondamentaux.pdf', type: 'pdf', size: '890 KB' },
    { name: 'TP1 - Configuration RPC.pdf', type: 'pdf', size: '1.2 MB' },
  ],
  'INF-302': [
    { name: 'Chapitre 1 - Optimisation des requêtes.pdf', type: 'pdf', size: '3.1 MB' },
    { name: 'Vidéo - Indexation avancée.mp4', type: 'video', size: '156 MB' },
  ],
  'MAT-205': [
    { name: 'Cours complet - Analyse Numérique.pdf', type: 'pdf', size: '5.8 MB' },
    { name: 'Formulaire.pdf', type: 'pdf', size: '420 KB' },
  ],
  'INF-305': [
    { name: 'Slides - Protocoles TCP/IP.pdf', type: 'pdf', size: '4.2 MB' },
    { name: 'Lab Guide - Wireshark.pdf', type: 'pdf', size: '1.8 MB' },
  ],
  'INF-410': [
    { name: "Introduction à l'IA.pdf", type: 'pdf', size: '2.9 MB' },
    { name: 'TP - Réseaux de neurones.pdf', type: 'pdf', size: '1.5 MB' },
    { name: 'Dataset - Exercice.zip', type: 'doc', size: '45 MB' },
  ],
  'COM-201': [
    { name: 'Guide de présentation.pdf', type: 'pdf', size: '1.1 MB' },
  ],
};

const StudentCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await studentCoursesService.getAll();
        setCourses(data);
      } catch {
        toast({
          title: "Erreur",
          description: "Impossible de charger les cours depuis le serveur.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalCredits = useMemo(
    () => courses.reduce((sum, c) => sum + (Number(c.credits) || 0), 0),
    [courses]
  );

  const handleDownload = async (courseId: number, courseName: string, fileName: string) => {
    try {
      toast({
        title: "Téléchargement démarré",
        description: `${fileName} est en cours de téléchargement.`,
      });

      const blob = await studentCoursesService.downloadCourseFile(courseId);
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || `${courseName}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch {
      toast({
        title: "Erreur",
        description: "Téléchargement impossible.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadAll = (courseCode: string, courseName: string) => {
    const materials = courseMaterials[courseCode];
    if (materials && materials.length > 0) {
      toast({
        title: "Téléchargement du pack complet",
        description: `Tous les supports de ${courseName} sont en cours de téléchargement.`,
      });
      // Later: connect backend endpoint for downloading a zip pack of course resources.
    }
  };

  const getFileIcon = (type: 'pdf' | 'video' | 'doc') => {
    switch (type) {
      case 'pdf': return <FileText className="w-4 h-4 text-destructive" />;
      case 'video': return <Video className="w-4 h-4 text-info" />;
      default: return <File className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <StudentLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="font-serif text-2xl lg:text-3xl text-foreground mb-2">
            Mes cours
          </h1>
          <p className="text-muted-foreground">
            Semestre 7 — Génie Informatique
          </p>
        </div>

        {/* Loading state (keeps style intact) */}
        {loading && (
          <div className="card-institutional p-6 text-sm text-muted-foreground">
            Chargement des cours...
          </div>
        )}

        {/* Course Cards */}
        {!loading && (
          <div className="space-y-6">
            {courses.map((course) => {
              const materials = courseMaterials[course.code] || [];

              return (
                <div key={course.id} className="card-institutional overflow-hidden">
                  {/* Course Header */}
                  <div className="p-5 border-b border-border bg-muted/20">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                            {course.code}
                          </p>
                          <h3 className="font-serif text-lg text-foreground">
                            {course.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Users className="w-4 h-4" />
                              {course.teacher}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              {course.credits} ECTS
                            </span>
                          </div>
                        </div>
                      </div>

                      {materials.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadAll(course.code, course.name)}
                          className="flex-shrink-0"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Tout télécharger
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Course Materials */}
                  <div className="p-5">
                    {materials.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                          Supports de cours ({materials.length})
                        </p>
                        <div className="space-y-2">
                          {materials.map((material, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors group"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {getFileIcon(material.type)}
                                <span className="text-sm text-foreground truncate">
                                  {material.name}
                                </span>
                                <Badge variant="secondary" className="text-[10px] flex-shrink-0">
                                  {material.size}
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                onClick={() => handleDownload(course.id, course.name, material.name)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Aucun support disponible pour ce cours
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {!loading && (
          <div className="card-institutional p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total des crédits</p>
                <p className="text-2xl font-serif text-foreground">
                  {totalCredits} ECTS
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nombre de modules</p>
                <p className="text-2xl font-serif text-foreground">
                  {courses.length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentCourses;
