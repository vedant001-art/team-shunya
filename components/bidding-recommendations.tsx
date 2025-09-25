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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  AlertTriangle,
} from "lucide-react";

interface BiddingRecommendation {
  skuId: string;
  priority: "high" | "medium" | "low";
  spendChange: number;
  spendChangePercent: number;
  currentSpend: number;
  recommendedSpend: number;
  expectedProfit: number;
  expectedROAS: number;
  reason: string;
}

interface SKUData {
  id: string;
  name: string;
}

export function BiddingRecommendations() {
  const [recommendations, setRecommendations] = useState<BiddingRecommendation[]>(
    []
  );
  const [skuData, setSkuData] = useState<SKUData[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<
    "all" | "high" | "medium" | "low"
  >("all");
  const [loading, setLoading] = useState(true);

  // Subscribe to SKU metadata (names)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      const skus: SKUData[] = [];
      snap.forEach((doc) => {
        const d = doc.data();
        skus.push({ id: doc.id, name: d.productName || doc.id });
      });
      setSkuData(skus);
    });
    return () => unsub();
  }, []);

  // Subscribe to bidding recommendations
  useEffect(() => {
    setLoading(true);
    const unsub = onSnapshot(collection(db, "bidding_recommendations"), (snap) => {
      const recs: BiddingRecommendation[] = [];
      snap.forEach((doc) => {
        recs.push(doc.data() as BiddingRecommendation);
      });
      setRecommendations(recs);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = recommendations.filter(
    (rec) => selectedPriority === "all" || rec.priority === selectedPriority
  );
  const totalSpendChange = recommendations.reduce((sum, r) => sum + r.spendChange, 0);
  const totalExpectedProfit = recommendations.reduce((sum, r) => sum + r.expectedProfit, 0);
  const highCount = recommendations.filter((r) => r.priority === "high").length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle>Total Spend Impact</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalSpendChange >= 0 ? "+" : ""}
              ${totalSpendChange.toLocaleString()}
            </div>
            <p className="text-xs">{totalSpendChange >= 0 ? "Increased investment" : "Cost savings"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle>Expected Profit</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+${totalExpectedProfit.toLocaleString()}</div>
            <p className="text-xs">Projected monthly profit increase</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle>High Priority Actions</CardTitle>
            <Target className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{highCount}</div>
            <p className="text-xs">SKUs requiring immediate attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Priority Tabs */}
      <Tabs
        value={selectedPriority}
        onValueChange={(v) => setSelectedPriority(v as any)}
      >
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="all">
            All ({recommendations.length})
          </TabsTrigger>
          <TabsTrigger value="high">
            High ({recommendations.filter((r) => r.priority === "high").length})
          </TabsTrigger>
          <TabsTrigger value="medium">
            Medium ({recommendations.filter((r) => r.priority === "medium").length})
          </TabsTrigger>
          <TabsTrigger value="low">
            Low ({recommendations.filter((r) => r.priority === "low").length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value={selectedPriority}>
          {filtered.length === 0 ? (
            <Alert>
              <AlertTriangle />
              <AlertDescription>No recommendations found</AlertDescription>
            </Alert>
          ) : (
            filtered.map((rec) => (
              <RecommendationCard key={rec.skuId} rec={rec} skuData={skuData} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RecommendationCard({
  rec,
  skuData,
}: {
  rec: BiddingRecommendation;
  skuData: SKUData[];
}) {
  const sku = skuData.find((s) => s.id === rec.skuId);
  const [applied, setApplied] = useState(false);

  const biddingChance =
    rec.expectedProfit > 0 ? rec.expectedROAS * Math.log1p(rec.expectedProfit) : 0;

  const handleApply = () => {
    setApplied(true);
    // TODO: Implement Firestore update logic here
    setTimeout(() => setApplied(false), 3000);
  };

  return (
    <Card className={applied ? "ring-2 ring-green-500" : ""}>
      <CardHeader>
        <div className="flex justify-between items-center w-full">
          <div>
            <CardTitle>{sku?.name || rec.skuId}</CardTitle>
            <Badge
              variant={
                rec.priority === "high"
                  ? "destructive"
                  : rec.priority === "medium"
                  ? "secondary"
                  : "default"
              }
            >
              {rec.priority} priority
            </Badge>
          </div>
          <Button onClick={handleApply} disabled={applied}>
            {applied ? "Applied" : "Apply"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Spend Change</span>
            <span>
              {rec.spendChange >= 0 ? "+" : ""}
              ${rec.spendChange.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Spend Change %</span>
            <span>{rec.spendChangePercent.toFixed(2)}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Recommended Spend</span>
            <span>${rec.recommendedSpend.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Expected Profit</span>
            <span className="text-green-600">
              +${rec.expectedProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Expected ROAS</span>
            <span>{rec.expectedROAS.toFixed(2)}x</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Bidding Chance</span>
            <span>{biddingChance.toFixed(3)}</span>
          </div>
          <div className="mt-2 font-semibold text-muted">{rec.reason}</div>
        </div>
      </CardContent>
    </Card>
  );
}
