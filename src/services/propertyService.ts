import { properties } from '../data/properties'
import type { Property } from '../types'

export function listProperties(): Property[] {
  return properties
}

export function getProperty(id: string): Property | undefined {
  return properties.find((property) => property.id === id)
}
