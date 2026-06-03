import Link from "next/link";

type FabLinkProps = {
  href: string;
  label: string;
};

export function FabLink({ href, label }: FabLinkProps) {
  return (
    <Link
      href={href}
      className="fixed bottom-6 right-4 z-20 flex h-14 items-center gap-2 rounded-full bg-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/50 transition hover:bg-indigo-500 active:scale-95"
    >
      <span className="text-lg leading-none">+</span>
      {label}
    </Link>
  );
}
