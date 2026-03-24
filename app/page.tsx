"use client"

import { useEffect, useState } from "react"
import { Send, Lightbulb, Target, TrendingUp, AlertTriangle, ListChecks, Gauge } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface FormData {
  coreInsight: string
  wedgeMarket: string
  whyNow: string
  keyRisks: string[]
  nextSteps: string[]
  clarityScore: number
  clarityExplanation: string
}

interface ChatBubbleProps {
  icon: React.ReactNode
  label: string
  sublabel: string
  children: React.ReactNode
  isLast?: boolean
}

function ChatBubble({ icon, label, sublabel, children, isLast }: ChatBubbleProps) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          {icon}
        </div>
        {!isLast && <div className="mt-2 h-full w-0.5 bg-primary/20" />}
      </div>
      <div className={cn("flex-1 pb-8", isLast && "pb-0")}>
        <div className="mb-1">
          <h3 className="font-semibold text-foreground">{label}</h3>
          <p className="text-sm text-muted-foreground">{sublabel}</p>
        </div>
        <div className="mt-3 rounded-2xl rounded-tl-sm border border-border bg-card p-4 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function IdeaValidationForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [ideaPrompt, setIdeaPrompt] = useState("")
  const [isGeneratingValidation, setIsGeneratingValidation] = useState(false)
  const [ideaPromptError, setIdeaPromptError] = useState("")
  const [hasSubmittedIdeaPrompt, setHasSubmittedIdeaPrompt] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    coreInsight: "",
    wedgeMarket: "",
    whyNow: "",
    keyRisks: [],
    nextSteps: [],
    clarityScore: 5,
    clarityExplanation: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    const existingSession = window.localStorage.getItem("venturevalidator_authenticated")
    setIsAuthenticated(existingSession === "true")
    setAuthChecked(true)
  }, [])

  const handleLoginSubmit = async () => {
    if (!username.trim() || !password.trim()) return
    setIsLoggingIn(true)
    setLoginError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        setLoginError("Invalid username or password")
        setIsLoggingIn(false)
        return
      }

      window.localStorage.setItem("venturevalidator_authenticated", "true")
      setIsAuthenticated(true)
      setUsername("")
      setPassword("")
    } catch {
      setLoginError("Login failed. Please try again.")
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleIdeaPromptSubmit = async () => {
    if (!ideaPrompt.trim()) return
    setIdeaPromptError("")
    setIsGeneratingValidation(true)

    try {
      const response = await fetch("/api/validate-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: ideaPrompt }),
      })

      if (!response.ok) {
        setIdeaPromptError("Could not generate validation yet. Please try again.")
        setIsGeneratingValidation(false)
        return
      }

      const data = (await response.json()) as FormData
      setFormData({
        coreInsight: data.coreInsight,
        wedgeMarket: data.wedgeMarket,
        whyNow: data.whyNow,
        keyRisks: data.keyRisks,
        nextSteps: data.nextSteps,
        clarityScore: data.clarityScore,
        clarityExplanation: data.clarityExplanation,
      })
      setHasSubmittedIdeaPrompt(true)
    } catch {
      setIdeaPromptError("Could not generate validation yet. Please try again.")
    } finally {
      setIsGeneratingValidation(false)
    }
  }

  const updateField = (field: keyof FormData, value: string | number | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const isFormValid =
    formData.coreInsight.trim() &&
    formData.wedgeMarket.trim() &&
    formData.whyNow.trim() &&
    formData.keyRisks.length > 0 &&
    formData.nextSteps.length > 0 &&
    formData.clarityExplanation.trim()

  if (!authChecked) {
    return null
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto max-w-md">
          <div className="mb-8 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Lightbulb className="h-4 w-4" />
              Venture Validator
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Login</h1>
            <p className="mt-2 text-muted-foreground">Sign in to access idea validation.</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Username</label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>
              {loginError ? <p className="text-sm text-destructive">{loginError}</p> : null}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleLoginSubmit}
              disabled={!username.trim() || !password.trim() || isLoggingIn}
              size="lg"
              className="gap-2 rounded-full px-8"
            >
              {isLoggingIn ? "Signing In..." : "Sign In"}
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    )
  }

  if (!hasSubmittedIdeaPrompt) {
    return (
      <main className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Lightbulb className="h-4 w-4" />
              Idea Validation
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Pitch Your Half-Baked Idea</h1>
            <p className="mt-2 text-muted-foreground">
              Drop your concept in the chatbox, then we&apos;ll generate the full validation framework.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <Textarea
              placeholder="Example: AI co-pilot for solo real estate agents to qualify leads and automate follow-ups..."
              className="min-h-[140px] resize-none border-0 bg-transparent p-0 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-0"
              value={ideaPrompt}
              onChange={(e) => setIdeaPrompt(e.target.value)}
            />
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleIdeaPromptSubmit}
              disabled={!ideaPrompt.trim() || isGeneratingValidation}
              size="lg"
              className="gap-2 rounded-full px-8"
            >
              {isGeneratingValidation ? "Generating..." : "Submit Idea"}
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {ideaPromptError ? <p className="mt-3 text-right text-sm text-destructive">{ideaPromptError}</p> : null}
        </div>
      </main>
    )
  }

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Lightbulb className="h-8 w-8 text-primary" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">Validation Submitted</h2>
            <p className="mb-6 text-muted-foreground">
              Your idea validation has been recorded successfully.
            </p>
            <Button onClick={() => setIsSubmitted(false)} variant="outline">
              Submit Another
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Lightbulb className="h-4 w-4" />
            Idea Validation
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Startup Idea Assessment
          </h1>
          <p className="mt-2 text-muted-foreground">
            Complete the framework below to validate your startup concept
          </p>
        </div>

        {/* Chat-style form */}
        <div className="space-y-0">
          <ChatBubble
            icon={<Lightbulb className="h-5 w-5" />}
            label="Core Insight"
            sublabel="1-2 sentences capturing the fundamental value proposition"
          >
            <Textarea
              placeholder="What unique insight or problem have you identified that others have missed?"
              className="min-h-[100px] resize-none border-0 bg-transparent p-0 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-0"
              value={formData.coreInsight}
              onChange={(e) => updateField("coreInsight", e.target.value)}
            />
          </ChatBubble>

          <ChatBubble
            icon={<Target className="h-5 w-5" />}
            label="Wedge Market"
            sublabel="Your specific starting point and initial target audience"
          >
            <Textarea
              placeholder="Who are your first 100 customers and why will they adopt immediately?"
              className="min-h-[100px] resize-none border-0 bg-transparent p-0 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-0"
              value={formData.wedgeMarket}
              onChange={(e) => updateField("wedgeMarket", e.target.value)}
            />
          </ChatBubble>

          <ChatBubble
            icon={<TrendingUp className="h-5 w-5" />}
            label="Why Now"
            sublabel="Tie to AI breakthroughs, market shifts, or emerging trends"
          >
            <Textarea
              placeholder="What has changed recently that makes this the perfect moment for this idea?"
              className="min-h-[100px] resize-none border-0 bg-transparent p-0 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-0"
              value={formData.whyNow}
              onChange={(e) => updateField("whyNow", e.target.value)}
            />
          </ChatBubble>

          <ChatBubble
            icon={<AlertTriangle className="h-5 w-5" />}
            label="Key Risks"
            sublabel="Be brutally honest about what could go wrong"
          >
            <Textarea
              placeholder="What are the biggest threats to this idea? What keeps you up at night?"
              className="min-h-[100px] resize-none border-0 bg-transparent p-0 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-0"
                value={formData.keyRisks.join("\n")}
                onChange={(e) =>
                  updateField(
                    "keyRisks",
                    e.target.value
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean)
                  )
                }
            />
          </ChatBubble>

          <ChatBubble
            icon={<ListChecks className="h-5 w-5" />}
            label="Next 3 Steps"
            sublabel="Practical and immediate actions to validate the idea"
          >
            <Textarea
              placeholder="1. &#10;2. &#10;3. "
              className="min-h-[100px] resize-none border-0 bg-transparent p-0 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-0"
                value={formData.nextSteps.join("\n")}
                onChange={(e) =>
                  updateField(
                    "nextSteps",
                    e.target.value
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean)
                  )
                }
            />
          </ChatBubble>

          <ChatBubble
            icon={<Gauge className="h-5 w-5" />}
            label="Clarity Score"
            sublabel="Rate how clear and validated this idea feels (1-10)"
            isLast
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Low clarity</span>
                <span className="text-3xl font-bold text-primary">{formData.clarityScore}</span>
                <span className="text-sm text-muted-foreground">High clarity</span>
              </div>
              <Slider
                value={[formData.clarityScore]}
                onValueChange={(value) => updateField("clarityScore", value[0])}
                min={1}
                max={10}
                step={1}
                className="py-2"
              />
              <Textarea
                placeholder="Briefly explain your clarity score rating..."
                className="mt-3 min-h-[80px] resize-none border-0 bg-transparent p-0 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-0"
                value={formData.clarityExplanation}
                onChange={(e) => updateField("clarityExplanation", e.target.value)}
              />
            </div>
          </ChatBubble>
        </div>

        {/* Submit button */}
        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            size="lg"
            className="gap-2 rounded-full px-8"
          >
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                Submit Validation
                <Send className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </main>
  )
}
