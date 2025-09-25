// Mock data generator for ROAS tracking dashboard

export interface SKUData {
  id: string
  name: string
  category: string
  brand: string
  size: string
  color: string
  material: string
  weight: number
  dimensions: string
  supplier: string
  supplierCode: string
  barcode: string
  tags: string[]
  seasonality: "spring" | "summer" | "fall" | "winter" | "year-round"
  targetAudience: string
  adSpend: number
  revenue: number
  roas: number
  clicks: number
  impressions: number
  conversions: number
  conversionRate: number
  inventory: number
  stockStatus: "high" | "medium" | "low" | "out"
  lastUpdated: string
  costOfGoods?: number
  sellingPrice?: number
  grossMargin?: number
  marginPercent?: number
  predictedStockoutDays?: number
  stockoutRisk?: "low" | "medium" | "high" | "critical"
  recommendedBidAdjustment?: number
  marginTier?: "low" | "medium" | "high" | "premium"
  biddingPriority?: number
  lastSyncTimestamp?: string
  style?: string
  fit?: string
}

export interface CampaignData {
  id: string
  name: string
  totalSpend: number
  totalRevenue: number
  totalROAS: number
  totalClicks: number
  totalImpressions: number
  totalConversions: number
  skus: string[]
  dateRange: string
}

export interface DashboardMetrics {
  totalROAS: number
  totalSpend: number
  totalRevenue: number
  totalConversions: number
  averageConversionRate: number
  topPerformingSKU: string
  worstPerformingSKU: string
  lowStockAlerts: number
}

function generateClothingVariations() {
  const tshirtStyles = ["Classic Crew", "V-Neck", "Henley", "Polo", "Tank Top", "Long Sleeve", "Graphic Tee"]
  const tshirtFits = ["Regular", "Slim", "Relaxed", "Oversized"]
  const tshirtColors = [
    "Black",
    "White",
    "Navy",
    "Gray",
    "Red",
    "Blue",
    "Green",
    "Pink",
    "Purple",
    "Yellow",
    "Orange",
    "Maroon",
  ]
  const tshirtSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"]

  const jeansStyles = ["Skinny", "Straight", "Bootcut", "Wide Leg", "Tapered", "Relaxed", "Slim Straight"]
  const jeansFits = ["Low Rise", "Mid Rise", "High Rise"]
  const jeansColors = [
    "Dark Wash",
    "Light Wash",
    "Medium Wash",
    "Black",
    "White",
    "Distressed Blue",
    "Raw Denim",
    "Faded Black",
  ]
  const jeansSizes = ["26", "28", "30", "32", "34", "36", "38", "40", "42"]

  const tshirtBrands = ["StyleMax", "UrbanFit"]

  const jeansBrands = ["PremiumDenim", "ClassicWear", "TrendyThreads", "ComfortZone", "CasualChic"]

  const variations = []

  tshirtStyles.forEach((style) => {
    tshirtColors.forEach((color) => {
      tshirtSizes.forEach((size) => {
        tshirtBrands.forEach((brand) => {
          // Loop through both brands for each combination
          const fit = tshirtFits[Math.floor(Math.random() * tshirtFits.length)]
          variations.push({
            name: `${style} T-Shirt`,
            category: "Clothing",
            brand,
            style,
            fit,
            color,
            size,
            material: "Cotton",
            basePrice: 15 + Math.random() * 35, // $15-50
            weight: 0.3 + Math.random() * 0.2, // 0.3-0.5 lbs
          })
        })
      })
    })
  })

  // Generate Jeans variations with multiple brands
  jeansStyles.forEach((style) => {
    jeansColors.forEach((color) => {
      jeansSizes.forEach((size) => {
        const fit = jeansFits[Math.floor(Math.random() * jeansFits.length)]
        const brand = jeansBrands[Math.floor(Math.random() * jeansBrands.length)]
        variations.push({
          name: `${style} Jeans`,
          category: "Clothing",
          brand,
          style,
          fit,
          color,
          size,
          material: "Denim",
          basePrice: 40 + Math.random() * 80, // $40-120
          weight: 1.2 + Math.random() * 0.8, // 1.2-2.0 lbs
        })
      })
    })
  })

  return variations
}

// Generate mock SKU data
export function generateMockSKUData(): SKUData[] {
  const categories = ["Electronics", "Clothing", "Home & Garden", "Sports", "Beauty"]
  const brands = ["TechPro", "StyleMax", "HomeComfort", "ActiveLife", "GlowUp", "PremiumChoice", "EcoFriendly"]
  const colors = ["Black", "White", "Blue", "Red", "Green", "Gray", "Brown", "Pink", "Purple", "Yellow"]
  const materials = ["Plastic", "Metal", "Cotton", "Polyester", "Wood", "Glass", "Ceramic", "Leather", "Silicone"]
  const suppliers = ["Global Supply Co", "Premium Imports", "Local Crafters", "Tech Distributors", "Fashion Forward"]
  const targetAudiences = ["Young Adults", "Professionals", "Families", "Athletes", "Seniors", "Students"]

  const products = [
    { name: "Wireless Headphones", category: "Electronics", sizes: ["One Size"], materials: ["Plastic", "Metal"] },
    {
      name: "Smart Watch",
      category: "Electronics",
      sizes: ["Small", "Medium", "Large"],
      materials: ["Metal", "Silicone"],
    },
    { name: "Laptop Stand", category: "Electronics", sizes: ["Standard"], materials: ["Metal"] },
    {
      name: "Phone Case",
      category: "Electronics",
      sizes: ["iPhone 14", "iPhone 15", "Samsung S24"],
      materials: ["Silicone", "Plastic"],
    },
    {
      name: "Bluetooth Speaker",
      category: "Electronics",
      sizes: ["Compact", "Standard", "Large"],
      materials: ["Plastic", "Metal"],
    },
    {
      name: "Running Shoes",
      category: "Sports",
      sizes: ["7", "8", "9", "10", "11"],
      materials: ["Polyester", "Leather"],
    },
    { name: "Yoga Mat", category: "Sports", sizes: ["Standard", "Extra Long"], materials: ["Rubber", "Cork"] },
    { name: "Water Bottle", category: "Sports", sizes: ["16oz", "24oz", "32oz"], materials: ["Plastic", "Steel"] },
    { name: "Backpack", category: "Sports", sizes: ["Small", "Medium", "Large"], materials: ["Polyester", "Canvas"] },
    { name: "Sunglasses", category: "Sports", sizes: ["One Size"], materials: ["Plastic", "Metal"] },
    { name: "Face Cream", category: "Beauty", sizes: ["1oz", "2oz", "4oz"], materials: ["Glass", "Plastic"] },
    { name: "Shampoo", category: "Beauty", sizes: ["8oz", "16oz", "32oz"], materials: ["Plastic"] },
    { name: "Perfume", category: "Beauty", sizes: ["1oz", "2oz", "3.4oz"], materials: ["Glass"] },
    { name: "Lipstick", category: "Beauty", sizes: ["Standard"], materials: ["Plastic", "Metal"] },
    { name: "Moisturizer", category: "Beauty", sizes: ["2oz", "4oz", "8oz"], materials: ["Glass", "Plastic"] },
    {
      name: "Coffee Maker",
      category: "Home & Garden",
      sizes: ["6-cup", "10-cup", "12-cup"],
      materials: ["Plastic", "Steel"],
    },
    { name: "Desk Lamp", category: "Home & Garden", sizes: ["Compact", "Standard"], materials: ["Metal", "Plastic"] },
    {
      name: "Plant Pot",
      category: "Home & Garden",
      sizes: ["Small", "Medium", "Large"],
      materials: ["Ceramic", "Plastic"],
    },
    {
      name: "Throw Pillow",
      category: "Home & Garden",
      sizes: ["16x16", "18x18", "20x20"],
      materials: ["Cotton", "Polyester"],
    },
    { name: "Wall Art", category: "Home & Garden", sizes: ["12x16", "16x20", "24x36"], materials: ["Canvas", "Paper"] },
  ]

  const clothingVariations = generateClothingVariations()
  const allProducts = [...products, ...clothingVariations.slice(0, 80)] // Use more clothing variations to properly showcase t-shirt data - 80 clothing items + 20 other products

  return allProducts.map((product, index) => {
    const adSpend = Math.random() * 5000 + 500
    const revenue = adSpend * (Math.random() * 4 + 0.5) // ROAS between 0.5 and 4.5
    const clicks = Math.floor(Math.random() * 2000 + 100) // 100-2100 clicks
    const impressions = clicks * (Math.random() * 50 + 10) // 10-60x clicks for impressions
    const conversions = Math.floor(clicks * (Math.random() * 0.08 + 0.01)) // 1-9% conversion rate

    let inventory = Math.floor(Math.random() * 1000)
    // Force some items to be out of stock for testing
    if (Math.random() < 0.1) inventory = 0

    let stockStatus: "high" | "medium" | "low" | "out"
    if (inventory === 0) stockStatus = "out"
    else if (inventory < 50) stockStatus = "low"
    else if (inventory < 200) stockStatus = "medium"
    else stockStatus = "high"

    const sellingPrice = product.basePrice || 50 + Math.random() * 200 // Use basePrice for clothing
    const marginPercent = 0.15 + Math.random() * 0.55 // 15-70% margin
    const costOfGoods = sellingPrice * (1 - marginPercent)
    const grossMargin = sellingPrice - costOfGoods

    const selectedSize =
      product.size || (product.sizes ? product.sizes[Math.floor(Math.random() * product.sizes.length)] : "Standard")
    const selectedMaterial =
      product.material ||
      (product.materials ? product.materials[Math.floor(Math.random() * product.materials.length)] : "Mixed")
    const selectedColor = product.color || colors[Math.floor(Math.random() * colors.length)]
    const selectedBrand = product.brand || brands[Math.floor(Math.random() * brands.length)]
    const selectedSupplier = suppliers[Math.floor(Math.random() * suppliers.length)]
    const selectedAudience = targetAudiences[Math.floor(Math.random() * targetAudiences.length)]

    const predictedStockoutDays = inventory > 0 ? Math.floor((inventory / Math.max(conversions * 30, 1)) * 30) : 0
    let stockoutRisk: "low" | "medium" | "high" | "critical"
    if (stockStatus === "out") stockoutRisk = "critical"
    else if (predictedStockoutDays < 7) stockoutRisk = "high"
    else if (predictedStockoutDays < 14) stockoutRisk = "medium"
    else stockoutRisk = "low"

    let marginTier: "low" | "medium" | "high" | "premium"
    if (marginPercent < 0.25) marginTier = "low"
    else if (marginPercent < 0.4) marginTier = "medium"
    else if (marginPercent < 0.6) marginTier = "high"
    else marginTier = "premium"

    const biddingPriority = Math.round((marginPercent * 0.4 + (revenue / adSpend) * 0.6) * 100)
    const recommendedBidAdjustment =
      marginTier === "premium" ? 1.2 : marginTier === "high" ? 1.1 : marginTier === "medium" ? 1.0 : 0.8

    return {
      id: `SKU-${String(index + 1).padStart(3, "0")}`,
      name: product.name,
      category: product.category,
      brand: selectedBrand,
      size: selectedSize,
      color: selectedColor,
      material: selectedMaterial,
      weight: product.weight || Math.round((Math.random() * 5 + 0.1) * 100) / 100,
      dimensions: `${Math.floor(Math.random() * 20 + 5)}"L x ${Math.floor(Math.random() * 15 + 3)}"W x ${Math.floor(Math.random() * 10 + 2)}"H`,
      supplier: selectedSupplier,
      supplierCode: `SUP-${String(Math.floor(Math.random() * 9999) + 1000)}`,
      barcode: `${Math.floor(Math.random() * 900000000000) + 100000000000}`,
      tags: [product.category.toLowerCase(), selectedMaterial.toLowerCase(), selectedColor.toLowerCase()],
      seasonality: ["spring", "summer", "fall", "winter", "year-round"][Math.floor(Math.random() * 5)] as any,
      targetAudience: selectedAudience,
      adSpend: Math.round(adSpend * 100) / 100,
      revenue: Math.round(revenue * 100) / 100,
      roas: Math.round((revenue / adSpend) * 100) / 100,
      clicks,
      impressions: Math.floor(impressions),
      conversions,
      conversionRate: clicks > 0 ? Math.round((conversions / clicks) * 10000) / 100 : 0,
      inventory,
      stockStatus,
      lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      costOfGoods: Math.round(costOfGoods * 100) / 100,
      sellingPrice: Math.round(sellingPrice * 100) / 100,
      grossMargin: Math.round(grossMargin * 100) / 100,
      marginPercent: Math.round(marginPercent * 100) / 100,
      predictedStockoutDays,
      stockoutRisk,
      recommendedBidAdjustment,
      marginTier,
      biddingPriority,
      lastSyncTimestamp: new Date().toISOString(),
      style: product.style,
      fit: product.fit,
    }
  })
}

// Generate mock campaign data
export function generateMockCampaignData(skuData: SKUData[]): CampaignData[] {
  const campaigns = [
    "Summer Sale 2024",
    "Black Friday Deals",
    "New Product Launch",
    "Holiday Special",
    "Spring Collection",
  ]

  return campaigns.map((campaign, index) => {
    const campaignSKUs = skuData.slice(index * 5, (index + 1) * 5)
    const totalSpend = campaignSKUs.reduce((sum, sku) => sum + sku.adSpend, 0)
    const totalRevenue = campaignSKUs.reduce((sum, sku) => sum + sku.revenue, 0)
    const totalClicks = campaignSKUs.reduce((sum, sku) => sum + sku.clicks, 0)
    const totalImpressions = campaignSKUs.reduce((sum, sku) => sum + sku.impressions, 0)
    const totalConversions = campaignSKUs.reduce((sum, sku) => sum + sku.conversions, 0)

    return {
      id: `CAMP-${String(index + 1).padStart(3, "0")}`,
      name: campaign,
      totalSpend: Math.round(totalSpend * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalROAS: Math.round((totalRevenue / totalSpend) * 100) / 100,
      totalClicks,
      totalImpressions,
      totalConversions,
      skus: campaignSKUs.map((sku) => sku.id),
      dateRange: "Last 30 days",
    }
  })
}

// Calculate dashboard metrics
export function calculateDashboardMetrics(skuData: SKUData[]): DashboardMetrics {
  const totalSpend = skuData.reduce((sum, sku) => sum + sku.adSpend, 0)
  const totalRevenue = skuData.reduce((sum, sku) => sum + sku.revenue, 0)
  const totalConversions = skuData.reduce((sum, sku) => sum + sku.conversions, 0)
  const totalClicks = skuData.reduce((sum, sku) => sum + sku.clicks, 0)

  const sortedByROAS = [...skuData].sort((a, b) => b.roas - a.roas)
  const lowStockSKUs = skuData.filter((sku) => sku.stockStatus === "low" || sku.stockStatus === "out")

  return {
    totalROAS: Math.round((totalRevenue / totalSpend) * 100) / 100,
    totalSpend: Math.round(totalSpend * 100) / 100,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalConversions,
    averageConversionRate: Math.round((totalConversions / totalClicks) * 10000) / 100,
    topPerformingSKU: sortedByROAS[0]?.name || "N/A",
    worstPerformingSKU: sortedByROAS[sortedByROAS.length - 1]?.name || "N/A",
    lowStockAlerts: lowStockSKUs.length,
  }
}

// Generate time series data for charts
export function generateTimeSeriesData(days = 30) {
  const data = []
  const baseDate = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(baseDate)
    date.setDate(date.getDate() - i)

    data.push({
      date: date.toISOString().split("T")[0],
      roas: Math.round((Math.random() * 3 + 1) * 100) / 100,
      spend: Math.round((Math.random() * 2000 + 500) * 100) / 100,
      revenue: Math.round((Math.random() * 5000 + 1000) * 100) / 100,
      conversions: Math.floor(Math.random() * 100 + 10),
    })
  }

  return data
}
