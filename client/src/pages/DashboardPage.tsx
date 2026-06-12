import React, { useState, useEffect } from 'react';
import { Users, Truck, PlayCircle, Route } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import { analyticsService } from '../services/analyticsService';
import type { DashboardStats } from '../types';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444'];

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Dashboard verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-center justify-between">
        <span className="text-sm text-red-700">{error}</span>
        <Badge variant="outline" className="cursor-pointer" onClick={loadDashboardData}>Yeniden Dene</Badge>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
        Dashboard verileri bulunamadı
      </div>
    );
  }

  const StatCard = ({ value, label, icon: Icon, color }: { value: number | string; label: string; icon: React.ElementType; color: string }) => (
    <Card className="relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-10`} style={{ background: `linear-gradient(135deg, ${color}, ${color}40)` }} />
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold" style={{ color }}>{value}</p>
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}20` }}>
            <Icon className="h-6 w-6" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard value={stats.summary.totalDrivers} label="Toplam Sürücü" icon={Users} color="#3b82f6" />
        <StatCard value={stats.summary.totalVehicles} label="Toplam Araç" icon={Truck} color="#8b5cf6" />
        <StatCard value={stats.summary.activeSessions} label="Aktif Oturum" icon={PlayCircle} color="#22c55e" />
        <StatCard value={Math.round(stats.summary.totalDistance)} label="Toplam KM" icon={Route} color="#f59e0b" />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h3 className="text-base font-semibold mb-4">En Aktif Sürücüler</h3>
            {stats.topDrivers.length > 0 ? (
              <div className="w-full h-[300px]">
                <ResponsiveContainer>
                  <BarChart data={stats.topDrivers.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="firstName" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [name === 'sessionCount' ? `${value} Oturum` : `${value} KM`, name === 'sessionCount' ? 'Oturum Sayısı' : 'Toplam Mesafe']} labelFormatter={(label) => `Sürücü: ${label}`} />
                    <Bar dataKey="sessionCount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Henüz sürücü verisi bulunmamaktadır</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="text-base font-semibold mb-4">En Çok Kullanılan Araçlar</h3>
            {stats.topVehicles.length > 0 ? (
              <div className="w-full h-[300px]">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={stats.topVehicles.slice(0, 5)} cx="50%" cy="50%" labelLine={false} label={({ plateNumber, sessionCount }: any) => `${plateNumber} (${sessionCount})`} outerRadius={80} dataKey="sessionCount">
                      {stats.topVehicles.slice(0, 5).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} Oturum`, 'Kullanım Sayısı']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Henüz araç verisi bulunmamaktadır</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h3 className="text-base font-semibold mb-4">Sürücü Performansı</h3>
            {stats.topDrivers.length > 0 ? (
              <div className="space-y-1">
                {stats.topDrivers.slice(0, 5).map((driver, index) => {
                  const maxDist = Math.max(...stats.topDrivers.map(d => d.totalDistance));
                  return (
                    <div key={driver.driverId} className={`flex items-center gap-3 p-3 ${index < 4 ? 'border-b' : ''}`}>
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-xs" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length], color: '#fff' }}>
                          {driver.firstName[0]}{driver.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{driver.firstName} {driver.lastName}</p>
                        <p className="text-xs text-muted-foreground">{driver.sessionCount} oturum • {Math.round(driver.totalDistance)} km</p>
                        <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(driver.totalDistance / maxDist) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Henüz sürücü performans verisi bulunmamaktadır</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="text-base font-semibold mb-4">Araç Kullanım Oranları</h3>
            {stats.topVehicles.length > 0 ? (
              <div className="space-y-1">
                {stats.topVehicles.slice(0, 5).map((vehicle, index) => {
                  const maxSess = Math.max(...stats.topVehicles.map(v => v.sessionCount));
                  return (
                    <div key={vehicle.vehicleId} className={`flex items-center gap-3 p-3 ${index < 4 ? 'border-b' : ''}`}>
                      <div className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}>
                        <Truck className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{vehicle.plateNumber}</p>
                        <p className="text-xs text-muted-foreground">{vehicle.brand} {vehicle.model} • {vehicle.sessionCount} oturum</p>
                        <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(vehicle.sessionCount / maxSess) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Henüz araç kullanım verisi bulunmamaktadır</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
