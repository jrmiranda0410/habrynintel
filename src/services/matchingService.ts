import { properties } from '../data/properties'
import type { MatchResult, PropertyRequirement } from '../types'
import { confidenceFor } from '../ai/confidenceEngine'
import { explainMatch } from '../ai/explanationEngine'
import { passesHardFilters, scoreProperty } from '../ai/scoring'

export function matchProperties(requirement: PropertyRequirement): MatchResult[] {
  return properties
    .filter((property) => passesHardFilters(property, requirement))
    .map((property) => {
      const { reasons, concerns } = explainMatch(property, requirement)
      return {
        property,
        score: scoreProperty(property, requirement),
        confidence: confidenceFor(property, requirement),
        reasons,
        concerns,
      }
    })
    .sort((first, second) => second.score - first.score)
}
