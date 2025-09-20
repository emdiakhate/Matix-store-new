// Données géographiques du Sénégal
export interface SenegalRegion {
  id: string;
  name: string;
  departments: SenegalDepartment[];
}

export interface SenegalDepartment {
  id: string;
  name: string;
  communes: SenegalCommune[];
}

export interface SenegalCommune {
  id: string;
  name: string;
  coordinates: [number, number]; // [latitude, longitude]
}

// Données principales des régions du Sénégal
export const senegalRegions: SenegalRegion[] = [
  {
    id: 'dakar',
    name: 'Dakar',
    departments: [
      {
        id: 'dakar-dept',
        name: 'Dakar',
        communes: [
          { id: 'dakar-plateau', name: 'Dakar Plateau', coordinates: [14.6928, -17.4467] },
          { id: 'pikine', name: 'Pikine', coordinates: [14.7549, -17.3924] },
          { id: 'gueule-tapée', name: 'Guédiawaye', coordinates: [14.7761, -17.3956] },
          { id: 'rufisque', name: 'Rufisque', coordinates: [14.7167, -17.2667] }
        ]
      }
    ]
  },
  {
    id: 'thies',
    name: 'Thiès',
    departments: [
      {
        id: 'thies-dept',
        name: 'Thiès',
        communes: [
          { id: 'thies-ville', name: 'Thiès', coordinates: [14.7886, -16.9246] },
          { id: 'mbour', name: 'Mbour', coordinates: [14.4167, -16.9667] },
          { id: 'tivaouane', name: 'Tivaouane', coordinates: [14.9667, -16.8167] }
        ]
      }
    ]
  },
  {
    id: 'saint-louis',
    name: 'Saint-Louis',
    departments: [
      {
        id: 'saint-louis-dept',
        name: 'Saint-Louis',
        communes: [
          { id: 'saint-louis-ville', name: 'Saint-Louis', coordinates: [16.0199, -16.4895] },
          { id: 'dagana', name: 'Dagana', coordinates: [16.4833, -15.5167] }
        ]
      }
    ]
  },
  {
    id: 'diourbel',
    name: 'Diourbel',
    departments: [
      {
        id: 'diourbel-dept',
        name: 'Diourbel',
        communes: [
          { id: 'diourbel-ville', name: 'Diourbel', coordinates: [14.6667, -16.2333] },
          { id: 'bambey', name: 'Bambey', coordinates: [14.7167, -16.4667] }
        ]
      }
    ]
  },
  {
    id: 'kaolack',
    name: 'Kaolack',
    departments: [
      {
        id: 'kaolack-dept',
        name: 'Kaolack',
        communes: [
          { id: 'kaolack-ville', name: 'Kaolack', coordinates: [14.1667, -16.0833] },
          { id: 'guinguineo', name: 'Guinguinéo', coordinates: [14.2667, -15.9500] }
        ]
      }
    ]
  },
  {
    id: 'fatick',
    name: 'Fatick',
    departments: [
      {
        id: 'fatick-dept',
        name: 'Fatick',
        communes: [
          { id: 'fatick-ville', name: 'Fatick', coordinates: [14.3500, -16.4167] },
          { id: 'foundiougne', name: 'Foundiougne', coordinates: [14.1333, -16.5167] }
        ]
      }
    ]
  },
  {
    id: 'louga',
    name: 'Louga',
    departments: [
      {
        id: 'louga-dept',
        name: 'Louga',
        communes: [
          { id: 'louga-ville', name: 'Louga', coordinates: [15.6167, -16.2167] },
          { id: 'kebemer', name: 'Kébémer', coordinates: [15.3500, -16.4333] }
        ]
      }
    ]
  },
  {
    id: 'matam',
    name: 'Matam',
    departments: [
      {
        id: 'matam-dept',
        name: 'Matam',
        communes: [
          { id: 'matam-ville', name: 'Matam', coordinates: [15.6667, -13.2500] },
          { id: 'kanel', name: 'Kanel', coordinates: [15.4833, -13.1833] }
        ]
      }
    ]
  },
  {
    id: 'tambacounda',
    name: 'Tambacounda',
    departments: [
      {
        id: 'tambacounda-dept',
        name: 'Tambacounda',
        communes: [
          { id: 'tambacounda-ville', name: 'Tambacounda', coordinates: [13.7667, -13.6667] },
          { id: 'bakel', name: 'Bakel', coordinates: [14.9167, -12.4500] }
        ]
      }
    ]
  },
  {
    id: 'kolda',
    name: 'Kolda',
    departments: [
      {
        id: 'kolda-dept',
        name: 'Kolda',
        communes: [
          { id: 'kolda-ville', name: 'Kolda', coordinates: [12.8833, -14.9500] },
          { id: 'velingara', name: 'Vélingara', coordinates: [13.1500, -14.1167] }
        ]
      }
    ]
  },
  {
    id: 'zigunchor',
    name: 'Ziguinchor',
    departments: [
      {
        id: 'zigunchor-dept',
        name: 'Ziguinchor',
        communes: [
          { id: 'zigunchor-ville', name: 'Ziguinchor', coordinates: [12.5833, -16.2667] },
          { id: 'bignona', name: 'Bignona', coordinates: [12.8167, -16.2167] }
        ]
      }
    ]
  }
];

// Fonction utilitaire pour obtenir les coordonnées d'une commune
export function getCommuneCoordinates(regionId: string, departmentId: string, communeId: string): [number, number] | null {
  const region = senegalRegions.find(r => r.id === regionId);
  if (!region) return null;

  const department = region.departments.find(d => d.id === departmentId);
  if (!department) return null;

  const commune = department.communes.find(c => c.id === communeId);
  if (!commune) return null;

  return commune.coordinates;
}

// Fonction pour obtenir toutes les régions
export function getAllRegions() {
  return senegalRegions.map(region => ({
    id: region.id,
    name: region.name
  }));
}

// Fonction pour obtenir les départements d'une région
export function getDepartmentsByRegion(regionId: string) {
  const region = senegalRegions.find(r => r.id === regionId);
  if (!region) return [];

  return region.departments.map(dept => ({
    id: dept.id,
    name: dept.name
  }));
}

// Fonction pour obtenir les communes d'un département
export function getCommunesByDepartment(regionId: string, departmentId: string) {
  const region = senegalRegions.find(r => r.id === regionId);
  if (!region) return [];

  const department = region.departments.find(d => d.id === departmentId);
  if (!department) return [];

  return department.communes.map(commune => ({
    id: commune.id,
    name: commune.name,
    coordinates: commune.coordinates
  }));
}
