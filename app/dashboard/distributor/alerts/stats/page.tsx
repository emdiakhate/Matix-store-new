"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  BarChart3, 
  Search, 
  Bell, 
  FileText, 
  Store, 
  Users, 
  User as UserIcon, 
  LogOut,
  ArrowLeft,
  Loader2,
  TrendingUp,
  Eye,
  Clock,
  Target
} from 'lucide-react';

interface AlertStats {
  alerts: {
    total: number;
    active: number;
    inactive: number;
    by_frequency: {
      immediate: number;
      daily: number;
      weekly: number;
    };
  };
  matches: {
    this_week: number;
    unread: number;
    daily_data: Array<{date: string, matches: number}>;
  };
  top_alerts: Array<{
    id: string;
    name: string;
    matches_count: number;
    is_active: boolean;
  }>;
  notifications: {
    this_week: number;
    unread: number;
  };
  performance: Array<{
    alert_id: string;
    alert_name: string;
    notification_frequency: string;
    total_matches: number;
    recent_matches: number;
  }>;
}

export default function AlertsStatsPage() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [error, setError] = useState('');

  // ID utilisateur de test (à remplacer par l'ID réel de l'utilisateur connecté)
  const userId = '303f243a-9129-4e94-8a6f-f8e247f0d15e'; // Test distributor ID

  const user = {
    name: "Fatou Enterprises",
    email: "fatou@enterprises.sn",
    avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100"
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'search', label: 'Rechercher Producteurs', icon: <Search className="h-4 w-4" /> },
    { id: 'alerts', label: 'Mes Alertes', icon: <Bell className="h-4 w-4" /> },
    { id: 'quotes', label: 'Mes Devis', icon: <FileText className="h-4 w-4" /> },
    { id: 'brand', label: 'Ma Marque', icon: <Store className="h-4 w-4" /> },
    { id: 'clients', label: 'Mes Clients', icon: <Users className="h-4 w-4" /> },
    { id: 'profile', label: 'Mon Profil', icon: <UserIcon className="h-4 w-4" /> },
    { id: 'logout', label: 'Déconnexion', icon: <LogOut className="h-4 w-4" /> }
  ];

  // Charger les statistiques
  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/alerts/stats', {
        headers: {
          'x-user-id': userId
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.statistics);
      } else {
        setError('Erreur lors du chargement des statistiques');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header identique */}
      <div className="bg-gray-100 text-gray-700 text-sm py-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">📞</span>
            <span>Nous sommes disponibles 24h/7j, Besoin d'aide ?</span>
            <span className="text-green-600 font-semibold">+221 77 123 45 67</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm">
            <a href="#" className="hover:text-green-600">À Propos</a>
            <span className="text-gray-400">|</span>
            <a href="#" className="hover:text-green-600">Nous Contacter</a>
            <span className="text-gray-400">|</span>
            <a href="#" className="hover:text-green-600">Mon Compte</a>
            <span className="text-gray-400">|</span>
            <a href="#" className="hover:text-green-600 flex items-center gap-1">
              🔒 Déconnexion
            </a>
          </div>
        </div>
      </div>

      <div className="bg-matix-green-dark text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <div className="bg-white text-matix-green-dark p-2 rounded-lg mr-3">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-matix-yellow">MATIX</h1>
                <p className="text-xs text-matix-yellow opacity-90">M A R T</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 py-3">
        <div className="container mx-auto px-4">
          <nav className="flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-matix-green-medium font-medium">Accueil</Link>
            <Link href="/categories" className="text-gray-700 hover:text-matix-green-medium font-medium">Catégories</Link>
            <Link href="#" className="text-gray-700 hover:text-matix-green-medium font-medium">À Propos</Link>
            <Link href="#" className="text-gray-700 hover:text-matix-green-medium font-medium">Contact</Link>
            <Link href="/offres" className="text-matix-yellow font-medium">Offres</Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              {/* Profile Section */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3">
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-xs text-blue-600">Distributeur</p>
              </div>

              {/* Menu Navigation */}
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.id === 'dashboard' ? '/dashboard/distributor' : `/dashboard/distributor/${item.id}`}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      item.id === 'alerts' 
                        ? 'bg-blue-100 text-blue-700 font-medium' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                    }`}
                  >
                    {item.icon}
                    <span className="text-sm">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Link href="/dashboard/distributor/alerts">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour aux Alertes
                  </Button>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Statistiques des Alertes</h1>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-red-800">{error}</span>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                <span className="ml-2 text-gray-600">Chargement des statistiques...</span>
              </div>
            ) : stats ? (
              <div className="space-y-6">
                {/* Statistiques générales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Alertes</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.alerts.total}</p>
                      </div>
                      <div className="bg-blue-100 p-3 rounded-full">
                        <Bell className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Alertes Actives</p>
                        <p className="text-2xl font-bold text-green-600">{stats.alerts.active}</p>
                      </div>
                      <div className="bg-green-100 p-3 rounded-full">
                        <Target className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Matches Cette Semaine</p>
                        <p className="text-2xl font-bold text-orange-600">{stats.matches.this_week}</p>
                      </div>
                      <div className="bg-orange-100 p-3 rounded-full">
                        <TrendingUp className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Non Lus</p>
                        <p className="text-2xl font-bold text-red-600">{stats.matches.unread}</p>
                      </div>
                      <div className="bg-red-100 p-3 rounded-full">
                        <Eye className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Graphique des matches par jour */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Matches par Jour (7 derniers jours)</h3>
                  <div className="space-y-2">
                    {stats.matches.daily_data.map((day, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{formatDate(day.date)}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${Math.min((day.matches / Math.max(...stats.matches.daily_data.map(d => d.matches))) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{day.matches}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Top 3 des alertes */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Top 3 des Alertes</h3>
                  <div className="space-y-3">
                    {stats.top_alerts.map((alert, index) => (
                      <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{alert.name}</p>
                            <p className="text-sm text-gray-600">
                              {alert.matches_count} matches • {alert.is_active ? 'Active' : 'Pause'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{alert.matches_count}</p>
                          <p className="text-xs text-gray-500">matches</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Performance des alertes */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Performance des Alertes</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Nom de l'Alerte</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Fréquence</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Total Matches</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Cette Semaine</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.performance.map((alert) => (
                          <tr key={alert.alert_id} className="border-b border-gray-100">
                            <td className="py-3 px-4 font-medium text-gray-900">{alert.alert_name}</td>
                            <td className="py-3 px-4 text-gray-600">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                alert.notification_frequency === 'immediate' ? 'bg-green-100 text-green-800' :
                                alert.notification_frequency === 'daily' ? 'bg-blue-100 text-blue-800' :
                                'bg-orange-100 text-orange-800'
                              }`}>
                                {alert.notification_frequency === 'immediate' ? 'Immédiate' :
                                 alert.notification_frequency === 'daily' ? 'Quotidienne' : 'Hebdomadaire'}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-bold text-gray-900">{alert.total_matches}</td>
                            <td className="py-3 px-4 font-bold text-green-600">{alert.recent_matches}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

