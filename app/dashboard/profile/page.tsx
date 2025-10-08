"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import AdaptiveLayout from '@/components/layouts/AdaptiveLayout';
import { Upload } from 'lucide-react';

export default function UpdateProfilePage() {
  const [formData, setFormData] = useState({
    name: "Amadou Diallo",
    email: "amadou@gmail.com",
    phone: "+221 77 123 45 67",
    address: "Dakar, Sénégal",
    bio: "Producteur avicole passionné avec plus de 10 ans d'expérience dans l'élevage de volailles de qualité.",
    company: "Ferme Diallo",
    website: "www.ferme-diallo.sn"
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Profile updated:', formData);
    // Ici vous pouvez ajouter la logique de sauvegarde
  };

  return (
    <AdaptiveLayout activePage="profile">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture Section */}
        <Card className="p-6">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
              <img 
                src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <Button variant="outline" size="sm" className="mb-2">
              <Upload className="h-4 w-4 mr-2" />
              Changer la photo
            </Button>
            <p className="text-sm text-gray-500">JPG, PNG ou GIF. Max 2MB.</p>
          </div>
        </Card>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Votre nom complet"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+221 XX XXX XX XX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse
                  </label>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Votre adresse"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'entreprise
                  </label>
                  <Input
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Nom de votre ferme/entreprise"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site web
                  </label>
                  <Input
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="www.votre-site.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Biographie
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-matix-green-medium"
                  placeholder="Parlez-nous de votre expérience et de votre passion pour l'aviculture..."
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline">
                  Annuler
                </Button>
                <Button type="submit" className="bg-matix-green-medium hover:bg-matix-green-dark text-white">
                  Sauvegarder les modifications
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </AdaptiveLayout>
  );
}
