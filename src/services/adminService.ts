import { demoAppointments, demoTransactions, demoUsers } from '../data/demoData'
import { properties } from '../data/properties'

export function getAdminOverview() {
  return {
    users: demoUsers.length,
    properties: properties.length,
    appointments: demoAppointments.length,
    transactions: demoTransactions.length,
    revenue: demoTransactions.reduce((total, transaction) => total + transaction.fee, 0),
    simulated: true,
  }
}

export function exportDemoReport(): string {
  const overview = getAdminOverview()
  return [
    'Metric,Value,Mode',
    `Users,${overview.users},Demo data`,
    `Properties,${overview.properties},Demo data`,
    `Appointments,${overview.appointments},Demo data`,
    `Transactions,${overview.transactions},Demo data`,
    `Simulated fees,${overview.revenue},Demo data`,
  ].join('\n')
}
