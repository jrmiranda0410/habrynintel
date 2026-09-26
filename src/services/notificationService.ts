export interface DemoNotification {
  id: string
  title: string
  message: string
  createdAt: string
  read: boolean
}

export function createDemoNotification(title: string, message: string): DemoNotification {
  return { id: `NTF-${Date.now()}`, title, message, createdAt: new Date().toISOString(), read: false }
}
