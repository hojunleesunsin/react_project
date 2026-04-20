import type { HTMLAttributes, ReactNode } from "react";

type PageShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

export function PageShell({ title, description, children, className = "" }: PageShellProps) {
  return (
    <main className={`mx-auto mt-10 max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${className}`.trim()}>
      <h1 className="m-0 text-2xl font-bold">{title}</h1>
      {description ? <p className="mb-5 mt-2 text-sm text-slate-600">{description}</p> : null}
      {children}
    </main>
  );
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <section
      className={`mt-4 rounded-lg border border-slate-200 bg-white p-4 ${className}`.trim()}
      {...props}
    >
      {children}
    </section>
  );
}

export function SubtleCard({ children, className = "", ...props }: CardProps) {
  return (
    <section
      className={`mt-4 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 ${className}`.trim()}
      {...props}
    >
      {children}
    </section>
  );
}
