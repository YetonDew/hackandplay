// components/chat-interface.tsx
"use client"

import { useState, useEffect, useCallback, useRef, FormEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageSquare, Bot, User, Send, Loader2 } from "lucide-react"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

type ChatFloatingWidgetProps = {
  userEmail?: string
  rememberStateKey?: string
  // If you later wire a backend, swap the mock reply in `sendAndReply`
  // or expose an onSend prop here.
}

export default function ChatFloatingWidget({
  userEmail = "user@example.com",
  rememberStateKey = "bestoffers_chat_open",
}: ChatFloatingWidgetProps) {
  // Backend API URL !!!!!
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi! How can I help you today?", timestamp: new Date() },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Plain div viewport for rock-solid scrolling
  const viewportRef = useRef<HTMLDivElement | null>(null)

  // Track whether user is near the bottom
  const [isAtBottom, setIsAtBottom] = useState(true)

  // Helper: scroll to bottom of the viewport
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    const vp = viewportRef.current
    if (!vp) return
    vp.scrollTo({ top: vp.scrollHeight, behavior })
  }, [])

  // Persist open/closed state
  useEffect(() => {
    try {
      const saved = localStorage.getItem(rememberStateKey)
      if (saved) setOpen(saved === "1")
    } catch {}
  }, [rememberStateKey])

  useEffect(() => {
    try {
      localStorage.setItem(rememberStateKey, open ? "1" : "0")
    } catch {}
  }, [open, rememberStateKey])

  const toggle = useCallback(() => setOpen((v) => !v), [])
  const close = useCallback(() => setOpen(false), [])

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    if (open) window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, close])

  // When the panel opens, jump to bottom once (no continuous auto-scroll)
  useEffect(() => {
    if (!open) return
    // wait for layout to settle
    requestAnimationFrame(() => scrollToBottom("auto"))
  }, [open, scrollToBottom])

  // Subscribe to manual scrolling to know if we should keep view pinned
  useEffect(() => {
    const vp = viewportRef.current
    if (!vp) return

    const onScroll = () => {
      const distance = vp.scrollHeight - vp.scrollTop - vp.clientHeight
      setIsAtBottom(distance < 32)
    }

    onScroll()
    vp.addEventListener("scroll", onScroll, { passive: true })
    return () => vp.removeEventListener("scroll", onScroll)
  }, [open])

  // On new messages: only auto-stick if user is already at bottom
  useEffect(() => {
    if (isAtBottom) scrollToBottom("smooth")
  }, [messages, isLoading, isAtBottom, scrollToBottom])

  // --- Sending logic (mock) ---
  const sendAndReply = async (text: string) => {
    const userMessage: ChatMessage = {
      role: "user",
      content: text,
      timestamp: new Date(),
    }

    setMessages((m) => [...m, userMessage])
    setIsLoading(true)

    try {
      const token = localStorage.getItem("access_token")
      const conversationHistory = [...messages, userMessage]

      const response = await fetch(`${API_URL}/chat/send_conversation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          conversation: conversationHistory.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to get response (${response.status})`)
      }

      const data = await response.json()

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content:
          data.response ||
          "I apologize, but I couldn't generate a response. Please try again.",
        timestamp: new Date(),
      }

      setMessages((m) => [...m, assistantMessage])
    } catch (error) {
      console.error("[widget] Chat error:", error)
      const errorMessage: ChatMessage = {
        role: "assistant",
        content:
          "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      }
      setMessages((m) => [...m, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    setInput("")
    await sendAndReply(trimmed)
  }

  return (
    <>
      {/* Floating FAB */}
      <Button
        aria-label={open ? "Close chat" : "Open chat"}
        aria-expanded={open}
        onClick={toggle}
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-2xl sm:bottom-6 sm:right-6 cursor-pointer"
      >
        <MessageSquare className="h-5 w-5" />
      </Button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 pointer-events-none"
          >
            <div
              onClick={close}
              className="absolute inset-0 pointer-events-auto bg-background/20 backdrop-blur-[1px]"
            />

            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 240 }}
              className="pointer-events-auto fixed bottom-20 right-4 z-50 w-[min(520px,calc(100vw-2rem))] sm:right-6"
              role="dialog"
              aria-label="BestOffers chat"
            >
              {/* Use a fixed height to prevent overflowing screens; inner children can scroll */}
              <Card className="relative flex h-[75vh] w-full flex-col overflow-hidden rounded-2xl border-primary/30 shadow-2xl">
                {/* ==== Chat Area ==== */}
                <div className="container mx-auto flex flex-1 min-h-0 flex-col px-4 py-6 -mb-5">
                  <Card className="flex flex-1 min-h-0 flex-col">
                    {/* Scrollable viewport (manual scrolling) */}
                    <div
                      ref={viewportRef}
                      className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4"
                      tabIndex={0}
                      aria-label="Messages"
                    >
                      <div className="space-y-4">
                        {messages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex gap-3 ${
                              message.role === "user" ? "justify-end" : "justify-start"
                            }`}
                          >
                            {message.role === "assistant" && (
                              <Avatar className="h-8 w-8 border-2">
                                <AvatarFallback className="bg-primary/10">
                                  <Bot className="h-4 w-4 text-primary" />
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={`max-w-[88%] rounded-2xl px-4 py-3 ${
                                message.role === "user"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-foreground"
                              }`}
                            >
                              <p className="text-sm leading-relaxed break-words">
                                {message.content}
                              </p>
                              <p
                                className={`mt-1 text-xs ${
                                  message.role === "user"
                                    ? "text-primary-foreground/70"
                                    : "text-muted-foreground"
                                }`}
                                aria-label="message timestamp"
                              >
                                {message.timestamp.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                            {message.role === "user" && (
                              <Avatar className="h-8 w-8 border-2 border-primary/20">
                                <AvatarFallback className="bg-primary/10">
                                  <User className="h-4 w-4 text-primary" />
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        ))}

                        {isLoading && (
                          <div className="flex gap-3 justify-start">
                            <Avatar className="h-8 w-8 border-2 border-primary/20">
                              <AvatarFallback className="bg-primary/10">
                                <Bot className="h-4 w-4 text-primary" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="max-w-[80%] rounded-2xl bg-muted px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                <p className="text-sm text-muted-foreground">Thinking...</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-primary/20 p-4">
                      <form onSubmit={handleSendMessage} className="flex gap-2">
                        <Input
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Type your message..."
                          disabled={isLoading}
                          className="flex-1"
                          aria-label="Message input"
                        />
                        <Button
                          type="submit"
                          disabled={isLoading || !input.trim()}
                          size="icon"
                          aria-label="Send message"
                          className="cursor-pointer"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </Card>
                </div>
                {/* ================================== */}
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export { ChatFloatingWidget as ChatInterface } // alias named para compatibilidad
