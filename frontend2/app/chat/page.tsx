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
<link rel="stylesheet" href="https://cdn.tailgrids.com/tailgrids-fallback.css" />

<section className="pt-20 lg:pt-[120px] pb-10 lg:pb-20">
   <div className="container">
      <div className="flex flex-wrap -mx-4">
         <div className="w-full md:w-1/2 xl:w-1/3 px-4">
            <div className="bg-white rounded-lg overflow-hidden mb-10">
               <img
                  src="https://tigerfrommars.sirv.com/123/1.webp"
                  alt="image"
                  className="w-full"
                  />
               <div className="p-8 sm:p-9 md:p-7 xl:p-9 text-center">
                  <h3>
                     <a
                        href="javascript:void(0)"
                        className="
                        font-semibold
                        text-dark text-xl
                        sm:text-[22px]
                        md:text-xl
                        lg:text-[22px]
                        xl:text-xl
                        2xl:text-[22px]
                        mb-4
                        block
                        hover:text-primary
                        "
                        >
                     Freedom+ 5G — 119,99 zł/mies.
                     </a>
                  </h3>
                  <p className="text-base text-body-color leading-relaxed mb-7">
					Unlimited 5G in Poland (up to 600 Mbps). 25 GB EU roaming + 10 GB in the US/Canada/Switzerland. 1 line. Unlimited calls & texts. 3 months of streaming included. Premium Individual plan.
                  </p>
                  <a
                     href="javascript:void(0)"
                     className="
					 bg-transparent
                     inline-block
                     py-2
                     px-7
                     border border-[#E5E7EB]
                     rounded-full
                     text-base text-gray-700
                     font-medium
                     hover:border-primary hover:bg-primary hover:text-white
                     transition
                     "
                     >
                  View Details
                  </a>
               </div>
            </div>
         </div>
         <div className="w-full md:w-1/2 xl:w-1/3 px-4">
            <div className="bg-white rounded-lg overflow-hidden mb-10">
               <img
                  src="https://tigerfrommars.sirv.com/123/2.webp"
                  alt="image"
                  className="w-full"
                  />
               <div className="p-8 sm:p-9 md:p-7 xl:p-9 text-center">
                  <h3>
                     <a
                        href="javascript:void(0)"
                        className="
                        font-semibold
                        text-dark text-xl
                        sm:text-[22px]
                        md:text-xl
                        lg:text-[22px]
                        xl:text-xl
                        2xl:text-[22px]
                        mb-4
                        block
                        hover:text-primary
                        "
                        >
                     FamilyConnect — 199,99 zł/mies.
                     </a>
                  </h3>
                  <p className="text-base text-body-color leading-relaxed mb-7">
                     For families who want to stay connected. 300 GB shared (auto-split) for up to 5 lines, 40 GB EU roaming, 1 child line with parental controls, data-usage app, single bill. Family Shared plan.
                  </p>
                  <a
                     href="javascript:void(0)"
                     className="
					 bg-transparent
                     inline-block
                     py-2
                     px-7
                     border border-[#E5E7EB]
                     rounded-full
                     text-base text-gray-700
                     font-medium
                     hover:border-primary hover:bg-primary hover:text-white
                     transition
                     "
                     >
                  View Details
                  </a>
               </div>
            </div>
         </div>
         <div className="w-full md:w-1/2 xl:w-1/3 px-4">
            <div className="bg-white rounded-lg overflow-hidden mb-10">
               <img
                  src="https://tigerfrommars.sirv.com/123/3.webp"
                  alt="image"
                  className="w-full"
                  />
               <div className="p-8 sm:p-9 md:p-7 xl:p-9 text-center">
                  <h3>
                     <a
                        href="javascript:void(0)"
                        className="
                        font-semibold
                        text-dark text-xl
                        sm:text-[22px]
                        md:text-xl
                        lg:text-[22px]
                        xl:text-xl
                        2xl:text-[22px]
                        mb-4
                        block
                        hover:text-primary
                        "
                        >
                    FlexGo! — 59,99 zł/mies.
                     </a>
                  </h3>
                  <p className="text-base text-body-color leading-relaxed mb-7">
                     Full flexibility—toggle services anytime. 50 GB (expandable in app), 1 line, no contract, 15 GB EU roaming, unlimited calls, suspend number up to 3 months. No-contract subscription.
                  </p>
                  <a
                     href="javascript:void(0)"
                     className="
					 bg-transparent
                     inline-block
                     py-2
                     px-7
                     border border-[#E5E7EB]
                     rounded-full
                     text-base text-gray-700
                     font-medium
                     hover:border-primary hover:bg-primary hover:text-white
                     transition
                     "
                     >
                  View Details
                  </a>
               </div>
            </div>
         </div>
      </div>
   </div>
</section>
      </main>

      {/* Floating chat over the whole page */}
      <ChatFloatingWidget userEmail={userEmail} rememberStateKey="bestoffers_chat_open" />
    </div>
  )
}
