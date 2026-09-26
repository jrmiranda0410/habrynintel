export type Role = 'user' | 'admin' | 'owner' | 'developer'
export type PropertyStatus = 'Ready to move' | 'Under construction' | 'New' | 'Resale'

export interface Property {
  id: string
  name: string
  city: string
  locality: string
  type: string
  bhk: number
  area: number
  price: number
  furnishing: string
  parking: boolean
  amenities: string[]
  status: PropertyStatus
  commute: number
  age: number
  floor: string
  owner: string
  description: string
  image: string
  posted: number
  risk: 'Low' | 'Review' | 'Warning'
}

export interface PropertyRequirement {
  city: string
  localities: string[]
  localitySearch: string
  radius: number
  minBudget: number
  maxBudget: number
  monthlyAffordability: number
  bhk: number
  bhks: number[]
  propertyType: string
  minArea: number
  maxArea: number
  floor: string
  furnishing: string
  amenities: string[]
  allAmenities: boolean
  status: string
  workplace: string
  university: string
  school: string
  commute: number
  familySize: number
  children: boolean
  elderly: boolean
  pets: boolean
  lifestyle: string
}

export interface HousingProfile {
  name: string
  age: string
  familySize: string
  children: boolean
  elderly: boolean
  pets: boolean
  income: string
  budget: string
  monthlyAffordability: string
  currentLocation: string
  workplace: string
  university: string
  preferredCities: string
  preferredAreas: string
  propertyType: string
  bhk: string
  area: string
  furnishing: string
  amenities: string[]
  maxCommute: string
  preferredTransport: string
}

export interface MatchResult {
  property: Property
  score: number
  confidence: 'High' | 'Medium' | 'Low'
  reasons: string[]
  concerns: string[]
}

export interface DemoUser {
  email: string
  name: string
  role: Role
}

export interface Appointment {
  id: string
  propertyId: string
  date: string
  time: string
  status: 'Upcoming' | 'Completed' | 'Cancelled'
}

export interface DemoProfile {
  id: string
  name: string
  email: string
  role: Role
  status: 'Active' | 'Pending' | 'Suspended'
  joined: string
}

export interface DemoTransaction {
  id: string
  buyer: string
  seller: string
  propertyId: string
  value: number
  fee: number
  status: 'Interest' | 'Viewing' | 'Offer' | 'Verification' | 'Completed'
  date: string
}

export interface ServiceProvider {
  id: string
  name: string
  category: string
  rating: number
  priceFrom: number
  city: string
}

export interface RoommateProfile {
  id: string
  name: string
  city: string
  university: string
  budget: number
  moveIn: string
  compatibility: number
  lifestyle: string
}

export interface Project {
  id: string
  name: string
  developer: string
  city: string
  locality: string
  units: number
  possession: string
  status: string
}

export interface StudentStay {
  id: string
  name: string
  city: string
  locality: string
  university: string
  commuteMinutes: number
  monthlyRent: number
  furnished: boolean
  internet: boolean
  meals: boolean
  available: boolean
}

export type User = DemoProfile
export type Transaction = DemoTransaction
export type Roommate = RoommateProfile

export interface Developer {
  id: string
  name: string
  city: string
  projectCount: number
  status: 'Active' | 'Under review' | 'Suspended'
}

export interface DocumentRecord {
  id: string
  propertyId: string
  fileName: string
  kind: 'Agreement' | 'Property document' | 'Brochure' | 'Payment plan'
  status: 'Uploaded' | 'Needs review' | 'Missing'
  uploadedAt: string
}

export interface Home {
  id: string
  propertyId: string
  ownerId: string
  moveInDate: string
  status: 'Current' | 'Previous'
}

export interface MaintenanceRecord {
  id: string
  homeId: string
  category: 'AC' | 'Plumbing' | 'Electrical' | 'Painting' | 'Appliances' | 'Renovation' | 'Inspection' | 'Warranty'
  date: string
  description: string
  reminderDate?: string
}

export interface RiskSignal {
  id: string
  propertyId: string
  severity: 'Low concern' | 'Review' | 'Warning' | 'Insufficient data'
  description: string
  simulated: true
}

export interface AIAnalysis {
  id: string
  requirement: PropertyRequirement
  recommendations: MatchResult[]
  createdAt: string
  mode: 'AI/ML Matching Simulation'
  simulated: true
}

export type AnalysisPurchaseStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED'

export interface AnalysisPurchase {
  id: string
  userId: string
  propertyId: string
  amount: 5
  currency: 'INR'
  status: AnalysisPurchaseStatus
  paymentMethod: 'MOCK_UPI' | 'MOCK_CARD'
  createdAt: string
  unlockedAt?: string
  analysisId?: string
  analysisSnapshot?: AIAnalysis
  simulated: true
}
