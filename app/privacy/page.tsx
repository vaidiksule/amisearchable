import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How amisearchable.cc collects, uses, and stores data for AI crawler checks, accounts, badges, and monitoring.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="This policy explains what amisearchable.cc collects when you use the AI crawler checker, badge, and Pro monitoring."
      updated="September 6, 2026"
    >
      <LegalSection title="Who we are">
        <p>
          amisearchable.cc (“we”, “us”) is operated by Vaidik. The service checks publicly
          available <code className="font-mono text-foreground">robots.txt</code> and{" "}
          <code className="font-mono text-foreground">llms.txt</code> files and can show an
          embeddable badge. Contact: use the site footer or the account email you signed in
          with.
        </p>
      </LegalSection>

      <LegalSection title="What we collect">
        <p>
          <strong className="font-medium text-foreground">Anonymous checks.</strong> When
          you paste a domain, we store that hostname and the check result (crawler statuses,
          whether llms.txt was found, timestamps). Anyone can check any public domain.
        </p>
        <p>
          <strong className="font-medium text-foreground">Accounts.</strong> If you sign in
          (Google or magic link), we store your user id, email, plan status, and optional
          Polar customer id. Magic-link and Google sign-in are handled by Supabase Auth /
          Google.
        </p>
        <p>
          <strong className="font-medium text-foreground">Monitoring (Pro).</strong> We store
          which domains you monitor, check history, and send email alerts when status
          changes.
        </p>
        <p>
          <strong className="font-medium text-foreground">Payments.</strong> Card and tax
          details are processed by Polar (merchant of record). We do not store full card
          numbers.
        </p>
        <p>
          <strong className="font-medium text-foreground">Analytics.</strong> We may use
          Vercel Analytics / Speed Insights and Google Analytics to understand traffic and
          performance.
        </p>
      </LegalSection>

      <LegalSection title="How we use data">
        <p>We use this data to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Run and display crawler access reports and badges</li>
          <li>Authenticate you and manage Pro monitoring</li>
          <li>Process subscriptions and send status-change emails</li>
          <li>Improve reliability, security, and the product</li>
        </ul>
        <p>
          We do not sell personal information. Check results for public domains may appear
          on public report URLs (for example{" "}
          <code className="font-mono text-foreground">/report/example.com</code>).
        </p>
      </LegalSection>

      <LegalSection title="Third parties">
        <p>We rely on processors such as:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Supabase — auth and database</li>
          <li>Vercel — hosting</li>
          <li>Polar — payments and customer portal</li>
          <li>Resend — transactional email</li>
          <li>Google — optional Google sign-in and analytics (if enabled)</li>
        </ul>
        <p>Their privacy policies apply to data they process on our behalf.</p>
      </LegalSection>

      <LegalSection title="Cookies and sessions">
        <p>
          We use cookies / local storage for authentication sessions and theme preference.
          Analytics tools may set their own cookies if enabled.
        </p>
      </LegalSection>

      <LegalSection title="Retention">
        <p>
          Check history and account data are kept while needed to operate the service. You
          may ask us to delete your account data. Public domain check rows may remain if
          other users have also checked that domain.
        </p>
      </LegalSection>

      <LegalSection title="Your choices">
        <p>
          You can stop using the product at any time, manage billing in the Polar customer
          portal, and sign out from the dashboard. For deletion or privacy requests, contact
          us from the email on your account.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          We may update this policy. The “Last updated” date at the top will change when we
          do. Continued use after an update means you accept the revised policy.
        </p>
        <p>
          See also our{" "}
          <Link href="/terms" className="text-foreground underline underline-offset-4">
            Terms of Service
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
