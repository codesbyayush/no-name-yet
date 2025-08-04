import {
  LucideArrowUpRight,
  LucideBolt,
  LucideChartBar,
  LucideHome,
  LucideMessageCircle,
  LucideShieldCheck,
  LucideSparkles,
  LucideUser,
} from "lucide-react";
import { motion } from "motion/react";
import publicPortal from "../../../assets/public-portal.png";
import { FloatingNav } from "../ui/floating-navbar";
import { Spotlight } from "../ui/spotlight-new";

const LandingPage = () => {
  const navItems = [
    {
      name: "Home",
      link: "/",
      icon: <LucideHome className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "About",
      link: "/about",
      icon: <LucideUser className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "Contact",
      link: "/contact",
      icon: (
        <LucideMessageCircle className="h-4 w-4 text-neutral-500 dark:text-white" />
      ),
    },
  ];

  const features = [
    {
      icon: <LucideSparkles className="h-5 w-5 text-yellow-300" />,
      title: "Feedback forums",
      desc: "Collect, discuss, and prioritize ideas in a public or private forum.",
      cta: { label: "Explore forums", href: "/forums" },
    },
    {
      icon: <LucideBolt className="h-5 w-5 text-amber-400" />,
      title: "In‑app widgets",
      desc: "Capture contextual feedback directly inside your product experience.",
      cta: { label: "Try widget", href: "/feedback/widget" },
    },
    {
      icon: <LucideChartBar className="h-5 w-5 text-blue-300" />,
      title: "Changelogs for the loop",
      desc: "Close the loop with beautiful release notes and automated updates.",
      cta: { label: "View changelog", href: "/changelog" },
    },
    {
      icon: <LucideShieldCheck className="h-5 w-5 text-emerald-300" />,
      title: "Custom domain + Integrations",
      desc: "Host on your own domain; integrations are coming soon.",
      cta: { label: "Setup domain", href: "/settings/domain" },
    },
  ];

  const links = [
    { label: "Docs", href: "/docs" },
    { label: "Pricing", href: "/pricing" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-noise bg-zinc-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_-10%,rgba(255,255,255,0.08),rgba(255,255,255,0)_60%)]" />
      <div className="relative z-10 py-10">
        <FloatingNav navItems={navItems} />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-center py-16">
          <FloatingNav navItems={navItems} />
          <div className="px-4 py-12 md:py-28">
            <Spotlight />
            <h1 className="relative z-10 mx-auto max-w-5xl text-center font-extrabold tracking-tight">
              {"Build better with customer feedback"
                .split(" ")
                .map((word, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.08,
                      ease: "easeInOut",
                    }}
                    className="mr-2 inline-block bg-gradient-to-r from-white via-yellow-100 to-stone-200 bg-clip-text text-3xl text-transparent md:text-5xl lg:text-7xl"
                  >
                    {word}
                  </motion.span>
                ))}
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.7 }}
              className="relative z-10 mx-auto max-w-2xl py-6 text-center text-lg text-neutral-300 md:text-2xl"
            >
              Collect feedback, prioritize with clarity, and ship changelogs
              your users love.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.9 }}
              className="relative z-10 mt-4 flex flex-wrap items-center justify-center gap-4"
            >
              <a
                href="/signup"
                className="hover:-translate-y-0.5 group w-56 transform rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-center font-medium text-white transition-all duration-300 hover:bg-white/20"
              >
                Get started
                <LucideArrowUpRight className="ml-2 inline-block h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="/demo"
                className="hover:-translate-y-0.5 w-56 transform rounded-lg border border-white/15 px-6 py-3 text-center font-medium text-white transition-all duration-300"
              >
                Book a demo
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 1.1 }}
              className="relative z-10 mt-24"
            >
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                {/* Panel 1 - Large hero with gradient band and preview */}
                <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] lg:col-span-8">
                  {/* Gradient header band */}
                  <div className="relative z-10 border-white/10 border-b bg-[linear-gradient(180deg,rgba(160,120,255,0.18),rgba(160,120,255,0)_70%)] p-5 pb-10">
                    <h3 className="font-semibold text-xl">Feedback forums</h3>
                    <p className="mt-1 max-w-2xl text-neutral-300 text-sm">
                      Collect, discuss, and prioritize ideas in a public or
                      private forum.
                    </p>
                  </div>
                  {/* Preview area */}
                  <div className="relative">
                    <div className="h-[320px] overflow-hidden bg-black/30 p-0 md:h-[360px] lg:h-[400px]">
                      <img
                        src={publicPortal}
                        alt="Feedback forum preview"
                        className=" h-full w-full object-cover object-left-top"
                      />
                    </div>
                    <a
                      href="/forums"
                      className="absolute right-6 bottom-6 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur transition-colors hover:bg-white/20"
                    >
                      Read more
                      <LucideArrowUpRight className="ml-2 h-4 w-4" />
                    </a>
                  </div>
                </div>

                {/* Panel 2 - Large hero with gradient band and preview */}
                <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] lg:col-span-4">
                  {/* Gradient header band */}
                  <div className="relative z-10 border-white/10 border-b bg-[linear-gradient(180deg,rgba(60,180,150,0.18),rgba(60,180,150,0)_70%)] p-5">
                    <h3 className="font-semibold text-xl">In‑app widgets</h3>
                    <p className="mt-1 max-w-2xl text-neutral-300 text-sm">
                      Capture contextual feedback directly inside your product
                      experience.
                    </p>
                  </div>
                  {/* Preview area */}
                  <div className="relative pt-3 pl-3">
                    <div className="h-[320px] overflow-hidden bg-black/30 p-0 md:h-[360px] lg:h-[400px]">
                      <img
                        src="https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1200&auto=format&fit=crop"
                        alt="Support platform preview"
                        className=" h-full w-full object-cover object-left-top"
                      />
                    </div>
                    <a
                      href="/feedback/widget"
                      className="absolute right-6 bottom-6 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur transition-colors hover:bg-white/20"
                    >
                      Read more
                      <LucideArrowUpRight className="ml-2 h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Second row: two smaller asymmetric panels */}
              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
                {/* Small Panel 1 */}
                <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] lg:col-span-5">
                  <div className="relative z-10 border-white/10 border-b bg-[linear-gradient(180deg,rgba(120,140,255,0.15),rgba(120,140,255,0)_70%)] p-5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                        {features[2].icon}
                      </span>
                      <h3 className="font-semibold text-lg">
                        Changelogs for the loop
                      </h3>
                    </div>
                    <p className="mt-1 max-w-xl text-neutral-300 text-sm">
                      Close the loop with beautiful release notes and automated
                      updates.
                    </p>
                  </div>
                  <div className="relative p-4">
                    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/30 p-0">
                      <img
                        src="https://images.unsplash.com/photo-1550439062-609e1531270e?q=80&w=1000&auto=format&fit=crop"
                        alt="Privacy preview"
                        className="h-[220px] w-full object-cover object-left-top md:h-[260px] lg:h-[280px]"
                      />
                    </div>
                    <a
                      href={features[2].cta.href}
                      className="absolute right-5 bottom-5 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-white backdrop-blur transition-colors hover:bg-white/20"
                    >
                      View changelog
                      <LucideArrowUpRight className="ml-2 h-4 w-4" />
                    </a>
                  </div>
                </div>

                {/* Small Panel 2 */}
                <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] lg:col-span-7">
                  <div className="relative z-10 border-white/10 border-b bg-[linear-gradient(180deg,rgba(60,200,160,0.15),rgba(60,200,160,0)_70%)] p-5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                        {features[3].icon}
                      </span>
                      <h3 className="font-semibold text-lg">
                        Custom domain + Integrations
                      </h3>
                    </div>
                    <p className="mt-1 max-w-xl text-neutral-300 text-sm">
                      Host on your own domain; integrations are coming soon.
                    </p>
                  </div>
                  <div className="relative p-4">
                    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/30 p-0">
                      <img
                        src="https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1200&auto=format&fit=crop"
                        alt="Help Center preview"
                        className="h-[320px] w-full object-cover object-left-top md:h-[360px] lg:h-[420px]"
                      />
                    </div>
                    <a
                      href={features[3].cta.href}
                      className="absolute right-5 bottom-5 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-white backdrop-blur transition-colors hover:bg-white/20"
                    >
                      Setup domain
                      <LucideArrowUpRight className="ml-2 h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 1.3 }}
              className="relative z-10 mt-24 rounded-3xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_10px_50px_rgba(0,0,0,0.4)]"
            >
              <div className="w-full overflow-hidden rounded-2xl border border-white/10">
                <img
                  src="https://assets.aceternity.com/pro/aceternity-landing.webp"
                  alt="Landing page preview"
                  className="aspect-[16/9] h-auto w-full object-cover"
                  height={1000}
                  width={1000}
                />
              </div>
            </motion.div>

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
                  {links.map((l, i) => (
                    <a
                      key={i}
                      href={l.href}
                      className="transition-colors hover:text-white"
                    >
                      {l.label}
                    </a>
                  ))}
                </nav>
              </div>
              <div className="mx-auto mt-6 max-w-7xl px-4">
                <p className="text-center text-neutral-500 text-xs">
                  © {new Date().getFullYear()} My App. All rights reserved.
                </p>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
