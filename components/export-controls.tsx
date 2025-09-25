"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useData } from "@/lib/data-context"
import {
  exportSKUDataToCSV,
  exportCampaignDataToCSV,
  exportInventoryAlertsToCSV,
  exportFilteredData,
  exportProductPerformanceToCSV,
} from "@/lib/export-utils"
import { Download, FileText, AlertTriangle, Target, TrendingUp } from "lucide-react"
import { useState } from "react"

export function ExportControls() {
  const { skuData, campaignData, filteredSKUData, searchTerm, categoryFilter, stockFilter } = useData()
  const [exportType, setExportType] = useState("filtered")

  const handleExport = () => {
    const timestamp = new Date().toISOString().split("T")[0]

    switch (exportType) {
      case "filtered":
        exportFilteredData(skuData, searchTerm, categoryFilter, stockFilter)
        break
      case "all-skus":
        exportSKUDataToCSV(skuData, `comprehensive-sku-data-${timestamp}.csv`)
        break
      case "campaigns":
        exportCampaignDataToCSV(campaignData, `campaign-data-${timestamp}.csv`)
        break
      case "alerts":
        exportInventoryAlertsToCSV(skuData, `inventory-alerts-${timestamp}.csv`)
        break
      case "performance":
        exportProductPerformanceToCSV(skuData, `product-performance-analysis-${timestamp}.csv`)
        break
      default:
        exportSKUDataToCSV(filteredSKUData, `sku-data-${timestamp}.csv`)
    }
  }

  const getExportDescription = () => {
    switch (exportType) {
      case "filtered":
        return `Export ${filteredSKUData.length} SKUs with current filters & complete product details`
      case "all-skus":
        return `Export all ${skuData.length} SKUs with comprehensive product attributes & sync data`
      case "campaigns":
        return `Export ${campaignData.length} campaigns with aggregated metrics`
      case "alerts":
        return `Export inventory alerts with supplier details & recommended actions`
      case "performance":
        return `Export performance analysis with bidding recommendations for ${skuData.length} SKUs`
      default:
        return "Export data"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Data
        </CardTitle>
        <CardDescription>
          Download comprehensive ROAS, inventory, and product data with detailed attributes for external analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={exportType} onValueChange={setExportType}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select export type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="filtered">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Filtered SKU Data (Detailed)
                </div>
              </SelectItem>
              <SelectItem value="all-skus">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Complete SKU Database
                </div>
              </SelectItem>
              <SelectItem value="performance">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Performance Analysis
                </div>
              </SelectItem>
              <SelectItem value="campaigns">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Campaign Data
                </div>
              </SelectItem>
              <SelectItem value="alerts">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Inventory Alerts & Actions
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} className="sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{getExportDescription()}</p>
      </CardContent>
    </Card>
  )
}
