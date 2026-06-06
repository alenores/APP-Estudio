import { highlightMatchParts } from "@/lib/explorador-search";

type HighlightMatchProps = {
  text: string;
  query: string;
  className?: string;
};

/** Resalta en negrita las coincidencias del query dentro del texto. */
export function HighlightMatch({ text, query, className = "" }: HighlightMatchProps) {
  const parts = highlightMatchParts(text, query);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.match ? (
          <strong key={i} className="font-extrabold text-[var(--td-ink)]">
            {part.text}
          </strong>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </span>
  );
}
