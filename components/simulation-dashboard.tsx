"use client"

import React, { useState, useEffect } from "react"
import { initializeApp } from "firebase/app"
import { getFirestore, collection, onSnapshot } from "firebase/firestore"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Save, Trash2, DollarSign, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

// Firebase config and initialization
const firebaseConfig = {
  apiKey: "AIzaSyCbnRkTFTs1kK9cD-2RR0kkpshtNiw1uK0",
  authDomain: "roassss.firebaseapp.com",
  projectId: "roassss",
  storageBucket: "roassss.firebasestorage.app",
  messagingSenderId: "342715789282",
  appId: "1:342715789282:web:1101b3611f4048cd9213bb",
  measurementId: "G-Z74YY1TDKG",
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

type SkuData = {
  id: string
  sku_id: string
  ad_spent: number
  click_count: number
  inventory_qty: number
  last_clicked?: string
  roas: number
  total_revenue: number
  view_click_count: number
}

type SimulationChange = {
  skuId: string
  type: "spend" | "inventory" | "price"
  currentValue: number
  newValue: number
  changePercent: number
}

type SimulationResult = {
  scenarioId: string
  projectedMetrics: {
    roasChange: number
    revenueChange: number
    profitChange: number
    totalProfit: number
    totalRevenue: number
    totalROAS: number
  }
  riskFactors: string[]
  recommendations: string[]
  skuResults: {
    skuId: string
    name: string
    currentROAS: number
    projectedROAS: number
    currentRevenue: number
    projectedRevenue: number
    currentProfit: number
    projectedProfit: number
    riskLevel: "low" | "medium" | "high"
  }[]
}

function useFirestoreSkuData(): SkuData[] {
  const [skuData, setSkuData] = useState<SkuData[]>([])

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "sku_clicks"),
      (snapshot) => {
        const skus = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            sku_id: data.sku_id ?? doc.id,
            ad_spent: Number(data.ad_spent) || 0,
            click_count: Number(data.click_count) || 0,
            inventory_qty: Number(data.inventory_qty) || 0,
            last_clicked: data.last_clicked,
            roas: Number(data.roas) || 0,
            total_revenue: Number(data.total_revenue) || 0,
            view_click_count: Number(data.view_click_count) || 0,
          }
        })
        setSkuData(skus)
      },
      (error) => {
        console.error("Firestore listen error:", error)
      }
    )
    return () => unsubscribe()
  }, [])

  return skuData
}

export function SimulationDashboard() {
  const skuData = useFirestoreSkuData()

  const [customChanges, setCustomChanges] = useState<SimulationChange[]>([])
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [scenarioName, setScenarioName] = useState("")
  const [loading, setLoading] = useState(false)

  // Simplified runSimulation to mock simulated results from current data and changes
  const runSimulation = () => {
    if (skuData.length === 0) return
    setLoading(true)

    setTimeout(() => {
      // For demo: simulate increasing ad spend by 10% for all SKUs in changes or all if no changes
      const modifiedSkus = skuData.map((sku) => {
        const change = customChanges.find((c) => c.skuId === sku.id)
        let newAdSpend = sku.ad_spent
        if (change && change.type === "spend") {
          newAdSpend = change.newValue
        } else if (customChanges.length === 0) {
          newAdSpend = sku.ad_spent * 1.1
        }
        const projectedRevenue = sku.total_revenue * (newAdSpend / (sku.ad_spent || 1))
        const projectedProfit = projectedRevenue * 0.3 // Assume 30% profit margin for demo

        return {
          skuId: sku.id,
          name: sku.sku_id,
          currentROAS: sku.roas,
          projectedROAS: sku.roas * (newAdSpend / (sku.ad_spent || 1)),
          currentRevenue: sku.total_revenue,
          projectedRevenue,
          currentProfit: sku.total_revenue * 0.3,
          projectedProfit,
          riskLevel: projectedProfit < 0 ? "high" : "low",
        }
      })

      const totalRevenue = modifiedSkus.reduce((sum, s) => sum + s.projectedRevenue, 0)
      const totalProfit = modifiedSkus.reduce((sum, s) => sum + s.projectedProfit, 0)
      const totalAdSpend = modifiedSkus.reduce((sum, s) => sum + (skuData.find(sk => sk.id === s.skuId)?.ad_spent || 0), 0)
      const totalROAS = totalAdSpend ? totalRevenue / totalAdSpend : 0

      const projectedMetrics = {
        roasChange: ((totalROAS - 2.5) / 2.5) * 100, // Assume baseline ROAS 2.5 for demo
        revenueChange: ((totalRevenue - 50000) / 50000) * 100, // Assume baseline revenue 50k
        profitChange: ((totalProfit - 15000) / 15000) * 100, // Assume baseline profit 15k
        totalProfit,
        totalRevenue,
        totalROAS,
      }

      setSimulationResult({
        scenarioId: scenarioName || "Custom Scenario",
        projectedMetrics,
        riskFactors: modifiedSkus.some((s) => s.riskLevel === "high")
          ? ["Some SKUs have negative profit projections."]
          : [],
        recommendations: ["Consider increasing ad spend on high-performing SKUs."],
        skuResults: modifiedSkus,
      })

      setLoading(false)
    }, 1000)
  }

  const addCustomChange = () => {
    if (skuData.length === 0) return
    setCustomChanges((prev) => [
      ...prev,
      {
        skuId: skuData[0].id,
        type: "spend",
        currentValue: skuData[0].ad_spent,
        newValue: skuData[0].ad_spent,
        changePercent: 0,
      },
    ])
  }

  const updateCustomChange = (index: number, field: keyof SimulationChange, value: any) => {
    setCustomChanges((prev) => {
      const updated = [...prev]
      const change = { ...updated[index], [field]: value }

      if (field === "skuId") {
        const sku = skuData.find((s) => s.id === value)
        if (sku) {
          change.currentValue =
            change.type === "spend"
              ? sku.ad_spent
              : change.type === "inventory"
              ? sku.inventory_qty
              : 0
          change.newValue = change.currentValue
          change.changePercent = 0
        }
      }
      if (field === "type") {
        const sku = skuData.find((s) => s.id === change.skuId)
        if (sku) {
          change.currentValue =
            value === "spend"
              ? sku.ad_spent
              : value === "inventory"
              ? sku.inventory_qty
              : 0
          change.newValue = change.currentValue
          change.changePercent = 0
        }
      }
      if (field === "newValue") {
        const current = change.currentValue
        if (current !== 0) {
          change.changePercent = Math.round(((value - current) / current) * 100)
        } else {
          change.changePercent = 0
        }
      }
      updated[index] = change
      return updated
    })
  }
  const removeCustomChange = (index: number) => {
    setCustomChanges((prev) => prev.filter((_, i) => i !== index))
  }

  const getChangeColor = (value: number) => {
    if (value > 0) return "text-green-600"
    if (value < 0) return "text-red-600"
    return "text-muted-foreground"
  }

  return (
    <div className="space-y-6 px-4 py-6 max-w-5xl mx-auto">
      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">What-If Simulation Dashboard</h2>
        <Button onClick={() => setSimulationResult(null)} variant="outline" size="sm">
          Clear Results
        </Button>
      </header>

      <Tabs defaultValue="custom" className="space-y-6">
        <TabsList className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <TabsTrigger value="custom">Custom Scenario</TabsTrigger>
        </TabsList>

        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle>Build Custom Scenario</CardTitle>
              <CardDescription>Adjust SKU parameters below and run simulation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 items-end mb-4">
                <div className="flex-1">
                  <Label htmlFor="scenario-name">Scenario Name</Label>
                  <Input
                    id="scenario-name"
                    placeholder="Enter scenario name"
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={addCustomChange} variant="outline">
                    Add Change
                  </Button>
                  <Button
                    onClick={runSimulation}
                    disabled={loading || skuData.length === 0}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Run Simulation
                  </Button>
                </div>
              </div>

              {customChanges.length === 0 && (
                <p className="text-sm text-muted-foreground">No changes added yet.</p>
              )}

              {customChanges.map((change, index) => (
                <div
                  key={index}
                  className="grid grid-cols-6 gap-3 items-center p-3 border rounded mb-2"
                >
                  <div>
                    <Label className="text-xs">SKU</Label>
                    <Select
                      value={change.skuId}
                      onValueChange={(value) =>
                        updateCustomChange(index, "skuId", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {skuData.map((sku) => (
                          <SelectItem key={sku.id} value={sku.id}>
                            {sku.sku_id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Type</Label>
                    <Select
                      value={change.type}
                      onValueChange={(value) =>
                        updateCustomChange(index, "type", value as any)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spend">Ad Spend</SelectItem>
                        <SelectItem value="inventory">Inventory</SelectItem>
                        <SelectItem value="price">Price</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Current</Label>
                    <Input value={change.currentValue} disabled className="bg-muted" />
                  </div>

                  <div>
                    <Label className="text-xs">New Value</Label>
                    <Input
                      type="number"
                      value={change.newValue}
                      onChange={(e) =>
                        updateCustomChange(index, "newValue", Number(e.target.value))
                      }
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Change %</Label>
                    <Input
                      value={`${change.changePercent}%`}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600"
                      onClick={() => removeCustomChange(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {loading && (
        <Card>
          <CardContent className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <span className="ml-3 text-muted-foreground">Running simulation...</span>
          </CardContent>
        </Card>
      )}

      {simulationResult && (
        <Card>
          <CardHeader>
            <CardTitle>
              Simulation Results <Badge variant="outline">{simulationResult.scenarioId}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 text-center">
              <div className="p-4 border rounded">
                <DollarSign className="mx-auto mb-2 text-muted-foreground" />
                <h3 className="text-lg font-semibold">ROAS Change</h3>
                <p
                  className={`text-2xl font-bold ${
                    getChangeColor(simulationResult.projectedMetrics.roasChange)
                  }`}
                >
                  {simulationResult.projectedMetrics.roasChange >= 0 ? "+" : ""}
                  {simulationResult.projectedMetrics.roasChange.toFixed(2)}%
                </p>
              </div>

              <div className="p-4 border rounded">
                <h3 className="text-lg font-semibold">Revenue Change</h3>
                <p
                  className={`text-2xl font-bold ${
                    getChangeColor(simulationResult.projectedMetrics.revenueChange)
                  }`}
                >
                  {simulationResult.projectedMetrics.revenueChange >= 0 ? "+" : ""}
                  {simulationResult.projectedMetrics.revenueChange.toFixed(2)}%
                </p>
              </div>

              <div className="p-4 border rounded">
                <h3 className="text-lg font-semibold">Profit Change</h3>
                <p
                  className={`text-2xl font-bold ${
                    getChangeColor(simulationResult.projectedMetrics.profitChange)
                  }`}
                >
                  {simulationResult.projectedMetrics.profitChange >= 0 ? "+" : ""}
                  {simulationResult.projectedMetrics.profitChange.toFixed(2)}%
                </p>
              </div>

              <div className="p-4 border rounded text-green-600">
                <h3 className="text-lg font-semibold">Total Profit</h3>
                <p className="text-2xl font-bold">
                  ${simulationResult.projectedMetrics.totalProfit.toLocaleString()}
                </p>
              </div>
            </div>

            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <BarChart
                  data={[
                    {
                      metric: "ROAS",
                      current: 2.5,
                      projected: simulationResult.projectedMetrics.totalROAS,
                    },
                    {
                      metric: "Revenue",
                      current: 50000,
                      projected: simulationResult.projectedMetrics.totalRevenue,
                    },
                    {
                      metric: "Profit",
                      current: 15000,
                      projected: simulationResult.projectedMetrics.totalProfit,
                    },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => value.toLocaleString?.() ?? value} />
                  <Bar dataKey="current" fill="#94a3b8" name="Current" />
                  <Bar dataKey="projected" fill="#10b981" name="Projected" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {simulationResult.riskFactors.length > 0 && (
              <Alert className="mb-4" variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Risk Factors:</strong>
                  <ul className="list-disc list-inside mt-2">
                    {simulationResult.riskFactors.map((risk, idx) => (
                      <li key={idx}>{risk}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Recommendations</h4>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                {simulationResult.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>SKU-Level Impact</CardTitle>
                <CardDescription>Detailed results for each affected SKU</CardDescription>
              </CardHeader>
              <CardContent>
                {simulationResult.skuResults.map((sku) => (
                  <div
                    key={sku.skuId}
                    className="flex items-center justify-between p-3 border rounded mb-2"
                  >
                    <div>
                      <h4 className="font-medium">{sku.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        ROAS: {sku.currentROAS.toFixed(2)} → {sku.projectedROAS.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Revenue: ${sku.currentRevenue.toLocaleString()} → $
                        {sku.projectedRevenue.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          sku.riskLevel === "high"
                            ? "destructive"
                            : sku.riskLevel === "medium"
                            ? "secondary"
                            : "default"
                        }
                      >
                        {sku.riskLevel} risk
                      </Badge>
                      <p
                        className={`text-sm mt-1 ${
                          sku.projectedProfit - sku.currentProfit > 0
                            ? "text-green-600"
                            : sku.projectedProfit - sku.currentProfit < 0
                            ? "text-red-600"
                            : "text-muted-foreground"
                        }`}
                      >
                        Profit:{" "}
                        {sku.projectedProfit >= sku.currentProfit ? "+" : ""}
                        ${(sku.projectedProfit - sku.currentProfit).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
