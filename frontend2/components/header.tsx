"use client"

import { MessageSquare, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

type HeaderProps = {
  userEmail?: string
  onLogout?: () => void
}

export default function Header({
  userEmail = "user@example.com",
  onLogout,
}: HeaderProps) {
  const handleLogout = () => {
    // put your real sign-out logic here (next-auth signOut(), custom, etc.)
    onLogout?.()
  }

  return (
    <header className="border-b border-primary/20 bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary">BestOffers</h1>
            <p className="text-xs text-muted-foreground">AI Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium">{userEmail}</p>
            <p className="text-xs text-muted-foreground">Logged in</p>
          </div>
          <Button variant="outline" size="icon" onClick={handleLogout} aria-label="Log out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
