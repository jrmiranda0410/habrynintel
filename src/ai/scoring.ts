import type { Property, PropertyRequirement } from '../types'
import { amenityCoverageTarget, matchingWeights } from './matchingConfig'

export function passesHardFilters(property: Property, requirement: PropertyRequirement): boolean {
  if (requirement.city !== 'Any' && property.city !== requirement.city) return false
  if (requirement.maxBudget > 0 && property.price > requirement.maxBudget) return false
  if (requirement.minBudget > 0 && property.price < requirement.minBudget) return false
  if (requirement.bhks.length > 0 && !requirement.bhks.includes(property.bhk)) return false
  if (requirement.bhks.length === 0 && requirement.bhk > 0 && property.bhk !== requirement.bhk) return false
  if (requirement.propertyType !== 'Any' && property.type !== requirement.propertyType) return false
  if (requirement.localities.length > 0 && !requirement.localities.includes(property.locality)) return false
  if (requirement.minArea > 0 && property.area < requirement.minArea) return false
  if (requirement.maxArea > 0 && property.area > requirement.maxArea) return false
  if (requirement.status !== 'Any' && property.status !== requirement.status) return false
  return true
}

export function scoreProperty(property: Property, requirement: PropertyRequirement): number {
  const weights = matchingWeights
  const budgetFit = requirement.maxBudget > 0
    ? Math.max(0, 1 - (requirement.maxBudget - property.price) / requirement.maxBudget)
    : 0.72
  const estimatedMonthlyCost = property.price * 0.0085
  const monthlyFit = requirement.monthlyAffordability > 0
    ? Math.max(0, 1 - Math.max(0, estimatedMonthlyCost - requirement.monthlyAffordability) / requirement.monthlyAffordability)
    : 0.72
  const locationFit = requirement.localities.length === 0 || requirement.localities.includes(property.locality) ? 1 : 0.55
  const commuteFit = Math.max(0, 1 - property.commute / Math.max(requirement.commute, 1))
  const idealArea = requirement.minArea > 0 && requirement.maxArea > 0
    ? (requirement.minArea + requirement.maxArea) / 2
    : property.bhk * 550 + 350
  const areaFit = Math.max(0, 1 - Math.abs(property.area - idealArea) / Math.max(idealArea, 1))
  const normalizedAmenities = new Set(property.amenities.map((item) => item.toLowerCase()))
  const matchedAmenities = requirement.amenities.filter((item) => normalizedAmenities.has(item.toLowerCase())).length
  const broadAmenitySelection = requirement.allAmenities || requirement.amenities.length > 12
  const amenityFit = broadAmenitySelection
    ? Math.min(normalizedAmenities.size / amenityCoverageTarget, 1)
    : requirement.amenities.length > 0 ? matchedAmenities / requirement.amenities.length : 0.72
  const furnishingFit = requirement.furnishing === 'Any' || property.furnishing === requirement.furnishing ? 1 : 0.35
  const statusFit = requirement.status === 'Any' || property.status === requirement.status ? 1 : 0.4
  const familyFit = (requirement.children && !property.amenities.includes('Security') ? 0.3 : 0.75)
    + (requirement.elderly && !property.amenities.includes('Lift') ? 0.2 : 0)
  const requestedBhk = requirement.bhks.length > 0 ? requirement.bhks.includes(property.bhk) : requirement.bhk > 0 ? property.bhk === requirement.bhk : true
  const floorNumber = Number(property.floor.split(' ')[0])
  const floorFit = requirement.floor === 'Any'
    ? 0.72
    : requirement.floor === 'Ground' ? floorNumber === 1 ? 1 : 0
      : requirement.floor === 'Low' ? floorNumber <= 5 ? 1 : 0
        : requirement.floor === 'Mid' ? floorNumber >= 6 && floorNumber <= 12 ? 1 : 0
          : requirement.floor === 'High' ? floorNumber >= 13 ? 1 : 0
            : 0.72
  const locationFitByRange = requirement.radius > 0 && (requirement.workplace || requirement.university || requirement.school)
    ? Math.max(0, 1 - property.commute / Math.max(requirement.commute, 1))
    : locationFit
  return Math.round(
    budgetFit * weights.budget
      + locationFitByRange * weights.location
      + (requestedBhk ? weights.bhk : 0)
      + monthlyFit * weights.monthlyAffordability
      + commuteFit * weights.commute
      + areaFit * weights.area
      + amenityFit * weights.amenities
      + furnishingFit * weights.furnishing
      + statusFit * weights.propertyStatus
      + Math.min(familyFit, 1) * weights.family
      + floorFit * weights.floor,
  )
}
