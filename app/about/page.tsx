import type { Metadata } from "next";
import SecondaryPageShell from "@/components/SecondaryPageShell";

export const metadata: Metadata = {
  title: "About",
  description: "About MangystauTrails, 2Starks Administrators, privacy policy and terms of use.",
};

const values = [
  "Compact planning for real travel decisions.",
  "Respect for Mangystau landscapes, communities and sacred places.",
  "Practical information before visual noise.",
];

const privacyItems = [
  {
    title: "Data we use",
    text: "MangystauTrails may store account details, saved places, saved hotels, saved routes, offline choices and app preferences. Location is requested only after the Enable Location modal.",
  },
  {
    title: "Location",
    text: "Location is used to sort nearby hotels, attractions and routes. If permission is denied, the service continues with manual browsing and approximate distances.",
  },
  {
    title: "Storage",
    text: "Saved and offline items can be stored in browser storage on the current device. Account sessions use secure cookies where supported by the deployment environment.",
  },
  {
    title: "Contact",
    text: "Feedback and reports may include the information the user submits, including optional screenshots selected by the user.",
  },
];

const termsItems = [
  {
    title: "Travel responsibility",
    text: "MangystauTrails provides planning assistance and practical guidance. Travelers remain responsible for road conditions, weather checks, local regulations, guide selection and personal safety.",
  },
  {
    title: "Remote routes",
    text: "Remote routes should be confirmed with local experts, especially desert tracks, pilgrimage sites, off-road sections and low-signal areas.",
  },
  {
    title: "Content accuracy",
    text: "Information can change. Users should verify hotel availability, services, transport, fuel, road access and emergency contacts before departure.",
  },
  {
    title: "Acceptable use",
    text: "Users should not abuse authentication, feedback, reports or saved data features, and should respect the identity and integrity of MangystauTrails.",
  },
];

export default function AboutPage() {
  return (
    <SecondaryPageShell
      activeTab="about"
      eyebrow="About"
      title="MangystauTrails"
      description="Explore Mangystau with compact planning, practical guidance and respectful route context."
      maxWidth="6xl"
    >
      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="glass-card space-y-5 p-5 md:p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/40">Slogan</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Mangystau routes, made clear.</h2>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/40">Mission</p>
            <p className="mt-3 text-sm leading-7 text-white/68">
              MangystauTrails helps travelers discover the region with compact route planning,
              nearby services, safety context and offline-ready destination guidance.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/40">About</p>
            <p className="mt-3 text-sm leading-7 text-white/68">
              The service is built for travelers who need fast decisions: where to go, what is
              nearby, how difficult the route is, what to bring and what to save before signal drops.
            </p>
          </div>
          <div className="grid gap-2">
            {values.map((value) => (
              <div key={value} className="rounded-[18px] border border-white/10 bg-white/5 p-3 text-sm text-white/66">
                {value}
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-4">
          <section className="glass-card p-5 md:p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-white/40">History</p>
            <p className="mt-3 text-sm leading-7 text-white/68">
              In 2026, MangystauTrails was shaped as a modern travel companion for the region:
              compact like a map app, practical like a booking tool and calm enough for repeated use.
            </p>
          </section>

          <section className="glass-card p-5 md:p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-white/40">Team</p>
            <h2 className="mt-2 text-xl font-semibold text-white">2Starks Administrators</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="rounded-[18px] border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">Altair</p>
              </div>
              <div className="rounded-[18px] border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">Zhantilek</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <LegalSection title="Privacy Policy" items={privacyItems} />
        <LegalSection title="Terms of Use" items={termsItems} />
      </div>

      <footer className="rounded-[20px] border border-white/10 bg-white/5 p-5 text-sm text-white/58">
        <p>Developed and maintained by 2Starks.</p>
        <p className="mt-2">© 2026 MangystauTrails. All rights reserved.</p>
      </footer>
    </SecondaryPageShell>
  );
}

function LegalSection({ title, items }: { title: string; items: { title: string; text: string }[] }) {
  return (
    <section className="glass-card space-y-3 p-5 md:p-6">
      <p className="text-xs uppercase tracking-[0.22em] text-white/40">{title}</p>
      {items.map((item, index) => (
        <details
          key={item.title}
          open={index === 0}
          className="rounded-[18px] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/66 open:bg-white/7"
        >
          <summary className="cursor-pointer list-none font-semibold text-white">{item.title}</summary>
          <p className="mt-3">{item.text}</p>
        </details>
      ))}
    </section>
  );
}
