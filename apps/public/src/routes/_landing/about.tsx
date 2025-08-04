import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";

export const Route = createFileRoute("/_landing/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About – Better T-App" },
      {
        name: "description",
        content:
          "Learn about our mission to help teams collect feedback, prioritize with clarity, and close the loop.",
      },
    ],
  }),
});

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
      <div className="text-2xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-sm text-neutral-400">{label}</div>
    </div>
  );
}

function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(160,120,255,0.18),rgba(160,120,255,0)_70%)] p-8 md:p-10">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-3xl font-bold md:text-5xl"
          >
            About Better T-App
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mt-3 max-w-2xl text-neutral-200"
          >
            We’re building the feedback OS for modern product teams—collect,
            prioritize, and close the loop, beautifully.
          </motion.p>
        </div>

        <div className="p-6 md:p-10">
          {/* Mission / Vision / Values */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-lg font-semibold">Our Mission</h3>
              <p className="mt-2 text-sm text-neutral-300">
                Empower teams to build products customers love by turning
                feedback into focused action.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-lg font-semibold">Our Vision</h3>
              <p className="mt-2 text-sm text-neutral-300">
                A world where every product decision is transparent,
                data‑driven, and customer‑centric.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-lg font-semibold">Our Values</h3>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-neutral-300">
                <li>Clarity over complexity</li>
                <li>Respect for users and their time</li>
                <li>Craft and iteration</li>
              </ul>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <Stat label="Workspaces" value="1,200+" />
            <Stat label="Feedback items" value="85k+" />
            <Stat label="Ship cycles" value="12/week" />
            <Stat label="Uptime" value="99.9%" />
          </div>

          {/* Timeline */}
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h3 className="text-lg font-semibold">Timeline</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                <div className="text-sm text-neutral-400">2024 Q1</div>
                <div className="mt-1 font-medium">Public launch</div>
                <p className="mt-1 text-sm text-neutral-300">
                  Forums, in‑app widgets, and changelogs are available.
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                <div className="text-sm text-neutral-400">2024 Q2</div>
                <div className="mt-1 font-medium">Custom domain</div>
                <p className="mt-1 text-sm text-neutral-300">
                  Bring your own domain for a fully branded experience.
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                <div className="text-sm text-neutral-400">2024 H2</div>
                <div className="mt-1 font-medium">Integrations</div>
                <p className="mt-1 text-sm text-neutral-300">
                  Integrations with your favorite tools—coming soon.
                </p>
              </div>
            </div>
          </div>

          {/* CTA card */}
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-lg font-semibold">Join us</h3>
              <p className="mt-2 text-sm text-neutral-300">
                Help shape the future of feedback. We’re always looking for
                great people and partners.
              </p>
              <a
                href="/signup"
                className="mt-4 inline-flex items-center rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
              >
                Get started
              </a>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-lg font-semibold">Contact</h3>
              <p className="mt-2 text-sm text-neutral-300">
                Prefer a quick chat? We’ll add calendar booking soon.
              </p>
              <a
                href="/contact"
                className="mt-4 inline-flex items-center rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
              >
                Go to contact
              </a>
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
