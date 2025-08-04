import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_landing/contact")({
  component: ContactPage,
  head: () => ({
    meta: [{ title: "Contact – Better T-App" }],
  }),
});

function ContactPage() {
  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(160,120,255,0.18),rgba(160,120,255,0)_70%)] p-8 md:p-10">
          <h1 className="text-3xl font-bold md:text-5xl">Contact</h1>
          <p className="mt-3 max-w-2xl text-neutral-200">
            We’ll add calendar booking here soon. For now, reach out via forums
            or email — we’ll reply quickly.
          </p>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-2 md:p-10">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
            <h3 className="text-lg font-semibold">Contact options</h3>
            <ul className="mt-3 space-y-2 text-sm text-neutral-300">
              <li>
                Forums:{" "}
                <a href="/forums" className="underline">
                  Join the discussion
                </a>
              </li>
              <li>
                Email:{" "}
                <a href="mailto:hello@example.com" className="underline">
                  hello@example.com
                </a>
              </li>
            </ul>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
            <h3 className="text-lg font-semibold">Book a call</h3>
            <p className="mt-2 text-sm text-neutral-300">
              We’ll link a calendar here soon for instant slot booking.
            </p>
            <a
              href="#"
              className="mt-4 inline-flex items-center rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
            >
              Calendar coming soon
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
