import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { Spotlight } from "@/components/ui/spotlight-new";

export const Route = createFileRoute("/_landing")({
  component: LandingShell,
  head: () => ({
    meta: [
      {
        title: "Better T-App - Modern Productivity Platform",
      },
      {
        name: "description",
        content:
          "Experience the next generation of productivity tools with our modern, intuitive platform designed for the future.",
      },
      {
        name: "keywords",
        content:
          "productivity, modern, platform, collaboration, enterprise, secure, fast",
      },
      {
        property: "og:title",
        content: "Better T-App - Modern Productivity Platform",
      },
      {
        property: "og:description",
        content:
          "Experience the next generation of productivity tools with our modern, intuitive platform designed for the future.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Better T-App - Modern Productivity Platform",
      },
      {
        name: "twitter:description",
        content:
          "Experience the next generation of productivity tools with our modern, intuitive platform designed for the future.",
      },
    ],
  }),
  // Preserve the subdomain redirect behavior from the previous index route
  beforeLoad: () => {
    const host = window.location.host;
    const hostParts = host.split(".");

    // If on a subdomain (not localhost, not app), redirect to board
    if (
      hostParts.length > 1 &&
      hostParts[0] !== "localhost" &&
      hostParts[0] !== "app"
    ) {
      throw redirect({
        to: "/board",
      });
    }
  },
});

const navItems = [
  { name: "Home", link: "/", icon: undefined },
  { name: "About", link: "/about", icon: undefined },
  { name: "Contact", link: "/contact", icon: undefined },
];

function Footer() {
  return (
    <footer className="relative z-10 mt-24 border-t border-white/10 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 md:flex-row">
        <div className="relative">
          <div className="text-xl font-semibold tracking-tight">
            <span className="relative inline-block">
              <span className="relative z-10">chatbase</span>
              <span className="absolute inset-x-0 -bottom-1 h-2 w-full bg-gradient-to-r from-white/60 via-white/20 to-transparent blur-[2px]" />
            </span>
            <span className="mx-2 text-neutral-500">x</span>
            <span className="relative inline-block">
              <span className="relative z-10">bento</span>
              <span className="absolute inset-x-0 -bottom-1 h-2 w-full bg-gradient-to-r from-white/60 via-white/20 to-transparent blur-[2px]" />
            </span>
            <span className="mx-2 text-neutral-500">=</span>
            <span className="relative inline-block">
              <span className="relative z-10">My App</span>
              <span className="absolute inset-x-0 -bottom-1 h-2 w-full bg-gradient-to-r from-white/60 via-white/20 to-transparent blur-[2px]" />
            </span>
          </div>
          <p className="mt-2 text-sm text-neutral-400">
            Modern feedback OS for product teams.
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-300">
          <a href="/docs" className="transition-colors hover:text-white">
            Docs
          </a>
          <a href="/pricing" className="transition-colors hover:text-white">
            Pricing
          </a>
          <a href="/blog" className="transition-colors hover:text-white">
            Blog
          </a>
          <a href="/careers" className="transition-colors hover:text-white">
            Careers
          </a>
        </nav>
      </div>
      <div className="mx-auto mt-6 max-w-7xl px-4">
        <p className="text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} My App. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function LandingShell() {
  return (
    <div className="relative min-h-screen bg-noise bg-zinc-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_-10%,rgba(255,255,255,0.08),rgba(255,255,255,0)_60%)]" />
      <div className="relative z-10 py-6">
        <FloatingNav navItems={navItems} />
      </div>

      <div className="relative z-10 w-full">
        <Spotlight />
        <Outlet />
        <Footer />
      </div>
    </div>
  );
}

export default LandingShell;
