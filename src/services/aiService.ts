import type { PropertyRequirement } from '../types'
import { matchProperties } from './matchingService'

export function analyzeRequirements(requirement: PropertyRequirement) {
  return {
    mode: 'AI/ML Matching Simulation' as const,
    analyzedAt: new Date().toISOString(),
    recommendations: matchProperties(requirement),
    notice: 'Prototype matching simulation; not a production ML model.',
  }
}
