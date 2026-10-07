"use client";

import { useEffect, useRef, useState } from "react";

type Props = { src: string; poster: string; label: string };

/** Silent preview loop. Plays only while in view, never autoplays with reduced motion (poster stays). */
export function ProjectVideo({ src, poster, label }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStill(true);
      return;
    }
    // Playing needs two things: the row is on screen, and the page has finished loading and gone idle.
    // Starting the 450 kB preview during load would compete with the scripts and styles the page needs.
    let settled = false;
    let visible = false;
    const sync = () => {
      if (settled && visible) video.play().catch(() => {});
      else video.pause();
    };
    const settle = () => {
      const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 300));
      idle(
        () => {
          settled = true;
          sync();
        },
        { timeout: 2500 },
      );
    };
    if (document.readyState === "complete") settle();
    else window.addEventListener("load", settle, { once: true });

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = !!entry?.isIntersecting;
        sync();
      },
      { threshold: 0.4 },
    );
    io.observe(video);
    return () => {
      window.removeEventListener("load", settle);
      io.disconnect();
      video.pause();
    };
  }, []);

  return (
    <video
      ref={ref}
      src={still ? undefined : src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
      className="block size-full object-cover"
    />
  );
}
