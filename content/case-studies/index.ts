import { copilot } from "./ai-data-copilot";
import { clinicalRag } from "./clinical-rag";
import { nita } from "./nita";
import type { CaseStudy } from "./types";

export const caseStudies: CaseStudy[] = [nita, copilot, clinicalRag];

export const getCaseStudy = (slug: string) => caseStudies.find((c) => c.slug === slug);
