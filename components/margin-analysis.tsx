"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useData } from "@/lib/data-context"
import { biddingEngine, type MarginData } from "@/lib/bidding-engine"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { DollarSign, Percent, TrendingUp } from "lucide-react"

export function MarginAnalysis() {
  const { skuData } = useData()
  const [marginData, setMarginData] = useState<MarginData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get margin data for all SKUs
    const margins = biddingEngine.getAllMarginData()
    setMarginData(margins)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Combine SKU data with margin data
  const enrichedData = skuData
    .map((sku) => {
      const margin = marginData.find((m) => m.skuId === sku.id)
      return margin ? { ...sku, ...margin } : null
    })
    .filter(Boolean)

  // Calculate summary metrics
  const avgMargin = enrichedData.reduce((sum, item) => sum + item!.marginPercent, 0) / enrichedData.length
  const totalProfit = enrichedData.reduce((sum, item) => sum + (item!.revenue * item!.marginPercent - item!.adSpend), 0)
  const highMarginCount = enrichedData.filter((item) => item!.marginPercent > 0.4).length

  // Prepare chart data
  const marginDistribution = [
    {
      range: "0-25%",
      count: enrichedData.filter((item) => item!.marginPercent <= 0.25).length,
      color: "#ef4444",
    },
    {
      range: "25-40%",
      count: enrichedData.filter((item) => item!.marginPercent > 0.25 && item!.marginPercent <= 0.4).length,
      color: "#f59e0b",
    },
    {
      range: "40%+",
      count: enrichedData.filter((item) => item!.marginPercent > 0.4).length,
      color: "#10b981",
    },
  ]

  const topMarginSKUs = enrichedData
    .sort((a, b) => b!.marginPercent - a!.marginPercent)
    .slice(0, 10)
    .map((item) => ({
      name: item!.name.substring(0, 15) + (item!.name.length > 15 ? "..." : ""),
      margin: Math.round(item!.marginPercent * 100),
      profit: Math.round(item!.revenue * item!.marginPercent - item!.adSpend),
      roas: item!.roas,
    }))

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Margin</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgMargin * 100)}%</div>
            <p className="text-xs text-muted-foreground">Across all SKUs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalProfit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Revenue minus ad spend and COGS</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Margin SKUs</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{highMarginCount}</div>
            <p className="text-xs text-muted-foreground">SKUs with 40%+ margins</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Margin Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Margin Distribution</CardTitle>
            <CardDescription>Number of SKUs by margin range</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={marginDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {marginDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} SKUs`, "Count"]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {marginDistribution.map((item) => (
                <div key={item.range} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">{item.range}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Margin SKUs */}
        <Card>
          <CardHeader>
            <CardTitle>Top Margin SKUs</CardTitle>
            <CardDescription>Highest margin products by percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topMarginSKUs} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "margin") return [`${value}%`, "Margin"]
                    if (name === "profit") return [`$${value}`, "Profit"]
                    return [value, name]
                  }}
                />
                <Bar dataKey="margin" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed SKU Table */}
      <Card>
        <CardHeader>
          <CardTitle>SKU Margin Details</CardTitle>
          <CardDescription>Detailed margin analysis for all SKUs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {enrichedData
              .sort((a, b) => b!.marginPercent - a!.marginPercent)
              .map((item) => {
                const profit = item!.revenue * item!.marginPercent - item!.adSpend
                const marginCategory =
                  item!.marginPercent > 0.4 ? "high" : item!.marginPercent > 0.25 ? "medium" : "low"

                return (
                  <div key={item!.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{item!.name}</h4>
                        <Badge
                          variant={
                            marginCategory === "high"
                              ? "default"
                              : marginCategory === "medium"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {Math.round(item!.marginPercent * 100)}% margin
                        </Badge>
                      </div>
                      <div className="flex items-center gap-6 mt-2 text-sm text-muted-foreground">
                        <span>ROAS: {item!.roas}</span>
                        <span>Revenue: ${item!.revenue.toLocaleString()}</span>
                        <span>Ad Spend: ${item!.adSpend.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${profit > 0 ? "text-green-600" : "text-red-600"}`}>
                        {profit > 0 ? "+" : ""}${profit.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Profit</div>
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
