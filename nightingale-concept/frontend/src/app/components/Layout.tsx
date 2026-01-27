import { ReactNode } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Clock, 
  Stethoscope, 
  DollarSign, 
  Calendar, 
  Heart,
  Bell,
  Settings as SettingsIcon
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/timeline', icon: Clock, label: 'Timeline' },
    { path: '/check-in', icon: Stethoscope, label: 'Check-In' },
    { path: '/costs', icon: DollarSign, label: 'Costs' },
    { path: '/visits', icon: Calendar, label: 'Visits' },
    { path: '/whole-person', icon: Heart, label: 'Wellness' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    return location.pathname.startsWith(path) && path !== '/';
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* App Bar */}
      <header className="bg-surface border-b border-border px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            <h1 className="text-2xl font-bold text-foreground">Nightingale</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-full hover:bg-background transition-colors">
              <Bell className="w-6 h-6 text-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <Link to="/settings" className="p-2 rounded-full hover:bg-background transition-colors">
              <SettingsIcon className="w-6 h-6 text-foreground" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 pb-20 md:pb-4">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-surface border-t border-border fixed bottom-0 left-0 right-0 md:relative md:bottom-auto shadow-lg md:shadow-none">
        <div className="max-w-7xl mx-auto flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg min-w-[64px] transition-colors ${
                  active 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-background'
                }`}
              >
                <Icon className={`w-6 h-6 ${active ? 'fill-primary/20' : ''}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}