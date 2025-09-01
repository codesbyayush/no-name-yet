import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { HeroHeader } from '@/components/landing/header';

export const Route = createFileRoute('/_landing')({
  component: LandingShell,
  head: () => ({
    meta: [
      {
        title: 'Better T-App - Modern Productivity Platform',
      },
      {
        name: 'description',
        content:
          'Experience the next generation of productivity tools with our modern, intuitive platform designed for the future.',
      },
      {
        name: 'keywords',
        content:
          'productivity, modern, platform, collaboration, enterprise, secure, fast',
      },
      {
        property: 'og:title',
        content: 'Better T-App - Modern Productivity Platform',
      },
      {
        property: 'og:description',
        content:
          'Experience the next generation of productivity tools with our modern, intuitive platform designed for the future.',
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      {
        name: 'twitter:title',
        content: 'Better T-App - Modern Productivity Platform',
      },
      {
        name: 'twitter:description',
        content:
          'Experience the next generation of productivity tools with our modern, intuitive platform designed for the future.',
      },
    ],
  }),
  // Preserve the subdomain redirect behavior from the previous index route
  beforeLoad: () => {
    const host = window.location.host;
    const hostParts = host.split('.');

    // If on a subdomain (not localhost, not app), redirect to board
    if (
      hostParts.length > 1 &&
      hostParts[0] !== import.meta.env.PUBLIC_ROOT_HOST
    ) {
      throw redirect({
        to: '/board',
        search: {
          board: undefined,
        },
      });
    }
  },
});

const _navItems = [
  { name: 'Home', link: '/', icon: undefined },
  { name: 'About', link: '/about', icon: undefined },
  { name: 'Contact', link: '/contact', icon: undefined },
];

function _Footer() {
  return (
    <footer className="relative z-10 mt-24 border-white/10 border-t py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 md:flex-row">
        <div className="relative">
          <div className="font-semibold text-xl tracking-tight">
            <span className="relative inline-block">
              <span className="relative z-10">chatbase</span>
              <span className="-bottom-1 absolute inset-x-0 h-2 w-full bg-gradient-to-r from-white/60 via-white/20 to-transparent blur-[2px]" />
            </span>
            <span className="mx-2 text-neutral-500">x</span>
            <span className="relative inline-block">
              <span className="relative z-10">bento</span>
              <span className="-bottom-1 absolute inset-x-0 h-2 w-full bg-gradient-to-r from-white/60 via-white/20 to-transparent blur-[2px]" />
            </span>
            <span className="mx-2 text-neutral-500">=</span>
            <span className="relative inline-block">
              <span className="relative z-10">My App</span>
              <span className="-bottom-1 absolute inset-x-0 h-2 w-full bg-gradient-to-r from-white/60 via-white/20 to-transparent blur-[2px]" />
            </span>
          </div>
          <p className="mt-2 text-neutral-400 text-sm">
            Modern feedback OS for product teams.
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-neutral-300 text-sm">
          <a className="transition-colors hover:text-white" href="/docs">
            Docs
          </a>
          <a className="transition-colors hover:text-white" href="/pricing">
            Pricing
          </a>
          <a className="transition-colors hover:text-white" href="/blog">
            Blog
          </a>
          <a className="transition-colors hover:text-white" href="/careers">
            Careers
          </a>
        </nav>
      </div>
      <div className="mx-auto mt-6 max-w-7xl px-4">
        <p className="text-center text-neutral-500 text-xs">
          © {new Date().getFullYear()} My App. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function LandingShell() {
  return (
    <div className="relative min-h-screen">
      <HeroHeader />
      <Outlet />
    </div>
  );
}

export default LandingShell;
