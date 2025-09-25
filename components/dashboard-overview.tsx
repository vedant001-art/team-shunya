"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  TrendingUp,
  DollarSign,
  Target,
  Eye,
  BarChart3,
  Zap,
  AlertTriangle,
} from "lucide-react";

interface SKUMetric {
  id: string;
  name: string;
  size: string;
  color: string;
  brand: string;
  roas: number;
  adSpend: number;
  totalRevenue: number;
  stockStatus: string;
}

export function DashboardOverview() {
  const [skuData, setSkuData] = useState<SKUMetric[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const colRef = collection(db, "sku_clicks"); // update to your collection if needed
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const data: SKUMetric[] = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            name: typeof d.name === "string" ? d.name : "N/A",
            size: typeof d.size === "string" ? d.size : "N/A",
            color: typeof d.color === "string" ? d.color : "N/A",
            brand: typeof d.brand === "string" ? d.brand : "N/A",
            roas: typeof d.roas === "number" ? d.roas : 0,
            adSpend: typeof d.ad_spent === "number" ? d.ad_spent : 0,
            totalRevenue: typeof d.total_revenue === "number" ? d.total_revenue : 0,
            stockStatus: typeof d.stock_status === "string" ? d.stock_status : "unknown",
          };
        });
        setSkuData(data);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to load SKU data:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="text-lg font-medium">Loading dashboard…</div>
        {[1, 2, 3, 4].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="h-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Aggregate calculations
  const totalAdSpend = skuData.reduce((acc, sku) => acc + sku.adSpend, 0);
  const totalRevenue = skuData.reduce((acc, sku) => acc + sku.totalRevenue, 0);
  const avgROAS =
    skuData.length > 0
      ? skuData.reduce((acc, sku) => acc + sku.roas, 0) / skuData.length
      : 0;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  const getROASColor = (roas: number) => {
    if (roas >= 3) return "text-green-600";
    if (roas >= 2) return "text-green-500";
    if (roas >= 1) return "text-yellow-500";
    return "text-red-500";
  };

  const getBadgeVariant = (roas: number) => {
    if (roas >= 3) return "success";
    if (roas >= 2) return "secondary";
    if (roas >= 1) return "warning";
    return "destructive";
  };

  const topPerformers = [...skuData].sort((a, b) => b.roas - a.roas).slice(0, 5);
  const highSpenders = [...skuData].sort((a, b) => b.adSpend - a.adSpend).slice(0, 5);

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Average ROAS */}
      <Card className={selectedMetric === "roas" ? "ring-2 ring-green-500" : ""}>
        <CardHeader className="flex justify-between items-center pb-2">
          <CardTitle>Average ROAS</CardTitle>
          <Target className="text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-2">
            <span className={`text-xl font-bold ${getROASColor(avgROAS)}`}>
              {avgROAS.toFixed(2)}x
            </span>
            <Badge variant={getBadgeVariant(avgROAS)}>
              {avgROAS >= 3
                ? "Excellent"
                : avgROAS >= 2
                ? "Good"
                : avgROAS >= 1
                ? "Break Even"
                : "Poor"}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Average return on ad spend across products
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setSelectedMetric(selectedMetric === "roas" ? null : "roas")}
          >
            <BarChart3 className="inline mr-2 w-4 h-4" /> View Details
          </Button>
        </CardContent>
      </Card>

      {/* Total Ad Spend */}
      <Card className={selectedMetric === "spend" ? "ring-2 ring-green-500" : ""}>
        <CardHeader className="flex justify-between items-center pb-2">
          <CardTitle>Total Ad Spend</CardTitle>
          <DollarSign className="text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2">{formatCurrency(totalAdSpend)}</div>
          <p className="text-sm text-gray-600 mb-2">Total money spent on ads</p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setSelectedMetric(selectedMetric === "spend" ? null : "spend")}
          >
            <Eye className="inline mr-2 w-4 h-4" /> Top Spenders
          </Button>
        </CardContent>
      </Card>

      {/* Total Revenue */}
      <Card className={selectedMetric === "revenue" ? "ring-2 ring-green-500" : ""}>
        <CardHeader className="flex justify-between items-center pb-2">
          <CardTitle>Total Revenue</CardTitle>
          <TrendingUp className="text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 mb-2">{formatCurrency(totalRevenue)}</div>
          <p className="text-sm text-gray-600 mb-2">Revenue generated from ads</p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setSelectedMetric(selectedMetric === "revenue" ? null : "revenue")}
          >
            <Zap className="inline mr-2 w-4 h-4" /> Revenue Leaders
          </Button>
        </CardContent>
      </Card>

      {selectedMetric && (
        <Card className="md:col-span-4 mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {selectedMetric === "roas" && <Target />}
              {selectedMetric === "spend" && <DollarSign />}
              {selectedMetric === "revenue" && <TrendingUp />}
              &nbsp;{selectedMetric.toUpperCase()} Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedMetric === "roas" &&
              topPerformers.map((sku) => (
                <div key={sku.id} className="mb-4 border-b pb-2">
                  <div className="font-semibold">{sku.name}</div>
                  <div className="text-sm text-gray-600">{sku.size} • {sku.color} • {sku.brand}</div>
                  <div className="flex justify-between mt-1">
                    <span>{sku.roas.toFixed(2)}x ROAS</span>
                    <Badge variant={getBadgeVariant(sku.roas)}>Performance</Badge>
                  </div>
                </div>
              ))}

            {selectedMetric === "spend" &&
              highSpenders.map((sku) => (
                <div key={sku.id} className="mb-4 border-b pb-2">
                  <div className="font-semibold">{sku.name}</div>
                  <div className="text-sm text-gray-600">{sku.size} • {sku.color} • {sku.brand}</div>
                  <div className="flex justify-between mt-1">
                    <span>{formatCurrency(sku.adSpend)}</span>
                    <Badge variant={sku.roas > 2 ? "success" : "destructive"}>{sku.roas.toFixed(2)}x ROAS</Badge>
                  </div>
                </div>
              ))}

            {selectedMetric === "revenue" &&
              skuData
                .slice()
                .sort((a, b) => b.totalRevenue - a.totalRevenue)
                .slice(0, 5)
                .map((sku) => (
                  <div key={sku.id} className="mb-4 border-b pb-2">
                    <div className="font-semibold">{sku.name}</div>
                    <div className="text-sm text-gray-600">{sku.size} • {sku.color} • {sku.brand}</div>
                    <div className="flex justify-between mt-1">
                      <span>{formatCurrency(sku.totalRevenue)}</span>
                      <Badge variant="success">Revenue Leader</Badge>
                    </div>
                  </div>
                ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
