/**
 * Partición de markdown / texto para TTS lite por bloques visibles.
 */

/** Chrome Android falla con textos largos: trozos cortos en cola. */
export function splitIntoChunks(text: string, maxLen = 160): string[] {
  if (text.length <= maxLen) return [text];
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + maxLen, text.length);
    if (end < text.length) {
      const sentenceEnd = Math.max(
        text.lastIndexOf(". ", end),
        text.lastIndexOf("! ", end),
        text.lastIndexOf("? ", end),
        text.lastIndexOf("\n", end),
      );
      if (sentenceEnd > start) {
        end = sentenceEnd + 1;
      } else {
        const wordEnd = text.lastIndexOf(" ", end);
        if (wordEnd > start) end = wordEnd;
      }
    }
    const chunk = text.slice(start, end).trim();
    if (chunk) chunks.push(chunk);
    start = end;
  }
  return chunks;
}

export function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/[#*`>~_\-|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type LiteTtsContentBlock = {
  md: string;
  plain: string;
  chunks: string[];
};

/** Parte el markdown en bloques (párrafos / secciones) para marcar y scrollear. */
export function splitMarkdownIntoTtsBlocks(md: string): LiteTtsContentBlock[] {
  const fences: string[] = [];
  const protectedMd = md
    .replace(/\r\n/g, "\n")
    .replace(/```[\s\S]*?```/g, (m) => {
      const i = fences.length;
      fences.push(m);
      return `\n\n@@FENCE${i}@@\n\n`;
    });

  const parts = protectedMd
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) =>
      p.replace(/@@FENCE(\d+)@@/g, (_, n) => fences[Number(n)] ?? ""),
    );

  return parts
    .map((blockMd) => {
      const plain = stripMarkdown(blockMd);
      return {
        md: blockMd,
        plain,
        chunks: plain ? splitIntoChunks(plain) : [],
      };
    })
    .filter((b) => b.chunks.length > 0);
}
