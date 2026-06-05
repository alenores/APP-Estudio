import Link from "next/link";

type FabLinkProps = {
  href: string;
  label: string;
};

export function FabLink({ href, label }: FabLinkProps) {
  return (
    <Link
      href={href}
      className="fixed bottom-6 right-4 z-20 flex h-14 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition hover:bg-accent-hover active:scale-95"
    >
      <span className="text-lg leading-none">+</span>
      {label}
    </Link>
  );
}
