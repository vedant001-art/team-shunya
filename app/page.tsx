"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useData } from "@/lib/data-context"
import { DashboardOverview } from "@/components/dashboard-overview"
import { SKUTable } from "@/components/sku-table"
import { InventoryAlerts } from "@/components/inventory-alerts"
import { ROASChart } from "@/components/roas-chart"
import { ExportControls } from "@/components/export-controls"
import { PredictiveAnalytics } from "@/components/predictive-analytics"
import { BiddingRecommendations } from "@/components/bidding-recommendations"
import { MarginAnalysis } from "@/components/margin-analysis"
import { SimulationDashboard } from "@/components/simulation-dashboard"
import { AdClickTracker } from "@/components/ad-click-tracker"
import { Search, RefreshCw, AlertTriangle } from "lucide-react"

export default function Dashboard() {
  const {
    dashboardMetrics,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    stockFilter,
    setStockFilter,
    refreshData,
    skuData,
  } = useData()

  const categories = [...new Set(skuData.map((sku) => sku.category))]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">ROAS Dashboard</h1>
              <p className="text-muted-foreground">SKU-Level Return on Ad Spend Analytics with AI/ML Insights</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={refreshData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Low Stock Alert */}
        {/* {dashboardMetrics.lowStockAlerts > 0 && (
          <Alert className="mb-6 border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Inventory Alert</AlertTitle>
            <AlertDescription>
              {dashboardMetrics.lowStockAlerts} SKUs have low or no stock. Review inventory levels to avoid stockouts.
            </AlertDescription>
          </Alert>
        )} */}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sku-analytics">SKU Analytics</TabsTrigger>
            <TabsTrigger value="click-tracking">Click Tracking</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
            <TabsTrigger value="bidding">Smart Bidding</TabsTrigger>
            {/* <TabsTrigger value="simulation">What-If</TabsTrigger> */}
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <DashboardOverview />

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filters & Search</CardTitle>
                <CardDescription>Filter SKU data by search term, category, or stock status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search by SKU ID or product name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={stockFilter} onValueChange={setStockFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="All Stock Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stock Levels</SelectItem>
                      <SelectItem value="high">High Stock</SelectItem>
                      <SelectItem value="medium">Medium Stock</SelectItem>
                      <SelectItem value="low">Low Stock</SelectItem>
                      <SelectItem value="out">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <SKUTable />
          </TabsContent>

          <TabsContent value="sku-analytics" className="space-y-6">
            <SKUTable showFilters={true} />
          </TabsContent>

          <TabsContent value="click-tracking" className="space-y-6">
            <AdClickTracker />
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <InventoryAlerts />
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <ROASChart />
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            <PredictiveAnalytics />
          </TabsContent>

          <TabsContent value="bidding" className="space-y-6">
            <Tabs defaultValue="recommendations" className="space-y-4">
              <TabsList>
                <TabsTrigger value="recommendations">Bidding Recommendations</TabsTrigger>
                {/* <TabsTrigger value="margins">Margin Analysis</TabsTrigger> */}
              </TabsList>
              <TabsContent value="recommendations">
                <BiddingRecommendations />
              </TabsContent>
              <TabsContent value="margins">
                <MarginAnalysis />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="simulation" className="space-y-6">
            <SimulationDashboard />
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <ExportControls />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Quick Exports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start bg-transparent"
                    onClick={() => {
                      const timestamp = new Date().toISOString().split("T")[0]
                      const lowStockSKUs = skuData.filter(
                        (sku) => sku.stockStatus === "low" || sku.stockStatus === "out",
                      )
                      if (lowStockSKUs.length > 0) {
                        const csvContent = [
                          "SKU ID,Product Name,Stock Status,Inventory,Ad Spend,ROAS",
                          ...lowStockSKUs.map(
                            (sku) =>
                              `${sku.id},"${sku.name}",${sku.stockStatus},${sku.inventory},${sku.adSpend},${sku.roas}`,
                          ),
                        ].join("\n")
                        const blob = new Blob([csvContent], { type: "text/csv" })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement("a")
                        a.href = url
                        a.download = `low-stock-skus-${timestamp}.csv`
                        a.click()
                        URL.revokeObjectURL(url)
                      }
                    }}
                  >
                    Low Stock SKUs
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start bg-transparent"
                    onClick={() => {
                      const timestamp = new Date().toISOString().split("T")[0]
                      const topPerformers = [...skuData].sort((a, b) => b.roas - a.roas).slice(0, 10)
                      const csvContent = [
                        "SKU ID,Product Name,ROAS,Ad Spend,Revenue",
                        ...topPerformers.map(
                          (sku) => `${sku.id},"${sku.name}",${sku.roas},${sku.adSpend},${sku.revenue}`,
                        ),
                      ].join("\n")
                      const blob = new Blob([csvContent], { type: "text/csv" })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement("a")
                      a.href = url
                      a.download = `top-performers-${timestamp}.csv`
                      a.click()
                      URL.revokeObjectURL(url)
                    }}
                  >
                    Top 10 Performers
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
