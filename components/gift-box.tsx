"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface GiftBoxProps {
  receiverName: string
  budget: number
  notes?: string
}

export function GiftBox({ receiverName, budget, notes }: GiftBoxProps) {
  const [isOpened, setIsOpened] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [confettiPieces, setConfettiPieces] = useState<Array<{
    id: number
    x: number
    delay: number
    duration: number
    color: string
    rotation: number
    size: number
  }>>([])

  const colors = [
    "#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#ff6eb4",
    "#9b59b6", "#f39c12", "#1abc9c", "#e74c3c", "#3498db"
  ]

  const handleOpen = () => {
    if (isOpened) return

    // Generate confetti pieces
    const pieces = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      size: 8 + Math.random() * 8
    }))

    setConfettiPieces(pieces)
    setShowConfetti(true)
    setIsOpened(true)
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[70vh] overflow-hidden">
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {confettiPieces.map((piece) => (
            <div
              key={piece.id}
              className="absolute animate-confetti"
              style={{
                left: `${piece.x}%`,
                top: "-20px",
                width: `${piece.size}px`,
                height: `${piece.size}px`,
                backgroundColor: piece.color,
                animationDelay: `${piece.delay}s`,
                animationDuration: `${piece.duration}s`,
                transform: `rotate(${piece.rotation}deg)`,
                borderRadius: Math.random() > 0.5 ? "50%" : "2px"
              }}
            />
          ))}
        </div>
      )}

      {/* Gift Box */}
      <div
        className={cn(
          "cursor-pointer transition-all duration-500 select-none",
          !isOpened && "hover:scale-105 active:scale-95 animate-bounce-gentle"
        )}
        onClick={handleOpen}
      >
        {!isOpened ? (
          <div className="relative">
            {/* Box Lid */}
            <div className="relative z-10 w-48 h-12 bg-gradient-to-b from-red-500 to-red-600 rounded-t-lg shadow-lg transform-gpu transition-transform duration-500 origin-bottom">
              {/* Ribbon on lid */}
              <div className="absolute inset-x-0 top-0 bottom-0 flex items-center justify-center">
                <div className="w-8 h-full bg-gradient-to-b from-yellow-400 to-yellow-500" />
              </div>
              {/* Bow */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute w-10 h-6 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full -left-8 -rotate-45 shadow-md" />
                  <div className="absolute w-10 h-6 bg-gradient-to-bl from-yellow-400 to-yellow-500 rounded-full -right-8 rotate-45 shadow-md" />
                  <div className="relative w-6 h-6 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full z-10 shadow-lg" />
                </div>
              </div>
            </div>

            {/* Box Body */}
            <div className="relative w-48 h-36 bg-gradient-to-b from-red-600 to-red-700 rounded-b-lg shadow-2xl">
              {/* Vertical ribbon */}
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-b from-yellow-400 to-yellow-500" />
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-b-lg" />
            </div>

            {/* Tap instruction */}
            <p className="text-center mt-6 text-lg font-medium text-muted-foreground animate-pulse">
              Toca la caja para abrirla
            </p>
          </div>
        ) : (
          <div className="animate-reveal">
            {/* Opened Box */}
            <div className="relative">
              {/* Lid flying off */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-52 h-12 bg-gradient-to-b from-red-500 to-red-600 rounded-lg shadow-lg animate-lid-fly opacity-0">
                <div className="absolute inset-x-0 top-0 bottom-0 flex items-center justify-center">
                  <div className="w-8 h-full bg-gradient-to-b from-yellow-400 to-yellow-500" />
                </div>
              </div>

              {/* Open box */}
              <div className="relative w-48 h-36 bg-gradient-to-b from-red-600 to-red-700 rounded-lg shadow-2xl overflow-hidden">
                {/* Inner box shadow */}
                <div className="absolute inset-2 bg-gradient-to-b from-red-900 to-red-800 rounded" />
                {/* Vertical ribbon */}
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-b from-yellow-400 to-yellow-500 opacity-50" />
              </div>
            </div>

            {/* Revealed Content */}
            <div className="mt-8 text-center animate-fade-up">
              <p className="text-lg text-muted-foreground mb-2">Tu amic invisible es...</p>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-pink-500 to-secondary bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
                {receiverName}
              </h2>

              <div className="mt-8 p-6 bg-card/80 backdrop-blur rounded-2xl border shadow-xl max-w-sm mx-auto">
                <div className="flex items-center justify-center gap-2 text-2xl font-semibold text-primary mb-4">
                  <span>Presupuesto: {budget}€</span>
                </div>

                {notes && (
                  <div className="mt-4 pt-4 border-t text-left">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Notas del grupo:</p>
                    <p className="text-sm">{notes}</p>
                  </div>
                )}

                <p className="mt-6 text-sm text-muted-foreground italic">
                  Recuerda: es un secreto!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sparkles decoration */}
      {!isOpened && (
        <>
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-twinkle" />
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-primary rounded-full animate-twinkle" style={{ animationDelay: "0.5s" }} />
          <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-pink-400 rounded-full animate-twinkle" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-secondary rounded-full animate-twinkle" style={{ animationDelay: "1.5s" }} />
        </>
      )}
    </div>
  )
}
