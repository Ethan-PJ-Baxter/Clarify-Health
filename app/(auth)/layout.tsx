import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clarify - Sign In",
  description:
    "Sign in to Clarify to track your symptoms and generate reports for your GP.",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-8">
      {/* Logo and app name */}
      <div className="mb-8 flex items-center gap-2.5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          fill="none"
          className="size-8 text-primary"
          aria-hidden="true"
        >
          <rect
            x="2"
            y="2"
            width="28"
            height="28"
            rx="6"
            className="fill-primary/10"
          />
          <path
            d="M16 8v16M8 16h16"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
        <span className="text-2xl font-semibold tracking-tight text-foreground">
          Clarify
        </span>
      </div>

      {/* Page content */}
      <div className="w-full max-w-sm">{children}</div>

      {/* Disclaimer footer */}
      <p className="mt-8 max-w-xs text-center text-xs leading-relaxed text-muted-foreground">
        Clarify is not a medical device and does not provide diagnoses.
      </p>
    </div>
  );
}
