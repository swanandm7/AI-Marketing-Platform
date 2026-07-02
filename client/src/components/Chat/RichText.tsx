/**
 * Renders markdown-like formatting from AI synthesiser responses.
 * Supports: **bold**, *italic*, `inline code`, and newline-to-paragraph.
 * Intentionally lightweight — no heavy markdown parser dependency.
 */

interface RichTextProps {
  text: string;
}

type InlineSegment =
  | { t: 'bold'; v: string }
  | { t: 'italic'; v: string }
  | { t: 'code'; v: string }
  | { t: 'plain'; v: string };

function parseInline(raw: string): InlineSegment[] {
  const segments: InlineSegment[] = [];
  // Match **bold**, *italic*, `code` — in that priority order
  const RE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = RE.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ t: 'plain', v: raw.slice(lastIndex, match.index) });
    }
    const token = match[1];
    if (token.startsWith('**')) {
      segments.push({ t: 'bold', v: token.slice(2, -2) });
    } else if (token.startsWith('*')) {
      segments.push({ t: 'italic', v: token.slice(1, -1) });
    } else {
      segments.push({ t: 'code', v: token.slice(1, -1) });
    }
    lastIndex = RE.lastIndex;
  }

  if (lastIndex < raw.length) {
    segments.push({ t: 'plain', v: raw.slice(lastIndex) });
  }
  return segments;
}

function renderSegments(segments: InlineSegment[]) {
  return segments.map((seg, i) => {
    switch (seg.t) {
      case 'bold':
        return (
          <strong key={i} className="font-semibold text-[var(--text)]">
            {seg.v}
          </strong>
        );
      case 'italic':
        return (
          <em key={i} className="italic text-[var(--text)]/80">
            {seg.v}
          </em>
        );
      case 'code':
        return (
          <code
            key={i}
            className="font-mono-brand text-[var(--mint)] bg-[var(--surface-2)] px-1.5 py-0.5 rounded text-[0.85em]"
          >
            {seg.v}
          </code>
        );
      default:
        return <span key={i}>{seg.v}</span>;
    }
  });
}

export function RichText({ text }: RichTextProps) {
  // Split into paragraphs on double newlines, or single newlines
  const paragraphs = text.split(/\n{2,}/).filter(Boolean);

  if (paragraphs.length <= 1) {
    // Single paragraph — render inline without wrapping <p>
    return <>{renderSegments(parseInline(text))}</>;
  }

  return (
    <div className="flex flex-col gap-3">
      {paragraphs.map((para, i) => (
        <p key={i} className="leading-relaxed">
          {renderSegments(parseInline(para.replace(/\n/g, ' ')))}
        </p>
      ))}
    </div>
  );
}
