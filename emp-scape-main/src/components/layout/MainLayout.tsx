import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Home,
  Users,
  Calendar,
  ClipboardList,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Globe,
  User,
  Briefcase,
  Clock,
  CalendarDays,
} from 'lucide-react';
import { UserRole } from '@/types';
import { Language } from '@/i18n/translations';
import { Badge } from '@/components/ui/badge';

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  const getNavigationItems = () => {
    const commonItems = [
      { icon: Home, label: t.navigation.home, path: `/${user.role}` },
      { icon: Clock, label: t.navigation.attendance, path: `/${user.role}/attendance` },
      { icon: CalendarDays, label: t.navigation.leaves, path: `/${user.role}/leaves` },
      { icon: ClipboardList, label: t.navigation.tasks, path: `/${user.role}/tasks` },
    ];

    const roleSpecificItems: Record<UserRole, typeof commonItems> = {
      admin: [
        ...commonItems,
        { icon: Users, label: t.navigation.employees, path: '/admin/employees' },
        { icon: Briefcase, label: t.navigation.departments, path: '/admin/departments' },
        { icon: BarChart3, label: t.navigation.reports, path: '/admin/reports' },
      ],
      hr: [
        ...commonItems,
        { icon: Users, label: t.navigation.employees, path: '/hr/employees' },
        { icon: BarChart3, label: t.navigation.reports, path: '/hr/reports' },
      ],
      manager: [
        ...commonItems,
        { icon: Users, label: 'Team', path: '/manager/team' },
        { icon: BarChart3, label: t.navigation.reports, path: '/manager/reports' },
      ],
      team_lead: [
        ...commonItems,
        { icon: Users, label: 'Teams', path: '/team_lead/teams' },
        { icon: BarChart3, label: t.navigation.reports, path: '/team_lead/reports' },
      ],
      employee: commonItems,
    };

    return roleSpecificItems[user.role];
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex h-16 items-center px-4 gap-4">
          {/* Sidebar Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">S</span>
            </div>
            <span className="hidden sm:inline font-semibold text-lg">Shekru Web</span>
          </div>

          <div className="flex-1" />

          {/* Language Selector */}
          <Select value={language} onValueChange={(value: Language) => setLanguage(value)}>
            <SelectTrigger className="w-[140px]">
              <Globe className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="hi">हिंदी</SelectItem>
              <SelectItem value="mr">मराठी</SelectItem>
            </SelectContent>
          </Select>

          {/* Notifications */}
          <NotificationBell />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.profilePhoto} alt={user.name} />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  <Badge variant="outline" className="w-fit mt-1 text-xs">
                    {t.roles[user.role]}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(`/${user.role}/profile`)}>
                <User className="mr-2 h-4 w-4" />
                {t.common.profile}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/${user.role}/settings`)}>
                <Settings className="mr-2 h-4 w-4" />
                {t.common.settings}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                {t.common.logout}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-20'
          } hidden lg:flex flex-col border-r bg-card transition-all duration-300`}
        >
          <nav className="flex-1 space-y-1 p-4">
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent hover:text-accent-foreground ${
                    isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground'
                  }`
                }
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <aside className="fixed left-0 top-16 bottom-0 w-64 border-r bg-card animate-slide-in">
              <nav className="flex-1 space-y-1 p-4">
                {navigationItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent hover:text-accent-foreground ${
                        isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground'
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;