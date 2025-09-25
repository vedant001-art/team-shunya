// ML Engine for predictive analytics using Random Forest algorithm
// Implements stockout prediction and demand forecasting

export interface MLPrediction {
  skuId: string
  stockoutRisk: number // 0-1 probability
  daysUntilStockout: number
  demandForecast: number
  confidence: number
  factors: {
    salesVelocity: number
    seasonality: number
    adSpendImpact: number
    inventoryTrend: number
  }
}

export interface RandomForestNode {
  feature: string
  threshold: number
  left?: RandomForestNode
  right?: RandomForestNode
  prediction?: number
}

export interface RandomForestTree {
  root: RandomForestNode
  importance: Record<string, number>
}

export class MLPredictionEngine {
  private trees: RandomForestTree[] = []
  private featureImportance: Record<string, number> = {}

  constructor() {
    this.initializeModel()
  }

  // Initialize pre-trained Random Forest model with synthetic weights
  private initializeModel() {
    // Simulate 10 decision trees for Random Forest
    for (let i = 0; i < 10; i++) {
      this.trees.push(this.createDecisionTree(i))
    }

    // Calculate feature importance across all trees
    this.calculateFeatureImportance()
  }

  private createDecisionTree(seed: number): RandomForestTree {
    // Create a decision tree with realistic business logic
    const root: RandomForestNode = {
      feature: "salesVelocity",
      threshold: 10 + seed * 2, // Vary thresholds per tree
      left: {
        feature: "inventory",
        threshold: 50,
        left: { prediction: 0.8 }, // High risk if low inventory + high sales
        right: { prediction: 0.3 },
      },
      right: {
        feature: "adSpendTrend",
        threshold: 0.1,
        left: { prediction: 0.2 },
        right: { prediction: 0.6 }, // Higher risk if increasing ad spend
      },
    }

    return {
      root,
      importance: {
        salesVelocity: 0.35,
        inventory: 0.25,
        adSpendTrend: 0.2,
        seasonality: 0.15,
        conversionRate: 0.05,
      },
    }
  }

  private calculateFeatureImportance() {
    const features = ["salesVelocity", "inventory", "adSpendTrend", "seasonality", "conversionRate"]

    features.forEach((feature) => {
      this.featureImportance[feature] =
        this.trees.reduce((sum, tree) => sum + (tree.importance[feature] || 0), 0) / this.trees.length
    })
  }

  // Predict stockout risk using Random Forest ensemble
  predictStockout(skuData: any): MLPrediction {
    const features = this.extractFeatures(skuData)

    // Get predictions from all trees
    const predictions = this.trees.map((tree) => this.predictWithTree(tree.root, features))

    // Ensemble prediction (average)
    const stockoutRisk = predictions.reduce((sum, pred) => sum + pred, 0) / predictions.length

    // Calculate days until stockout based on sales velocity
    const salesVelocity = features.salesVelocity
    const daysUntilStockout = salesVelocity > 0 ? Math.max(1, Math.floor(skuData.inventory / salesVelocity)) : 999

    // Demand forecast based on historical patterns and ad spend
    const demandForecast = this.forecastDemand(skuData, features)

    // Confidence based on prediction variance
    const variance = predictions.reduce((sum, pred) => sum + Math.pow(pred - stockoutRisk, 2), 0) / predictions.length
    const confidence = Math.max(0.5, 1 - variance)

    return {
      skuId: skuData.id,
      stockoutRisk: Math.round(stockoutRisk * 100) / 100,
      daysUntilStockout,
      demandForecast: Math.round(demandForecast),
      confidence: Math.round(confidence * 100) / 100,
      factors: {
        salesVelocity: features.salesVelocity,
        seasonality: features.seasonality,
        adSpendImpact: features.adSpendTrend,
        inventoryTrend: features.inventoryTrend,
      },
    }
  }

  private extractFeatures(skuData: any) {
    // Extract relevant features for ML model
    const salesVelocity = skuData.conversions / 7 // Daily sales rate
    const adSpendTrend = skuData.adSpend > 1000 ? 0.2 : -0.1 // Simplified trend
    const seasonality = Math.sin((Date.now() / (1000 * 60 * 60 * 24 * 365)) * 2 * Math.PI) * 0.3 + 0.7
    const inventoryTrend = skuData.inventory < 100 ? -0.5 : 0.2

    return {
      salesVelocity,
      inventory: skuData.inventory,
      adSpendTrend,
      seasonality,
      conversionRate: skuData.conversionRate,
      inventoryTrend,
    }
  }

  private predictWithTree(node: RandomForestNode, features: any): number {
    if (node.prediction !== undefined) {
      return node.prediction
    }

    const featureValue = features[node.feature] || 0
    if (featureValue <= node.threshold) {
      return node.left ? this.predictWithTree(node.left, features) : 0.5
    } else {
      return node.right ? this.predictWithTree(node.right, features) : 0.5
    }
  }

  private forecastDemand(skuData: any, features: any): number {
    // Simple demand forecasting based on current trends
    const baseDemand = skuData.conversions * 7 // Weekly demand
    const seasonalityMultiplier = features.seasonality
    const adSpendMultiplier = 1 + (skuData.roas - 1) * 0.1 // Higher ROAS = higher demand

    return baseDemand * seasonalityMultiplier * adSpendMultiplier
  }

  // Get feature importance for model interpretability
  getFeatureImportance(): Record<string, number> {
    return { ...this.featureImportance }
  }

  // Batch predict for multiple SKUs
  batchPredict(skuDataArray: any[]): MLPrediction[] {
    return skuDataArray.map((sku) => this.predictStockout(sku))
  }
}

// Singleton instance
export const mlEngine = new MLPredictionEngine()
