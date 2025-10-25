// components/chat-interface.tsx
"use client"

import { useState, useEffect, useCallback, useRef, FormEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageSquare, X, Bot, User, Send, Loader2 } from "lucide-react"

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
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading, open])

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    if (open) window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, close])

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
      // mismo fallback que usabas en la versión de página
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
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-2xl sm:bottom-6 sm:right-6"
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
              className="pointer-events-auto fixed bottom-20 right-4 z-50 w-[min(420px,calc(100vw-1.5rem))] sm:right-6"
              role="dialog"
              aria-label="BestOffers chat"
            >
              <Card className="relative flex max-h-[80vh] min-h-[520px] flex-col overflow-hidden rounded-2xl border-primary/30 shadow-2xl">
                {/* Close button */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={close}
                  className="absolute right-2 top-2 h-8 w-8 rounded-full"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* ==== Chat Area (your snippet) ==== */}
                <div className="container mx-auto flex flex-1 flex-col px-4 py-6">
                  <Card className="flex flex-1 flex-col border-primary/20 shadow-xl">
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {messages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex gap-3 ${
                              message.role === "user" ? "justify-end" : "justify-start"
                            }`}
                          >
                            {message.role === "assistant" && (
                              <Avatar className="h-8 w-8 border-2 border-primary/20">
                                <AvatarFallback className="bg-primary/10">
                                  <Bot className="h-4 w-4 text-primary" />
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                message.role === "user"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-foreground"
                              }`}
                            >
                              <p className="text-sm leading-relaxed">{message.content}</p>
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

                        {/* Auto-scroll anchor */}
                        <div ref={bottomRef} />
                      </div>
                    </ScrollArea>

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
