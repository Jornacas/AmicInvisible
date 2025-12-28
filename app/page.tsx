"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Gift, Users, DollarSign, AlertCircle, Trash2, Sparkles, Share2, CheckCheck, Link2, ExternalLink } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Participant {
  id: string
  name: string
}

interface Restriction {
  id: string
  person1: string
  person2: string
}

interface Assignment {
  giver: string
  receiver: string
}

export default function SecretSantaPage() {
  const [budget, setBudget] = useState<number>(50)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [newParticipantName, setNewParticipantName] = useState("")
  const [restrictions, setRestrictions] = useState<Restriction[]>([])
  const [restrictionPerson1, setRestrictionPerson1] = useState("")
  const [restrictionPerson2, setRestrictionPerson2] = useState("")
  const [groupNotes, setGroupNotes] = useState("")
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [error, setError] = useState("")
  const [isGenerated, setIsGenerated] = useState(false)
  const [copiedMessages, setCopiedMessages] = useState<Set<number>>(new Set())

  const addParticipant = () => {
    if (newParticipantName.trim()) {
      const newParticipant: Participant = {
        id: Math.random().toString(36).substr(2, 9),
        name: newParticipantName.trim(),
      }
      setParticipants([...participants, newParticipant])
      setNewParticipantName("")
      setError("")
    }
  }

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter((p) => p.id !== id))
  }

  const addRestriction = () => {
    if (restrictionPerson1 && restrictionPerson2 && restrictionPerson1 !== restrictionPerson2) {
      const newRestriction: Restriction = {
        id: Math.random().toString(36).substr(2, 9),
        person1: restrictionPerson1,
        person2: restrictionPerson2,
      }
      setRestrictions([...restrictions, newRestriction])
      setRestrictionPerson1("")
      setRestrictionPerson2("")
    }
  }

  const removeRestriction = (id: string) => {
    setRestrictions(restrictions.filter((r) => r.id !== id))
  }

  const generateSecretSanta = () => {
    if (participants.length < 3) {
      setError("Necesitas al menos 3 participantes para generar Amic Invisible")
      return
    }

    const receivers = [...participants]
    const newAssignments: Assignment[] = []
    const givers = [...participants]

    for (let i = givers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[givers[i], givers[j]] = [givers[j], givers[i]]
    }

    let attempts = 0
    const maxAttempts = 100

    while (attempts < maxAttempts) {
      newAssignments.length = 0
      const availableReceivers = [...receivers]
      let success = true

      for (const giver of givers) {
        const validReceivers = availableReceivers.filter((receiver) => {
          if (receiver.id === giver.id) return false

          const hasRestriction = restrictions.some(
            (r) =>
              (r.person1 === giver.name && r.person2 === receiver.name) ||
              (r.person2 === giver.name && r.person1 === receiver.name),
          )

          return !hasRestriction
        })

        if (validReceivers.length === 0) {
          success = false
          break
        }

        const randomIndex = Math.floor(Math.random() * validReceivers.length)
        const receiver = validReceivers[randomIndex]

        newAssignments.push({
          giver: giver.name,
          receiver: receiver.name,
        })

        const receiverIndex = availableReceivers.findIndex((r) => r.id === receiver.id)
        availableReceivers.splice(receiverIndex, 1)
      }

      if (success) {
        setAssignments(newAssignments)
        setIsGenerated(true)
        setError("")
        setCopiedMessages(new Set())
        return
      }

      attempts++
    }

    setError("No se pudo generar una asignación válida. Intenta reducir las restricciones.")
  }

  const resetGeneration = () => {
    setIsGenerated(false)
    setAssignments([])
    setCopiedMessages(new Set())
  }

  const createSecretToken = (giverName: string, receiverName: string) => {
    const data = {
      giver: giverName,
      receiver: receiverName,
      budget: budget,
      notes: groupNotes || undefined
    }
    return encodeURIComponent(btoa(JSON.stringify(data)))
  }

  const createSecretLink = (giverName: string, receiverName: string) => {
    const token = createSecretToken(giverName, receiverName)
    if (typeof window !== "undefined") {
      return `${window.location.origin}/reveal/${token}`
    }
    return `/reveal/${token}`
  }

  const createSurpriseMessage = (giverName: string, receiverName: string) => {
    const link = createSecretLink(giverName, receiverName)

    let message = `🎁 *Amic Invisible* 🎁\n\n`
    message += `Hola ${giverName}! 🎅\n\n`
    message += `Tens un missatge secret esperant-te...\n\n`
    message += `👉 Obre aquest link per descobrir a qui has de fer el regal:\n\n`
    message += `${link}\n\n`
    message += `🤫 Recorda: és un SECRET! No ho comparteixis amb ningú.\n`
    message += `\n🎄 Bones festes! ✨`

    return message
  }

  const shareMessage = async (index: number, giverName: string, message: string) => {
    // Try native share first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Amic Invisible - ${giverName}`,
          text: message,
        })
        setCopiedMessages(new Set(copiedMessages).add(index))
        setTimeout(() => {
          setCopiedMessages((prev) => {
            const newSet = new Set(prev)
            newSet.delete(index)
            return newSet
          })
        }, 2000)
        return
      } catch (err) {
        // User cancelled or share failed, fall back to clipboard
        if ((err as Error).name === 'AbortError') return
      }
    }

    // Fallback to clipboard
    navigator.clipboard.writeText(message)
    setCopiedMessages(new Set(copiedMessages).add(index))
    setTimeout(() => {
      setCopiedMessages((prev) => {
        const newSet = new Set(prev)
        newSet.delete(index)
        return newSet
      })
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gift className="h-12 w-12 text-primary" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Amic Invisible
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Organiza tu intercambio de regalos de forma divertida y sencilla. Genera mensajes sorpresa para enviar
            manualmente.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isGenerated ? (
          <div className="space-y-6">
            {/* Budget Section */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Presupuesto por Persona
                </CardTitle>
                <CardDescription>Define el límite máximo de gasto para cada regalo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Label htmlFor="budget" className="text-base font-medium">
                    €
                  </Label>
                  <Input
                    id="budget"
                    type="number"
                    min="1"
                    max="1000"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="max-w-xs text-lg font-semibold"
                  />
                  <span className="text-sm text-muted-foreground">Máximo: 1000€</span>
                </div>
              </CardContent>
            </Card>

            {/* Participants Section */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-secondary" />
                  Participantes ({participants.length})
                </CardTitle>
                <CardDescription>Agrega los nombres de todos los participantes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      placeholder="María García"
                      value={newParticipantName}
                      onChange={(e) => setNewParticipantName(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addParticipant()}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addParticipant} className="whitespace-nowrap">
                      Agregar
                    </Button>
                  </div>
                </div>

                {participants.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {participants.map((participant) => (
                      <div key={participant.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <p className="font-medium">{participant.name}</p>
                        <Button variant="ghost" size="sm" onClick={() => removeParticipant(participant.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Restrictions Section */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-accent" />
                  Restricciones de Regalos
                </CardTitle>
                <CardDescription>Define quién NO puede regalar a quién (ej: parejas, hermanos)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="person1">Persona 1</Label>
                    <select
                      id="person1"
                      value={restrictionPerson1}
                      onChange={(e) => setRestrictionPerson1(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    >
                      <option value="">Seleccionar...</option>
                      {participants.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="person2">Persona 2</Label>
                    <select
                      id="person2"
                      value={restrictionPerson2}
                      onChange={(e) => setRestrictionPerson2(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    >
                      <option value="">Seleccionar...</option>
                      {participants.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <Button
                  onClick={addRestriction}
                  variant="secondary"
                  className="w-full"
                  disabled={!restrictionPerson1 || !restrictionPerson2}
                >
                  Agregar Restricción
                </Button>

                {restrictions.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {restrictions.map((restriction) => (
                      <div key={restriction.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <p className="text-sm">
                          <span className="font-medium">{restriction.person1}</span>
                          {" ↔ "}
                          <span className="font-medium">{restriction.person2}</span>
                        </p>
                        <Button variant="ghost" size="sm" onClick={() => removeRestriction(restriction.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Group Notes Section */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Notas del Grupo</CardTitle>
                <CardDescription>Agrega notas o reglas generales que se incluirán en los mensajes</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Ej: El intercambio será el 25 de diciembre a las 7pm en casa de María..."
                  value={groupNotes}
                  onChange={(e) => setGroupNotes(e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button
              onClick={generateSecretSanta}
              size="lg"
              className="w-full text-lg h-14"
              disabled={participants.length < 3}
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Generar Amic Invisible
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Results Section */}
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Amic Invisible Generat!</CardTitle>
                <CardDescription className="text-center">
                  Envia cada link secret al seu destinatari. El nom romandrà ocult fins que obrin la caixa!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg text-center">
                  <p className="font-medium">Pressupost: {budget}€</p>
                  <p className="text-sm text-muted-foreground mt-1">Total de participants: {participants.length}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <Link2 className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">Links Secrets</h3>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Copia i envia cada missatge per WhatsApp, Telegram o el teu mètode preferit.
                    Quan obrin el link, veuran una caixa animada amb confeti!
                  </p>

                  {assignments.map((assignment, index) => {
                    const message = createSurpriseMessage(assignment.giver, assignment.receiver)
                    const secretLink = createSecretLink(assignment.giver, assignment.receiver)
                    const isCopied = copiedMessages.has(index)

                    return (
                      <Card
                        key={index}
                        className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5"
                      >
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center justify-center gap-2">
                            <Gift className="h-5 w-5" />
                            Missatge per: <span className="text-primary">{assignment.giver}</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="bg-background/80 p-4 rounded-lg border">
                            <pre className="text-sm whitespace-pre-wrap font-sans">{message}</pre>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => shareMessage(index, assignment.giver, message)}
                              variant={isCopied ? "default" : "outline"}
                              size="lg"
                              className="flex-1"
                            >
                              {isCopied ? (
                                <>
                                  <CheckCheck className="h-5 w-5 mr-2" />
                                  Enviat!
                                </>
                              ) : (
                                <>
                                  <Share2 className="h-5 w-5 mr-2" />
                                  Compartir
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={() => window.open(secretLink, "_blank")}
                              variant="secondary"
                              size="lg"
                              title="Previsualitzar"
                            >
                              <ExternalLink className="h-5 w-5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                <div className="pt-4 border-t">
                  <Button onClick={resetGeneration} variant="outline" size="lg" className="w-full bg-transparent">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generar Nou Sorteig
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
