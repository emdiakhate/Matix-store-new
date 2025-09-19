"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import DistributorLayout from '@/components/layouts/DistributorLayout';
import { 
  Edit,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle,
  DollarSign,
  Upload,
  Award,
  Shield,
  TrendingUp,
  Building,
  CreditCard,
  Target,
  Package,
  User as UserIcon,
  Users,
  FileText,
  Bell,
  Search
} from 'lucide-react';

export default function DistributorProfilePage() {
  const [isEditing, setIsEditing] = useState(false);

  const user = {
    name: "Distributeur",
    email: "iantrepreneur221@gmail.com",
    phone: "+221 76 234 5678",
    address: "Zone Industrielle, Thiès",
    // Informations spécifiques distributeur
    entreprise: "Distribution Sénégal SARL",
    ninea: "47589123456789",
    registreCommerce: "DK-2024-B-12345",
    zoneDistribution: "Grand Dakar + Thiès",
    typeClientele: "B2B + B2C",
    // Abonnement
    planActuel: "Distributeur Pro - 25,000 FCFA/mois",
    statutAbonnement: "Actif jusqu'au 15/09/2025",
    fonctionnalites: ["Alertes illimitées", "Marque blanche", "Support prioritaire"],
    // Statistiques distributeur
    memberSince: "Mars 2024",
    producteursFollowed: 45,
    devisCrees: 128,
    tauxConversion: "34%"
  };

  return (
    <DistributorLayout activePage="profile">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mon Profil Distributeur</h1>
        <Button 
          onClick={() => setIsEditing(!isEditing)}
          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          {isEditing ? 'Annuler' : 'Modifier'}
        </Button>
      </div>

      {/* Profile Information */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-6">Informations Générales</h2>
        
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 flex items-center justify-center">
            <UserIcon className="h-12 w-12 text-gray-500" />
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Nom complet</p>
                  <p className="font-medium">{user.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Téléphone</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Adresse</p>
                  <p className="font-medium">{user.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Informations Spécifiques Distributeur */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-6">Informations Entreprise</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Nom entreprise</p>
                <p className="font-medium">{user.entreprise}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">NINEA</p>
                <p className="font-medium">{user.ninea}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Registre Commerce</p>
                <p className="font-medium">{user.registreCommerce}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Zone de distribution</p>
                <p className="font-medium">{user.zoneDistribution}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Type clientèle</p>
                <p className="font-medium">{user.typeClientele}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Abonnement */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-6">Mon Abonnement</h2>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Plan actuel</p>
                <p className="text-sm text-blue-700">{user.planActuel}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                Actif
              </span>
            </div>
          </div>
          
          <p className="text-sm text-blue-700 mb-4">{user.statutAbonnement}</p>
          
          <div className="mb-4">
            <p className="text-sm font-medium text-blue-900 mb-2">Fonctionnalités incluses :</p>
            <div className="flex flex-wrap gap-2">
              {user.fonctionnalites.map((feature, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  ✓ {feature}
                </span>
              ))}
            </div>
          </div>
          
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Gérer Abonnement
          </Button>
        </div>
      </Card>

      {/* Statistics */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-6">Statistiques du Compte</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-sm text-gray-500 mb-1">Membre depuis</p>
            <p className="font-bold text-lg">{user.memberSince}</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm text-gray-500 mb-1">Producteurs suivis</p>
            <p className="font-bold text-lg">{user.producteursFollowed}</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-sm text-gray-500 mb-1">Devis créés</p>
            <p className="font-bold text-lg">{user.devisCrees}</p>
          </div>
          
          <div className="text-center">
            <div className="bg-yellow-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <Target className="h-6 w-6 text-yellow-600" />
            </div>
            <p className="text-sm text-gray-500 mb-1">Taux conversion</p>
            <p className="font-bold text-lg">{user.tauxConversion}</p>
          </div>
        </div>
      </Card>

      {/* Documents */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-6">Documents & Certifications</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">Registre de commerce</p>
                <p className="text-sm text-gray-500">Document officiel requis</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">Licence de distribution</p>
                <p className="text-sm text-gray-500">Autorisation commerciale</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">Assurance responsabilité</p>
                <p className="text-sm text-gray-500">Couverture commerciale</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Actions Rapides</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/dashboard/distributor/alerts">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Mes Alertes
            </Button>
          </Link>
          
          <Link href="/dashboard/distributor/search">
            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2">
              <Search className="h-4 w-4" />
              Rechercher Producteurs
            </Button>
          </Link>
          
          <Link href="/dashboard/distributor/requests">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
              <Package className="h-4 w-4" />
              Mes Demandes
            </Button>
          </Link>
          
          <Link href="/dashboard/distributor/propositions">
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Mes Propositions
            </Button>
          </Link>
        </div>
      </Card>
    </DistributorLayout>
  );
}
