import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../services/api';
import type { ApiResponse } from '../../types';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

import {
  LayoutDashboard,
  Users,
  Truck,
  MapPin,
  Route,
  BarChart3,
  Bell,
  AlertTriangle,
  LogOut,
  Settings,
  Menu,
  X,
  ChevronLeft,
  Sun,
  Moon,
} from 'lucide-react';

const navigation = [
  { name: 'Performans Paneli', href: '/', icon: LayoutDashboard },
  { name: 'Sürücüler', href: '/drivers', icon: Users },
  { name: 'Araçlar', href: '/vehicles', icon: Truck },
  { name: 'Canlı Takip', href: '/live-tracking', icon: MapPin },
  { name: 'Rota Geçmişi', href: '/route-history', icon: Route },
  { name: 'Analitik', href: '/analytics', icon: BarChart3 },
  { name: 'Uyarılar', href: '/alerts', icon: AlertTriangle },
];

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    const fetchAlertCount = async () => {
      try {
        const res = await api.get<ApiResponse<any[]>>('/alerts?isRead=false&limit=1');
        setAlertCount(res.data.meta?.total || 0);
      } catch {
        setAlertCount(0);
      }
    };
    fetchAlertCount();
    const interval = setInterval(fetchAlertCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = ({ collapsed }: { collapsed?: boolean }) => (
    <>
      <div className={cn("flex items-center gap-3 px-4 py-5 border-b", collapsed && "justify-center px-2")}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-bold">
          V
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">Vehicle Track</p>
            <p className="text-xs text-muted-foreground truncate">Araç Takip Sistemi</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                collapsed && "justify-center px-2",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && (
              <>
                <span className="truncate">{item.name}</span>
                {item.name === 'Uyarılar' && alertCount > 0 && (
                  <Badge variant="destructive" className="ml-auto h-5 min-w-5 px-1 text-[10px]">
                    {alertCount > 99 ? '99+' : alertCount}
                  </Badge>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t p-3">
        {collapsed ? (
          <Avatar className="mx-auto h-8 w-8">
            <AvatarFallback className="text-xs">{user?.email?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="rounded-lg bg-muted p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Aktif Kullanıcı</p>
            <span className="inline-flex items-center rounded-full border border-primary px-2 py-0.5 text-[10px] font-medium text-primary">
              {user?.role?.toUpperCase() || 'USER'}
            </span>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r transform transition-transform duration-200 ease-in-out lg:hidden",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-2 border-b">
            <span className="text-sm font-semibold px-2">Menü</span>
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <SidebarContent />
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col bg-sidebar border-r transition-all duration-200",
        sidebarOpen ? "w-64" : "w-16"
      )}>
        <SidebarContent collapsed={!sidebarOpen} />
      </aside>

      {/* Collapse toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="hidden lg:flex absolute left-[16rem] top-20 z-30 h-6 w-6 -translate-x-1/2 rounded-full border bg-background shadow-sm transition-all duration-200"
        style={{ left: sidebarOpen ? '16rem' : '4rem' }}
      >
        <ChevronLeft className={cn("h-3 w-3 transition-transform", !sidebarOpen && "rotate-180")} />
      </Button>

      {/* Main content area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1" />

          <Button variant="ghost" size="icon" onClick={toggleTheme} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <Button variant="ghost" size="icon" className="relative" onClick={() => navigate('/alerts')}>
            <Bell className="h-5 w-5" />
            {alertCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-medium text-destructive-foreground">
                {alertCount > 9 ? '9+' : alertCount}
              </span>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{user?.email?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-medium">{user?.email}</span>
                  <span className="text-xs text-muted-foreground">{user?.role} kullanıcısı</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {}}>
                <Settings className="mr-2 h-4 w-4" />
                Ayarlar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Çıkış Yap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
