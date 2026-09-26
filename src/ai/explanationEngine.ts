import type { Property, PropertyRequirement } from '../types'

export function explainMatch(property: Property, requirement: PropertyRequirement) {
  const reasons = [
    ...(requirement.maxBudget <= 0 ? ['No maximum budget set'] : property.price <= requirement.maxBudget ? ['Meets your maximum budget'] : ['Asking price exceeds your maximum budget']),
    ...(requirement.bhks.length > 0 || requirement.bhk > 0 ? [`${property.bhk} BHK matches your requirement`] : []),
    ...(requirement.city === 'Any' ? [] : [`${property.city} matches your preferred city`]),
  ]
  if (property.commute <= requirement.commute) reasons.push(`Estimated ${property.commute}-minute commute is within your range`)
  if (requirement.monthlyAffordability > 0 && property.price * 0.0085 <= requirement.monthlyAffordability) reasons.push('Estimated monthly housing cost is within your comfort range')
  if (requirement.localities.includes(property.locality)) reasons.push(`${property.locality} matches your preferred area`)
  const propertyAmenities = new Set(property.amenities.map((amenity) => amenity.toLowerCase()))
  if (property.parking && requirement.amenities.some((amenity) => amenity.toLowerCase() === 'parking')) reasons.push('Parking is available')
  const matched = requirement.amenities.filter((amenity) => propertyAmenities.has(amenity.toLowerCase()))
  if (matched.length > 0 && !matched.includes('Parking')) reasons.push(`${matched.slice(0, 2).join(' and ')} included`)
  if (requirement.allAmenities && matched.length > 0) reasons.push(`Includes ${matched.length} of your selected amenities`)
  const concerns = [
    ...(requirement.allAmenities ? [] : requirement.amenities.filter((amenity) => !propertyAmenities.has(amenity.toLowerCase())).slice(0, 4).map((amenity) => `${amenity} not listed — verify with owner`)),
    ...(property.commute > requirement.commute ? [`Estimated commute is ${property.commute} minutes, above your preferred range`] : []),
    ...(requirement.monthlyAffordability > 0 && property.price * 0.0085 > requirement.monthlyAffordability ? ['Illustrative monthly housing cost is above your comfort range'] : []),
    ...(property.risk !== 'Low' ? ['Demo listing has a risk signal; independently verify details'] : []),
  ]
  return { reasons, concerns }
}
