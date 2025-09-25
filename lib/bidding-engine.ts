// Dynamic Margin-Based Bidding Engine
// Optimizes ad spend allocation based on profit margins and performance

export interface BiddingRecommendation {
  skuId: string
  currentSpend: number
  recommendedSpend: number
  spendChange: number
  spendChangePercent: number
  reason: string
  expectedROAS: number
  expectedProfit: number
  priority: "high" | "medium" | "low"
}

export interface MarginData {
  skuId: string
  costOfGoods: number
  sellingPrice: number
  grossMargin: number
  marginPercent: number
}

export class DynamicBiddingEngine {
  private marginData: Map<string, MarginData> = new Map()

  constructor() {
    // Don't initialize here - will be done when SKU data is available
  }

  initializeFromSKUData(skuData: any[]) {
    this.marginData.clear()

    skuData.forEach((sku) => {
      // Use the margin data already calculated in the SKU data
      if (sku.marginPercent !== undefined && sku.costOfGoods !== undefined) {
        this.marginData.set(sku.id, {
          skuId: sku.id,
          costOfGoods: sku.costOfGoods,
          sellingPrice: sku.sellingPrice,
          grossMargin: sku.grossMargin,
          marginPercent: sku.marginPercent / 100, // Convert percentage to decimal
        })
      }
    })
  }

  // Generate bidding recommendations based on margins and performance
  generateBiddingRecommendations(skuData: any[]): BiddingRecommendation[] {
    this.initializeFromSKUData(skuData)

    const recommendations: BiddingRecommendation[] = []

    // Calculate total current spend for budget reallocation
    const totalCurrentSpend = skuData.reduce((sum, sku) => sum + sku.adSpend, 0)

    // Score each SKU for bidding priority
    const scoredSKUs = skuData
      .map((sku) => ({
        ...sku,
        score: this.calculateBiddingScore(sku),
        margin: this.marginData.get(sku.id),
      }))
      .sort((a, b) => b.score - a.score)

    // Generate recommendations
    scoredSKUs.forEach((sku, index) => {
      const recommendation = this.createBiddingRecommendation(sku, index, totalCurrentSpend)
      recommendations.push(recommendation)
    })

    return recommendations
  }

  private calculateBiddingScore(sku: any): number {
    const margin = this.marginData.get(sku.id)
    if (!margin) return 0

    // Scoring factors
    const roasScore = Math.min(sku.roas / 3, 1) * 0.3 // ROAS contribution (max 3.0)
    const marginScore = margin.marginPercent * 0.4 // Margin contribution
    const volumeScore = Math.min(sku.conversions / 50, 1) * 0.2 // Volume contribution
    const inventoryScore = sku.inventory > 50 ? 0.1 : 0 // Inventory availability

    return roasScore + marginScore + volumeScore + inventoryScore
  }

  private createBiddingRecommendation(sku: any, rank: number, totalBudget: number): BiddingRecommendation {
    const margin = this.marginData.get(sku.id)

    if (!margin) {
      console.log("[v0] Warning: No margin data found for SKU", sku.id)
      // Return a basic recommendation with no margin-based adjustments
      return {
        skuId: sku.id,
        currentSpend: sku.adSpend,
        recommendedSpend: sku.adSpend,
        spendChange: 0,
        spendChangePercent: 0,
        reason: "No margin data available. Maintain current spend.",
        expectedROAS: sku.roas,
        expectedProfit: 0,
        priority: "medium",
      }
    }

    const currentSpend = sku.adSpend

    // Determine spend adjustment based on ranking and performance
    let spendMultiplier = 1.0
    let reason = ""
    let priority: "high" | "medium" | "low" = "medium"

    if (rank < 5) {
      // Top performers - increase spend
      spendMultiplier = 1.2 + margin.marginPercent * 0.5
      reason = `High-margin, top performer. Increase spend to capture more profitable sales.`
      priority = "high"
    } else if (rank < 15) {
      // Medium performers - maintain or slight increase
      spendMultiplier = 1.0 + margin.marginPercent * 0.2
      reason = `Solid performer with ${Math.round(margin.marginPercent * 100)}% margin. Maintain current strategy.`
      priority = "medium"
    } else {
      // Lower performers - reduce spend
      spendMultiplier = 0.7 + sku.roas * 0.1
      reason = `Lower performance. Reduce spend and optimize targeting.`
      priority = "low"
    }

    // Apply inventory constraints
    if (sku.inventory < 20) {
      spendMultiplier *= 0.5
      reason += ` Limited inventory requires spend reduction.`
    }

    const recommendedSpend = Math.round(currentSpend * spendMultiplier * 100) / 100
    const spendChange = recommendedSpend - currentSpend
    const spendChangePercent = Math.round((spendChange / currentSpend) * 100)

    // Calculate expected outcomes
    const expectedROAS = sku.roas * (spendMultiplier > 1 ? 0.95 : 1.05) // Slight efficiency change
    const expectedRevenue = recommendedSpend * expectedROAS
    const expectedProfit = expectedRevenue * margin.marginPercent - recommendedSpend

    return {
      skuId: sku.id,
      currentSpend,
      recommendedSpend,
      spendChange: Math.round(spendChange * 100) / 100,
      spendChangePercent,
      reason,
      expectedROAS: Math.round(expectedROAS * 100) / 100,
      expectedProfit: Math.round(expectedProfit * 100) / 100,
      priority,
    }
  }

  // Get margin data for a specific SKU
  getMarginData(skuId: string): MarginData | undefined {
    return this.marginData.get(skuId)
  }

  // Get all margin data
  getAllMarginData(): MarginData[] {
    return Array.from(this.marginData.values())
  }

  // Simulate budget reallocation
  simulateBudgetReallocation(skuData: any[], totalBudget: number): BiddingRecommendation[] {
    const recommendations = this.generateBiddingRecommendations(skuData)

    // Adjust recommendations to fit total budget
    const totalRecommendedSpend = recommendations.reduce((sum, rec) => sum + rec.recommendedSpend, 0)
    const budgetRatio = totalBudget / totalRecommendedSpend

    return recommendations.map((rec) => ({
      ...rec,
      recommendedSpend: Math.round(rec.recommendedSpend * budgetRatio * 100) / 100,
      spendChange: Math.round((rec.recommendedSpend * budgetRatio - rec.currentSpend) * 100) / 100,
    }))
  }
}

// Singleton instance
export const biddingEngine = new DynamicBiddingEngine()
