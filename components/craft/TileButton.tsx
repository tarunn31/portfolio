import type { ButtonHTMLAttributes } from "react";

export function TileButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className="min-h-8 cursor-pointer rounded-lg border border-btn-border bg-btn px-3 text-[13px] text-text"
    />
  );
}
