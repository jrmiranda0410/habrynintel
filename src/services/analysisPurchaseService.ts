import type { AIAnalysis, AnalysisPurchase, AnalysisPurchaseStatus, MatchResult, Property, PropertyRequirement } from '../types'
import { readStorage, writeStorage } from './storage'

const PURCHASES_KEY = 'analysisPurchases'

export function listAnalysisPurchases(): AnalysisPurchase[] {
  return readStorage(PURCHASES_KEY, [])
}

export function hasUnlockedAnalysis(purchases: AnalysisPurchase[], userId: string, propertyId: string): boolean {
  return purchases.some((purchase) =>
    purchase.userId === userId && purchase.propertyId === propertyId && purchase.status === 'SUCCESS',
  )
}

export function findAnalysisPurchase(purchases: AnalysisPurchase[], userId: string, propertyId: string): AnalysisPurchase | undefined {
  return purchases.find((purchase) =>
    purchase.userId === userId && purchase.propertyId === propertyId && purchase.status === 'SUCCESS',
  )
}

export function createPendingPurchase(
  purchases: AnalysisPurchase[],
  userId: string,
  propertyId: string,
  paymentMethod: AnalysisPurchase['paymentMethod'],
): { purchase: AnalysisPurchase; purchases: AnalysisPurchase[] } {
  const purchase: AnalysisPurchase = {
    id: `PUR-${crypto.randomUUID()}`,
    userId,
    propertyId,
    amount: 5,
    currency: 'INR',
    status: 'PENDING',
    paymentMethod,
    createdAt: new Date().toISOString(),
    simulated: true,
  }
  return { purchase, purchases: [...purchases, purchase] }
}

export function settlePurchase(
  purchases: AnalysisPurchase[],
  purchaseId: string,
  status: Exclude<AnalysisPurchaseStatus, 'PENDING'>,
  analysis?: AIAnalysis,
): AnalysisPurchase[] {
  return purchases.map((purchase) => purchase.id !== purchaseId ? purchase : {
    ...purchase,
    status,
    ...(status === 'SUCCESS' && analysis ? {
      analysisId: analysis.id,
      analysisSnapshot: analysis,
      unlockedAt: new Date().toISOString(),
    } : {}),
  })
}

export function saveAnalysisPurchases(purchases: AnalysisPurchase[]): void {
  writeStorage(PURCHASES_KEY, purchases)
}

export async function processMockPayment(shouldFail: boolean): Promise<'SUCCESS' | 'FAILED'> {
  await new Promise((resolve) => window.setTimeout(resolve, 900))
  return shouldFail ? 'FAILED' : 'SUCCESS'
}

export function createPropertyAnalysis(
  property: Property,
  requirement: PropertyRequirement,
  match: MatchResult,
): AIAnalysis {
  if (match.property.id !== property.id) {
    throw new Error('The analysis match must belong to the purchased property.')
  }
  return {
    id: `ANL-${crypto.randomUUID()}`,
    requirement: structuredClone(requirement),
    recommendations: [structuredClone(match)],
    createdAt: new Date().toISOString(),
    mode: 'AI/ML Matching Simulation',
    simulated: true,
  }
}
