"use client";

import { useState, useEffect } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs";
import {
  collection, onSnapshot
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  MousePointer, TrendingUp, Target, Clock,
  BarChart3, Calendar, Users, Smartphone,
  Monitor, Tablet
} from "lucide-react";

interface SKUData {
  id: string;
  sku_id: string;
  ad_spent: number;
  click_count: number;
  inventory_qty: number;
  last_clicked: any;  // Firestore timestamp
  roas: number;
  total_revenue: number;
  view_click_count: number;
}

interface AdClickTrackerProps {
  selectedSKU?: SKUData | null;
}

interface ClickData {
  timestamp: string;
  source: string;
  device: string;
  location: string;
  converted: boolean;
  revenue?: number;
}

interface ClickMetrics {
  totalClicks: number;
  uniqueClicks: number;
  clickThroughRate: number;
  costPerClick: number;
  clicksByHour: { hour: number; clicks: number }[];
  clicksByDevice: { device: string; clicks: number; percentage: number }[];
  clicksBySource: { source: string; clicks: number; percentage: number }[];
  recentClicks: ClickData[];
}

export function AdClickTracker({ selectedSKU }: AdClickTrackerProps) {
  const [skuData, setSkuData] = useState<SKUData[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<SKUData | null>(selectedSKU || null);
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "sku_clicks"), snapshot => {
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as SKUData));
      setSkuData(products);
      if (selectedProduct) {
        const latest = products.find(p => p.id === selectedProduct.id);
        if (latest) setSelectedProduct(latest);
      }
    });
    return () => unsub();
  }, [selectedProduct]);

  const sources = ["Google Ads", "Facebook", "Instagram", "TikTok", "YouTube", "Display Network"];
  const devices = ["Desktop", "Mobile", "Tablet"];
  const locations = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia"];

  const generateClickMetrics = (sku: SKUData): ClickMetrics => {
    const clicks = sku.click_count || 0;
    const impressions = sku.view_click_count || 1; // avoid divide by zero
    const adSpend = sku.ad_spent || 0;

    const clicksByHour = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      clicks: Math.floor(Math.random() * (clicks / 24) + 1),
    }));

    const clicksByDevice = devices.map(device => {
      const c = Math.floor(Math.random() * clicks * 0.4 + clicks * 0.1);
      return { device, clicks: c, percentage: Math.round((c / clicks) * 100) };
    });

    const clicksBySource = sources.map(source => {
      const c = Math.floor(Math.random() * clicks * 0.3 + clicks * 0.05);
      return { source, clicks: c, percentage: Math.round((c / clicks) * 100) };
    });

    const recentClicks: ClickData[] = Array.from({ length: 10 }, (_, i) => ({
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      source: sources[Math.floor(Math.random() * sources.length)],
      device: devices[Math.floor(Math.random() * devices.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      converted: Math.random() < 0.5,
      revenue: Math.random() < 0.3 ? Math.random() * 100 + 20 : undefined,
    }));

    return {
      totalClicks: clicks,
      uniqueClicks: Math.floor(clicks * 0.85),
      clickThroughRate: Math.round((clicks / impressions) * 10000) / 100,
      costPerClick: adSpend > 0 && clicks > 0 ? Math.round((adSpend / clicks) * 100) / 100 : 0,
      clicksByHour,
      clicksByDevice,
      clicksBySource,
      recentClicks,
    };
  };

  const clickMetrics = selectedProduct ? generateClickMetrics(selectedProduct) : null;

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case "mobile": return <Smartphone className="h-4 w-4" />;
      case "desktop": return <Monitor className="h-4 w-4" />;
      case "tablet": return <Tablet className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MousePointer className="h-5 w-5" />
            Ad Click Tracking Dashboard
          </CardTitle>
          <CardDescription>Real-time click analytics dashboard. Select a product to view details.</CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedProduct ? (
            <div className="space-y-4">
              <p className="text-muted-foreground">Select a product to view its analytics:</p>
              <div className="grid gap-2 max-h-60 overflow-y-auto">
                {skuData.slice(0, 20).map(sku => (
                  <Button
                    variant="outline"
                    key={sku.id}
                    className="justify-start h-auto p-3 bg-transparent"
                    onClick={() => setSelectedProduct(sku)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{sku.sku_id}</div>
                      <div className="text-xs text-muted-foreground">
                        Clicks: {sku.click_count} • Revenue: {formatCurrency(sku.total_revenue)} • ROAS: {sku.roas.toFixed(2)}
                      </div>
                    </div>
                    <Badge variant="secondary">{sku.click_count}</Badge>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{selectedProduct.sku_id}</h3>
                  <p className="text-sm text-muted-foreground">
                    Inventory: {selectedProduct.inventory_qty} • Last Clicked: {(selectedProduct.last_clicked?.toDate?.() || new Date()).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedProduct(null)}>
                    Change Product
                  </Button>
                </div>
              </div>

              {/* Product analytics cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <MousePointer className="h-4 w-4 text-primary" />
                      <div className="text-sm font-medium">Total Clicks</div>
                    </div>
                    <div className="text-2xl font-bold">{clickMetrics?.totalClicks.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      <div className="text-sm font-medium">Click-Through Rate</div>
                    </div>
                    <div className="text-2xl font-bold">{clickMetrics?.clickThroughRate}%</div>
                    <div className="text-xs text-muted-foreground">{selectedProduct.view_click_count} views</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <div className="text-sm font-medium">Cost Per Click</div>
                    </div>
                    <div className="text-2xl font-bold">{formatCurrency(clickMetrics?.costPerClick || 0)}</div>
                    <div className="text-xs text-muted-foreground">{formatCurrency(selectedProduct.ad_spent)} total spent</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-500" />
                      <div className="text-sm font-medium">Total Revenue</div>
                    </div>
                    <div className="text-2xl font-bold">{formatCurrency(selectedProduct.total_revenue)}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs component showing hourly trends, device distribution, sources, recent activity... */}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

//   function getDeviceIcon(device: string) {
//     switch (device.toLowerCase()) {
//       case "mobile": return <Smartphone className="h-4 w-4" />;
//       case "desktop": return <Monitor className="h-4 w-4" />;
//       case "tablet": return <Tablet className="h-4 w-4" />;
//       default: return <Monitor className="h-4 w-4" />;
//     }
//   }
}
