import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  Ticket,
  Banknote,
} from "lucide-react";

const links = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/users", label: "Users", icon: Users },
  { href: "/orders", label: "Orders", icon: Ticket },
  { href: "/payouts", label: "Payouts", icon: Banknote },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  return (
    <aside className="flex w-64 flex-col border-r bg-card px-4 py-6">
      <Link href="/" className="mb-8 px-2 text-xl font-bold text-primary">
        EventTix
      </Link>
      <nav className="flex flex-col gap-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto pt-4">
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          Sign out
        </Link>
      </div>
    </aside>
  );
}
