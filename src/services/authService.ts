import type { DemoUser } from '../types'

export type DemoAccount = DemoUser & { password: string }

const accounts: DemoAccount[] = [
  { role: 'user', email: 'user@habryn.com', password: 'user123', name: 'Ananya Rao' },
  { role: 'admin', email: 'admin@habryn.com', password: 'admin123', name: 'Habryn Admin' },
  { role: 'owner', email: 'owner@habryn.com', password: 'owner123', name: 'Arjun Mehta' },
  { role: 'developer', email: 'developer@habryn.com', password: 'developer123', name: 'Meridian Living' },
]

export function authenticateDemoUser(email: string, password: string, adminOnly = false): DemoUser | null {
  const account = accounts.find((item) =>
    item.email === email.trim().toLowerCase()
    && item.password === password
    && (!adminOnly || item.role === 'admin'),
  )
  return account ? { role: account.role, name: account.name, email: account.email } : null
}

export function listDemoAccounts(adminOnly = false): DemoAccount[] {
  return accounts.filter((account) => !adminOnly || account.role === 'admin')
}
