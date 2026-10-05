import documents from "@/lib/provided-legal-documents.json";
export const LEGAL_DOCUMENTS = documents;
export function legalDocument(slug: string) { return LEGAL_DOCUMENTS.find(document => document.slug === slug); }
