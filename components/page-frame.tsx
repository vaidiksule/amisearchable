export function PageFrame({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-3xl px-6 py-16">{children}</div>;
}
