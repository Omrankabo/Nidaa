import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HandHeart, ShieldCheck } from "lucide-react";
import Logo from "@/components/logo";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Logo />
      </header>
      <main className="flex-grow">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Awni Sudan: A Lifeline in Times of Need
                  </h1>
                  <p className="max-w-[600px] text-foreground/80 md:text-xl">
                    A simple, accessible emergency response system connecting Sudanese communities with verified medical help via SMS and voice, no internet required.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/register">Register as Volunteer</Link>
                  </Button>
                  <Button asChild variant="secondary" size="lg">
                    <Link href="/admin/dashboard">Admin Dashboard</Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                 <img
                  src="https://placehold.co/600x400.png"
                  alt="Helping hands"
                  width="600"
                  height="400"
                  data-ai-hint="community help"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-background/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Our Mission</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Bridging the Gap to Emergency Care</h2>
                <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  In a nation with unique challenges, Awni Sudan provides a crucial link between those in crisis and those who can help. Our system is built for resilience, accessibility, and trust.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-2 mt-12">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <HandHeart className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-headline">Voice and SMS Based</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Anyone can request help using a simple voice call or SMS message. We overcome literacy and internet barriers to ensure no call for help goes unanswered.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-headline">Verified Responders</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Our network of volunteers and medical entities is manually verified to ensure every response is from a trusted and capable source, building a safe community of care.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-foreground/60">&copy; 2024 Awni Sudan. All rights reserved.</p>
      </footer>
    </div>
  );
}
