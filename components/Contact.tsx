import { site } from "@/content/site";

const link = "text-text underline decoration-underline underline-offset-[3px]";

export function Contact() {
  return (
    <>
      <h2 className="m-0 text-[15px] font-medium text-muted">Contact</h2>
      <p className="m-0 text-body">
        The fastest way to reach me is{" "}
        <a href={`mailto:${site.email}`} className={link}>
          email
        </a>
        . You can also find my code on{" "}
        <a href={site.github} className={link}>
          GitHub
        </a>
        , my history on{" "}
        <a href={site.linkedin} className={link}>
          LinkedIn
        </a>
        , and my resume{" "}
        <a href={site.resumePath} className={link}>
          here<span className="sr-only"> (resume, PDF)</span>
        </a>
        .
      </p>
    </>
  );
}
