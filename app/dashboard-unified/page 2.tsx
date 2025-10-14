// Page de test pour le nouveau système unifié
// Démonstration du layout adaptatif

'use client';

import { useState } from 'react';
import AdaptiveLayout from '@/components/layouts/AdaptiveLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProfile } from '@/lib/hooks/useProfile';
import { 
  BarChart3,
  Package,
  Users,
  TrendingUp,
  MapPin,
  Star,
  Bell,
  FileText,
  ShoppingCart,
  Search,
  Settings,
  User as UserIcon,
  Building,
  Zap
} from 'lucide-react';

export default function UnifiedDashboardPage() {
  const {
    user,
    isLoading,
    error,
    role,
    isProducer,
    isDistributor,
    roleLabel,
    roleIcon,
    roleColor,
    hasPermission,
    producerFields,
    distributorFields,
    userStats
  } = useProfile();

  const [activeTab, setActiveTab] = useState('overview');

  // Statistiques adaptatives selon le rôle
  const getStats = () => {
    if (isProducer) {
      return [
        {
          title: 'Produits Publiés',
          value: '45',
          icon: <Package className="h-5 w-5" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        },
        {
          title: 'Commandes Reçues',
          value: '23',
          icon: <ShoppingCart className="h-5 w-5" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        },
        {
          title: 'Revenus du Mois',
          value: '450,000 FCFA',
          icon: <TrendingUp className="h-5 w-5" />,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        },
        {
          title: 'Note Moyenne',
          value: '4.8',
          icon: <Star className="h-5 w-5" />,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        }
      ];
    } else {
      return [
        {
          title: 'Annonces Actives',
          value: '12',
          icon: <FileText className="h-5 w-5" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        },
        {
          title: 'Propositions Envoyées',
          value: '18',
          icon: <Bell className="h-5 w-5" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        },
        {
          title: 'Budget Disponible',
          value: '2,500,000 FCFA',
          icon: <TrendingUp className="h-5 w-5" />,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        },
        {
          title: 'Partenaires',
          value: '35',
          icon: <Users className="h-5 w-5" />,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        }
      ];
    }
  };

  const stats = getStats();

  return (
    <AdaptiveLayout activePage="dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard {roleIcon} {roleLabel}
            </h1>
            <p className="text-gray-600">
              Bienvenue sur votre tableau de bord {roleLabel.toLowerCase()}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={`${roleColor === 'green' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
              {roleIcon} {roleLabel}
            </Badge>
            {user?.is_verified && (
              <Badge className="bg-green-100 text-green-800">
                ✓ Vérifié
              </Badge>
            )}
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className={`p-6 ${stat.bgColor} ${stat.borderColor} border-2`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Contenu spécifique au rôle */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Informations du profil */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-gray-600" />
              Informations du Profil
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nom complet</label>
                <p className="text-gray-900">{user?.full_name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{user?.email}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Téléphone</label>
                <p className="text-gray-900">{user?.phone}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Région</label>
                <p className="text-gray-900">{user?.region}</p>
              </div>
              
              {isProducer && producerFields && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nom de la ferme</label>
                    <p className="text-gray-900">{producerFields.farm_name || 'Non défini'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Type d'élevage</label>
                    <p className="text-gray-900">{producerFields.type_elevage || 'Non défini'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Capacité</label>
                    <p className="text-gray-900">{producerFields.capacite || 'Non défini'}</p>
                  </div>
                </>
              )}
              
              {isDistributor && distributorFields && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nom de l'entreprise</label>
                    <p className="text-gray-900">{distributorFields.business_name || 'Non défini'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">NINEA</label>
                    <p className="text-gray-900">{distributorFields.ninea || 'Non défini'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Spécialisations</label>
                    <p className="text-gray-900">
                      {distributorFields.specializations?.join(', ') || 'Non définies'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Permissions et capacités */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-600" />
              Permissions et Capacités
            </h3>
            
            <div className="space-y-3">
              {isProducer && (
                <>
                  <div className="flex items-center gap-2">
                    {hasPermission('manage_products') ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    )}
                    <span className="text-sm">Gérer les produits</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {hasPermission('verify_location') ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    )}
                    <span className="text-sm">Vérifier la localisation</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {hasPermission('manage_delivery_settings') ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    )}
                    <span className="text-sm">Gérer les paramètres de livraison</span>
                  </div>
                </>
              )}
              
              {isDistributor && (
                <>
                  <div className="flex items-center gap-2">
                    {hasPermission('search_producers') ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    )}
                    <span className="text-sm">Rechercher des producteurs</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {hasPermission('create_requests') ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    )}
                    <span className="text-sm">Créer des demandes</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {hasPermission('send_propositions') ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    )}
                    <span className="text-sm">Envoyer des propositions</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {hasPermission('manage_alerts') ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    )}
                    <span className="text-sm">Gérer les alertes</span>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Actions rapides */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-gray-600" />
            Actions Rapides
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {isProducer && (
              <>
                <Button className="h-20 flex flex-col items-center justify-center gap-2">
                  <Package className="h-6 w-6" />
                  <span className="text-sm">Mes Produits</span>
                </Button>
                
                <Button className="h-20 flex flex-col items-center justify-center gap-2">
                  <MapPin className="h-6 w-6" />
                  <span className="text-sm">Géolocalisation</span>
                </Button>
                
                <Button className="h-20 flex flex-col items-center justify-center gap-2">
                  <ShoppingCart className="h-6 w-6" />
                  <span className="text-sm">Commandes</span>
                </Button>
                
                <Button className="h-20 flex flex-col items-center justify-center gap-2">
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-sm">Statistiques</span>
                </Button>
              </>
            )}
            
            {isDistributor && (
              <>
                <Button className="h-20 flex flex-col items-center justify-center gap-2">
                  <Search className="h-6 w-6" />
                  <span className="text-sm">Rechercher</span>
                </Button>
                
                <Button className="h-20 flex flex-col items-center justify-center gap-2">
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">Mes Annonces</span>
                </Button>
                
                <Button className="h-20 flex flex-col items-center justify-center gap-2">
                  <Bell className="h-6 w-6" />
                  <span className="text-sm">Alertes</span>
                </Button>
                
                <Button className="h-20 flex flex-col items-center justify-center gap-2">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Partenaires</span>
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>
    </AdaptiveLayout>
  );
}
