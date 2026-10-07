import Link from "next/link";

/**
 * Links a citation or chunk to its section. "/#id" targets live on the home page, so they use a plain
 * anchor: the browser fires hashchange and the Work list can open the matching row.
 */
export function SourceLink({
  href,
  className,
  children,
  ...rest
}: { href: string; className?: string; children: React.ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (href.startsWith("/#")) {
    return (
      <a href={href.slice(1)} className={className} {...rest}>
        {children}
      </a>
    );
  }
  if (href.endsWith(".pdf")) {
    return (
      <a href={href} className={className} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} {...rest}>
      {children}
    </Link>
  );
}
