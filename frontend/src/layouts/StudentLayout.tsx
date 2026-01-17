import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Calendar, 
  ClipboardList, 
  User, 
  BookOpen, 
  FileText, 
  Clock,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StudentLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: '/student', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/student/timetable', label: 'Emploi du temps', icon: Calendar },
  { href: '/student/absences', label: 'Absences', icon: ClipboardList },
  { href: '/student/courses', label: 'Mes cours', icon: BookOpen },
  { href: '/student/assignments', label: 'Travaux', icon: FileText },
  { href: '/student/exams', label: 'Examens', icon: Clock },
  { href: '/student/profile', label: 'Mon profil', icon: User },
];

export const StudentLayout: React.FC<StudentLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transform transition-transform duration-200 lg:translate-x-0 lg:static",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-sidebar-border">
            <Link to="/student" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-sidebar-primary flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-sidebar-primary-foreground" />
              </div>
              <div>
                <span className="font-serif text-lg text-sidebar-foreground">Smart Campus</span>
                <span className="block text-xs text-sidebar-foreground/60">Portail Étudiant</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                    isActive 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User & Logout */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center">
                <span className="text-sm font-medium text-sidebar-accent-foreground">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {user?.studentId}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-card border-b border-border">
          <div className="flex items-center justify-between h-14 px-4 lg:px-6">
            <button 
              className="lg:hidden p-2 -ml-2 rounded-md hover:bg-muted"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <div className="hidden lg:block">
              <h1 className="text-sm font-medium text-foreground">
                Bienvenue, {user?.firstName}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
