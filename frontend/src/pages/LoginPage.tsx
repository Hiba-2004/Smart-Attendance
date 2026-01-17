import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, Loader2, AlertCircle } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(4, 'Le mot de passe doit contenir au moins 4 caractères'),
});

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate inputs
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        const role = result.user.role;
        if (role === 'teacher') navigate('/teacher');
        else if (role === 'admin') navigate('/admin');
        else navigate('/student');
      } else {
        setError((result as { success: false; error?: string }).error || 'Échec de la connexion');
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary text-primary-foreground flex-col justify-between p-12">
        <div>
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <span className="font-serif text-xl">Smart Attendance</span>
            </div>
          </Link>
        </div>
        
        <div className="max-w-md">
          <h1 className="font-serif text-4xl mb-6 leading-tight">
            Plateforme de Gestion Académique
          </h1>
          <p className="text-primary-foreground/70 text-lg leading-relaxed">
            Accès unifié aux services de scolarité de l'École Nationale des Sciences Appliquées de Safi.
          </p>
        </div>
        
        <div className="text-sm text-primary-foreground/50">
          <p>© 2026 École Nationale des Sciences Appliquées de Safi</p>
          <p>Année académique 2025-2026</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-10">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <span className="font-serif text-lg text-foreground">Smart Campus</span>
              </div>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="font-serif text-2xl lg:text-3xl text-foreground mb-2">
              Connexion
            </h2>
            <p className="text-muted-foreground">
              Identifiez-vous avec vos identifiants institutionnels
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-md bg-destructive/10 border border-destructive/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Adresse email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="prenom.nom@uca.ac.ma"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
                disabled={isSubmitting}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12"
                disabled={isSubmitting}
                autoComplete="current-password"
              />
            </div>

            <Button 
              type="submit" 
              variant="institutional"
              className="w-full h-12"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              En cas de problème de connexion, veuillez contacter le service informatique.
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 rounded-md bg-muted border border-border">
            <p className="text-xs font-medium text-foreground mb-2">Comptes de test :</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• <strong>Étudiant :</strong> student1@ensa.test / password</li>
              <li>• <strong>Enseignant :</strong> teacher@ensa.test / password</li>
              <li>• <strong>Admin :</strong> admin@ensa.test / password</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
