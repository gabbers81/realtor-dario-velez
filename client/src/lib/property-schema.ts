import type { Project } from './types';

interface PropertyLocationData {
  coordinates: {
    latitude: string;
    longitude: string;
  };
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode?: string;
    addressCountry: string;
  };
  nearbyAmenities: string[];
  distanceToAirport: string;
  distanceToBeach: string;
  localAttractions: string[];
}

const propertyLocations: Record<string, PropertyLocationData> = {
  'aura-boulevard': {
    coordinates: {
      latitude: '18.5601',
      longitude: '-68.3725'
    },
    address: {
      streetAddress: 'Punta Cana Design District',
      addressLocality: 'Punta Cana',
      addressRegion: 'La Altagracia',
      addressCountry: 'DO'
    },
    nearbyAmenities: [
      'Punta Cana International Airport',
      'Cap Cana Golf Course',
      'Punta Cana Village',
      'Marina Cap Cana',
      'Blue Mall Shopping Center'
    ],
    distanceToAirport: '5 minutes',
    distanceToBeach: '10 minutes',
    localAttractions: [
      'Cap Cana Beach',
      'Scape Park',
      'Hard Rock Golf Course',
      'Punta Cana Resort & Club'
    ]
  },
  'secret-garden': {
    coordinates: {
      latitude: '18.6813',
      longitude: '-68.4073'
    },
    address: {
      streetAddress: 'Bávaro Beach Area',
      addressLocality: 'Bávaro',
      addressRegion: 'La Altagracia',
      addressCountry: 'DO'
    },
    nearbyAmenities: [
      'Bávaro Beach',
      'Cortecito Beach',
      'Palma Real Shopping Village',
      'Cocotal Golf Course',
      'Manati Park'
    ],
    distanceToAirport: '20 minutes',
    distanceToBeach: '2 minutes walk',
    localAttractions: [
      'Bávaro Adventure Park',
      'Dolphin Island Park',
      'Manatí Park',
      'Playa Bávaro'
    ]
  },
  'the-reef': {
    coordinates: {
      latitude: '19.3061',
      longitude: '-69.3394'
    },
    address: {
      streetAddress: 'Las Terrenas Beachfront',
      addressLocality: 'Las Terrenas',
      addressRegion: 'Samaná',
      addressCountry: 'DO'
    },
    nearbyAmenities: [
      'Las Terrenas Beach',
      'Playa Bonita',
      'El Catey International Airport',
      'Las Terrenas Marina',
      'Pueblo de los Pescadores'
    ],
    distanceToAirport: '25 minutes to El Catey',
    distanceToBeach: 'Beachfront access',
    localAttractions: [
      'Whale Watching (seasonal)',
      'Salto del Limón Waterfall',
      'Cayo Levantado',
      'Los Haitises National Park'
    ]
  },
  'palm-beach-residences': {
    coordinates: {
      latitude: '18.5204',
      longitude: '-68.3685'
    },
    address: {
      streetAddress: 'Cap Cana Resort Area',
      addressLocality: 'Cap Cana',
      addressRegion: 'La Altagracia',
      addressCountry: 'DO'
    },
    nearbyAmenities: [
      'Cap Cana Beach',
      'Punta Espada Golf Course',
      'Marina Cap Cana',
      'Eden Roc Cap Cana',
      'Secrets Cap Cana Resort'
    ],
    distanceToAirport: '10 minutes',
    distanceToBeach: 'Direct beach access',
    localAttractions: [
      'Juanillo Beach',
      'Hoyo Azul Cenote',
      'Cap Cana Heritage School',
      'Fishing Lodge Cap Cana'
    ]
  },
  'solvamar-macao': {
    coordinates: {
      latitude: '18.6156',
      longitude: '-68.4456'
    },
    address: {
      streetAddress: 'Playa Macao Coastline',
      addressLocality: 'Macao',
      addressRegion: 'La Altagracia',
      addressCountry: 'DO'
    },
    nearbyAmenities: [
      'Macao Beach',
      'Surf Schools',
      'ATV Adventure Tours',
      'Local Beach Restaurants',
      'Macao Cave'
    ],
    distanceToAirport: '30 minutes',
    distanceToBeach: 'Oceanfront location',
    localAttractions: [
      'Macao Adventure Park',
      'Zipline Adventures',
      'Horseback Riding on Beach',
      'Surf Breaks'
    ]
  },
  'amares-unique-homes': {
    coordinates: {
      latitude: '18.5845',
      longitude: '-68.3912'
    },
    address: {
      streetAddress: 'Punta Cana Exclusive Area',
      addressLocality: 'Punta Cana',
      addressRegion: 'La Altagracia',
      addressCountry: 'DO'
    },
    nearbyAmenities: [
      'Private Golf Course Access',
      'Exclusive Beach Club',
      'Helicopter Landing Pad',
      'Private Marina Access',
      'Luxury Spa Facilities'
    ],
    distanceToAirport: '15 minutes',
    distanceToBeach: '5 minutes',
    localAttractions: [
      'Championship Golf Courses',
      'Private Beaches',
      'Deep Sea Fishing',
      'Luxury Shopping at Blue Mall'
    ]
  },
  'tropical-beach-3-0': {
    coordinates: {
      latitude: '18.6789',
      longitude: '-68.4123'
    },
    address: {
      streetAddress: 'Playa Bávaro Sustainable Zone',
      addressLocality: 'Bávaro',
      addressRegion: 'La Altagracia',
      addressCountry: 'DO'
    },
    nearbyAmenities: [
      'Eco-Friendly Beach Access',
      'Solar Energy Facilities',
      'Smart Building Technology',
      'Sustainable Transportation Hub',
      'Green Spaces and Gardens'
    ],
    distanceToAirport: '25 minutes',
    distanceToBeach: 'Direct beach access',
    localAttractions: [
      'Ecological Reserves',
      'Sustainable Tourism Sites',
      'Beach Volleyball Courts',
      'Coral Reef Snorkeling'
    ]
  },
  'las-cayas-residences': {
    coordinates: {
      latitude: '18.6945',
      longitude: '-68.4234'
    },
    address: {
      streetAddress: 'Bávaro Lagoon Area',
      addressLocality: 'Bávaro',
      addressRegion: 'La Altagracia',
      addressCountry: 'DO'
    },
    nearbyAmenities: [
      'Artificial Lagoons',
      'Water Sports Center',
      'Equestrian Center',
      'Family Entertainment Complex',
      'Private Marina'
    ],
    distanceToAirport: '22 minutes',
    distanceToBeach: '5 minutes walk',
    localAttractions: [
      'Lagoon Boat Tours',
      'Horseback Riding Trails',
      'Family Water Park',
      'Nature Reserves'
    ]
  }
};

export function generatePropertySchema(project: Project, currentLang: string = 'es'): object {
  const locationData = propertyLocations[project.slug];
  
  if (!locationData) {
    return {};
  }

  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Residence',
    name: project.title,
    description: project.description,
    url: `https://dariovelez.com.do/${currentLang === 'es' ? '' : currentLang + '/'}proyecto/${project.slug}`,
    image: project.imageUrl,
    
    // Location Information
    address: {
      '@type': 'PostalAddress',
      streetAddress: locationData.address.streetAddress,
      addressLocality: locationData.address.addressLocality,
      addressRegion: locationData.address.addressRegion,
      addressCountry: locationData.address.addressCountry,
      ...(locationData.address.postalCode && { postalCode: locationData.address.postalCode })
    },
    
    // Geographic Coordinates
    geo: {
      '@type': 'GeoCoordinates',
      latitude: locationData.coordinates.latitude,
      longitude: locationData.coordinates.longitude
    },
    
    // Property Features
    amenityFeature: project.features.map(feature => ({
      '@type': 'LocationFeatureSpecification',
      name: feature
    })),
    
    // Nearby Amenities
    nearbyAttractions: locationData.nearbyAmenities.map(amenity => ({
      '@type': 'TouristAttraction',
      name: amenity
    })),
    
    // Local Information
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Distance to Airport',
        value: locationData.distanceToAirport
      },
      {
        '@type': 'PropertyValue',
        name: 'Distance to Beach',
        value: locationData.distanceToBeach
      },
      {
        '@type': 'PropertyValue',
        name: 'Completion Date',
        value: project.completion
      },
      {
        '@type': 'PropertyValue',
        name: 'Starting Price',
        value: project.price
      }
    ],
    
    // Real Estate Agent Information
    agent: {
      '@type': 'RealEstateAgent',
      name: 'Dario Velez',
      telephone: '+1-829-444-4431',
      email: 'dariovelez@ofertainmobiliariard.com',
      url: 'https://dariovelez.com.do',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Punta Cana',
        addressRegion: 'La Altagracia',
        addressCountry: 'DO'
      },
      areaServed: [
        'Punta Cana',
        'Bávaro',
        'Cap Cana',
        'Las Terrenas',
        'Macao',
        'Dominican Republic'
      ]
    },
    
    // Legal Framework
    governmentBenefitsInfo: {
      '@type': 'GovernmentBenefitsType',
      name: 'CONFOTUR Tax Benefits',
      description: 'Properties eligible for Dominican Republic tourism investment tax exemptions under CONFOTUR law'
    }
  };

  return baseSchema;
}

export function getLocationData(slug: string): PropertyLocationData | undefined {
  return propertyLocations[slug];
}