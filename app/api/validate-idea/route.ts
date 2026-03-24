import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { z } from "zod"

const OutputSchema = z.object({
  coreInsight: z.string().min(1),
  wedgeMarket: z.string().min(1),
  whyNow: z.string().min(1),
  keyRisks: z.array(z.string().min(1)).min(1),
  nextSteps: z.array(z.string().min(1)).min(1),
  clarityScore: z.number().int().min(1).max(10),
  clarityExplanation: z.string().min(1),
})

const systemPromptFallback = `
You are a startup validation analyst for a venture capital firm.
You must return ONLY valid JSON with this exact schema:
{
  "coreInsight": string,
  "wedgeMarket": string,
  "whyNow": string,
  "keyRisks": string[],
  "nextSteps": string[],
  "clarityScore": number (1-10 integer),
  "clarityExplanation": string
}

Use concise, practical, investor-grade language.
No markdown. No extra keys.
`.trim()

function looksGeneric(value: string) {
  const normalized = value.toLowerCase()
  const genericMarkers = [
    "leverage ai",
    "improve efficiency",
    "streamline",
    "innovative solution",
    "various industries",
    "broad market",
    "many users",
    "potential customers",
  ]
  return genericMarkers.some((marker) => normalized.includes(marker))
}

function needsQualityRetry(data: z.infer<typeof OutputSchema>) {
  if (data.coreInsight.trim().length < 50 || data.wedgeMarket.trim().length < 40) {
    return true
  }
  if (data.keyRisks.length < 3 || data.nextSteps.length < 3) {
    return true
  }
  if (looksGeneric(data.coreInsight) || looksGeneric(data.wedgeMarket) || looksGeneric(data.whyNow)) {
    return true
  }
  return false
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Missing server API key." }, { status: 500 })
    }

    const { idea } = (await request.json()) as { idea?: string }
    if (!idea || !idea.trim()) {
      return NextResponse.json({ error: "Idea is required." }, { status: 400 })
    }

    const systemPrompt = process.env.VC_VALIDATION_SYSTEM_PROMPT || systemPromptFallback
    const client = new Anthropic({ apiKey })

    const runModel = async (extraInstruction?: string) => {
      const response = await client.messages.create({
        model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest",
        max_tokens: 1400,
        temperature: 0.2,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Analyze this startup idea and return ONLY JSON matching the required schema.\n${extraInstruction ? `\nAdditional instruction:\n${extraInstruction}\n` : ""}\nIdea:\n${idea.trim()}`,
          },
        ],
      })

      const textBlock = response.content.find((block) => block.type === "text")
      const raw = textBlock?.type === "text" ? textBlock.text : ""
      if (!raw) return null

      let parsedJson: unknown
      try {
        parsedJson = JSON.parse(raw)
      } catch {
        return null
      }

      const parsed = OutputSchema.safeParse(parsedJson)
      if (!parsed.success) return null
      return parsed.data
    }

    const firstPass = await runModel()
    if (!firstPass) {
      return NextResponse.json({ error: "Model output failed validation." }, { status: 502 })
    }

    if (!needsQualityRetry(firstPass)) {
      return NextResponse.json(firstPass, { status: 200 })
    }

    const secondPass = await runModel(
      "Make this less generic and more investor-grade: provide a sharper wedge, at least 3 concrete key risks, and at least 3 specific this-week next steps."
    )
    if (!secondPass) {
      return NextResponse.json(firstPass, { status: 200 })
    }

    return NextResponse.json(secondPass, { status: 200 })
  } catch {
    return NextResponse.json({ error: "Validation request failed." }, { status: 500 })
  }
}
