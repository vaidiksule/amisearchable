import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing",
};

const FEATURES = [
  { name: "One-time domain check", free: true, pro: true },
  { name: "Embeddable badge", free: "Static snapshot", pro: "Auto-refreshed" },
  { name: "Per-crawler breakdown", free: true, pro: true },
  { name: "llms.txt presence check", free: true, pro: true },
  { name: "Daily re-check", free: false, pro: true },
  { name: "Email alert on change", free: false, pro: true },
  { name: "Saved domains dashboard", free: false, pro: true },
];

function Cell({ value }: { value: boolean | string }) {
  if (value === true) return <span className="text-accent">Yes</span>;
  if (value === false) return <span className="text-zinc-600">—</span>;
  return <span>{value}</span>;
}

export default function PricingPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Pricing</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Free vs Pro</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
        The badge is free. Pro is for staying correct after robots.txt changes. Polar
        checkout is stubbed for this skeleton.
      </p>

      <div className="mt-10 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface">
            <tr>
              <th className="px-4 py-3 font-medium">Feature</th>
              <th className="px-4 py-3 font-medium">Free</th>
              <th className="px-4 py-3 font-medium">Pro · $6/mo</th>
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((feature) => (
              <tr key={feature.name} className="border-t border-border">
                <td className="px-4 py-3">{feature.name}</td>
                <td className="px-4 py-3 text-muted">
                  <Cell value={feature.free} />
                </td>
                <td className="px-4 py-3 text-muted">
                  <Cell value={feature.pro} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-md border border-border px-5 text-sm hover:border-zinc-500"
        >
          Run a free check
        </Link>
        <button
          type="button"
          disabled
          className="inline-flex h-11 items-center rounded-md bg-zinc-800 px-5 text-sm text-muted"
        >
          Checkout via Polar — coming soon
        </button>
      </div>
    </div>
  );
}
