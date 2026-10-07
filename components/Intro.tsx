import { intro } from "@/content/site";

export function Intro() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-0.5">
        <h1 className="m-0 text-[15px] font-medium">{intro.heading}</h1>
        <span className="text-muted">{intro.role}</span>
      </div>
      {intro.paragraphs.map((t) => (
        <p key={t} className="m-0 text-body">
          {t}
        </p>
      ))}
      <span className="inline-flex items-center gap-2 text-[14px] text-muted">
        <span aria-hidden="true" className="size-[7px] rounded-full bg-green" />
        {intro.status}
      </span>
    </div>
  );
}
