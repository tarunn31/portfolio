import type { FlowItem } from "../pipeline";
import type { ProjectLink } from "../projects";

export type Row = { label: string; text: string };
export type Card = { title: string; text: string };
export type Stat = { value: string; label: string; text: string };

export type Block =
  | { type: "prose"; title: string; text: string }
  | {
      type: "idea";
      statement: string;
      flow: FlowItem[];
      perRow?: number;
      connector?: number;
      notes: string[];
    }
  | {
      type: "rows";
      title: string;
      intro?: string;
      labelWidth?: number;
      mono?: boolean;
      rows: Row[];
      callout?: { heading: string; text: string };
      code?: { language: string; text: string; caption: string };
    }
  | { type: "cards"; title: string; intro?: string; items: Card[] }
  | { type: "callout"; title: string; heading: string; text: string }
  | { type: "stats"; title: string; intro: string; items: Stat[] }
  | { type: "list"; title: string; items: Card[] };

export type CaseStudy = {
  slug: string;
  /** Short name used in "Next: ..." links. */
  shortName: string;
  title: string;
  subtitle: string;
  meta: { label: string; value: string }[];
  links?: ProjectLink[];
  video?: { src: string; poster: string; label: string };
  blocks: Block[];
  nextSlug: string;
};
