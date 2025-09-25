// Utility functions for exporting data

import type { SKUData, CampaignData } from "./mock-data"

export function exportSKUDataToCSV(data: SKUData[], filename = "sku-roas-data.csv") {
  const headers = [
    "SKU ID",
    "Product Name",
    "Category",
    "Brand",
    "Size",
    "Color",
    "Material",
    "Weight (lbs)",
    "Dimensions",
    "Supplier",
    "Supplier Code",
    "Barcode",
    "Tags",
    "Seasonality",
    "Target Audience",
    "Ad Spend",
    "Revenue",
    "ROAS",
    "Clicks",
    "Impressions",
    "Conversions",
    "Conversion Rate",
    "Inventory",
    "Stock Status",
    "Predicted Stockout Days",
    "Stockout Risk",
    "Cost of Goods",
    "Selling Price",
    "Gross Margin",
    "Margin Percent",
    "Margin Tier",
    "Recommended Bid Adjustment",
    "Bidding Priority",
    "Last Updated",
    "Last Sync",
  ]

  const csvContent = [
    headers.join(","),
    ...data.map((sku) =>
      [
        sku.id,
        `"${sku.name}"`,
        sku.category,
        sku.brand,
        sku.size,
        sku.color,
        sku.material,
        sku.weight,
        `"${sku.dimensions}"`,
        `"${sku.supplier}"`,
        sku.supplierCode,
        sku.barcode,
        `"${sku.tags.join("; ")}"`,
        sku.seasonality,
        `"${sku.targetAudience}"`,
        sku.adSpend,
        sku.revenue,
        sku.roas,
        sku.clicks,
        sku.impressions,
        sku.conversions,
        sku.conversionRate,
        sku.inventory,
        sku.stockStatus,
        sku.predictedStockoutDays || 0,
        sku.stockoutRisk || "low",
        sku.costOfGoods || 0,
        sku.sellingPrice || 0,
        sku.grossMargin || 0,
        sku.marginPercent || 0,
        sku.marginTier || "medium",
        sku.recommendedBidAdjustment || 1.0,
        sku.biddingPriority || 50,
        sku.lastUpdated,
        sku.lastSyncTimestamp || new Date().toISOString(),
      ].join(","),
    ),
  ].join("\n")

  downloadCSV(csvContent, filename)
}

export function exportCampaignDataToCSV(data: CampaignData[], filename = "campaign-data.csv") {
  const headers = [
    "Campaign ID",
    "Campaign Name",
    "Total Spend",
    "Total Revenue",
    "Total ROAS",
    "Total Clicks",
    "Total Impressions",
    "Total Conversions",
    "SKU Count",
    "Date Range",
  ]

  const csvContent = [
    headers.join(","),
    ...data.map((campaign) =>
      [
        campaign.id,
        `"${campaign.name}"`,
        campaign.totalSpend,
        campaign.totalRevenue,
        campaign.totalROAS,
        campaign.totalClicks,
        campaign.totalImpressions,
        campaign.totalConversions,
        campaign.skus.length,
        campaign.dateRange,
      ].join(","),
    ),
  ].join("\n")

  downloadCSV(csvContent, filename)
}

export function exportInventoryAlertsToCSV(data: SKUData[], filename = "inventory-alerts.csv") {
  const alertData = data.filter((sku) => sku.stockStatus === "low" || sku.stockStatus === "out")

  const headers = [
    "SKU ID",
    "Product Name",
    "Brand",
    "Category",
    "Size",
    "Color",
    "Supplier",
    "Current Inventory",
    "Stock Status",
    "Predicted Stockout Days",
    "Stockout Risk",
    "Ad Spend",
    "ROAS",
    "Margin Tier",
    "Bidding Priority",
    "Risk Level",
    "Recommended Action",
    "Supplier Contact",
  ]

  const csvContent = [
    headers.join(","),
    ...alertData.map((sku) => {
      let riskLevel = "Medium"
      let recommendedAction = "Monitor closely"

      if (sku.stockStatus === "out") {
        riskLevel = "Critical"
        recommendedAction = "Pause advertising immediately & reorder"
      } else if (sku.stockStatus === "low" && sku.adSpend > 1000) {
        riskLevel = "High"
        recommendedAction = "Reduce ad spend by 50% & expedite reorder"
      } else if (sku.predictedStockoutDays && sku.predictedStockoutDays < 7) {
        riskLevel = "High"
        recommendedAction = "Place urgent reorder & adjust bidding"
      }

      return [
        sku.id,
        `"${sku.name}"`,
        sku.brand,
        sku.category,
        sku.size,
        sku.color,
        `"${sku.supplier}"`,
        sku.inventory,
        sku.stockStatus,
        sku.predictedStockoutDays || 0,
        sku.stockoutRisk || "low",
        sku.adSpend,
        sku.roas,
        sku.marginTier || "medium",
        sku.biddingPriority || 50,
        riskLevel,
        `"${recommendedAction}"`,
        sku.supplierCode,
      ].join(",")
    }),
  ].join("\n")

  downloadCSV(csvContent, filename)
}

export function exportProductPerformanceToCSV(data: SKUData[], filename = "product-performance-analysis.csv") {
  const headers = [
    "SKU ID",
    "Product Name",
    "Brand",
    "Category",
    "Performance Score",
    "ROAS",
    "Margin Percent",
    "Bidding Priority",
    "Stock Health",
    "Revenue Contribution",
    "Efficiency Rating",
    "Recommended Strategy",
  ]

  const totalRevenue = data.reduce((sum, sku) => sum + sku.revenue, 0)

  const csvContent = [
    headers.join(","),
    ...data.map((sku) => {
      const performanceScore = Math.round(
        sku.roas * 0.4 + (sku.marginPercent || 0) * 100 * 0.3 + (sku.biddingPriority || 50) * 0.3,
      )
      const revenueContribution = Math.round((sku.revenue / totalRevenue) * 10000) / 100
      const efficiencyRating =
        sku.revenue / sku.adSpend > 2 ? "High" : sku.revenue / sku.adSpend > 1.5 ? "Medium" : "Low"

      let recommendedStrategy = "Maintain current strategy"
      if (performanceScore > 80 && sku.stockStatus === "high") recommendedStrategy = "Increase investment"
      else if (performanceScore < 40) recommendedStrategy = "Optimize or consider pausing"
      else if (sku.stockStatus === "low") recommendedStrategy = "Reduce spend until restocked"

      return [
        sku.id,
        `"${sku.name}"`,
        sku.brand,
        sku.category,
        performanceScore,
        sku.roas,
        sku.marginPercent || 0,
        sku.biddingPriority || 50,
        sku.stockStatus,
        revenueContribution,
        efficiencyRating,
        `"${recommendedStrategy}"`,
      ].join(",")
    }),
  ].join("\n")

  downloadCSV(csvContent, filename)
}

function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

// Export filtered data based on current filters
export function exportFilteredData(data: SKUData[], searchTerm: string, categoryFilter: string, stockFilter: string) {
  const filteredData = data.filter((sku) => {
    const matchesSearch =
      sku.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sku.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || categoryFilter === "all" || sku.category === categoryFilter
    const matchesStock = !stockFilter || stockFilter === "all" || sku.stockStatus === stockFilter

    return matchesSearch && matchesCategory && matchesStock
  })

  const timestamp = new Date().toISOString().split("T")[0]
  exportSKUDataToCSV(filteredData, `filtered-sku-data-${timestamp}.csv`)
}
