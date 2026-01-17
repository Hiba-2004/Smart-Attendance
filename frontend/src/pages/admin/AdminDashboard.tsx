import React from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { mockDisciplinaryAlerts } from '@/lib/mockData';
import { Users, UserCog, Shield, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-serif text-2xl lg:text-3xl text-foreground mb-2">Console d'administration</h1>
          <p className="text-muted-foreground">Vue d'ensemble de la plateforme</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="metric-card">
            <Users className="w-8 h-8 text-primary mb-3" />
            <p className="metric-value">1,247</p>
            <p className="metric-label">Étudiants</p>
          </div>
          <div className="metric-card">
            <UserCog className="w-8 h-8 text-info mb-3" />
            <p className="metric-value">86</p>
            <p className="metric-label">Enseignants</p>
          </div>
          <div className="metric-card">
            <Shield className="w-8 h-8 text-success mb-3" />
            <p className="metric-value">12</p>
            <p className="metric-label">Administrateurs</p>
          </div>
          <div className="metric-card">
            <AlertTriangle className="w-8 h-8 text-destructive mb-3" />
            <p className="metric-value">{mockDisciplinaryAlerts.length}</p>
            <p className="metric-label">Alertes disciplinaires</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card-institutional">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Alertes disciplinaires
              </h2>
              <Link to="/admin/disciplinary" className="text-xs text-primary hover:underline">Voir tout</Link>
            </div>
            <div className="divide-y divide-border">
              {mockDisciplinaryAlerts.map((alert, i) => (
                <div key={i} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{alert.student.firstName} {alert.student.lastName}</p>
                    <p className="text-sm text-muted-foreground">{alert.student.studentId}</p>
                  </div>
                  <Badge variant="destructive">{alert.absenceCount} absences</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="card-institutional p-6">
            <h2 className="font-semibold text-foreground mb-4">Actions rapides</h2>
            <div className="space-y-3">
              <Link to="/admin/students" className="block p-3 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                <p className="font-medium text-foreground">Gérer les étudiants</p>
                <p className="text-sm text-muted-foreground">Ajouter, modifier ou supprimer</p>
              </Link>
              <Link to="/admin/announcements" className="block p-3 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                <p className="font-medium text-foreground">Publier une annonce</p>
                <p className="text-sm text-muted-foreground">Communication institutionnelle</p>
              </Link>
              <Link to="/admin/timetables" className="block p-3 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                <p className="font-medium text-foreground">Emplois du temps</p>
                <p className="text-sm text-muted-foreground">Gestion des plannings</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
