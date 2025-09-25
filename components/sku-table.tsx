"use client"

import { useState, useEffect } from "react"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  collection, getDocs, onSnapshot,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import {
  Search, ArrowUpDown, ArrowUp, ArrowDown,
  Eye,
} from "lucide-react"

interface SKUData {
  id: string
  brand: string
  category: string
  price: number
  productName: string
  inventory_qty?: number
  stockStatus?: string
}

type SortField = keyof SKUData | "price"
type SortDirection = "asc" | "desc"

export function SKUTable() {
  const [products, setProducts] = useState<SKUData[]>([])
  const [skuClickData, setSkuClickData] = useState<Record<string, number>>({})
  const [filteredData, setFilteredData] = useState<SKUData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [sortField, setSortField] = useState<SortField>("price")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [selectedSKU, setSelectedSKU] = useState<SKUData | null>(null)

  // Fetch products from Firestore "products" collection
  useEffect(() => {
    async function fetchProducts() {
      const prodsSnap = await getDocs(collection(db, "products"))
      const prods = prodsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as SKUData[]
      setProducts(prods)
    }
    fetchProducts()
  }, [])

  // Real-time listener for inventory quantity from Firestore "sku_clicks" collection
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "sku_clicks"), snapshot => {
      const quantities: Record<string, number> = {}
      snapshot.docs.forEach(doc => {
        const data = doc.data()
        if (data.sku_id && typeof data.inventory_qty === "number") {
          quantities[data.sku_id] = data.inventory_qty
        }
      })
      setSkuClickData(quantities)
    })
    return () => unsub()
  }, [])

  // Combine product info with real-time inventory quantities, determine stock status badge
  useEffect(() => {
    const combined = products.map(prod => {
      // You may need to adjust key here to sku_id or productName depending on your data
      const inventoryQty = skuClickData[prod.productName] ?? skuClickData[prod.id] ?? 0
      let status = "high"
      if (inventoryQty <= 0) status = "out"
      else if (inventoryQty < 10) status = "low"
      else if (inventoryQty < 50) status = "medium"
      return { ...prod, inventory_qty: inventoryQty, stockStatus: status }
    })
    setFilteredData(combined)
  }, [products, skuClickData])

  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean)

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />
    return sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)

  const getStockBadge = (status: string, inventory: number) => {
    switch (status) {
      case "high": return <Badge variant="default">High ({inventory})</Badge>
      case "medium": return <Badge variant="secondary">Medium ({inventory})</Badge>
      case "low": return <Badge variant="outline">Low ({inventory})</Badge>
      case "out": return <Badge variant="destructive">Out of Stock</Badge>
      default: return <Badge variant="outline">{inventory}</Badge>
    }
  }


  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>SKU Filters</CardTitle>
          <CardDescription>Search and filter SKU data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by product name or brand..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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

      <Card>
        <CardHeader>
          <CardTitle>SKU Performance Data</CardTitle>
          <CardDescription>
            Showing {filteredData.length} of {products.length} products.
            Click column headers to sort or click any row to view details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("productName")}>
                      Product Name {getSortIcon("productName")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("brand")}>
                      Brand {getSortIcon("brand")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("category")}>
                      Category {getSortIcon("category")}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" onClick={() => handleSort("price")}>
                      Price {getSortIcon("price")}
                    </Button>
                  </TableHead>
                  <TableHead>Stock Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map(sku => (
                  <TableRow
                    key={sku.id}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedSKU(sku)}
                  >
                    <TableCell className="font-mono text-sm">{sku.productName}</TableCell>
                    <TableCell>{sku.brand}</TableCell>
                    <TableCell>{sku.category}</TableCell>
                    <TableCell className="text-right">{formatCurrency(sku.price)}</TableCell>
                    <TableCell>{getStockBadge(sku.stockStatus || "", sku.inventory_qty ?? 0)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation()
                          setSelectedSKU(sku)
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal showing selected SKU details */}
      {selectedSKU && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>SKU Detail: {selectedSKU.productName}</CardTitle>
            <Button variant="outline" onClick={() => setSelectedSKU(null)}>Close</Button>
          </CardHeader>
          <CardContent>
            <p><strong>Brand:</strong> {selectedSKU.brand}</p>
            <p><strong>Category:</strong> {selectedSKU.category}</p>
            <p><strong>Price:</strong> {formatCurrency(selectedSKU.price)}</p>
            <p><strong>Stock Quantity:</strong> {selectedSKU.inventory_qty}</p>
            <p><strong>Stock Status:</strong> {selectedSKU.stockStatus}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
