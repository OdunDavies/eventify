import Link from "next/link";
import { Button } from "@eventtix/ui";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-primary">
            EventTix
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/events" className="text-sm font-medium">
              Browse Events
            </Link>
            <Button asChild>
              <Link href="/events/new">Create Event</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl font-bold tracking-tight">
            Discover & Sell
            <br />
            <span className="text-primary">Event Tickets</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            The easiest way to create, promote, and sell tickets for your events
            in Africa. No upfront costs. Pay as you grow.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/events">Browse Events</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/events/new">Create an Event</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          &copy; {new Date().getFullYear()} EventTix. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
