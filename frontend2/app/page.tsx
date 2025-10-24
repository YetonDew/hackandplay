"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthForm } from "@/components/auth-form"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("access_token")
    if (token) {
      router.push("/chat")
    } else {
      setIsLoading(false)
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-primary/10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-primary/10 p-4">
      <AuthForm />
    </div>
  )
}
