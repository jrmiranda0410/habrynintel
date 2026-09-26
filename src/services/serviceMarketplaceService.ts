import { demoServiceProviders } from '../data/demoData'
import type { ServiceProvider } from '../types'

export function findProviders(category?: string, city?: string): ServiceProvider[] {
  return demoServiceProviders.filter((provider) =>
    (!category || provider.category.toLowerCase().includes(category.toLowerCase()))
    && (!city || provider.city === city),
  )
}
