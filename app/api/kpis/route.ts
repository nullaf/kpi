import { NextResponse } from "next/server"
import type { KpiDataPoint } from "@/components/KpiThresholdChart/types"

// Simulate fetching KPI data from a database or external API
function generateKpiData(): KpiDataPoint[] {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  let baseRevenue = 500000
  const trend = 0.08 // 8% growth trend

  return months.map((month, index) => {
    // Add some realistic volatility
    const volatility = (Math.random() - 0.5) * 0.2
    const seasonality = Math.sin((index / 12) * 2 * Math.PI) * 0.1

    baseRevenue *= 1 + trend / 12 + volatility + seasonality

    return {
      month,
      revenue: Math.round(baseRevenue),
      timestamp: Date.now() + index * 24 * 60 * 60 * 1000,
    }
  })
}

export async function GET() {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const data = generateKpiData()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error generating KPI data:", error)
    return NextResponse.json({ error: "Failed to generate KPI data" }, { status: 500 })
  }
}

export async function POST() {
  try {
    // Simulate refreshing data
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const data = generateKpiData()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error refreshing KPI data:", error)
    return NextResponse.json({ error: "Failed to refresh KPI data" }, { status: 500 })
  }
}
