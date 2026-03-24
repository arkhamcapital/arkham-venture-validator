import Link from "next/link"
import { ArrowRight, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-8">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            Northside Ventures
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/validate">Login</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto flex max-w-6xl items-center px-4 py-24 md:px-8">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-primary">Point of Clarity</p>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Early-stage idea validation,
            <br />
            in Northside&apos;s style.
          </h1>
          <p className="mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
            Turn a half-baked startup concept into a sharp investor-grade view: core insight, wedge market, why now,
            key risks, next steps, and clarity score.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="gap-2 rounded-full px-8">
              <Link href="/validate">
                Login to Continue
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
