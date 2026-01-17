import React from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { Badge } from '@/components/ui/badge';
import { mockAnnouncements } from '@/lib/mockData';
import ensaHero from "@/assets/ensa-safi-hero.jpg";

import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Calendar,
  ArrowRight,
  Bell,
  Shield,
  Clock,
  ChevronRight,
  FileText,
  CheckCircle2,
  Building2,
  Landmark
} from 'lucide-react';

const HomePage: React.FC = () => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
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

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section
  className="relative text-primary-foreground overflow-hidden bg-cover bg-center"
  style={{
    backgroundImage: `url(${ensaHero})`,
  }}
>
  {/* Dark Overlay for readability */}
  <div className="absolute inset-0 bg-primary/80 backdrop-blur-[1px]" />

  {/* Subtle Pattern Overlay */}
  <div
    className="absolute inset-0 opacity-[0.03]"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    }}
  />
        
        <div className="container-institutional relative">
          <div className="py-24 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                {/* Official Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary-foreground/10 mb-8">
                  <Landmark className="w-4 h-4 text-primary-foreground/70" />
                  <span className="text-xs font-medium uppercase tracking-wider text-primary-foreground/70">
                    Système Officiel de Gestion Académique
                  </span>
                </div>
                
                <h1 className="font-serif text-4xl lg:text-5xl xl:text-[3.5rem] mb-6 leading-[1.15] tracking-tight">
                  École Nationale Des Sciences<br />
                  Appliquées de Safi
                </h1>
                
                <div className="w-16 h-1 bg-accent mb-8" />
                
                <p className="text-lg text-primary-foreground/80 mb-10 leading-relaxed max-w-xl">
                  Portail unifié d'accès aux services de scolarité. 
                  Gestion des emplois du temps, suivi pédagogique, 
                  et administration académique pour l'ensemble de la communauté universitaire.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    to="/login"
                    className="inline-flex items-center justify-center h-12 px-8 font-semibold tracking-wider uppercase text-xs bg-primary-foreground text-primary rounded hover:bg-primary-foreground/95 transition-colors"
                  >
                    Accéder au portail
                    <ArrowRight className="w-4 h-4 ml-3" />
                  </Link>
                  <a 
                    href="#services"
                    className="inline-flex items-center justify-center h-12 px-8 font-medium text-sm text-primary-foreground/80 border border-primary-foreground/30 rounded hover:bg-primary-foreground/10 transition-colors"
                  >
                    Découvrir les services
                  </a>
                </div>
              </div>

              {/* Key Stats */}
              <div className="hidden lg:grid grid-cols-2 gap-6">
                <div className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-lg p-6">
                  <div className="w-10 h-10 rounded bg-primary-foreground/10 flex items-center justify-center mb-4">
                    <GraduationCap className="w-5 h-5 text-primary-foreground/80" />
                  </div>
                  <div className="font-serif text-3xl text-primary-foreground mb-1">2,450</div>
                  <div className="text-xs text-primary-foreground/60 uppercase tracking-wider">Étudiants inscrits</div>
                </div>
                <div className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-lg p-6">
                  <div className="w-10 h-10 rounded bg-primary-foreground/10 flex items-center justify-center mb-4">
                    <Users className="w-5 h-5 text-primary-foreground/80" />
                  </div>
                  <div className="font-serif text-3xl text-primary-foreground mb-1">185</div>
                  <div className="text-xs text-primary-foreground/60 uppercase tracking-wider">Corps enseignant</div>
                </div>
                <div className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-lg p-6">
                  <div className="w-10 h-10 rounded bg-primary-foreground/10 flex items-center justify-center mb-4">
                    <Building2 className="w-5 h-5 text-primary-foreground/80" />
                  </div>
                  <div className="font-serif text-3xl text-primary-foreground mb-1">12</div>
                  <div className="text-xs text-primary-foreground/60 uppercase tracking-wider">Départements</div>
                </div>
                <div className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-lg p-6">
                  <div className="w-10 h-10 rounded bg-primary-foreground/10 flex items-center justify-center mb-4">
                    <BookOpen className="w-5 h-5 text-primary-foreground/80" />
                  </div>
                  <div className="font-serif text-3xl text-primary-foreground mb-1">48</div>
                  <div className="text-xs text-primary-foreground/60 uppercase tracking-wider">Programmes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-card border-b border-border">
        <div className="container-institutional py-6">
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>Accès sécurisé</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>Données protégées</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>Disponible 24h/24</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>Support technique</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="section-spacing bg-background">
        <div className="container-institutional">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Fonctionnalités du système
            </span>
            <h2 className="font-serif text-3xl lg:text-4xl text-foreground mb-4">
              Services Académiques
            </h2>
            <div className="w-12 h-1 bg-accent mx-auto mb-6" />
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Un accès centralisé et sécurisé à l'ensemble des outils de gestion académique 
              pour les étudiants, le corps enseignant et l'administration.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Student Services */}
            <div className="group bg-card border border-border rounded-lg p-8 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/15 transition-colors">
                <GraduationCap className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-serif text-xl text-foreground mb-3">
                Portail Étudiant
              </h3>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                Accédez à votre emploi du temps, consultez vos absences, 
                soumettez vos justificatifs et suivez votre parcours académique.
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground mb-6">
                <li className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Emploi du temps personnalisé</span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Suivi des absences et justifications</span>
                </li>
                <li className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Dépôt de travaux et devoirs</span>
                </li>
                <li className="flex items-start gap-3">
                  <BookOpen className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Consultation des cours et examens</span>
                </li>
              </ul>
              <div className="pt-4 border-t border-border">
                <Link 
                  to="/login" 
                  className="text-sm font-medium text-primary hover:text-primary/80 inline-flex items-center gap-1 transition-colors"
                >
                  Accéder à l'espace
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Teacher Services */}
            <div className="group bg-card border border-border rounded-lg p-8 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/15 transition-colors">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-serif text-xl text-foreground mb-3">
                Portail Enseignant
              </h3>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                Gérez vos séances, prenez les présences, publiez des annonces 
                et assurez le suivi pédagogique de vos étudiants.
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground mb-6">
                <li className="flex items-start gap-3">
                  <Users className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Gestion des présences (QR, Manuel)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Bell className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Publication d'annonces officielles</span>
                </li>
                <li className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Gestion des cours et devoirs</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Validation des justificatifs</span>
                </li>
              </ul>
              <div className="pt-4 border-t border-border">
                <Link 
                  to="/login" 
                  className="text-sm font-medium text-primary hover:text-primary/80 inline-flex items-center gap-1 transition-colors"
                >
                  Accéder à l'espace
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Admin Services */}
            <div className="group bg-card border border-border rounded-lg p-8 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/15 transition-colors">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-serif text-xl text-foreground mb-3">
                Administration
              </h3>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                Supervision globale du système, gestion des utilisateurs, 
                des emplois du temps et du suivi disciplinaire.
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground mb-6">
                <li className="flex items-start gap-3">
                  <Users className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Gestion des comptes utilisateurs</span>
                </li>
                <li className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Administration des emplois du temps</span>
                </li>
                <li className="flex items-start gap-3">
                  <Bell className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Diffusion des annonces officielles</span>
                </li>
                <li className="flex items-start gap-3">
                  <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Tableau de bord disciplinaire</span>
                </li>
              </ul>
              <div className="pt-4 border-t border-border">
                <Link 
                  to="/login" 
                  className="text-sm font-medium text-primary hover:text-primary/80 inline-flex items-center gap-1 transition-colors"
                >
                  Accéder à l'espace
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      <section id="announcements" className="section-spacing bg-muted/30">
        <div className="container-institutional">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Communications officielles
              </span>
              <h2 className="font-serif text-3xl lg:text-4xl text-foreground mb-2">
                Actualités & Annonces
              </h2>
              <div className="w-12 h-1 bg-accent mt-4" />
            </div>
            <a 
              href="#" 
              className="text-sm font-medium text-primary hover:text-primary/80 inline-flex items-center gap-1 transition-colors"
            >
              Voir toutes les annonces
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {mockAnnouncements.slice(0, 3).map((announcement, index) => (
              <article 
                key={announcement.id} 
                className={`bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow ${index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}`}
              >
                <div className={`p-6 ${index === 0 ? 'lg:p-8' : ''}`}>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <Badge variant={getAnnouncementVariant(announcement.type)}>
                      {getAnnouncementLabel(announcement.type)}
                    </Badge>
                    <time className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(announcement.createdAt)}
                    </time>
                  </div>
                  
                  <h3 className={`font-serif text-foreground mb-3 ${index === 0 ? 'text-xl lg:text-2xl' : 'text-lg'}`}>
                    {announcement.title}
                  </h3>
                  
                  <p className={`text-muted-foreground leading-relaxed mb-6 ${index === 0 ? 'text-sm lg:text-base' : 'text-sm'}`}>
                    {announcement.content}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-[10px] font-semibold text-primary">
                          {announcement.author.charAt(0)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {announcement.author}
                      </span>
                    </div>
                    <button className="text-xs font-medium text-primary hover:text-primary/80 inline-flex items-center gap-1 transition-colors">
                      Lire la suite
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="section-spacing bg-secondary/50">
        <div className="container-institutional">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Accès au système
            </span>
            <h2 className="font-serif text-3xl lg:text-4xl text-foreground mb-4">
              Connectez-vous à votre espace
            </h2>
            <div className="w-12 h-1 bg-accent mx-auto mb-6" />
            <p className="text-muted-foreground mb-10 max-w-xl mx-auto">
              Utilisez vos identifiants institutionnels pour accéder à l'ensemble 
              des services de gestion académique. En cas de difficulté, contactez 
              le support technique de l'établissement.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/login"
                className="inline-flex items-center justify-center h-12 px-8 font-semibold tracking-wider uppercase text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
              >
                S'authentifier
                <ArrowRight className="w-4 h-4 ml-3" />
              </Link>
              <a 
                href="#"
                className="inline-flex items-center justify-center h-12 px-8 font-medium text-sm text-muted-foreground border border-border rounded hover:bg-card transition-colors"
              >
                Contacter le support
              </a>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default HomePage;
