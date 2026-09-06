import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { PageFrame } from "@/components/page-frame";
import { getCurrentUser } from "@/lib/auth";
import { safeNextPath } from "@/lib/domain";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const next = safeNextPath(typeof searchParams.next === "string" ? searchParams.next : "/dashboard");
  const error = typeof searchParams.error === "string" ? searchParams.error : null;
  const user = await getCurrentUser();

  if (user) {
    redirect(next);
  }

  return (
    <PageFrame>
      <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-3 text-sm text-muted">
        Continue with Google, or get a magic link by email. No password.
      </p>
      <LoginForm next={next} error={error} />
    </PageFrame>
  );
}
