"use client"

import { useParams } from "next/navigation"
import { useMemo } from "react"
import { GiftBox } from "@/components/gift-box"
import { Gift } from "lucide-react"

interface SecretData {
  giver: string
  receiver: string
  budget: number
  notes?: string
}

function decodeSecret(token: string): SecretData | null {
  try {
    const decoded = atob(decodeURIComponent(token))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export default function RevealPage() {
  const params = useParams()
  const token = params.token as string

  const secretData = useMemo(() => {
    if (!token) return null
    return decodeSecret(token)
  }, [token])

  if (!secretData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
        <div className="text-center">
          <Gift className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Link no valid</h1>
          <p className="text-muted-foreground">
            Aquest link no es valid o ha caducat.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-secondary/5 p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center pt-8 pb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Gift className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Amic Invisible
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Hola <span className="font-semibold text-foreground">{secretData.giver}</span>!
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Tens un missatge secret...
          </p>
        </div>

        {/* Gift Box */}
        <GiftBox
          receiverName={secretData.receiver}
          budget={secretData.budget}
          notes={secretData.notes}
        />
      </div>
    </div>
  )
}
