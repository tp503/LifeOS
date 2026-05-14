import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/inbox", label: "Inbox" },
  { href: "/notes", label: "Notes" },
  { href: "/calendar", label: "Calendar" },
  { href: "/finance", label: "Finance" },
  { href: "/search", label: "Search" },
  { href: "/settings", label: "Settings" },
] as const;

export function SiteNav() {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Primary">
      {links.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-lg border border-surface-border bg-surface-muted px-3 py-1.5 text-sm font-medium text-zinc-200 transition hover:border-accent hover:text-white"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
