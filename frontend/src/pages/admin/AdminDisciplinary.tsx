import React, { useState } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
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
} from '@/components/ui/dialog';
import { mockDisciplinaryAlerts } from '@/lib/mockData';
import { toast } from '@/hooks/use-toast';
import { exportToPDF, exportToExcel } from '@/lib/exportUtils';
import { 
  AlertTriangle, 
  Mail, 
  Check, 
  Clock,
  User,
  Calendar,
  FileText,
  Send,
  Eye,
  RefreshCw,
  Download
} from 'lucide-react';

const AdminDisciplinary: React.FC = () => {
  const [alerts, setAlerts] = useState(mockDisciplinaryAlerts);
  const [selectedAlert, setSelectedAlert] = useState<typeof mockDisciplinaryAlerts[0] | null>(null);
  const [isConvocationOpen, setIsConvocationOpen] = useState(false);
  
  const [emailContent, setEmailContent] = useState({
    subject: '',
    body: '',
    convocationDate: '',
    convocationTime: '',
  });

  const handleOpenConvocation = (alert: typeof mockDisciplinaryAlerts[0]) => {
    setSelectedAlert(alert);
    setEmailContent({
      subject: `Convocation disciplinaire - ${alert.student.firstName} ${alert.student.lastName}`,
      body: `Madame, Monsieur ${alert.student.lastName},

Suite à vos ${alert.absenceCount} absences non justifiées constatées au cours du semestre en cours, vous êtes convoqué(e) devant le conseil de discipline de l'établissement.

Nous vous prions de bien vouloir vous présenter à la date et heure indiquées ci-dessous, muni(e) de votre carte d'étudiant ainsi que de tout document justificatif que vous souhaiteriez présenter.

L'absence à cette convocation pourra entraîner des sanctions disciplinaires supplémentaires.

Veuillez agréer, Madame, Monsieur, l'expression de nos salutations distinguées.

La Direction`,
      convocationDate: '',
      convocationTime: '10:00',
    });
    setIsConvocationOpen(true);
  };

  const handleSendConvocation = () => {
    if (!selectedAlert) return;
    
    if (!emailContent.convocationDate || !emailContent.subject) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires.',
        variant: 'destructive',
      });
      return;
    }
    
    setAlerts(alerts.map(a => 
      a.id === selectedAlert.id 
        ? { ...a, convocationSent: true, convocationDate: emailContent.convocationDate }
        : a
    ));
    
    toast({
      title: 'Convocation envoyée',
      description: `Email envoyé à ${selectedAlert.student.email}`,
    });
    
    setIsConvocationOpen(false);
    setSelectedAlert(null);
  };

  const handleExportPDF = () => {
    exportToPDF({
      filename: 'alertes-disciplinaires',
      title: 'Alertes Disciplinaires',
      headers: ['Étudiant', 'ID', 'Filière', 'Absences', 'Statut'],
      data: alerts.map(a => ({
        'Étudiant': `${a.student.firstName} ${a.student.lastName}`,
        'id': a.student.studentId,
        'filière': a.student.program,
        'absences': a.absenceCount,
        'statut': a.convocationSent ? 'Convoqué' : 'En attente',
      })),
    });
  };

  const handleExportExcel = () => {
    exportToExcel({
      filename: 'alertes-disciplinaires',
      headers: ['Étudiant', 'ID', 'Filière', 'Absences', 'Statut'],
      data: alerts.map(a => ({
        'Étudiant': `${a.student.firstName} ${a.student.lastName}`,
        'id': a.student.studentId,
        'filière': a.student.program,
        'absences': a.absenceCount,
        'statut': a.convocationSent ? 'Convoqué' : 'En attente',
      })),
    });
  };

  const pendingConvocations = alerts.filter(a => !a.convocationSent).length;
  const sentConvocations = alerts.filter(a => a.convocationSent).length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl lg:text-3xl text-foreground mb-2">Gestion disciplinaire</h1>
            <p className="text-muted-foreground">
              Suivi des étudiants dépassant le seuil de 6 absences non justifiées
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportExcel}>
              <Download className="w-4 h-4 mr-2" />
              Excel
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>

        {/* Alert Banner */}
        {pendingConvocations > 0 && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-center gap-4">
            <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-foreground">
                {pendingConvocations} étudiant{pendingConvocations > 1 ? 's' : ''} en attente de convocation
              </p>
              <p className="text-sm text-muted-foreground">
                Ces étudiants ont dépassé le seuil de 6 absences non justifiées et doivent être convoqués.
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="metric-card">
            <AlertTriangle className="w-8 h-8 text-destructive mb-3" />
            <p className="metric-value">{alerts.length}</p>
            <p className="metric-label">Total alertes</p>
          </div>
          <div className="metric-card">
            <Clock className="w-8 h-8 text-warning mb-3" />
            <p className="metric-value">{pendingConvocations}</p>
            <p className="metric-label">En attente</p>
          </div>
          <div className="metric-card">
            <Check className="w-8 h-8 text-success mb-3" />
            <p className="metric-value">{sentConvocations}</p>
            <p className="metric-label">Convoqués</p>
          </div>
        </div>

        {/* Detection Rule */}
        <div className="card-institutional p-4 bg-muted/20">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Détection automatique activée</p>
              <p className="text-sm text-muted-foreground">
                Les étudiants dépassant 6 absences non justifiées sont automatiquement signalés pour convocation.
              </p>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="card-institutional">
          <div className="p-5 border-b border-border">
            <h2 className="font-semibold text-foreground">Étudiants en infraction</h2>
          </div>
          <div className="divide-y divide-border">
            {alerts.length === 0 ? (
              <div className="p-8 text-center">
                <Check className="w-12 h-12 text-success mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun étudiant en infraction</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-destructive" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-medium text-foreground">
                            {alert.student.firstName} {alert.student.lastName}
                          </h3>
                          <Badge variant="destructive">{alert.absenceCount} absences</Badge>
                          {alert.convocationSent ? (
                            <Badge variant="approved">Convoqué</Badge>
                          ) : (
                            <Badge variant="pending">En attente</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {alert.student.studentId} • {alert.student.program}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {alert.student.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Dernière absence : {formatDate(alert.lastAbsence)}
                          </span>
                        </div>
                        {alert.convocationSent && alert.convocationDate && (
                          <p className="text-sm text-success mt-2 flex items-center gap-1">
                            <Check className="w-4 h-4" />
                            Convocation envoyée pour le {formatDate(alert.convocationDate)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Détails
                      </Button>
                      {!alert.convocationSent ? (
                        <Button 
                          size="sm"
                          onClick={() => handleOpenConvocation(alert)}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Convoquer
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 mr-2" />
                          Voir convocation
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Convocation Dialog */}
        <Dialog open={isConvocationOpen} onOpenChange={setIsConvocationOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Envoyer une convocation disciplinaire</DialogTitle>
              <DialogDescription>
                {selectedAlert && (
                  <>À {selectedAlert.student.firstName} {selectedAlert.student.lastName} ({selectedAlert.student.email})</>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="subject">Objet du mail</Label>
                <Input 
                  id="subject"
                  className="mt-1"
                  value={emailContent.subject}
                  onChange={(e) => setEmailContent({ ...emailContent, subject: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="convocationDate">Date de convocation</Label>
                  <Input 
                    id="convocationDate"
                    type="date"
                    className="mt-1"
                    value={emailContent.convocationDate}
                    onChange={(e) => setEmailContent({ ...emailContent, convocationDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="convocationTime">Heure</Label>
                  <Input 
                    id="convocationTime"
                    type="time"
                    className="mt-1"
                    value={emailContent.convocationTime}
                    onChange={(e) => setEmailContent({ ...emailContent, convocationTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="body">Corps du message</Label>
                <Textarea 
                  id="body"
                  className="mt-1 font-mono text-sm"
                  value={emailContent.body}
                  onChange={(e) => setEmailContent({ ...emailContent, body: e.target.value })}
                  rows={12}
                />
              </div>

              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-2">Informations automatiques ajoutées :</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Date et heure de convocation</li>
                  <li>• Lieu : Bureau de la Direction, Bâtiment A</li>
                  <li>• En-tête officiel de l'établissement</li>
                  <li>• Copie au responsable de filière</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConvocationOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSendConvocation}>
                <Send className="w-4 h-4 mr-2" />
                Envoyer la convocation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminDisciplinary;
