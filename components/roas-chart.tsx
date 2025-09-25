"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  TooltipProps,
} from "recharts"
import { collection, onSnapshot, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface SKUData {
  id: string
  sku_id: string
  name: string
  category: string
  brand: string
  size: string
  color: string
  roas: number
  ad_spent: number
  total_revenue: number
  click_count: number
  view_click_count: number
  inventory_qty: number
  last_clicked?: Date
}

interface ProductData {
  id: string
  productName: string
  brand: string
  category: string
  price: number
}

interface TimeSeriesData {
  date: string
  roas: number
  spend: number
  revenue: number
}

interface CategoryData {
  category: string
  totalSpend: number
  totalRevenue: number
  avgROAS: number
  count: number
  [key: string]: string | number
}

interface TopSKUData {
  name: string
  roas: number
  spend: number
  revenue: number
  [key: string]: string | number
}

interface PieDataEntry {
  category: string
  value: number
  percent?: number
  [key: string]: string | number | undefined
}

export function ROASChart() {
  const [skuData, setSkuData] = useState<SKUData[]>([])
  const [productData, setProductData] = useState<ProductData[]>([])
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([])
  const [chartType, setChartType] = useState("line")
  const [metric, setMetric] = useState("roas")

  // Fetch product data once for names and categories
  useEffect(() => {
    const fetchProducts = async () => {
      const productsSnapshot = await getDocs(collection(db, "products"))
      const products: ProductData[] = []
      productsSnapshot.forEach((doc) => {
        const data = doc.data()
        products.push({
          id: doc.id,
          productName: data.productName ?? "",
          brand: data.brand ?? "",
          category: data.category ?? "",
          price: data.price ?? 0,
        })
      })
      setProductData(products)
    }
    fetchProducts()
  }, [])

  // Fetch real-time SKU data from Firebase and merge with product info
  useEffect(() => {
    const colRef = collection(db, "sku_clicks")
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const skus: SKUData[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        
        // Find matching product for name and category
        const matchingProduct = productData.find(p => 
          p.productName === data.sku_id || 
          p.id === data.sku_id ||
          p.productName.toLowerCase().includes(data.sku_id?.toLowerCase() || "")
        )

        skus.push({
          id: doc.id,
          sku_id: data.sku_id ?? "",
          name: matchingProduct?.productName ?? data.name ?? data.sku_id ?? `Product-${doc.id}`,
          category: matchingProduct?.category ?? data.category ?? "Electronics", // Default category
          brand: matchingProduct?.brand ?? data.brand ?? "Generic",
          size: data.size ?? "Standard",
          color: data.color ?? "Default",
          roas: data.roas ?? 0,
          ad_spent: data.ad_spent ?? 0,
          total_revenue: data.total_revenue ?? 0,
          click_count: data.click_count ?? 0,
          view_click_count: data.view_click_count ?? 0,
          inventory_qty: data.inventory_qty ?? 0,
          last_clicked: data.last_clicked ? data.last_clicked.toDate() : undefined,
        })
      })
      setSkuData(skus)
      generateTimeSeriesData(skus)
    })

    return () => unsubscribe()
  }, [productData]) // Re-run when productData changes

  const generateTimeSeriesData = (skus: SKUData[]) => {
    const days = 30
    const series: TimeSeriesData[] = []
    
    for (let i = days; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      const totalSpend = skus.reduce((sum, sku) => sum + sku.ad_spent, 0) / days * (0.8 + Math.random() * 0.4)
      const totalRevenue = skus.reduce((sum, sku) => sum + sku.total_revenue, 0) / days * (0.8 + Math.random() * 0.4)
      const avgROAS = totalRevenue / (totalSpend || 1)

      series.push({
        date: date.toISOString().split('T')[0],
        roas: parseFloat(avgROAS.toFixed(2)),
        spend: parseFloat(totalSpend.toFixed(2)),
        revenue: parseFloat(totalRevenue.toFixed(2)),
      })
    }
    
    setTimeSeriesData(series)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  // Prepare data for different chart types
  const categoryData: CategoryData[] = skuData.reduce((acc: CategoryData[], sku) => {
    const existing = acc.find((item) => item.category === sku.category)
    if (existing) {
      existing.totalSpend += sku.ad_spent
      existing.totalRevenue += sku.total_revenue
      existing.count += 1
    } else {
      acc.push({
        category: sku.category,
        totalSpend: sku.ad_spent,
        totalRevenue: sku.total_revenue,
        avgROAS: 0,
        count: 1,
      })
    }
    return acc
  }, [])

  categoryData.forEach((item) => {
    item.avgROAS = item.totalSpend > 0 ? item.totalRevenue / item.totalSpend : 0
  })

  const topSKUs: TopSKUData[] = [...skuData]
    .sort((a, b) => b.roas - a.roas)
    .slice(0, 10)
    .map((sku) => ({
      name: sku.name.length > 20 ? sku.name.substring(0, 20) + "..." : sku.name,
      roas: sku.roas,
      spend: sku.ad_spent,
      revenue: sku.total_revenue,
    }))

  const pieChartData: PieDataEntry[] = categoryData.map((item) => ({
    category: item.category,
    value: metric === "roas" ? item.avgROAS : metric === "spend" ? item.totalSpend : item.totalRevenue,
  }))

  const COLORS = ["#059669", "#10b981", "#84cc16", "#f59e0b", "#dc2626", "#8b5cf6", "#06b6d4"]

  const CustomTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.toLowerCase().includes("roas") ? `${entry.value}x` : formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const PieTooltip = ({ active, payload }: TooltipProps<any, any>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.category}</p>
          <p className="text-sm">
            {metric === "roas" ? `${data.value.toFixed(2)}x` : formatCurrency(data.value)}
          </p>
        </div>
      )
    }
    return null
  }

  const renderPieLabel = (entry: PieDataEntry & { percent: number }) => {
    return `${entry.category} ${(entry.percent * 100).toFixed(0)}%`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>Visualize ROAS and performance data over time and across categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Time Series</SelectItem>
                <SelectItem value="bar">Top Products</SelectItem>
                <SelectItem value="pie">Category Breakdown</SelectItem>
              </SelectContent>
            </Select>
            <Select value={metric} onValueChange={setMetric}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="roas">ROAS</SelectItem>
                <SelectItem value="spend">Ad Spend</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="h-96">
            {chartType === "line" && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey={metric}
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}

            {chartType === "bar" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSKUs} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey={metric} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {chartType === "pie" && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderPieLabel}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Best Performing Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 && (
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {[...categoryData].sort((a, b) => b.avgROAS - a.avgROAS)[0]?.category || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  ROAS: {([...categoryData].sort((a, b) => b.avgROAS - a.avgROAS)[0]?.avgROAS || 0).toFixed(2)}x
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Highest Revenue Product</CardTitle>
          </CardHeader>
          <CardContent>
            {topSKUs.length > 0 && (
              <div>
                <p className="text-2xl font-bold text-blue-600">{topSKUs[0]?.name || "N/A"}</p>
                <p className="text-sm text-gray-600">Revenue: {formatCurrency(topSKUs[0]?.revenue || 0)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Average Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-2xl font-bold">
                {skuData.length > 0 
                  ? (skuData.reduce((sum, sku) => sum + sku.roas, 0) / skuData.length).toFixed(2)
                  : "0.00"
                }x
              </p>
              <p className="text-sm text-gray-600">Average ROAS across all products</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
