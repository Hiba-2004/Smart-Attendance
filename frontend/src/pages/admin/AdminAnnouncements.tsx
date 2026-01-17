import React, { useState } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
import { mockAnnouncements, mockPrograms } from '@/lib/mockData';
import { 
  Bell, 
  Plus, 
  Edit2, 
  Trash2, 
  Filter,
  Users,
  UserCog,
  GraduationCap,
  Megaphone
} from 'lucide-react';
import type { Announcement } from '@/lib/api';

const AdminAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general',
    targetAudience: [] as string[],
    targetPrograms: [] as string[],
  });

  const handleToggleAudience = (audience: string) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: prev.targetAudience.includes(audience)
        ? prev.targetAudience.filter(a => a !== audience)
        : [...prev.targetAudience, audience]
    }));
  };

  const handleToggleProgram = (program: string) => {
    setFormData(prev => ({
      ...prev,
      targetPrograms: prev.targetPrograms.includes(program)
        ? prev.targetPrograms.filter(p => p !== program)
        : [...prev.targetPrograms, program]
    }));
  };

  const handleCreateAnnouncement = () => {
    const newAnnouncement: Announcement = {
      id: announcements.length + 1,
      title: formData.title,
      content: formData.content,
      type: formData.type as 'urgent' | 'academic' | 'event' | 'general',
      createdAt: new Date().toISOString(),
      author: 'Administration',
    };
    setAnnouncements([newAnnouncement, ...announcements]);
    setIsCreateOpen(false);
    setFormData({ title: '', content: '', type: 'general', targetAudience: [], targetPrograms: [] });
  };

  const handleDeleteAnnouncement = (id: number) => {
    setAnnouncements(announcements.filter(a => a.id !== id));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAnnouncementVariant = (type: string) => {
    switch (type) {
      case 'urgent': return 'urgent';
      case 'academic': return 'academic';
      case 'event': return 'event';
      default: return 'general';
    }
  };

  const getAnnouncementLabel = (type: string) => {
    switch (type) {
      case 'urgent': return 'Urgent';
      case 'academic': return 'Académique';
      case 'event': return 'Événement';
      default: return 'Information';
    }
  };

  const filteredAnnouncements = filter === 'all' 
    ? announcements 
    : announcements.filter(a => a.type === filter);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl lg:text-3xl text-foreground mb-2">Gestion des annonces</h1>
            <p className="text-muted-foreground">Communication institutionnelle</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle annonce
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Créer une annonce institutionnelle</DialogTitle>
                <DialogDescription>
                  Cette annonce sera visible par les destinataires sélectionnés
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="title">Titre de l'annonce</Label>
                  <Input 
                    id="title"
                    className="mt-1"
                    placeholder="Titre de l'annonce"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="content">Contenu</Label>
                  <Textarea 
                    id="content"
                    className="mt-1"
                    placeholder="Contenu de l'annonce..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={5}
                  />
                </div>

                <div>
                  <Label>Type d'annonce</Label>
                  <Select 
                    value={formData.type}
                    onValueChange={(v) => setFormData({ ...formData, type: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Information générale</SelectItem>
                      <SelectItem value="academic">Académique</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="event">Événement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-3 block">Destinataires</Label>
                  <div className="flex gap-4 border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="students"
                        checked={formData.targetAudience.includes('students')}
                        onCheckedChange={() => handleToggleAudience('students')}
                      />
                      <Label htmlFor="students" className="text-sm font-normal cursor-pointer flex items-center gap-1">
                        <GraduationCap className="w-4 h-4" />
                        Étudiants
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="teachers"
                        checked={formData.targetAudience.includes('teachers')}
                        onCheckedChange={() => handleToggleAudience('teachers')}
                      />
                      <Label htmlFor="teachers" className="text-sm font-normal cursor-pointer flex items-center gap-1">
                        <UserCog className="w-4 h-4" />
                        Enseignants
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="all"
                        checked={formData.targetAudience.includes('all')}
                        onCheckedChange={() => handleToggleAudience('all')}
                      />
                      <Label htmlFor="all" className="text-sm font-normal cursor-pointer flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Tous
                      </Label>
                    </div>
                  </div>
                </div>

                {formData.targetAudience.includes('students') && (
                  <div>
                    <Label className="mb-3 block">Filières concernées (optionnel)</Label>
                    <div className="flex flex-wrap gap-2 border border-border rounded-lg p-4">
                      {mockPrograms.map((program) => (
                        <div key={program.id} className="flex items-center gap-2">
                          <Checkbox 
                            id={program.code}
                            checked={formData.targetPrograms.includes(program.code)}
                            onCheckedChange={() => handleToggleProgram(program.code)}
                          />
                          <Label htmlFor={program.code} className="text-sm font-normal cursor-pointer">
                            {program.code}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateAnnouncement}>
                  Publier l'annonce
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="metric-card">
            <Megaphone className="w-8 h-8 text-primary mb-3" />
            <p className="metric-value">{announcements.length}</p>
            <p className="metric-label">Total</p>
          </div>
          <div className="metric-card">
            <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center mb-3">
              <div className="w-3 h-3 rounded-full bg-destructive" />
            </div>
            <p className="metric-value">{announcements.filter(a => a.type === 'urgent').length}</p>
            <p className="metric-label">Urgentes</p>
          </div>
          <div className="metric-card">
            <div className="w-8 h-8 rounded-full bg-info/20 flex items-center justify-center mb-3">
              <div className="w-3 h-3 rounded-full bg-info" />
            </div>
            <p className="metric-value">{announcements.filter(a => a.type === 'academic').length}</p>
            <p className="metric-label">Académiques</p>
          </div>
          <div className="metric-card">
            <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center mb-3">
              <div className="w-3 h-3 rounded-full bg-success" />
            </div>
            <p className="metric-value">{announcements.filter(a => a.type === 'event').length}</p>
            <p className="metric-label">Événements</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('all')}
          >
            Toutes
          </Button>
          <Button 
            variant={filter === 'urgent' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('urgent')}
          >
            Urgentes
          </Button>
          <Button 
            variant={filter === 'academic' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('academic')}
          >
            Académiques
          </Button>
          <Button 
            variant={filter === 'event' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('event')}
          >
            Événements
          </Button>
          <Button 
            variant={filter === 'general' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('general')}
          >
            Générales
          </Button>
        </div>

        {/* Announcements List */}
        <div className="space-y-4">
          {filteredAnnouncements.length === 0 ? (
            <div className="card-institutional p-8 text-center">
              <Bell className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune annonce</p>
            </div>
          ) : (
            filteredAnnouncements.map((announcement) => (
              <div key={announcement.id} className="card-institutional p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant={getAnnouncementVariant(announcement.type)}>
                        {getAnnouncementLabel(announcement.type)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(announcement.createdAt)}
                      </span>
                    </div>
                    <h3 className="font-medium text-foreground mb-2">{announcement.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{announcement.content}</p>
                    <p className="text-xs text-muted-foreground mt-3">Publié par : {announcement.author}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnnouncements;
