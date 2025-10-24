import ChatFloatingWidget from "@/components/chat-interface"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ChatFloatingWidget userEmail="user@example.com" />
    </>
  )
}
