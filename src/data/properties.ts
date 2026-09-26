import type { Property, PropertyRequirement } from '../types'
import { amenityOptions } from './amenities'

const locations: Record<string, string[]> = {
  Mangaluru: ['Kadri', 'Bejai', 'Kankanady', 'Bendoor', 'Derebail', 'Urwa'],
  Bengaluru: ['Whitefield', 'Indiranagar', 'Sarjapur', 'HSR Layout', 'Yelahanka', 'JP Nagar'],
  Mysuru: ['Vijayanagar', 'Gokulam', 'Hebbal', 'Saraswathipuram', 'Bogadi', 'Kuvempunagar'],
  Hyderabad: ['Gachibowli', 'Kondapur', 'Miyapur', 'Kokapet', 'Manikonda', 'Madhapur'],
  Chennai: ['OMR', 'Adyar', 'Velachery', 'Porur', 'Anna Nagar', 'Sholinganallur'],
  Pune: ['Hinjewadi', 'Baner', 'Wakad', 'Kharadi', 'Hadapsar', 'Aundh'],
  Mumbai: ['Powai', 'Thane', 'Andheri', 'Navi Mumbai', 'Borivali', 'Mulund'],
  'Delhi NCR': ['Gurugram', 'Noida', 'Dwarka', 'Faridabad', 'Indirapuram', 'Rohini'],
}

const photos = [
  'photo-1600596542815-ffad4c1539a9',
  'photo-1600607687939-ce8a6c25118c',
  'photo-1600607687920-4e2a09cf159d',
  'photo-1600566753086-00f18fb6b3ea',
  'photo-1600210492486-724fe5c67fb0',
  'photo-1600566753190-17f0baa2a6c3',
  'photo-1600047509807-ba8f99d2cdde',
  'photo-1600607687644-c7171b42498f',
]

const types = ['Apartment', 'Apartment', 'Apartment', 'Villa', 'Independent House', 'Apartment', 'Row House', 'Villa', 'Studio', 'Penthouse', 'Plot']
const statuses = ['Ready to move', 'New', 'Under construction', 'Resale'] as const

export const properties: Property[] = Array.from({ length: 384 }, (_, index) => {
  const city = Object.keys(locations)[index % Object.keys(locations).length]
  const cityLocations = locations[city]
  const bhk = [1, 2, 3, 2, 4, 3, 2, 3, 1, 4][index % 10]
  const priceScale = city === 'Mumbai' ? 5.5 : city === 'Bengaluru' ? 3.2 : city === 'Delhi NCR' ? 3.6 : city === 'Hyderabad' ? 2.4 : city === 'Pune' ? 2.5 : city === 'Chennai' ? 2.2 : city === 'Mysuru' ? 1.5 : 1.3
  const basePrice = Math.round((18 + (index * 13 % 110) + bhk * 5) * priceScale / 2) * 100000
  const amenities: string[] = amenityOptions
    .filter((_, amenityIndex) => (index * 7 + amenityIndex * 11) % 13 < 2)
    .slice(0, 24)
  for (const amenity of ['Parking', 'Balcony', 'Lift', 'Security', 'Power backup', 'Gym', 'Swimming Pool']) {
    const amenityIndex = amenityOptions.findIndex((option) => option === amenity)
    if ((index + amenityIndex) % 3 !== 0 && !amenities.includes(amenity)) amenities.push(amenity)
  }
  const type = types[index % types.length]
  return {
    id: `HB-${String(index + 1).padStart(4, '0')}`,
    name: `${['Aurum', 'The Canopy', 'Bluebell', 'Serein', 'Palm Court', 'Northstar', 'Oak & Ivy', 'Solstice'][index % 8]} ${['Residences', 'Heights', 'Enclave', 'Gardens', 'Living', 'Square'][Math.floor(index / 2) % 6]}`,
    city,
    locality: cityLocations[(index * 5 + Math.floor(index / 8)) % cityLocations.length],
    type,
    bhk,
    area: bhk * 500 + 250 + (index * 79 % 900),
    price: basePrice,
    furnishing: ['Unfurnished', 'Semi-furnished', 'Fully furnished'][index % 3],
    parking: index % 4 !== 0,
    amenities,
    status: statuses[index % statuses.length],
    commute: 8 + (index * 7 % 40),
    age: index % 5,
    floor: `${1 + index % 18} of ${10 + index % 12}`,
    owner: index % 3 === 0 ? 'Habryn Homes' : index % 3 === 1 ? 'Ananya Rao' : 'Meridian Living',
    description: `Thoughtfully designed ${bhk} BHK ${type.toLowerCase()} in ${city}'s ${cityLocations[(index * 5 + Math.floor(index / 8)) % cityLocations.length]}. A welcoming, well-connected home with room to make it your own.`,
    image: `https://images.unsplash.com/${photos[index % photos.length]}?auto=format&fit=crop&w=1200&q=82`,
    posted: index % 35,
    risk: index % 17 === 0 ? 'Review' : index % 31 === 0 ? 'Warning' : 'Low',
  }
})

export const defaultRequirement: PropertyRequirement = {
  city: 'Mangaluru',
  localities: [],
  localitySearch: '',
  radius: 10,
  minBudget: 0,
  maxBudget: 0,
  monthlyAffordability: 0,
  bhk: 0,
  bhks: [],
  propertyType: 'Any',
  minArea: 0,
  maxArea: 0,
  floor: 'Any',
  furnishing: 'Any',
  amenities: [],
  allAmenities: false,
  status: 'Any',
  workplace: 'Kadri, Mangaluru',
  university: '',
  school: '',
  commute: 30,
  familySize: 2,
  children: false,
  elderly: false,
  pets: false,
  lifestyle: '',
}

export function loadSavedRequirements(): PropertyRequirement {
  const stored = localStorage.getItem('habryn:requirements')
  if (!stored) return defaultRequirement
  try {
    const saved = JSON.parse(stored) as Partial<PropertyRequirement>
    return {
      ...defaultRequirement,
      ...saved,
      bhks: saved.bhks ?? (saved.bhk ? [saved.bhk] : []),
      localitySearch: saved.localitySearch ?? '',
      radius: saved.radius ?? 10,
      floor: saved.floor ?? 'Any',
      allAmenities: saved.allAmenities ?? false,
      university: saved.university ?? '',
      school: saved.school ?? '',
    }
  } catch (error) {
    console.error('Unable to load saved property requirements.', error)
    return defaultRequirement
  }
}
