"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import {
  type SKUData,
  type CampaignData,
  type DashboardMetrics,
  generateMockSKUData,
  generateMockCampaignData,
  calculateDashboardMetrics,
  generateTimeSeriesData,
} from "./mock-data"

interface DataContextType {
  skuData: SKUData[]
  campaignData: CampaignData[]
  dashboardMetrics: DashboardMetrics
  timeSeriesData: any[]
  filteredSKUData: SKUData[]
  searchTerm: string
  setSearchTerm: (term: string) => void
  categoryFilter: string
  setCategoryFilter: (category: string) => void
  stockFilter: string
  setStockFilter: (stock: string) => void
  refreshData: () => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [skuData, setSKUData] = useState<SKUData[]>([])
  const [campaignData, setCampaignData] = useState<CampaignData[]>([])
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics>({} as DashboardMetrics)
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [stockFilter, setStockFilter] = useState("")

  const refreshData = () => {
    const newSKUData = generateMockSKUData()
    const newCampaignData = generateMockCampaignData(newSKUData)
    const newMetrics = calculateDashboardMetrics(newSKUData)
    const newTimeSeriesData = generateTimeSeriesData()

    setSKUData(newSKUData)
    setCampaignData(newCampaignData)
    setDashboardMetrics(newMetrics)
    setTimeSeriesData(newTimeSeriesData)
  }

  useEffect(() => {
    refreshData()
  }, [])

  // Filter SKU data based on search and filters
  const filteredSKUData = skuData.filter((sku) => {
    const matchesSearch =
      sku.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sku.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || sku.category === categoryFilter
    const matchesStock = !stockFilter || sku.stockStatus === stockFilter

    return matchesSearch && matchesCategory && matchesStock
  })

  return (
    <DataContext.Provider
      value={{
        skuData,
        campaignData,
        dashboardMetrics,
        timeSeriesData,
        filteredSKUData,
        searchTerm,
        setSearchTerm,
        categoryFilter,
        setCategoryFilter,
        stockFilter,
        setStockFilter,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
