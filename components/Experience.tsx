import { education, roles } from "@/content/experience";
import { outsideWork } from "@/content/site";

const years = "pt-[3px] font-mono text-[12px] whitespace-nowrap text-faint";

export function Experience() {
  return (
    <>
      <h2 className="m-0 mb-2 text-[15px] font-medium text-muted">Experience</h2>
      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {roles.map((r) => (
          <li key={r.company} className="flex justify-between gap-6 py-1.5">
            <span className="flex flex-col">
              <span className="font-medium">{r.company}</span>
              <span className="text-muted">{r.title}</span>
            </span>
            <span className={years}>{r.years}</span>
          </li>
        ))}
        <li className="flex justify-between gap-6 pt-4 pb-1.5">
          <span className="flex flex-col">
            <span className="font-medium">{education.school}</span>
            <span className="text-muted">{education.degree}</span>
          </span>
          <span className={years}>{education.year}</span>
        </li>
      </ul>
      <p id="outside-work" className="m-0 pt-5 text-body">
        {outsideWork}
      </p>
    </>
  );
}
