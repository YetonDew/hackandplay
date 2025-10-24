"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"               // ← create from my previous message
import { ChatInterface as ChatFloatingWidget } from "@/components/chat-interface"
import { Loader2 } from "lucide-react"

export default function ChatPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string>("")

  // Simple logout handler for the header button
  const handleLogout = useCallback(() => {
    localStorage.removeItem("access_token")
    router.push("/")
  }, [router])

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token")
      if (!token) {
        router.push("/")
        return
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
          // credentials / mode can be added if your API needs them
        })
        if (!response.ok) throw new Error("Unauthorized")

        const data = await response.json()
        setUserEmail(data.email ?? "")
        setIsLoading(false)
      } catch (error) {
        console.error("[v0] Auth check failed:", error)
        localStorage.removeItem("access_token")
        router.push("/")
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background via-secondary/20 to-primary/10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header at the top */}
      <Header userEmail={userEmail} onLogout={handleLogout} />

      {/* Main content area — build the rest of your page here */}
      <main className="container mx-auto flex-1 px-4 py-6">
        <div className="grid gap-6 md:grid-cols-3">
          <section className="md:col-span-2 space-y-4">
            <h2 className="text-2xl font-semibold">Welcome, {userEmail || "user"}</h2>
            <p className="text-sm text-muted-foreground">
              This is your page content. Add dashboards, tables, product lists, etc.
            </p>
            {/* Your components go here */}
          </section>

          <aside className="space-y-4">
            <h3 className="text-lg font-medium">Sidebar</h3>
            <p className="text-sm text-muted-foreground">Filters, quick actions, summaries…</p>
          </aside>
        </div>
      </main>

      {/* Floating chat over the whole page */}
      <ChatFloatingWidget userEmail={userEmail} rememberStateKey="bestoffers_chat_open" />
    </div>
  )
}
