import LegalDocument from "@/components/public/LegalDocument";
import {pageMeta} from "@/lib/seo";
import {legalDocument} from "@/lib/legal-documents";
const document=legalDocument('katilim-onami')!;
export const metadata=pageMeta({title:document.title,description:document.description,path:"/katilim-onami"});
export default function Page(){return <LegalDocument slug="katilim-onami"/>;}
