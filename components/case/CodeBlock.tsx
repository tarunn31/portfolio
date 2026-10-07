export function CodeBlock({ text, caption, language }: { text: string; caption: string; language: string }) {
  return (
    <figure className="m-0 flex flex-col gap-2">
      {/* Focusable so keyboard users can scroll long lines. */}
      <pre
        tabIndex={0}
        aria-label={`${language} code excerpt`}
        className="m-0 overflow-x-auto rounded-xl border border-tile-border bg-tile p-4 font-mono text-[12px] leading-[1.8] text-body"
      >
        <code>{text}</code>
      </pre>
      <figcaption className="font-mono text-[12px] text-faint">{caption}</figcaption>
    </figure>
  );
}
