"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { KpiThresholdChart } from "@/components/KpiThresholdChart/Chart"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <KpiThresholdChart />
        </div>
      </main>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
