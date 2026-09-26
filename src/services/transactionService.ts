import { demoTransactions } from '../data/demoData'
import type { DemoTransaction } from '../types'

export function listDemoTransactions(): DemoTransaction[] {
  return demoTransactions
}
