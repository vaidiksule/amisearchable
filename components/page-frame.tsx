export function PageFrame({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">{children}</div>;
}
