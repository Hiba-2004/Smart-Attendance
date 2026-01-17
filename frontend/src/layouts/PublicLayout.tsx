import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Bar - Official Institutional Strip */}
      <div className="bg-primary text-primary-foreground">
        <div className="container-institutional">
          <div className="flex items-center justify-between h-8 text-xs">
            <div className="flex items-center gap-6">
              <span className="text-primary-foreground/70">
                Ministère de l'Enseignement Supérieur
              </span>
              <span className="hidden sm:inline text-primary-foreground/40">|</span>
              <span className="hidden sm:inline text-primary-foreground/70">
                Royaume Du MAROC
              </span>
            </div>
            <div className="hidden md:flex items-center gap-4 text-primary-foreground/70">
              <a href="#" className="hover:text-primary-foreground transition-colors">
                Portail Étudiant
              </a>
              <span className="text-primary-foreground/40">|</span>
              <a href="#" className="hover:text-primary-foreground transition-colors">
                Webmail
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container-institutional">
          <div className="flex items-center justify-between py-4">
            <Link to="/" className="flex items-center gap-4">
              <div className="w-14 h-14 rounded bg-primary flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl text-foreground leading-tight">
                  École Nationale des Sciences Appliquées de Safi
                </span>
                <span className="text-xs text-muted-foreground tracking-wide uppercase">
                  Système de Gestion Académique
                </span>
              </div>
            </Link>
            
            <div className="flex items-center gap-6">
              <nav className="hidden lg:flex items-center gap-8">
                <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  Accueil
                </Link>
                <a href="#services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Services
                </a>
                <a href="#announcements" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Actualités
                </a>
                <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </a>
              </nav>

              <div className="h-8 w-px bg-border hidden lg:block" />

              <Link 
                to="/login" 
                className="inline-flex items-center justify-center h-10 px-6 text-xs font-semibold tracking-wider uppercase bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
              >
                Authentification
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground">
        {/* Main Footer Content */}
        <div className="container-institutional py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">
            {/* Institution Info */}
            <div className="lg:col-span-5">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded bg-primary-foreground/10 flex items-center justify-center">
                  <GraduationCap className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-serif text-lg leading-tight">École Nationale des Sciences Appliquées de Safi</h3>
                  <p className="text-xs text-primary-foreground/60 uppercase tracking-wide">Établissement Public</p>
                </div>
              </div>
              <p className="text-sm text-primary-foreground/70 leading-relaxed mb-6 max-w-sm">
                Système officiel de gestion académique. Accès sécurisé aux services de scolarité, 
                suivi pédagogique et administration pour l'ensemble de la communauté universitaire.
              </p>
              <div className="space-y-2 text-sm text-primary-foreground/70">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-primary-foreground/50" />
                  <span>Ecole Nationale des Sciences Appliquées de Safi, MAROC</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-primary-foreground/50" />
                  <span>+213 (0) 21 XX XX XX</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-primary-foreground/50" />
                  <span>contact@esi.TEST</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2">
              <h4 className="font-semibold text-xs uppercase tracking-wider mb-5 text-primary-foreground/90">
                Accès Rapide
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    Accueil
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    Authentification
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    Calendrier Académique
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    Support Technique
                  </a>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div className="lg:col-span-2">
              <h4 className="font-semibold text-xs uppercase tracking-wider mb-5 text-primary-foreground/90">
                Services
              </h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    Espace Étudiant
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    Espace Enseignant
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    Scolarité
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    Bibliothèque
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="lg:col-span-3">
              <h4 className="font-semibold text-xs uppercase tracking-wider mb-5 text-primary-foreground/90">
                Informations Légales
              </h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors inline-flex items-center gap-1">
                    Mentions Légales
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors inline-flex items-center gap-1">
                    Protection des Données Personnelles
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors inline-flex items-center gap-1">
                    Conditions Générales d'Utilisation
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors inline-flex items-center gap-1">
                    Accessibilité
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors inline-flex items-center gap-1">
                    Plan du Site
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/10">
          <div className="container-institutional">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 py-6">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs text-primary-foreground/50">
                <span>© {currentYear} École Nationale Des Sciences Appliquées de Safi</span>
                <span className="hidden sm:inline">—</span>
                <span>Tous droits réservés</span>
              </div>
              <div className="flex items-center gap-6 text-xs text-primary-foreground/50">
                <span>Année universitaire 2025–2026</span>
                <span className="text-primary-foreground/30">|</span>
                <span>Version 2.1.0</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
