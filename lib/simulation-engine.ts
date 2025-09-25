// What-If Simulation Engine
// Allows managers to test different scenarios and see projected outcomes

export interface SimulationScenario {
  id: string
  name: string
  description: string
  changes: SimulationChange[]
  createdAt: string
}

export interface SimulationChange {
  skuId: string
  type: "spend" | "inventory" | "price" | "margin"
  currentValue: number
  newValue: number
  changePercent: number
}

export interface SimulationResult {
  scenarioId: string
  projectedMetrics: {
    totalROAS: number
    totalSpend: number
    totalRevenue: number
    totalProfit: number
    totalConversions: number
    roasChange: number
    revenueChange: number
    profitChange: number
  }
  skuResults: SimulationSKUResult[]
  riskFactors: string[]
  recommendations: string[]
}

export interface SimulationSKUResult {
  skuId: string
  name: string
  currentROAS: number
  projectedROAS: number
  currentRevenue: number
  projectedRevenue: number
  currentProfit: number
  projectedProfit: number
  riskLevel: "low" | "medium" | "high"
}

export class SimulationEngine {
  private scenarios: Map<string, SimulationScenario> = new Map()
  private baselineMetrics: any = null

  constructor() {
    this.initializeDefaultScenarios()
  }

  private initializeDefaultScenarios() {
    // Create some default "what-if" scenarios
    const scenarios = [
      {
        id: "increase-top-performers",
        name: "Increase Top Performers Spend by 50%",
        description: "Boost ad spend on top 5 performing SKUs to maximize revenue",
        changes: [],
      },
      {
        id: "reduce-low-performers",
        name: "Reduce Low Performers Spend by 30%",
        description: "Cut spending on underperforming SKUs to improve efficiency",
        changes: [],
      },
      {
        id: "restock-critical",
        name: "Restock Critical Inventory",
        description: "Add inventory to SKUs at risk of stockout",
        changes: [],
      },
    ]

    scenarios.forEach((scenario) => {
      this.scenarios.set(scenario.id, {
        ...scenario,
        createdAt: new Date().toISOString(),
      })
    })
  }

  // Set baseline metrics for comparison
  setBaseline(skuData: any[], dashboardMetrics: any) {
    this.baselineMetrics = {
      skuData: [...skuData],
      dashboardMetrics: { ...dashboardMetrics },
    }
  }

  // Create a new simulation scenario
  createScenario(name: string, description: string, changes: SimulationChange[]): string {
    const id = `scenario-${Date.now()}`
    const scenario: SimulationScenario = {
      id,
      name,
      description,
      changes,
      createdAt: new Date().toISOString(),
    }

    this.scenarios.set(id, scenario)
    return id
  }

  // Run simulation for a scenario
  runSimulation(scenarioId: string, currentSKUData: any[]): SimulationResult {
    const scenario = this.scenarios.get(scenarioId)
    if (!scenario) {
      throw new Error(`Scenario ${scenarioId} not found`)
    }

    // Apply changes to create simulated data
    const simulatedData = this.applyScenarioChanges(currentSKUData, scenario.changes)

    // Calculate projected metrics
    const projectedMetrics = this.calculateProjectedMetrics(simulatedData)

    // Generate SKU-level results
    const skuResults = this.generateSKUResults(currentSKUData, simulatedData)

    // Identify risk factors
    const riskFactors = this.identifyRiskFactors(simulatedData, scenario.changes)

    // Generate recommendations
    const recommendations = this.generateRecommendations(projectedMetrics, riskFactors)

    return {
      scenarioId,
      projectedMetrics,
      skuResults,
      riskFactors,
      recommendations,
    }
  }

  private applyScenarioChanges(skuData: any[], changes: SimulationChange[]): any[] {
    const simulatedData = skuData.map((sku) => ({ ...sku }))

    changes.forEach((change) => {
      const sku = simulatedData.find((s) => s.id === change.skuId)
      if (!sku) return

      switch (change.type) {
        case "spend":
          sku.adSpend = change.newValue
          // Recalculate dependent metrics
          sku.revenue = sku.adSpend * sku.roas
          break
        case "inventory":
          sku.inventory = change.newValue
          // Update stock status
          if (sku.inventory === 0) sku.stockStatus = "out"
          else if (sku.inventory < 50) sku.stockStatus = "low"
          else if (sku.inventory < 200) sku.stockStatus = "medium"
          else sku.stockStatus = "high"
          break
        case "price":
          // Simulate price change impact on conversions and revenue
          const priceChangeRatio = change.newValue / change.currentValue
          sku.conversions = Math.round(sku.conversions / Math.sqrt(priceChangeRatio))
          sku.revenue = sku.conversions * change.newValue
          sku.roas = sku.revenue / sku.adSpend
          break
      }
    })

    return simulatedData
  }

  private calculateProjectedMetrics(simulatedData: any[]) {
    const totalSpend = simulatedData.reduce((sum, sku) => sum + sku.adSpend, 0)
    const totalRevenue = simulatedData.reduce((sum, sku) => sum + sku.revenue, 0)
    const totalConversions = simulatedData.reduce((sum, sku) => sum + sku.conversions, 0)
    const totalROAS = totalRevenue / totalSpend

    // Calculate profit (using margin data from bidding engine)
    const totalProfit = simulatedData.reduce((sum, sku) => {
      const margin = biddingEngine.getMarginData(sku.id)
      const profit = margin ? sku.revenue * margin.marginPercent - sku.adSpend : 0
      return sum + profit
    }, 0)

    // Calculate changes from baseline
    const baseline = this.baselineMetrics?.dashboardMetrics
    const roasChange = baseline ? ((totalROAS - baseline.totalROAS) / baseline.totalROAS) * 100 : 0
    const revenueChange = baseline ? ((totalRevenue - baseline.totalRevenue) / baseline.totalRevenue) * 100 : 0
    const profitChange = baseline
      ? ((totalProfit - (baseline.totalProfit || 0)) / (baseline.totalProfit || 1)) * 100
      : 0

    return {
      totalROAS: Math.round(totalROAS * 100) / 100,
      totalSpend: Math.round(totalSpend * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalProfit: Math.round(totalProfit * 100) / 100,
      totalConversions,
      roasChange: Math.round(roasChange * 100) / 100,
      revenueChange: Math.round(revenueChange * 100) / 100,
      profitChange: Math.round(profitChange * 100) / 100,
    }
  }

  private generateSKUResults(currentData: any[], simulatedData: any[]): SimulationSKUResult[] {
    return simulatedData.map((simSku) => {
      const currentSku = currentData.find((sku) => sku.id === simSku.id)!
      const margin = biddingEngine.getMarginData(simSku.id)

      const currentProfit = margin ? currentSku.revenue * margin.marginPercent - currentSku.adSpend : 0
      const projectedProfit = margin ? simSku.revenue * margin.marginPercent - simSku.adSpend : 0

      // Determine risk level
      let riskLevel: "low" | "medium" | "high" = "low"
      if (simSku.roas < 1.0 || simSku.inventory < 20) riskLevel = "high"
      else if (simSku.roas < 1.5 || simSku.inventory < 50) riskLevel = "medium"

      return {
        skuId: simSku.id,
        name: simSku.name,
        currentROAS: currentSku.roas,
        projectedROAS: simSku.roas,
        currentRevenue: currentSku.revenue,
        projectedRevenue: simSku.revenue,
        currentProfit: Math.round(currentProfit * 100) / 100,
        projectedProfit: Math.round(projectedProfit * 100) / 100,
        riskLevel,
      }
    })
  }

  private identifyRiskFactors(simulatedData: any[], changes: SimulationChange[]): string[] {
    const risks: string[] = []

    // Check for low ROAS
    const lowROASSKUs = simulatedData.filter((sku) => sku.roas < 1.0)
    if (lowROASSKUs.length > 0) {
      risks.push(`${lowROASSKUs.length} SKUs projected to have ROAS below 1.0`)
    }

    // Check for inventory issues
    const lowInventorySKUs = simulatedData.filter((sku) => sku.inventory < 20)
    if (lowInventorySKUs.length > 0) {
      risks.push(`${lowInventorySKUs.length} SKUs at risk of stockout`)
    }

    // Check for large spend increases
    const largeSpendIncreases = changes.filter((change) => change.type === "spend" && change.changePercent > 50)
    if (largeSpendIncreases.length > 0) {
      risks.push(`Large spend increases may impact campaign efficiency`)
    }

    return risks
  }

  private generateRecommendations(metrics: any, risks: string[]): string[] {
    const recommendations: string[] = []

    if (metrics.roasChange > 10) {
      recommendations.push("Strong ROAS improvement projected - consider implementing this scenario")
    } else if (metrics.roasChange < -5) {
      recommendations.push("ROAS decline projected - review changes carefully before implementing")
    }

    if (metrics.profitChange > 15) {
      recommendations.push("Significant profit increase expected - prioritize this scenario")
    }

    if (risks.length > 2) {
      recommendations.push("Multiple risk factors identified - consider phased implementation")
    }

    if (recommendations.length === 0) {
      recommendations.push("Scenario shows moderate impact - monitor closely if implemented")
    }

    return recommendations
  }

  // Get all scenarios
  getAllScenarios(): SimulationScenario[] {
    return Array.from(this.scenarios.values())
  }

  // Delete a scenario
  deleteScenario(scenarioId: string): boolean {
    return this.scenarios.delete(scenarioId)
  }

  // Generate quick scenario for spend adjustment
  generateSpendAdjustmentScenario(skuId: string, spendChange: number, currentSpend: number): SimulationChange[] {
    return [
      {
        skuId,
        type: "spend",
        currentValue: currentSpend,
        newValue: currentSpend + spendChange,
        changePercent: (spendChange / currentSpend) * 100,
      },
    ]
  }
}

// Singleton instance
export const simulationEngine = new SimulationEngine()

// Import bidding engine for margin data access
import { biddingEngine } from "./bidding-engine"
