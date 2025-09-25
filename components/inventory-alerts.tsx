"use client";

import React, { useEffect, useState } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  TrendingDown,
  Pause,
  Eye,
  DollarSign,
  RefreshCw,
} from "lucide-react";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCbnRkTFTs1kK9cD-2RR0kkpshtNiw1uK0",
  authDomain: "roassss.firebaseapp.com",
  projectId: "roassss",
  storageBucket: "roassss.firebasestorage.app",
  messagingSenderId: "342715789282",
  appId: "1:342715789282:web:1101b3611f4048cd9213bb",
  measurementId: "G-Z74YY1TDKG",
};

// Initialize Firebase App once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

type SKUData = {
  sku_id: string;
  ad_spent: number;
  click_count: number;
  view_click_count: number;
  inventory_qty: number;
  last_clicked: string;
  roas: number;
  total_revenue: number;
  id: string;
  name: string;
  stockStatus: "out" | "low" | "medium" | "high";
  inventory: number;
  adSpend: number;
  revenue: number;
  marginPercent?: number;
};

interface AlertCardProps {
  title: string;
  description: string;
  items: SKUData[];
  variant?: "default" | "destructive";
  icon: React.ElementType;
}

export function InventoryAlerts(): JSX.Element {
  const [skuData, setSkuData] = useState<SKUData[]>([]);
  const [selectedSKU, setSelectedSKU] = useState<SKUData | null>(null);
  const [pausedCampaigns, setPausedCampaigns] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  const getStockStatus = (qty: number): SKUData["stockStatus"] => {
    if (qty === 0) return "out";
    if (qty <= 5) return "low";
    if (qty <= 20) return "medium";
    return "high";
  };

  const forceRefresh = (): void => {
    setLoading(true);
    setError(null);
  };

  useEffect(() => {
    console.log("Setting up Firestore listener...");
    const colRef = collection(db, "sku_clicks");

    const unsubscribe = onSnapshot(
      colRef,
      (snapshot: QuerySnapshot<DocumentData>) => {
        console.log(
          "Firestore snapshot received:",
          snapshot.docs.length,
          "documents"
        );

        const docs = snapshot.docs.map((doc) => {
          const data = doc.data();

          const inventoryQty = Number(data.inventory_qty) || 0;
          const adSpend = Number(data.ad_spent) || 0;
          const revenue = Number(data.total_revenue) || 0;
          const roas = Number(data.roas) || 0;

          const processedSKU: SKUData = {
            sku_id: data.sku_id || doc.id,
            click_count: Number(data.click_count) || 0,
            view_click_count: Number(data.view_click_count) || 0,
            last_clicked: data.last_clicked || new Date().toISOString(),
            inventory_qty: inventoryQty,
            ad_spent: adSpend,
            total_revenue: revenue,
            roas,
            id: doc.id,
            name: data.name || `SKU ${data.sku_id || doc.id}`,
            inventory: inventoryQty,
            adSpend,
            revenue,
            stockStatus: getStockStatus(inventoryQty),
            marginPercent: data.marginPercent ? Number(data.marginPercent) : undefined,
          };
          return processedSKU;
        });

        setSkuData(docs);
        setLoading(false);
        setError(null);
        setLastUpdate(new Date());
      },
      (err) => {
        console.error("Firestore error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      console.log("Cleaning up Firestore listener");
      unsubscribe();
    };
  }, []); // empty, set listener once on mount

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
        <p className="text-lg">Loading inventory data…</p>
        <Button variant="outline" onClick={forceRefresh} disabled>
          <RefreshCw className="h-4 w-4 mr-2" />
          Loading...
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-destructive/50">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Connection Error</AlertTitle>
        <AlertDescription>
          {error}
          <Button variant="outline" className="mt-2" onClick={forceRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Connection
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const outOfStock = skuData.filter((s) => s.stockStatus === "out");
  const lowStock = skuData.filter((s) => s.stockStatus === "low");
  const mediumStock = skuData.filter((s) => s.stockStatus === "medium");
  const highStock = skuData.filter((s) => s.stockStatus === "high");

  const highSpendLowStock = skuData.filter(
    (s) => (s.stockStatus === "low" || s.stockStatus === "out") && s.adSpend > 500
  );
  const underperformingHighSpend = skuData.filter(
    (s) => s.roas < 2.0 && s.adSpend > 200
  );

  const getInventoryProgress = (qty: number): number => {
    const maxInventory = Math.max(...skuData.map((s) => s.inventory), 100);
    return (qty / maxInventory) * 100;
  };

  const handleViewSKU = (sku: SKUData): void => setSelectedSKU(sku);
  const handlePauseCampaign = (id: string): void =>
    setPausedCampaigns((prev) => new Set(prev).add(id));

  const AlertCard: React.FC<AlertCardProps> = ({
    title,
    description,
    items,
    variant = "default",
    icon: Icon,
  }) => (
    <Card className={variant === "destructive" ? "border-destructive/50" : ""}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon
            className={`h-5 w-5 ${
              variant === "destructive"
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          />
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge
            variant={variant === "destructive" ? "destructive" : "secondary"}
          >
            {items.length}
          </Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No items require attention.</p>
        ) : (
          <div className="space-y-3">
            {items.slice(0, 5).map((sku) => (
              <div
                key={sku.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{sku.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {sku.sku_id}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Stock: {sku.inventory}</span>
                    <span>Spend: {formatCurrency(sku.adSpend)}</span>
                    <span>ROAS: {sku.roas.toFixed(2)}x</span>
                    <span>Revenue: {formatCurrency(sku.revenue)}</span>
                    <span>Clicks: {sku.click_count}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Progress
                      value={getInventoryProgress(sku.inventory)}
                      className="h-2 flex-1"
                    />
                    <span className="text-xs text-muted-foreground">
                      {sku.inventory} units
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Badge
                    variant={
                      sku.stockStatus === "out"
                        ? "destructive"
                        : sku.stockStatus === "low"
                        ? "destructive"
                        : sku.stockStatus === "medium"
                        ? "secondary"
                        : "default"
                    }
                  >
                    {sku.stockStatus.toUpperCase()}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => handleViewSKU(sku)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {sku.stockStatus === "out" && !pausedCampaigns.has(sku.id) && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handlePauseCampaign(sku.id)}
                    >
                      <Pause className="h-4 w-4" />
                    </Button>
                  )}
                  {pausedCampaigns.has(sku.id) && (
                    <Badge variant="secondary" className="text-xs">
                      Paused
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            {items.length > 5 && (
              <p className="text-sm text-muted-foreground text-center">
                And {items.length - 5} more items...
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Data Status */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Data Status</CardTitle>
            <Button variant="ghost" size="sm" onClick={forceRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Total SKUs:</span>
              <span className="font-medium ml-1">{skuData.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Last Update:</span>
              <span className="font-medium ml-1">{lastUpdate.toLocaleTimeString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Out of Stock:</span>
              <span className="font-medium ml-1 text-destructive">{outOfStock.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Low Stock:</span>
              <span className="font-medium ml-1 text-orange-600">{lowStock.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Alert */}
      {(outOfStock.length > 0 || highSpendLowStock.length > 0) && (
        <Alert className="border-destructive/50 text-destructive [&>svg]:text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Inventory Issues Detected</AlertTitle>
          <AlertDescription>
            {outOfStock.length > 0 &&
              `${outOfStock.length} SKUs are out of stock. `}
            {highSpendLowStock.length > 0 &&
              `${highSpendLowStock.length} SKUs have high ad spend but low inventory.`}{" "}
            Immediate action required to prevent wasted ad spend.
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{outOfStock.length}</div>
            <p className="text-xs text-muted-foreground">0 units in stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStock.length}</div>
            <p className="text-xs text-muted-foreground">≤ 5 units in stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Spend Risk</CardTitle>
            <DollarSign className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{highSpendLowStock.length}</div>
            <p className="text-xs text-muted-foreground">High spend + low stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                skuData.reduce((sum: number, s: SKUData) => sum + s.revenue, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">All SKUs combined</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert Categories */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AlertCard
          title="Out of Stock – Immediate Action Required"
          description="SKUs with 0 inventory but still receiving ad spend. Pause campaigns immediately."
          items={outOfStock}
          variant="destructive"
          icon={AlertTriangle}
        />
        <AlertCard
          title="High Spend + Low Stock"
          description="SKUs with high spend (>$500) but low inventory (≤5 units). Reduce spend."
          items={highSpendLowStock}
          variant="destructive"
          icon={DollarSign}
        />
        <AlertCard
          title="Low Stock Warnings"
          description="SKUs with ≤5 units. Monitor closely and replenish inventory."
          items={lowStock}
          icon={TrendingDown}
        />
        <AlertCard
          title="Underperforming High Spend"
          description="SKUs with ROAS < 2.0x and spend > $200. Optimize campaigns."
          items={underperformingHighSpend}
          icon={Pause}
        />
      </div>

      {/* Selected SKU Detail */}
      {selectedSKU && (
        <Card className="border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                SKU Details: {selectedSKU.sku_id}
              </CardTitle>
              <CardDescription>
                {selectedSKU.name} • Stock Status:{" "}
                {selectedSKU.stockStatus.toUpperCase()}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => setSelectedSKU(null)}>
              Close
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium">Activity Metrics</h4>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-muted-foreground">Clicks:</span>{" "}
                    {selectedSKU.click_count}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Views:</span>{" "}
                    {selectedSKU.view_click_count}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Clicked:</span>{" "}
                    {new Date(selectedSKU.last_clicked).toLocaleString()}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Current Inventory:</span>{" "}
                    <strong>{selectedSKU.inventory_qty} units</strong>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Financial Performance</h4>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-muted-foreground">ROAS:</span>{" "}
                    <strong>{selectedSKU.roas.toFixed(2)}×</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ad Spend:</span>{" "}
                    {formatCurrency(selectedSKU.ad_spent)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Revenue:</span>{" "}
                    {formatCurrency(selectedSKU.total_revenue)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Profit:</span>{" "}
                    {formatCurrency(selectedSKU.total_revenue - selectedSKU.ad_spent)}
                  </div>
                  {selectedSKU.marginPercent && (
                    <div>
                      <span className="text-muted-foreground">Margin:</span>{" "}
                      {selectedSKU.marginPercent}%
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
