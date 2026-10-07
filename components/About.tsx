import { about } from "@/content/about";

export function About() {
  return (
    <>
      <h2 className="m-0 mb-2 text-[15px] font-medium text-muted">{about.heading}</h2>
      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {about.certifications.map((c) => (
          <li key={c.issuer} className="flex flex-col py-1.5">
            <span className="font-medium">{c.issuer}</span>
            <span className="text-muted">{c.title}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
