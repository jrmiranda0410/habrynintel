export interface DemoMessage {
  id: string
  from: 'them' | 'you'
  text: string
  sentAt: string
}

export interface Conversation {
  id: string
  name: string
  participant: string
  messages: DemoMessage[]
}

export function createDemoMessage(text: string, from: DemoMessage['from'] = 'you'): DemoMessage {
  return { id: `MSG-${Date.now()}`, from, text, sentAt: new Date().toISOString() }
}
