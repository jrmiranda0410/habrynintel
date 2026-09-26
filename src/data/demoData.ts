import type { Appointment, DemoProfile, DemoTransaction, Project, RoommateProfile, ServiceProvider, StudentStay } from '../types'
import { properties } from './properties'

const cities = ['Mangaluru', 'Bengaluru', 'Mysuru', 'Hyderabad', 'Chennai', 'Pune', 'Mumbai', 'Delhi NCR']
const givenNames = ['Ananya', 'Aarav', 'Meera', 'Ishaan', 'Kavya', 'Arjun', 'Diya', 'Rohan', 'Nisha', 'Kabir', 'Tara', 'Dev', 'Sana', 'Aditya', 'Leela']
const surnames = ['Rao', 'Mehta', 'Sharma', 'Nair', 'Shetty', 'Iyer', 'Kapoor', 'Patel', 'Menon', 'Das']
const isoDate = (year: number, month: number, day: number) => new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10)
const roles = [
  'user', 'user', 'user', 'user', 'user', 'user', 'user', 'user', 'user', 'user',
  'owner', 'owner', 'owner', 'owner', 'owner',
  'developer', 'developer', 'developer', 'developer',
  'admin',
] as const

export const demoUsers: DemoProfile[] = Array.from({ length: 60 }, (_, index) => ({
  id: `USR-${String(index + 1).padStart(4, '0')}`,
  name: `${givenNames[index % givenNames.length]} ${surnames[(index * 3 + Math.floor(index / 4)) % surnames.length]}`,
  email: `demo${index + 1}@habryn.com`,
  role: roles[index % roles.length],
  status: index % 19 === 0 ? 'Suspended' : index % 9 === 0 ? 'Pending' : 'Active',
  joined: isoDate(2024, index % 12, 1 + index % 27),
}))

export const demoAppointments: Appointment[] = Array.from({ length: 36 }, (_, index) => ({
  id: `VIS-${String(index + 1001)}`,
  propertyId: properties[index % properties.length].id,
  date: isoDate(2026, 8 + Math.floor(index / 30), 26 + index % 5),
  time: ['10:30 AM', '12:00 PM', '2:00 PM', '4:30 PM'][index % 4],
  status: index % 6 === 0 ? 'Completed' : index % 11 === 0 ? 'Cancelled' : 'Upcoming',
}))

export const demoTransactions: DemoTransaction[] = Array.from({ length: 24 }, (_, index) => {
  const property = properties[index * 3 % properties.length]
  return {
    id: `TXN-${String(index + 3201)}`,
    buyer: demoUsers[index % demoUsers.length].name,
    seller: property.owner,
    propertyId: property.id,
    value: property.price,
    fee: Math.round(property.price * .01),
    status: (['Interest', 'Viewing', 'Offer', 'Verification', 'Completed'] as const)[index % 5],
    date: isoDate(2026, index % 9, 1 + index % 27),
  }
})

const categories = ['Cleaning', 'Moving', 'AC service', 'Plumbing', 'Electrical', 'Furniture', 'Internet', 'Storage', 'Pest control', 'Groceries', 'Maintenance']
export const demoServiceProviders: ServiceProvider[] = Array.from({ length: 33 }, (_, index) => ({
  id: `SVC-${String(index + 1).padStart(3, '0')}`,
  name: `${['HomeFresh', 'MoveEasy', 'ChillPoint', 'FlowRight', 'BrightSpark', 'Comfort & Co.', 'ConnectHome', 'Spacewise', 'PureHome'][index % 9]} ${['Care', 'Services', 'Mangaluru', 'Local'][Math.floor(index / 9) % 4]}`,
  category: categories[index % categories.length],
  rating: Number((4 + (index % 10) / 10).toFixed(1)),
  priceFrom: [399, 1299, 599, 299, 350, 899, 499, 899, 599, 399, 299][index % categories.length],
  city: cities[index % cities.length],
}))

export const demoRoommates: RoommateProfile[] = Array.from({ length: 12 }, (_, index) => ({
  id: `ROOM-${String(index + 1).padStart(3, '0')}`,
  name: `${givenNames[(index + 4) % givenNames.length]} ${surnames[(index + 2) % surnames.length]}`,
  city: cities[index % cities.length],
  university: ['NITK Surathkal', 'IIM Bangalore', 'University of Mysore', 'IIIT Hyderabad'][index % 4],
  budget: 10000 + (index * 3500 % 25000),
  moveIn: 'October 2026',
  compatibility: 78 + index % 20,
  lifestyle: ['Early riser · quiet evenings', 'Hybrid work · social', 'Student · tidy shared spaces'][index % 3],
}))

export const demoConversations = [
  'Aurum Residences', 'Bluebell Heights', 'Ananya Rao', 'The Canopy Gardens',
  'Meridian Living', 'Palm Court', 'Oakfield Communities', 'Northstar Square',
  'Solstice Living', 'Aarav Mehta',
].map((name, index) => ({
  id: `CONV-${String(index + 1).padStart(3, '0')}`,
  name,
  participant: index % 2 === 0 ? 'Property owner' : 'Developer',
  lastMessage: 'Let’s find a time that works.',
}))

export const demoProjects: Project[] = Array.from({ length: 12 }, (_, index) => ({
  id: `PRJ-${String(index + 1).padStart(3, '0')}`,
  name: `${['Meridian', 'Oakfield', 'Bluebell', 'Northstar'][index % 4]} ${['Residences', 'Gardens', 'Living'][Math.floor(index / 4)]}`,
  developer: ['Meridian Living', 'Oakfield Communities', 'Habryn Homes'][index % 3],
  city: cities[index % cities.length],
  locality: properties[index * 3].locality,
  units: 24 + index * 7,
  possession: ['Ready to move', 'Q2 2027', 'Q4 2027'][index % 3],
  status: ['New', 'Under construction', 'Ready to move'][index % 3],
}))

const universities = ['NITK Surathkal', 'IIM Bangalore', 'University of Mysore', 'IIIT Hyderabad', 'Anna University', 'Savitribai Phule Pune University', 'University of Mumbai', 'Delhi University']
const studentLocalities = ['Kadri', 'Bejai', 'Whitefield', 'Indiranagar', 'Gokulam', 'Hebbal', 'Gachibowli', 'Kondapur', 'Adyar', 'OMR', 'Baner', 'Hinjewadi', 'Powai', 'Thane', 'Noida', 'Gurugram']
export const studentStays: StudentStay[] = Array.from({ length: 32 }, (_, index) => ({
  id: `STU-${String(index + 1).padStart(3, '0')}`,
  name: `${['StudyNest', 'Campus Corner', 'The Scholar House', 'BrightStay'][index % 4]} ${['PG', 'Shared Home', 'Student Living', 'Residence'][Math.floor(index / 4) % 4]}`,
  city: cities[index % cities.length],
  locality: studentLocalities[index % studentLocalities.length],
  university: universities[index % universities.length],
  commuteMinutes: 6 + (index * 7 % 29),
  monthlyRent: 7500 + (index * 1700 % 18000),
  furnished: index % 4 !== 0,
  internet: index % 5 !== 0,
  meals: index % 3 !== 0,
  available: index % 7 !== 0,
}))
