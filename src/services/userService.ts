import { demoUsers } from '../data/demoData'
import type { DemoProfile } from '../types'

export function searchDemoUsers(query = '', role = 'Any'): DemoProfile[] {
  const normalizedQuery = query.trim().toLowerCase()
  return demoUsers.filter((user) =>
    (role === 'Any' || user.role === role)
    && (!normalizedQuery || `${user.name} ${user.email}`.toLowerCase().includes(normalizedQuery)),
  )
}
