import type { Property, PropertyRequirement } from '../types'

export function confidenceFor(property: Property, requirement: PropertyRequirement): 'High' | 'Medium' | 'Low' {
  const details = [property.area > 0, property.price > 0, Boolean(property.locality), property.amenities.length >= 3]
  const hasSpecificCriteria = requirement.localities.length > 0 || requirement.amenities.length > 0
  const count = details.filter(Boolean).length + Number(hasSpecificCriteria)
  return count >= 5 ? 'High' : count >= 3 ? 'Medium' : 'Low'
}
